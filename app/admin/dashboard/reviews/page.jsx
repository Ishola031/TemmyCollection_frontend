
"use client";

import React, { useCallback, useEffect, useState } from "react";
import adminApi from "../../../api/adminApi";
import {
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiFilter,
    FiMoreHorizontal,
    FiSearch,
    FiStar,
    FiX,
    FiRefreshCw,
    FiMessageSquare,
    FiTrendingUp,
    FiEye,
    FiEyeOff,
    FiCheck,
    FiAlertCircle,
} from "react-icons/fi";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const PAGE_SIZE = 10;

const statusStyles = {
    Published: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    Hidden: "bg-gray-100 text-gray-600 ring-gray-200",
};

function Rating({ rating = 0, size = 13 }) {
    return (
        <div
            className="flex items-center gap-0.5"
            aria-label={`${rating} out of 5 stars`}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                    key={star}
                    size={size}
                    className={
                        star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                    }
                />
            ))}
        </div>
    );
}

function Avatar({ name }) {
    const initials = (name || "Customer")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">
            {initials || "C"}
        </div>
    );
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

function getErrorMessage(error) {
    const data = error?.response?.data;

    if (typeof data?.detail === "string") return data.detail;
    if (typeof data?.message === "string") return data.message;

    if (error?.response?.status === 401) {
        return "Your admin session may have expired. Please sign in again.";
    }

    if (error?.response?.status === 403) {
        return "You do not have permission to manage reviews.";
    }

    if (!error?.response) {
        return "Unable to connect to the server. Check your backend connection.";
    }

    return "Something went wrong while loading reviews.";
}

function StatCard({ label, value, description, icon: Icon, loading }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-gray-500">{label}</p>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
                    <Icon size={17} />
                </div>
            </div>

            <p className="mt-3 text-2xl font-bold tracking-tight text-gray-950">
                {loading ? (
                    <span className="inline-block h-7 w-16 animate-pulse rounded bg-gray-100" />
                ) : (
                    value
                )}
            </p>

            <p className="mt-1 text-[10px] text-gray-400">{description}</p>
        </div>
    );
}

function ReviewActions({ item, updating, onToggle }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;

        const close = () => setOpen(false);

        document.addEventListener("click", close);

        return () => document.removeEventListener("click", close);
    }, [open]);

    return (
        <div
            className="relative inline-block"
            onClick={(event) => event.stopPropagation()}
        >
            <button
                type="button"
                aria-label={`Actions for review ${item.id}`}
                onClick={() => setOpen((current) => !current)}
                disabled={updating}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-black disabled:opacity-50"
            >
                <FiMoreHorizontal size={18} />
            </button>

            {open && (
                <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-gray-200 bg-white p-1.5 text-left shadow-xl">
                    <button
                        type="button"
                        disabled={updating}
                        onClick={() => {
                            setOpen(false);
                            onToggle(item);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        {item.status === "Published" ? (
                            <>
                                <FiEyeOff size={15} />
                                Hide review
                            </>
                        ) : (
                            <>
                                <FiEye size={15} />
                                Publish review
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        total_reviews: 0,
        average_rating: 0,
        pending_reviews: 0,
        five_star_reviews: 0,
        five_star_percentage: 0,
    });

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [rating, setRating] = useState("all");
    const [showFilter, setShowFilter] = useState(false);

    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [nextPage, setNextPage] = useState(false);
    const [previousPage, setPreviousPage] = useState(false);

    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    const fetchStats = useCallback(async () => {
        setStatsLoading(true);

        try {
            const response = await adminApi.get(
                `reviews/stats/`,
            );

            setStats((current) => ({ ...current, ...response.data }));
        } catch (err) {
            console.error("Failed to load review statistics:", err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const params = {
                page,
                page_size: PAGE_SIZE,
                search: debouncedSearch,
                status,
                rating,
            };

            const response = await adminApi.get(
                `reviews/`,
                {
                    params,
                    withCredentials: true,
                }
            );

            const data = response.data;
            const items = Array.isArray(data)
                ? data
                : data.results || [];

            const mappedReviews = items.map((item) => ({
                ...item,
                customer: item.customer || "Guest Customer",
                product: item.product_name || "Unknown product",
                review: item.review ?? item.comment ?? "",
                status: item.status_label ||
                    (item.is_approved ? "Published" : "Hidden"),
                date: formatDate(item.created_at),
                rating: Number(item.rating) || 0,
            }));

            setReviews(mappedReviews);
            setTotalCount(data.count ?? items.length);
            setNextPage(Boolean(data.next));
            setPreviousPage(Boolean(data.previous));
        } catch (err) {
            console.error("Failed to load reviews:", err);
            setError(getErrorMessage(err));
            setReviews([]);
            setTotalCount(0);
            setNextPage(false);
            setPreviousPage(false);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, status, rating]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleToggleReview = async (item) => {
        const nextApproved = item.status !== "Published";

        setUpdatingId(item.id);
        setError("");
        setNotice("");

        try {
            await adminApi.patch(
                `reviews/${item.id}/`,
                { is_approved: nextApproved },
                { withCredentials: true }
            );

            setNotice(
                nextApproved
                    ? "Review published successfully."
                    : "Review hidden successfully."
            );

            await Promise.all([fetchReviews(), fetchStats()]);
        } catch (err) {
            console.error("Failed to update review:", err);
            setError(getErrorMessage(err));
        } finally {
            setUpdatingId(null);
        }
    };

    const clearFilters = () => {
        setStatus("all");
        setRating("all");
        setSearch("");
        setDebouncedSearch("");
        setPage(1);
    };

    const hasFilters =
        status !== "all" ||
        rating !== "all" ||
        Boolean(search);

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const firstItem = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const lastItem = Math.min(page * PAGE_SIZE, totalCount);

    return (
        <div className="min-h-screen bg-gray-50/50 px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
            {/* Header */}
            <div className="mb-8">
                <div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
                    <span>Admin</span>
                    <span>/</span>
                    <span className="font-medium text-gray-600">Reviews</span>
                </div>

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                            Customer feedback
                        </p>

                        <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                            Reviews
                        </h1>

                        <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">
                            Monitor customer feedback, understand product
                            satisfaction, and manage published reviews.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            fetchReviews();
                            fetchStats();
                        }}
                        disabled={loading || statsLoading}
                        className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 sm:self-auto"
                    >
                        <FiRefreshCw
                            size={14}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                    <FiAlertCircle className="mt-0.5 shrink-0" size={17} />

                    <div className="min-w-0 flex-1">
                        <p className="font-semibold">Unable to complete request</p>
                        <p className="mt-1 text-xs leading-5">{error}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        className="shrink-0"
                        aria-label="Dismiss error"
                    >
                        <FiX size={16} />
                    </button>
                </div>
            )}

            {notice && (
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
                    <FiCheck size={17} />
                    <span className="flex-1 text-xs font-medium">{notice}</span>
                    <button
                        type="button"
                        onClick={() => setNotice("")}
                        aria-label="Dismiss notification"
                    >
                        <FiX size={16} />
                    </button>
                </div>
            )}

            {/* Statistics */}
            <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                <StatCard
                    label="Total reviews"
                    value={stats.total_reviews.toLocaleString()}
                    description="All customer feedback"
                    icon={FiMessageSquare}
                    loading={statsLoading}
                />

                <StatCard
                    label="Average rating"
                    value={Number(stats.average_rating || 0).toFixed(1)}
                    description="Average out of 5 stars"
                    icon={FiStar}
                    loading={statsLoading}
                />

                <StatCard
                    label="Published reviews"
                    value={Number(stats.published_reviews || 0).toLocaleString()}
                    description="Visible to customers"
                    icon={FiEye}
                    loading={statsLoading}
                />

                <StatCard
                    label="5-star reviews"
                    value={Number(stats.five_star_reviews || 0).toLocaleString()}
                    description={`${Number(stats.five_star_percentage || 0).toFixed(1)}% of all reviews`}
                    icon={FiTrendingUp}
                    loading={statsLoading}
                />
            </div>

            {/* Reviews section */}
            <section className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm shadow-gray-100/50">
                {/* Toolbar */}
                <div className="border-b border-gray-100 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-md">
                            <FiSearch
                                size={16}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search customers, products, reviews..."
                                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-10 text-xs outline-none transition focus:border-gray-400 focus:bg-white"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                                >
                                    <FiX size={15} />
                                </button>
                            )}
                        </div>

                        <div className="relative flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowFilter((current) => !current)}
                                className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold transition hover:bg-gray-50"
                            >
                                <FiFilter size={15} />
                                Filters

                                {hasFilters && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-black" />
                                )}

                                <FiChevronDown
                                    size={13}
                                    className={`transition ${showFilter ? "rotate-180" : ""}`}
                                />
                            </button>

                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-xs font-medium text-gray-500 hover:text-black"
                                >
                                    Clear all
                                </button>
                            )}

                            {showFilter && (
                                <>
                                    <button
                                        type="button"
                                        aria-label="Close filters"
                                        className="fixed inset-0 z-20 cursor-default"
                                        onClick={() => setShowFilter(false)}
                                    />

                                    <div className="absolute right-0 top-12 z-30 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
                                        <p className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            Review status
                                        </p>

                                        {[
                                            { label: "All reviews", value: "all" },
                                            { label: "Published", value: "published" },
                                            { label: "Hidden", value: "hidden" },
                                        ].map((item) => (
                                            <button
                                                type="button"
                                                key={item.value}
                                                onClick={() => {
                                                    setStatus(item.value);
                                                    setPage(1);
                                                    setShowFilter(false);
                                                }}
                                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs transition ${
                                                    status === item.value
                                                        ? "bg-black text-white"
                                                        : "text-gray-600 hover:bg-gray-100"
                                                }`}
                                            >
                                                {item.label}

                                                {status === item.value && (
                                                    <FiCheck size={14} />
                                                )}
                                            </button>
                                        ))}

                                        <div className="my-2 border-t border-gray-100" />

                                        <p className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            Rating
                                        </p>

                                        {[
                                            { label: "All ratings", value: "all" },
                                            { label: "5 stars", value: "5" },
                                            { label: "4 stars", value: "4" },
                                            { label: "3 stars", value: "3" },
                                            { label: "2 stars", value: "2" },
                                            { label: "1 star", value: "1" },
                                        ].map((item) => (
                                            <button
                                                type="button"
                                                key={item.value}
                                                onClick={() => {
                                                    setRating(item.value);
                                                    setPage(1);
                                                    setShowFilter(false);
                                                }}
                                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs transition ${
                                                    rating === item.value
                                                        ? "bg-black text-white"
                                                        : "text-gray-600 hover:bg-gray-100"
                                                }`}
                                            >
                                                <span>{item.label}</span>

                                                {item.value !== "all" && (
                                                    <FiStar
                                                        size={13}
                                                        className={
                                                            rating === item.value
                                                                ? "fill-amber-300 text-amber-300"
                                                                : "fill-amber-400 text-amber-400"
                                                        }
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[850px] text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70">
                                {[
                                    "Customer",
                                    "Product",
                                    "Review",
                                    "Rating",
                                    "Status",
                                    "Action",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className={`px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 ${
                                            heading === "Action" ? "text-right" : ""
                                        }`}
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index}>
                                        {Array.from({ length: 6 }).map((__, cell) => (
                                            <td key={cell} className="px-5 py-5">
                                                <div className="h-4 animate-pulse rounded bg-gray-100" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : reviews.length > 0 ? (
                                reviews.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="transition hover:bg-gray-50/70"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={item.customer} />

                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-gray-900">
                                                        {item.customer}
                                                    </p>

                                                    <p className="mt-1 text-[10px] text-gray-400">
                                                        {formatDate(item.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="max-w-44 text-xs font-semibold text-gray-700">
                                                {item.product}
                                            </p>
                                        </td>

                                        <td className="max-w-[300px] px-5 py-4">
                                            <p
                                                title={item.review}
                                                className="truncate text-xs leading-5 text-gray-500"
                                            >
                                                {item.review || "No comment provided"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <Rating rating={item.rating} />
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ring-1 ring-inset ${
                                                    statusStyles[item.status] ||
                                                    statusStyles.Hidden
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-right">
                                            <ReviewActions
                                                item={item}
                                                updating={updatingId === item.id}
                                                onToggle={handleToggleReview}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                                            <FiMessageSquare size={21} />
                                        </div>

                                        <p className="mt-4 text-sm font-semibold text-gray-800">
                                            No reviews found
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            Try another search or change your filters.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <div className="divide-y divide-gray-100 md:hidden">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="animate-pulse space-y-3 p-4">
                                <div className="h-10 rounded-lg bg-gray-100" />
                                <div className="h-4 w-2/3 rounded bg-gray-100" />
                                <div className="h-12 rounded-lg bg-gray-100" />
                            </div>
                        ))
                    ) : reviews.length > 0 ? (
                        reviews.map((item) => (
                            <article key={item.id} className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <Avatar name={item.customer} />

                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold text-gray-900">
                                                {item.customer}
                                            </p>

                                            <p className="mt-1 text-[10px] text-gray-400">
                                                {formatDate(item.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    <ReviewActions
                                        item={item}
                                        updating={updatingId === item.id}
                                        onToggle={handleToggleReview}
                                    />
                                </div>

                                <div className="mt-4">
                                    <p className="text-xs font-semibold text-gray-700">
                                        {item.product}
                                    </p>

                                    <div className="mt-2 flex items-center gap-2">
                                        <Rating rating={item.rating} />
                                        <span className="text-[10px] text-gray-400">
                                            {item.rating}/5
                                        </span>
                                    </div>

                                    <p className="mt-3 break-words text-xs leading-6 text-gray-600">
                                        {item.review || "No comment provided"}
                                    </p>

                                    <div className="mt-3">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ring-1 ring-inset ${
                                                statusStyles[item.status] ||
                                                statusStyles.Hidden
                                            }`}
                                        >
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="px-5 py-16 text-center">
                            <FiMessageSquare
                                size={25}
                                className="mx-auto text-gray-300"
                            />

                            <p className="mt-3 text-sm font-semibold text-gray-800">
                                No reviews found
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Try changing your search or filters.
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="flex flex-col justify-between gap-4 border-t border-gray-100 p-4 sm:flex-row sm:items-center sm:px-5">
                    <p className="text-[10px] text-gray-400">
                        Showing{" "}
                        <span className="font-semibold text-gray-700">
                            {firstItem}–{lastItem}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-gray-700">
                            {totalCount}
                        </span>{" "}
                        reviews
                    </p>

                    <div className="flex items-center gap-1 self-end sm:self-auto">
                        <button
                            type="button"
                            disabled={!previousPage || loading}
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            aria-label="Previous page"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <FiChevronLeft size={15} />
                        </button>

                        <span className="min-w-20 px-3 text-center text-xs font-semibold text-gray-700">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={!nextPage || loading}
                            onClick={() => setPage((current) => current + 1)}
                            aria-label="Next page"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <FiChevronRight size={15} />
                        </button>
                    </div>
                </div>
            </section>

            <p className="py-8 text-center text-[10px] text-gray-400">
                © {new Date().getFullYear()} Temmy Collection · Admin Dashboard
            </p>
        </div>
    );
}