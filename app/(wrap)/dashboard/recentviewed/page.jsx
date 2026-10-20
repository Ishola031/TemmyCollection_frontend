"use client";

import React from "react";
import Dashboard from "../../../Components/Dashboard";
import Link from "next/link";
import Image from "next/image";
import { FiClock, FiChevronRight, FiEye } from "react-icons/fi";
import { useRecentViewed } from "../../../hook/userecentviewed";

const page = () => {
    const { data: viewedproducts, isLoading } = useRecentViewed();

    console.log(viewedproducts);

    const formatPrice = (price) => {
        return `₦${Number(price || 0).toLocaleString("en-NG")}`;
    };

    const getDiscountPrice = (price, discount) => {
        return ((100 - discount) / 100) * price;
    };

    return (
        <>
            <section className="w-full min-h-screen pt-22 px-10 lg:px-15 pb-10 max-[740px]:px-5 max-[740px]:pt-30">
                <div className="flex gap-6">
                    <Dashboard
                        custom={"recentviewed"}
                        display={"hidden"}
                    />

                    <div className="w-[75%] max-[850px]:w-full">
                        {/* PAGE HEADER */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-[25px] font-bold">
                                        Recently Viewed
                                    </h1>

                                    {!isLoading &&
                                        viewedproducts?.length > 0 && (
                                            <span className="min-w-6 h-6 px-1.5 rounded-full bg-black text-white text-[11px] flex justify-center items-center">
                                                {
                                                    viewedproducts.length
                                                }
                                            </span>
                                        )}
                                </div>

                                <p className="text-[14px] text-gray-500 mt-1">
                                    Products you've recently checked out.
                                </p>
                            </div>

                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <FiClock className="text-gray-600" />
                            </div>
                        </div>

                        {/* PRODUCT AREA */}
                        {isLoading ? (
                            <div className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-3 max-[650px]:grid-cols-2">
                                {[1, 2, 3, 4, 5, 6].map(
                                    (item) => (
                                        <div
                                            key={item}
                                            className="border border-gray-200 rounded-xl overflow-hidden animate-pulse"
                                        >
                                            <div className="w-full h-48 bg-gray-100" />

                                            <div className="p-3">
                                                <div className="h-4 bg-gray-100 rounded w-full" />

                                                <div className="h-4 bg-gray-100 rounded w-2/3 mt-2" />

                                                <div className="h-5 bg-gray-100 rounded w-1/2 mt-4" />
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : viewedproducts?.length > 0 ? (
                            <div className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-3 max-[650px]:grid-cols-2 max-[400px]:grid-cols-1">
                                {viewedproducts.map(
                                    (viewedproduct) => {
                                        const product =
                                            viewedproduct?.product;

                                        const discount =
                                            Number(
                                                product?.discount || 0
                                            );

                                        const price =
                                            Number(
                                                product?.price || 0
                                            );

                                        const discountedPrice =
                                            getDiscountPrice(
                                                price,
                                                discount
                                            );

                                        return (
                                            <Link
                                                href={`/store/${product?.slug}`}
                                                key={`product_viewed_${viewedproduct?.id}`}
                                                className="group relative border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200"
                                            >
                                                {/* IMAGE */}
                                                <div className="relative w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                                                    <Image
                                                        src={`${product?.image}`}
                                                        width={300}
                                                        height={300}
                                                        alt={
                                                            product?.name ||
                                                            "Product"
                                                        }
                                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                                        unoptimized
                                                    />

                                                    {discount > 0 && (
                                                        <span className="absolute top-3 left-3 bg-black text-white px-2 py-1 rounded-md text-[11px] font-medium">
                                                            -{discount}%
                                                        </span>
                                                    )}

                                                    <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <FiEye className="text-gray-700 text-[15px]" />
                                                    </span>
                                                </div>

                                                {/* PRODUCT INFO */}
                                                <div className="p-3">
                                                    <p className="text-[13px] text-gray-400 mb-1">
                                                        Recently viewed
                                                    </p>

                                                    <h2 className="text-[14px] font-medium text-gray-900 line-clamp-2 leading-5 min-h-10">
                                                        {
                                                            product?.name
                                                        }
                                                    </h2>

                                                    {/* PRICE */}
                                                    <div className="mt-3">
                                                        {discount >
                                                        0 ? (
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-[16px] font-bold">
                                                                    {formatPrice(
                                                                        discountedPrice
                                                                    )}
                                                                </span>

                                                                <span className="text-[11px] text-gray-400">
                                                                    <del>
                                                                        {formatPrice(
                                                                            price
                                                                        )}
                                                                    </del>
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[16px] font-bold">
                                                                {formatPrice(
                                                                    price
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* VIEW PRODUCT */}
                                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                                        <span className="text-[12px] text-gray-500">
                                                            View product
                                                        </span>

                                                        <FiChevronRight className="text-gray-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    }
                                )}
                            </div>
                        ) : (
                            /* EMPTY STATE */
                            <div className="border border-gray-200 rounded-2xl bg-white py-20 px-5 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <FiClock className="text-[25px] text-gray-400" />
                                </div>

                                <h3 className="text-[17px] font-semibold">
                                    No recently viewed products
                                </h3>

                                <p className="text-[13px] text-gray-500 mt-1 max-w-sm">
                                    Products you view while shopping
                                    will appear here so you can easily
                                    find them again.
                                </p>

                                <Link
                                    href="/store"
                                    className="mt-5 px-5 py-2.5 rounded-lg bg-black text-white text-[13px] font-medium hover:bg-gray-800"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default page;