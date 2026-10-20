"use client";

import React from "react";
import Link from "next/link";
import {
    FiArrowUpRight,
    FiMoreHorizontal,
    FiShoppingBag,
} from "react-icons/fi";

const statusStyles = {
    Successful: "bg-emerald-50 text-emerald-600",
    Delivered: "bg-emerald-50 text-emerald-600",
    Collected: "bg-emerald-50 text-emerald-600",
    Processing: "bg-amber-50 text-amber-600",
    Shipped: "bg-blue-50 text-blue-600",
    Pending: "bg-gray-100 text-gray-600",
    Cancelled: "bg-red-50 text-red-500",
};

export default function RecentOrders({ recentOrders = [] }) {
    const orders = Array.isArray(recentOrders)
        ? recentOrders
        : Array.isArray(recentOrders?.results)
          ? recentOrders.results
          : [];

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
        }).format(Number(value) || 0);

    const formatDate = (date) => {
        if (!date) return "Date unavailable";

        const orderDate = new Date(date);

        if (Number.isNaN(orderDate.getTime())) {
            return "Date unavailable";
        }

        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        if (orderDate.toDateString() === now.toDateString()) {
            return `Today, ${orderDate.toLocaleTimeString("en-NG", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            })}`;
        }

        if (orderDate.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        }

        return orderDate.toLocaleDateString("en-NG", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getCustomerName = (order) => {
        if (typeof order?.customer === "string" && order.customer.trim()) {
            return order.customer.trim();
        }

        const user = order?.user ?? order?.customer ?? {};

        const firstName =
            user?.first_name?.trim?.() ||
            user?.first_name ||
            user?.firstName ||
            "";

        const lastName =
            user?.last_name?.trim?.() ||
            user?.last_name ||
            user?.lastName ||
            "";

        const fullName = `${firstName} ${lastName}`.trim();

        return (
            fullName ||
            user?.username ||
            user?.email ||
            "Guest customer"
        );
    };

    const getInitials = (name) =>
        name
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "GC";

    const getOrderNumber = (order) => {
        const value = String(
            order?.order_number ?? order?.id ?? ""
        );

        if (!value) return "#ORDER";

        return `#${value.length > 12 ? value.slice(0, 8) : value}`;
    };

    const getOrderTotal = (order) =>
        order?.total ??
        order?.total_price ??
        order?.grand_total ??
        order?.amount ??
        0;

    return (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-5 sm:p-6">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                        Recent orders
                    </h3>

                    <p className="mt-1 text-xs text-gray-400">
                        Latest activity from your store
                    </p>
                </div>

                <Link
                    href="/admin/dashboard/orders"
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 transition hover:text-black"
                >
                    View all
                    <FiArrowUpRight size={13} />
                </Link>
            </div>

            {/* Orders */}
            <div className="divide-y divide-gray-100">
                {orders.length > 0 ? (
                    orders.map((order, index) => {
                        const customerName = getCustomerName(order);
                        const status = order?.status || "Pending";

                        const key =
                            order?.id ??
                            order?.order_number ??
                            `order-${index}`;

                        return (
                            <div
                                key={key}
                                className="flex items-center gap-3 p-4 transition hover:bg-gray-50 sm:gap-4 sm:p-5"
                            >
                                {/* Customer avatar */}
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs font-bold text-gray-700">
                                    {getInitials(customerName)}
                                </div>

                                {/* Order information */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-xs font-bold text-gray-900">
                                            {getOrderNumber(order)}
                                        </p>

                                        <span className="hidden text-gray-300 sm:inline">
                                            •
                                        </span>

                                        <p className="max-w-full truncate text-xs text-gray-500">
                                            {customerName}
                                        </p>
                                    </div>

                                    <p className="mt-1 text-[10px] text-gray-400">
                                        {formatDate(order?.created_at)}
                                    </p>

                                    {/* Status on mobile */}
                                    <span
                                        className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-medium sm:hidden ${
                                            statusStyles[status] ||
                                            "bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                        {status}
                                    </span>
                                </div>

                                {/* Amount and status on desktop */}
                                <div className="hidden shrink-0 text-right sm:block">
                                    <p className="text-xs font-bold text-gray-900">
                                        {formatCurrency(getOrderTotal(order))}
                                    </p>

                                    <span
                                        className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-medium ${
                                            statusStyles[status] ||
                                            "bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                        {status}
                                    </span>
                                </div>

                                {/* Mobile amount and menu */}
                                <div className="flex shrink-0 flex-col items-end gap-2 sm:hidden">
                                    <p className="text-xs font-bold text-gray-900">
                                        {formatCurrency(getOrderTotal(order))}
                                    </p>

                                    <button
                                        type="button"
                                        aria-label={`Options for order ${getOrderNumber(order)}`}
                                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-black"
                                    >
                                        <FiMoreHorizontal size={17} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="px-5 py-12 text-center">
                        <FiShoppingBag
                            size={28}
                            className="mx-auto text-gray-300"
                        />

                        <p className="mt-3 text-sm font-medium text-gray-500">
                            No recent orders
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            New orders will appear here.
                        </p>
                    </div>
                )}
            </div>

            {/* Mobile footer */}
            {orders.length > 0 && (
                <div className="border-t border-gray-100 p-4 sm:hidden">
                    <Link
                        href="/admin/dashboard/orders"
                        className="block text-center text-xs font-medium text-gray-500 hover:text-black"
                    >
                        View all orders
                    </Link>
                </div>
            )}
        </section>
    );
}
