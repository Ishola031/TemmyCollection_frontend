"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {FiChevronDown,FiChevronLeft,FiChevronRight,FiDownload,FiFilter,FiMail,FiMoreHorizontal,FiPlus,FiSearch,FiShoppingBag,FiUserPlus,FiX,FiEye,FiSlash,FiCheckCircle,FiPower,} from "react-icons/fi";
import adminApi from "../../../api/adminApi";

const statusStyles = {
    Active: "bg-emerald-50 text-emerald-600",
    Inactive: "bg-gray-100 text-gray-500",
    Banned: "bg-red-50 text-red-600",
};

function CustomerAvatar({ name }) {
    const initials = name?.split(" ").map((word) => word[0]).join("").slice(0, 2);

    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-[10px] font-bold">
            {initials || "CU"}
        </div>
    );
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [stats, setStats] = useState({
        total_customers: 0,
        active_customers: 0,
        new_customers: 0,
        average_customer_value: 0,
        banned_customers: 0,
    });

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [showFilter, setShowFilter] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState(1);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);

    const fetchCustomers = async (currentPage = 1) => {
        try {
            setLoading(true);
            setError("");

            const response = await adminApi.get(
                `customers/?page=${currentPage}`
            );

            const data = response.data;

            setCustomers(data.results || data.customers || []);

            setNextPage(data.next || null);
            setPreviousPage(data.previous || null);
        } catch (error) {
            console.error("Customer fetch error:", error);

            setError(
                error?.response?.data?.message ||
                "Unable to load customers."
            );

            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await adminApi.get(
                "customers/stats/"
            );

            setStats(response.data.stats || response.data);
        } catch (error) {
            console.error("Customer stats error:", error);
        }
    };

    useEffect(() => {
        fetchCustomers(page);
    }, [page]);

    useEffect(() => {
        fetchStats();
    }, []);

    const filteredCustomers = useMemo(() => {
        return customers.filter((customer) => {
            const fullName = `${customer.first_name || ""} ${
                customer.last_name || ""
            }`;

            const matchesSearch =
                fullName
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                customer.email
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||
                customer.phone_number
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||
                customer.username
                    ?.toLowerCase()
                    .includes(search.toLowerCase());

            let customerStatus = "Inactive";

            if (customer.is_banned) {
                customerStatus = "Banned";
            } else if (customer.is_active) {
                customerStatus = "Active";
            }

            const matchesStatus =
                status === "All" ||
                customerStatus === status;

            return matchesSearch && matchesStatus;
        });
    }, [customers, search, status]);

    const getCustomerName = (customer) => {
        const name = `${customer.first_name || ""} ${
            customer.last_name || ""
        }`.trim();

        return name || customer.username || customer.email;
    };

    const getCustomerStatus = (customer) => {
        if (customer.is_banned) {
            return "Banned";
        }

        if (customer.is_active) {
            return "Active";
        }

        return "Inactive";
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
        }).format(Number(amount || 0));
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString("en-NG", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const handleAction = async (action, customer) => {
        setOpenMenu(null);

        try {
            if (action === "view") {
                return;
            }

            if (action === "ban") {
                const reason = window.prompt(
                    "Enter the reason for banning this customer:"
                );

                if (!reason) {
                    return;
                }

                await adminApi.post(
                    `customers/${customer.id}/ban/`,
                    {
                        reason,
                    }
                );
            }

            if (action === "unban") {
                await adminApi.post(
                    `customers/${customer.id}/unban/`
                );
            }

            if (action === "activate") {
                await adminApi.post(
                    `customers/${customer.id}/activate/`
                );
            }

            if (action === "deactivate") {
                await adminApi.post(
                    `customers/${customer.id}/deactivate/`
                );
            }

            if (action === "logout") {
                await adminApi.post(
                    `customers/${customer.id}/force-logout/`
                );
            }

            await fetchCustomers(page);
            await fetchStats();
        } catch (error) {
            console.error("Customer action error:", error);

            alert(
                error?.response?.data?.message ||
                "Unable to perform this action."
            );
        }
    };

    return (
        <div
            className="px-5 py-7 sm:px-8 lg:px-10 lg:py-9"
            onClick={() => setOpenMenu(null)}
        >
            {/* Header */}
            <div className="mb-8">
                <div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
                    <span>Admin</span>
                    <span>/</span>
                    <span>Customers</span>
                </div>

                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                            Customers
                        </p>

                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Customer management
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            View and manage everyone shopping from your store.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-medium transition hover:bg-gray-50 sm:flex"
                        >
                            <FiDownload size={15} />
                            Export
                        </button>

                        <button
                            className="flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-xs font-semibold text-white transition hover:bg-gray-800"
                        >
                            <FiPlus size={16} />
                            Add customer
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                            Total customers
                        </p>

                        <FiUserPlus
                            size={15}
                            className="text-gray-300"
                        />
                    </div>

                    <p className="mt-2 text-xl font-bold">
                        {stats.total_customers || 0}
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                        All registered customers
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                    <p className="text-xs text-gray-400">
                        Active customers
                    </p>

                    <p className="mt-2 text-xl font-bold">
                        {stats.active_customers || 0}
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                        Currently active
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                    <p className="text-xs text-gray-400">
                        New customers
                    </p>

                    <p className="mt-2 text-xl font-bold">
                        {stats.new_customers || 0}
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                        This month
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                    <p className="text-xs text-gray-400">
                        Avg. customer value
                    </p>

                    <p className="mt-2 text-xl font-bold">
                        {formatMoney(stats.average_customer_value)}
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                        Lifetime value
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                    <p className="text-xs text-gray-400">
                        Banned customers
                    </p>

                    <p className="mt-2 text-xl font-bold">
                        {stats.banned_customers || 0}
                    </p>

                    <p className="mt-1 text-[10px] text-red-500">
                        Restricted accounts
                    </p>
                </div>
            </div>

            {/* Customer Table */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                {/* Toolbar */}
                <div className="border-b border-gray-100 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-md">
                            <FiSearch
                                size={16}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search customers..."
                                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-10 text-xs outline-none transition focus:border-black focus:bg-white"
                            />

                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                                >
                                    <FiX size={15} />
                                </button>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setShowFilter(!showFilter);
                                }}
                                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-medium hover:bg-gray-50"
                            >
                                <FiFilter size={15} />

                                Filter

                                {status !== "All" && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-black" />
                                )}

                                <FiChevronDown size={13} />
                            </button>

                            {showFilter && (
                                <div
                                    onClick={(event) =>
                                        event.stopPropagation()
                                    }
                                    className="absolute right-0 top-13 z-20 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-xl"
                                >
                                    <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                        Customer status
                                    </p>

                                    {[
                                        "All",
                                        "Active",
                                        "Inactive",
                                        "Banned",
                                    ].map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => {
                                                setStatus(item);
                                                setShowFilter(false);
                                            }}
                                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs ${
                                                status === item
                                                    ? "bg-black text-white"
                                                    : "text-gray-600 hover:bg-gray-100"
                                            }`}
                                        >
                                            {item}

                                            {status === item && (
                                                <span>✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {status !== "All" && (
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">
                                Active filter:
                            </span>

                            <button
                                onClick={() => setStatus("All")}
                                className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium"
                            >
                                {status}
                                <FiX size={11} />
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="px-5 py-20 text-center">
                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-black" />

                        <p className="mt-4 text-xs text-gray-400">
                            Loading customers...
                        </p>
                    </div>
                ) : error ? (
                    <div className="px-5 py-20 text-center">
                        <p className="text-sm font-semibold">
                            Unable to load customers
                        </p>

                        <p className="mt-1 text-xs text-red-400">
                            {error}
                        </p>

                        <button
                            onClick={() => fetchCustomers(page)}
                            className="mt-5 rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white"
                        >
                            Try again
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full min-w-237.5 text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            Customer
                                        </th>

                                        <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            Contact
                                        </th>

                                        <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            Orders
                                        </th>

                                        <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            Total spent
                                        </th>

                                        <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredCustomers.map((customer) => {
                                        const customerStatus =
                                            getCustomerStatus(customer);

                                        return (
                                            <tr
                                                key={customer.id}
                                                className="border-b border-gray-50 transition last:border-0 hover:bg-gray-50/70"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <CustomerAvatar
                                                            name={getCustomerName(
                                                                customer
                                                            )}
                                                        />

                                                        <div>
                                                            <Link
                                                                href={`/customers/${customer.id}`}
                                                                className="text-xs font-semibold hover:underline"
                                                            >
                                                                {getCustomerName(
                                                                    customer
                                                                )}
                                                            </Link>

                                                            <p className="mt-1 text-[10px] text-gray-400">
                                                                Joined{" "}
                                                                {formatDate(
                                                                    customer.date_joined
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <p className="text-xs text-gray-600">
                                                        {customer.email}
                                                    </p>

                                                    <p className="mt-1 text-[10px] text-gray-400">
                                                        {customer.phone_number ||
                                                            "No phone number"}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <FiShoppingBag
                                                            size={14}
                                                            className="text-gray-300"
                                                        />

                                                        <span className="text-xs font-semibold">
                                                            {customer.order_count ||
                                                                0}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <p className="text-xs font-bold">
                                                        {formatMoney(
                                                            customer.total_spent
                                                        )}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${
                                                            statusStyles[
                                                                customerStatus
                                                            ]
                                                        }`}
                                                    >
                                                        {customerStatus}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    <div
                                                        className="relative flex justify-end gap-1"
                                                        onClick={(event) =>
                                                            event.stopPropagation()
                                                        }
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                handleAction(
                                                                    "message",
                                                                    customer
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-black"
                                                        >
                                                            <FiMail
                                                                size={15}
                                                            />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                setOpenMenu(
                                                                    openMenu ===
                                                                        customer.id
                                                                        ? null
                                                                        : customer.id
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-black"
                                                        >
                                                            <FiMoreHorizontal
                                                                size={17}
                                                            />
                                                        </button>

                                                        {openMenu ===
                                                            customer.id && (
                                                            <div className="absolute right-0 top-10 z-30 w-48 rounded-xl border border-gray-200 bg-white p-2 text-left shadow-xl">
                                                                <Link
                                                                    href={`/admin/dashboard/customers/${customer.username}`}
                                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-100"
                                                                >
                                                                    <FiEye
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                    View customer
                                                                </Link>

                                                                {customer.is_banned ? (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleAction(
                                                                                "unban",
                                                                                customer
                                                                            )
                                                                        }
                                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-100"
                                                                    >
                                                                        <FiCheckCircle
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                        Unban
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleAction(
                                                                                "ban",
                                                                                customer
                                                                            )
                                                                        }
                                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-red-600 hover:bg-red-50"
                                                                    >
                                                                        <FiSlash
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                        Ban customer
                                                                    </button>
                                                                )}

                                                                {customer.is_active ? (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleAction(
                                                                                "deactivate",
                                                                                customer
                                                                            )
                                                                        }
                                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-100"
                                                                    >
                                                                        <FiPower
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                        Deactivate
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleAction(
                                                                                "activate",
                                                                                customer
                                                                            )
                                                                        }
                                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-emerald-600 hover:bg-emerald-50"
                                                                    >
                                                                        <FiCheckCircle
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                        Activate
                                                                    </button>
                                                                )}

                                                                <button
                                                                    onClick={() =>
                                                                        handleAction(
                                                                            "logout",
                                                                            customer
                                                                        )
                                                                    }
                                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-100"
                                                                >
                                                                    <FiPower
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                    Force logout
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Customers */}
                        <div className="divide-y divide-gray-100 md:hidden">
                            {filteredCustomers.map((customer) => {
                                const customerStatus =
                                    getCustomerStatus(customer);

                                return (
                                    <div
                                        key={customer.id}
                                        className="p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <CustomerAvatar
                                                    name={getCustomerName(
                                                        customer
                                                    )}
                                                />

                                                <div>
                                                    <Link
                                                        href={`/customers/${customer.id}`}
                                                        className="text-xs font-semibold hover:underline"
                                                    >
                                                        {getCustomerName(
                                                            customer
                                                        )}
                                                    </Link>

                                                    <p className="mt-1 text-[10px] text-gray-400">
                                                        {customer.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    setOpenMenu(
                                                        openMenu ===
                                                            customer.id
                                                            ? null
                                                            : customer.id
                                                    )
                                                }
                                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-black"
                                            >
                                                <FiMoreHorizontal size={17} />
                                            </button>
                                        </div>

                                        <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-3">
                                            <div>
                                                <p className="text-[9px] text-gray-400">
                                                    Orders
                                                </p>

                                                <p className="mt-1 text-xs font-bold">
                                                    {customer.order_count || 0}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[9px] text-gray-400">
                                                    Spent
                                                </p>

                                                <p className="mt-1 text-xs font-bold">
                                                    {formatMoney(
                                                        customer.total_spent
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[9px] text-gray-400">
                                                    Status
                                                </p>

                                                <span
                                                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                                                        statusStyles[
                                                            customerStatus
                                                        ]
                                                    }`}
                                                >
                                                    {customerStatus}
                                                </span>
                                            </div>
                                        </div>

                                        {openMenu === customer.id && (
                                            <div className="mt-3 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
                                                <Link
                                                    href={`/customers/${customer.id}`}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-100"
                                                >
                                                    <FiEye size={14} />
                                                    View customer
                                                </Link>

                                                {customer.is_banned ? (
                                                    <button
                                                        onClick={() =>
                                                            handleAction(
                                                                "unban",
                                                                customer
                                                            )
                                                        }
                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-100"
                                                    >
                                                        <FiCheckCircle
                                                            size={14}
                                                        />
                                                        Unban customer
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            handleAction(
                                                                "ban",
                                                                customer
                                                            )
                                                        }
                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-red-600 hover:bg-red-50"
                                                    >
                                                        <FiSlash size={14} />
                                                        Ban customer
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() =>
                                                        handleAction(
                                                            customer.is_active
                                                                ? "deactivate"
                                                                : "activate",
                                                            customer
                                                        )
                                                    }
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-100"
                                                >
                                                    <FiPower size={14} />
                                                    {customer.is_active
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleAction(
                                                            "logout",
                                                            customer
                                                        )
                                                    }
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-100"
                                                >
                                                    <FiPower size={14} />
                                                    Force logout
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {filteredCustomers.length === 0 && (
                                <div className="px-5 py-16 text-center">
                                    <p className="text-sm font-semibold">
                                        No customers found
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        Try changing your search or filter.
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {!loading && !error && (
                    <div className="flex flex-col justify-between gap-3 border-t border-gray-100 p-4 sm:flex-row sm:items-center sm:px-5">
                        <p className="text-[10px] text-gray-400">
                            Showing{" "}
                            <span className="font-semibold text-gray-600">
                                {filteredCustomers.length}
                            </span>{" "}
                            customers
                        </p>

                        <div className="flex items-center gap-1">
                            <button
                                disabled={!previousPage}
                                onClick={() => {
                                    if (previousPage) {
                                        setPage((current) =>
                                            Math.max(current - 1, 1)
                                        );
                                    }
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiChevronLeft size={14} />
                            </button>

                            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-xs font-semibold text-white">
                                {page}
                            </button>

                            <button
                                disabled={!nextPage}
                                onClick={() => {
                                    if (nextPage) {
                                        setPage((current) => current + 1);
                                    }
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <p className="py-8 text-center text-[10px] text-gray-400">
                © {new Date().getFullYear()} Temmy Collection · Admin Dashboard
            </p>
        </div>
    );
}