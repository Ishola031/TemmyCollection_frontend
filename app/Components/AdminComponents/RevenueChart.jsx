"use client";

import React, { useMemo, useState } from "react";
import { FiArrowUpRight, FiBarChart2 } from "react-icons/fi";

export default function RevenueChart({ revenueData = [] }) {
const [activeIndex, setActiveIndex] = useState(null);


const data = useMemo(() => {
    if (!Array.isArray(revenueData)) return [];

    return revenueData.map((item, index) => ({
        label: String(item.month ?? item.label ?? `Month ${index + 1}`),
        value: Math.max(0, Number(item.revenue ?? item.value) || 0),
    }));
}, [revenueData]);

const totalRevenue = useMemo(
    () => data.reduce((total, item) => total + item.value, 0),
    [data]
);

const maxValue = useMemo(
    () => Math.max(...data.map((item) => item.value), 0),
    [data]
);

const averageRevenue = data.length ? totalRevenue / data.length : 0;

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(value || 0);

const formatCompactCurrency = (value) => {
    const amount = Number(value) || 0;

    if (amount >= 1_000_000) {
        return `₦${(amount / 1_000_000).toFixed(1)}M`;
    }

    if (amount >= 1_000) {
        return `₦${(amount / 1_000).toFixed(0)}K`;
    }

    return `₦${amount.toLocaleString("en-NG")}`;
};

const axisValues = useMemo(() => {
    if (maxValue <= 0) return [0, 0, 0, 0, 0];

    return [
        maxValue,
        maxValue * 0.75,
        maxValue * 0.5,
        maxValue * 0.25,
        0,
    ];
}, [maxValue]);

if (!data.length) {
    return (
        <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
            <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Revenue overview</p>
                <FiBarChart2 className="text-gray-400" size={16} />
            </div>

            <h3 className="mt-3 text-2xl font-bold">₦0</h3>

            <div className="flex h-64 flex-col items-center justify-center text-center">
                <FiBarChart2 size={28} className="text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-500">
                    No revenue data available
                </p>
                <p className="mt-1 text-xs text-gray-400">
                    Try selecting another period.
                </p>
            </div>
        </section>
    );
}

return (
    <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 sm:p-7">
        {/* HEADER */}
        <div className="mb-7 flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">
                        Revenue overview
                    </p>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <FiArrowUpRight size={13} />
                    </span>
                </div>

                <h3 className="mt-2 break-words text-xl font-bold tracking-tight sm:text-2xl">
                    {formatCurrency(totalRevenue)}
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                    Revenue for the selected period
                </p>
            </div>

            <div className="hidden shrink-0 text-right sm:block">
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                    Average
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-700">
                    {formatCurrency(averageRevenue)}
                </p>
            </div>
        </div>

        {/* CHART */}
        <div className="w-full min-w-0">
            <div className="flex w-full min-w-0">
                {/* Y AXIS */}
                <div className="flex h-64 w-[52px] shrink-0 flex-col justify-between pb-1 pr-2 text-right text-[9px] text-gray-400 sm:w-[68px] sm:text-[10px]">
                    {axisValues.map((value, index) => (
                        <span key={index} className="whitespace-nowrap">
                            {formatCompactCurrency(value)}
                        </span>
                    ))}
                </div>

                {/* PLOT AREA */}
                <div className="relative h-64 min-w-0 flex-1">
                    {/* GRID */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                        {axisValues.map((_, index) => (
                            <div
                                key={index}
                                className="border-t border-dashed border-gray-200"
                            />
                        ))}
                    </div>

                    {/* BARS */}
                    <div className="absolute inset-0 flex items-end gap-1 px-1 sm:gap-2 sm:px-2">
                        {data.map((item, index) => {
                            const percentage =
                                maxValue > 0
                                    ? (item.value / maxValue) * 100
                                    : 0;

                            const isActive = activeIndex === index;

                            return (
                                <div
                                    key={`${item.label}-${index}`}
                                    className="group relative flex h-full min-w-0 flex-1 items-end justify-center"
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                    onFocus={() => setActiveIndex(index)}
                                    onBlur={() => setActiveIndex(null)}
                                    tabIndex={0}
                                    aria-label={`${item.label}: ${formatCurrency(item.value)}`}
                                >
                                    {/* TOOLTIP */}
                                    <div
                                        className={`pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-950 px-2 py-1.5 text-[10px] font-medium text-white shadow-lg transition-opacity ${
                                            isActive
                                                ? "opacity-100"
                                                : "opacity-0"
                                        }`}
                                    >
                                        <span className="block">
                                            {item.label}
                                        </span>
                                        {formatCurrency(item.value)}
                                    </div>

                                    {/* BAR */}
                                    <div
                                        className={`relative w-full max-w-10 rounded-t-md transition-colors duration-200 sm:max-w-12 ${
                                            isActive
                                                ? "bg-indigo-600"
                                                : "bg-gray-900"
                                        }`}
                                        style={{
                                            height:
                                                item.value > 0
                                                    ? `${Math.max(percentage, 1.5)}%`
                                                    : "0%",
                                        }}
                                    >
                                        <div
                                            className={`absolute inset-x-0 top-0 h-1 rounded-t-md bg-white/20 ${
                                                isActive
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            }`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* X AXIS — SHOW EVERY MONTH */}
            <div className="mt-3 flex w-full min-w-0">
                <div className="w-[52px] shrink-0 sm:w-[68px]" />

                <div className="grid min-w-0 flex-1 grid-flow-col auto-cols-fr gap-0">
                    {data.map((item, index) => (
                        <div
                            key={`${item.label}-axis-${index}`}
                            className="min-w-0 overflow-visible text-center"
                            title={item.label}
                        >
                            <span className="block whitespace-nowrap text-[9px] leading-4 text-gray-500 sm:text-[10px]">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* MOBILE SUMMARY */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5 sm:hidden">
            <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">
                    Total revenue
                </p>
                <p className="mt-1 break-words text-sm font-semibold">
                    {formatCurrency(totalRevenue)}
                </p>
            </div>

            <div className="min-w-0 text-right">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">
                    Average revenue
                </p>
                <p className="mt-1 break-words text-sm font-semibold">
                    {formatCurrency(averageRevenue)}
                </p>
            </div>
        </div>
    </section>
);

}