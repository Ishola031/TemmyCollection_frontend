"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import Dashboard from "../../../Components/Dashboard";
import Link from "next/link";
import Image from "next/image";
import { FiClock, FiChevronRight, FiEye } from "react-icons/fi";
import { useRecentViewed } from "../../../hook/userecentviewed";
import { useAddToCartItem, useCart, useRemoveCartItem } from "../../../hook/useCart";
import { AuthContext } from "../../../Components/IsAuth";
import { useProductLike, useRecentViewedLike } from "../../../hook/useProductLike";

const page = () => {
    const { data: viewedproducts, isLoading } = useRecentViewed();
    const [showVariation, setShowVariation] = useState(false);
    const sidebarRef = useRef(null);
    const [message, setMessage] = useState(null)
    const [product, setProduct] = useState(null);
    const { isAuthenticated } = useContext(AuthContext)
    const { data: cart, isLoading: loadingCart } = useCart(isAuthenticated)
    const addcartfetch = useAddToCartItem(isAuthenticated, setMessage);
    const productLikeFetch = useRecentViewedLike();
    const handleCartItemDecrement = useRemoveCartItem(isAuthenticated);
    


    const formatPrice = (price) => {
        return `₦${Number(price || 0).toLocaleString("en-NG")}`;
    };

    // PREVENT SCROLLING WHEN VIRIATION IS OPEN
    useEffect(() => {
        if (showVariation) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Clean up style if component unmounts unexpectedly
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showVariation]);

    // HIDE VARIATION WHEN USER CLICK OUTSIDE THE VARIATION CONTAINER
    useEffect(() => {
        const handleSidebarClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setShowVariation(false)
            }
        };
        document.addEventListener('mousedown', handleSidebarClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleSidebarClickOutside)
        };
    }, [])

    const getDiscountPrice = (price, discount) => {
        return ((100 - discount) / 100) * price;
    };

    const handleAddToCart = (product, variation, cartItemId = null) => {
        // console.log(product, variation)
        addcartfetch.mutate({ product, variation, cartItemId });
    };

    const handleRemoveCartItem = (cartitemId, deleteItem = false) => {
        const resolvedCartId = localStorage.getItem('cart_id');
        handleCartItemDecrement.mutate({
            cartitemId,
            cartID: resolvedCartId,
            deleteItem
        });
    };

    const handleLike = (productSlug) => {
        if (!isAuthenticated) router.push('/signin')
        productLikeFetch.mutate({ productSlug })
    };

    const handleAddVariations = (product) => {
        if (product?.variations?.length > 0) {
            setProduct(product)
            setShowVariation(true);
        } else {
            handleAddToCart(product?.id)
        }
    };

    const handleRemoveVariation = (product, cartitemId) => {
        if (product?.variations?.length > 0) {
            setProduct(product)
            setShowVariation(true);
        } else {
            // handleCartItemDecrement(instock?.id, cartID, product?.id, null)
            handleRemoveCartItem(cartitemId)
        }
    };

    const isItemLoading = (productID, variation, cartItemId) => {
        if (
            addcartfetch.isPending &&
            addcartfetch.variables?.product === productID &&
            addcartfetch.variables?.variation === variation
        ) {
            return true;
        }
        if (
            handleCartItemDecrement.isPending &&
            handleCartItemDecrement.variables?.cartitemId === cartItemId
        ) {
            return true;
        }
        return false;
    };

    return (
        <>
            <section className="w-full min-h-screen pt-22 px-10 lg:px-15 pb-10 max-[740px]:px-5 max-[740px]:pt-30">
                <div className="flex gap-6">
                    <Dashboard custom={"recentviewed"} display={"hidden"}/>

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
                                {viewedproducts.map((viewedproduct) => {
                                        const pr = viewedproduct?.product;
                                        const discount = Number( pr?.discount || 0);
                                        const price = Number(pr?.price || 0);
                                        const discountedPrice = getDiscountPrice(price, discount);



                                        const inStock = cart?.cartitems?.filter((ct) => {
                                            if (ct?.product?.id !== pr?.id) return false;
                                            if (pr?.variations?.length > 0) {
                                                return pr.variations.some((vr) => vr.id === ct?.variations?.id);
                                            }
                                            return true;
                                        }) || [];

                                        const quantity = inStock.reduce((acc, item) => acc + (item.quantity || 0), 0);
                                        // const discountedPrice = pr.discount ? ((100 - pr.discount) / 100) * pr.price : pr.price;

                                        return (
                                            <div key={`pr-${pr.id}`}
                                                className="group relative flex flex-col justify-between bg-white rounded-2xl border border-gray-100 p-3.5 transition-all duration-300 hover:shadow-xl hover:shadow-gray-100 hover:border-gray-200"
                                            >
                                                {/* Top Badges & Heart Container */}
                                                <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 flex items-center justify-center p-2">
                                                    {/* Discount Badge */}
                                                    {pr.discount > 0 && (
                                                        <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                                                            -{pr.discount}%
                                                        </span>
                                                    )}
    
                                                    {/* Wishlist Button */}
                                                    <button
                                                        onClick={() => handleLike(pr?.slug)}
                                                        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-md text-gray-700 hover:text-red-500 hover:bg-white transition-all shadow-sm"
                                                    >
                                                        {pr?.is_Liked ? (
                                                            <FaHeart className="text-red-500 text-sm" />
                                                        ) : (
                                                            <FaRegHeart className="text-sm" />
                                                        )}
                                                    </button>
    
                                                    {/* Product Image */}
                                                    <Link href={`/store/${pr.slug}`} className="w-full h-full flex items-center justify-center">
                                                        <Image
                                                            src={pr.image}
                                                            alt={pr.name || 'Product Image'}
                                                            width={180}
                                                            height={180}
                                                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 ease-out"
                                                            unoptimized
                                                        />
                                                    </Link>
                                                </div>
    
                                                {/* Product Info */}
                                                <div className="flex flex-col grow">
                                                    <Link href={`/store/${pr.slug}`}>
                                                        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-10 hover:text-black transition-colors">
                                                            {pr.name}
                                                        </h3>
                                                    </Link>
    
                                                    {/* Price Section */}
                                                    <div className="mt-2 mb-3 flex items-baseline gap-2">
                                                        <span className="text-base font-bold text-gray-900">
                                                            ₦{discountedPrice.toLocaleString('en-NG')}
                                                        </span>
                                                        {pr.discount > 0 && (
                                                            <span className="text-xs text-gray-400 line-through font-normal">
                                                                ₦{pr.price.toLocaleString('en-NG')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
    
                                                {/* Action Buttons & Counter Controls */}
                                                <div className="w-full mt-auto">
                                                    {pr.stock <= 0 ? (
                                                        <button disabled className="w-full py-2 bg-gray-100 text-gray-400 text-xs font-semibold rounded-xl cursor-not-allowed">
                                                            Out of Stock
                                                        </button>
                                                    ) : inStock.length > 0 ? (
                                                        <div className="w-full flex items-center justify-between bg-gray-900 text-white rounded-xl overflow-hidden p-1">
                                                            <button
                                                                onClick={() => handleRemoveVariation(pr, inStock[0]?.id)}
                                                                className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold transition-colors"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="text-xs font-semibold px-2">
                                                                {isItemLoading(pr?.id, inStock[0]?.variations?.id, inStock[0]?.id) ? (
                                                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                                ) : (
                                                                    quantity
                                                                )}
                                                            </span>
                                                            <button
                                                                onClick={() => handleAddVariations(pr)}
                                                                className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold transition-colors"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAddVariations(pr)}
                                                            className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                                                        >
                                                            {isItemLoading(pr?.id, null, null) ? (
                                                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                            ) : (
                                                                "Add to Cart"
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
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

            <div className={`${showVariation ? "fixed inset-0 z-700 opacity-100 pointer-events-auto" : "hidden opacity-0 pointer-events-none"} transition-opacity duration-300 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4`}>
                <div ref={sidebarRef} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-300 scale-100">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Select Variation</h3>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product?.name}</p>
                        </div>
                        <button type="button" onClick={() => setShowVariation(false)} className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors">
                            <IoMdClose className="text-xl" />
                        </button>
                    </div>

                    {/* Variations List */}
                    <div className="p-6 divide-y divide-gray-100 max-h-[65vh] overflow-y-auto space-y-1">
                        {product?.variations?.length > 0 &&
                            product.variations.map((vr) => {
                                const cartItem = cart?.cartitems?.find(
                                    (ct) => ct?.product?.id === product?.id && ct?.variations?.id === vr.id
                                );
                                const variation = cartItem?.variations || vr;
                                const quantity = cartItem?.quantity || 0;
                                const isDiscounted = (product?.discount || 0) > 0;
                                const basePrice = variation?.price ?? product?.price ?? 0;

                                const multiplier = cartItem ? quantity : 1;
                                const unitFinalPrice = isDiscounted
                                    ? ((100 - product.discount) / 100) * basePrice
                                    : basePrice;

                                const totalPrice = unitFinalPrice * multiplier;
                                const originalTotalPrice = basePrice * multiplier;

                                return (
                                    <div
                                        key={`vr-${vr.id}`}
                                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4"
                                    >
                                        {/* Variation Details & Price */}
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-gray-800">
                                                    {[variation?.color?.name, variation?.size?.name]
                                                        .filter(Boolean)
                                                        .join(" / ") || "Standard Option"}
                                                </span>
                                                {vr?.stock <= 0 && (
                                                    <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-baseline gap-2">
                                                <span className="text-base font-bold text-gray-900">
                                                    ₦{totalPrice.toLocaleString("en-NG")}
                                                </span>
                                                {isDiscounted && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        ₦{originalTotalPrice.toLocaleString("en-NG")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Controls / Actions */}
                                        <div className="flex items-center">
                                            {cartItem ? (
                                                cartItem.is_active ? (
                                                    <div className="flex items-center gap-1 bg-gray-900 text-white rounded-xl p-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveCartItem(cartItem.id)}
                                                            className="w-7 h-7 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold transition-colors"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center text-xs font-semibold">
                                                            {isItemLoading(product?.id, cartItem.variations?.id, cartItem.id) ? (
                                                                <div className="mx-auto h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                            ) : (
                                                                quantity
                                                            )}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddToCart(product?.id, cartItem.variations?.id)}
                                                            className="w-7 h-7 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="px-3 py-1.5 bg-gray-100 text-gray-400 text-xs font-semibold rounded-xl">
                                                        Unavailable
                                                    </span>
                                                )
                                            ) : vr?.stock > 0 ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddToCart(product?.id, vr?.id)}
                                                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all active:scale-95 flex items-center gap-2"
                                                >
                                                    {isItemLoading(product?.id, vr?.id, null) ? (
                                                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                    ) : (
                                                        "Add to Cart"
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="px-4 py-2 bg-gray-100 text-gray-400 text-xs font-semibold rounded-xl cursor-not-allowed"
                                                >
                                                    Sold out
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default page;