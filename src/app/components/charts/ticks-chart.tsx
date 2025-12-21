"use client";
import { capitalizeFirstLetter } from "@/app/lib/util";
import { TicksData } from "@/types/TicksData";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
    data: TicksData[];
    usePoints: boolean;
}

export default function TicksChart({ data, usePoints }: Props) {
    const [yAxisDomain, setYAxisDomain] = useState<number[]>([0, 0]);
    const [yAxisTicks, setYAxisTicks] = useState<number[]>([]);

    useEffect(() => {
        if (data?.length) {
            const { domain, ticks } = calculateYAxisDomain(data);
            setYAxisDomain(domain);
            setYAxisTicks(ticks);
        }
    }, [data]);

    function formatXAxis(timestamp: number) {
        const date = new Date(timestamp);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    function calculateYAxisDomain(data: TicksData[]) {
        const ticksValues = data.map((d: TicksData) => d.ticks);
        const minTicks = 0
        const maxTicks = Math.max(...ticksValues);

        const rangeBuffer = Math.max(100, (maxTicks - minTicks) * 0.1);
        const roundedMin = 0;
        const roundedMax = Math.ceil((maxTicks + rangeBuffer) / 100) * 100;

        const range = roundedMax - roundedMin;
        const maxSteps = 5;
        let stepInterval = Math.pow(10, Math.floor(Math.log10(range / 10))); // base interval
        while (range / stepInterval > maxSteps) {
            stepInterval *= 2; // increase spacing on y-axis if too many steps
        }

        const ticks: number[] = [];
        for (let i = 0; i <= roundedMax; i += stepInterval) {
            ticks.push(i);
        }

        return { domain: [roundedMin, roundedMax], ticks };
    }

    function formatNumber(num: number): string {
        const number: number = Number(num);
        if (number >= 1000000000) {
            return (number / 1000000000).toFixed(2).replace(/\.0$/, '') + 'B';
        } else if (number >= 1000000) {
            return (number / 1000000).toFixed(2).replace(/\.0$/, '') + 'M';
        } else if (number >= 1000) {
            return (number / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return number.toString();
    }

    return (
        <div>
            <div className="h-80 w-full">
                {data?.length ? (
                    <ResponsiveContainer width={"100%"} height={"100%"}>
                        <AreaChart data={data} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id={`ticks`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor='#BFA25A' stopOpacity={0.4} />
                                    <stop offset="75%" stopColor='#BFA25A' stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="timestamp" axisLine={false} tickLine={false} minTickGap={100} tick={{ fill: "#99B2C6" }}
                                tickFormatter={formatXAxis} />
                            <YAxis type="number" tickLine={false} axisLine={false} domain={yAxisDomain}
                                tick={{ fill: "#99B2C6" }} ticks={yAxisTicks} tickFormatter={formatNumber} />
                            <CartesianGrid horizontal={true} vertical={false} stroke="#2a3b4d" />
                            <Tooltip
                                formatter={(value, name) => [`$${value}`, capitalizeFirstLetter(name as string)]}
                                cursor={{ strokeDasharray: '5 5' }}
                                labelFormatter={formatXAxis}
                                itemStyle={{ color: "white", paddingBlock: "0.25rem", paddingInline: "1rem" }}
                                contentStyle={{ background: "transparent", padding: "0" }}
                                labelStyle={{ borderBottom: "1px solid white", paddingBlock: "0.25rem", paddingInline: "1rem" }}
                            />
                            <Area type="monotone" dataKey="ticks" stroke='#BFA25A' fillOpacity={1} fill={`url(#ticks)`} animationDuration={1000} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-xl">
                        No data found
                    </div>
                )}
            </div>
        </div>
    )
}