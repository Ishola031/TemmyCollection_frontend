"use client";

import React, { useEffect, useState } from "react";
import {
    FiAlertCircle,
    FiCheckCircle,
    FiPackage,
    FiTag,
    FiTruck,
} from "react-icons/fi";
import api from "../../api/api";

export default function Payment() {
    const [order, setOrder] = useState(null);
    const [cart, setCart] = useState(null);

    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const [error, setError] = useState("");
    const [notifications, setNotifications] = useState([]);

    const formatMoney = (amount) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 2,
        }).format(Number(amount || 0));
    };

    // ============================================================
    // FETCH ORDER
    // ============================================================

    const fetchOrder = async () => {
        try {
            const response = await api.get(
                "/api/o/cart/checkoutview/",
                {
                    withCredentials: true,
                }
            );

            const orderData =
                response.data?.order ||
                response.data;

            setOrder(orderData);

            return orderData;
        } catch (err) {
            console.error(
                "Failed to fetch order:",
                err
            );

            setError(
                err.response?.data?.error ||
                    err.response?.data?.detail ||
                    "Unable to load your order."
            );

            return null;
        }
    };

    // ============================================================
    // FETCH CART
    // ============================================================

    const fetchCart = async () => {
        try {
            const cartId =
                localStorage.getItem("cart_id");

            const response = await api.get(
                "/api/o/cart",
                {
                    params: {
                        cart_id: cartId,
                    },
                    withCredentials: true,
                }
            );

            setCart(response.data);

            return response.data;
        } catch (err) {
            console.error(
                "Failed to fetch cart:",
                err
            );

            return null;
        }
    };

    // ============================================================
    // LOAD PAGE
    // ============================================================

    const loadPage = async () => {
        setLoading(true);

        await Promise.all([
            fetchOrder(),
            fetchCart(),
        ]);

        setLoading(false);
    };

    useEffect(() => {
        loadPage();
    }, []);

    // ============================================================
    // HANDLE PAYMENT
    // ============================================================

    const handlePayment = async () => {
        setError("");
        setNotifications([]);
        setPaymentLoading(true);

        try {
            const response = await api.post(
                "/api/o/initiatepayment/",
                {},
                {
                    withCredentials: true,
                }
            );

            const data = response.data;

            // ====================================================
            // UPDATE ORDER
            // ====================================================

            if (data?.order) {
                setOrder((previousOrder) => ({
                    ...previousOrder,
                    ...data.order,
                }));
            }

            // ====================================================
            // PAYMENT LINK
            // ====================================================

            const paymentLink =
                data?.payment_gateway?.data?.link;

            if (!paymentLink) {
                setError(
                    "Payment could not be initialized. Please try again."
                );

                setPaymentLoading(false);

                return;
            }

            // ====================================================
            // IMPORTANT
            // ====================================================
            //
            // If Flutterwave returned a payment link,
            // payment initialization was successful.
            //
            // Do NOT show old delivery errors here.
            //

            setError("");

            setNotifications([]);

            // ====================================================
            // REDIRECT TO FLUTTERWAVE
            // ====================================================

            window.location.href = paymentLink;

        } catch (err) {
            console.error(
                "Payment initialization failed:",
                err
            );

            const data =
                err.response?.data || {};

            const backendError =
                data?.error ||
                data?.message ||
                data?.detail ||
                "Payment could not be initiated.";

            setError(backendError);

            if (
                Array.isArray(
                    data?.notifications
                )
            ) {
                setNotifications(
                    data.notifications
                );
            } else {
                setNotifications([]);
            }

            // ====================================================
            // REFRESH CART
            // ====================================================

            await fetchCart();

            // ====================================================
            // REFRESH ORDER
            // ====================================================

            await fetchOrder();

            setPaymentLoading(false);
        }
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

                    <p className="text-sm text-gray-500">
                        Loading payment details...
                    </p>
                </div>
            </div>
        );
    }

    // ============================================================
    // NO ORDER
    // ============================================================

    if (!order) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-10">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                    <FiAlertCircle className="mx-auto mb-3 text-3xl text-red-500" />

                    <h2 className="text-lg font-semibold text-red-700">
                        Unable to load your order
                    </h2>

                    <p className="mt-2 text-sm text-red-600">
                        {error ||
                            "Please return to checkout and try again."}
                    </p>
                </div>
            </div>
        );
    }

    // ============================================================
    // DELIVERY INFORMATION
    // ============================================================

    const isPickup =
        order?.delivery_method === "pickup";

    const isDelivery =
        order?.delivery_method === "delivery";

    const shippingAddress =
        order?.shipping_address || null;

    const pickupStation =
        order?.pickup_station || null;

    /*
     * Only show missing delivery information when
     * the order actually requires it.
     */
    const missingDeliveryInformation =
        (isDelivery && !shippingAddress) ||
        (isPickup && !pickupStation) ||
        (!isDelivery && !isPickup);

    // ============================================================
    // CART ITEMS
    // ============================================================

    const cartItems =
        cart?.cartitems ||
        cart?.cart_items ||
        [];

    // ============================================================
    // ORDER AMOUNTS
    // ============================================================

    const subtotal = Number(
        order?.sub_total || 0
    );

    const couponDiscount = Number(
        order?.coupon_discount || 0
    );

    const shippingPrice = Number(
        order?.shipping_price || 0
    );

    const totalPrice = Number(
        order?.total_price ??
            subtotal -
                couponDiscount +
                shippingPrice
    );

    // ============================================================
    // COUPON
    // ============================================================

    const couponCode =
        order?.coupon_code ||
        order?.coupon?.code ||
        "";

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Payment
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Review your order before completing
                    payment.
                </p>
            </div>

            {/* ====================================================
                ERRORS / NOTIFICATIONS
            ==================================================== */}

            {(error ||
                notifications.length > 0) && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                    <div className="flex items-start gap-3">

                        <FiAlertCircle className="mt-0.5 shrink-0 text-xl text-red-600" />

                        <div className="min-w-0 flex-1">

                            {error && (
                                <p className="font-semibold text-red-700">
                                    {error}
                                </p>
                            )}

                            {notifications.length >
                                0 && (
                                <div
                                    className={
                                        error
                                            ? "mt-3"
                                            : ""
                                    }
                                >
                                    <p className="mb-2 text-sm font-medium text-red-700">
                                        Please review these changes:
                                    </p>

                                    <div className="space-y-2">
                                        {notifications.map(
                                            (
                                                notification,
                                                index
                                            ) => (
                                                <div
                                                    key={`${notification.message}-${index}`}
                                                    className="flex items-start gap-2 rounded-lg bg-white px-3 py-2"
                                                >
                                                    <span className="mt-0.5 text-red-500">
                                                        •
                                                    </span>

                                                    <p className="text-sm text-red-600">
                                                        {
                                                            notification.message
                                                        }
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    setError("");
                                    setNotifications([]);
                                }}
                                className="mt-4 text-sm font-medium text-red-700 underline underline-offset-2"
                            >
                                Dismiss
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* ====================================================
                CONTENT
            ==================================================== */}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* ==================================================
                    LEFT
                ================================================== */}

                <div className="space-y-6 lg:col-span-2">

                    {/* ==================================================
                        DELIVERY METHOD
                    ================================================== */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <div className="mb-5 flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">

                                {isPickup ? (
                                    <FiPackage className="text-lg text-gray-700" />
                                ) : (
                                    <FiTruck className="text-lg text-gray-700" />
                                )}

                            </div>

                            <div>

                                <h2 className="font-semibold text-gray-900">
                                    Delivery method
                                </h2>

                                <p className="text-sm text-gray-500">
                                    {isPickup
                                        ? "Pickup Station"
                                        : "Home Delivery"}
                                </p>

                            </div>

                        </div>

                        {/* ==================================================
                            HOME DELIVERY
                        ================================================== */}

                        {isDelivery &&
                            shippingAddress && (
                                <div className="rounded-xl border border-gray-200 p-4">

                                    <div className="mb-3 flex items-center justify-between gap-3">

                                        <h3 className="font-medium text-gray-900">
                                            Shipping address
                                        </h3>

                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                            Home Delivery
                                        </span>

                                    </div>

                                    <p className="text-sm font-medium text-gray-900">
                                        {
                                            shippingAddress.first_name
                                        }{" "}
                                        {
                                            shippingAddress.last_name
                                        }
                                    </p>

                                    <p className="mt-1 text-sm text-gray-600">
                                        {
                                            shippingAddress.address_line_1
                                        }
                                    </p>

                                    <p className="text-sm text-gray-600">
                                        {
                                            shippingAddress.city
                                        }
                                        ,{" "}
                                        {
                                            shippingAddress.state
                                                ?.name
                                        }
                                    </p>

                                    <p className="text-sm text-gray-600">
                                        {
                                            shippingAddress.country
                                        }
                                    </p>

                                    {shippingAddress.phone1 && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            {
                                                shippingAddress.phone1
                                            }
                                        </p>
                                    )}

                                </div>
                            )}

                        {/* ==================================================
                            PICKUP
                        ================================================== */}

                        {isPickup &&
                            pickupStation && (
                                <div className="rounded-xl border border-gray-200 p-4">

                                    <div className="mb-4 flex items-center justify-between gap-3">

                                        <h3 className="font-medium text-gray-900">
                                            Pickup station
                                        </h3>

                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                            Pickup
                                        </span>

                                    </div>

                                    <div className="space-y-2">

                                        <p className="font-semibold text-gray-900">
                                            {
                                                pickupStation.name
                                            }
                                        </p>

                                        <p className="text-sm text-gray-600">
                                            {
                                                pickupStation.address
                                            }
                                        </p>

                                        <p className="text-sm text-gray-600">
                                            {
                                                pickupStation.city
                                            }
                                            ,{" "}
                                            {
                                                pickupStation.state
                                                    ?.name
                                            }
                                        </p>

                                        {pickupStation.phone_number && (
                                            <p className="text-sm text-gray-600">
                                                {
                                                    pickupStation.phone_number
                                                }
                                            </p>
                                        )}

                                    </div>

                                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                                        <div className="rounded-lg bg-gray-50 p-3">

                                            <p className="text-xs text-gray-500">
                                                Opening time
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-gray-900">
                                                {
                                                    pickupStation.opening_time
                                                }
                                            </p>

                                        </div>

                                        <div className="rounded-lg bg-gray-50 p-3">

                                            <p className="text-xs text-gray-500">
                                                Closing time
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-gray-900">
                                                {
                                                    pickupStation.closing_time
                                                }
                                            </p>

                                        </div>

                                    </div>

                                </div>
                            )}

                        {/* ==================================================
                            MISSING DELIVERY INFORMATION
                        ================================================== */}

                        {missingDeliveryInformation && (
                            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">

                                <div className="flex items-start gap-3">

                                    <FiAlertCircle className="mt-0.5 shrink-0 text-yellow-600" />

                                    <div>

                                        <p className="text-sm font-medium text-yellow-800">
                                            Delivery information is incomplete.
                                        </p>

                                        <p className="mt-1 text-sm text-yellow-700">
                                            Please return to checkout
                                            and select your delivery
                                            method.
                                        </p>

                                    </div>

                                </div>

                            </div>
                        )}

                    </div>

                    {/* ==================================================
                        ORDER NOTE
                    ================================================== */}

                    {order?.order_note && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                            <h2 className="mb-2 font-semibold text-gray-900">
                                Order note
                            </h2>

                            <p className="text-sm leading-6 text-gray-600">
                                {order.order_note}
                            </p>

                        </div>
                    )}

                    {/* ==================================================
                        ORDER ITEMS
                    ================================================== */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <div className="mb-5 flex items-center justify-between">

                            <h2 className="font-semibold text-gray-900">
                                Your items
                            </h2>

                            <span className="text-sm text-gray-500">
                                {cartItems.length}{" "}
                                {cartItems.length === 1
                                    ? "item"
                                    : "items"}
                            </span>

                        </div>

                        <div className="divide-y divide-gray-100">

                            {cartItems.length > 0 ? (
                                cartItems.map((item) => {

                                    const product =
                                        item.product;

                                    const variation =
                                        item.variations ||
                                        item.variation;

                                    const image =
                                        product?.image ||
                                        product?.images?.[0]
                                            ?.image;

                                    const price =
                                        variation?.price ??
                                        product?.price ??
                                        0;

                                    const quantity =
                                        item.quantity || 1;

                                    const discount =
                                        Number(
                                            product?.discount ||
                                                0
                                        );

                                    const discountedPrice =
                                        discount > 0
                                            ? Number(price) *
                                              ((100 -
                                                  discount) /
                                                  100)
                                            : Number(price);

                                    const itemTotal =
                                        discountedPrice *
                                        quantity;

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex gap-4 py-4 first:pt-0 last:pb-0"
                                        >

                                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">

                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={
                                                            product?.name ||
                                                            "Product"
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <FiPackage className="text-xl text-gray-400" />
                                                    </div>
                                                )}

                                            </div>

                                            <div className="min-w-0 flex-1">

                                                <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
                                                    {
                                                        product?.name
                                                    }
                                                </h3>

                                                {variation && (
                                                    <div className="mt-1 text-xs text-gray-500">

                                                        {variation.color
                                                            ?.name && (
                                                            <span>
                                                                Color:{" "}
                                                                {
                                                                    variation
                                                                        .color
                                                                        .name
                                                                }
                                                            </span>
                                                        )}

                                                        {variation.size
                                                            ?.name && (
                                                            <span>
                                                                {variation
                                                                    .color
                                                                    ?.name &&
                                                                    " · "}
                                                                Size:{" "}
                                                                {
                                                                    variation
                                                                        .size
                                                                        .name
                                                                }
                                                            </span>
                                                        )}

                                                        {variation.name &&
                                                            !variation.color &&
                                                            !variation.size && (
                                                                <span>
                                                                    {
                                                                        variation.name
                                                                    }
                                                                </span>
                                                            )}

                                                    </div>
                                                )}

                                                <p className="mt-2 text-sm text-gray-500">
                                                    Qty:{" "}
                                                    {quantity}
                                                </p>

                                            </div>

                                            <div className="shrink-0 text-right">

                                                <p className="text-sm font-semibold text-gray-900">
                                                    {formatMoney(
                                                        itemTotal
                                                    )}
                                                </p>

                                                {discount > 0 && (
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {
                                                            discount
                                                        }
                                                        % off
                                                    </p>
                                                )}

                                            </div>

                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-8 text-center">

                                    <FiPackage className="mx-auto mb-3 text-3xl text-gray-300" />

                                    <p className="text-sm text-gray-500">
                                        No active items in
                                        your cart.
                                    </p>

                                </div>
                            )}

                        </div>

                    </div>

                </div>

                {/* ==================================================
                    RIGHT
                ================================================== */}

                <div className="lg:col-span-1">

                    <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <h2 className="mb-5 text-lg font-semibold text-gray-900">
                            Order summary
                        </h2>

                        <div className="space-y-4">

                            {/* SUBTOTAL */}

                            <div className="flex items-center justify-between gap-4">

                                <span className="text-sm text-gray-500">
                                    Subtotal
                                </span>

                                <span className="text-sm font-medium text-gray-900">
                                    {formatMoney(
                                        subtotal
                                    )}
                                </span>

                            </div>

                            {/* COUPON */}

                            {couponDiscount > 0 && (
                                <div className="rounded-xl border border-green-200 bg-green-50 p-3">

                                    <div className="flex items-center justify-between gap-3">

                                        <div className="flex min-w-0 items-center gap-2">

                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100">

                                                <FiTag className="text-green-600" />

                                            </div>

                                            <div className="min-w-0">

                                                <p className="text-xs font-medium text-green-700">
                                                    Coupon applied
                                                </p>

                                                {couponCode && (
                                                    <p className="truncate text-sm font-semibold text-green-800">
                                                        {
                                                            couponCode
                                                        }
                                                    </p>
                                                )}

                                            </div>

                                        </div>

                                        <span className="shrink-0 text-sm font-semibold text-green-700">
                                            -
                                            {formatMoney(
                                                couponDiscount
                                            )}
                                        </span>

                                    </div>

                                </div>
                            )}

                            {/* NO COUPON */}

                            {couponDiscount === 0 &&
                                !couponCode && (
                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-sm text-gray-500">
                                            Coupon
                                        </span>

                                        <span className="text-sm text-gray-400">
                                            None
                                        </span>

                                    </div>
                                )}

                            {/* SHIPPING */}

                            <div className="flex items-center justify-between gap-4">

                                <span className="text-sm text-gray-500">
                                    {isPickup
                                        ? "Pickup fee"
                                        : "Delivery fee"}
                                </span>

                                <span className="text-sm font-medium text-gray-900">
                                    {formatMoney(
                                        shippingPrice
                                    )}
                                </span>

                            </div>

                            {/* AFTER DISCOUNT */}

                            {couponDiscount > 0 && (
                                <div className="flex items-center justify-between gap-4">

                                    <span className="text-sm text-gray-500">
                                        After discount
                                    </span>

                                    <span className="text-sm font-medium text-gray-900">
                                        {formatMoney(
                                            Math.max(
                                                subtotal -
                                                    couponDiscount,
                                                0
                                            )
                                        )}
                                    </span>

                                </div>
                            )}

                            {/* TOTAL */}

                            <div className="border-t border-gray-100 pt-4">

                                <div className="flex items-center justify-between gap-4">

                                    <span className="font-semibold text-gray-900">
                                        Total
                                    </span>

                                    <span className="text-xl font-bold text-gray-900">
                                        {formatMoney(
                                            totalPrice
                                        )}
                                    </span>

                                </div>

                            </div>

                        </div>

                        {/* ==================================================
                            PAYMENT BUTTON
                        ================================================== */}

                        <button
                            type="button"
                            onClick={handlePayment}
                            disabled={
                                paymentLoading ||
                                cartItems.length === 0 ||
                                notifications.length > 0
                            }
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >

                            {paymentLoading ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FiCheckCircle />

                                    Pay{" "}
                                    {formatMoney(
                                        totalPrice
                                    )}
                                </>
                            )}

                        </button>

                        {notifications.length > 0 && (
                            <p className="mt-3 text-center text-xs leading-5 text-gray-500">
                                Please review your cart
                                before trying payment
                                again.
                            </p>
                        )}

                        <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                            You will be redirected to
                            Flutterwave to securely
                            complete your payment.
                        </p>

                    </div>

                </div>

            </div>
        </div>
    );
}