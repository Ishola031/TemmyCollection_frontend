"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
    FiAlertTriangle,
    FiBox,
} from "react-icons/fi";

export default function InventoryAlert({
    lowStockProducts = [],
}) {
    const products = Array.isArray(lowStockProducts)
        ? lowStockProducts
        : [];

    const outOfStockCount = products.filter(
        (product) => Number(product.stock) === 0
    ).length;

    const lowStockCount = products.filter(
        (product) => Number(product.stock) > 0
    ).length;

    return (
        <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                        <FiAlertTriangle size={19} />
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                            Inventory Alert
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                            Products that need your attention.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {products.length > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                            {outOfStockCount > 0 && (
                                <span className="rounded-full bg-red-50 px-3 py-1.5 font-medium text-red-600">
                                    {outOfStockCount} out of stock
                                </span>
                            )}

                            {lowStockCount > 0 && (
                                <span className="rounded-full bg-orange-50 px-3 py-1.5 font-medium text-orange-600">
                                    {lowStockCount} low stock
                                </span>
                            )}
                        </div>
                    )}

                    <Link
                        href="/admin/dashboard/inventory"
                        className="whitespace-nowrap text-xs font-semibold text-gray-900 transition hover:text-gray-500"
                    >
                        View Inventory
                    </Link>
                </div>
            </div>

            {/* Products */}
            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                        <FiBox size={21} />
                    </div>

                    <h4 className="mt-4 text-sm font-semibold text-gray-800">
                        Stock looks good
                    </h4>

                    <p className="mt-1 max-w-sm text-xs text-gray-500">
                        There are currently no products with low or empty
                        stock.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {products.map((product) => {
                        const stock = Number(product.stock) || 0;
                        const isOutOfStock = stock === 0;

                        return (
                            <div
                                key={product.id}
                                className="flex items-center gap-4 px-5 py-4 transition hover:bg-gray-50"
                            >
                                {/* Image */}
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            sizes="48px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                            <FiBox size={18} />
                                        </div>
                                    )}
                                </div>

                                {/* Product info */}
                                <div className="min-w-0 flex-1">
                                    <h4 className="truncate text-sm font-medium text-gray-900">
                                        {product.name}
                                    </h4>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {isOutOfStock
                                            ? "No stock available"
                                            : `${stock} ${
                                                  stock === 1
                                                      ? "item"
                                                      : "items"
                                              } remaining`}
                                    </p>
                                </div>

                                {/* Stock */}
                                <div className="flex shrink-0 items-center gap-3">
                                    <div className="hidden text-right sm:block">
                                        <p
                                            className={`text-sm font-semibold ${
                                                isOutOfStock
                                                    ? "text-red-600"
                                                    : "text-orange-600"
                                            }`}
                                        >
                                            {stock}
                                        </p>

                                        <p className="text-[10px] text-gray-400">
                                            stock
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${
                                            isOutOfStock
                                                ? "bg-red-50 text-red-600"
                                                : "bg-orange-50 text-orange-600"
                                        }`}
                                    >
                                        {isOutOfStock
                                            ? "Out of stock"
                                            : "Low stock"}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer */}
            {products.length > 0 && (
                <div className="border-t border-gray-100 px-5 py-4">
                    <p className="text-xs text-gray-400">
                        Low stock is anything with 10 or fewer items remaining.
                    </p>
                </div>
            )}
        </div>
    );
}