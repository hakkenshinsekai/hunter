import { v4 as uuidv4 } from 'uuid'
import { Inspector } from "../model/Inspector";
import { hunterDb } from "../HunterDb";

export default class InspectorState {

    constructor() {
    }

    async getStatus() {
        let states = await hunterDb.inspector.toArray();
        if (states.length > 0) {
            return states[0];
        } else {
            return null;
        }
    }

    async changeState(status: string) {
        let states = await hunterDb.inspector.toArray();
        if (states.length > 0) {
            let obj = states[0];
            obj.state = status
            await hunterDb.inspector.put(obj);
            return obj;
        } else {
            const newState: Inspector = {
                id: uuidv4(),
                state: status,
                lastError: "",
                updated: new Date()
            };
            return await hunterDb.inspector.add(newState);
        }
    }
}
