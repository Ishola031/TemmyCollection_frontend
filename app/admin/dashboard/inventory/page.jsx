"use client";

import React, { useEffect, useState } from "react";
import {
    FiAlertTriangle,
    FiChevronDown,
    FiEdit3,
    FiEye,
    FiLoader,
    FiMoreHorizontal,
    FiPackage,
    FiPlus,
    FiSearch,
    FiShoppingBag,
    FiTrash2,
    FiX,
    FiXCircle,
} from "react-icons/fi";
import adminApi from "../../../api/adminApi";
import Link from "next/link";

const STATUS_OPTIONS = [
    { label: "All status", value: "" },
    { label: "In stock", value: "in_stock" },
    { label: "Low stock", value: "low_stock" },
    { label: "Out of stock", value: "out_of_stock" },
];

export default function InventoryPage() {
    const [products, setProducts] = useState([]);

    const [stats, setStats] = useState({
        total_products: 0,
        in_stock: 0,
        low_stock: 0,
        out_of_stock: 0,
    });

    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
    });

    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState("");

    const [openMenu, setOpenMenu] = useState(null);

    // Stock modal
    const [stockProduct, setStockProduct] = useState(null);
    const [stockValue, setStockValue] = useState("");
    const [stockAction, setStockAction] = useState("add");
    const [variationStocks, setVariationStocks] = useState({});
    const [savingStock, setSavingStock] = useState(false);
    const [stockError, setStockError] = useState("");

    /* =========================
       FETCH STATS
    ========================= */

    const fetchStats = async () => {
        try {
            setStatsLoading(true);

            const response = await adminApi.get(
                "inventory/stats/"
            );

            setStats(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setStatsLoading(false);
        }
    };

    /* =========================
       FETCH CATEGORIES
    ========================= */

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await adminApi.get(
                    "inventory/categories/"
                );

                setCategories(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchCategories();
    }, []);

    /* =========================
       INITIAL STATS
    ========================= */

    useEffect(() => {
        fetchStats();
    }, []);

    /* =========================
       FETCH PRODUCTS
    ========================= */

    useEffect(() => {
        const controller = new AbortController();

        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const params = {
                    page,
                    page_size: pageSize,
                };

                if (search.trim()) {
                    params.search = search.trim();
                }

                if (category) {
                    params.category = category;
                }

                if (status) {
                    params.status = status;
                }

                const response = await adminApi.get(
                    "inventory/products/",
                    {
                        params,
                        signal: controller.signal,
                    }
                );

                const data = response.data;

                setProducts(data.results || []);

                setPagination({
                    count: data.count || 0,
                    next: data.next,
                    previous: data.previous,
                });
            } catch (error) {
                if (
                    error.name !== "CanceledError" &&
                    error.code !== "ERR_CANCELED"
                ) {
                    console.error(error);
                    setError(
                        "Unable to load inventory."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        const timeout = setTimeout(
            fetchProducts,
            350
        );

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [
        search,
        category,
        status,
        page,
        pageSize,
    ]);

    /* =========================
       CLOSE MENU
    ========================= */

    useEffect(() => {
        const handleClickOutside = () => {
            setOpenMenu(null);
        };

        if (openMenu !== null) {
            document.addEventListener(
                "click",
                handleClickOutside
            );
        }

        return () => {
            document.removeEventListener(
                "click",
                handleClickOutside
            );
        };
    }, [openMenu]);

    /* =========================
       FILTERS
    ========================= */

    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(1);
    };

    const handleCategoryChange = (value) => {
        setCategory(value);
        setPage(1);
    };

    const handleStatusChange = (value) => {
        setStatus(value);
        setPage(1);
    };

    /* =========================
       OPEN STOCK MODAL
    ========================= */

    const handleUpdateStock = (product) => {
        setOpenMenu(null);
        setStockProduct(product);
        setStockError("");
        setStockAction("add");
        setStockValue("");

        if (product.has_variations) {
            const stocks = {};

            (product.variations || []).forEach(
                (variation) => {
                    stocks[variation.id] = {
                        action: "add",
                        quantity: "",
                    };
                }
            );

            setVariationStocks(stocks);
        } else {
            setVariationStocks({});
        }
    };

    /* =========================
       CLOSE STOCK MODAL
    ========================= */

    const closeStockModal = () => {
        if (savingStock) {
            return;
        }

        setStockProduct(null);
        setStockValue("");
        setStockAction("add");
        setVariationStocks({});
        setStockError("");
    };

    /* =========================
       PRODUCT STOCK CHANGE
    ========================= */

    const handleProductStockChange = (value) => {
        if (value === "") {
            setStockValue("");
            return;
        }

        const number = Number(value);

        if (
            !Number.isFinite(number) ||
            number < 0
        ) {
            return;
        }

        setStockValue(value);
    };

    /* =========================
       VARIATION STOCK CHANGE
    ========================= */

    const handleVariationStockChange = (
        variationId,
        field,
        value
    ) => {
        if (field === "quantity") {
            if (value === "") {
                setVariationStocks((current) => ({
                    ...current,
                    [variationId]: {
                        ...current[variationId],
                        quantity: "",
                    },
                }));

                return;
            }

            const number = Number(value);

            if (
                !Number.isFinite(number) ||
                number < 0
            ) {
                return;
            }

            setVariationStocks((current) => ({
                ...current,
                [variationId]: {
                    ...current[variationId],
                    quantity: value,
                },
            }));

            return;
        }

        setVariationStocks((current) => ({
            ...current,
            [variationId]: {
                ...current[variationId],
                action: value,
            },
        }));
    };

    /* =========================
       SAVE STOCK
    ========================= */

    const saveStock = async () => {
        if (!stockProduct || savingStock) {
            return;
        }

        try {
            setSavingStock(true);
            setStockError("");

            let body;

            /* =========================
               PRODUCT WITH VARIATIONS
            ========================= */

            if (stockProduct.has_variations) {
                const productVariations =
                    stockProduct.variations || [];

                if (productVariations.length === 0) {
                    setStockError(
                        "This product has no variations to update."
                    );
                    return;
                }

                const variations =
                    productVariations.map(
                        (variation) => {
                            const data =
                                variationStocks[
                                    variation.id
                                ];

                            const quantity =
                                data?.quantity === "" ||
                                data?.quantity ===
                                    undefined ||
                                data?.quantity === null
                                    ? 0
                                    : Number(
                                          data.quantity
                                      );

                            return {
                                id: variation.id,
                                action:
                                    data?.action ||
                                    "add",
                                quantity,
                            };
                        }
                    );

                body = {
                    variations,
                };
            } else {
                /* =========================
                   PRODUCT WITHOUT VARIATIONS
                ========================= */

                if (stockValue === "") {
                    setStockError(
                        "Please enter a quantity."
                    );
                    return;
                }

                const quantity = Number(
                    stockValue
                );

                if (
                    !Number.isFinite(quantity) ||
                    quantity < 0
                ) {
                    setStockError(
                        "Quantity cannot be negative."
                    );
                    return;
                }

                if (
                    stockAction === "subtract" &&
                    quantity >
                        Number(
                            stockProduct.stock || 0
                        )
                ) {
                    setStockError(
                        `Cannot subtract ${quantity}. Only ${stockProduct.stock} items are in stock.`
                    );
                    return;
                }

                body = {
                    action: stockAction,
                    quantity,
                };
            }

            /* =========================
               UPDATE STOCK
            ========================= */

            const response = await adminApi.patch(
                `products/${stockProduct.id}/stock/`,
                body
            );

            console.log(
                "Stock updated:",
                response.data
            );

            /* =========================
               CLOSE MODAL
            ========================= */

            setStockProduct(null);
            setStockValue("");
            setStockAction("add");
            setVariationStocks({});
            setStockError("");

            /* =========================
               REFRESH DATA
            ========================= */

            await Promise.all([
                fetchStats(),
                fetchCurrentProducts(),
            ]);
        } catch (error) {
            console.error(
                "Stock update error:",
                error
            );

            setStockError(
                error.response?.data?.detail ||
                    error.response?.data?.message ||
                    "Failed to update stock."
            );
        } finally {
            setSavingStock(false);
        }
    };

    /* =========================
       REFRESH CURRENT PRODUCTS
    ========================= */

    const fetchCurrentProducts = async () => {
        try {
            const params = {
                page,
                page_size: pageSize,
            };

            if (search.trim()) {
                params.search = search.trim();
            }

            if (category) {
                params.category = category;
            }

            if (status) {
                params.status = status;
            }

            const response = await adminApi.get(
                "inventory/products/",
                {
                    params,
                }
            );

            const data = response.data;

            setProducts(data.results || []);

            setPagination({
                count: data.count || 0,
                next: data.next,
                previous: data.previous,
            });
        } catch (error) {
            console.error(error);
        }
    };

    /* =========================
       OTHER ACTIONS
    ========================= */

    const handleViewOrders = (product) => {
        setOpenMenu(null);

        console.log(
            "View orders:",
            product.id
        );
    };

    const handleUpdateOrder = (product) => {
        setOpenMenu(null);

        console.log(
            "Update order:",
            product.id
        );
    };

    const handleDelete = (product) => {
        setOpenMenu(null);

        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.name}"?`
        );

        if (!confirmed) {
            return;
        }

        console.log(
            "Delete product:",
            product.id
        );
    };

    /* =========================
       PRICE
    ========================= */

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
        }).format(price || 0);
    };

    /* =========================
       STATUS
    ========================= */

    const getStatusLabel = (status) => {
        if (status === "in_stock") {
            return "In stock";
        }

        if (status === "low_stock") {
            return "Low stock";
        }

        return "Out of stock";
    };

    const getStatusStyle = (status) => {
        if (status === "in_stock") {
            return "bg-green-50 text-green-700";
        }

        if (status === "low_stock") {
            return "bg-yellow-50 text-yellow-700";
        }

        return "bg-red-50 text-red-700";
    };

    /* =========================
       VARIATION STOCK STYLE
    ========================= */

    const getVariationStockStyle = (stock) => {
        if (stock === 0) {
            return "text-red-600";
        }

        if (stock <= 5) {
            return "text-yellow-600";
        }

        return "text-gray-700";
    };

    /* =========================
       PAGINATION
    ========================= */

    const totalPages = Math.ceil(
        pagination.count / pageSize
    );

    const getPageNumbers = () => {
        if (totalPages <= 5) {
            return Array.from(
                { length: totalPages },
                (_, index) => index + 1
            );
        }

        if (page <= 3) {
            return [1, 2, 3, 4, 5];
        }

        if (page >= totalPages - 2) {
            return [
                totalPages - 4,
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }

        return [
            page - 2,
            page - 1,
            page,
            page + 1,
            page + 2,
        ];
    };

    return (
        <div
            className="min-h-screen bg-gray-50 p-4 sm:p-6"
            onClick={() => setOpenMenu(null)}
        >
            {/* HEADER */}

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Inventory
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage your products and stock
                        levels.
                    </p>
                </div>

                <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    <FiPlus size={17} />
                    Add Product
                </button>
            </div>

            {/* STAT CARDS */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                        <FiPackage size={20} />
                    </div>

                    <p className="text-sm text-gray-500">
                        Total Products
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-gray-900">
                        {statsLoading
                            ? "..."
                            : stats.total_products}
                    </h2>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                        <FiShoppingBag size={20} />
                    </div>

                    <p className="text-sm text-gray-500">
                        In Stock
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-gray-900">
                        {statsLoading
                            ? "..."
                            : stats.in_stock}
                    </h2>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                        <FiAlertTriangle size={20} />
                    </div>

                    <p className="text-sm text-gray-500">
                        Low Stock
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-gray-900">
                        {statsLoading
                            ? "..."
                            : stats.low_stock}
                    </h2>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <FiXCircle size={20} />
                    </div>

                    <p className="text-sm text-gray-500">
                        Out of Stock
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-gray-900">
                        {statsLoading
                            ? "..."
                            : stats.out_of_stock}
                    </h2>
                </div>
            </div>

            {/* LOW STOCK ALERT */}

            {!statsLoading &&
                stats.low_stock > 0 && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                        <FiAlertTriangle
                            className="mt-0.5 shrink-0 text-yellow-600"
                            size={20}
                        />

                        <div>
                            <h3 className="font-semibold text-yellow-800">
                                Low stock alert
                            </h3>

                            <p className="mt-1 text-sm text-yellow-700">
                                {stats.low_stock} product
                                {stats.low_stock !== 1
                                    ? "s are"
                                    : " is"}{" "}
                                running low on stock.
                            </p>
                        </div>
                    </div>
                )}

            {/* FILTERS */}

            <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                        <FiSearch
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                handleSearchChange(
                                    event.target.value
                                )
                            }
                            placeholder="Search products..."
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={category}
                            onChange={(event) =>
                                handleCategoryChange(
                                    event.target.value
                                )
                            }
                            className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-4 pr-10 text-sm outline-none lg:min-w-[190px]"
                        >
                            <option value="">
                                All categories
                            </option>

                            {categories.map((item) => (
                                <option
                                    key={item.id}
                                    value={item.slug}
                                >
                                    {item.name}
                                </option>
                            ))}
                        </select>

                        <FiChevronDown
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={17}
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={status}
                            onChange={(event) =>
                                handleStatusChange(
                                    event.target.value
                                )
                            }
                            className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-4 pr-10 text-sm outline-none lg:min-w-[170px]"
                        >
                            {STATUS_OPTIONS.map(
                                (item) => (
                                    <option
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </option>
                                )
                            )}
                        </select>

                        <FiChevronDown
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={17}
                        />
                    </div>
                </div>
            </div>

            {/* TABLE */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Product
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Category
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Price
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Stock
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Status
                                </th>

                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                Array.from({
                                    length: 6,
                                }).map((_, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-gray-100"
                                    >
                                        <td className="px-5 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-200" />

                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                                                    <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-5">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                                        </td>

                                        <td className="px-5 py-5">
                                            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                                        </td>

                                        <td className="px-5 py-5">
                                            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                                        </td>

                                        <td className="px-5 py-5">
                                            <div className="h-7 w-20 animate-pulse rounded-full bg-gray-200" />
                                        </td>

                                        <td className="px-5 py-5">
                                            <div className="ml-auto h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
                                        </td>
                                    </tr>
                                ))
                            ) : error ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-16 text-center"
                                    >
                                        <p className="text-sm text-red-500">
                                            {error}
                                        </p>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-16 text-center"
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                                <FiPackage
                                                    size={22}
                                                    className="text-gray-400"
                                                />
                                            </div>

                                            <h3 className="font-semibold text-gray-900">
                                                No products
                                                found
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Try changing
                                                your search
                                                or filters.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="border-b border-gray-100 transition hover:bg-gray-50"
                                    >
                                        <td className="px-5 py-5">
                                            <div className="flex items-center gap-3">
                                                {product.image ? (
                                                    <img
                                                        src={
                                                            product.image
                                                        }
                                                        alt={
                                                            product.name
                                                        }
                                                        className="h-12 w-12 rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                                                        <FiPackage
                                                            size={
                                                                20
                                                            }
                                                            className="text-gray-400"
                                                        />
                                                    </div>
                                                )}

                                                <div className="min-w-0">
                                                    <p className="max-w-[250px] truncate text-sm font-semibold text-gray-900">
                                                        {
                                                            product.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {product.has_variations
                                                            ? `${product.variations?.length || 0} variations`
                                                            : "No variations"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-5">
                                            <span className="text-sm text-gray-600">
                                                {product.category
                                                    ?.name ||
                                                    "—"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-5">
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatPrice(
                                                    product.price
                                                )}
                                            </span>
                                        </td>

                                        <td className="px-5 py-5">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {
                                                        product.total_stock
                                                    }
                                                </p>

                                                {product.has_variations &&
                                                    product
                                                        .variations
                                                        ?.length >
                                                        0 && (
                                                        <div className="mt-2 flex max-w-[260px] flex-wrap gap-1.5">
                                                            {product.variations.map(
                                                                (
                                                                    variation
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            variation.id
                                                                        }
                                                                        className={`rounded-md bg-gray-100 px-2 py-1 text-[11px] ${getVariationStockStyle(
                                                                            variation.stock
                                                                        )}`}
                                                                    >
                                                                        {variation.name ||
                                                                            "Variation"}{" "}
                                                                        :{" "}
                                                                        {
                                                                            variation.stock
                                                                        }
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        </td>

                                        <td className="px-5 py-5">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                                                    product.status
                                                )}`}
                                            >
                                                {getStatusLabel(
                                                    product.status
                                                )}
                                            </span>
                                        </td>

                                        <td className="px-5 py-5 text-right">
                                            <div
                                                className="relative inline-block"
                                                onClick={(event) =>
                                                    event.stopPropagation()
                                                }
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOpenMenu(
                                                            openMenu ===
                                                                product.id
                                                                ? null
                                                                : product.id
                                                        )
                                                    }
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                                                >
                                                    <FiMoreHorizontal
                                                        size={20}
                                                    />
                                                </button>

                                                {openMenu ===
                                                    product.id && (
                                                    <div className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 text-left shadow-xl">
                                                        <button type="button" onClick={() => handleUpdateStock(product)}
                                                            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                                                        >
                                                            <FiPackage size={17}/>
                                                            Update Stock
                                                        </button>

                                                        <Link href={`/admin/dashboard/inventory/${product?.slug}`} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50">
                                                            <FiEye size={17}/>
                                                            View Product
                                                        </Link>

                                                        <Link href={`/admin/dashboard/inventory/${product?.slug}/edit`} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50">
                                                            <FiEdit3 size={17}/>
                                                            Update Order
                                                        </Link>

                                                        <div className="my-1 border-t border-gray-100" />

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    product
                                                                )
                                                            }
                                                            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
                                                        >
                                                            <FiTrash2
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}

                {!loading &&
                    products.length > 0 &&
                    totalPages > 1 && (
                        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row">
                            <p className="text-sm text-gray-500">
                                Showing{" "}
                                <span className="font-medium text-gray-700">
                                    {(page - 1) *
                                        pageSize +
                                        1}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium text-gray-700">
                                    {Math.min(
                                        page *
                                            pageSize,
                                        pagination.count
                                    )}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-gray-700">
                                    {
                                        pagination.count
                                    }
                                </span>{" "}
                                products
                            </p>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    disabled={
                                        !pagination.previous
                                    }
                                    onClick={() =>
                                        setPage(
                                            (current) =>
                                                Math.max(
                                                    1,
                                                    current -
                                                        1
                                                )
                                        )
                                    }
                                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                {getPageNumbers().map(
                                    (pageNumber) => (
                                        <button
                                            key={
                                                pageNumber
                                            }
                                            type="button"
                                            onClick={() =>
                                                setPage(
                                                    pageNumber
                                                )
                                            }
                                            className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition ${
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
                                    type="button"
                                    disabled={
                                        !pagination.next
                                    }
                                    onClick={() =>
                                        setPage(
                                            (current) =>
                                                current + 1
                                        )
                                    }
                                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
            </div>

            {/* STOCK MODAL */}

            {stockProduct && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
                    onClick={closeStockModal}
                >
                    <div
                        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        {/* HEADER */}

                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Update Stock
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {
                                        stockProduct.name
                                    }
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeStockModal
                                }
                                disabled={
                                    savingStock
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* BODY */}

                        <div className="max-h-[65vh] overflow-y-auto p-5">
                            {stockError && (
                                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {stockError}
                                </div>
                            )}

                            {/* PRODUCT WITHOUT VARIATIONS */}

                            {!stockProduct.has_variations ? (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Stock Action
                                    </label>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setStockAction(
                                                    "add"
                                                )
                                            }
                                            className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                                                stockAction ===
                                                "add"
                                                    ? "border-black bg-black text-white"
                                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                        >
                                            Add Stock
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setStockAction(
                                                    "subtract"
                                                )
                                            }
                                            className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                                                stockAction ===
                                                "subtract"
                                                    ? "border-black bg-black text-white"
                                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                        >
                                            Subtract
                                            Stock
                                        </button>
                                    </div>

                                    <label className="mb-2 mt-5 block text-sm font-medium text-gray-700">
                                        Quantity
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            stockValue
                                        }
                                        onChange={(event) =>
                                            handleProductStockChange(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter quantity"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                                    />

                                    <div className="mt-4 rounded-xl bg-gray-50 p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">
                                                Current stock
                                            </span>

                                            <span className="font-semibold text-gray-900">
                                                {
                                                    stockProduct.stock
                                                }
                                            </span>
                                        </div>

                                        {stockValue !==
                                            "" && (
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-sm text-gray-500">
                                                    New stock
                                                </span>

                                                <span className="font-bold text-gray-900">
                                                    {Math.max(
                                                        0,
                                                        Number(
                                                            stockProduct.stock ||
                                                                0
                                                        ) +
                                                            (stockAction ===
                                                            "add"
                                                                ? Number(
                                                                      stockValue
                                                                  )
                                                                : -Number(
                                                                      stockValue
                                                                  ))
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* PRODUCT WITH VARIATIONS */

                                <div>
                                    <div className="mb-4">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Product
                                            Variations
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Add or subtract
                                            stock for each
                                            variation
                                            separately.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {(
                                            stockProduct.variations ||
                                            []
                                        ).map(
                                            (
                                                variation
                                            ) => {
                                                const current =
                                                    Number(
                                                        variation.stock ||
                                                            0
                                                    );

                                                const action =
                                                    variationStocks[
                                                        variation
                                                            .id
                                                    ]?.action ||
                                                    "add";

                                                const quantity =
                                                    Number(
                                                        variationStocks[
                                                            variation
                                                                .id
                                                        ]?.quantity ||
                                                            0
                                                    );

                                                const newStock =
                                                    Math.max(
                                                        0,
                                                        current +
                                                            (action ===
                                                            "add"
                                                                ? quantity
                                                                : -quantity)
                                                    );

                                                return (
                                                    <div
                                                        key={
                                                            variation.id
                                                        }
                                                        className="rounded-xl border border-gray-200 p-4"
                                                    >
                                                        <div className="mb-3 flex items-center justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {variation.name ||
                                                                        "Variation"}
                                                                </p>

                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    Current:
                                                                    {" "}
                                                                    {
                                                                        variation.stock
                                                                    }{" "}
                                                                    units
                                                                </p>
                                                            </div>

                                                            <span
                                                                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                                                    current ===
                                                                    0
                                                                        ? "bg-red-50 text-red-600"
                                                                        : current <=
                                                                          5
                                                                        ? "bg-yellow-50 text-yellow-600"
                                                                        : "bg-green-50 text-green-600"
                                                                }`}
                                                            >
                                                                {current ===
                                                                0
                                                                    ? "Out of stock"
                                                                    : current <=
                                                                      5
                                                                    ? "Low stock"
                                                                    : "In stock"}
                                                            </span>
                                                        </div>

                                                        <div className="mb-3 grid grid-cols-2 gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleVariationStockChange(
                                                                        variation.id,
                                                                        "action",
                                                                        "add"
                                                                    )
                                                                }
                                                                className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                                                                    action ===
                                                                    "add"
                                                                        ? "border-black bg-black text-white"
                                                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                                                }`}
                                                            >
                                                                Add
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleVariationStockChange(
                                                                        variation.id,
                                                                        "action",
                                                                        "subtract"
                                                                    )
                                                                }
                                                                className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                                                                    action ===
                                                                    "subtract"
                                                                        ? "border-black bg-black text-white"
                                                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                                                }`}
                                                            >
                                                                Subtract
                                                            </button>
                                                        </div>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                variationStocks[
                                                                    variation
                                                                        .id
                                                                ]?.quantity ??
                                                                ""
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleVariationStockChange(
                                                                    variation.id,
                                                                    "quantity",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Enter quantity"
                                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black"
                                                        />

                                                        <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                                                            <span className="text-xs text-gray-500">
                                                                New
                                                                stock
                                                            </span>

                                                            <span className="text-sm font-bold text-gray-900">
                                                                {
                                                                    newStock
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>

                                    {/* TOTAL */}

                                    <div className="mt-4 rounded-xl bg-gray-50 p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">
                                                New total
                                                stock
                                            </span>

                                            <span className="text-lg font-bold text-gray-900">
                                                {(
                                                    stockProduct.variations ||
                                                    []
                                                ).reduce(
                                                    (
                                                        total,
                                                        variation
                                                    ) => {
                                                        const current =
                                                            Number(
                                                                variation.stock ||
                                                                    0
                                                            );

                                                        const data =
                                                            variationStocks[
                                                                variation
                                                                    .id
                                                            ];

                                                        const quantity =
                                                            Number(
                                                                data?.quantity ||
                                                                    0
                                                            );

                                                        const newStock =
                                                            Math.max(
                                                                0,
                                                                current +
                                                                    (data?.action ===
                                                                    "subtract"
                                                                        ? -quantity
                                                                        : quantity)
                                                            );

                                                        return (
                                                            total +
                                                            newStock
                                                        );
                                                    },
                                                    0
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* FOOTER */}

                        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-5 py-4">
                            <button
                                type="button"
                                onClick={
                                    closeStockModal
                                }
                                disabled={
                                    savingStock
                                }
                                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={saveStock}
                                disabled={
                                    savingStock
                                }
                                className="flex min-w-[130px] items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {savingStock ? (
                                    <>
                                        <FiLoader
                                            className="animate-spin"
                                            size={16}
                                        />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}