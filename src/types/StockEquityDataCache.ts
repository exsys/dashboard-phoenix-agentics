import { StockEquityData } from "./StockEquityData"

export interface StockEquityDataCache {
    [time_frame: string]: StockEquityData[]
}

export const EMPTY_CACHE: StockEquityDataCache = {}