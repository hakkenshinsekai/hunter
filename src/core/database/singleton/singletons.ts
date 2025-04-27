import HunterLogger from "../repository/HunterLoggerRepository";
import HunterState from "../repository/HunterStateRepository";
import HuntService from "../repository/HuntRepository";
import HuntXpathService from "../repository/HuntXpathRepository";
import InspectorState from "../repository/InspectorStateRepository";

let _hunterLogger: HunterLogger | null = null;
let _huntService: HuntService | null = null;
let _huntState: HunterState | null = null;
let _huntXpathService: HuntXpathService | null = null;
let _inspectorState: InspectorState | null = null;

export function getHunterLogger(): HunterLogger {
    if (!_hunterLogger) {
        _hunterLogger = new HunterLogger();
    }
    return _hunterLogger;
}

export function getHuntService(): HuntService {
    if (!_huntService) {
        _huntService = new HuntService();
    }
    return _huntService;
}

export function getHunterState(): HunterState {
    if (!_huntState) {
        _huntState = new HunterState();
    }
    return _huntState;
}

export function getHuntXpathService(): HuntXpathService {
    if (!_huntXpathService) {
        _huntXpathService = new HuntXpathService();
    }
    return _huntXpathService;
}

export function getInspectorState(): InspectorState {
    if (!_inspectorState) {
        _inspectorState = new InspectorState();
    }
    return _inspectorState;
}
