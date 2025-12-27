"use client";
import { AgentMode } from "@/types/AgentMode";
import { Statistics } from "@/types/Statistics";
import { TicksApiData } from "@/types/TicksApiData";
import { TicksData } from "@/types/TicksData";
import { TicksDataCache } from "@/types/TicksDataCache";
import { Switch } from "@headlessui/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import TicksChart from "../charts/ticks-chart";
import { TEST_NQ_DATA } from "@/app/lib/test-data";

const MARGIN_PER_CONTRACT_NQ = 30000;
const GAIN_PER_TICK_NQ = 5;
const TICKS_PER_POINT_NQ = 4;
const EMPTY_CACHE: TicksDataCache = {
    balanced: {},
    velocity: {},
    statistics: {
        balanced: {},
        velocity: {},
    }
}

export default function NasdaqSection() {
    const TIMEFRAMES = ["1M", "3M", "6M", "1Y", "All Time"];
    const [timeframe, setTimeframe] = useState<string>(TIMEFRAMES[3]);
    const [agentType, setAgentType] = useState<AgentMode>('balanced');
    const [ticksData, setTicksData] = useState<TicksData[]>([]);
    const [latestPoints, setLatestPoints] = useState<number>(0);
    const [latestROI, setLatestROI] = useState<number>(0);
    const [latestAnnualizedROI, setLatestAnnualizedROI] = useState(0);
    const [statistics, setStatistics] = useState<Statistics>({
        avg_holding_time: 0,
        total_executions: 0
    });
    const [dataCache, setDataCache] = useState<TicksDataCache>(EMPTY_CACHE);
    const [afterFees, setAfterFees] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/nq-ticks?type=balanced&time_frame=${timeframe}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });
                const data = await response.json();
                //const data = TEST_NQ_DATA;

                const contracts = agentType === "velocity" ? 100 : 320;
                const formattedData: TicksData[] = formatTicksData(data.ticks, TICKS_PER_POINT_NQ, contracts, MARGIN_PER_CONTRACT_NQ, GAIN_PER_TICK_NQ);
                setTicksData(formattedData);
                setStatistics(data?.statistics || { avg_holding_time: 0, total_executions: 0 });

                const timeFrame = timeframe === "All Time" ? "alltime" : timeframe;
                const cache = { ...dataCache };
                cache.balanced[timeFrame] = formattedData;
                cache.statistics.balanced[timeFrame] = data.statistics;
                setDataCache(cache);
            } catch (error) {
                console.error('Error fetching nasdaq data:', error);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        const latestData = ticksData?.length > 0 ? ticksData[ticksData.length - 1] : null;
        const firstData = ticksData?.length > 0 ? ticksData[0] : null;

        if (latestData && firstData) {
            const latestAnnualizedRoi = (1 + latestData.roi) ** (365 * 24 * 60 * 60 * 1000 / (new Date().getTime() - firstData.timestamp)) - 1;

            if (afterFees) {
                calculateAfterFees(latestData, latestAnnualizedRoi);
            } else {
                setLatestPoints(latestData.points);
                setLatestROI(latestData.roi);
                setLatestAnnualizedROI(latestAnnualizedRoi);
            }
        }
    }, [ticksData]);

    async function refetchData(time_frame: string, agent_mode: AgentMode) {
        try {
            setTimeframe(time_frame);
            setAgentType(agent_mode);
            const timeFrame = time_frame === "All Time" ? "alltime" : time_frame;

            if (dataCache[agent_mode][timeFrame]) {
                setTicksData(dataCache[agent_mode][timeFrame]);
                setStatistics(dataCache.statistics[agent_mode][timeFrame]);
                return;
            }

            const response = await fetch(`/api/nq-ticks?time_frame=${timeFrame}&type=${agent_mode}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const data = await response.json();
            const contracts = agent_mode === "velocity" ? 100 : 320;
            const formattedBalancedData: TicksData[] = formatTicksData(data.ticks, TICKS_PER_POINT_NQ, contracts, MARGIN_PER_CONTRACT_NQ, GAIN_PER_TICK_NQ);
            setTicksData(formattedBalancedData);

            setStatistics(data.statistics);
            const cache = { ...dataCache };
            cache[agent_mode][timeFrame] = formattedBalancedData;
            cache.statistics[agent_mode][timeFrame] = data.statistics;
            setDataCache(cache);
        } catch (error) {
            console.log(error);
        }
    }

    function formatTicksData(
        data: TicksApiData[],
        ticksPerPoint: number = 1,
        contracts: number = 100,
        marginPerContract: number,
        gainPerTick: number = 10
    ): TicksData[] {
        if (!data || data.length === 0) {
            return [];
        }

        // Sort data by timestamp
        const sortedData = data.sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        // Group and sum ticks by day, maintaining running total
        const dailyTotals: Record<string, { ticks: number; points: number; displayDate: string; roi: number; timestamp: number }> = {};
        let runningTotal = 0;
        sortedData.forEach(item => {
            // Create date object and format in EST
            const date = new Date(item.timestamp);
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/New_York',
                month: 'short',
                day: 'numeric'
            });
            const dayKey = date.toISOString().split('T')[0];
            runningTotal += item.ticks;
            dailyTotals[dayKey] = {
                ticks: runningTotal, // Apply scaling factor
                points: runningTotal / ticksPerPoint,
                displayDate: formatter.format(date),
                roi: runningTotal * gainPerTick / contracts / marginPerContract,
                timestamp: date.getTime()
            };
        });

        // Convert to array and format for chart
        return Object.values(dailyTotals).map(value => ({
            date: value.displayDate,
            ticks: value.ticks,
            points: value.points,
            roi: value.roi,
            timestamp: value.timestamp
        }));
    };

    function toggleFees(value: boolean) {
        setAfterFees(value);

        const latestData = ticksData?.length > 0 ? ticksData[ticksData.length - 1] : null;
        const firstData = ticksData?.length > 0 ? ticksData[0] : null;
        if (!latestData || !firstData) return;

        const latestAnnualizedRoi = (1 + latestData.roi) ** (365 * 24 * 60 * 60 * 1000 / (new Date().getTime() - firstData.timestamp)) - 1;
        if (value) {
            calculateAfterFees(latestData, latestAnnualizedRoi);
        } else {
            setLatestPoints(latestData.points);
            setLatestROI(latestData.roi);
            setLatestAnnualizedROI(latestAnnualizedRoi);
        }
    }

    function calculateAfterFees(latestData: TicksData, latestAnnualizedRoi: number) {
        const startDate = new Date("2025-05-02");
        const endMonth = new Date();
        const timeFrameToMonths = {
            "1M": 1,
            "3M": 3,
            "6M": 6,
            "1Y": 12,
            "All Time": (endMonth.getFullYear() - startDate.getFullYear()) * 12 + (endMonth.getMonth() - startDate.getMonth())
        };

        const feeUnderFortyPerc = 0.25;
        const feeAboveFortyPerc = 0.4;
        let pointsAfterPerfFee = latestData.points;
        let roiAfterPerfFee = latestData.roi;
        let annualizedAfterPerfFee = latestAnnualizedRoi;
        if (latestData.roi <= 0.4) {
            pointsAfterPerfFee = latestData.points * (1 - feeUnderFortyPerc);
            roiAfterPerfFee = latestData.roi * (1 - feeUnderFortyPerc);
            annualizedAfterPerfFee = latestAnnualizedRoi * (1 - feeUnderFortyPerc);
        } else {
            pointsAfterPerfFee = (0.4 * (1 - feeUnderFortyPerc)) + ((latestData.points - 0.4) * (1 - feeAboveFortyPerc));
            roiAfterPerfFee = (0.4 * (1 - feeUnderFortyPerc)) + ((latestData.roi - 0.4) * (1 - feeAboveFortyPerc));
            annualizedAfterPerfFee = (0.4 * (1 - feeUnderFortyPerc)) + ((latestAnnualizedRoi - 0.4) * (1 - feeAboveFortyPerc));
        }

        const adjustedTwoPercentFee = Number(((0.02 / 12) * timeFrameToMonths[timeframe as keyof typeof timeFrameToMonths]).toFixed(2));
        const pointsAfterFees = Number((pointsAfterPerfFee * (1 - adjustedTwoPercentFee)).toFixed(2));
        const roiAfterFees = Number((roiAfterPerfFee * (1 - adjustedTwoPercentFee)).toFixed(2));
        const latestAnnualizedAfterFees = Number((annualizedAfterPerfFee * (1 - adjustedTwoPercentFee)).toFixed(2));

        setLatestPoints(pointsAfterFees);
        setLatestROI(roiAfterFees);
        setLatestAnnualizedROI(latestAnnualizedAfterFees);
    }

    return (
        <div className="bg-(--primary) text-white py-20">
            <div className="flex flex-col items-center w-[90%] xl:w-3/5 mx-auto text-center mb-8">
                <h1 className="uppercase text-7xl font-semibold mb-4 text-(--gold)">
                    NASDAQ
                </h1>

                <h2 className="uppercase text-3xl font-semibold mb-4 text-(--gold)">
                    SIMULATED PERFORMANCE - REAL TIME FORWARD TEST
                </h2>

                <p className="text-lg">
                    SIMULATED PERFORMANCE RESULTS HAVE CERTAIN INHERENT LIMITATIONS.
                    Although these results were generated using real-time market data
                    and live execution logic, the trades were not executed in a live, funded account.
                    No actual money was at risk. Therefore, the results may have under- or over-compensated for the impact,
                    if any, of certain market factors such as liquidity, order rejection, or partial fills.
                    No representation is being made that any account will or is likely to achieve profits or losses similar to those shown.
                </p>
            </div>

            <div className="flex flex-col items-center mb-2 w-[90%] mx-auto">
                <h2 className="uppercase font-semibold text-2xl mb-4 text-(--gold)">
                    Assumptions Box
                </h2>

                <ul className="flex flex-col gap-1 sm:w-2/3 lg:w-1/2 xl:w-1/3 mb-4 text-xl">
                    <li className="flex items-center justify-between gap-2">
                        <span>Starting balance:</span>
                        <span className="text-end">${agentType === "velocity" ? "3,000,000" : "9,600,000"}</span>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                        <span>Position size:</span>
                        <span className="text-end">Max holding {agentType === "velocity" ? "100" : "320"} NQ_F contracts</span>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                        <span>Commissions:</span>
                        <span className="text-end">$2.50 round-turn per contract</span>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                        <span>Slippage:</span>
                        <span className="text-end">0.25 tick average (modeled)</span>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                        <span>Leverage:</span>
                        <span className="text-end">$30,000 margin/NQ contract</span>
                    </li>
                </ul>
                <p className="mb-5 text-lg font-semibold text-center">
                    Actual results in the 4.7-exempt pool will differ due to execution, liquidity, and fee structure.
                </p>
            </div>

            <div className="gap-4 w-full">
                <div className="w-full mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 w-[90%] mx-auto">
                        <div className="bg-white/5 rounded-lg metal-border ring-0 p-4 border border-(--gold)">
                            <h3 className="font-medium text-xl">Total Points</h3>
                            <span className="text-xl">{latestPoints}</span>
                        </div>

                        <div className="bg-white/5 rounded-lg metal-border ring-0 p-4 border border-(--gold)">
                            <h3 className="font-medium text-xl">Total ROI</h3>
                            <span className="text-xl">{(latestROI * 100).toFixed(2)}% ({(latestAnnualizedROI * 100).toFixed(2)}% Annualized)</span>
                        </div>

                        <div className="bg-white/5 rounded-lg metal-border ring-0 p-4 border border-(--gold)">
                            <h3 className="font-medium text-xl">Avg Holding Time</h3>
                            <span className="text-xl">{statistics?.avg_holding_time.toFixed(0) || 0} min</span>
                        </div>
                    </div>

                    <div className='flex flex-col xl:flex-row justify-between items-center gap-4 lg:gap-2 mt-4 mb-2 w-[90%] mx-auto'>
                        <div className="flex items-center flex-col lg:flex-row gap-4 xl:gap-8">
                            <div className="hidden items-center border border-(--gold) rounded-lg text-lg">
                                <div className="p-1 border-r border-(--gold) min-w-25 cursor-pointer">
                                    <div className={`hover:text-white rounded-md px-2 py-0.5
                                    ${agentType === "velocity" ? "bg-white/10" : "text-gray-400"}`}
                                        onClick={() => refetchData(timeframe, "velocity")}>
                                        Velocity
                                    </div>
                                </div>

                                <div className="p-1 min-w-25 cursor-pointer">
                                    <div className={`hover:text-white rounded-md px-2 py-0.5
                                    ${agentType === "balanced" ? "bg-white/10" : "text-gray-400"}`}
                                        onClick={() => refetchData(timeframe, "balanced")}>
                                        Balanced
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-lg">
                                <span>
                                    No fees
                                </span>

                                <Switch checked={afterFees} onChange={() => toggleFees(!afterFees)}
                                    className={`group inline-flex h-7 w-12.5 items-center transition outline-none border border-(--gold)
                                    rounded-full p-0 ${afterFees ? "bg-white/10" : "bg-white/5"}`}>
                                    <span className="translate-x-0.5 rounded-full bg-metal-circle transition size-5.5
                                    group-data-checked:translate-x-6 border border-(--primary) bg-white" />
                                </Switch>

                                <div className="flex items-center gap-2">
                                    <span>
                                        With Fees
                                    </span>

                                    <InformationCircleIcon className="size-5 cursor-pointer fees-tooltip" />
                                    <Tooltip
                                        place="bottom"
                                        anchorSelect=".fees-tooltip"
                                        style={{ backgroundColor: "rgba(0, 0, 0, 1)", fontSize: "1.125rem", zIndex: 50, maxWidth: "350px" }}
                                    >
                                        <span className="tracking-wide">
                                            2% management fee + 25% performance fee on returns up to 40% and 40% performance fee on returns above 40%
                                        </span>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg p-0">
                            <ul className="inline-flex items-center text-sm sm:text-base lg:text-lg border border-(--gold) rounded-lg">
                                {TIMEFRAMES.map((tf: string, index: number) => (
                                    <li key={index} className={`hover:text-white cursor-pointer px-2 py-1.5 border-r border-(--gold)
                                    last:border-r-0 w-17.5 sm:w-20 lg:w-24 text-center
                                    ${timeframe === tf ? "text-white bg-white/10" : "text-[#979393]"}`}
                                        onClick={() => refetchData(tf, agentType)}>
                                        {tf}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="w-[96%] sm:w-[90%] mx-auto">
                        <TicksChart data={ticksData} usePoints={true} loading={loading} />
                    </div>
                </div>
            </div>
        </div>
    )
}