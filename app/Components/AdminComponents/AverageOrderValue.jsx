"use client";

import React from "react";
import {
    FiShoppingBag,
    FiTrendingUp,
    FiTrendingDown,
} from "react-icons/fi";

function formatCurrency(value) {
    return `₦${Number(value || 0).toLocaleString()}`;
}

export default function AverageOrderValue({
    value = 0,
    change = 0,
}) {
    const positive = Number(change) >= 0;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-500">
                        Average Order Value
                    </p>

                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                        {formatCurrency(value)}
                    </h3>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                    <FiShoppingBag size={18} />
                </div>
            </div>

            <div
                className={`mt-4 flex items-center gap-1.5 text-xs font-semibold ${
                    positive
                        ? "text-emerald-600"
                        : "text-red-600"
                }`}
            >
                {positive ? (
                    <FiTrendingUp size={14} />
                ) : (
                    <FiTrendingDown size={14} />
                )}

                {positive ? "+" : ""}
                {Number(change || 0).toFixed(1)}%

                <span className="font-normal text-gray-400">
                    vs previous period
                </span>
            </div>
        </div>
    );
}