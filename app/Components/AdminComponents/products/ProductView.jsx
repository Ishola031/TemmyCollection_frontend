"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    FiArrowLeft,
    FiEdit3,
    FiExternalLink,
    FiImage,
    FiPackage,
    FiShoppingBag,
    FiStar,
    FiTrash2,
    FiChevronLeft,
    FiChevronRight,
    FiMoreHorizontal,
    FiLayers,
    FiDollarSign,
} from "react-icons/fi";
import adminApi from "../../../api/adminApi";

export default function ProductDetails() {
    const params = useParams();
    const id = params?.productid;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        if (!id) return;

        let cancelled = false;

        const getProduct = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await adminApi.get(`products/${id}/`);

                if (!cancelled) {
                    setProduct(response.data);
                    setSelectedImage(0);
                }
            } catch (err) {
                console.error("Failed to load product:", err);

                if (!cancelled) {
                    setError(
                        err.response?.data?.error ||
                            "Failed to load product."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        getProduct();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const images = useMemo(() => {
        if (!product) return [];

        const productImages = [];

        if (product.image) productImages.push(product.image);

        product.images?.forEach((item) => {
            if (item?.image && !productImages.includes(item.image)) {
                productImages.push(item.image);
            }
        });

        return productImages;
    }, [product]);

    const activeImage = images[selectedImage] || "";

    const nextImage = () => {
        if (images.length > 1) {
            setSelectedImage((current) => (current + 1) % images.length);
        }
    };

    const previousImage = () => {
        if (images.length > 1) {
            setSelectedImage(
                (current) => (current - 1 + images.length) % images.length
            );
        }
    };

    const formatPrice = (value) =>
        `₦${Number(value || 0).toLocaleString("en-NG")}`;

    const formatDate = (value) => {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "—";

        return date.toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getVariationName = (variation) => {
        const color = variation?.color?.name;
        const size = variation?.size?.name;

        if (color && size) return `${color} / ${size}`;

        return color || size || "Default";
    };

    if (loading) {
        return (
            <div className="w-full min-w-0 px-4 py-5 sm:px-6 lg:px-7">
                <div className="animate-pulse">
                    <div className="h-4 w-28 rounded bg-gray-200" />
                    <div className="mt-5 h-7 w-52 max-w-full rounded bg-gray-200" />

                    <div className="mt-7 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_290px]">
                        <div className="space-y-4">
                            <div className="aspect-[4/3] max-h-[420px] rounded-2xl bg-gray-100" />
                            <div className="h-28 rounded-2xl bg-gray-100" />
                            <div className="h-48 rounded-2xl bg-gray-100" />
                        </div>

                        <div className="space-y-4">
                            <div className="h-28 rounded-2xl bg-gray-100" />
                            <div className="h-36 rounded-2xl bg-gray-100" />
                            <div className="h-40 rounded-2xl bg-gray-100" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-7">
                <Link
                    href="/admin/dashboard/products"
                    className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-black"
                >
                    <FiArrowLeft size={14} />
                    Back to products
                </Link>

                <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
                    <p className="text-sm font-semibold text-red-600">
                        {error || "Product not found."}
                    </p>

                    <Link
                        href="/admin/dashboard/products"
                        className="mt-4 inline-flex rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white"
                    >
                        Back to products
                    </Link>
                </div>
            </div>
        );
    }

    const stock = Number(product.total_stock ?? product.stock ?? 0);
    const discount = Number(product.discount || 0);
    const isLowStock = stock > 0 && stock <= 5;
    const isOutOfStock = stock <= 0;
    const status = product.is_available ? "Published" : "Unavailable";

    const cardClass =
        "min-w-0 rounded-2xl border border-gray-200 bg-white";

    const sectionHeading = "text-sm font-bold text-gray-900";
    const mutedText = "text-[10px] leading-4 text-gray-400";

    return (
        <div className="w-full min-w-0 overflow-x-hidden px-3 py-5 sm:px-5 sm:py-6 lg:px-6 xl:px-7">
            {/* Header */}
            <header className="mb-6">
                <Link
                    href="/admin/dashboard/products"
                    className="mb-4 inline-flex items-center gap-2 text-xs text-gray-500 transition hover:text-black"
                >
                    <FiArrowLeft size={14} />
                    Back to products
                </Link>

                <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                            Product details
                        </p>

                        <h1 className="break-words text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                            {product.name}
                        </h1>

                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-gray-400">
                            <span>Products</span>
                            <span>/</span>
                            <span>
                                {product.category?.name || "Uncategorized"}
                            </span>
                            <span>/</span>
                            <span>ID: {product.id}</span>
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                        <Link
                            href={`/store/${product.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold transition hover:bg-gray-50 sm:px-4"
                        >
                            <FiExternalLink size={14} />
                            View store
                        </Link>

                        <Link
                            href={`/admin/dashboard/products/${product.id}/edit`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-gray-800 sm:px-4"
                        >
                            <FiEdit3 size={14} />
                            Edit product
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main layout */}
            <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_280px] 2xl:grid-cols-[minmax(0,1fr)_300px]">
                <main className="min-w-0 space-y-4">
                    {/* Product images */}
                    <section className={`${cardClass} overflow-hidden p-3 sm:p-4`}>
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h2 className={sectionHeading}>
                                    Product images
                                </h2>
                                <p className={`mt-1 ${mutedText}`}>
                                    Images attached to this product.
                                </p>
                            </div>

                            <button
                                type="button"
                                aria-label="Image options"
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-black"
                            >
                                <FiMoreHorizontal size={17} />
                            </button>
                        </div>

                        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[76px_minmax(0,1fr)]">
                            {/* Thumbnails */}
                            <div className="order-2 flex min-w-0 gap-2 overflow-x-auto pb-1 sm:order-1 sm:max-h-[350px] sm:flex-col sm:overflow-x-hidden sm:overflow-y-auto">
                                {images.length > 0 ? (
                                    images.map((image, index) => (
                                        <button
                                            key={`${image}-${index}`}
                                            type="button"
                                            onClick={() => setSelectedImage(index)}
                                            aria-label={`View product image ${index + 1}`}
                                            aria-pressed={selectedImage === index}
                                            className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-gray-50 transition sm:h-[68px] sm:w-[68px] ${
                                                selectedImage === index
                                                    ? "border-black ring-1 ring-black"
                                                    : "border-gray-200 hover:border-gray-400"
                                            }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${product.name} ${index + 1}`}
                                                className="h-full w-full object-contain"
                                            />

                                            {index === 0 && (
                                                <span className="absolute bottom-0.5 left-0.5 rounded bg-black px-1 py-0.5 text-[7px] font-semibold text-white">
                                                    Main
                                                </span>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100 sm:h-[68px] sm:w-[68px]">
                                        <FiImage
                                            size={22}
                                            className="text-gray-300"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Main image */}
                            <div className="relative order-1 flex h-[250px] min-w-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50 sm:order-2 sm:h-[300px] md:h-[340px] lg:h-[370px] 2xl:h-[400px]">
                                {activeImage ? (
                                    <img
                                        src={activeImage}
                                        alt={product.name}
                                        className="h-full w-full object-contain p-2"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-300">
                                        <FiImage size={40} />
                                        <span className="text-xs">
                                            No product image
                                        </span>
                                    </div>
                                )}

                                {discount > 0 && (
                                    <span className="absolute left-3 top-3 rounded-full bg-black px-2.5 py-1 text-[10px] font-bold text-white">
                                        -{discount}%
                                    </span>
                                )}

                                {images.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={previousImage}
                                            aria-label="Previous image"
                                            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:bg-white sm:left-3"
                                        >
                                            <FiChevronLeft size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={nextImage}
                                            aria-label="Next image"
                                            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:bg-white sm:right-3"
                                        >
                                            <FiChevronRight size={16} />
                                        </button>

                                        <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-[9px] font-semibold text-white">
                                            {selectedImage + 1} / {images.length}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Description */}
                    <section className={`${cardClass} p-4 sm:p-5`}>
                        <h2 className={sectionHeading}>Description</h2>

                        <p className="mt-3 whitespace-pre-line break-words text-xs leading-6 text-gray-500">
                            {product.description ||
                                "No description has been added for this product."}
                        </p>
                    </section>

                    {/* Performance */}
                    <section className={`${cardClass} overflow-hidden`}>
                        <div className="border-b border-gray-100 px-4 py-3.5 sm:px-5">
                            <h2 className={sectionHeading}>
                                Product performance
                            </h2>
                            <p className={`mt-1 ${mutedText}`}>
                                Overview of this product&apos;s activity.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 sm:grid-cols-4 sm:divide-y-0">
                            <div className="min-w-0 p-3.5 sm:p-4">
                                <FiShoppingBag
                                    size={16}
                                    className="text-gray-400"
                                />
                                <p className={`mt-3 ${mutedText}`}>Units sold</p>
                                <p className="mt-1 break-words text-lg font-bold">
                                    {Number(
                                        product.total_sold || 0
                                    ).toLocaleString()}
                                </p>
                            </div>

                            <div className="min-w-0 p-3.5 sm:p-4">
                                <FiPackage
                                    size={16}
                                    className="text-gray-400"
                                />
                                <p className={`mt-3 ${mutedText}`}>
                                    Current stock
                                </p>
                                <p
                                    className={`mt-1 text-lg font-bold ${
                                        isOutOfStock
                                            ? "text-red-500"
                                            : isLowStock
                                              ? "text-orange-500"
                                              : "text-gray-900"
                                    }`}
                                >
                                    {stock.toLocaleString()}
                                </p>
                            </div>

                            <div className="min-w-0 p-3.5 sm:p-4">
                                <FiStar
                                    size={16}
                                    className="text-gray-400"
                                />
                                <p className={`mt-3 ${mutedText}`}>Rating</p>
                                <div className="mt-1 flex items-center gap-1">
                                    <span className="text-lg font-bold">
                                        {Number(product.rating || 0).toFixed(1)}
                                    </span>
                                    <FiStar
                                        size={12}
                                        className="fill-black"
                                    />
                                </div>
                            </div>

                            <div className="min-w-0 p-3.5 sm:p-4">
                                <FiStar
                                    size={16}
                                    className="text-gray-400"
                                />
                                <p className={`mt-3 ${mutedText}`}>
                                    Customer reviews
                                </p>
                                <p className="mt-1 text-lg font-bold">
                                    {Number(
                                        product.review_count || 0
                                    ).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Variations */}
                    <section className={`${cardClass} overflow-hidden`}>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3.5 sm:px-5">
                            <div>
                                <h2 className={sectionHeading}>Variations</h2>
                                <p className={`mt-1 ${mutedText}`}>
                                    Product options and inventory.
                                </p>
                            </div>

                            <span className="rounded-lg border border-gray-200 px-3 py-2 text-[10px] font-semibold text-gray-500">
                                {product.variations?.length || 0} options
                            </span>
                        </div>

                        {product.variations?.length > 0 ? (
                            <div className="w-full min-w-0 overflow-x-auto">
                                <table className="w-full min-w-[480px] text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/70">
                                            <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                                                Variation
                                            </th>
                                            <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                                                Price
                                            </th>
                                            <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                                                Stock
                                            </th>
                                            <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {product.variations.map((variation) => {
                                            const variationStock = Number(
                                                variation.stock || 0
                                            );

                                            return (
                                                <tr
                                                    key={variation.id}
                                                    className="border-b border-gray-50 last:border-0"
                                                >
                                                    <td className="px-4 py-3">
                                                        <p className="text-xs font-semibold">
                                                            {getVariationName(
                                                                variation
                                                            )}
                                                        </p>
                                                        <p className="mt-1 text-[9px] text-gray-400">
                                                            ID: {variation.id}
                                                        </p>
                                                    </td>

                                                    <td className="px-4 py-3 text-xs font-semibold">
                                                        {formatPrice(
                                                            variation.price ??
                                                                product.price
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`text-xs font-semibold ${
                                                                variationStock <= 0
                                                                    ? "text-red-500"
                                                                    : variationStock <=
                                                                        5
                                                                      ? "text-orange-500"
                                                                      : "text-gray-600"
                                                            }`}
                                                        >
                                                            {variationStock}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-1 text-[9px] font-semibold ${
                                                                variation.is_active
                                                                    ? "bg-emerald-50 text-emerald-600"
                                                                    : "bg-red-50 text-red-500"
                                                            }`}
                                                        >
                                                            {variation.is_active
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <FiLayers
                                    size={23}
                                    className="mx-auto text-gray-300"
                                />
                                <p className="mt-3 text-xs font-semibold">
                                    No variations
                                </p>
                                <p className={`mt-1 ${mutedText}`}>
                                    This product has no variations.
                                </p>
                            </div>
                        )}
                    </section>
                </main>

                {/* Sidebar */}
                <aside className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    {/* Status */}
                    <section className={`${cardClass} p-4`}>
                        <div className="flex items-center justify-between gap-2">
                            <h2 className={sectionHeading}>Status</h2>

                            <span
                                className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${
                                    product.is_available
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-red-50 text-red-500"
                                }`}
                            >
                                {status}
                            </span>
                        </div>

                        <div className="mt-4 rounded-xl bg-gray-50 p-3">
                            <p className={mutedText}>Store visibility</p>
                            <p className="mt-1 text-xs font-semibold">
                                {product.is_available
                                    ? "Visible to customers"
                                    : "Hidden from customers"}
                            </p>
                        </div>

                        <div className="mt-2 rounded-xl bg-gray-50 p-3">
                            <p className={mutedText}>Inventory status</p>
                            <p
                                className={`mt-1 text-xs font-semibold ${
                                    isOutOfStock
                                        ? "text-red-500"
                                        : isLowStock
                                          ? "text-orange-500"
                                          : "text-emerald-600"
                                }`}
                            >
                                {isOutOfStock
                                    ? "Out of stock"
                                    : isLowStock
                                      ? "Low stock"
                                      : "In stock"}
                            </p>
                        </div>
                    </section>

                    {/* Pricing */}
                    <section className={`${cardClass} p-4`}>
                        <h2 className={sectionHeading}>Pricing</h2>

                        <p className="mt-4 break-words text-2xl font-bold tracking-tight">
                            {formatPrice(product.price)}
                        </p>

                        {discount > 0 && (
                            <p className="mt-1.5 text-xs font-semibold text-red-500">
                                {discount}% discount
                            </p>
                        )}

                        <div className="mt-4 space-y-3 border-t border-gray-100 pt-3">
                            <div className="flex items-center justify-between gap-3">
                                <span className={mutedText}>Product ID</span>
                                <span className="text-[10px] font-semibold">
                                    #{product.id}
                                </span>
                            </div>

                            <div className="flex items-start justify-between gap-3">
                                <span className={mutedText}>Slug</span>
                                <span className="max-w-[150px] break-all text-right text-[10px] font-semibold">
                                    {product.slug}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Organization */}
                    <section className={`${cardClass} p-4`}>
                        <h2 className={sectionHeading}>Organization</h2>

                        <div className="mt-4 space-y-3.5">
                            <div>
                                <p className={mutedText}>Category</p>
                                <p className="mt-1 break-words text-xs font-semibold">
                                    {product.category?.name || "Uncategorized"}
                                </p>
                            </div>

                            <div>
                                <p className={mutedText}>Brand</p>
                                <p className="mt-1 break-words text-xs font-semibold">
                                    {product.brand?.name || "No brand"}
                                </p>
                            </div>

                            <div>
                                <p className={mutedText}>Created</p>
                                <p className="mt-1 text-xs font-semibold">
                                    {formatDate(product.created_at)}
                                </p>
                            </div>

                            <div>
                                <p className={mutedText}>Last updated</p>
                                <p className="mt-1 text-xs font-semibold">
                                    {formatDate(product.modified_date)}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Revenue */}
                    <section className={`${cardClass} p-4`}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                <FiDollarSign
                                    size={16}
                                    className="text-gray-500"
                                />
                            </div>

                            <div className="min-w-0">
                                <h2 className={sectionHeading}>
                                    Sales revenue
                                </h2>
                                <p className={mutedText}>
                                    Revenue from this product
                                </p>
                            </div>
                        </div>

                        <p className="mt-4 break-words text-2xl font-bold tracking-tight">
                            {formatPrice(product.total_revenue)}
                        </p>

                        <p className={`mt-1 ${mutedText}`}>
                            Based on recorded sales
                        </p>
                    </section>

                    {/* Danger zone */}
                    <section className="min-w-0 rounded-2xl border border-red-100 bg-red-50/40 p-4 sm:col-span-2 xl:col-span-1">
                        <h2 className="text-sm font-bold text-red-600">
                            Danger zone
                        </h2>

                        <p className="mt-2 text-[10px] leading-5 text-gray-500">
                            Deleting a product is permanent and cannot be
                            undone.
                        </p>

                        <button
                            type="button"
                            disabled
                            title="Connect this button to your product deletion API before enabling it."
                            className="mt-3 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-2.5 text-xs font-semibold text-red-400 opacity-80"
                        >
                            <FiTrash2 size={14} />
                            Delete product
                        </button>
                    </section>
                </aside>
            </div>

            <footer className="py-6 text-center text-[10px] text-gray-400">
                © {new Date().getFullYear()} Temmy Collection · Admin Dashboard
            </footer>
        </div>
    );
}