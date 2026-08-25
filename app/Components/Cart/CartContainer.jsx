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

    // 4. DERIVED CLIENT COUNTS & CALCULATIONS VIA USEMEMO
    const cartCount = useMemo(() => {
        if (!cart || cart.error || !cart.cartitems) return 0;
        return cart.cartitems.reduce((acc, item) => {
            return item.is_active ? acc + item.quantity : acc;
        }, 0);
    }, [cart]);

    const summary = useMemo(() => {
        if (!cart || !cart.cartitems) return { totalPrice: 0 };
        let totalPrice = 0;

        cart?.cartitems.forEach(cat => {
            if (cat.is_active) {
                if (cat.product.discount > 0) {
                    const price = cat.variations === null ? cat.product.price : cat.variations.price;
                    totalPrice += ((100 - cat.product.discount) / 100 * price) * cat.quantity;
                } else {
                    const price = cat.variations !== null ? cat.variations.price : cat.product.price;
                    totalPrice += price * cat.quantity;
                }
            }
        });
        return { totalPrice };
    }, [cart]);

    const addToCartMutation = useAddToCartItem(isAuthenticated, setError);
    const removeCartItemMutation = useRemoveCartItem(isAuthenticated);

    // Action Handlers bound to JSX actions
    const handleAddToCart = (product, variation, cartItemId) => {
        addToCartMutation.mutate({ product, variation, cartItemId });
    };

    const handleCartItemDecrement = (cartitemId, cartID, deleteItem = false) => {
        // Fallback to localStorage if cartID is not on cart state object yet
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
            <section className="pb-10 w-full h-auto px-10 lg:px-15 min-px-3 max-[740px]:px-5 pt-25 max-[740px]:pt-30">
                <div className="w-full h-full flex gap-5 max-[660px]:flex-col">
                    {/* CART ITEMS CONTAINER */}
                    <div className={`${cart?.cartitems?.length <= 0 ? ('w-full') : ('w-[75%]')} max-[660px]:w-full`}>
                        {cart?.cartitems?.length > 0 && (
                            <div><h4 className="text-[18px] pb-2 font-semibold">Cart ({cartCount})</h4></div>
                        )}

                        <div className="flex flex-col gap-2">
                            {loading ? (
                                <div className="flex flex-col w-full items-center py-20">
                                    <div className="h-5.5 w-5.5 animate-spin rounded-full border-4 border-gray-200 border-t-[#333]" />
                                </div>
                            ) : (
                                cart?.cartitems?.length > 0 ? (
                                    cart?.cartitems?.map(ct => {
                                        let isactive = ct?.is_active
                                        return (
                                            <div className="flex flex-col w-full pb-2 border-b border-[#333]" key={`cartitem-${ct.id}`}>
                                                <div className="w-full h-auto flex gap-2.5">
                                                    <div className={`w-[100] h-[100] max-h-30 max-[500px]:w-[25%] relative`}>
                                                        <Image src={`${ct.product.image}`} width={100} height={100} alt={ct.product.name} className="w-full h-full rounded-xl" unoptimized />
                                                        {ct.product.discount > 0 && (
                                                            <div className={`${!isactive ? ('bg-[#d6d0d0]') : ('bg-amber-400')} absolute hidden top-0 right-0 text-[13px] py-0.5 px-1.5 text-white max-[500px]:flex`}>-{ct.product.discount}%</div>
                                                        )}
                                                    </div>

                                                    <div className='w-[80%] max-[500px]:w-[75%]'>
                                                        <div className="flex justify-between max-[500px]:flex-col">
                                                            <div className="w-[80%] leading-5 text-[#333] max-[500px]:w-full">
                                                                <p className={`text-[20px] max-[500px]:text-[18px] ${!isactive && ('text-[#d6d0d0]')}`}>{ct?.product?.name}</p>
                                                                <p className={`text-[13px] ${!isactive ? ('text-[#d6d0d0]') : ('text-orange-400')}`}>
                                                                    {!isactive ? ('Out Of Stock') : ('Few unit left')}
                                                                </p>
                                                                <div className={`flex gap-1 text-[15px] ${!isactive && ('text-[#d6d0d0]')}`} >{ct?.variations?.color && (<p>Color: {ct.variations.color.name} </p>)} {ct?.variations?.size && (<p>, Size: {ct.variations.size.name}</p>)}</div>
                                                            </div>

                                                            {/* PRICE RENDER COMPONENT */}
                                                            <div className="flex flex-col items-end mb-1 leading-6.5 max-[500px]:flex-row max-[500px]:gap-2 max-[500px]:items-center">
                                                                {ct.variations !== null ? (
                                                                    ct.product.discount ? (
                                                                        <>
                                                                            <h3 className={`${!isactive ? ('text-[#d6d0d0]') : ('text-black')} text-[1.2rem] font-bold`}><del>N</del>{(((100 - ct?.product?.discount) / 100) * (ct?.variations?.price) * ct.quantity).toLocaleString('en-NG')}.00</h3>
                                                                            <div className="flex items-center gap-2">
                                                                                <h2 className={`${!isactive ? ('text-[#d6d0d0]') : ('text-black')}`}><del>N{(ct?.variations?.price * ct.quantity).toLocaleString('en-NG')}.00</del></h2>
                                                                                <div className={`${!isactive ? ('bg-[#d6d0d0]') : ('bg-amber-400')} text-[13px] py-0.5 px-1.5 max-[500px]:hidden`}>-{ct.product.discount}%</div>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <h3 className="text-[1.2rem] font-bold"><del>N</del>{(ct?.variations?.price * ct.quantity).toLocaleString('en-NG')}</h3>
                                                                        </>
                                                                    )
                                                                ) : (
                                                                    ct.product.discount ? (
                                                                        <>
                                                                            <h3 className={`${!isactive ? ('text-[#d6d0d0]') : ('text-black')} text-[1.2rem] font-bold`}><del>N</del>{(((100 - ct?.product?.discount) / 100) * (ct?.product?.price) * ct.quantity).toLocaleString('en-NG')}.00</h3>
                                                                            <div className="flex items-center gap-2">
                                                                                <h2 className={`${!isactive ? ('text-[#d6d0d0]') : ('text-black')}`}><del>N{(ct.product.price * ct.quantity).toLocaleString('en-NG')}.00</del></h2>
                                                                                <div className={`${!isactive ? ('bg-[#d6d0d0]') : ('bg-amber-400')} text-[13px] py-0.5 px-1.5 max-[500px]:hidden`}>-{ct.product.discount}%</div>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <h3 className="text-[1.2rem] font-bold"><del>N</del>{(ct.product.price * ct.quantity).toLocaleString('en-NG')}.00</h3>
                                                                        </>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* QUANTITY SETTING ACTION CONTAINER - DESKTOP SCREEN sizes */}
                                                        <div className="flex items-center justify-between w-full max-[450px]:hidden">
                                                            <button className="flex items-center gap-1 py-1.5 px-4.5 bg-[#333] text-white text-[14px] cursor-pointer" onClick={() => handleCartItemDecrement(ct.id, cart.cart_id, true)}><MdOutlineDeleteOutline className="text-[20px]" /> Remove</button>
                                                            {ct.is_active ? (
                                                                <div className="flex items-center gap-1">
                                                                    <button className="py-1.5 px-3 bg-amber-500 text-white font-semibold cursor-pointer" onClick={() => handleCartItemDecrement(ct.id, cart.cart_id, false)}>-</button>
                                                                    <div className="py-1.5 px-3 text-[15px]">{isItemLoading(ct.id) ? (<div className="h-4 w-4 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />) : (<p>{ct.quantity}</p>)}</div>
                                                                    <button className="py-1.5 px-3 bg-amber-500 text-white font-semibold cursor-pointer" onClick={() => handleAddToCart(ct?.product?.id, ct?.variations?.id, ct?.id)}>+</button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-start justify-end">
                                                                    <p className="py-1.5 px-3.5 bg-[#333] text-white rounded-lg">Sold out</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                    </div>
                                                </div>

                                                {/* QUANTITY SETTING ACTION CONTAINER - MOBILE SCREEN sizes */}
                                                <div className="items-center justify-between w-full hidden max-[450px]:flex">
                                                    <button className="flex items-center gap-1 py-1.5 px-4.5 bg-[#333] text-white text-[14px] cursor-pointer" onClick={() => handleCartItemDecrement(ct.id, cart.cart_id, true)}><MdOutlineDeleteOutline className="text-[20px]" /> Remove</button>
                                                    {ct.is_active ? (
                                                        <div className="flex items-center gap-1">
                                                            <button className="py-1.5 px-3 bg-amber-500 text-white font-semibold cursor-pointer" onClick={() => handleCartItemDecrement(ct.id, cart.cart_id, false)}>-</button>
                                                            <div className="py-1.5 px-3 text-[15px]">{isItemLoading(ct.id) ? (<div className="h-4 w-4 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />) : (<p>{ct.quantity}</p>)}</div>
                                                            <button className="py-1.5 px-3 bg-amber-500 text-white font-semibold cursor-pointer" onClick={() => handleAddToCart(ct?.product?.id, ct?.variations?.id, ct?.id, isAuthenticated)}>+</button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-start justify-end">
                                                            <p className="py-1.5 px-3.5 bg-[#333] text-white rounded-lg">Sold out</p>
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="flex flex-col w-full items-center text-xl py-40">
                                        <p className="pb-5">No cart</p>
                                        <Link href={`/`} className="text-[16px] py-2 px-4 bg-[#333] text-[#eee] cursor-pointer">Continue Shopping</Link>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* CART SIDE SUMMARY */}
                    {cart?.cartitems?.length > 0 && (
                        <div className=" w-[25%] max-[660px]:w-full">
                            <h4 className="text-[16px] px-1 py-1 border-b border-[#eee] text-[#333]">CART SUMMARY</h4>
                            <div className="py-1 flex justify-between items-center">
                                <h2 className="text-[16px] font-semibold">Subtotal</h2>
                                <h2 className="text-[19px] font-bold"><del>N</del>{(summary?.totalPrice)?.toLocaleString('en-NG') || 0}.00</h2>
                            </div>
                            <div className="flex flex-col">
                                <Link href={`/checkout`} className="py-2 px-8 bg-[#333] w-full mt-2 text-white text-[15px] cursor-pointer text-center">Checkout</Link>
                                <Link href={`/`} className="py-2 px-8 bg-[#333] mt-1 text-white text-[15px] cursor-pointer text-center">Continue Shopping</Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default CartContainer;