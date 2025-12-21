import { EquityData } from "./EquityData"

export interface EquityDataCache {
    balanced: {
        [time_frame: string]: {
            [coin: string]: EquityData[]
        }
    },
    velocity: {
        [time_frame: string]: {
            [coin: string]: EquityData[]
        }
    },
}

export const EMPTY_CACHE: EquityDataCache = {
    balanced: {},
    velocity: {},
}