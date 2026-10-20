"use client";

import React from "react";
import { FiMoreHorizontal, FiPackage } from "react-icons/fi";

export default function OrderStatus({
    orderStatus = {},
    total_orders,
}) {
    const statusData = [
        {
            label: "Delivered",
            count: Number(orderStatus?.delivered) || 0,
            color: "#111827",
        },
        {
            label: "Collected",
            count: Number(orderStatus?.collected) || 0,
            color: "#374151",
        },
        {
            label: "Processing",
            count: Number(orderStatus?.processing) || 0,
            color: "#9ca3af",
        },
        {
            label: "Shipped",
            count: Number(orderStatus?.shipped) || 0,
            color: "#60a5fa",
        },
        {
            label: "Pending",
            count: Number(orderStatus?.pending) || 0,
            color: "#e5e7eb",
        },
        {
            label: "Cancelled",
            count: Number(orderStatus?.cancelled) || 0,
            color: "#fca5a5",
        },
    ];

    // Derive the total from the status counts to keep percentages consistent.
    const totalFromStatuses = statusData.reduce(
        (sum, status) => sum + status.count,
        0
    );

    const total =
        total_orders !== undefined && total_orders !== null
            ? Number(total_orders) || 0
            : totalFromStatuses;

    const getPercentage = (count) =>
        total > 0 ? Math.round((count / total) * 100) : 0;

    let currentDegree = 0;

    const gradient = statusData
        .filter((status) => status.count > 0)
        .map((status) => {
            const start = currentDegree;
            currentDegree += (status.count / total) * 360;

            return `${status.color} ${start}deg ${currentDegree}deg`;
        });

    const chartBackground =
        total > 0
            ? `conic-gradient(${gradient.join(", ")})`
            : "#e5e7eb";

    return (
        <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-gray-900">
                        Order status
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                        Current order distribution
                    </p>
                </div>

                <button
                    type="button"
                    aria-label="Order status options"
                    className="text-gray-400 hover:text-black"
                >
                    <FiMoreHorizontal size={19} />
                </button>
            </div>

            <div className="mt-8 flex justify-center">
                <div className="relative flex h-[180px] w-[180px] items-center justify-center">
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{ background: chartBackground }}
                    />

                    <div className="absolute inset-[22px] flex flex-col items-center justify-center rounded-full bg-white">
                        <FiPackage
                            size={18}
                            className="mb-2 text-gray-400"
                        />

                        <p className="text-2xl font-bold text-gray-900">
                            {total.toLocaleString()}
                        </p>

                        <p className="text-[10px] text-gray-400">
                            Total orders
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 space-y-5">
                {statusData.map((status) => (
                    <div
                        key={status.label}
                        className="flex items-center justify-between gap-3"
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                    backgroundColor: status.color,
                                }}
                            />

                            <div>
                                <p className="text-xs font-medium text-gray-800">
                                    {status.label}
                                </p>

                                <p className="mt-0.5 text-[10px] text-gray-400">
                                    {status.count}{" "}
                                    {status.count === 1 ? "order" : "orders"}
                                </p>
                            </div>
                        </div>

                        <p className="text-sm font-bold text-gray-900">
                            {getPercentage(status.count)}%
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
