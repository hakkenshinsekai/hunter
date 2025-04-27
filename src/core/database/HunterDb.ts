import Dexie, { Table } from "dexie";
import { Hunt } from "./model/Hunt";
import { HuntXpath } from "./model/HuntXpath";
import { HuntLog } from "./model/HuntLog";
import { State } from "./model/State";
import { Inspector } from "./model/Inspector";

export class HunterDb extends Dexie {
  hunt!: Table<Hunt, string>;
  huntXpath!: Table<HuntXpath, string>;
  huntlog!: Table<HuntLog, string>;
  state!: Table<State, string>;
  inspector!: Table<Inspector, string>;

  constructor() {
    super("HunterDb");

    this.version(1).stores({
      hunt: 'id, url, html, updated',
      huntXpath: 'id, idHunt, xpath, content, attributes, updated',
      huntlog: 'id, log, updated',
      state: 'id, state, lasteError, updated',
      inspector: 'id, state, lasteError, updated'
    });
  }
}

export const hunterDb = new HunterDb();
