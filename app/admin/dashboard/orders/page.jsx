"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    FiCalendar,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiClock,
    FiDownload,
    FiEye,
    FiFilter,
    FiMoreHorizontal,
    FiPackage,
    FiSearch,
    FiTruck,
    FiUser,
} from "react-icons/fi";

import adminApi from "../../../api/adminApi";


const ORDER_STATUSES = [
    "All",
    "Successful",
    "Processing",
    "Shipped",
    "Delivered",
    "Pending",
    "Cancelled",
];


function getStatusClass(status) {
    switch (status) {
        case "Successful":
            return "bg-blue-50 text-blue-700";

        case "Processing":
            return "bg-amber-50 text-amber-700";

        case "Shipped":
            return "bg-purple-50 text-purple-700";

        case "Delivered":
            return "bg-emerald-50 text-emerald-700";

        case "Pending":
            return "bg-gray-100 text-gray-700";

        case "Cancelled":
            return "bg-red-50 text-red-700";

        default:
            return "bg-gray-100 text-gray-600";
    }
}


function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                status
            )}`}
        >
            {status || "Unknown"}
        </span>
    );
}


function getPaymentClass(status) {
    const value = String(status || "").toLowerCase();

    if (
        value === "successful" ||
        value === "success" ||
        value === "paid"
    ) {
        return "text-emerald-600";
    }

    if (
        value === "failed" ||
        value === "cancelled"
    ) {
        return "text-red-600";
    }

    return "text-amber-600";
}


function getPaymentLabel(status) {
    if (!status) return "Pending";

    const value = String(status).toLowerCase();

    if (value === "successful" || value === "success") {
        return "Successful";
    }

    if (value === "failed") {
        return "Failed";
    }

    if (value === "cancelled") {
        return "Cancelled";
    }

    return status;
}


function getCustomerName(user) {
    if (!user) return "Unknown customer";

    const fullName = [
        user.first_name,
        user.last_name,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return (
        fullName ||
        user.username ||
        user.email ||
        "Unknown customer"
    );
}


function getInitials(user) {
    const name = getCustomerName(user);

    const words = name
        .split(" ")
        .filter(Boolean);

    if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
}


function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}


function formatMoney(value, currency = "NGN") {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(amount);
}


function getItemCount(order) {
    return (order.items || []).reduce(
        (total, item) =>
            total + Number(item.quantity || 0),
        0
    );
}


function getProductSummary(order) {
    const items = order.items || [];

    if (!items.length) {
        return {
            name: "No products",
            extra: "",
            image: null,
        };
    }

    const firstItem = items[0];

    const productName =
        firstItem?.product?.name ||
        "Unknown product";

    return {
        name: productName,
        extra:
            items.length > 1
                ? `+ ${items.length - 1} more ${
                      items.length - 1 === 1
                          ? "item"
                          : "items"
                  }`
                : "",
        image:
            firstItem?.product?.image ||
            firstItem?.product?.images?.[0] ||
            null,
    };
}


function CustomerAvatar({ user }) {
    const image =
        user?.image ||
        user?.profile_image ||
        null;

    if (image) {
        return (
            <img
                src={image}
                alt={getCustomerName(user)}
                className="h-9 w-9 rounded-full object-cover"
            />
        );
    }

    return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
            {getInitials(user)}
        </div>
    );
}


function SummaryCard({
    title,
    value,
    icon,
    description,
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-500">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {value}
                    </p>

                    {description && (
                        <p className="mt-1 text-xs text-gray-400">
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                    {icon}
                </div>
            </div>
        </div>
    );
}


function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <FiPackage size={22} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-900">
                No orders found
            </h3>

            <p className="mt-1 max-w-sm text-xs text-gray-500">
                There are no orders matching your current search or
                filter.
            </p>
        </div>
    );
}


function LoadingRows() {
    return (
        <>
            {Array.from({ length: 8 }).map((_, index) => (
                <tr key={index}>
                    <td colSpan="7" className="px-5 py-4">
                        <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
                    </td>
                </tr>
            ))}
        </>
    );
}


export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [orderstat, setOrderstat] = useState(null);

    const [loading, setLoading] = useState(true);
    const [loadingStat, setLoadingStat] = useState(true);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [showFilter, setShowFilter] = useState(false);

    const [page, setPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);

    const [openAction, setOpenAction] = useState(null);

    const actionRef = useRef(null);


    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                actionRef.current &&
                !actionRef.current.contains(event.target)
            ) {
                setOpenAction(null);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);


    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoadingStat(true);

                const response = await adminApi.get(
                    "orderstat/"
                );

                setOrderstat(response.data);
            } catch (error) {
                console.error(
                    "Failed to load order statistics:",
                    error
                );
            } finally {
                setLoadingStat(false);
            }
        };

        fetchStats();
    }, []);


    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);

                const response = await adminApi.get(
                    `orders/?page=${page}`
                );

                const data = response.data;

                setOrders(data.results || []);
                setTotalOrders(data.count || 0);
                setTotalPages(
                    data.total_pages ||
                        Math.ceil(
                            (data.count || 0) / 8
                        ) ||
                        1
                );

                setNextPage(data.next);
                setPreviousPage(data.previous);
            } catch (error) {
                console.error(
                    "Failed to load orders:",
                    error
                );

                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [page]);


    const filteredOrders = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        return orders.filter((order) => {
            const customerName =
                getCustomerName(order.user);

            const customerEmail =
                order.user?.email || "";

            const orderNumber =
                order.order_number || "";

            const matchesSearch =
                !query ||
                String(orderNumber)
                    .toLowerCase()
                    .includes(query) ||
                customerName
                    .toLowerCase()
                    .includes(query) ||
                customerEmail
                    .toLowerCase()
                    .includes(query);

            const matchesStatus =
                status === "All" ||
                order.status === status;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [orders, search, status]);


    const handleStatusChange = (value) => {
        setStatus(value);
        setShowFilter(false);
        setPage(1);
    };


    const goToPage = (newPage) => {
        if (
            newPage < 1 ||
            newPage > totalPages ||
            newPage === page
        ) {
            return;
        }

        setPage(newPage);
        setOpenAction(null);
    };


    const paginationPages = useMemo(() => {
        if (totalPages <= 7) {
            return Array.from(
                { length: totalPages },
                (_, index) => index + 1
            );
        }

        if (page <= 4) {
            return [1, 2, 3, 4, 5, "...", totalPages];
        }

        if (page >= totalPages - 3) {
            return [
                1,
                "...",
                totalPages - 4,
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }

        return [
            1,
            "...",
            page - 1,
            page,
            page + 1,
            "...",
            totalPages,
        ];
    }, [page, totalPages]);


    const handleExport = () => {
        const rows = filteredOrders.map(
            (order) => ({
                order_number:
                    order.order_number,
                customer:
                    getCustomerName(order.user),
                email:
                    order.user?.email || "",
                items:
                    getItemCount(order),
                total:
                    order.total_price || 0,
                payment_status:
                    getPaymentLabel(
                        order.payment?.status
                    ),
                order_status:
                    order.status || "",
                delivery_method:
                    order.delivery_method || "",
                created_at:
                    order.created_at || "",
            })
        );

        if (!rows.length) {
            return;
        }

        const headers = Object.keys(rows[0]);

        const csv = [
            headers.join(","),
            ...rows.map((row) =>
                headers
                    .map((header) => {
                        const value =
                            row[header] ?? "";

                        return `"${String(value).replace(
                            /"/g,
                            '""'
                        )}"`;
                    })
                    .join(",")
            ),
        ].join("\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url =
            window.URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download = `orders-page-${page}.csv`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
    };


    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">

            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Orders
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage customer orders, payments and
                        fulfillment.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">

                    <button
                        onClick={handleExport}
                        disabled={
                            filteredOrders.length === 0
                        }
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <FiDownload />
                        Export
                    </button>

                </div>
            </div>


            {/* Summary */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <SummaryCard
                    title="Total orders"
                    value={
                        loadingStat
                            ? "—"
                            : orderstat?.total_orders ??
                              0
                    }
                    icon={
                        <FiPackage size={18} />
                    }
                />

                <SummaryCard
                    title="Completed"
                    value={
                        loadingStat
                            ? "—"
                            : orderstat?.successful_orders ??
                              0
                    }
                    icon={
                        <FiPackage size={18} />
                    }
                    description="Delivered orders"
                />

                <SummaryCard
                    title="Processing"
                    value={
                        loadingStat
                            ? "—"
                            : orderstat?.processing_orders ??
                              0
                    }
                    icon={
                        <FiTruck size={18} />
                    }
                    description="Processing and shipped"
                />

                <SummaryCard
                    title="Pending"
                    value={
                        loadingStat
                            ? "—"
                            : orderstat?.pending_orders ??
                              0
                    }
                    icon={
                        <FiClock size={18} />
                    }
                    description="Awaiting processing"
                />

            </div>


            {/* Toolbar */}
            <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                    <div className="relative w-full lg:max-w-md">

                        <FiSearch
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={17}
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search order number, customer or email..."
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-black focus:bg-white"
                        />

                    </div>


                    <div className="relative flex gap-2">

                        <button
                            onClick={() =>
                                setShowFilter(
                                    (value) =>
                                        !value
                                )
                            }
                            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <FiFilter />

                            {status === "All"
                                ? "Filter"
                                : status}

                            <FiChevronDown
                                className={`transition ${
                                    showFilter
                                        ? "rotate-180"
                                        : ""
                                }`}
                            />
                        </button>


                        {showFilter && (
                            <div className="absolute right-0 top-12 z-30 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-xl">

                                {ORDER_STATUSES.map(
                                    (item) => (
                                        <button
                                            key={item}
                                            onClick={() =>
                                                handleStatusChange(
                                                    item
                                                )
                                            }
                                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-gray-50 ${
                                                status ===
                                                item
                                                    ? "bg-gray-50 font-medium text-black"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            <span>
                                                {item}
                                            </span>

                                            {status ===
                                                item && (
                                                <span className="text-xs">
                                                    ✓
                                                </span>
                                            )}
                                        </button>
                                    )
                                )}

                            </div>
                        )}


                        <button
                            className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex"
                        >
                            <FiCalendar />
                            Date
                        </button>

                    </div>

                </div>
            </div>


            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1050px]">

                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70">

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Order
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Customer
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Products
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Amount
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Payment
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Status
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Action
                                </th>

                            </tr>
                        </thead>


                        <tbody className="divide-y divide-gray-100">

                            {loading ? (
                                <LoadingRows />
                            ) : filteredOrders.length ===
                              0 ? (
                                <tr>
                                    <td colSpan="7">
                                        <EmptyState />
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(
                                    (order) => {
                                        const product =
                                            getProductSummary(
                                                order
                                            );

                                        const itemCount =
                                            getItemCount(
                                                order
                                            );

                                        const paymentStatus =
                                            getPaymentLabel(
                                                order
                                                    .payment
                                                    ?.status
                                            );

                                        return (
                                            <tr
                                                key={
                                                    order.order_number
                                                }
                                                className="group transition hover:bg-gray-50/70"
                                            >

                                                {/* Order */}
                                                <td className="px-5 py-4">

                                                    <Link
                                                        href={`/admin/dashboard/orders/${order.order_number}`}
                                                        className="font-semibold text-gray-900 hover:underline"
                                                    >
                                                        #
                                                        {String(
                                                            order.order_number
                                                        ).slice(
                                                            0,
                                                            10
                                                        )}
                                                    </Link>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {formatDate(
                                                            order.created_at
                                                        )}
                                                    </p>

                                                </td>


                                                {/* Customer */}
                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <CustomerAvatar
                                                            user={
                                                                order.user
                                                            }
                                                        />

                                                        <div className="min-w-0">

                                                            <p className="truncate text-sm font-medium text-gray-900">
                                                                {getCustomerName(
                                                                    order.user
                                                                )}
                                                            </p>

                                                            <p className="max-w-[180px] truncate text-xs text-gray-400">
                                                                {order
                                                                    .user
                                                                    ?.email ||
                                                                    "—"}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* Products */}
                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gray-100">

                                                            {product.image ? (
                                                                <img
                                                                    src={
                                                                        product.image
                                                                    }
                                                                    alt={
                                                                        product.name
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full items-center justify-center text-gray-400">
                                                                    <FiPackage />
                                                                </div>
                                                            )}

                                                        </div>


                                                        <div className="min-w-0">

                                                            <p className="max-w-[210px] truncate text-sm font-medium text-gray-900">
                                                                {
                                                                    product.name
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-400">
                                                                {itemCount}{" "}
                                                                {itemCount ===
                                                                1
                                                                    ? "item"
                                                                    : "items"}

                                                                {product.extra && (
                                                                    <>
                                                                        {" "}
                                                                        •{" "}
                                                                        {
                                                                            product.extra
                                                                        }
                                                                    </>
                                                                )}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* Amount */}
                                                <td className="px-5 py-4">

                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {formatMoney(
                                                            order.total_price
                                                        )}
                                                    </p>

                                                    {Number(
                                                        order
                                                            .coupon_discount ||
                                                            0
                                                    ) > 0 && (
                                                        <p className="mt-1 text-xs text-emerald-600">
                                                            Coupon −
                                                            {formatMoney(
                                                                order.coupon_discount
                                                            )}
                                                        </p>
                                                    )}

                                                </td>


                                                {/* Payment */}
                                                <td className="px-5 py-4">

                                                    <p
                                                        className={`text-sm font-medium ${getPaymentClass(
                                                            order
                                                                .payment
                                                                ?.status
                                                        )}`}
                                                    >
                                                        {
                                                            paymentStatus
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {order
                                                            .payment
                                                            ?.payment_method ||
                                                            "—"}
                                                    </p>

                                                </td>


                                                {/* Status */}
                                                <td className="px-5 py-4">

                                                    <StatusBadge
                                                        status={
                                                            order.status
                                                        }
                                                    />

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {order.delivery_method ===
                                                        "pickup"
                                                            ? "Pickup"
                                                            : "Home delivery"}
                                                    </p>

                                                </td>


                                                {/* Action */}
                                                <td className="px-5 py-4">

                                                    <div
                                                        className="relative"
                                                        ref={
                                                            openAction ===
                                                            order.order_number
                                                                ? actionRef
                                                                : null
                                                        }
                                                    >

                                                        <button
                                                            onClick={() =>
                                                                setOpenAction(
                                                                    openAction ===
                                                                        order.order_number
                                                                        ? null
                                                                        : order.order_number
                                                                )
                                                            }
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-black"
                                                        >
                                                            <FiMoreHorizontal />
                                                        </button>


                                                        {openAction ===
                                                            order.order_number && (
                                                            <div className="absolute right-0 top-10 z-40 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-xl">

                                                                <Link
                                                                    href={`/admin/dashboard/orders/${order.order_number}`}
                                                                    onClick={() =>
                                                                        setOpenAction(
                                                                            null
                                                                        )
                                                                    }
                                                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                                                >
                                                                    <FiEye />
                                                                    View order
                                                                </Link>


                                                                {order
                                                                    .shipment && (
                                                                    <Link
                                                                        href={`/admin/dashboard/orders/${order.order_number}`}
                                                                        onClick={() =>
                                                                            setOpenAction(
                                                                                null
                                                                            )
                                                                        }
                                                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                                                    >
                                                                        <FiTruck />
                                                                        Track shipment
                                                                    </Link>
                                                                )}


                                                                <Link
                                                                    href={`/admin/dashboard/orders/${order.order_number}`}
                                                                    onClick={() =>
                                                                        setOpenAction(
                                                                            null
                                                                        )
                                                                    }
                                                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                                                >
                                                                    <FiPackage />
                                                                    Manage order
                                                                </Link>

                                                            </div>
                                                        )}

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )
                            )}

                        </tbody>

                    </table>

                </div>


                {/* Footer */}
                {!loading &&
                    filteredOrders.length > 0 && (
                        <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                            <p className="text-xs text-gray-500">
                                Showing{" "}
                                <span className="font-medium text-gray-700">
                                    {(page - 1) * 8 + 1}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium text-gray-700">
                                    {Math.min(
                                        page * 8,
                                        totalOrders
                                    )}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-gray-700">
                                    {totalOrders}
                                </span>{" "}
                                orders
                            </p>


                            <div className="flex items-center gap-1">

                                <button
                                    onClick={() =>
                                        goToPage(
                                            page - 1
                                        )
                                    }
                                    disabled={
                                        !previousPage
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <FiChevronLeft />
                                </button>


                                {paginationPages.map(
                                    (
                                        pageNumber,
                                        index
                                    ) =>
                                        pageNumber ===
                                        "..." ? (
                                            <span
                                                key={`dots-${index}`}
                                                className="flex h-9 w-9 items-center justify-center text-xs text-gray-400"
                                            >
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={
                                                    pageNumber
                                                }
                                                onClick={() =>
                                                    goToPage(
                                                        pageNumber
                                                    )
                                                }
                                                className={`h-9 min-w-9 rounded-lg px-2 text-xs font-medium transition ${
                                                    page ===
                                                    pageNumber
                                                        ? "bg-black text-white"
                                                        : "text-gray-600 hover:bg-gray-100"
                                                }`}
                                            >
                                                {
                                                    pageNumber
                                                }
                                            </button>
                                        )
                                )}


                                <button
                                    onClick={() =>
                                        goToPage(
                                            page + 1
                                        )
                                    }
                                    disabled={
                                        !nextPage
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <FiChevronRight />
                                </button>

                            </div>

                        </div>
                    )}

            </div>

        </div>
    );
}