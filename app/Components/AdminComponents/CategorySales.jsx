"use client";

import React from "react";

function formatCurrency(value) {
    return `₦${Number(value || 0).toLocaleString()}`;
}

export default function CategorySales({
    categories = [],
}) {
    const data = Array.isArray(categories)
        ? categories
        : [];

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-5">
                <h3 className="text-sm font-semibold text-gray-900">
                    Sales by Category
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                    Revenue distribution across categories.
                </p>
            </div>

            {data.length === 0 ? (
                <div className="px-5 py-12 text-center text-xs text-gray-400">
                    No category sales for this period.
                </div>
            ) : (
                <div className="space-y-5 p-5">
                    {data.map((category) => (
                        <div key={category.id || category.name}>
                            <div className="mb-2 flex items-center justify-between gap-4">
                                <span className="truncate text-xs font-medium text-gray-700">
                                    {category.name}
                                </span>

                                <span className="shrink-0 text-xs font-semibold text-gray-900">
                                    {formatCurrency(category.revenue)}
                                </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className="h-full rounded-full bg-gray-900 transition-all duration-500"
                                    style={{
                                        width: `${Math.min(
                                            Number(category.percentage) || 0,
                                            100
                                        )}%`,
                                    }}
                                />
                            </div>

                            <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                                <span>
                                    {category.units || 0} units sold
                                </span>

                                <span>
                                    {Number(
                                        category.percentage || 0
                                    ).toFixed(1)}
                                    %
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}