import { getHunterLogger, getHunterState, getHuntService } from "../database/singleton/singletons";
import MessageService from "./MessageService";
import GenericQueue from "@/core/queue/GenericQueue";

const messageService = new MessageService();
const logService = getHunterLogger();
const huntService = getHuntService();
const hunterState = getHunterState();
const queue = new GenericQueue();

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type == "inspect") {
    let window_current = await chrome.windows.getCurrent();
    let tabs = await chrome.tabs.query({
      active: true,
      windowId: window_current.id,
    });
    if (tabs.length > 0) {
      const tab = tabs[0];
      const tabId = tab.id;

      if (tab.url?.startsWith("chrome://")) return undefined;
      if (tab.url?.startsWith("chrome-extension://")) return undefined;

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["inspector.js"],
      });
      sendResponse({ success: true });
    }
  } else if (message.type == "autohunt") {
    let window_current = await chrome.windows.getCurrent();
    let tabs = await chrome.tabs.query({
      active: true,
      windowId: window_current.id,
    });
    if (tabs.length > 0) {
      const tab = tabs[0];
      const tabId = tab.id;
      if (tab.url?.startsWith("chrome://")) return undefined;
      if (tab.url?.startsWith("chrome-extension://")) return undefined;

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["autohunt.js"],
      });
      sendResponse({ success: true });
    }
  } else if (message.type == "hunt-log") {
    await logService.createLog(message.payload);
  } else if (message.type == "autohunt-data") {
    let obj = message.payload.data ?? null;
    if (obj && message.payload.type == 'xpath') {
      queue.add(obj);
      queue.takeToCallback(300, huntService.huntAutoHuntBulkAdd.bind(huntService))
    }
  } else if (message.type == "autohunt-message") {
    let window_current = await chrome.windows.getCurrent();
    chrome.tabs.query({ active: true, windowId: window_current.id }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "autohunt-status",
        payload: message.payload,
      });
    });
  } else if (message.type == "message") {
    messageService
      .listener(message)
      .then((res) => {
        sendResponse({ status: "OK", time: Date.now(), data: res });
      })
      .catch((err) =>
        sendResponse({ status: "ERROR", time: Date.now(), data: err })
      );
    return true;
  } else if (message.type === "hunt-stop") {
    await hunterState.changeState('Stopped');
  }
});
