"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    FiCalendar,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiCopy,
    FiEdit3,
    FiLoader,
    FiMoreHorizontal,
    FiPercent,
    FiPlus,
    FiSearch,
    FiTag,
    FiTrash2,
    FiX,
} from "react-icons/fi";

import adminApi from "../../../api/adminApi";

export default function CouponsPage() {
    const [coupons, setCoupons] = useState([]);

    const [couponStats, setCouponStats] = useState({
        total_coupons: 0,
        active_coupons: 0,
        total_redemptions: 0,
        discount_given: 0,
    });

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [page, setPage] = useState(1);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);

    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);

    const [openMenu, setOpenMenu] = useState(null);

    const [form, setForm] = useState({
        code: "",
        type: "percentage",
        value: "",
        minimum: "0",
        maximum: "",
        limit: "",
        startDate: "",
        expires: "",
        isActive: true,
    });

    /* =========================================================
       FETCH COUPONS
    ========================================================= */

    const fetchCoupons = async (requestedPage = page) => {
        try {
            setLoading(true);
            setError("");

            const response = await adminApi.get(
                "coupons/",
                {
                    params: {
                        page: requestedPage,
                        search: search.trim(),
                        status:
                            statusFilter === "all"
                                ? ""
                                : statusFilter,
                    },
                }
            );

            const data = response.data;

            setCoupons(data.results || []);
            setNextPage(data.next || null);
            setPreviousPage(data.previous || null);
        } catch (err) {
            console.error(err);

            setError(
                err?.response?.data?.detail ||
                    err?.response?.data?.error ||
                    "Failed to load coupons."
            );
        } finally {
            setLoading(false);
        }
    };

    /* =========================================================
       FETCH STATS
    ========================================================= */

    const fetchCouponStats = async () => {
        try {
            setStatsLoading(true);

            const response = await adminApi.get(
                "coupons/stats/"
            );

            setCouponStats({
                total_coupons:
                    response.data?.total_coupons || 0,

                active_coupons:
                    response.data?.active_coupons || 0,

                total_redemptions:
                    response.data?.total_redemptions || 0,

                discount_given:
                    response.data?.discount_given || 0,
            });
        } catch (err) {
            console.error(
                "Failed to load coupon stats:",
                err
            );
        } finally {
            setStatsLoading(false);
        }
    };

    /* =========================================================
       INITIAL LOAD
    ========================================================= */

    useEffect(() => {
        fetchCouponStats();
    }, []);

    /* =========================================================
       SEARCH / FILTER
    ========================================================= */

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchCoupons(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    useEffect(() => {
        fetchCoupons(page);
    }, [page]);

    /* =========================================================
       FORM
    ========================================================= */

    const resetForm = () => {
        setForm({
            code: "",
            type: "percentage",
            value: "",
            minimum: "0",
            maximum: "",
            limit: "",
            startDate: "",
            expires: "",
            isActive: true,
        });

        setEditingCoupon(null);
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        resetForm();
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (coupon) => {
        setEditingCoupon(coupon);

        setForm({
            code: coupon.code || "",
            type: coupon.discount_type || "percentage",

            value:
                coupon.discount_value !== null &&
                coupon.discount_value !== undefined
                    ? String(coupon.discount_value)
                    : "",

            minimum:
                coupon.minimum_order_amount !== null &&
                coupon.minimum_order_amount !== undefined
                    ? String(coupon.minimum_order_amount)
                    : "0",

            maximum:
                coupon.maximum_discount !== null &&
                coupon.maximum_discount !== undefined
                    ? String(coupon.maximum_discount)
                    : "",

            limit:
                coupon.usage_limit !== null &&
                coupon.usage_limit !== undefined
                    ? String(coupon.usage_limit)
                    : "",

            startDate: coupon.start_date
                ? coupon.start_date.slice(0, 10)
                : "",

            expires: coupon.expiry_date
                ? coupon.expiry_date.slice(0, 10)
                : "",

            isActive: coupon.is_active,
        });

        setOpenMenu(null);
        setShowModal(true);
    };

    const updateForm = (field, value) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    /* =========================================================
       API ERROR
    ========================================================= */

    const getApiError = (err) => {
        const data = err?.response?.data;

        if (!data) {
            return "Something went wrong.";
        }

        if (typeof data === "string") {
            return data;
        }

        if (data.detail) {
            return data.detail;
        }

        if (data.error) {
            return data.error;
        }

        const firstKey = Object.keys(data)[0];

        if (firstKey) {
            const value = data[firstKey];

            if (Array.isArray(value)) {
                return value[0];
            }

            return String(value);
        }

        return "Something went wrong.";
    };

    /* =========================================================
       CREATE / UPDATE
    ========================================================= */

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                code: form.code.trim().toUpperCase(),

                discount_type: form.type,

                discount_value: Number(form.value),

                minimum_order_amount:
                    Number(form.minimum || 0),

                maximum_discount:
                    form.type === "percentage" &&
                    form.maximum !== ""
                        ? Number(form.maximum)
                        : null,

                usage_limit:
                    form.limit === ""
                        ? null
                        : Number(form.limit),

                start_date: form.startDate
                    ? `${form.startDate}T00:00:00`
                    : null,

                expiry_date: form.expires
                    ? `${form.expires}T23:59:59`
                    : null,

                is_active: form.isActive,
            };

            if (editingCoupon) {
                await adminApi.patch(
                    `coupons/${editingCoupon.id}/`,
                    payload
                );

                setSuccess(
                    "Coupon updated successfully."
                );
            } else {
                await adminApi.post(
                    "coupons/",
                    payload
                );

                setSuccess(
                    "Coupon created successfully."
                );
            }

            setShowModal(false);
            resetForm();

            await fetchCoupons(page);
            await fetchCouponStats();
        } catch (err) {
            console.error(err);
            setError(getApiError(err));
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       DELETE / DEACTIVATE
    ========================================================= */

    const deleteCoupon = async (coupon) => {
        const confirmed = window.confirm(
            `Deactivate coupon "${coupon.code}"?`
        );

        if (!confirmed) return;

        try {
            setOpenMenu(null);
            setError("");
            setSuccess("");

            await adminApi.delete(
                `coupons/${coupon.id}/`
            );

            setSuccess(
                "Coupon deactivated successfully."
            );

            await fetchCoupons(page);
            await fetchCouponStats();
        } catch (err) {
            console.error(err);
            setError(getApiError(err));
        }
    };

    /* =========================================================
       TOGGLE ACTIVE
    ========================================================= */

    const toggleCoupon = async (coupon) => {
        try {
            setOpenMenu(null);
            setError("");
            setSuccess("");

            await adminApi.patch(
                `coupons/${coupon.id}/`,
                {
                    is_active: !coupon.is_active,
                }
            );

            setSuccess(
                coupon.is_active
                    ? "Coupon deactivated."
                    : "Coupon activated."
            );

            await fetchCoupons(page);
            await fetchCouponStats();
        } catch (err) {
            console.error(err);
            setError(getApiError(err));
        }
    };

    /* =========================================================
       COPY
    ========================================================= */

    const copyCoupon = async (code) => {
        try {
            await navigator.clipboard.writeText(code);

            setSuccess(
                `Coupon "${code}" copied.`
            );

            setOpenMenu(null);
        } catch {
            setError("Failed to copy coupon code.");
        }
    };

    /* =========================================================
       HELPERS
    ========================================================= */

    const formatMoney = (value) => {
        return `₦${Number(value || 0).toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }
        )}`;
    };

    const formatDate = (date) => {
        if (!date) return "No expiry";

        return new Date(date).toLocaleDateString(
            "en-NG",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "active":
                return "bg-green-50 text-green-700";

            case "scheduled":
                return "bg-blue-50 text-blue-700";

            case "expired":
                return "bg-red-50 text-red-700";

            case "used_up":
                return "bg-orange-50 text-orange-700";

            case "inactive":
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "used_up":
                return "Used up";

            case "active":
                return "Active";

            case "scheduled":
                return "Scheduled";

            case "expired":
                return "Expired";

            case "inactive":
                return "Inactive";

            default:
                return status || "Unknown";
        }
    };

    const discountPreview = useMemo(() => {
        if (!form.value) return "—";

        if (form.type === "percentage") {
            return `${form.value}%`;
        }

        return formatMoney(form.value);
    }, [form.value, form.type]);

    /* =========================================================
       UI
    ========================================================= */

    return (
        <div
            className="min-h-screen bg-[#f8f9fb] p-4 sm:p-6 lg:p-8"
            onClick={() => setOpenMenu(null)}
        >
            <div className="mx-auto max-w-[1500px]">
                {/* HEADER */}
                <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                            Coupons
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Create and manage promotional
                            discounts for your store.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
                    >
                        <FiPlus size={18} />
                        Create Coupon
                    </button>
                </div>

                {/* ALERTS */}
                {error && (
                    <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <span>{error}</span>

                        <button
                            onClick={() => setError("")}
                        >
                            <FiX />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mb-5 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        <span>{success}</span>

                        <button
                            onClick={() => setSuccess("")}
                        >
                            <FiX />
                        </button>
                    </div>
                )}

                {/* STATS */}
                <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {/* TOTAL */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Coupons
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                                    {statsLoading ? (
                                        <FiLoader className="animate-spin" />
                                    ) : (
                                        couponStats.total_coupons
                                    )}
                                </h2>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                <FiTag size={21} />
                            </div>
                        </div>
                    </div>

                    {/* ACTIVE */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Active Coupons
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                                    {statsLoading ? (
                                        <FiLoader className="animate-spin" />
                                    ) : (
                                        couponStats.active_coupons
                                    )}
                                </h2>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                                <FiPercent size={21} />
                            </div>
                        </div>
                    </div>

                    {/* REDEMPTIONS */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Redemptions
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                                    {statsLoading ? (
                                        <FiLoader className="animate-spin" />
                                    ) : (
                                        couponStats.total_redemptions
                                    )}
                                </h2>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <FiTag size={21} />
                            </div>
                        </div>
                    </div>

                    {/* DISCOUNT GIVEN */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Discount Given
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                                    {statsLoading ? (
                                        <FiLoader className="animate-spin" />
                                    ) : (
                                        formatMoney(
                                            couponStats.discount_given
                                        )
                                    )}
                                </h2>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                <FiPercent size={21} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLE CONTAINER */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    {/* TOOLBAR */}
                    <div className="flex flex-col gap-4 border-b border-gray-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* SEARCH */}
                        <div className="relative w-full lg:max-w-sm">
                            <FiSearch
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={18}
                            />

                            <input
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search coupons..."
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
                            />
                        </div>

                        {/* FILTER */}
                        <div className="relative">
                            <FiChevronDown
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={16}
                            />

                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(
                                        e.target.value
                                    )
                                }
                                className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-gray-700 outline-none focus:border-gray-400"
                            >
                                <option value="all">
                                    All Status
                                </option>

                                <option value="active">
                                    Active
                                </option>

                                <option value="inactive">
                                    Inactive
                                </option>

                                <option value="scheduled">
                                    Scheduled
                                </option>

                                <option value="expired">
                                    Expired
                                </option>

                                <option value="used_up">
                                    Used Up
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px]">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Coupon
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Discount
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Usage
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Expires
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Status
                                    </th>

                                    <th className="w-16 px-5 py-4"></th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-16 text-center"
                                        >
                                            <FiLoader
                                                size={25}
                                                className="mx-auto animate-spin text-gray-400"
                                            />

                                            <p className="mt-3 text-sm text-gray-500">
                                                Loading coupons...
                                            </p>
                                        </td>
                                    </tr>
                                ) : coupons.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-16 text-center"
                                        >
                                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                                <FiTag
                                                    size={23}
                                                />
                                            </div>

                                            <h3 className="mt-4 text-sm font-semibold text-gray-900">
                                                No coupons found
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Create a coupon to
                                                start offering
                                                discounts.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    coupons.map((coupon) => (
                                        <tr
                                            key={coupon.id}
                                            className="transition hover:bg-gray-50/70"
                                        >
                                            {/* COUPON */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                                                        <FiTag
                                                            size={17}
                                                        />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-gray-900">
                                                                {
                                                                    coupon.code
                                                                }
                                                            </p>

                                                            <button
                                                                onClick={() =>
                                                                    copyCoupon(
                                                                        coupon.code
                                                                    )
                                                                }
                                                                className="text-gray-400 transition hover:text-gray-700"
                                                                title="Copy coupon"
                                                            >
                                                                <FiCopy
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            </button>
                                                        </div>

                                                        <p className="mt-0.5 text-xs text-gray-500">
                                                            Min.{" "}
                                                            {formatMoney(
                                                                coupon.minimum_order_amount
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* DISCOUNT */}
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {
                                                            coupon.discount_display
                                                        }
                                                    </p>

                                                    {coupon.discount_type ===
                                                        "percentage" &&
                                                        coupon.maximum_discount && (
                                                            <p className="mt-0.5 text-xs text-gray-500">
                                                                Max.{" "}
                                                                {formatMoney(
                                                                    coupon.maximum_discount
                                                                )}
                                                            </p>
                                                        )}
                                                </div>
                                            </td>

                                            {/* USAGE */}
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-gray-800">
                                                    {
                                                        coupon.usage_display
                                                    }
                                                </p>
                                            </td>

                                            {/* EXPIRY */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FiCalendar
                                                        size={15}
                                                        className="text-gray-400"
                                                    />

                                                    {formatDate(
                                                        coupon.expiry_date
                                                    )}
                                                </div>
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                                                        coupon.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(
                                                        coupon.status
                                                    )}
                                                </span>
                                            </td>

                                            {/* MENU */}
                                            <td className="relative px-5 py-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        setOpenMenu(
                                                            openMenu ===
                                                                coupon.id
                                                                ? null
                                                                : coupon.id
                                                        );
                                                    }}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                                                >
                                                    <FiMoreHorizontal
                                                        size={19}
                                                    />
                                                </button>

                                                {openMenu ===
                                                    coupon.id && (
                                                    <div
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                        className="absolute right-5 top-14 z-30 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl"
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                openEditModal(
                                                                    coupon
                                                                )
                                                            }
                                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                                                        >
                                                            <FiEdit3
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                            Edit Coupon
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                toggleCoupon(
                                                                    coupon
                                                                )
                                                            }
                                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                                                        >
                                                            <FiPercent
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                            {coupon.is_active
                                                                ? "Deactivate"
                                                                : "Activate"}
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                copyCoupon(
                                                                    coupon.code
                                                                )
                                                            }
                                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                                                        >
                                                            <FiCopy
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                            Copy Code
                                                        </button>

                                                        <div className="my-1 border-t border-gray-100" />

                                                        <button
                                                            onClick={() =>
                                                                deleteCoupon(
                                                                    coupon
                                                                )
                                                            }
                                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                                                        >
                                                            <FiTrash2
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                            Deactivate
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-500">
                            Page{" "}
                            <span className="font-semibold text-gray-800">
                                {page}
                            </span>
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={!previousPage || loading}
                                onClick={() =>
                                    setPage((current) =>
                                        Math.max(
                                            current - 1,
                                            1
                                        )
                                    )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiChevronLeft size={17} />
                            </button>

                            <button
                                disabled={!nextPage || loading}
                                onClick={() =>
                                    setPage(
                                        (current) =>
                                            current + 1
                                    )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiChevronRight size={17} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                CREATE / EDIT MODAL
            ===================================================== */}

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="my-4 flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        {/* MODAL HEADER */}
                        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {editingCoupon
                                        ? "Edit Coupon"
                                        : "Create Coupon"}
                                </h2>

                                <p className="mt-0.5 text-sm text-gray-500">
                                    {editingCoupon
                                        ? "Update this coupon."
                                        : "Create a promotional discount."}
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* FORM */}
                        <form
                            onSubmit={handleSubmit}
                            className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6"
                        >
                            {/* CODE */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Coupon Code
                                </label>

                                <input
                                    required
                                    value={form.code}
                                    onChange={(e) =>
                                        updateForm(
                                            "code",
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                    placeholder="e.g. SAVE20"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium uppercase outline-none transition focus:border-gray-400"
                                />
                            </div>

                            {/* TYPE */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Discount Type
                                </label>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateForm(
                                                "type",
                                                "percentage"
                                            )
                                        }
                                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                            form.type ===
                                            "percentage"
                                                ? "border-gray-900 bg-gray-900 text-white"
                                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        Percentage
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateForm(
                                                "type",
                                                "fixed"
                                            )
                                        }
                                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                            form.type === "fixed"
                                                ? "border-gray-900 bg-gray-900 text-white"
                                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        Fixed Amount
                                    </button>
                                </div>
                            </div>

                            {/* VALUE */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Discount Value
                                    </label>

                                    <div className="relative">
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.value}
                                            onChange={(e) =>
                                                updateForm(
                                                    "value",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="0"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm outline-none focus:border-gray-400"
                                        />

                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                                            {form.type ===
                                            "percentage"
                                                ? "%"
                                                : "₦"}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xs text-gray-400">
                                        Preview:{" "}
                                        <span className="font-semibold text-gray-600">
                                            {discountPreview}
                                        </span>
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Minimum Order
                                    </label>

                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                            ₦
                                        </span>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.minimum}
                                            onChange={(e) =>
                                                updateForm(
                                                    "minimum",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border border-gray-200 py-3 pl-9 pr-4 text-sm outline-none focus:border-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* MAXIMUM */}
                            {form.type === "percentage" && (
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Maximum Discount
                                        <span className="ml-1 font-normal text-gray-400">
                                            Optional
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                            ₦
                                        </span>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.maximum}
                                            onChange={(e) =>
                                                updateForm(
                                                    "maximum",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="No maximum"
                                            className="w-full rounded-xl border border-gray-200 py-3 pl-9 pr-4 text-sm outline-none focus:border-gray-400"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* USAGE */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Usage Limit
                                    <span className="ml-1 font-normal text-gray-400">
                                        Optional
                                    </span>
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    value={form.limit}
                                    onChange={(e) =>
                                        updateForm(
                                            "limit",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Unlimited"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                                />
                            </div>

                            {/* DATES */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Start Date
                                    </label>

                                    <input
                                        type="date"
                                        value={form.startDate}
                                        onChange={(e) =>
                                            updateForm(
                                                "startDate",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Expiry Date
                                    </label>

                                    <input
                                        type="date"
                                        value={form.expires}
                                        onChange={(e) =>
                                            updateForm(
                                                "expires",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                                    />
                                </div>
                            </div>

                            {/* ACTIVE */}
                            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 p-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        Active Coupon
                                    </p>

                                    <p className="mt-0.5 text-xs text-gray-500">
                                        Customers can use this
                                        coupon when active.
                                    </p>
                                </div>

                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) =>
                                        updateForm(
                                            "isActive",
                                            e.target.checked
                                        )
                                    }
                                    className="h-5 w-5 accent-gray-900"
                                />
                            </label>

                            {/* BUTTONS */}
                            <div className="flex shrink-0 gap-3 border-t border-gray-100 pt-5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving && (
                                        <FiLoader
                                            className="animate-spin"
                                            size={16}
                                        />
                                    )}

                                    {editingCoupon
                                        ? "Save Changes"
                                        : "Create Coupon"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}