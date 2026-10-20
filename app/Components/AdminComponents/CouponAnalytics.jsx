"use client";

import React from "react";
import {
    FiTag,
    FiTrendingUp,
} from "react-icons/fi";

function formatCurrency(value) {
    return `₦${Number(value || 0).toLocaleString()}`;
}

export default function CouponAnalytics({
    data = {},
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                        Coupon Performance
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                        How coupons are affecting sales.
                    </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                    <FiTag size={18} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-gray-100">
                <div className="bg-white p-5">
                    <p className="text-xs text-gray-500">
                        Redemptions
                    </p>

                    <p className="mt-2 text-xl font-bold text-gray-900">
                        {data?.redemptions || 0}
                    </p>
                </div>

                <div className="bg-white p-5">
                    <p className="text-xs text-gray-500">
                        Discount Given
                    </p>

                    <p className="mt-2 text-xl font-bold text-gray-900">
                        {formatCurrency(
                            data?.discount_given
                        )}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
                <div>
                    <p className="text-xs text-gray-500">
                        Revenue from coupon orders
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-900">
                        {formatCurrency(data?.revenue)}
                    </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <FiTrendingUp size={14} />
                    {Number(data?.roi || 0).toFixed(1)}x ROI
                </div>
            </div>
        </div>
    );
}