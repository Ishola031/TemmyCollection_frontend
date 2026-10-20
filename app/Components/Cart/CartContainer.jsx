'use client';

import Image from "next/image";
import React, { useContext, useMemo, useState } from 'react';
import Link from "next/link";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from '../../api/api';
import Message from "../Message";
import { AuthContext } from "../IsAuth";
import { useAddToCartItem, useCart, useRemoveCartItem } from "../../hook/useCart";

const CartContainer = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const [error, setError] = useState(null);
    const { data: cart, isLoading: loading } = useCart(isAuthenticated);

    const cartCount = useMemo(() => {
        if (!cart || cart.error || !cart.cartitems) return 0;
        return cart.cartitems.reduce((acc, item) => {
            return item.is_active ? acc + item.quantity : acc;
        }, 0);
    }, [cart]);

    const summary = useMemo(() => {
        if (!cart || !cart.cartitems) return { totalPrice: 0 };

        let totalPrice = 0;

        cart.cartitems.forEach(cat => {
            if (cat.is_active) {
                if (cat.product.discount > 0) {
                    const price = cat.variations === null
                        ? cat.product.price
                        : cat.variations.price;

                    totalPrice += ((100 - cat.product.discount) / 100 * price) * cat.quantity;
                } else {
                    const price = cat.variations !== null
                        ? cat.variations.price
                        : cat.product.price;

                    totalPrice += price * cat.quantity;
                }
            }
        });

        return { totalPrice };
    }, [cart]);

    const addToCartMutation = useAddToCartItem(isAuthenticated, setError);
    const removeCartItemMutation = useRemoveCartItem(isAuthenticated);

    const handleAddToCart = (product, variation, cartItemId) => {
        addToCartMutation.mutate({ product, variation, cartItemId });
    };

    const handleCartItemDecrement = (cartitemId, cartID, deleteItem = false) => {
        const resolvedCartId = cartID || localStorage.getItem('cart_id');

        removeCartItemMutation.mutate({
            cartitemId,
            cartID: resolvedCartId,
            deleteItem
        });
    };

    const isItemLoading = (cartItemId) => {
        if (
            addToCartMutation.isPending &&
            addToCartMutation.variables?.cartItemId === cartItemId
        ) {
            return true;
        }

        if (
            removeCartItemMutation.isPending &&
            removeCartItemMutation.variables?.cartitemId === cartItemId
        ) {
            return true;
        }

        return false;
    };

    return (
        <>
            <Message message={error} setError={setError} />

            <section className="w-full min-h-screen bg-gray-50 px-10 lg:px-15 max-[740px]:px-5 pt-28 pb-12">

                {/* PAGE HEADER */}
                <div className="mb-6">
                    <h1 className="text-[26px] font-semibold text-[#333]">
                        Shopping Cart
                    </h1>

                    {cart?.cartitems?.length > 0 && (
                        <p className="text-[14px] text-gray-500 mt-1">
                            {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
                        </p>
                    )}
                </div>

                {loading ? (

                    /* LOADING */
                    <div className="w-full bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-32">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                        <p className="text-sm text-gray-500 mt-4">
                            Loading your cart...
                        </p>
                    </div>

                ) : cart?.cartitems?.length > 0 ? (

                    <div className="flex gap-6 items-start max-[850px]:flex-col">

                        {/* ================= CART ITEMS ================= */}
                        <div className="w-[72%] max-[850px]:w-full">

                            {/* CART HEADER */}
                            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-3 flex justify-between items-center">
                                <div>
                                    <h2 className="font-semibold text-[17px]">
                                        Cart
                                    </h2>
                                    <p className="text-[13px] text-gray-500">
                                        Review your selected products
                                    </p>
                                </div>

                                <span className="text-[13px] bg-gray-100 px-3 py-1 rounded-full">
                                    {cartCount} items
                                </span>
                            </div>

                            {/* PRODUCTS */}
                            <div className="flex flex-col gap-3">

                                {cart.cartitems.map(ct => {

                                    const isactive = ct?.is_active;

                                    return (
                                        <div
                                            key={`cartitem-${ct.id}`}
                                            className={`bg-white border border-gray-200 rounded-xl p-4 transition-all
                                            ${!isactive ? 'opacity-60' : 'hover:shadow-sm'}`}
                                        >

                                            <div className="flex gap-4">

                                                {/* IMAGE */}
                                                <div className="w-28 h-28 min-w-28 relative max-[500px]:w-24 max-[500px]:h-24 max-[500px]:min-w-24">

                                                    <Image
                                                        src={`${ct.product.image}`}
                                                        width={120}
                                                        height={120}
                                                        alt={ct.product.name}
                                                        className="w-full h-full object-cover rounded-lg"
                                                        unoptimized
                                                    />

                                                    {ct.product.discount > 0 && (
                                                        <div className={`absolute top-2 right-2 text-[11px] px-2 py-1 rounded-md text-white
                                                        ${isactive ? 'bg-amber-500' : 'bg-gray-400'}`}>
                                                            -{ct.product.discount}%
                                                        </div>
                                                    )}

                                                </div>

                                                {/* PRODUCT DETAILS */}
                                                <div className="flex-1 min-w-0">

                                                    <div className="flex justify-between gap-3 max-[600px]:flex-col">

                                                        <div className="min-w-0">

                                                            <Link
                                                                href={`/store/${ct.product.slug}`}
                                                                className={`text-[17px] font-medium line-clamp-2 hover:text-blue-600
                                                                ${!isactive && 'text-gray-400'}`}
                                                            >
                                                                {ct.product.name}
                                                            </Link>

                                                            <p className={`text-[12px] mt-1
                                                            ${isactive ? 'text-orange-500' : 'text-gray-400'}`}>
                                                                {isactive ? 'Few units left' : 'Out Of Stock'}
                                                            </p>

                                                            {(ct?.variations?.color || ct?.variations?.size) && (
                                                                <div className="flex flex-wrap gap-2 mt-2 text-[13px] text-gray-600">

                                                                    {ct?.variations?.color && (
                                                                        <span className="bg-gray-100 px-2 py-1 rounded">
                                                                            Color: {ct.variations.color.name}
                                                                        </span>
                                                                    )}

                                                                    {ct?.variations?.size && (
                                                                        <span className="bg-gray-100 px-2 py-1 rounded">
                                                                            Size: {ct.variations.size.name}
                                                                        </span>
                                                                    )}

                                                                </div>
                                                            )}

                                                        </div>

                                                        {/* PRICE */}
                                                        <div className="text-right max-[600px]:text-left">

                                                            {ct.variations !== null ? (

                                                                ct.product.discount ? (
                                                                    <>
                                                                        <h3 className={`text-[18px] font-bold ${!isactive && 'text-gray-400'}`}>
                                                                            N{(
                                                                                ((100 - ct.product.discount) / 100) *
                                                                                ct.variations.price *
                                                                                ct.quantity
                                                                            ).toLocaleString('en-NG')}
                                                                        </h3>

                                                                        <p className={`text-[12px] ${!isactive ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                            <del>
                                                                                N{(
                                                                                    ct.variations.price *
                                                                                    ct.quantity
                                                                                ).toLocaleString('en-NG')}
                                                                            </del>
                                                                        </p>
                                                                    </>
                                                                ) : (
                                                                    <h3 className="text-[18px] font-bold">
                                                                        N{(
                                                                            ct.variations.price *
                                                                            ct.quantity
                                                                        ).toLocaleString('en-NG')}
                                                                    </h3>
                                                                )

                                                            ) : (

                                                                ct.product.discount ? (
                                                                    <>
                                                                        <h3 className={`text-[18px] font-bold ${!isactive && 'text-gray-400'}`}>
                                                                            N{(
                                                                                ((100 - ct.product.discount) / 100) *
                                                                                ct.product.price *
                                                                                ct.quantity
                                                                            ).toLocaleString('en-NG')}
                                                                        </h3>

                                                                        <p className={`text-[12px] ${!isactive ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                            <del>
                                                                                N{(
                                                                                    ct.product.price *
                                                                                    ct.quantity
                                                                                ).toLocaleString('en-NG')}
                                                                            </del>
                                                                        </p>
                                                                    </>
                                                                ) : (
                                                                    <h3 className="text-[18px] font-bold">
                                                                        N{(
                                                                            ct.product.price *
                                                                            ct.quantity
                                                                        ).toLocaleString('en-NG')}
                                                                    </h3>
                                                                )

                                                            )}

                                                        </div>

                                                    </div>

                                                    {/* ACTIONS */}
                                                    <div className="flex justify-between items-center mt-5">

                                                        <button
                                                            className="flex items-center gap-1.5 text-[13px] text-red-500 hover:text-red-700 cursor-pointer"
                                                            onClick={() => handleCartItemDecrement(
                                                                ct.id,
                                                                cart.cart_id,
                                                                true
                                                            )}
                                                        >
                                                            <MdOutlineDeleteOutline className="text-[20px]" />
                                                            Remove
                                                        </button>

                                                        {isactive ? (

                                                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">

                                                                <button
                                                                    className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 cursor-pointer font-semibold"
                                                                    onClick={() => handleCartItemDecrement(
                                                                        ct.id,
                                                                        cart.cart_id,
                                                                        false
                                                                    )}
                                                                >
                                                                    -
                                                                </button>

                                                                <div className="w-10 h-9 flex items-center justify-center text-[14px]">
                                                                    {isItemLoading(ct.id) ? (
                                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
                                                                    ) : (
                                                                        ct.quantity
                                                                    )}
                                                                </div>

                                                                <button
                                                                    className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 cursor-pointer font-semibold"
                                                                    onClick={() => handleAddToCart(
                                                                        ct?.product?.id,
                                                                        ct?.variations?.id,
                                                                        ct?.id
                                                                    )}
                                                                >
                                                                    +
                                                                </button>

                                                            </div>

                                                        ) : (

                                                            <span className="text-[12px] px-3 py-1.5 rounded-lg bg-gray-200 text-gray-500">
                                                                Sold out
                                                            </span>

                                                        )}

                                                    </div>

                                                </div>

                                            </div>

                                        </div>
                                    )
                                })}

                            </div>
                        </div>

                        {/* ================= SUMMARY ================= */}
                        <div className="w-[28%] max-[850px]:w-full">

                            <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-28">

                                <h2 className="text-[17px] font-semibold pb-4 border-b border-gray-200">
                                    Cart Summary
                                </h2>

                                <div className="py-4 border-b border-gray-200">

                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[14px] text-gray-600">
                                            Items
                                        </span>

                                        <span className="text-[14px] font-medium">
                                            {cartCount}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">

                                        <span className="text-[15px] font-medium">
                                            Subtotal
                                        </span>

                                        <span className="text-[20px] font-bold">
                                            N{summary?.totalPrice?.toLocaleString('en-NG') || 0}.00
                                        </span>

                                    </div>

                                </div>

                                <div className="pt-4">

                                    <Link
                                        href="/checkout"
                                        className="w-full py-3 rounded-lg bg-blue-600 text-white text-[14px] font-medium flex justify-center items-center hover:bg-blue-700 transition-colors"
                                    >
                                        Proceed to Checkout
                                    </Link>

                                    <Link
                                        href="/"
                                        className="w-full py-3 rounded-lg border border-gray-300 mt-2 text-[#333] text-[14px] font-medium flex justify-center items-center hover:bg-gray-50 transition-colors"
                                    >
                                        Continue Shopping
                                    </Link>

                                </div>

                            </div>

                        </div>

                    </div>

                ) : (

                    /* ================= EMPTY CART ================= */
                    <div className="w-full bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center py-28 px-5">

                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                            <span className="text-[35px]">
                                🛒
                            </span>
                        </div>

                        <h2 className="text-[20px] font-semibold text-[#333]">
                            Your cart is empty
                        </h2>

                        <p className="text-[14px] text-gray-500 mt-2 text-center">
                            Looks like you haven't added anything to your cart yet.
                        </p>

                        <Link
                            href="/"
                            className="mt-6 py-3 px-6 rounded-lg bg-[#333] text-white text-[14px] hover:bg-black transition-colors"
                        >
                            Start Shopping
                        </Link>

                    </div>
                )}

            </section>
        </>
    );
};

export default CartContainer;