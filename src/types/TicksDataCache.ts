import { TicksData } from "./TicksData";
import { Statistics } from "./Statistics";

export interface TicksDataCache {
    balanced: {
        [time_frame: string]: TicksData[],
    },
    velocity: {
        [time_frame: string]: TicksData[],
    },
    statistics: {
        velocity: {
            [timeFrame: string]: Statistics;
        };
        balanced: {
            [timeFrame: string]: Statistics;
        };
    };
}