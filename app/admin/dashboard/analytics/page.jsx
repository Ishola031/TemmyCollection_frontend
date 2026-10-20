"use client";

import React, { useState } from "react";
import {
    FiArrowDown,
    FiArrowUp,
    FiBarChart2,
    FiCalendar,
    FiChevronDown,
    FiDollarSign,
    FiDownload,
    FiMoreHorizontal,
    FiPackage,
    FiShoppingBag,
    FiUsers,
} from "react-icons/fi";

const salesData = [
    { day: "Mon", revenue: 42000, orders: 18 },
    { day: "Tue", revenue: 58000, orders: 24 },
    { day: "Wed", revenue: 47000, orders: 21 },
    { day: "Thu", revenue: 73000, orders: 31 },
    { day: "Fri", revenue: 91000, orders: 39 },
    { day: "Sat", revenue: 115000, orders: 48 },
    { day: "Sun", revenue: 82000, orders: 35 },
];

const products = [
    {
        name: "Classic Leather Bag",
        category: "Bags",
        sold: 84,
        revenue: "₦3,780,000",
    },
    {
        name: "Premium Sneakers",
        category: "Footwear",
        sold: 67,
        revenue: "₦2,345,000",
    },
    {
        name: "Luxury Wrist Watch",
        category: "Accessories",
        sold: 51,
        revenue: "₦1,785,000",
    },
    {
        name: "Classic Hoodie",
        category: "Fashion",
        sold: 43,
        revenue: "₦1,290,000",
    },
    {
        name: "Designer Sunglasses",
        category: "Accessories",
        sold: 38,
        revenue: "₦950,000",
    },
];

const orders = [
    {
        id: "#TC-1048",
        customer: "David Johnson",
        amount: "₦85,000",
        status: "Completed",
    },
    {
        id: "#TC-1047",
        customer: "Sarah Williams",
        amount: "₦42,500",
        status: "Processing",
    },
    {
        id: "#TC-1046",
        customer: "Michael James",
        amount: "₦125,000",
        status: "Completed",
    },
    {
        id: "#TC-1045",
        customer: "Aisha Bello",
        amount: "₦67,000",
        status: "Pending",
    },
    {
        id: "#TC-1044",
        customer: "Daniel Smith",
        amount: "₦35,000",
        status: "Completed",
    },
];

export default function AnalyticsPage() {
    const [period, setPeriod] = useState("Last 7 days");

    const maxRevenue = Math.max(
        ...salesData.map((item) => item.revenue)
    );

    return (
        <div className="px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
            {/* Header */}
            <div className="mb-8">
                <div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
                    <span>Admin</span>
                    <span>/</span>
                    <span>Analytics</span>
                </div>

                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                            Store performance
                        </p>

                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Analytics
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Understand how your Temmy Collection store is
                            performing.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <div className="relative">
                            <FiCalendar
                                size={14}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <select
                                value={period}
                                onChange={(event) =>
                                    setPeriod(event.target.value)
                                }
                                className="h-10 appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-9 text-xs font-semibold outline-none focus:border-black"
                            >
                                <option>Today</option>
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                                <option>Last 90 days</option>
                                <option>This year</option>
                            </select>

                            <FiChevronDown
                                size={13}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                        </div>

                        <button className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold hover:bg-gray-50">
                            <FiDownload size={14} />
                            Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AnalyticsCard
                    title="Total revenue"
                    value="₦12.8M"
                    change="+18.4%"
                    positive
                    icon={<FiDollarSign size={17} />}
                />

                <AnalyticsCard
                    title="Total orders"
                    value="1,248"
                    change="+12.7%"
                    positive
                    icon={<FiShoppingBag size={17} />}
                />

                <AnalyticsCard
                    title="Customers"
                    value="3,842"
                    change="+8.2%"
                    positive
                    icon={<FiUsers size={17} />}
                />

                <AnalyticsCard
                    title="Products sold"
                    value="2,916"
                    change="+15.3%"
                    positive
                    icon={<FiPackage size={17} />}
                />
            </div>

            {/* Charts */}
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                {/* Revenue chart */}
                <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                    <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                            <h2 className="text-sm font-bold">
                                Revenue overview
                            </h2>

                            <div className="mt-2 flex items-center gap-3">
                                <span className="text-2xl font-bold">
                                    ₦508,000
                                </span>

                                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-600">
                                    <FiArrowUp size={10} />
                                    18.4%
                                </span>
                            </div>

                            <p className="mt-1 text-[10px] text-gray-400">
                                Compared with the previous period
                            </p>
                        </div>

                        <button className="flex items-center gap-2 self-start rounded-lg border border-gray-200 px-3 py-2 text-[10px] font-semibold">
                            Revenue
                            <FiChevronDown size={12} />
                        </button>
                    </div>

                    <div className="relative h-72">
                        <div className="absolute inset-0 flex flex-col justify-between">
                            {[120, 90, 60, 30, 0].map((value) => (
                                <div
                                    key={value}
                                    className="flex items-center gap-3"
                                >
                                    <span className="w-10 text-right text-[9px] text-gray-400">
                                        {value}k
                                    </span>

                                    <div className="h-px flex-1 bg-gray-100" />
                                </div>
                            ))}
                        </div>

                        <div className="absolute bottom-0 left-14 right-0 top-0 flex items-end justify-between gap-2">
                            {salesData.map((item) => {
                                const height =
                                    (item.revenue / maxRevenue) * 100;

                                return (
                                    <div
                                        key={item.day}
                                        className="flex h-full flex-1 flex-col justify-end"
                                    >
                                        <div className="group relative flex h-full items-end">
                                            <div
                                                style={{
                                                    height: `${height}%`,
                                                }}
                                                className="relative w-full rounded-t-lg bg-black transition-all hover:bg-gray-700"
                                            >
                                                <div className="absolute -top-9 left-1/2 hidden -translate-x-1/2 rounded-lg bg-black px-2 py-1 text-[8px] font-semibold text-white group-hover:block">
                                                    ₦
                                                    {(
                                                        item.revenue / 1000
                                                    ).toFixed(0)}
                                                    k
                                                </div>
                                            </div>
                                        </div>

                                        <span className="mt-3 text-center text-[9px] text-gray-400">
                                            {item.day}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Order summary */}
                <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-sm font-bold">
                                Order summary
                            </h2>

                            <p className="mt-1 text-[10px] text-gray-400">
                                Orders by status
                            </p>
                        </div>

                        <FiBarChart2
                            size={18}
                            className="text-gray-300"
                        />
                    </div>

                    <div className="mt-8 flex justify-center">
                        <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-[18px] border-gray-100">
                            <div className="absolute inset-[-18px] rounded-full border-[18px] border-black border-b-transparent border-l-transparent rotate-[-35deg]" />

                            <div className="text-center">
                                <p className="text-2xl font-bold">
                                    1,248
                                </p>

                                <p className="mt-1 text-[9px] text-gray-400">
                                    Total orders
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-3">
                        <OrderStatus
                            label="Completed"
                            value="892"
                            percentage="71.5%"
                            active
                        />

                        <OrderStatus
                            label="Processing"
                            value="214"
                            percentage="17.1%"
                        />

                        <OrderStatus
                            label="Pending"
                            value="96"
                            percentage="7.7%"
                        />

                        <OrderStatus
                            label="Cancelled"
                            value="46"
                            percentage="3.7%"
                        />
                    </div>
                </section>
            </div>

            {/* Lower analytics */}
            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                {/* Sales activity */}
                <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                    <div className="mb-6">
                        <h2 className="text-sm font-bold">
                            Sales activity
                        </h2>

                        <p className="mt-1 text-[10px] text-gray-400">
                            Number of orders received each day.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {salesData.map((item) => {
                            const width =
                                (item.orders / 50) * 100;

                            return (
                                <div
                                    key={item.day}
                                    className="flex items-center gap-3"
                                >
                                    <span className="w-8 text-[10px] font-semibold text-gray-500">
                                        {item.day}
                                    </span>

                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            style={{
                                                width: `${width}%`,
                                            }}
                                            className="h-full rounded-full bg-black"
                                        />
                                    </div>

                                    <span className="w-8 text-right text-[10px] font-semibold">
                                        {item.orders}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Customer overview */}
                <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h2 className="text-sm font-bold">
                                Customer overview
                            </h2>

                            <p className="mt-1 text-[10px] text-gray-400">
                                Customer activity during this period.
                            </p>
                        </div>

                        <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                            <FiMoreHorizontal size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <CustomerBox
                            title="New customers"
                            value="428"
                            change="+14.8%"
                        />

                        <CustomerBox
                            title="Returning"
                            value="736"
                            change="+9.2%"
                        />

                        <CustomerBox
                            title="Avg. order value"
                            value="₦42.8K"
                            change="+6.4%"
                        />

                        <CustomerBox
                            title="Conversion rate"
                            value="4.82%"
                            change="+1.3%"
                        />
                    </div>
                </section>
            </div>

            {/* Top products */}
            <section className="mt-5 rounded-2xl border border-gray-200 bg-white">
                <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:p-6">
                    <div>
                        <h2 className="text-sm font-bold">
                            Top selling products
                        </h2>

                        <p className="mt-1 text-[10px] text-gray-400">
                            Products generating the most sales.
                        </p>
                    </div>

                    <button className="text-[10px] font-semibold text-gray-500 hover:text-black">
                        View all products →
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px]">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50 text-left">
                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 sm:px-6">
                                    Product
                                </th>

                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Category
                                </th>

                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Units sold
                                </th>

                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Revenue
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {products.map((product, index) => (
                                <tr
                                    key={product.name}
                                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                                >
                                    <td className="px-5 py-4 sm:px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-[10px] font-bold">
                                                {index + 1}
                                            </div>

                                            <span className="text-xs font-semibold">
                                                {product.name}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 text-[10px] text-gray-400">
                                        {product.category}
                                    </td>

                                    <td className="px-5 py-4 text-xs font-semibold">
                                        {product.sold}
                                    </td>

                                    <td className="px-5 py-4 text-xs font-semibold">
                                        {product.revenue}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Recent orders */}
            <section className="mt-5 rounded-2xl border border-gray-200 bg-white">
                <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:p-6">
                    <div>
                        <h2 className="text-sm font-bold">
                            Recent orders
                        </h2>

                        <p className="mt-1 text-[10px] text-gray-400">
                            Latest customer orders.
                        </p>
                    </div>

                    <button className="text-[10px] font-semibold text-gray-500 hover:text-black">
                        View all orders →
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px]">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50 text-left">
                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 sm:px-6">
                                    Order
                                </th>

                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Customer
                                </th>

                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Amount
                                </th>

                                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Status
                                </th>

                                <th className="px-5 py-4"></th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                                >
                                    <td className="px-5 py-4 sm:px-6">
                                        <span className="text-xs font-bold">
                                            {order.id}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-xs text-gray-500">
                                        {order.customer}
                                    </td>

                                    <td className="px-5 py-4 text-xs font-semibold">
                                        {order.amount}
                                    </td>

                                    <td className="px-5 py-4">
                                        <OrderBadge status={order.status} />
                                    </td>

                                    <td className="px-5 py-4 text-right">
                                        <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-black">
                                            <FiMoreHorizontal size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <p className="py-8 text-center text-[10px] text-gray-400">
                © {new Date().getFullYear()} Temmy Collection · Admin
                Dashboard
            </p>
        </div>
    );
}

function AnalyticsCard({
    title,
    value,
    change,
    positive,
    icon,
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                    {icon}
                </div>

                <span
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold ${
                        positive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-500"
                    }`}
                >
                    {positive ? (
                        <FiArrowUp size={9} />
                    ) : (
                        <FiArrowDown size={9} />
                    )}

                    {change}
                </span>
            </div>

            <p className="mt-5 text-[10px] text-gray-400">
                {title}
            </p>

            <p className="mt-1 text-xl font-bold">
                {value}
            </p>
        </div>
    );
}

function OrderStatus({
    label,
    value,
    percentage,
    active,
}) {
    return (
        <div className="flex items-center gap-3">
            <span
                className={`h-2 w-2 rounded-full ${
                    active ? "bg-black" : "bg-gray-200"
                }`}
            />

            <span className="flex-1 text-[10px] text-gray-500">
                {label}
            </span>

            <span className="text-[10px] font-semibold">
                {value}
            </span>

            <span className="w-10 text-right text-[9px] text-gray-400">
                {percentage}
            </span>
        </div>
    );
}

function CustomerBox({
    title,
    value,
    change,
}) {
    return (
        <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-[9px] text-gray-400">
                {title}
            </p>

            <div className="mt-2 flex items-end justify-between gap-2">
                <p className="text-lg font-bold">
                    {value}
                </p>

                <span className="text-[8px] font-semibold text-emerald-600">
                    {change}
                </span>
            </div>
        </div>
    );
}

function OrderBadge({ status }) {
    const styles = {
        Completed: "bg-emerald-50 text-emerald-600",
        Processing: "bg-blue-50 text-blue-600",
        Pending: "bg-amber-50 text-amber-600",
        Cancelled: "bg-red-50 text-red-500",
    };

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${
                styles[status] || "bg-gray-100 text-gray-500"
            }`}
        >
            {status}
        </span>
    );
}