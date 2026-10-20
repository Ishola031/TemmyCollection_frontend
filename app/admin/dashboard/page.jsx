"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    FiActivity,
    FiAlertTriangle,
    FiArrowDown,
    FiArrowUp,
    FiBox,
    FiCheckCircle,
    FiChevronDown,
    FiClock,
    FiCreditCard,
    FiDollarSign,
    FiGift,
    FiPackage,
    FiPercent,
    FiRefreshCw,
    FiShoppingBag,
    FiShoppingCart,
    FiTruck,
    FiUsers,
    FiXCircle,
} from "react-icons/fi";

import RevenueChart from "../../Components/AdminComponents/RevenueChart";
import OrderStatus from "../../Components/AdminComponents/OrderStatus";
import RecentOrders from "../../Components/AdminComponents/RecentOrders";
import TopProducts from "../../Components/AdminComponents/TopProducts";
import InventoryAlert from "../../Components/AdminComponents/InventoryAlert";
import FulfillmentAnalytics from "../../Components/AdminComponents/FulfillmentAnalytics";
import CustomerAnalytics from "../../Components/AdminComponents/CustomerAnalytics";

import adminApi from "../../api/adminApi";

const PERIODS = [
    {
        value: "today",
        label: "Today",
    },
    {
        value: "yesterday",
        label: "Yesterday",
    },
    {
        value: "7days",
        label: "Last 7 Days",
    },
    {
        value: "week",
        label: "This Week",
    },
    {
        value: "last_week",
        label: "Last Week",
    },
    {
        value: "month",
        label: "This Month",
    },
    {
        value: "last_month",
        label: "Last Month",
    },
    {
        value: "year",
        label: "This Year",
    },
    {
        value: "last_year",
        label: "Last Year",
    },
    {
        value: "all",
        label: "All Time",
    },
];

const money = (value) => {
    const amount = Number(value || 0);

    return `₦${amount.toLocaleString("en-NG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
};

const number = (value) => {
    return Number(value || 0).toLocaleString("en-NG");
};

const percentage = (value) => {
    return `${Number(value || 0).toFixed(2)}%`;
};

function ChangeBadge({ value }) {
    const change = Number(value || 0);
    const positive = change >= 0;

    return (
        <div
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                positive
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
            }`}
        >
            {positive ? (
                <FiArrowUp size={12} />
            ) : (
                <FiArrowDown size={12} />
            )}

            {Math.abs(change).toFixed(2)}%
        </div>
    );
}

function MetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconClass = "bg-gray-100 text-gray-700",
    change,
}) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500">
                        {title}
                    </p>

                    <h3 className="mt-2 truncate text-2xl font-bold tracking-tight text-gray-900">
                        {value}
                    </h3>

                    {subtitle && (
                        <p className="mt-1 text-xs text-gray-400">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                >
                    <Icon size={20} />
                </div>
            </div>

            {change !== undefined && change !== null && (
                <div className="mt-4">
                    <ChangeBadge value={change} />
                </div>
            )}
        </div>
    );
}

function SectionTitle({ title, description }) {
    return (
        <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>

            {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
        </div>
    );
}

function EmptyState({ text }) {
    return (
        <div className="flex min-h-[180px] items-center justify-center text-sm text-gray-400">
            {text}
        </div>
    );
}

export default function DashboardPage() {
    const [dashboard, setDashboard] = useState(null);
    const [period, setPeriod] = useState("month");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchDashboard = async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await adminApi.get(
                `dashboard/?period=${period}`
            );

            setDashboard(response.data);
        } catch (err) {
            console.error("Dashboard error:", err);

            setError(
                err?.response?.data?.detail ||
                    "Unable to load dashboard data."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, [period]);

    const financial = dashboard?.financial || {};
    const financialChange = dashboard?.financial_change || {};
    const orders = dashboard?.orders || {};
    const customers = dashboard?.customers || {};
    const products = dashboard?.products || {};
    const coupons = dashboard?.coupons || {};
    const shipping = dashboard?.shipping || {};
    const fulfillment = dashboard?.fulfillment || {};
    const orderStatus = dashboard?.order_status || {};

    const recentOrders = dashboard?.recent_orders || [];
    const topProducts = dashboard?.top_products || [];
    const lowStockProducts = dashboard?.low_stock_products || [];
    const topCoupons = coupons?.top_coupons || [];

    // const chartData = useMemo(() => {
    //     return (dashboard?.monthly_revenue || []).map((item) => ({
    //         ...item,
    //         value: Number(item.revenue || 0),
    //         revenue: Number(item.revenue || 0),
    //     }));
    // }, [dashboard]);

    const chartData = useMemo(() => {
        const revenue = dashboard?.monthly_revenue || [];

        return revenue.map((item) => ({
            month: item.month || item.label || "",
            revenue: Number(item.revenue || item.value || 0),
        }));
    }, [dashboard]);

    if (loading && !dashboard) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="flex items-center gap-3 text-gray-500">
                    <FiRefreshCw size={20} className="animate-spin" />

                    <span>Loading dashboard...</span>
                </div>
            </div>
        );
    }

    if (error && !dashboard) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <FiAlertTriangle size={24} />
                </div>

                <h2 className="text-lg font-semibold text-gray-900">
                    Dashboard unavailable
                </h2>

                <p className="mt-1 max-w-md text-sm text-gray-500">
                    {error}
                </p>

                <button
                    onClick={() => fetchDashboard()}
                    className="mt-5 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10 p-8">
            {/* HEADER */}
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Here's what's happening with your store.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => fetchDashboard(true)}
                        disabled={refreshing}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <FiRefreshCw
                            size={17}
                            className={refreshing ? "animate-spin" : ""}
                        />
                    </button>

                    <div className="relative">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="h-11 appearance-none rounded-xl border border-gray-200 bg-white py-0 pl-4 pr-10 text-sm font-medium text-gray-700 shadow-sm outline-none focus:border-gray-400"
                        >
                            {PERIODS.map((item) => (
                                <option
                                    key={item.value}
                                    value={item.value}
                                >
                                    {item.label}
                                </option>
                            ))}
                        </select>

                        <FiChevronDown
                            size={16}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                    </div>
                </div>
            </div>

            {/* FINANCIAL OVERVIEW */}
            <section>
                <SectionTitle
                    title="Financial overview"
                    description={`Performance for ${
                        dashboard?.period_label || "selected period"
                    }`}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        title="Total Revenue"
                        value={money(financial.total_revenue)}
                        subtitle="Successful payments"
                        icon={FiDollarSign}
                        iconClass="bg-emerald-50 text-emerald-600"
                        change={financialChange.revenue}
                    />

                    <MetricCard
                        title="Product Sales"
                        value={money(financial.product_sales)}
                        subtitle="After coupon discounts"
                        icon={FiShoppingBag}
                        iconClass="bg-blue-50 text-blue-600"
                    />

                    <MetricCard
                        title="Coupon Discount"
                        value={money(financial.coupon_discount)}
                        subtitle="Amount given to customers"
                        icon={FiGift}
                        iconClass="bg-purple-50 text-purple-600"
                    />

                    <MetricCard
                        title="Product Discount"
                        value={money(financial.product_discount)}
                        subtitle="Product-level discounts"
                        icon={FiPercent}
                        iconClass="bg-orange-50 text-orange-600"
                    />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        title="Shipping Revenue"
                        value={money(financial.shipping_revenue)}
                        subtitle="Delivery & pickup fees"
                        icon={FiTruck}
                        iconClass="bg-cyan-50 text-cyan-600"
                    />

                    <MetricCard
                        title="Average Order Value"
                        value={money(financial.average_order_value)}
                        subtitle="Average successful order"
                        icon={FiCreditCard}
                        iconClass="bg-indigo-50 text-indigo-600"
                    />

                    <MetricCard
                        title="Pending Payments"
                        value={money(financial.pending_payment)}
                        subtitle="Awaiting payment"
                        icon={FiClock}
                        iconClass="bg-yellow-50 text-yellow-600"
                    />

                    <MetricCard
                        title="Refunded Amount"
                        value={money(financial.refunded_amount)}
                        subtitle="Payments refunded"
                        icon={FiRefreshCw}
                        iconClass="bg-red-50 text-red-600"
                    />
                </div>
            </section>

            {/* ORDERS */}
            <section>
                <SectionTitle
                    title="Orders"
                    description="Overview of your order activity."
                />

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                    <MetricCard
                        title="Total"
                        value={number(orders.total)}
                        icon={FiShoppingCart}
                        iconClass="bg-gray-100 text-gray-700"
                    />

                    <MetricCard
                        title="Successful"
                        value={number(orders.successful)}
                        icon={FiCheckCircle}
                        iconClass="bg-emerald-50 text-emerald-600"
                    />

                    <MetricCard
                        title="Processing"
                        value={number(orders.processing)}
                        icon={FiActivity}
                        iconClass="bg-blue-50 text-blue-600"
                    />

                    <MetricCard
                        title="Shipped"
                        value={number(orders.shipped)}
                        icon={FiTruck}
                        iconClass="bg-cyan-50 text-cyan-600"
                    />

                    <MetricCard
                        title="Delivered"
                        value={number(orders.delivered)}
                        icon={FiPackage}
                        iconClass="bg-purple-50 text-purple-600"
                    />

                    <MetricCard
                        title="Cancelled"
                        value={number(orders.cancelled)}
                        icon={FiXCircle}
                        iconClass="bg-red-50 text-red-600"
                    />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Fulfillment Rate
                                </p>

                                <p className="mt-2 text-2xl font-bold text-gray-900">
                                    {percentage(orders.fulfillment_rate)}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <FiCheckCircle size={20} />
                            </div>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{
                                    width: `${Math.min(
                                        Number(
                                            orders.fulfillment_rate || 0
                                        ),
                                        100
                                    )}%`,
                                }}
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Cancellation Rate
                                </p>

                                <p className="mt-2 text-2xl font-bold text-gray-900">
                                    {percentage(orders.cancellation_rate)}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                <FiXCircle size={20} />
                            </div>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-red-500"
                                style={{
                                    width: `${Math.min(
                                        Number(
                                            orders.cancellation_rate || 0
                                        ),
                                        100
                                    )}%`,
                                }}
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Order Growth
                                </p>

                                <div className="mt-2">
                                    <ChangeBadge
                                        value={financialChange.orders}
                                    />
                                </div>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <FiActivity size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* REVENUE + ORDER STATUS */}
            <section>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-gray-900">
                                Revenue overview
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Revenue from successful payments.
                            </p>
                        </div>

                        <div className="w-full min-w-0 overflow-hidden rounded-xl">
                            <div className="h-auto w-full min-w-0">
                                {chartData.length > 0 ? (
                                    <RevenueChart revenueData={chartData} />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                        No revenue data available.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-gray-900">
                                Order status
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Order distribution.
                            </p>
                        </div>

                        <OrderStatus orderStatus={orderStatus} total_orders={orders?.total}/>
                    </div>
                </div>
            </section>

            {/* RECENT ORDERS */}
            <section>
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 p-5">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Recent orders
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Latest orders from your store.
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                            <FiShoppingCart size={18} />
                        </div>
                    </div>

                    {recentOrders.length > 0 ? (
                        <RecentOrders recentOrders={recentOrders} />
                    ) : (
                        <EmptyState text="No orders found for this period." />
                    )}
                </div>
            </section>

            {/* CUSTOMERS */}
            <section>
                <SectionTitle
                    title="Customers"
                    description="Customer growth and purchasing activity."
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        title="Total Customers"
                        value={number(customers.total)}
                        subtitle="Registered customers"
                        icon={FiUsers}
                        iconClass="bg-blue-50 text-blue-600"
                    />

                    <MetricCard
                        title="New Customers"
                        value={number(customers.new)}
                        subtitle="First purchase in period"
                        icon={FiUsers}
                        iconClass="bg-emerald-50 text-emerald-600"
                    />

                    <MetricCard
                        title="Returning Customers"
                        value={number(customers.returning)}
                        subtitle="Repeat customers"
                        icon={FiRefreshCw}
                        iconClass="bg-purple-50 text-purple-600"
                    />

                    <MetricCard
                        title="Customers Who Purchased"
                        value={number(customers.with_orders)}
                        subtitle="Successful customers"
                        icon={FiShoppingBag}
                        iconClass="bg-orange-50 text-orange-600"
                    />
                </div>
            </section>

            {/* PRODUCTS */}
            <section>
                <SectionTitle
                    title="Product inventory"
                    description="Current state of your product catalog."
                />

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <MetricCard
                        title="Total Products"
                        value={number(products.total)}
                        icon={FiBox}
                        iconClass="bg-gray-100 text-gray-700"
                    />

                    <MetricCard
                        title="Published"
                        value={number(products.published)}
                        icon={FiCheckCircle}
                        iconClass="bg-emerald-50 text-emerald-600"
                    />

                    <MetricCard
                        title="Low Stock"
                        value={number(products.low_stock)}
                        icon={FiAlertTriangle}
                        iconClass="bg-yellow-50 text-yellow-600"
                    />

                    <MetricCard
                        title="Out of Stock"
                        value={number(products.out_of_stock)}
                        icon={FiXCircle}
                        iconClass="bg-red-50 text-red-600"
                    />
                </div>
            </section>

            {/* COUPONS */}
            <section>
                <SectionTitle
                    title="Coupon performance"
                    description="See how much your promotions are costing the store."
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <MetricCard
                        title="Coupon Orders"
                        value={number(coupons.total_used)}
                        subtitle="Orders using coupons"
                        icon={FiGift}
                        iconClass="bg-purple-50 text-purple-600"
                    />

                    <MetricCard
                        title="Discount Given"
                        value={money(coupons.total_discount)}
                        subtitle="Actual discount given"
                        icon={FiPercent}
                        iconClass="bg-pink-50 text-pink-600"
                    />

                    <MetricCard
                        title="Unique Coupons Used"
                        value={number(coupons.orders_using_coupon)}
                        subtitle="Different coupon codes"
                        icon={FiShoppingBag}
                        iconClass="bg-indigo-50 text-indigo-600"
                    />
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 p-5">
                        <h3 className="font-bold text-gray-900">
                            Top coupons
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Most-used promotional codes.
                        </p>
                    </div>

                    {topCoupons.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {topCoupons.map((coupon, index) => (
                                <div
                                    key={`${coupon.code}-${index}`}
                                    className="flex items-center justify-between gap-4 px-5 py-4"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-sm font-bold text-purple-600">
                                            {index + 1}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-gray-900">
                                                {coupon.code}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {coupon.usage} uses
                                            </p>
                                        </div>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <p className="font-semibold text-gray-900">
                                            {money(coupon.discount)}
                                        </p>

                                        <p className="text-xs text-gray-400">
                                            discount
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState text="No coupons used during this period." />
                    )}
                </div>
            </section>

            {/* SHIPPING */}
            <section>
                <SectionTitle
                    title="Shipping & fulfillment"
                    description="Delivery and pickup performance."
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        title="Home Deliveries"
                        value={number(shipping.delivery_orders)}
                        icon={FiTruck}
                        iconClass="bg-cyan-50 text-cyan-600"
                    />

                    <MetricCard
                        title="Pickup Orders"
                        value={number(shipping.pickup_orders)}
                        icon={FiPackage}
                        iconClass="bg-indigo-50 text-indigo-600"
                    />

                    <MetricCard
                        title="Delivery Fees"
                        value={money(shipping.delivery_shipping_revenue)}
                        icon={FiDollarSign}
                        iconClass="bg-emerald-50 text-emerald-600"
                    />

                    <MetricCard
                        title="Pickup Fees"
                        value={money(shipping.pickup_shipping_revenue)}
                        icon={FiDollarSign}
                        iconClass="bg-purple-50 text-purple-600"
                    />
                </div>
            </section>

            {/* PRODUCTS + INVENTORY */}
            <section>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-gray-900">
                                Top products
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Best-selling products for this period.
                            </p>
                        </div>

                        {topProducts.length > 0 ? (
                            <TopProducts topProducts={topProducts} />
                        ) : (
                            <EmptyState text="No product sales yet." />
                        )}
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-gray-900">
                                Inventory alerts
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Products that need attention.
                            </p>
                        </div>

                        {lowStockProducts.length > 0 ? (
                            <InventoryAlert lowStockProducts={lowStockProducts} />
                        ) : (
                            <EmptyState text="All products have sufficient stock." />
                        )}
                    </div>
                </div>
            </section>

            
        </div>
    );
}