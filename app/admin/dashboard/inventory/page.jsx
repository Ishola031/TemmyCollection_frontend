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
        <main
            className="min-h-screen min-w-0 bg-[#f5f7fb] px-3 py-5 text-slate-900 sm:px-6 sm:py-7 lg:px-8"
            onClick={() => setOpenMenu(null)}
        >
            <div className="mx-auto w-full max-w-[1500px] min-w-0">
                <header className="mb-7 flex flex-col gap-5 rounded-[28px] bg-[#172554] p-5 text-white shadow-sm sm:p-7 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 sm:h-14 sm:w-14">
                            <FiPackage size={25} />
                        </div>
                        <div className="min-w-0">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Store operations</p>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Inventory</h1>
                            <p className="mt-1 max-w-xl text-sm leading-6 text-blue-100/80">Keep product availability accurate and spot stock issues before they affect an order.</p>
                        </div>
                    </div>
                    <Link href="/admin/dashboard/inventory/add" className="inline-flex min-h-11 items-center justify-center gap-2 self-stretch rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#172554] transition hover:bg-blue-50 sm:self-start lg:self-center">
                        <FiPlus size={17} /> Add product
                    </Link>
                </header>

                <section aria-label="Inventory summary" className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)] sm:p-5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm">All products</span>
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><FiPackage size={18} /></span>
                        </div>
                        <p className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{statsLoading ? "—" : stats.total_products}</p>
                        <p className="mt-1 text-xs text-slate-500">Products in your catalogue</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)] sm:p-5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm">In stock</span>
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><FiShoppingBag size={18} /></span>
                        </div>
                        <p className="mt-4 text-2xl font-bold tracking-tight text-emerald-700 sm:text-3xl">{statsLoading ? "—" : stats.in_stock}</p>
                        <p className="mt-1 text-xs text-slate-500">Available for customers</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)] sm:p-5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm">Low stock</span>
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><FiAlertTriangle size={18} /></span>
                        </div>
                        <p className="mt-4 text-2xl font-bold tracking-tight text-amber-700 sm:text-3xl">{statsLoading ? "—" : stats.low_stock}</p>
                        <p className="mt-1 text-xs text-slate-500">May need replenishing</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)] sm:p-5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm">Out of stock</span>
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-700"><FiXCircle size={18} /></span>
                        </div>
                        <p className="mt-4 text-2xl font-bold tracking-tight text-rose-700 sm:text-3xl">{statsLoading ? "—" : stats.out_of_stock}</p>
                        <p className="mt-1 text-xs text-slate-500">Currently unavailable</p>
                    </div>
                </section>

                {!statsLoading && stats.low_stock > 0 && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-amber-950 sm:px-5">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><FiAlertTriangle size={17} /></span>
                        <div className="min-w-0"><p className="text-sm font-bold">Stock needs attention</p><p className="mt-1 text-sm leading-5 text-amber-800">{stats.low_stock} {stats.low_stock === 1 ? "product is" : "products are"} running low. Review the items below and update their quantities.</p></div>
                    </div>
                )}

                <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.035)]">
                    <div className="border-b border-slate-100 p-4 sm:p-6">
                        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                            <div><h2 className="text-lg font-bold tracking-tight sm:text-xl">Product stock</h2><p className="mt-1 text-sm text-slate-500">Search, filter and manage each item in your store.</p></div>
                            <p className="text-xs font-medium text-slate-500">{pagination.count} {pagination.count === 1 ? "product" : "products"} total</p>
                        </div>
                        <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(170px,0.45fr)_minmax(150px,0.4fr)]">
                            <label className="relative block min-w-0">
                                <span className="sr-only">Search products</span><FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="search" value={search} onChange={(event) => handleSearchChange(event.target.value)} placeholder="Search by product name…" className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
                            </label>
                            <label className="relative block min-w-0"><span className="sr-only">Filter by category</span><select value={category} onChange={(event) => handleCategoryChange(event.target.value)} className="h-11 w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-9 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"><option value="">All categories</option>{categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select><FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /></label>
                            <label className="relative block min-w-0"><span className="sr-only">Filter by stock status</span><select value={status} onChange={(event) => handleStatusChange(event.target.value)} className="h-11 w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-9 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50">{STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /></label>
                        </div>
                    </div>

                    <div className="p-3 sm:p-5 lg:p-6">
                        {loading ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="animate-pulse rounded-2xl border border-slate-200 p-4"><div className="flex gap-3"><div className="h-20 w-20 rounded-xl bg-slate-100" /><div className="flex-1"><div className="h-4 w-3/4 rounded bg-slate-100" /><div className="mt-3 h-3 w-1/2 rounded bg-slate-100" /><div className="mt-4 h-4 w-1/3 rounded bg-slate-100" /></div></div><div className="mt-5 h-14 rounded-xl bg-slate-50" /></div>)}</div>
                        ) : error ? (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-8 text-center"><FiAlertTriangle className="mx-auto text-rose-600" size={24} /><p className="mt-3 text-sm font-semibold text-rose-800">{error}</p><button type="button" onClick={() => { fetchCurrentProducts(); fetchStats(); }} className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">Try again</button></div>
                        ) : products.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-14 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><FiPackage size={22} /></span><h3 className="mt-4 font-bold text-slate-900">No products found</h3><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">Try another search or remove one of the filters to see more products.</p></div>
                        ) : (
                            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                                {products.map((product) => (
                                    <article key={product.id} className="group flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)] sm:p-5">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/70">{product.image ? <img src={product.image} alt={product.name || "Product"} className="h-full w-full object-cover" /> : <FiPackage size={25} className="text-slate-400" />}</div>
                                            <div className="min-w-0 flex-1 pt-0.5">
                                                <p className="break-words text-[15px] font-bold leading-5 text-slate-900">{product.name || "Untitled product"}</p>
                                                <p className="mt-1.5 break-words text-xs leading-5 text-slate-500">{product.category?.name || "Uncategorised"}</p>
                                                <div className="mt-2"><span className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusStyle(product.status)}`}>{getStatusLabel(product.status)}</span></div>
                                            </div>
                                        </div>

                                        <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5">
                                            <div className="min-w-0 border-r border-slate-200 pr-2"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Selling price</p><p className="mt-1.5 break-words text-base font-extrabold tracking-tight text-slate-900">{formatPrice(product.price)}</p></div>
                                            <div className="min-w-0 pl-1"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total units</p><p className={`mt-1.5 text-base font-extrabold tracking-tight ${(product.total_stock ?? 0) === 0 ? "text-rose-700" : (product.total_stock ?? 0) <= 10 ? "text-amber-700" : "text-slate-900"}`}>{product.total_stock ?? 0}<span className="ml-1 text-xs font-medium text-slate-500">units</span></p></div>
                                        </div>

                                        {product.has_variations && <div className="mt-4 min-w-0"><div className="mb-2 flex items-center justify-between gap-2"><p className="text-xs font-bold text-slate-700">Variation stock</p><span className="shrink-0 text-[11px] text-slate-400">{product.variations?.length || 0} options</span></div>{product.variations?.length ? <div className="flex flex-wrap gap-1.5">{product.variations.map((variation) => <span key={variation.id} className={`max-w-full break-words rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold ${getVariationStockStyle(variation.stock)}`}>{variation.name || "Option"}: {variation.stock ?? 0}</span>)}</div> : <p className="text-xs text-slate-400">No variation details available.</p>}</div>}

                                        <div className="mt-auto pt-5">
                                            <button type="button" onClick={(event) => { event.stopPropagation(); handleUpdateStock(product); }} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#172554] px-3 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900"><FiPackage size={15} /> Update stock</button>
                                            <div className="mt-2 grid grid-cols-2 gap-2"><Link href={`/admin/dashboard/inventory/${product?.slug}`} onClick={(event) => event.stopPropagation()} className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-2 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"><FiEye size={14} /> View details</Link><Link href={`/admin/dashboard/inventory/${product?.slug}/edit`} onClick={(event) => event.stopPropagation()} className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-2 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"><FiEdit3 size={14} /> Edit product</Link></div>
                                            <button type="button" onClick={(event) => { event.stopPropagation(); handleDelete(product); }} className="mt-2 inline-flex min-h-8 w-full items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"><FiTrash2 size={13} /> Delete product</button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>

                    {!loading && products.length > 0 && totalPages > 1 && (
                        <footer className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-center text-xs text-slate-500 sm:text-left">Showing <span className="font-bold text-slate-800">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, pagination.count)}</span> of <span className="font-bold text-slate-800">{pagination.count}</span> products</p>
                            <div className="flex flex-wrap items-center justify-center gap-1.5">
                                <button type="button" disabled={!pagination.previous} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                                {getPageNumbers().map((pageNumber) => <button key={pageNumber} type="button" onClick={() => setPage(pageNumber)} className={`h-9 min-w-9 rounded-lg px-2 text-xs font-bold transition ${page === pageNumber ? "bg-[#172554] text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}>{pageNumber}</button>)}
                                <button type="button" disabled={!pagination.next} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
                            </div>
                        </footer>
                    )}
                </section>
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
        </main>
    );
}