"use client";

import React from "react";
import {
    FiUsers,
    FiUserPlus,
    FiRefreshCw,
} from "react-icons/fi";

export default function CustomerAnalytics({
    data = {},
}) {
    const newCustomers = Number(
        data?.new_customers || 0
    );

    const returningCustomers = Number(
        data?.returning_customers || 0
    );

    const repeatRate = Number(
        data?.repeat_purchase_rate || 0
    );

    return (
        <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                        <FiUsers size={18} />
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                            Customer Analytics
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                            Customer activity for this period.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-gray-100">
                <div className="bg-white p-5">
                    <FiUserPlus
                        size={17}
                        className="text-gray-400"
                    />

                    <p className="mt-4 text-2xl font-bold text-gray-900">
                        {newCustomers}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        New Customers
                    </p>
                </div>

                <div className="bg-white p-5">
                    <FiRefreshCw
                        size={17}
                        className="text-gray-400"
                    />

                    <p className="mt-4 text-2xl font-bold text-gray-900">
                        {returningCustomers}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        Returning
                    </p>
                </div>
            </div>

            <div className="border-t border-gray-100 px-5 py-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        Repeat Purchase Rate
                    </span>

                    <span className="text-sm font-bold text-gray-900">
                        {repeatRate.toFixed(1)}%
                    </span>
                </div>
            </div>
        </div>
    );
}