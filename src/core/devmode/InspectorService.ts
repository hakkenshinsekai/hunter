(function () {
  if (window.__inspectinstance) {
    if (!window.__inspectinstance.enabled) {
      window.__inspectinstance.enable({ outerHTML: "" });
    } else if (window.__inspectinstance.enabled) {
      window.__inspectinstance.disable();
      window.__inspectinstance.enabled = false;
    }
    return;
  }

  chrome.runtime.sendMessage({ type: 'hunt-log', payload: "[Inspector] Injected!" });

  class InspectorService {
    overlay = null;
    toast = null;
    lastTarget = null;
    activator = null;
    enabled = false;
    cbState = null;
    mouseMoveHandler;
    clickHandler;

    constructor() {
      this.mouseMoveHandler = this.handleMouseMove.bind(this);
      this.clickHandler = this.handleClick.bind(this);
    }

    enable(e) {
      if (this.enabled) return;

      this.enabled = true;
      this.activator = e;

      this.overlay = document.createElement("div");
      Object.assign(this.overlay.style, {
        position: "absolute",
        pointerEvents: "none",
        border: "2px dashed red",
        backgroundColor: "rgba(255, 0, 0, 0.1)",
        zIndex: "999999",
      });
      document.body.appendChild(this.overlay);

      this.toast = document.createElement("div");
      this.toast.textContent = "Element copied!";
      Object.assign(this.toast.style, {
        position: "fixed",
        top: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#333",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "6px",
        zIndex: "1000000",
        display: "none",
        fontFamily: "sans-serif",
      });
      document.body.appendChild(this.toast);

      document.addEventListener("mousemove", this.mouseMoveHandler);
      document.addEventListener("click", this.clickHandler, true);
    }

    disable() {
      if (!this.enabled) return;

      this.enabled = false;
      document.removeEventListener("mousemove", this.mouseMoveHandler);
      document.removeEventListener("click", this.clickHandler, true);

      this.overlay?.remove();
      this.toast?.remove();
      this.overlay = null;
      this.toast = null;
      this.lastTarget = null;

      if (this.cbState) {
        this.cbState(false);
      }
    }

    callbackState(cb) {
      this.cbState = cb;
    }

    handleMouseMove(e) {
      const target = e.target;
      if (!target || target === this.overlay) return;

      this.lastTarget = target;
      const rect = target.getBoundingClientRect();

      if (this.overlay) {
        Object.assign(this.overlay.style, {
          display: "block",
          top: `${window.scrollY + rect.top}px`,
          left: `${window.scrollX + rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
        });
      }
    }

    handleClick(e) {
      if (!this.lastTarget || !this.enabled) return;

      const inputHtml = this.lastTarget.innerHTML.match(/<input[^>]*>/)?.[0];
      if (this.activator.outerHTML === inputHtml) {
        this.disable();
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const xpath = this.getXPath(this.lastTarget);
      navigator.clipboard.writeText(xpath).catch(console.warn);
      chrome.runtime.sendMessage({
        type: "hunt-log",
        payload: `[Inspector] Xpath generated ${xpath}`,
      });

      this.showToast();
    }

    getXPath(el) {
      try {
        if (el.id) {
          if (this.allAreLikelyWords(el.id) || this.isNumber(el.id)) {
            return `//*[@id="${el.id}"]`;
          }
        }

        const parts = [];
        while (el && el.nodeType === 1 && el !== document.body) {
          let index = 1;
          let sibling = el.previousElementSibling;
          while (sibling) {
            if (sibling.tagName === el.tagName) index++;
            sibling = sibling.previousElementSibling;
          }

          let attributes = this.getAttributesMap(el);
          let xpath_modifiers = [];
          let element_xpath_modifier = null;
          for (let attrib of attributes) {
            let attr = attrib.attr;
            let value = attrib.value;
            if (value.includes("%")) {
              try {
                value = decodeURIComponent(value);
              } catch (e) {}
            }
            const modifier = "@" + attr;
            if (this.allAreLikelyWords(value) && !this.isURL(value)) {
              let words = value.split(/\s+/);
              if (words.length > 1) {
                words = words.map((str) => `contains(${modifier}, '${str}')`);
                value = "(" + words.join(" or ") + ")";
                xpath_modifiers.unshift(value);
              } else {
                xpath_modifiers.unshift(`contains(${modifier},'${value}')`);
              }
            } else if (this.isNumber(value) || this.isBoolean(value)) {
              xpath_modifiers.unshift(`${modifier}='${value}'`);
            } else if (this.isURL(value)) {
              let domain = this.extractDomain(value);
              xpath_modifiers.unshift(`contains(${modifier},'${domain}')`);
            } else if (this.allAreLikelyWords(value)) {
              let words = value.split(/\s+/);
              if (words.length > 1) {
                words = words.map((str) => `contains(${modifier}, '${str}')`);
                value = "(" + words.join(" or ") + ")";
                xpath_modifiers.unshift(value);
              } else {
                xpath_modifiers.unshift(`contains(${modifier},'${value}')`);
              }
            }
          }

          if (xpath_modifiers.length > 0) {
            element_xpath_modifier = xpath_modifiers.join(" and ");
          }

          if (element_xpath_modifier) {
            parts.unshift(
              `${el.tagName.toLowerCase()}[${element_xpath_modifier}]`
            );
          } else {
            parts.unshift(`${el.tagName.toLowerCase()}[${index}]`);
          }

          el = el.parentElement;
        }
        let xpath = "//" + parts.join("/");
        if (xpath.includes("%")) {
          try {
            xpath = decodeURIComponent(xpath);
          } catch (e) {}
        }
        return xpath;
      } catch (error) {
        console.log(error);
      }
    }

    allAreLikelyWords(input) {
      return input.split(/\s+/).every((str) => {
        const semanticPattern = /^[a-zA-Z\-]+(-[a-zA-Z\-]+)*$/i;
        const weirdConsonantCluster = /[^aeiou\s-]{4,}/i;
        const hasWeirdMix = /[a-zA-Z\-]+\d+[a-zA-Z\-]+/i;

        return (
          semanticPattern.test(str) &&
          !weirdConsonantCluster.test(str) &&
          !hasWeirdMix.test(str)
        );
      });
    }

    isBoolean(str) {
      return /^(true|false)$/i.test(str.trim());
    }

    isNumber(str) {
      return /^-?\d+(\.\d+)?$/.test(str.trim());
    }

    isURL(str) {
      try {
        if (this.isURLComprehensive(str)) {
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    }

    isURLComprehensive(str) {
      if (typeof str !== "string") return false;

      str = str.trim();

      const urlPattern =
        /^(?:(?:https?:\/\/)?(?:www\.)?)?([a-z0-9\-]+\.)+[a-z]{2,}(?::\d{1,5})?(?:[/?#][^\s]*)?$/i;

      return urlPattern.test(str);
    }

    extractDomain(str) {
      try {
        const url = new URL(str.startsWith("http") ? str : "http://" + str);
        return url.hostname;
      } catch (e) {
        return null;
      }
    }

    getAttributesMap(element) {
      const attrs = element.attributes;
      const result = [];

      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        result[attr.name] = attr.value;
        result.push({ attr: attr.name, value: attr.value });
      }

      return result;
    }

    showToast() {
      if (!this.toast) return;
      this.toast.style.display = "block";
      setTimeout(() => {
        if (this.toast) {
          this.toast.style.display = "none";
        }
      }, 1500);
    }
  }

  const instance = new InspectorService();
  instance.enable({ outerHTML: "" });
  window.__inspectinstance = instance;
})();
