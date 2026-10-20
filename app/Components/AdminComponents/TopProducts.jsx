"use client";

import React from "react";
import Link from "next/link";
import {
    FiArrowUpRight,
    FiMoreHorizontal,
} from "react-icons/fi";

export default function TopProducts({ topProducts = [] }) {

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
        }).format(Number(value) || 0);
    };

    const getProductImage = (product) => {
        return (
            product?.image ||
            product?.images?.[0]?.image ||
            product?.images?.[0]?.url ||
            "/placeholder-product.png"
        );
    };

    const getCategoryName = (product) => {
        if (typeof product?.category === "string") {
            return product.category;
        }

        return (
            product?.category?.name ||
            "Uncategorized"
        );
    };

    return (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-gray-100 p-5 sm:p-6">

                <div>
                    <p className="text-sm font-semibold">
                        Top products
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        Your best performing products
                    </p>
                </div>

                <Link
                    href="/admin/dashboard/products"
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 transition hover:text-black"
                >
                    View all
                    <FiArrowUpRight size={13} />
                </Link>

            </div>

            {/* PRODUCTS */}
            <div className="divide-y divide-gray-100">

                {topProducts.length > 0 ? (

                    topProducts.map((product, index) => {

                        const sold = Number(
                            product?.quantity_sold
                        ) || 0;

                        return (
                            <div
                                key={
                                    product?.id ||
                                    product?.slug ||
                                    index
                                }
                                className="flex items-center gap-4 p-5 transition hover:bg-gray-50"
                            >

                                {/* RANK */}
                                <div className="flex h-8 w-6 shrink-0 items-center justify-center text-xs font-bold text-gray-300">
                                    {String(index + 1).padStart(
                                        2,
                                        "0"
                                    )}
                                </div>

                                {/* IMAGE */}
                                <img src={getProductImage(product)}
                                    alt={
                                        product?.name ||
                                        "Product"
                                    }
                                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                                />

                                {/* PRODUCT INFO */}
                                <div className="min-w-0 flex-1">

                                    <p className="truncate text-sm font-semibold">
                                        {product?.name ||
                                            "Unnamed product"}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        {getCategoryName(
                                            product
                                        )}
                                        {" · "}
                                        {sold}{" "}
                                        {sold === 1
                                            ? "sold"
                                            : "sold"}
                                    </p>

                                </div>

                                {/* REVENUE */}
                                <div className="hidden text-right sm:block">

                                    <p className="text-sm font-bold">
                                        {formatCurrency(
                                            product?.revenue
                                        )}
                                    </p>

                                    <p className="mt-1 text-[10px] text-gray-400">
                                        Revenue
                                    </p>

                                </div>

                                {/* MORE */}
                                <button
                                    type="button"
                                    className="rounded-lg p-2 text-gray-300 transition hover:bg-gray-100 hover:text-black"
                                >
                                    <FiMoreHorizontal
                                        size={17}
                                    />
                                </button>

                            </div>
                        );
                    })

                ) : (

                    <div className="p-10 text-center">

                        <p className="text-sm font-medium text-gray-500">
                            No product sales yet
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Products with sales will appear here.
                        </p>

                    </div>

                )}

            </div>

        </section>
    );
}
