"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    FiArrowLeft,
    FiCheck,
    FiChevronLeft,
    FiChevronRight,
    FiImage,
    FiMinus,
    FiPlus,
    FiSave,
    FiSearch,
    FiTrash2,
    FiUpload,
    FiX,
} from "react-icons/fi";

import adminApi from "../../../../api/adminApi";

export default function AddProductPage() {
    const [images, setImages] = useState([]);
    const [status, setStatus] = useState("Draft");

    /* =========================
       PRODUCT FIELDS
    ========================= */

    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [discount, setDiscount] = useState("");
    const [stock, setStock] = useState("");
    const [brand, setBrand] = useState("");
    const [tags, setTags] = useState("");
    const [isVisible, setIsVisible] = useState(true);

    /* =========================
       BRAND
    ========================= */

    const [brands, setBrands] = useState([]);
    const [brandLoading, setBrandLoading] = useState(false);
    const [brandError, setBrandError] = useState("");

    /* =========================
       COLORS / SIZES
    ========================= */

    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);

    const [colorLoading, setColorLoading] = useState(false);
    const [sizeLoading, setSizeLoading] = useState(false);

    /* =========================
       VARIATIONS
    ========================= */

    const [variations, setVariations] = useState([]);

    /* =========================
       CATEGORY STATE
       DO NOT CHANGE
    ========================= */

    const [categories, setCategories] = useState([]);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [categoryError, setCategoryError] = useState("");

    const [categoryOpen, setCategoryOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState("");
    const [categoryPath, setCategoryPath] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        fetchCategories();
        fetchBrands();
        fetchColors();
        fetchSizes();
    }, []);

    /* =========================
       FETCH CATEGORIES
       ORIGINAL SETUP
    ========================= */

    const fetchCategories = async () => {
        try {
            setCategoryLoading(true);
            setCategoryError("");

            const response = await adminApi.get("products/categories/");

            setCategories(response.data || []);
        } catch (error) {
            console.error("Failed to load categories:", error);

            setCategoryError(
                error?.response?.data?.detail ||
                    "Failed to load categories."
            );
        } finally {
            setCategoryLoading(false);
        }
    };

    /* =========================
       FETCH BRANDS
    ========================= */

    const fetchBrands = async () => {
        try {
            setBrandLoading(true);
            setBrandError("");

            const response = await adminApi.get("products/brands/");

            setBrands(response.data || []);
        } catch (error) {
            console.error("Failed to load brands:", error);

            setBrandError(
                error?.response?.data?.detail ||
                    "Failed to load brands."
            );
        } finally {
            setBrandLoading(false);
        }
    };

    /* =========================
       FETCH COLORS
    ========================= */

    const fetchColors = async () => {
        try {
            setColorLoading(true);

            const response = await adminApi.get("products/colors/");

            setColors(response.data || []);
        } catch (error) {
            console.error("Failed to load colors:", error);
        } finally {
            setColorLoading(false);
        }
    };

    /* =========================
       FETCH SIZES
    ========================= */

    const fetchSizes = async () => {
        try {
            setSizeLoading(true);

            const response = await adminApi.get("products/sizes/");

            setSizes(response.data || []);
        } catch (error) {
            console.error("Failed to load sizes:", error);
        } finally {
            setSizeLoading(false);
        }
    };

    /* =========================
       IMAGES
    ========================= */

    const handleImages = (event) => {
        const files = Array.from(event.target.files || []);

        setImages((previous) => [
            ...previous,
            ...files.map((file) => ({
                file,
                name: file.name,
                url: URL.createObjectURL(file),
            })),
        ]);

        event.target.value = "";
    };

    const removeImage = (index) => {
        setImages((previous) =>
            previous.filter((_, imageIndex) => imageIndex !== index)
        );
    };

    /* =========================
       CATEGORY HELPERS
       ORIGINAL SETUP
    ========================= */

    const flattenCategories = (items, parents = []) => {
        let result = [];

        items.forEach((category) => {
            const currentPath = [
                ...parents,
                {
                    id: category.id,
                    name: category.name,
                },
            ];

            result.push({
                ...category,
                path: currentPath,
            });

            if (category.children?.length) {
                result = [
                    ...result,
                    ...flattenCategories(category.children, currentPath),
                ];
            }
        });

        return result;
    };

    const allCategories = useMemo(() => {
        return flattenCategories(categories);
    }, [categories]);

    const filteredCategories = useMemo(() => {
        const search = categorySearch.trim().toLowerCase();

        if (!search) {
            return [];
        }

        return allCategories.filter((category) => {
            const fullPath = category.path
                .map((item) => item.name)
                .join(" → ")
                .toLowerCase();

            return (
                category.name.toLowerCase().includes(search) ||
                fullPath.includes(search)
            );
        });
    }, [categorySearch, allCategories]);

    const currentCategories = useMemo(() => {
        if (categoryPath.length === 0) {
            return categories;
        }

        const currentParent =
            categoryPath[categoryPath.length - 1];

        return currentParent.children || [];
    }, [categories, categoryPath]);

    const selectCategoryLevel = (category) => {
        if (category.children?.length) {
            setCategoryPath((previous) => [
                ...previous,
                category,
            ]);
            setCategorySearch("");
            return;
        }

        selectFinalCategory(category);
    };

    const selectFinalCategory = (category) => {
        const path = [...categoryPath, category];

        setSelectedCategory({
            id: category.id,
            name: category.name,
            path,
        });

        setCategoryOpen(false);
        setCategorySearch("");
        setCategoryPath([]);
    };

    const selectSearchResult = (category) => {
        setSelectedCategory({
            id: category.id,
            name: category.name,
            path: category.path,
        });

        setCategoryOpen(false);
        setCategorySearch("");
        setCategoryPath([]);
    };

    const goBackCategory = () => {
        setCategoryPath((previous) =>
            previous.slice(0, -1)
        );
    };

    const closeCategoryPicker = () => {
        setCategoryOpen(false);
        setCategorySearch("");
        setCategoryPath([]);
    };

    /* =========================
       VARIATION HELPERS
    ========================= */

    const addVariation = () => {
        setVariations((previous) => [
            ...previous,
            {
                id: Date.now(),
                color: "",
                size: "",
                price: "",
                stock: "",
            },
        ]);
    };

    const removeVariation = (id) => {
        setVariations((previous) =>
            previous.filter((variation) => variation.id !== id)
        );
    };

    const updateVariation = (id, field, value) => {
        setVariations((previous) =>
            previous.map((variation) =>
                variation.id === id
                    ? {
                          ...variation,
                          [field]: value,
                      }
                    : variation
            )
        );
    };

    const duplicateVariation = (variation) => {
        setVariations((previous) => [
            ...previous,
            {
                ...variation,
                id: Date.now(),
            },
        ]);
    };

    /* =========================
       FORMAT PRICE
    ========================= */

    const formatNumber = (value) => {
        if (!value) return "";

        return Number(value).toLocaleString("en-NG");
    };

    return (
        <div className="px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin/dashboard/products"
                    className="mb-5 inline-flex items-center gap-2 text-xs text-gray-400 transition hover:text-black"
                >
                    <FiArrowLeft size={14} />
                    Back to products
                </Link>

                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                            Product catalog
                        </p>

                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Add product
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Create a new product for your Temmy Collection
                            store.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setStatus("Draft")}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-semibold hover:bg-gray-50"
                        >
                            <FiSave size={15} />
                            Save draft
                        </button>

                        <button
                            onClick={() => setStatus("Published")}
                            className="flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-xs font-semibold text-white hover:bg-gray-800"
                        >
                            <FiCheck size={15} />
                            Publish product
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                {/* Main */}
                <div className="space-y-5">
                    {/* Basic Information */}
                    <section className="rounded-2xl border border-gray-200 bg-white">
                        <div className="border-b border-gray-100 p-5 sm:p-6">
                            <h2 className="text-sm font-bold">
                                Basic information
                            </h2>

                            <p className="mt-1 text-[10px] text-gray-400">
                                Add the main information about your product.
                            </p>
                        </div>

                        <div className="space-y-5 p-5 sm:p-6">
                            <div>
                                <label className="mb-2 block text-[10px] font-semibold text-gray-500">
                                    Product name
                                </label>

                                <input
                                    value={productName}
                                    onChange={(event) =>
                                        setProductName(event.target.value)
                                    }
                                    placeholder="e.g. Premium Leather Handbag"
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs outline-none transition focus:border-black focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-[10px] font-semibold text-gray-500">
                                    Description
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(event.target.value)
                                    }
                                    rows={6}
                                    placeholder="Describe your product..."
                                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs leading-5 outline-none transition focus:border-black focus:bg-white"
                                />
                            </div>

                            {/* CATEGORY - UNCHANGED */}
                            <div>
                                <label className="mb-2 block text-[10px] font-semibold text-gray-500">
                                    Category
                                </label>

                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCategoryOpen(
                                                (previous) => !previous
                                            )
                                        }
                                        className="flex min-h-11 w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 text-left text-xs outline-none transition hover:border-gray-300 focus:border-black focus:bg-white"
                                    >
                                        <div className="min-w-0">
                                            {selectedCategory ? (
                                                <>
                                                    <p className="truncate font-semibold text-gray-900">
                                                        {
                                                            selectedCategory.name
                                                        }
                                                    </p>

                                                    <p className="mt-0.5 truncate text-[9px] text-gray-400">
                                                        {selectedCategory.path
                                                            .map(
                                                                (item) =>
                                                                    item.name
                                                            )
                                                            .join(" → ")}
                                                    </p>
                                                </>
                                            ) : (
                                                <span className="text-gray-400">
                                                    Select product category
                                                </span>
                                            )}
                                        </div>

                                        <FiChevronRight
                                            size={15}
                                            className="shrink-0 text-gray-400"
                                        />
                                    </button>

                                    {categoryOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={
                                                    closeCategoryPicker
                                                }
                                            />

                                            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                                                <div className="border-b border-gray-100 p-3">
                                                    <div className="relative">
                                                        <FiSearch
                                                            size={14}
                                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                        />

                                                        <input
                                                            autoFocus
                                                            value={
                                                                categorySearch
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                setCategorySearch(
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Search categories..."
                                                            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-9 text-xs outline-none focus:border-black focus:bg-white"
                                                        />

                                                        {categorySearch && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setCategorySearch(
                                                                        ""
                                                                    )
                                                                }
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                                                            >
                                                                <FiX
                                                                    size={14}
                                                                />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {categorySearch.trim() ? (
                                                    <div className="max-h-72 overflow-y-auto p-2">
                                                        {filteredCategories.length ===
                                                        0 ? (
                                                            <div className="px-3 py-8 text-center">
                                                                <p className="text-xs font-semibold">
                                                                    No category
                                                                    found
                                                                </p>

                                                                <p className="mt-1 text-[10px] text-gray-400">
                                                                    Try another
                                                                    category
                                                                    name.
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            filteredCategories.map(
                                                                (
                                                                    category
                                                                ) => (
                                                                    <button
                                                                        key={
                                                                            category.id
                                                                        }
                                                                        type="button"
                                                                        onClick={() =>
                                                                            selectSearchResult(
                                                                                category
                                                                            )
                                                                        }
                                                                        className="w-full rounded-xl px-3 py-3 text-left transition hover:bg-gray-50"
                                                                    >
                                                                        <p className="text-xs font-semibold text-gray-900">
                                                                            {
                                                                                category.name
                                                                            }
                                                                        </p>

                                                                        <p className="mt-1 text-[9px] text-gray-400">
                                                                            {category.path
                                                                                .map(
                                                                                    (
                                                                                        item
                                                                                    ) =>
                                                                                        item.name
                                                                                )
                                                                                .join(
                                                                                    " → "
                                                                                )}
                                                                        </p>
                                                                    </button>
                                                                )
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5">
                                                            {categoryPath.length >
                                                                0 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={
                                                                        goBackCategory
                                                                    }
                                                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg hover:bg-gray-100"
                                                                >
                                                                    <FiChevronLeft
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                </button>
                                                            )}

                                                            <div className="min-w-0">
                                                                {categoryPath.length ===
                                                                0 ? (
                                                                    <p className="text-[10px] font-semibold text-gray-500">
                                                                        All
                                                                        categories
                                                                    </p>
                                                                ) : (
                                                                    <div className="flex min-w-0 items-center gap-1 overflow-hidden">
                                                                        {categoryPath.map(
                                                                            (
                                                                                item,
                                                                                index
                                                                            ) => (
                                                                                <React.Fragment
                                                                                    key={
                                                                                        item.id
                                                                                    }
                                                                                >
                                                                                    {index >
                                                                                        0 && (
                                                                                        <FiChevronRight
                                                                                            size={
                                                                                                10
                                                                                            }
                                                                                            className="shrink-0 text-gray-300"
                                                                                        />
                                                                                    )}

                                                                                    <span
                                                                                        className={`truncate text-[10px] ${
                                                                                            index ===
                                                                                            categoryPath.length -
                                                                                                1
                                                                                                ? "font-semibold text-black"
                                                                                                : "text-gray-400"
                                                                                        }`}
                                                                                    >
                                                                                        {
                                                                                            item.name
                                                                                        }
                                                                                    </span>
                                                                                </React.Fragment>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="max-h-72 overflow-y-auto p-2">
                                                            {categoryLoading ? (
                                                                <div className="px-3 py-8 text-center">
                                                                    <p className="text-xs text-gray-400">
                                                                        Loading
                                                                        categories...
                                                                    </p>
                                                                </div>
                                                            ) : categoryError ? (
                                                                <div className="px-3 py-8 text-center">
                                                                    <p className="text-xs font-semibold text-red-500">
                                                                        {
                                                                            categoryError
                                                                        }
                                                                    </p>

                                                                    <button
                                                                        type="button"
                                                                        onClick={
                                                                            fetchCategories
                                                                        }
                                                                        className="mt-3 rounded-lg bg-black px-3 py-2 text-[10px] font-semibold text-white"
                                                                    >
                                                                        Try
                                                                        again
                                                                    </button>
                                                                </div>
                                                            ) : currentCategories.length ===
                                                              0 ? (
                                                                <div className="px-3 py-8 text-center">
                                                                    <p className="text-xs font-semibold">
                                                                        No
                                                                        categories
                                                                        found
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                currentCategories.map(
                                                                    (
                                                                        category
                                                                    ) => (
                                                                        <button
                                                                            key={
                                                                                category.id
                                                                            }
                                                                            type="button"
                                                                            onClick={() =>
                                                                                selectCategoryLevel(
                                                                                    category
                                                                                )
                                                                            }
                                                                            className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-gray-50"
                                                                        >
                                                                            <div className="min-w-0">
                                                                                <p className="truncate text-xs font-semibold text-gray-900">
                                                                                    {
                                                                                        category.name
                                                                                    }
                                                                                </p>

                                                                                {category.children?.length >
                                                                                    0 && (
                                                                                    <p className="mt-1 text-[9px] text-gray-400">
                                                                                        {
                                                                                            category
                                                                                                .children
                                                                                                .length
                                                                                        }{" "}
                                                                                        subcategories
                                                                                    </p>
                                                                                )}
                                                                            </div>

                                                                            {category.children?.length >
                                                                            0 ? (
                                                                                <FiChevronRight
                                                                                    size={
                                                                                        14
                                                                                    }
                                                                                    className="shrink-0 text-gray-400"
                                                                                />
                                                                            ) : (
                                                                                <FiCheck
                                                                                    size={
                                                                                        14
                                                                                    }
                                                                                    className="shrink-0 text-gray-300"
                                                                                />
                                                                            )}
                                                                        </button>
                                                                    )
                                                                )
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {selectedCategory && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedCategory(null)
                                        }
                                        className="mt-2 text-[9px] font-semibold text-gray-400 hover:text-black"
                                    >
                                        Clear category
                                    </button>
                                )}
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="mb-2 block text-[10px] font-semibold text-gray-500">
                                    Product tags
                                </label>

                                <input
                                    value={tags}
                                    onChange={(event) =>
                                        setTags(event.target.value)
                                    }
                                    placeholder="fashion, new, premium..."
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs outline-none transition focus:border-black focus:bg-white"
                                />

                                <p className="mt-2 text-[9px] text-gray-400">
                                    Separate tags with commas.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Pricing */}
                    <section className="rounded-2xl border border-gray-200 bg-white">
                        <div className="border-b border-gray-100 p-5 sm:p-6">
                            <h2 className="text-sm font-bold">
                                Pricing & inventory
                            </h2>

                            <p className="mt-1 text-[10px] text-gray-400">
                                Set your product price, discount and inventory.
                            </p>
                        </div>

                        <div className="space-y-5 p-5 sm:p-6">
                            <div className="grid gap-5 sm:grid-cols-2">
                                {/* Price */}
                                <div>
                                    <label className="mb-2 block text-[10px] font-semibold text-gray-500">
                                        Price
                                    </label>

                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                            ₦
                                        </span>

                                        <input
                                            type="number"
                                            min="0"
                                            value={price}
                                            onChange={(event) =>
                                                setPrice(event.target.value)
                                            }
                                            placeholder="0"
                                            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-3 text-xs outline-none focus:border-black focus:bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Discount */}
                                <div>
                                    <label className="mb-2 block text-[10px] font-semibold text-gray-500">
                                        Discount
                                    </label>

                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={discount}
                                            onChange={(event) =>
                                                setDiscount(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="0"
                                            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 pr-10 text-xs outline-none focus:border-black focus:bg-white"
                                        />

                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                            %
                                        </span>
                                    </div>

                                    <p className="mt-2 text-[9px] text-gray-400">
                                        Enter a percentage from 0 to 100.
                                    </p>
                                </div>
                            </div>

                            {/* Stock */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="block text-[10px] font-semibold text-gray-500">
                                        Product stock
                                    </label>

                                    {variations.length > 0 && (
                                        <span className="text-[9px] font-medium text-gray-400">
                                            Managed by variations
                                        </span>
                                    )}
                                </div>

                                <input
                                    type="number"
                                    min="0"
                                    value={stock}
                                    onChange={(event) =>
                                        setStock(event.target.value)
                                    }
                                    disabled={variations.length > 0}
                                    placeholder="0"
                                    className={`h-11 w-full rounded-xl border border-gray-200 px-3 text-xs outline-none focus:border-black ${
                                        variations.length > 0
                                            ? "cursor-not-allowed bg-gray-100 text-gray-400"
                                            : "bg-gray-50 focus:bg-white"
                                    }`}
                                />

                                <p className="mt-2 text-[9px] text-gray-400">
                                    {variations.length > 0
                                        ? "Stock is controlled separately for each variation."
                                        : "Use this when the product does not have size or color variations."}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Images */}
                    <section className="rounded-2xl border border-gray-200 bg-white">
                        <div className="border-b border-gray-100 p-5 sm:p-6">
                            <h2 className="text-sm font-bold">
                                Product images
                            </h2>

                            <p className="mt-1 text-[10px] text-gray-400">
                                Add clear images of your product.
                            </p>
                        </div>

                        <div className="p-5 sm:p-6">
                            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 text-center transition hover:border-black hover:bg-white">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                                    <FiUpload
                                        size={18}
                                        className="text-gray-500"
                                    />
                                </div>

                                <p className="mt-3 text-xs font-semibold">
                                    Upload product images
                                </p>

                                <p className="mt-1 text-[10px] text-gray-400">
                                    PNG, JPG or WEBP
                                </p>

                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImages}
                                    className="hidden"
                                />
                            </label>

                            {images.length > 0 && (
                                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {images.map((image, index) => (
                                        <div
                                            key={`${image.name}-${index}`}
                                            className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                                        >
                                            <img
                                                src={image.url}
                                                alt={image.name}
                                                className="h-full w-full object-cover"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeImage(index)
                                                }
                                                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                                            >
                                                <FiTrash2 size={12} />
                                            </button>

                                            {index === 0 && (
                                                <span className="absolute bottom-2 left-2 rounded-full bg-white px-2 py-1 text-[8px] font-bold">
                                                    Main image
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Variations */}
                    <section className="rounded-2xl border border-gray-200 bg-white">
                        <div className="border-b border-gray-100 p-5 sm:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-bold">
                                        Product variations
                                    </h2>

                                    <p className="mt-1 text-[10px] text-gray-400">
                                        Add sizes, colors and separate stock
                                        for each variation.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={addVariation}
                                    className="flex items-center gap-1.5 rounded-lg bg-black px-3 py-2 text-[10px] font-semibold text-white hover:bg-gray-800"
                                >
                                    <FiPlus size={13} />
                                    Add variation
                                </button>
                            </div>
                        </div>

                        <div className="p-5 sm:p-6">
                            {variations.length === 0 ? (
                                <div className="rounded-xl bg-gray-50 p-7 text-center">
                                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white">
                                        <FiPlus
                                            size={20}
                                            className="text-gray-300"
                                        />
                                    </div>

                                    <p className="mt-3 text-xs font-semibold">
                                        No variations added
                                    </p>

                                    <p className="mx-auto mt-1 max-w-sm text-[10px] leading-5 text-gray-400">
                                        Add variations if this product comes
                                        in different sizes or colors.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={addVariation}
                                        className="mt-4 rounded-lg bg-black px-4 py-2.5 text-[10px] font-semibold text-white"
                                    >
                                        Add first variation
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {variations.map(
                                        (variation, index) => (
                                            <div
                                                key={variation.id}
                                                className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                                            >
                                                <div className="mb-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-bold">
                                                            Variation{" "}
                                                            {index + 1}
                                                        </p>

                                                        <p className="mt-0.5 text-[9px] text-gray-400">
                                                            Set the color,
                                                            size, price and
                                                            stock.
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                duplicateVariation(
                                                                    variation
                                                                )
                                                            }
                                                            title="Duplicate"
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-black"
                                                        >
                                                            <FiPlus
                                                                size={13}
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeVariation(
                                                                    variation.id
                                                                )
                                                            }
                                                            title="Remove"
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:text-red-500"
                                                        >
                                                            <FiTrash2
                                                                size={13}
                                                            />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    {/* Color */}
                                                    <div>
                                                        <label className="mb-2 block text-[10px] font-semibold text-gray-500">
                                                            Color
                                                        </label>

                                                        <select
                                                            value={
                                                                variation.color
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateVariation(
                                                                    variation.id,
                                                                    "color",
                                                                    event.target
                                                                        .value
                                                                )
                                                            }
                                                            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-black"
                                                        >
                                                            <option value="">
                                                                Select color
                                                            </option>

                                                            {colors.map(
                                                                (color) => (
                                                                    <option
                                                                        key={
                                                                            color.id
                                                                        }
                                                                        value={
                                                                            color.id
                                                                        }
                                                                    >
                                                                        {
                                                                            color.name
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>

                                                        {colorLoading && (
                                                            <p className="mt-1 text-[9px] text-gray-400">
                                                                Loading colors...
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Size */}
                                                    <div>
                                                        <label className="mb-2 block text-[10px] font-semibold text-gray-500">
                                                            Size
                                                        </label>

                                                        <select
                                                            value={
                                                                variation.size
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateVariation(
                                                                    variation.id,
                                                                    "size",
                                                                    event.target
                                                                        .value
                                                                )
                                                            }
                                                            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-black"
                                                        >
                                                            <option value="">
                                                                Select size
                                                            </option>

                                                            {sizes.map(
                                                                (size) => (
                                                                    <option
                                                                        key={
                                                                            size.id
                                                                        }
                                                                        value={
                                                                            size.id
                                                                        }
                                                                    >
                                                                        {
                                                                            size.name
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>

                                                        {sizeLoading && (
                                                            <p className="mt-1 text-[9px] text-gray-400">
                                                                Loading sizes...
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Variation price */}
                                                    <div>
                                                        <label className="mb-2 block text-[10px] font-semibold text-gray-500">
                                                            Variation price
                                                        </label>

                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                                                ₦
                                                            </span>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={
                                                                    variation.price
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    updateVariation(
                                                                        variation.id,
                                                                        "price",
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder={
                                                                    price
                                                                        ? formatNumber(
                                                                              price
                                                                          )
                                                                        : "Use product price"
                                                                }
                                                                className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-black"
                                                            />
                                                        </div>

                                                        <p className="mt-1 text-[9px] text-gray-400">
                                                            Optional. Leave
                                                            empty to use the
                                                            product price.
                                                        </p>
                                                    </div>

                                                    {/* Variation stock */}
                                                    <div>
                                                        <label className="mb-2 block text-[10px] font-semibold text-gray-500">
                                                            Stock
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                variation.stock
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateVariation(
                                                                    variation.id,
                                                                    "stock",
                                                                    event.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="0"
                                                            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-black"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}

                                    <button
                                        type="button"
                                        onClick={addVariation}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-3 text-[10px] font-semibold text-gray-500 hover:border-black hover:text-black"
                                    >
                                        <FiPlus size={13} />
                                        Add another variation
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                    {/* Status */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-5">
                        <h2 className="text-sm font-bold">
                            Product status
                        </h2>

                        <div className="mt-4 space-y-2">
                            <button
                                type="button"
                                onClick={() => setStatus("Draft")}
                                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${
                                    status === "Draft"
                                        ? "border-black bg-gray-50"
                                        : "border-gray-200"
                                }`}
                            >
                                <div>
                                    <p className="text-xs font-semibold">
                                        Draft
                                    </p>

                                    <p className="mt-1 text-[9px] text-gray-400">
                                        Only visible to admins
                                    </p>
                                </div>

                                {status === "Draft" && (
                                    <FiCheck size={15} />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setStatus("Published")
                                }
                                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${
                                    status === "Published"
                                        ? "border-black bg-gray-50"
                                        : "border-gray-200"
                                }`}
                            >
                                <div>
                                    <p className="text-xs font-semibold">
                                        Published
                                    </p>

                                    <p className="mt-1 text-[9px] text-gray-400">
                                        Visible on your storefront
                                    </p>
                                </div>

                                {status === "Published" && (
                                    <FiCheck size={15} />
                                )}
                            </button>
                        </div>
                    </section>

                    {/* Organization */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-5">
                        <h2 className="text-sm font-bold">
                            Organization
                        </h2>

                        <div className="mt-4 space-y-4">
                            {/* Brand */}
                            <div>
                                <label className="mb-2 block text-[10px] font-semibold text-gray-500">
                                    Brand
                                </label>

                                <select
                                    value={brand}
                                    onChange={(event) =>
                                        setBrand(event.target.value)
                                    }
                                    className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs outline-none focus:border-black focus:bg-white"
                                >
                                    <option value="">
                                        Select brand
                                    </option>

                                    {brands.map((item) => (
                                        <option
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.name}
                                        </option>
                                    ))}
                                </select>

                                {brandLoading && (
                                    <p className="mt-2 text-[9px] text-gray-400">
                                        Loading brands...
                                    </p>
                                )}

                                {brandError && (
                                    <p className="mt-2 text-[9px] text-red-500">
                                        {brandError}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Visibility */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-5">
                        <h2 className="text-sm font-bold">
                            Visibility
                        </h2>

                        <button
                            type="button"
                            onClick={() =>
                                setIsVisible((previous) => !previous)
                            }
                            className="mt-4 flex w-full items-center justify-between rounded-xl bg-gray-50 p-3"
                        >
                            <div className="text-left">
                                <p className="text-xs font-semibold">
                                    Storefront
                                </p>

                                <p className="mt-1 text-[9px] text-gray-400">
                                    Show this product to customers
                                </p>
                            </div>

                            <div
                                className={`flex h-6 w-11 items-center rounded-full px-1 transition ${
                                    isVisible
                                        ? "bg-black"
                                        : "bg-gray-300"
                                }`}
                            >
                                <div
                                    className={`h-4 w-4 rounded-full bg-white transition ${
                                        isVisible
                                            ? "ml-auto"
                                            : "ml-0"
                                    }`}
                                />
                            </div>
                        </button>
                    </section>

                    {/* Image tip */}
                    <div className="rounded-2xl bg-black p-5 text-white">
                        <FiImage size={18} />

                        <h3 className="mt-4 text-xs font-bold">
                            Product photography
                        </h3>

                        <p className="mt-2 text-[10px] leading-5 text-white/50">
                            Use high-quality images with a clean background
                            to make your products stand out.
                        </p>
                    </div>
                </div>
            </div>

            <p className="py-8 text-center text-[10px] text-gray-400">
                © {new Date().getFullYear()} Temmy Collection · Admin
                Dashboard
            </p>
        </div>
    );
}