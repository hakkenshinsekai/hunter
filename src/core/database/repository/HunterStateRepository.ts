import { State } from "../model/State";
import { v4 as uuidv4 } from 'uuid'
import { hunterDb } from "../HunterDb";

export default class HunterState {

    constructor() {
    }

    async getStatus() {
        let states = await hunterDb.state.toArray();
        if (states.length > 0) {
            return states[0];
        } else {
            return null;
        }
    }

    async changeState(status: string) {
        let states = await hunterDb.state.toArray();
        if (states.length > 0) {
            let obj = states[0];
            obj.state = status
            await hunterDb.state.put(obj);
            return obj;
        } else {
            const newState: State = {
                id: uuidv4(),
                state: status,
                lastError: "",
                updated: new Date()
            };
            return await hunterDb.state.add(newState);
        }
    }
}
