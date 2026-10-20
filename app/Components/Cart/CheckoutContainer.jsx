"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../api/api";
import { useRouter } from "next/navigation";
import {
    MdLocationOn,
    MdOutlineShoppingBag,
    MdArrowForward,
    MdLocalShipping,
    MdStorefront,
} from "react-icons/md";
import {
    FiEdit2,
    FiPlus,
    FiCheck,
    FiMapPin,
    FiClock,
    FiTag,
    FiX,
} from "react-icons/fi";

const CheckoutContainer = () => {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [mountloading, setMountLoading] = useState(true);
    const [error, setError] = useState(null);

    const [cart, setCart] = useState(null);
    const [states, setStates] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [pickupStations, setPickupStations] = useState([]);

    const [summary, setSummary] = useState({
        total_price: 0,
    });

    const [hasAddress, setHasAddress] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | COUPON
    |--------------------------------------------------------------------------
    */

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState(null);
    const [couponSuccess, setCouponSuccess] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | DELIVERY METHOD
    |--------------------------------------------------------------------------
    */

    const [deliveryMethod, setDeliveryMethod] = useState("delivery");

    /*
    |--------------------------------------------------------------------------
    | NEW ADDRESS FORM
    |--------------------------------------------------------------------------
    */

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        phone1: "",
        phone2: "",
        address_line_1: "",
        city: "",
        state: "",
        country: "Nigeria",
        address_type: "",
        order_note: "",
        total_price: 0,
    });

    /*
    |--------------------------------------------------------------------------
    | ORDER FORM
    |--------------------------------------------------------------------------
    */

    const [orderFormData, setOrderFormData] = useState({
        delivery_method: "delivery",
        shipping_address: null,
        pickup_station: null,
        order_note: "",
        total_price: 0,
    });

    /*
    |--------------------------------------------------------------------------
    | FETCH CART
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const fetchCart = async () => {
            try {
                setMountLoading(true);

                const cart_id = localStorage.getItem("cart_id");

                const response = await api.get("/api/o/cart", {
                    params: {
                        cart_id,
                    },
                    withCredentials: true,
                });

                setCart(response.data);
            } catch (error) {
                console.error(error);
                setError("Unable to load your cart.");
            } finally {
                setMountLoading(false);
            }
        };

        fetchCart();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | FETCH STATES
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await api.get("/api/o/states/");
                setStates(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchStates();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | FETCH PICKUP STATIONS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const fetchPickupStations = async () => {
            try {
                const response = await api.get(
                    "/api/o/pickup-stations/"
                );

                setPickupStations(response.data);
            } catch (error) {
                console.error(error);
                setPickupStations([]);
            }
        };

        fetchPickupStations();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | FETCH EXISTING CHECKOUT
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const fetchCheckout = async () => {
            try {
                const response = await api.get(
                    "/api/o/cart/checkoutview/"
                );

                const order = response.data?.order;

                if (!order) return;

                setOrderFormData((value) => ({
                    ...value,

                    delivery_method:
                        order.delivery_method || "delivery",

                    shipping_address:
                        order.shipping_address?.id ||
                        order.shipping_address ||
                        null,

                    pickup_station:
                        order.pickup_station?.id ||
                        order.pickup_station ||
                        null,

                    order_note: order.order_note || "",
                }));

                if (order.delivery_method) {
                    setDeliveryMethod(
                        order.delivery_method
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | RESTORE COUPON
                |--------------------------------------------------------------------------
                */

                if (order.coupon_code) {
                    setCouponCode(
                        order.coupon_code
                    );

                    setAppliedCoupon(
                        order.coupon_code
                    );

                    setCouponDiscount(
                        Number(
                            order.coupon_discount || 0
                        )
                    );
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchCheckout();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | FETCH USER ADDRESSES
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const fetchUserAddress = async () => {
            try {
                const response = await api.get(
                    "/api/o/useraddress/"
                );

                const data = response.data || [];

                setAddresses(data);
                setHasAddress(data.length > 0);
            } catch (error) {
                console.error(error);

                setAddresses([]);
                setHasAddress(false);
            }
        };

        fetchUserAddress();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | CALCULATE PRODUCT SUBTOTAL
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let totalPrice = 0;

        cart?.cartitems?.forEach((item) => {
            if (!item.is_active) return;

            let price =
                item.variations !== null
                    ? Number(
                          item.variations?.price || 0
                      )
                    : Number(
                          item.product?.price || 0
                      );

            if (
                Number(
                    item.product?.discount || 0
                ) > 0
            ) {
                price =
                    ((100 -
                        Number(
                            item.product.discount
                        )) /
                        100) *
                    price;
            }

            totalPrice +=
                price *
                Number(item.quantity || 0);
        });

        setSummary((value) => ({
            ...value,
            total_price: totalPrice,
        }));

        setFormData((value) => ({
            ...value,
            total_price: totalPrice,
        }));

        setOrderFormData((value) => ({
            ...value,
            total_price: totalPrice,
        }));
    }, [cart]);

    /*
    |--------------------------------------------------------------------------
    | SELECT DELIVERY METHOD
    |--------------------------------------------------------------------------
    */

    const handleDeliveryMethod = (method) => {
        setDeliveryMethod(method);

        setError(null);

        setOrderFormData((value) => ({
            ...value,

            delivery_method: method,

            shipping_address:
                method === "delivery"
                    ? value.shipping_address
                    : null,

            pickup_station:
                method === "pickup"
                    ? value.pickup_station
                    : null,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | SELECT ADDRESS
    |--------------------------------------------------------------------------
    */

    const handleAddressSelect = (addressId) => {
        setOrderFormData((value) => ({
            ...value,
            shipping_address: addressId,
            delivery_method: "delivery",
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | SELECT PICKUP STATION
    |--------------------------------------------------------------------------
    */

    const handlePickupStationSelect = (
        stationId
    ) => {
        setOrderFormData((value) => ({
            ...value,
            pickup_station: stationId,
            delivery_method: "pickup",
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | CHECK SELECTED ADDRESS
    |--------------------------------------------------------------------------
    */

    const isAddressChecked = (value) => {
        return (
            orderFormData.shipping_address &&
            Number(
                orderFormData.shipping_address
            ) === Number(value)
        );
    };

    /*
    |--------------------------------------------------------------------------
    | CHECK SELECTED PICKUP STATION
    |--------------------------------------------------------------------------
    */

    const isPickupChecked = (value) => {
        return (
            orderFormData.pickup_station &&
            Number(
                orderFormData.pickup_station
            ) === Number(value)
        );
    };

    /*
    |--------------------------------------------------------------------------
    | SELECTED PICKUP STATION
    |--------------------------------------------------------------------------
    */

    const selectedPickupStation =
        pickupStations.find(
            (station) =>
                Number(station.id) ===
                Number(
                    orderFormData.pickup_station
                )
        ) || null;

    /*
    |--------------------------------------------------------------------------
    | PICKUP FEE
    |--------------------------------------------------------------------------
    */

    const pickupFee =
        deliveryMethod === "pickup" &&
        selectedPickupStation
            ? Number(
                  selectedPickupStation.pickup_fee ||
                      0
              )
            : 0;

    /*
    |--------------------------------------------------------------------------
    | COUPON DISPLAY TOTAL
    |--------------------------------------------------------------------------
    */

    const subtotal = Number(
        summary.total_price || 0
    );

    const discountedSubtotal = Math.max(
        subtotal - Number(couponDiscount || 0),
        0
    );

    const pickupDisplayTotal =
        discountedSubtotal + pickupFee;

    /*
    |--------------------------------------------------------------------------
    | APPLY COUPON
    |--------------------------------------------------------------------------
    */

    const handleApplyCoupon = async () => {
        setCouponError(null);
        setCouponSuccess(null);

        const code = couponCode
            .trim()
            .toUpperCase();

        if (!code) {
            setCouponError(
                "Please enter a coupon code."
            );

            return;
        }

        if (subtotal <= 0) {
            setCouponError(
                "Your cart is empty."
            );

            return;
        }

        try {
            setCouponLoading(true);

            /*
            |--------------------------------------------------------------------------
            | We use the same checkout endpoint to validate
            | and save the coupon on the pending order.
            |--------------------------------------------------------------------------
            */

            let payload = {
                delivery_method:
                    deliveryMethod,

                shipping_address:
                    deliveryMethod === "delivery" &&
                    hasAddress
                        ? orderFormData.shipping_address
                        : null,

                pickup_station:
                    deliveryMethod === "pickup"
                        ? orderFormData.pickup_station
                        : null,

                coupon_code: code,

                order_note:
                    deliveryMethod === "delivery" &&
                    !hasAddress
                        ? formData.order_note || ""
                        : orderFormData.order_note ||
                          "",
            };

            /*
            |--------------------------------------------------------------------------
            | NEW ADDRESS
            |--------------------------------------------------------------------------
            */

            if (
                deliveryMethod === "delivery" &&
                !hasAddress
            ) {
                payload = {
                    ...formData,

                    delivery_method:
                        "delivery",

                    shipping_address: null,

                    pickup_station: null,

                    coupon_code: code,

                    order_note:
                        formData.order_note || "",
                };
            }

            const response = await api.post(
                "/api/o/cart/checkout/",
                payload
            );

            const order =
                response.data?.order;

            const discount = Number(
                order?.coupon_discount || 0
            );

            setCouponCode(
                order?.coupon_code || code
            );

            setAppliedCoupon(
                order?.coupon_code || code
            );

            setCouponDiscount(
                discount
            );

            setCouponSuccess(
                `Coupon ${
                    order?.coupon_code || code
                } applied successfully.`
            );
        } catch (error) {
            console.error(error);

            const message =
                error?.response?.data?.detail ||
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Unable to apply coupon.";

            setCouponError(message);

            setAppliedCoupon(null);
            setCouponDiscount(0);
        } finally {
            setCouponLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | REMOVE COUPON
    |--------------------------------------------------------------------------
    */

    const handleRemoveCoupon = async () => {
        try {
            setCouponLoading(true);
            setCouponError(null);
            setCouponSuccess(null);

            let payload = {
                delivery_method:
                    deliveryMethod,

                shipping_address:
                    deliveryMethod === "delivery" &&
                    hasAddress
                        ? orderFormData.shipping_address
                        : null,

                pickup_station:
                    deliveryMethod === "pickup"
                        ? orderFormData.pickup_station
                        : null,

                coupon_code: "",

                order_note:
                    deliveryMethod === "delivery" &&
                    !hasAddress
                        ? formData.order_note || ""
                        : orderFormData.order_note ||
                          "",
            };

            /*
            |--------------------------------------------------------------------------
            | NEW ADDRESS
            |--------------------------------------------------------------------------
            */

            if (
                deliveryMethod === "delivery" &&
                !hasAddress
            ) {
                payload = {
                    ...formData,

                    delivery_method:
                        "delivery",

                    shipping_address: null,

                    pickup_station: null,

                    coupon_code: "",

                    order_note:
                        formData.order_note || "",
                };
            }

            await api.post(
                "/api/o/cart/checkout/",
                payload
            );

            setCouponCode("");
            setAppliedCoupon(null);
            setCouponDiscount(0);

            setCouponSuccess(
                "Coupon removed successfully."
            );
        } catch (error) {
            console.error(error);

            const message =
                error?.response?.data?.detail ||
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Unable to remove coupon.";

            setCouponError(message);
        } finally {
            setCouponLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | HANDLE SUBMIT
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // PICKUP VALIDATION
        if (deliveryMethod === "pickup") {
            if (!orderFormData.pickup_station) {
                setError(
                    "Please select a pickup station before continuing."
                );
                return;
            }
        }

        // DELIVERY VALIDATION

        if (deliveryMethod === "delivery") {
            if (hasAddress && !orderFormData.shipping_address) {
                setError(
                    "Please select a delivery address before continuing."
                );
                return;
            }

            if ( !hasAddress && !formData.state) {
                setError("Please select your state.");
                return;
            }
        }

        try {
            setLoading(true);

            // EXISTING SAVED ADDRESS

            if ( deliveryMethod === "delivery" && hasAddress) {
                const payload = {
                    delivery_method:
                        "delivery",

                    shipping_address:
                        orderFormData.shipping_address,

                    pickup_station: null,

                    order_note:
                        orderFormData.order_note ||
                        "",

                    coupon_code:
                        appliedCoupon || "",
                };
                console.log(payload)

                await api.post(
                    "/api/o/cart/checkout/",
                    payload
                );
            }

            // NEW DELIVERY ADDRESS
            else if ( deliveryMethod === "delivery" && !hasAddress) {
                const payload = {
                    ...formData,

                    delivery_method:
                        "delivery",

                    pickup_station: null,

                    order_note:
                        formData.order_note || "",

                    coupon_code:
                        appliedCoupon || "",
                };

                console.log(payload)

                await api.post(
                    "/api/o/cart/checkout/",
                    payload
                );
            }

            /*
            |--------------------------------------------------------------------------
            | PICKUP STATION
            |--------------------------------------------------------------------------
            */

            else if (deliveryMethod === "pickup") {
                const payload = {
                    delivery_method:
                        "pickup",

                    shipping_address: null,

                    pickup_station:
                        orderFormData.pickup_station,

                    order_note:
                        orderFormData.order_note ||
                        "",

                    coupon_code:
                        appliedCoupon || "",
                };

                await api.post(
                    "/api/o/cart/checkout/",
                    payload
                );
            }

            router.push(
                "/checkout/payment/"
            );
        } catch (error) {
            console.error(error);

            const message =
                error?.response?.data?.detail ||
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Unable to process your checkout.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | FORMAT MONEY
    |--------------------------------------------------------------------------
    */

    const formatMoney = (amount) => {
        return `₦${Number(
            amount || 0
        ).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <section className="w-full min-h-screen bg-[#f8f8f8] pt-28 pb-12 px-10 lg:px-15 max-[740px]:px-5 max-[740px]:pt-30">

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-7xl mx-auto"
            >

                {/* PAGE HEADER */}

                <div className="mb-7">
                    <h1 className="text-2xl md:text-3xl font-semibold text-[#222]">
                        Checkout
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Complete your order and select how
                        you want to receive it.
                    </p>
                </div>

                {/* ERROR */}

                {error && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <div className="flex gap-6 items-start max-[850px]:flex-col">

                    {/* =====================================================
                        LEFT SIDE
                    ====================================================== */}

                    <div className="w-[65%] max-[850px]:w-full">

                        {/* DELIVERY METHOD */}

                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">

                            <div className="px-5 py-4 border-b border-gray-100">

                                <div className="flex items-center gap-2">

                                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <MdLocalShipping className="text-xl" />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-[17px]">
                                            Delivery Method
                                        </h2>

                                        <p className="text-xs text-gray-500">
                                            How would you like to receive your order?
                                        </p>
                                    </div>

                                </div>

                            </div>

                            <div className="p-5">

                                <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">

                                    {/* HOME DELIVERY */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeliveryMethod(
                                                "delivery"
                                            )
                                        }
                                        className={`text-left border rounded-xl p-4 transition ${
                                            deliveryMethod ===
                                            "delivery"
                                                ? "border-blue-600 bg-blue-50/40"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >

                                        <div className="flex items-start justify-between">

                                            <div className="flex items-center gap-3">

                                                <div
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                        deliveryMethod ===
                                                        "delivery"
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-gray-100 text-gray-600"
                                                    }`}
                                                >
                                                    <MdLocalShipping className="text-xl" />
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-sm">
                                                        Home Delivery
                                                    </p>

                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Deliver to your address
                                                    </p>
                                                </div>

                                            </div>

                                            {deliveryMethod ===
                                                "delivery" && (
                                                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                                    <FiCheck className="text-xs" />
                                                </div>
                                            )}

                                        </div>

                                    </button>

                                    {/* PICKUP */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeliveryMethod(
                                                "pickup"
                                            )
                                        }
                                        className={`text-left border rounded-xl p-4 transition ${
                                            deliveryMethod ===
                                            "pickup"
                                                ? "border-blue-600 bg-blue-50/40"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >

                                        <div className="flex items-start justify-between">

                                            <div className="flex items-center gap-3">

                                                <div
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                        deliveryMethod ===
                                                        "pickup"
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-gray-100 text-gray-600"
                                                    }`}
                                                >
                                                    <MdStorefront className="text-xl" />
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-sm">
                                                        Pickup Station
                                                    </p>

                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Pick up your order yourself
                                                    </p>
                                                </div>

                                            </div>

                                            {deliveryMethod ===
                                                "pickup" && (
                                                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                                    <FiCheck className="text-xs" />
                                                </div>
                                            )}

                                        </div>

                                    </button>

                                </div>

                            </div>

                        </div>

                        {/* =================================================
                            HOME DELIVERY
                        ================================================== */}

                        {deliveryMethod === "delivery" && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">

                                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">

                                    <div className="flex items-center gap-2">

                                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <MdLocationOn className="text-xl" />
                                        </div>

                                        <div>
                                            <h2 className="font-semibold text-[17px]">
                                                Delivery Address
                                            </h2>

                                            <p className="text-xs text-gray-500">
                                                Where should we deliver your order?
                                            </p>
                                        </div>

                                    </div>

                                    {addresses.length > 0 && (
                                        <Link
                                            href="/checkout/billingaddress"
                                            className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700"
                                        >
                                            <FiPlus />
                                            Add address
                                        </Link>
                                    )}

                                </div>

                                <div className="p-5">

                                    {mountloading ? (

                                        <div className="w-full py-16 flex justify-center">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                                        </div>

                                    ) : addresses.length <= 0 ? (

                                        <div>

                                            <div className="mb-5">

                                                <div className="flex items-center gap-2">

                                                    <div className="w-2 h-2 rounded-full bg-blue-600" />

                                                    <p className="text-sm font-medium">
                                                        Add your delivery address
                                                    </p>

                                                </div>

                                            </div>

                                            <div className="grid grid-cols-2 gap-x-4 gap-y-7 max-[600px]:grid-cols-1">

                                                {/* FIRST NAME */}

                                                <div className="relative border border-gray-300 rounded-lg">

                                                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-600">
                                                        First Name
                                                    </label>

                                                    <input
                                                        type="text"
                                                        required
                                                        value={
                                                            formData.first_name
                                                        }
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (value) => ({
                                                                    ...value,
                                                                    first_name:
                                                                        e.target.value,
                                                                })
                                                            )
                                                        }
                                                        className="w-full px-3 py-3 rounded-lg outline-none text-sm"
                                                    />

                                                </div>

                                                {/* LAST NAME */}

                                                <div className="relative border border-gray-300 rounded-lg">

                                                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-600">
                                                        Last Name
                                                    </label>

                                                    <input
                                                        type="text"
                                                        required
                                                        value={
                                                            formData.last_name
                                                        }
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (value) => ({
                                                                    ...value,
                                                                    last_name:
                                                                        e.target.value,
                                                                })
                                                            )
                                                        }
                                                        className="w-full px-3 py-3 rounded-lg outline-none text-sm"
                                                    />

                                                </div>

                                                {/* ADDRESS */}

                                                <div className="relative border border-gray-300 rounded-lg col-span-2 max-[600px]:col-span-1">

                                                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-600">
                                                        Address
                                                    </label>

                                                    <input
                                                        type="text"
                                                        required
                                                        value={
                                                            formData.address_line_1
                                                        }
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (value) => ({
                                                                    ...value,
                                                                    address_line_1:
                                                                        e.target.value,
                                                                })
                                                            )
                                                        }
                                                        className="w-full px-3 py-3 rounded-lg outline-none text-sm"
                                                    />

                                                </div>

                                                {/* PHONE */}

                                                <div className="relative border border-gray-300 rounded-lg">

                                                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-600">
                                                        Phone Number
                                                    </label>

                                                    <input
                                                        type="tel"
                                                        required
                                                        value={
                                                            formData.phone1
                                                        }
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (value) => ({
                                                                    ...value,
                                                                    phone1:
                                                                        e.target.value,
                                                                })
                                                            )
                                                        }
                                                        className="w-full px-3 py-3 rounded-lg outline-none text-sm"
                                                    />

                                                </div>

                                                {/* PHONE 2 */}

                                                <div className="relative border border-gray-300 rounded-lg">

                                                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-600">
                                                        Phone Number (Optional)
                                                    </label>

                                                    <input
                                                        type="tel"
                                                        value={
                                                            formData.phone2
                                                        }
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (value) => ({
                                                                    ...value,
                                                                    phone2:
                                                                        e.target.value,
                                                                })
                                                            )
                                                        }
                                                        className="w-full px-3 py-3 rounded-lg outline-none text-sm"
                                                    />

                                                </div>

                                                {/* COUNTRY */}

                                                <div className="relative border border-gray-300 rounded-lg">

                                                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-600">
                                                        Country
                                                    </label>

                                                    <input
                                                        type="text"
                                                        disabled
                                                        value={
                                                            formData.country
                                                        }
                                                        className="w-full px-3 py-3 rounded-lg outline-none text-sm bg-gray-50"
                                                    />

                                                </div>

                                                {/* STATE */}

                                                <div className="relative border border-gray-300 rounded-lg">

                                                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-600">
                                                        State
                                                    </label>

                                                    <select
                                                        required
                                                        value={
                                                            formData.state
                                                        }
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (value) => ({
                                                                    ...value,
                                                                    state:
                                                                        e.target.value,
                                                                })
                                                            )
                                                        }
                                                        className="w-full px-3 py-3 rounded-lg outline-none text-sm bg-white"
                                                    >

                                                        <option value="">
                                                            Select state
                                                        </option>

                                                        {states.map(
                                                            (state) => (
                                                                <option
                                                                    key={
                                                                        state.id
                                                                    }
                                                                    value={
                                                                        state.id
                                                                    }
                                                                >
                                                                    {
                                                                        state.name
                                                                    }
                                                                </option>
                                                            )
                                                        )}

                                                    </select>

                                                </div>

                                                {/* CITY */}

                                                <div className="relative border border-gray-300 rounded-lg">

                                                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-600">
                                                        City
                                                    </label>

                                                    <input
                                                        type="text"
                                                        required
                                                        value={
                                                            formData.city
                                                        }
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (value) => ({
                                                                    ...value,
                                                                    city:
                                                                        e.target.value,
                                                                })
                                                            )
                                                        }
                                                        className="w-full px-3 py-3 rounded-lg outline-none text-sm"
                                                    />

                                                </div>

                                                {/* ADDRESS TYPE */}

                                                <div className="relative border border-gray-300 rounded-lg col-span-2 max-[600px]:col-span-1">

                                                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-600">
                                                        Address Type
                                                    </label>

                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Home, Office..."
                                                        value={
                                                            formData.address_type ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (value) => ({
                                                                    ...value,
                                                                    address_type:
                                                                        e.target.value,
                                                                })
                                                            )
                                                        }
                                                        className="w-full px-3 py-3 rounded-lg outline-none text-sm"
                                                    />

                                                </div>

                                                {/* ORDER NOTE */}

                                                <div className="relative border border-gray-300 rounded-lg col-span-2 max-[600px]:col-span-1">

                                                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-600">
                                                        Order Note (Optional)
                                                    </label>

                                                    <textarea
                                                        rows="3"
                                                        value={
                                                            formData.order_note
                                                        }
                                                        onChange={(e) =>
                                                            setFormData(
                                                                (value) => ({
                                                                    ...value,
                                                                    order_note:
                                                                        e.target.value,
                                                                })
                                                            )
                                                        }
                                                        className="w-full px-3 py-3 rounded-lg outline-none text-sm resize-none"
                                                    />

                                                </div>

                                            </div>

                                        </div>

                                    ) : (

                                        <div className="flex flex-col gap-3">

                                            {addresses.map(
                                                (address) => (
                                                    <div
                                                        key={`address-${address.id}`}
                                                        className={`border rounded-xl p-4 flex justify-between gap-4 transition ${
                                                            isAddressChecked(
                                                                address.id
                                                            )
                                                                ? "border-blue-600 bg-blue-50/40"
                                                                : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                    >

                                                        <div className="flex gap-3">

                                                            <div className="pt-1">

                                                                <input
                                                                    type="radio"
                                                                    name="address"
                                                                    className="w-4 h-4 accent-blue-600"
                                                                    checked={isAddressChecked(
                                                                        address.id
                                                                    )}
                                                                    onChange={() =>
                                                                        handleAddressSelect(
                                                                            address.id
                                                                        )
                                                                    }
                                                                    required
                                                                />

                                                            </div>

                                                            <div>

                                                                <div className="flex items-center gap-2 mb-1">

                                                                    <h3 className="font-semibold text-[15px] capitalize">
                                                                        {
                                                                            address.address_type
                                                                        }
                                                                    </h3>

                                                                    {isAddressChecked(
                                                                        address.id
                                                                    ) && (
                                                                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                                                            SELECTED
                                                                        </span>
                                                                    )}

                                                                </div>

                                                                <h4 className="font-medium uppercase text-sm">
                                                                    {
                                                                        address.first_name
                                                                    }{" "}
                                                                    {
                                                                        address.last_name
                                                                    }
                                                                </h4>

                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    {
                                                                        address.address_line_1
                                                                    }
                                                                    ,{" "}
                                                                    {
                                                                        address.city
                                                                    }{" "}
                                                                    {
                                                                        address.state
                                                                            ?.name
                                                                    }{" "}
                                                                    State
                                                                </p>

                                                                <p className="text-sm text-gray-600">
                                                                    {
                                                                        address.country
                                                                    }
                                                                </p>

                                                                <p className="text-sm text-gray-600">
                                                                    {
                                                                        address.phone1
                                                                    }

                                                                    {address.phone2 &&
                                                                        `, ${address.phone2}`}
                                                                </p>

                                                            </div>

                                                        </div>

                                                        <Link
                                                            href={`/checkout/billingaddress?address=${address.id}`}
                                                            className="text-blue-600 text-sm flex items-center gap-1 h-fit"
                                                        >
                                                            <FiEdit2 />

                                                            <span className="max-[500px]:hidden">
                                                                Edit
                                                            </span>
                                                        </Link>

                                                    </div>
                                                )
                                            )}

                                            {/* ORDER NOTE */}

                                            <div className="relative border border-gray-300 rounded-lg mt-4">

                                                <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-600">
                                                    Order Note (Optional)
                                                </label>

                                                <textarea
                                                    rows="3"
                                                    value={
                                                        orderFormData.order_note
                                                    }
                                                    onChange={(e) =>
                                                        setOrderFormData(
                                                            (value) => ({
                                                                ...value,
                                                                order_note:
                                                                    e.target.value,
                                                            })
                                                        )
                                                    }
                                                    className="w-full px-3 py-3 rounded-lg outline-none text-sm resize-none"
                                                />

                                            </div>

                                        </div>
                                    )}

                                </div>

                            </div>
                        )}

                        {/* =================================================
                            PICKUP STATION
                        ================================================== */}

                        {deliveryMethod === "pickup" && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">

                                <div className="px-5 py-4 border-b border-gray-100">

                                    <div className="flex items-center gap-2">

                                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <MdStorefront className="text-xl" />
                                        </div>

                                        <div>
                                            <h2 className="font-semibold text-[17px]">
                                                Pickup Station
                                            </h2>

                                            <p className="text-xs text-gray-500">
                                                Choose where you want to collect your order.
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                <div className="p-5">

                                    {pickupStations.length ===
                                    0 ? (
                                        <div className="text-center py-12">

                                            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mb-3">
                                                <MdStorefront className="text-2xl" />
                                            </div>

                                            <p className="font-medium text-sm">
                                                No pickup stations available
                                            </p>

                                            <p className="text-xs text-gray-500 mt-1">
                                                Please select Home Delivery instead.
                                            </p>

                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">

                                            {pickupStations.map(
                                                (station) => {

                                                    const selected =
                                                        isPickupChecked(
                                                            station.id
                                                        );

                                                    return (
                                                        <button
                                                            type="button"
                                                            key={`pickup-${station.id}`}
                                                            onClick={() =>
                                                                handlePickupStationSelect(
                                                                    station.id
                                                                )
                                                            }
                                                            className={`w-full text-left border rounded-xl p-4 transition ${
                                                                selected
                                                                    ? "border-blue-600 bg-blue-50/40"
                                                                    : "border-gray-200 hover:border-gray-300"
                                                            }`}
                                                        >

                                                            <div className="flex justify-between gap-4">

                                                                <div className="flex gap-3">

                                                                    <div
                                                                        className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${
                                                                            selected
                                                                                ? "bg-blue-600 text-white"
                                                                                : "bg-gray-100 text-gray-600"
                                                                        }`}
                                                                    >
                                                                        <MdStorefront className="text-xl" />
                                                                    </div>

                                                                    <div>

                                                                        <div className="flex items-center gap-2">

                                                                            <h3 className="font-semibold text-[15px]">
                                                                                {
                                                                                    station.name
                                                                                }
                                                                            </h3>

                                                                            {selected && (
                                                                                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                                                                    SELECTED
                                                                                </span>
                                                                            )}

                                                                        </div>

                                                                        <div className="flex items-start gap-1 mt-2">

                                                                            <FiMapPin className="text-gray-400 mt-0.5 shrink-0" />

                                                                            <p className="text-sm text-gray-600">
                                                                                {
                                                                                    station.address
                                                                                }
                                                                                ,{" "}
                                                                                {
                                                                                    station.city
                                                                                }
                                                                                ,{" "}
                                                                                {
                                                                                    station.state
                                                                                        ?.name
                                                                                }
                                                                            </p>

                                                                        </div>

                                                                        <div className="flex items-center gap-1 mt-2">

                                                                            <FiClock className="text-gray-400" />

                                                                            <p className="text-xs text-gray-500">
                                                                                {
                                                                                    station.opening_time
                                                                                }{" "}
                                                                                -{" "}
                                                                                {
                                                                                    station.closing_time
                                                                                }
                                                                            </p>

                                                                        </div>

                                                                        {station.phone_number && (
                                                                            <p className="text-xs text-gray-500 mt-2">
                                                                                Phone:{" "}
                                                                                {
                                                                                    station.phone_number
                                                                                }
                                                                            </p>
                                                                        )}

                                                                    </div>

                                                                </div>

                                                                <div className="text-right shrink-0">

                                                                    <p className="text-xs text-gray-500">
                                                                        Pickup fee
                                                                    </p>

                                                                    <p className="font-semibold text-sm mt-1">
                                                                        {formatMoney(
                                                                            station.pickup_fee
                                                                        )}
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </button>
                                                    );
                                                }
                                            )}

                                        </div>
                                    )}

                                    {selectedPickupStation && (
                                        <div className="mt-5 p-4 rounded-xl bg-gray-50 border border-gray-200">

                                            <div className="flex items-center gap-2 mb-2">

                                                <FiCheck className="text-green-600" />

                                                <p className="font-medium text-sm">
                                                    Pickup location selected
                                                </p>

                                            </div>

                                            <p className="text-sm text-gray-600">
                                                You will collect your order
                                                from{" "}
                                                <span className="font-medium text-gray-800">
                                                    {
                                                        selectedPickupStation.name
                                                    }
                                                </span>
                                                .
                                            </p>

                                        </div>
                                    )}

                                    {/* ORDER NOTE */}

                                    <div className="relative border border-gray-300 rounded-lg mt-5">

                                        <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-600">
                                            Order Note (Optional)
                                        </label>

                                        <textarea
                                            rows="3"
                                            value={
                                                orderFormData.order_note
                                            }
                                            onChange={(e) =>
                                                setOrderFormData(
                                                    (value) => ({
                                                        ...value,
                                                        order_note:
                                                            e.target.value,
                                                    })
                                                )
                                            }
                                            className="w-full px-3 py-3 rounded-lg outline-none text-sm resize-none"
                                        />

                                    </div>

                                </div>

                            </div>
                        )}

                        {/* =================================================
                            SHIPPING ITEMS
                        ================================================== */}

                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

                            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">

                                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                                    <MdOutlineShoppingBag className="text-xl text-gray-700" />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-[17px]">
                                        Shipping Items
                                    </h2>

                                    <p className="text-xs text-gray-500">
                                        Products included in your order
                                    </p>
                                </div>

                            </div>

                            <div className="p-5">

                                {mountloading ? (
                                    <div className="flex justify-center py-16">

                                        <div className="h-7 w-7 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                                    </div>
                                ) : cart?.cartitems?.length >
                                  0 ? (
                                    <div className="flex flex-col">

                                        {cart.cartitems.map(
                                            (item) => {

                                                if (
                                                    !item.is_active
                                                ) {
                                                    return null;
                                                }

                                                const price =
                                                    item.variations !==
                                                    null
                                                        ? Number(
                                                              item
                                                                  .variations
                                                                  ?.price ||
                                                                  0
                                                          )
                                                        : Number(
                                                              item
                                                                  .product
                                                                  ?.price ||
                                                                  0
                                                          );

                                                const finalPrice =
                                                    Number(
                                                        item
                                                            .product
                                                            ?.discount ||
                                                            0
                                                    ) > 0
                                                        ? ((100 -
                                                              Number(
                                                                  item
                                                                      .product
                                                                      .discount
                                                              )) /
                                                              100) *
                                                          price
                                                        : price;

                                                const itemTotal =
                                                    finalPrice *
                                                    Number(
                                                        item.quantity ||
                                                            0
                                                    );

                                                return (
                                                    <div
                                                        key={`cartitem-${item.id}`}
                                                        className="flex gap-4 py-4 border-b border-gray-100 last:border-0"
                                                    >

                                                        <img
                                                            src={`${item.product.image}`}
                                                            width={70}
                                                            height={70}
                                                            alt={
                                                                item
                                                                    .product
                                                                    .name
                                                            }
                                                            className="w-[70px] h-[70px] object-cover rounded-lg"
                                                        />

                                                        <div className="flex-1 min-w-0">

                                                            <div className="flex justify-between gap-3 max-[500px]:flex-col">

                                                                <div>

                                                                    <h3 className="font-medium text-[15px] line-clamp-2">
                                                                        {
                                                                            item
                                                                                .product
                                                                                .name
                                                                        }
                                                                    </h3>

                                                                    <div className="text-xs text-gray-500 mt-1">

                                                                        {item
                                                                            ?.variations
                                                                            ?.color && (
                                                                            <span>
                                                                                Color:{" "}
                                                                                {
                                                                                    item
                                                                                        .variations
                                                                                        .color
                                                                                        .name
                                                                                }
                                                                            </span>
                                                                        )}

                                                                        {item
                                                                            ?.variations
                                                                            ?.size && (
                                                                            <span>
                                                                                {item
                                                                                    ?.variations
                                                                                    ?.color &&
                                                                                    " · "}
                                                                                Size:{" "}
                                                                                {
                                                                                    item
                                                                                        .variations
                                                                                        .size
                                                                                        .name
                                                                                }
                                                                            </span>
                                                                        )}

                                                                    </div>

                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Quantity:{" "}
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </p>

                                                                </div>

                                                                <div className="text-right max-[500px]:text-left">

                                                                    <p className="font-semibold text-[16px]">
                                                                        {formatMoney(
                                                                            itemTotal
                                                                        )}
                                                                    </p>

                                                                    {Number(
                                                                        item
                                                                            .product
                                                                            ?.discount ||
                                                                            0
                                                                    ) > 0 && (
                                                                        <div className="flex items-center gap-2 justify-end max-[500px]:justify-start">

                                                                            <del className="text-xs text-gray-400">
                                                                                {formatMoney(
                                                                                    price *
                                                                                        Number(
                                                                                            item.quantity ||
                                                                                                0
                                                                                        )
                                                                                )}
                                                                            </del>

                                                                            <span className="text-[10px] bg-amber-400 px-1.5 py-0.5 rounded">
                                                                                -
                                                                                {
                                                                                    item
                                                                                        .product
                                                                                        .discount
                                                                                }
                                                                                %
                                                                            </span>

                                                                        </div>
                                                                    )}

                                                                </div>

                                                            </div>

                                                        </div>

                                                    </div>
                                                );
                                            }
                                        )}

                                    </div>
                                ) : (
                                    <div className="text-center py-16 text-gray-500">
                                        No items in cart
                                    </div>
                                )}

                            </div>

                        </div>

                    </div>

                    {/* =====================================================
                        RIGHT SUMMARY
                    ====================================================== */}

                    <div className="w-[35%] max-[850px]:w-full">

                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-28">

                            <div className="px-5 py-4 border-b border-gray-100">

                                <h2 className="font-semibold text-[17px]">
                                    Order Summary
                                </h2>

                                <p className="text-xs text-gray-500 mt-1">
                                    Review your order before continuing
                                </p>

                            </div>

                            <div className="p-5">

                                {/* ITEMS */}

                                <div className="flex justify-between items-center text-sm mb-3">

                                    <span className="text-gray-500">
                                        Items
                                    </span>

                                    <span>
                                        {cart?.cartitems
                                            ?.filter(
                                                (item) =>
                                                    item.is_active
                                            )
                                            .reduce(
                                                (
                                                    total,
                                                    item
                                                ) =>
                                                    total +
                                                    Number(
                                                        item.quantity ||
                                                            0
                                                    ),
                                                0
                                            ) || 0}
                                    </span>

                                </div>

                                {/* SUBTOTAL */}

                                <div className="flex justify-between items-center text-sm mb-3">

                                    <span className="text-gray-500">
                                        Subtotal
                                    </span>

                                    <span className="font-medium">
                                        {formatMoney(
                                            subtotal
                                        )}
                                    </span>

                                </div>

                                {/* COUPON */}

                                <div className="mt-5 mb-5">

                                    <div className="flex items-center gap-2 mb-3">

                                        <FiTag className="text-gray-600" />

                                        <span className="text-sm font-medium">
                                            Have a coupon?
                                        </span>

                                    </div>

                                    {appliedCoupon ? (

                                        <div className="border border-green-200 bg-green-50 rounded-lg p-3">

                                            <div className="flex items-center justify-between gap-3">

                                                <div className="min-w-0">

                                                    <div className="flex items-center gap-2">

                                                        <FiCheck className="text-green-600 shrink-0" />

                                                        <span className="text-sm font-semibold text-green-700 truncate">
                                                            {
                                                                appliedCoupon
                                                            }
                                                        </span>

                                                    </div>

                                                    <p className="text-xs text-green-600 mt-1">
                                                        Coupon applied
                                                    </p>

                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleRemoveCoupon
                                                    }
                                                    disabled={
                                                        couponLoading
                                                    }
                                                    className="shrink-0 w-8 h-8 rounded-lg bg-white border border-green-200 text-gray-500 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition disabled:opacity-50"
                                                >
                                                    {couponLoading ? (
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
                                                    ) : (
                                                        <FiX />
                                                    )}
                                                </button>

                                            </div>

                                        </div>

                                    ) : (

                                        <div>

                                            <div className="flex gap-2">

                                                <div className="relative flex-1">

                                                    <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                                    <input
                                                        type="text"
                                                        value={
                                                            couponCode
                                                        }
                                                        onChange={(e) => {
                                                            setCouponCode(
                                                                e.target.value.toUpperCase()
                                                            );

                                                            setCouponError(
                                                                null
                                                            );

                                                            setCouponSuccess(
                                                                null
                                                            );
                                                        }}
                                                        onKeyDown={(
                                                            e
                                                        ) => {
                                                            if (
                                                                e.key ===
                                                                "Enter"
                                                            ) {
                                                                e.preventDefault();

                                                                handleApplyCoupon();
                                                            }
                                                        }}
                                                        placeholder="Enter coupon code"
                                                        disabled={
                                                            couponLoading
                                                        }
                                                        className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                                    />

                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleApplyCoupon
                                                    }
                                                    disabled={
                                                        couponLoading ||
                                                        !couponCode.trim()
                                                    }
                                                    className="px-4 py-3 rounded-lg bg-[#333] hover:bg-black text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {couponLoading ? (
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                    ) : (
                                                        "Apply"
                                                    )}
                                                </button>

                                            </div>

                                            {couponError && (
                                                <p className="text-xs text-red-500 mt-2">
                                                    {
                                                        couponError
                                                    }
                                                </p>
                                            )}

                                            {couponSuccess && (
                                                <p className="text-xs text-green-600 mt-2">
                                                    {
                                                        couponSuccess
                                                    }
                                                </p>
                                            )}

                                        </div>
                                    )}

                                </div>

                                {/* COUPON DISCOUNT */}

                                {couponDiscount > 0 && (
                                    <div className="flex justify-between items-center text-sm mb-3">

                                        <span className="text-green-600">
                                            Coupon discount
                                        </span>

                                        <span className="font-medium text-green-600">
                                            -
                                            {formatMoney(
                                                couponDiscount
                                            )}
                                        </span>

                                    </div>
                                )}

                                {/* METHOD */}

                                <div className="flex justify-between items-center text-sm mb-3">

                                    <span className="text-gray-500">
                                        Method
                                    </span>

                                    <span className="font-medium">
                                        {deliveryMethod ===
                                        "pickup"
                                            ? "Pickup Station"
                                            : "Home Delivery"}
                                    </span>

                                </div>

                                {/* PICKUP FEE */}

                                {deliveryMethod ===
                                    "pickup" && (
                                    <div className="flex justify-between items-center text-sm mb-4">

                                        <span className="text-gray-500">
                                            Pickup fee
                                        </span>

                                        <span className="font-medium">
                                            {selectedPickupStation
                                                ? formatMoney(
                                                      pickupFee
                                                  )
                                                : "—"}
                                        </span>

                                    </div>
                                )}

                                {/* HOME DELIVERY FEE */}

                                {deliveryMethod ===
                                    "delivery" && (
                                    <div className="flex justify-between items-center text-sm mb-4">

                                        <span className="text-gray-500">
                                            Delivery fee
                                        </span>

                                        <span className="text-xs text-gray-500">
                                            Calculated at checkout
                                        </span>

                                    </div>
                                )}

                                {/* TOTAL */}

                                <div className="border-t border-gray-100 pt-4">

                                    <div className="flex justify-between items-center">

                                        <span className="font-semibold">
                                            Total
                                        </span>

                                        <span className="text-xl font-bold">

                                            {deliveryMethod ===
                                            "pickup"
                                                ? formatMoney(
                                                      pickupDisplayTotal
                                                  )
                                                : formatMoney(
                                                      discountedSubtotal
                                                  )}

                                        </span>

                                    </div>

                                    {deliveryMethod ===
                                        "delivery" && (
                                        <p className="text-[11px] text-gray-400 mt-1 text-right">
                                            Delivery fee will be calculated
                                            based on your location.
                                        </p>
                                    )}

                                </div>

                                {/* CONFIRM */}

                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        (deliveryMethod ===
                                            "pickup" &&
                                            !selectedPickupStation)
                                    }
                                    className="w-full mt-5 py-3 bg-[#333] hover:bg-black text-white rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >

                                    {loading ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Confirm Order

                                            <MdArrowForward className="text-xl" />
                                        </>
                                    )}

                                </button>

                                {/* CONTINUE SHOPPING */}

                                <Link
                                    href="/"
                                    className="w-full mt-2 py-3 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm flex items-center justify-center transition"
                                >
                                    Continue Shopping
                                </Link>

                                {/* NOTICE */}

                                <div className="mt-5 p-3 bg-gray-50 rounded-lg">

                                    <p className="text-xs text-gray-500 text-center leading-5">
                                        Please make sure the phone number
                                        on your account is active on
                                        WhatsApp to receive your order
                                        updates.
                                    </p>

                                    <p className="text-xs text-gray-500 text-center leading-5 mt-1">
                                        By proceeding, you agree to our
                                        Terms & Conditions.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </form>

        </section>
    );
};

export default CheckoutContainer;