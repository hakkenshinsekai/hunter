import { v4 as uuidv4 } from 'uuid'
import { HuntLog } from "../model/HuntLog";
import { hunterDb } from "../HunterDb";

export default class HunterLogger {

    constructor() {
    }

    async totalCount() {
        return await hunterDb.huntlog.count();
    }

    async paginate(offset, limit) {
        return await hunterDb.huntlog
            .orderBy('updated')
            .reverse()
            .offset(offset)
            .limit(limit)
            .toArray();
    }

    async search(term, limit) {
        const regex = new RegExp(term, "i");
        return await hunterDb.huntlog
            .orderBy('updated')
            .reverse()
            .filter((log) => regex.test(log.log))
            .limit(limit)
            .toArray();
    }

    async getLastLogs(limit = 10) {
        return await hunterDb.huntlog
          .orderBy('updated')
          .reverse()
          .limit(limit)
          .toArray();
      }
      

    async createLog(status: string) {
        const newState: HuntLog = {
            id: uuidv4(),
            log: status,
            updated: new Date()
        };
        await hunterDb.huntlog.add(newState);
        return newState;
    }

    async logClearTable() {
        try {
            await hunterDb.huntlog.clear();
            return true;
        } catch (error) {
            return false;
        }
    }
}
