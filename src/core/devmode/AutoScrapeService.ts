(function () {
  if (window.__autohuntinit) {
    return true;
  }
  window.__autohuntinit = true;

  chrome.runtime.sendMessage({
    type: "hunt-log",
    payload: `[Hunt] Injected on ${window.location.href}`,
  });

  class AutoHuntInstance {
    enabled = false;

    async enable() {
      chrome.runtime.sendMessage({
        type: "hunt-log",
        payload: "[Hunt] Auto Hunt - running",
      });

      if (this.enabled) return;

      this.enabled = true;

      chrome.runtime.sendMessage({
        type: "hunt-log",
        payload: "[Hunt] Auto Hunt - enabled",
      });

      const url = window.location.href;
      const htmlCompleto = document.documentElement.outerHTML;
      chrome.runtime.sendMessage({
        type: "hunt-log",
        payload: `[Hunt] Saving ${url} HTML`,
      });
      chrome.runtime.sendMessage({
        type: "autohunt-data",
        payload: { type: "html", data: { html: htmlCompleto, url: url } },
      });

      const elements = document.getElementsByTagName("*");

      for (const el of elements) {
        if (this.canDisable()) {
          break;
        }

        let attributesMap = el.attributes ? this.getAttributesMap(el) : null;
        let attributes = "";
        const innerHtml = el.innerHTML;
        const innerText = el.innerText;
        const outerHTML = el.outerHTML;
        let outerText = null;
        try {
          outerText = el.outerText;
        } catch (_) {}

        if(attributesMap) {
          const obj = Object.fromEntries(attributesMap);
          attributes = JSON.stringify(obj);
        }

        const xpath = this.getXPath(el);

        chrome.runtime.sendMessage({
          type: "hunt-log",
          payload: `[Hunt] Scraping element ${xpath} from ${url}`,
        });
        chrome.runtime.sendMessage({
          type: "autohunt-data",
          payload: {
            type: "xpath",
            data: {
              url,
              xpath,
              attributes, 
              content: [innerText || '', outerText || ''].join(' '),
              innerHtml,
              outerHTML,
            },
          },
        });

        await new Promise((resolve) => setTimeout(resolve, 1));
      }
      chrome.runtime.sendMessage({
        type: "hunt-log",
        payload: `[Hunt] Scrape done for ${url}`,
      });
      chrome.runtime.sendMessage({
        type: "hunt-stop",
        payload: true,
      });
    }

    disable() {
      if (!this.enabled) return;

      this.enabled = false;
      chrome.runtime.sendMessage({
        type: "hunt-log",
        payload: "[Hunt] Auto Hunt - disabled",
      });
    }

    canDisable() {
      if (!this.enabled) {
        chrome.runtime.sendMessage({
          type: "hunt-log",
          payload: "[Hunt] Auto Hunt - stopped",
        });
        return true;
      }
      return false;
    }

    getXPath(el) {
      if (el.id && (this.allAreLikelyWords(el.id) || this.isNumber(el.id))) {
        return `//*[@id="${el.id}"]`;
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

        for (let [attr, value] of attributes.entries()) {
          const modifier = "@" + attr;
          if (this.allAreLikelyWords(value) && !this.isURL(value)) {
            let words = value
              .split(/\s+/)
              .map(
                (str) =>
                  `contains(translate(${modifier}, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),  '${str.trim().replace(/\s+/g, " ")}')`
              );
            xpath_modifiers.unshift(`(${words.join(" or ")})`);
          } else if (this.isNumber(value) || this.isBoolean(value)) {
            xpath_modifiers.unshift(`${modifier}='${value}'`);
          } else if (this.isURL(value)) {
            const domain = this.extractDomain(value);
            xpath_modifiers.unshift(`contains(${modifier},'${domain}')`);
          }
        }

        const modifierStr =
          xpath_modifiers.length > 0
            ? `[${xpath_modifiers.join(" and ")}]`
            : `[${index}]`;

        parts.unshift(`${el.tagName.toLowerCase()}${modifierStr}`);
        el = el.parentElement;
      }

      return "//" + parts.join("/");
    }

    allAreLikelyWords(input) {
      return input.split(/\s+/).every((str) => {
        const semanticPattern = /^(?=.{1,46}$)[a-z]+(-[a-z]+)*$/i;
        const weirdConsonantCluster = /[^aeiou\s-]{4,}/i;
        const hasWeirdMix = /[a-z]+\d+[a-z]+/i;
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
        const regex = /^(?:(?!http|https|www)[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+|<[^>]+>)/;
        return regex.test(str)
      } catch (_) {
        return false;
      }
    }

    extractDomain(str) {
      try {
        const url = new URL(str.startsWith("http") ? str : "http://" + str);
        return url.hostname;
      } catch (_) {
        return null;
      }
    }

    getAttributesMap(element) {
      const result = new Map();
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        result.set(attr.name, attr.value);
      }
      return result;
    }
  }

  if (!window.__autohuntinstance) {
    window.__autohuntinstance = new AutoHuntInstance();
    chrome.runtime.onMessage.addListener((message, sender, response) => {
      if (message.type === "autohunt-status") {
        if (message.payload) {
          window.__autohuntinstance.enable();
        } else {
          window.__autohuntinstance.disable();
        }
        response({ success: true });
      }
    });
  }
})();
