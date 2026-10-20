"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import Dashboard from "../../../Components/Dashboard";
import { useNotifications } from "../../../hook/notifications";
import api from "../../../api/api";

import {
    FiBell,
    FiPackage,
    FiCreditCard,
    FiInfo,
    FiChevronRight,
    FiX,
    FiSearch,
    FiArrowUpRight,
    FiClock,
    FiInbox,
    FiCheckCircle,
    FiExternalLink,
} from "react-icons/fi";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const FILTERS = [
    { label: "All", value: "all" },
    { label: "Orders", value: "order" },
    { label: "Payments", value: "payment" },
    { label: "General", value: "system" },
];

const CATEGORY_CONFIG = {
    order: {
        label: "Order",
        icon: FiPackage,
        iconClass: "bg-blue-50 text-blue-600",
        badgeClass: "bg-blue-50 text-blue-700",
        dotClass: "bg-blue-500",
    },
    payment: {
        label: "Payment",
        icon: FiCreditCard,
        iconClass: "bg-emerald-50 text-emerald-600",
        badgeClass: "bg-emerald-50 text-emerald-700",
        dotClass: "bg-emerald-500",
    },
    system: {
        label: "General",
        icon: FiInfo,
        iconClass: "bg-violet-50 text-violet-600",
        badgeClass: "bg-violet-50 text-violet-700",
        dotClass: "bg-violet-500",
    },
};

function getCategory(item) {
    const category = String(item?.category || "system").toLowerCase();

    return CATEGORY_CONFIG[category] ? category : "system";
}

function formatDate(date) {
    if (!date) return "Recently";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "Recently";

    return parsed.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatTime(date) {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "";

    return parsed.toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatRelativeTime(date) {
    if (!date) return "Just now";

    const timestamp = new Date(date).getTime();

    if (Number.isNaN(timestamp)) return "Recently";

    const difference = Math.max(0, Date.now() - timestamp);
    const minutes = Math.floor(difference / 60000);
    const hours = Math.floor(difference / 3600000);
    const days = Math.floor(difference / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return formatDate(date);
}

function getDateGroup(date) {
    if (!date) return "Earlier";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "Earlier";

    const today = new Date();

    const isToday =
        parsed.getDate() === today.getDate() &&
        parsed.getMonth() === today.getMonth() &&
        parsed.getFullYear() === today.getFullYear();

    if (isToday) return "Today";

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isYesterday =
        parsed.getDate() === yesterday.getDate() &&
        parsed.getMonth() === yesterday.getMonth() &&
        parsed.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return "Yesterday";

    return formatDate(date);
}

export default function InboxPage() {
    const [initialNotifications, setInitialNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [activeFilter, setActiveFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [selectedNotification, setSelectedNotification] =
        useState(null);

    useEffect(() => {
        let mounted = true;

        async function initializeInbox() {
            try {
                await api.post(
                    `${API_BASE_URL}/api/a/isauthenticated/`
                );

                if (!mounted) return;

                setIsAuthenticated(true);

                const response = await api.get(
                    `${API_BASE_URL}/api/notifications/customer/`
                );

                if (!mounted) return;

                const data = response.data;

                setInitialNotifications(
                    Array.isArray(data)
                        ? data
                        : Array.isArray(data?.results)
                          ? data.results
                          : []
                );
            } catch (error) {
                if (!mounted) return;

                console.error(
                    "Failed to load customer notifications:",
                    error
                );

                setIsAuthenticated(false);
                setInitialNotifications([]);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        initializeInbox();

        return () => {
            mounted = false;
        };
    }, []);

    // The hook remains the source of truth for initial and live notifications.
    const { notifications } = useNotifications(
        isAuthenticated,
        initialNotifications
    );

    const notificationList = Array.isArray(notifications)
        ? notifications
        : [];

    const unreadCount = notificationList.filter(
        (item) => !item.is_read
    ).length;

    const categoryCounts = useMemo(() => {
        const counts = {
            all: notificationList.length,
            order: 0,
            payment: 0,
            system: 0,
        };

        notificationList.forEach((item) => {
            counts[getCategory(item)] += 1;
        });

        return counts;
    }, [notificationList]);

    const filteredNotifications = useMemo(() => {
        const query = search.trim().toLowerCase();

        return notificationList.filter((item) => {
            const matchesCategory =
                activeFilter === "all" ||
                getCategory(item) === activeFilter;

            const searchableText = [
                item.title,
                item.message,
                item.category,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return (
                matchesCategory &&
                (!query || searchableText.includes(query))
            );
        });
    }, [notificationList, activeFilter, search]);

    const groupedNotifications = useMemo(() => {
        const groups = new Map();

        filteredNotifications.forEach((item) => {
            const label = getDateGroup(item.created_at);

            if (!groups.has(label)) {
                groups.set(label, []);
            }

            groups.get(label).push(item);
        });

        return Array.from(groups.entries());
    }, [filteredNotifications]);

    const closeModal = useCallback(() => {
        setSelectedNotification(null);
    }, []);

    useEffect(() => {
        if (!selectedNotification) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                closeModal();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedNotification, closeModal]);

    const openNotification = (item) => {
        setSelectedNotification(item);
    };

    const openNotificationLink = () => {
        const link = selectedNotification?.link;

        closeModal();

        if (
            typeof link === "string" &&
            link.startsWith("/") &&
            !link.startsWith("//")
        ) {
            window.location.assign(link);
        }
    };

    const renderNotification = (item) => {
        const category = getCategory(item);
        const config = CATEGORY_CONFIG[category];
        const Icon = config.icon;

        return (
            <button
                type="button"
                key={item.id}
                onClick={() => openNotification(item)}
                className={`group relative flex w-full items-start gap-4 border-b border-gray-100 px-4 py-5 text-left transition duration-200 last:border-b-0 hover:bg-gray-50 sm:px-6 ${
                    !item.is_read ? "bg-blue-50/30" : "bg-white"
                }`}
            >
                {!item.is_read && (
                    <span className="absolute bottom-0 left-0 top-0 w-[3px] bg-blue-500" />
                )}

                <div
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${config.iconClass}`}
                >
                    <Icon size={21} />

                    {!item.is_read && (
                        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-500" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3
                            className={`text-sm text-gray-900 ${
                                item.is_read
                                    ? "font-semibold"
                                    : "font-bold"
                            }`}
                        >
                            {item.title || "Notification"}
                        </h3>

                        <span
                            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${config.badgeClass}`}
                        >
                            {config.label}
                        </span>
                    </div>

                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-gray-500">
                        {item.message ||
                            "You have a new notification."}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1">
                            <FiClock size={12} />
                            {formatRelativeTime(item.created_at)}
                        </span>

                        {!item.is_read && (
                            <span className="font-semibold text-blue-600">
                                Unread
                            </span>
                        )}
                    </div>
                </div>

                <FiChevronRight
                    size={18}
                    className="mt-3 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-600"
                />
            </button>
        );
    };

    return (
        <>
            <section className="min-h-screen w-full bg-[#fafafa] px-4 pb-12 pt-28 sm:px-6 lg:px-10 lg:pt-24">
                <div className="mx-auto flex max-w-[1440px] items-start gap-8">
                    <Dashboard
                        custom="inbox"
                        display="hidden"
                    />

                    <main className="min-w-0 flex-1">
                        {/* Page heading */}
                        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                            <div>
                                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                                    <FiBell size={14} />
                                    Customer centre
                                </div>

                                <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                                    Notifications
                                </h1>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                                    Keep up with your orders, payment
                                    confirmations and important
                                    TemmyCollection updates.
                                </p>
                            </div>

                            {unreadCount > 0 && (
                                <div className="flex w-fit items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                                    <span className="text-sm font-semibold text-blue-700">
                                        {unreadCount} unread
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Statistics */}
                        <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-500">
                                        Total
                                    </span>
                                    <FiBell
                                        size={17}
                                        className="text-gray-400"
                                    />
                                </div>

                                <p className="mt-4 text-2xl font-bold text-gray-950">
                                    {categoryCounts.all}
                                </p>

                                <p className="mt-1 text-[11px] text-gray-400">
                                    Notifications
                                </p>
                            </div>

                            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-500">
                                        Orders
                                    </span>
                                    <FiPackage
                                        size={17}
                                        className="text-blue-500"
                                    />
                                </div>

                                <p className="mt-4 text-2xl font-bold text-gray-950">
                                    {categoryCounts.order}
                                </p>

                                <p className="mt-1 text-[11px] text-gray-400">
                                    Order updates
                                </p>
                            </div>

                            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-500">
                                        Payments
                                    </span>
                                    <FiCreditCard
                                        size={17}
                                        className="text-emerald-500"
                                    />
                                </div>

                                <p className="mt-4 text-2xl font-bold text-gray-950">
                                    {categoryCounts.payment}
                                </p>

                                <p className="mt-1 text-[11px] text-gray-400">
                                    Payment updates
                                </p>
                            </div>

                            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-500">
                                        General
                                    </span>
                                    <FiInfo
                                        size={17}
                                        className="text-violet-500"
                                    />
                                </div>

                                <p className="mt-4 text-2xl font-bold text-gray-950">
                                    {categoryCounts.system}
                                </p>

                                <p className="mt-1 text-[11px] text-gray-400">
                                    Account updates
                                </p>
                            </div>
                        </div>

                        {/* Notifications inbox */}
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm shadow-gray-200/30">
                            <div className="border-b border-gray-100 p-4 sm:p-6">
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                    <div>
                                        <h2 className="text-base font-bold text-gray-950">
                                            Your inbox
                                        </h2>

                                        <p className="mt-1 text-xs text-gray-400">
                                            {loading
                                                ? "Getting your latest updates..."
                                                : `${filteredNotifications.length} ${
                                                      filteredNotifications.length === 1
                                                          ? "notification"
                                                          : "notifications"
                                                  }`}
                                        </p>
                                    </div>

                                    <div className="relative w-full sm:max-w-[270px]">
                                        <FiSearch
                                            size={17}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                                        />

                                        <input
                                            type="search"
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                            placeholder="Search notifications..."
                                            aria-label="Search notifications"
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100"
                                        />
                                    </div>
                                </div>

                                <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                                    {FILTERS.map((filter) => {
                                        const isActive =
                                            activeFilter === filter.value;

                                        return (
                                            <button
                                                key={filter.value}
                                                type="button"
                                                onClick={() =>
                                                    setActiveFilter(
                                                        filter.value
                                                    )
                                                }
                                                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                                                    isActive
                                                        ? "bg-gray-950 text-white"
                                                        : "border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                                }`}
                                            >
                                                {filter.label}

                                                <span
                                                    className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                                                        isActive
                                                            ? "bg-white/15 text-white"
                                                            : "bg-gray-100 text-gray-500"
                                                    }`}
                                                >
                                                    {
                                                        categoryCounts[
                                                            filter.value
                                                        ]
                                                    }
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex min-h-[300px] flex-col items-center justify-center">
                                    <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-gray-200 border-t-gray-950" />

                                    <p className="mt-4 text-sm text-gray-400">
                                        Loading your notifications...
                                    </p>
                                </div>
                            ) : !isAuthenticated ? (
                                <div className="flex min-h-[300px] flex-col items-center justify-center px-5 py-14 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                                        <FiInbox
                                            size={26}
                                            className="text-gray-400"
                                        />
                                    </div>

                                    <h3 className="mt-5 text-base font-bold text-gray-900">
                                        Sign in to view notifications
                                    </h3>

                                    <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
                                        Please sign in to access your
                                        order updates and account
                                        notifications.
                                    </p>
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="flex min-h-[300px] flex-col items-center justify-center px-5 py-16 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                                        <FiBell
                                            size={27}
                                            className="text-gray-400"
                                        />
                                    </div>

                                    <h3 className="mt-5 text-base font-bold text-gray-900">
                                        {search
                                            ? "No matching notifications"
                                            : activeFilter !== "all"
                                              ? "Nothing here yet"
                                              : "Your inbox is empty"}
                                    </h3>

                                    <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
                                        {search
                                            ? "Try another keyword to find what you're looking for."
                                            : "Your order updates, payment confirmations and important announcements will appear here."}
                                    </p>

                                    {(search ||
                                        activeFilter !== "all") && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearch("");
                                                setActiveFilter("all");
                                            }}
                                            className="mt-5 rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-gray-800"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {groupedNotifications.map(
                                        ([dateLabel, items]) => (
                                            <section key={dateLabel}>
                                                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 sm:px-6">
                                                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                                                        {dateLabel}
                                                    </p>
                                                </div>

                                                {items.map(
                                                    renderNotification
                                                )}
                                            </section>
                                        )
                                    )}
                                </div>
                            )}

                            {!loading &&
                                isAuthenticated &&
                                notificationList.length > 0 && (
                                    <div className="flex items-center justify-center gap-2 border-t border-gray-100 bg-gray-50/70 px-4 py-4 text-[11px] text-gray-400">
                                        <FiCheckCircle size={14} />
                                        Showing your loaded notifications
                                    </div>
                                )}
                        </div>
                    </main>
                </div>
            </section>

            {/* Notification details */}
            {selectedNotification && (
                <div
                    className="fixed inset-0 z-[700] flex items-center justify-center bg-gray-950/45 p-4 backdrop-blur-[3px]"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="notification-detail-title"
                        className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl"
                    >
                        {(() => {
                            const config =
                                CATEGORY_CONFIG[
                                    getCategory(selectedNotification)
                                ];

                            const Icon = config.icon;

                            return (
                                <>
                                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 sm:px-6">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${config.iconClass}`}
                                            >
                                                <Icon size={22} />
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold text-gray-400">
                                                    Notification details
                                                </p>

                                                <span
                                                    className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${config.badgeClass}`}
                                                >
                                                    {config.label}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            aria-label="Close notification"
                                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-gray-200"
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>

                                    <div className="px-5 py-7 sm:px-6">
                                        <h2
                                            id="notification-detail-title"
                                            className="break-words text-xl font-bold leading-7 tracking-tight text-gray-950"
                                        >
                                            {selectedNotification.title ||
                                                "Notification"}
                                        </h2>

                                        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-gray-600">
                                            {selectedNotification.message ||
                                                "No message available."}
                                        </p>

                                        <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <FiClock
                                                    size={16}
                                                    className="mt-0.5 text-gray-400"
                                                />

                                                <div>
                                                    <p className="text-xs font-semibold text-gray-700">
                                                        Date and time
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {formatDate(
                                                            selectedNotification.created_at
                                                        )}

                                                        {formatTime(
                                                            selectedNotification.created_at
                                                        ) &&
                                                            ` at ${formatTime(
                                                                selectedNotification.created_at
                                                            )}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/80 px-5 py-4 sm:flex-row sm:justify-between sm:px-6">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                                        >
                                            Close
                                        </button>

                                        {typeof selectedNotification.link ===
                                            "string" &&
                                            selectedNotification.link.startsWith(
                                                "/"
                                            ) &&
                                            !selectedNotification.link.startsWith(
                                                "//"
                                            ) && (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        openNotificationLink
                                                    }
                                                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                                                >
                                                    {selectedNotification.link ===
                                                    "/"
                                                        ? "Visit store"
                                                        : "View details"}

                                                    {selectedNotification.link ===
                                                    "/" ? (
                                                        <FiExternalLink
                                                            size={16}
                                                        />
                                                    ) : (
                                                        <FiArrowUpRight
                                                            size={16}
                                                        />
                                                    )}
                                                </button>
                                            )}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}
        </>
    );
}
