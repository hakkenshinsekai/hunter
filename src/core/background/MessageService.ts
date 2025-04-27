export default class MessageService {
  events;

  construct() {}

  listener(payload: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.events[payload.type](payload.value);
        resolve(true);
      } catch (error) {
        reject(false);
      }
    });
  }

  static async sendMessage<T = any>(
    message: any,
    expectResponse = false,
    timeout = 1000
  ): Promise<T | void> {
    return new Promise((resolve, reject) => {
      try {
        if (!chrome?.runtime?.sendMessage) {
          return reject("chrome.runtime.sendMessage not available");
        }

        if (!expectResponse) {
          chrome.runtime.sendMessage(message);
          return resolve();
        }

        let isResolved = false;

        const fallback = setTimeout(() => {
          if (!isResolved) {
            resolve(undefined as T);
          }
        }, timeout);

        chrome.runtime.sendMessage(message, (response) => {
          clearTimeout(fallback);

          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            isResolved = true;
            resolve(response);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
