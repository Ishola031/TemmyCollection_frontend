"use client";

import React, { useEffect, useRef, useState } from "react";
import Dashboard from "../../../Components/Dashboard";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";
import {
    FiPackage,
    FiMapPin,
    FiCreditCard,
    FiChevronRight,
    FiTruck,
    FiClock,
    FiPhone,
    FiShoppingBag,
    FiTag,
} from "react-icons/fi";
import {
    MdCheck,
    MdLocalShipping,
    MdStore,
    MdLocationOn,
} from "react-icons/md";
import api from "../../../api/api";

const Page = () => {
    const [orders, setOrders] = useState([]);
    const [orderDetail, setOrderDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showDetail, setShowDetail] = useState(false);

    const orderDetailRef = useRef(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get("/api/o/user/orders/");
                setOrders(
                    Array.isArray(res.data)
                        ? res.data
                        : res.data?.results || []
                );
            } catch (error) {
                console.error("FETCH ORDERS ERROR:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    useEffect(() => {
        if (!showDetail) return;

        const handleClickOutside = (event) => {
            if (
                orderDetailRef.current &&
                !orderDetailRef.current.contains(event.target)
            ) {
                setShowDetail(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
            document.body.style.overflow = "unset";
        };
    }, [showDetail]);

    const handleOrderDetail = async (orderNumber) => {
        setShowDetail(true);
        setLoadingDetails(true);
        setOrderDetail(null);

        try {
            const res = await api.get(
                `/api/o/user/orderdetail/?orderID=${orderNumber}`
            );

            setOrderDetail(res.data);
        } catch (error) {
            console.error("ORDER DETAIL ERROR:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeDetails = () => {
        setShowDetail(false);
        setOrderDetail(null);
    };

    const formatPrice = (price) => {
        const value = Number(price || 0);

        return `₦${value.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const formatDate = (date) => {
        if (!date) return "N/A";

        const d = new Date(date);

        if (Number.isNaN(d.getTime())) return "N/A";

        return d.toLocaleDateString("en-NG", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (date) => {
        if (!date) return "N/A";

        const d = new Date(date);

        if (Number.isNaN(d.getTime())) return "N/A";

        return d.toLocaleString("en-NG", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const normalizeStatus = (value) =>
        String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, "_");

    const isPickupOrder = (order) => {
        const method = normalizeStatus(order?.delivery_method);

        return (
            method === "pickup" ||
            method === "pick_up" ||
            method === "pickup_order" ||
            method === "pick_up_order"
        );
    };

    const getPaymentStatus = (order) => {
        const payment = normalizeStatus(
            order?.payment?.status
        );

        if (
            ["successful", "success", "paid"].includes(
                payment
            )
        ) {
            return "Paid";
        }

        if (
            normalizeStatus(order?.status) ===
            "successful"
        ) {
            return "Paid";
        }

        return "Pending";
    };

    const getPaymentStatusClass = (order) =>
        getPaymentStatus(order) === "Paid"
            ? "bg-green-50 text-green-600 border-green-100"
            : "bg-yellow-50 text-yellow-600 border-yellow-100";

    const getOrderStatusClass = (status) => {
        switch (normalizeStatus(status)) {
            case "delivered":
            case "successful":
            case "collected":
                return "bg-green-50 text-green-600 border-green-100";

            case "cancelled":
            case "canceled":
                return "bg-red-50 text-red-600 border-red-100";

            case "shipped":
            case "in_transit":
                return "bg-blue-50 text-blue-600 border-blue-100";

            case "processing":
                return "bg-orange-50 text-orange-600 border-orange-100";

            default:
                return "bg-gray-50 text-gray-600 border-gray-100";
        }
    };

    const getOrderStatusText = (status) => {
        switch (normalizeStatus(status)) {
            case "successful":
                return "Confirmed";
            case "processing":
                return "Processing";
            case "shipped":
                return "Shipped";
            case "in_transit":
                return "In Transit";
            case "delivered":
                return "Delivered";
            case "cancelled":
            case "canceled":
                return "Cancelled";
            case "pending":
                return "Pending";
            case "collected":
                return "Collected";
            default:
                return status || "Unknown";
        }
    };

    /*
     * Pickup:
     *
     * 0 Order placed
     * 1 Preparing your order
     * 2 Order shipped
     * 3 At pickup station
     * 4 Ready for pickup
     * 5 Collected
     */

    const getPickupProgress = (order, shipment, logs) => {
        const orderStatus = normalizeStatus(order?.status);
        const shipmentStatus = normalizeStatus(
            shipment?.status
        );

        const latestLog = [...(logs || [])].sort(
            (a, b) =>
                new Date(b?.created_at || 0) -
                new Date(a?.created_at || 0)
        )[0];

        const latestLogStatus = normalizeStatus(
            latestLog?.status
        );

        const status =
            latestLogStatus ||
            shipmentStatus ||
            orderStatus;

        if (
            status === "cancelled" ||
            status === "canceled"
        ) {
            return -1;
        }

        if (
            [
                "collected",
                "collected_by_customer",
                "picked_up_by_customer",
            ].includes(status)
        ) {
            return 5;
        }

        if (
            [
                "ready_for_pickup",
                "ready_for_collection",
                "available_for_pickup",
            ].includes(status)
        ) {
            return 4;
        }

        if (
            [
                "at_pickup_station",
                "pickup_station",
                "arrived_at_pickup_station",
            ].includes(status)
        ) {
            return 3;
        }

        if (
            [
                "shipped",
                "in_transit",
                "picked_up",
            ].includes(status)
        ) {
            return 2;
        }

        if (
            ["processing", "successful", "pending"].includes(
                status
            )
        ) {
            return 1;
        }

        return 0;
    };

    const getDeliveryProgress = (
        order,
        shipment,
        logs
    ) => {
        const orderStatus = normalizeStatus(order?.status);
        const shipmentStatus = normalizeStatus(
            shipment?.status
        );

        const latestLog = [...(logs || [])].sort(
            (a, b) =>
                new Date(b?.created_at || 0) -
                new Date(a?.created_at || 0)
        )[0];

        const status =
            normalizeStatus(latestLog?.status) ||
            shipmentStatus ||
            orderStatus;

        if (
            status === "cancelled" ||
            status === "canceled"
        ) {
            return -1;
        }

        if (status === "delivered") return 4;

        if (
            status === "out_for_delivery" ||
            status === "out_for_delivery"
        ) {
            return 3;
        }

        if (
            ["shipped", "in_transit", "picked_up"].includes(
                status
            )
        ) {
            return 2;
        }

        if (
            ["processing", "successful", "pending"].includes(
                status
            )
        ) {
            return 1;
        }

        return 0;
    };

    const getProgress = (
        order,
        shipment,
        trackingLogs
    ) => {
        return isPickupOrder(order)
            ? getPickupProgress(
                  order,
                  shipment,
                  trackingLogs
              )
            : getDeliveryProgress(
                  order,
                  shipment,
                  trackingLogs
              );
    };

    const getProgressSteps = (order) => {
        if (isPickupOrder(order)) {
            return [
                {
                    title: "Order placed",
                    description:
                        "Your order has been received.",
                },
                {
                    title: "Preparing your order",
                    description:
                        "Your items are being prepared.",
                },
                {
                    title: "Order shipped",
                    description:
                        "Your order has left our facility.",
                },
                {
                    title: "At pickup station",
                    description:
                        "Your order has arrived at the pickup station.",
                },
                {
                    title: "Ready for pickup",
                    description:
                        "Your order is ready for collection.",
                },
                {
                    title: "Collected",
                    description:
                        "You have collected your order.",
                },
            ];
        }

        return [
            {
                title: "Order placed",
                description:
                    "Your order has been received.",
            },
            {
                title: "Preparing your order",
                description:
                    "Your items are being prepared.",
            },
            {
                title: "Order shipped",
                description:
                    "Your package is on its way.",
            },
            {
                title: "Out for delivery",
                description:
                    "Your package is on its way to you.",
            },
            {
                title: "Order delivered",
                description:
                    "Your package has been delivered.",
            },
        ];
    };

    const getProductImage = (product) =>
        product?.image || "/placeholder.png";

    const getVariationText = (variation) => {
        if (!variation) return null;

        const values = [];

        if (variation.size)
            values.push(`Size: ${variation.size}`);

        if (variation.color)
            values.push(`Color: ${variation.color}`);

        if (
            variation.name &&
            !values.includes(variation.name)
        ) {
            values.push(variation.name);
        }

        return values.length ? values.join(" • ") : null;
    };

    const getCouponCode = (order) =>
        order?.coupon_code ||
        order?.coupon?.code ||
        order?.coupon?.name ||
        "";

    const getCouponDiscount = (order) =>
        Number(order?.coupon_discount || 0);

    const detailOrder = orderDetail?.order;
    const shipment = orderDetail?.shipment;
    const trackingLogs =
        orderDetail?.tracking_logs || [];
    const statusHistory =
        orderDetail?.status_history || [];

    const orderItems =
        detailOrder?.items ||
        orderDetail?.order_items ||
        [];

    const shippingAddress =
        detailOrder?.shipping_address;

    const pickupStation =
        detailOrder?.pickup_station;

    const stateName =
        typeof shippingAddress?.state === "object"
            ? shippingAddress.state?.name
            : shippingAddress?.state;

    const countryName =
        typeof shippingAddress?.country === "object"
            ? shippingAddress.country?.name
            : shippingAddress?.country;

    return (
        <>
            <section className="w-full min-h-screen pt-22 px-9 lg:px-15 pb-10 max-[740px]:px-5 max-[740px]:pt-30">
                <div className="flex gap-6">
                    <Dashboard
                        custom="order"
                        display="hidden"
                    />

                    <div className="w-[70%] max-[850px]:w-full">
                        <div className="mb-6">
                            <h1 className="text-[25px] font-bold">
                                My Orders
                            </h1>

                            <p className="text-gray-500 text-[14px] mt-1">
                                View and manage your recent orders.
                            </p>
                        </div>

                        {loading ? (
                            <div className="w-full h-60 flex justify-center items-center">
                                <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
                            </div>
                        ) : orders.length ? (
                            <div className="flex flex-col gap-4">
                                {orders.map((order) => (
                                    <div
                                        key={
                                            order.order_number
                                        }
                                        onClick={() =>
                                            handleOrderDetail(
                                                order.order_number
                                            )
                                        }
                                        className="w-full border border-gray-200 rounded-xl bg-white p-4 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
                                    >
                                        <div className="flex justify-between items-start gap-3 max-[600px]:flex-col">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex justify-center items-center">
                                                    <FiPackage className="text-gray-700" />
                                                </div>

                                                <div>
                                                    <p className="text-[12px] text-gray-500">
                                                        Order number
                                                    </p>

                                                    <h3 className="font-semibold text-[14px] break-all">
                                                        {
                                                            order.order_number
                                                        }
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <span
                                                    className={`px-3 py-1.5 rounded-full border text-[12px] font-medium ${getPaymentStatusClass(
                                                        order
                                                    )}`}
                                                >
                                                    {getPaymentStatus(
                                                        order
                                                    )}
                                                </span>

                                                <span
                                                    className={`px-3 py-1.5 rounded-full border text-[12px] font-medium ${getOrderStatusClass(
                                                        order.status
                                                    )}`}
                                                >
                                                    {getOrderStatusText(
                                                        order.status
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 mt-4 pt-4 grid grid-cols-4 gap-3 max-[700px]:grid-cols-2">
                                            <div>
                                                <p className="text-[12px] text-gray-400">
                                                    Date
                                                </p>

                                                <p className="text-[14px] font-medium mt-1">
                                                    {formatDate(
                                                        order?.payment
                                                            ?.paid_at ||
                                                            order?.created_at
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[12px] text-gray-400">
                                                    Total
                                                </p>

                                                <p className="text-[14px] font-semibold mt-1">
                                                    {formatPrice(
                                                        order.total_price
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[12px] text-gray-400">
                                                    Items
                                                </p>

                                                <p className="text-[14px] font-medium mt-1">
                                                    {order?.items
                                                        ?.length || 0}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[12px] text-gray-400">
                                                    Method
                                                </p>

                                                <p className="text-[14px] font-medium mt-1">
                                                    {isPickupOrder(
                                                        order
                                                    )
                                                        ? "Pickup"
                                                        : "Delivery"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                {isPickupOrder(
                                                    order
                                                ) ? (
                                                    <MdStore className="text-gray-500" />
                                                ) : (
                                                    <MdLocalShipping className="text-gray-500" />
                                                )}

                                                <p className="text-[13px] text-gray-500">
                                                    {isPickupOrder(
                                                        order
                                                    )
                                                        ? "Pickup station order"
                                                        : "Home delivery order"}
                                                </p>
                                            </div>

                                            <FiChevronRight className="text-gray-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="w-full border border-gray-200 rounded-xl p-10 flex flex-col justify-center items-center">
                                <div className="w-14 h-14 rounded-full bg-gray-100 flex justify-center items-center mb-3">
                                    <FiPackage className="text-[25px] text-gray-500" />
                                </div>

                                <h3 className="font-semibold text-[17px]">
                                    No orders yet
                                </h3>

                                <p className="text-gray-500 text-[13px] mt-1">
                                    Your orders will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div
                className={`w-full h-screen ${
                    showDetail ? "fixed" : "hidden"
                } inset-0 z-[700] bg-black/40 backdrop-blur-[2px]`}
            >
                <div className="w-full h-full flex justify-center items-center p-4 max-[600px]:p-0">
                    <div
                        ref={orderDetailRef}
                        className="relative w-[760px] max-w-full h-[90vh] bg-white rounded-2xl overflow-hidden flex flex-col max-[600px]:h-full max-[600px]:rounded-none"
                    >
                        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center max-[600px]:px-4">
                            <div>
                                <p className="text-[12px] text-gray-400">
                                    ORDER DETAILS
                                </p>

                                <h2 className="font-bold text-[18px] mt-0.5 break-all">
                                    {detailOrder?.order_number ||
                                        "Order"}
                                </h2>
                            </div>

                            <button
                                onClick={closeDetails}
                                className="w-9 h-9 rounded-full bg-gray-100 flex justify-center items-center hover:bg-gray-200 cursor-pointer"
                            >
                                <IoMdClose className="text-[20px]" />
                            </button>
                        </div>

                        {loadingDetails ? (
                            <div className="flex-1 flex justify-center items-center">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
                            </div>
                        ) : !detailOrder ? (
                            <div className="flex-1 flex flex-col justify-center items-center">
                                <FiPackage className="text-[40px] text-gray-300" />

                                <p className="text-gray-500 mt-3">
                                    Unable to load this order.
                                </p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto px-6 py-5 max-[600px]:px-4">
                                <div className="flex justify-between items-start mb-6 gap-3 max-[550px]:flex-col">
                                    <div>
                                        <p className="text-[13px] text-gray-500">
                                            Placed on{" "}
                                            {formatDate(
                                                detailOrder.created_at
                                            )}
                                        </p>

                                        <h3 className="text-[20px] font-bold mt-1">
                                            Order #
                                            {
                                                detailOrder.order_number
                                            }
                                        </h3>
                                    </div>

                                    <div className="flex gap-2">
                                        <span
                                            className={`px-3 py-1.5 rounded-full border text-[12px] font-medium ${getPaymentStatusClass(
                                                detailOrder
                                            )}`}
                                        >
                                            {getPaymentStatus(
                                                detailOrder
                                            )}
                                        </span>

                                        <span
                                            className={`px-3 py-1.5 rounded-full border text-[12px] font-medium ${getOrderStatusClass(
                                                detailOrder.status
                                            )}`}
                                        >
                                            {getOrderStatusText(
                                                detailOrder.status
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {["cancelled", "canceled"].includes(
                                    normalizeStatus(
                                        detailOrder.status
                                    )
                                ) && (
                                    <div className="border border-red-100 bg-red-50 rounded-xl p-4 mb-5">
                                        <p className="text-[13px] font-semibold text-red-700">
                                            This order has been cancelled.
                                        </p>

                                        <p className="text-[12px] text-red-600 mt-1">
                                            Please contact support if you
                                            have any questions.
                                        </p>
                                    </div>
                                )}

                                <div className="border border-gray-200 rounded-xl p-5 mb-5">
                                    <div className="flex items-center gap-2 mb-1">
                                        {isPickupOrder(
                                            detailOrder
                                        ) ? (
                                            <MdStore className="text-[21px]" />
                                        ) : (
                                            <MdLocalShipping className="text-[21px]" />
                                        )}

                                        <h3 className="font-semibold text-[17px]">
                                            Order progress
                                        </h3>
                                    </div>

                                    <p className="text-[13px] text-gray-500 mb-6">
                                        {isPickupOrder(
                                            detailOrder
                                        )
                                            ? "Track your order until it is collected."
                                            : "Follow the progress of your delivery."}
                                    </p>

                                    {["cancelled", "canceled"].includes(
                                        normalizeStatus(
                                            detailOrder.status
                                        )
                                    ) ? (
                                        <div className="border border-red-100 bg-red-50 rounded-lg p-4">
                                            <p className="text-[13px] text-red-700">
                                                Tracking is unavailable for
                                                cancelled orders.
                                            </p>
                                        </div>
                                    ) : (
                                        (() => {
                                            const steps =
                                                getProgressSteps(
                                                    detailOrder
                                                );

                                            const currentProgress =
                                                getProgress(
                                                    detailOrder,
                                                    shipment,
                                                    trackingLogs
                                                );

                                            return (
                                                <div className="relative">
                                                    {steps.map(
                                                        (
                                                            step,
                                                            index
                                                        ) => {
                                                            const completed =
                                                                currentProgress >=
                                                                    0 &&
                                                                index <=
                                                                    currentProgress;

                                                            return (
                                                                <div
                                                                    key={
                                                                        step.title
                                                                    }
                                                                    className="relative flex gap-4 pb-7 last:pb-0"
                                                                >
                                                                    {index <
                                                                        steps.length -
                                                                            1 && (
                                                                        <div
                                                                            className={`absolute left-[11px] top-[24px] w-[2px] h-[calc(100%-10px)] ${
                                                                                index <
                                                                                currentProgress
                                                                                    ? "bg-black"
                                                                                    : "bg-gray-200"
                                                                            }`}
                                                                        />
                                                                    )}

                                                                    <div
                                                                        className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center border shrink-0 ${
                                                                            completed
                                                                                ? "bg-black border-black text-white"
                                                                                : "border-gray-200 bg-white"
                                                                        }`}
                                                                    >
                                                                        {completed ? (
                                                                            <MdCheck className="text-[15px]" />
                                                                        ) : (
                                                                            <span className="w-2 h-2 rounded-full bg-gray-300" />
                                                                        )}
                                                                    </div>

                                                                    <div>
                                                                        <p
                                                                            className={`text-[14px] font-semibold ${
                                                                                completed
                                                                                    ? "text-gray-900"
                                                                                    : "text-gray-400"
                                                                            }`}
                                                                        >
                                                                            {
                                                                                step.title
                                                                            }
                                                                        </p>

                                                                        <p
                                                                            className={`text-[12px] mt-1 ${
                                                                                completed
                                                                                    ? "text-gray-500"
                                                                                    : "text-gray-300"
                                                                            }`}
                                                                        >
                                                                            {
                                                                                step.description
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            );
                                        })()
                                    )}
                                </div>

                                {shipment && (
                                    <div className="border border-gray-200 rounded-xl p-5 mb-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex justify-center items-center">
                                                <FiTruck />
                                            </div>

                                            <h3 className="font-semibold text-[16px]">
                                                Shipment
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
                                            <div>
                                                <p className="text-[12px] text-gray-400">
                                                    Tracking number
                                                </p>

                                                <p className="text-[14px] font-semibold mt-1 break-all">
                                                    {shipment.tracking_number ||
                                                        "N/A"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[12px] text-gray-400">
                                                    Courier
                                                </p>

                                                <p className="text-[14px] font-medium mt-1">
                                                    {shipment.courier_name ||
                                                        "N/A"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[12px] text-gray-400">
                                                    Shipment status
                                                </p>

                                                <p className="text-[14px] font-medium mt-1 capitalize">
                                                    {String(
                                                        shipment.status ||
                                                            "N/A"
                                                    ).replace(
                                                        /_/g,
                                                        " "
                                                    )}
                                                </p>
                                            </div>

                                            {shipment.shipped_at && (
                                                <div>
                                                    <p className="text-[12px] text-gray-400">
                                                        Shipped on
                                                    </p>

                                                    <p className="text-[14px] font-medium mt-1">
                                                        {formatDate(
                                                            shipment.shipped_at
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                            {shipment.delivered_at && (
                                                <div>
                                                    <p className="text-[12px] text-gray-400">
                                                        Delivered on
                                                    </p>

                                                    <p className="text-[14px] font-medium mt-1">
                                                        {formatDate(
                                                            shipment.delivered_at
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="border border-gray-200 rounded-xl p-5 mb-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex justify-center items-center">
                                            <FiShoppingBag />
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-[17px]">
                                                Your items
                                            </h3>

                                            <p className="text-[12px] text-gray-500 mt-1">
                                                {orderItems.length} item
                                                {orderItems.length !==
                                                1
                                                    ? "s"
                                                    : ""}{" "}
                                                in this order
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        {orderItems.map(
                                            (orderItem) => {
                                                const itemTotal =
                                                    Number(
                                                        orderItem.price ||
                                                            0
                                                    ) *
                                                    Number(
                                                        orderItem.quantity ||
                                                            0
                                                    );

                                                const variationText =
                                                    getVariationText(
                                                        orderItem.variation
                                                    );

                                                return (
                                                    <div
                                                        key={
                                                            orderItem.id
                                                        }
                                                        className="flex gap-3 py-4 border-t border-gray-100 first:border-t-0"
                                                    >
                                                        <div className="w-[72px] h-[72px] rounded-lg bg-gray-50 shrink-0 overflow-hidden">
                                                            <Image
                                                                src={getProductImage(
                                                                    orderItem.product
                                                                )}
                                                                width={100}
                                                                height={100}
                                                                alt={
                                                                    orderItem
                                                                        ?.product
                                                                        ?.name ||
                                                                    "Product"
                                                                }
                                                                className="w-full h-full object-contain"
                                                                unoptimized
                                                            />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-[14px] line-clamp-2">
                                                                {orderItem
                                                                    ?.product
                                                                    ?.name ||
                                                                    "Product"}
                                                            </h4>

                                                            {variationText && (
                                                                <p className="text-[12px] text-gray-500 mt-1">
                                                                    {
                                                                        variationText
                                                                    }
                                                                </p>
                                                            )}

                                                            <p className="text-[12px] text-gray-500 mt-1">
                                                                Quantity:{" "}
                                                                {
                                                                    orderItem.quantity
                                                                }
                                                            </p>

                                                            {Number(
                                                                orderItem.discount ||
                                                                    0
                                                            ) > 0 && (
                                                                <p className="text-[12px] text-green-600 mt-1">
                                                                    {
                                                                        orderItem.discount
                                                                    }
                                                                    % discount
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="text-right">
                                                            <p className="font-semibold text-[14px] whitespace-nowrap">
                                                                {formatPrice(
                                                                    itemTotal
                                                                )}
                                                            </p>

                                                            <p className="text-[11px] text-gray-400 mt-1">
                                                                {formatPrice(
                                                                    orderItem.price
                                                                )}{" "}
                                                                each
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>

                                {isPickupOrder(
                                    detailOrder
                                ) ? (
                                    <div className="border border-gray-200 rounded-xl p-5 mb-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex justify-center items-center">
                                                <MdStore />
                                            </div>

                                            <h3 className="font-semibold text-[16px]">
                                                Pickup station
                                            </h3>
                                        </div>

                                        {pickupStation ? (
                                            <div className="text-[13px] text-gray-600 leading-6">
                                                <p className="font-semibold text-gray-900">
                                                    {
                                                        pickupStation.name
                                                    }
                                                </p>

                                                <div className="flex items-start gap-2 mt-1">
                                                    <MdLocationOn className="mt-1 shrink-0" />

                                                    <p>
                                                        {
                                                            pickupStation.address
                                                        }
                                                        <br />
                                                        {
                                                            pickupStation.city
                                                        }
                                                        {pickupStation
                                                            ?.state
                                                            ?.name &&
                                                            `, ${pickupStation.state.name}`}
                                                    </p>
                                                </div>

                                                {pickupStation.phone_number && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <FiPhone />

                                                        <p>
                                                            {
                                                                pickupStation.phone_number
                                                            }
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 mt-2">
                                                    <FiClock />

                                                    <p>
                                                        Open{" "}
                                                        {
                                                            pickupStation.opening_time
                                                        }{" "}
                                                        -{" "}
                                                        {
                                                            pickupStation.closing_time
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-[13px] text-gray-500">
                                                Pickup station information is
                                                unavailable.
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="border border-gray-200 rounded-xl p-5 mb-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex justify-center items-center">
                                                <FiMapPin />
                                            </div>

                                            <h3 className="font-semibold text-[16px]">
                                                Delivery address
                                            </h3>
                                        </div>

                                        {shippingAddress ? (
                                            <div className="text-[13px] text-gray-600 leading-6">
                                                <p className="font-semibold text-gray-900">
                                                    {
                                                        shippingAddress.first_name
                                                    }{" "}
                                                    {
                                                        shippingAddress.last_name
                                                    }
                                                </p>

                                                <p>
                                                    {
                                                        shippingAddress.address_line_1
                                                    }
                                                </p>

                                                <p>
                                                    {
                                                        shippingAddress.city
                                                    }
                                                    {stateName &&
                                                        `, ${stateName}`}
                                                </p>

                                                {countryName && (
                                                    <p>
                                                        {countryName}
                                                    </p>
                                                )}

                                                {shippingAddress.phone1 && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <FiPhone />

                                                        <p>
                                                            {
                                                                shippingAddress.phone1
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-[13px] text-gray-500">
                                                Delivery address is unavailable.
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="border border-gray-200 rounded-xl p-5 mb-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex justify-center items-center">
                                            <FiCreditCard />
                                        </div>

                                        <h3 className="font-semibold text-[16px]">
                                            Payment
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
                                        <div>
                                            <p className="text-[12px] text-gray-400">
                                                Payment status
                                            </p>

                                            <p
                                                className={`text-[14px] font-semibold mt-1 ${
                                                    getPaymentStatus(
                                                        detailOrder
                                                    ) === "Paid"
                                                        ? "text-green-600"
                                                        : "text-yellow-600"
                                                }`}
                                            >
                                                {getPaymentStatus(
                                                    detailOrder
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[12px] text-gray-400">
                                                Payment method
                                            </p>

                                            <p className="text-[14px] font-medium mt-1 capitalize">
                                                {detailOrder?.payment
                                                    ?.payment_method ||
                                                    "N/A"}
                                            </p>
                                        </div>

                                        {detailOrder?.payment
                                            ?.gateway && (
                                            <div>
                                                <p className="text-[12px] text-gray-400">
                                                    Gateway
                                                </p>

                                                <p className="text-[14px] font-medium mt-1">
                                                    {
                                                        detailOrder
                                                            .payment
                                                            .gateway
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        {detailOrder?.payment
                                            ?.paid_at && (
                                            <div>
                                                <p className="text-[12px] text-gray-400">
                                                    Paid on
                                                </p>

                                                <p className="text-[14px] font-medium mt-1">
                                                    {formatDateTime(
                                                        detailOrder
                                                            .payment
                                                            .paid_at
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="border border-gray-200 rounded-xl p-5 mb-5">
                                    <h3 className="font-semibold text-[17px] mb-4">
                                        Order summary
                                    </h3>

                                    <div className="flex justify-between py-2 text-[14px]">
                                        <span className="text-gray-500">
                                            Subtotal
                                        </span>

                                        <span className="font-medium">
                                            {formatPrice(
                                                detailOrder.sub_total
                                            )}
                                        </span>
                                    </div>

                                    {(getCouponCode(
                                        detailOrder
                                    ) ||
                                        getCouponDiscount(
                                            detailOrder
                                        ) > 0) && (
                                        <div className="flex justify-between items-start gap-4 py-2 text-[14px]">
                                            <div className="flex items-start gap-2">
                                                <FiTag className="text-green-600 mt-0.5 shrink-0" />

                                                <div>
                                                    <span className="text-gray-500 block">
                                                        Coupon
                                                    </span>

                                                    {getCouponCode(
                                                        detailOrder
                                                    ) && (
                                                        <span className="text-[11px] text-green-600 font-medium">
                                                            {getCouponCode(
                                                                detailOrder
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <span className="font-medium text-green-600 whitespace-nowrap">
                                                -
                                                {formatPrice(
                                                    getCouponDiscount(
                                                        detailOrder
                                                    )
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between py-2 text-[14px]">
                                        <span className="text-gray-500">
                                            {isPickupOrder(
                                                detailOrder
                                            )
                                                ? "Pickup fee"
                                                : "Delivery fee"}
                                        </span>

                                        <span className="font-medium">
                                            {formatPrice(
                                                detailOrder.shipping_price
                                            )}
                                        </span>
                                    </div>

                                    <div className="border-t border-gray-100 mt-3 pt-4 flex justify-between items-center">
                                        <span className="font-semibold">
                                            Total
                                        </span>

                                        <span className="font-bold text-[19px]">
                                            {formatPrice(
                                                detailOrder.total_price
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {detailOrder.order_note && (
                                    <div className="border border-gray-200 rounded-xl p-5 mb-5">
                                        <h3 className="font-semibold text-[16px] mb-2">
                                            Order note
                                        </h3>

                                        <p className="text-[13px] text-gray-600 leading-6">
                                            {
                                                detailOrder.order_note
                                            }
                                        </p>
                                    </div>
                                )}

                                {trackingLogs.length > 0 && (
                                    <div className="border border-gray-200 rounded-xl p-5 mb-5">
                                        <div className="flex items-center gap-2 mb-5">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex justify-center items-center">
                                                <FiClock />
                                            </div>

                                            <h3 className="font-semibold text-[16px]">
                                                Shipment activity
                                            </h3>
                                        </div>

                                        <div>
                                            {trackingLogs.map(
                                                (log, index) => (
                                                    <div
                                                        key={
                                                            log.id ||
                                                            `tracking-${index}`
                                                        }
                                                        className="relative flex gap-3 pb-5 last:pb-0"
                                                    >
                                                        {index <
                                                            trackingLogs.length -
                                                                1 && (
                                                            <div className="absolute left-[8px] top-5 w-[1px] h-[calc(100%-8px)] bg-gray-200" />
                                                        )}

                                                        <div className="relative z-10 w-[17px] h-[17px] rounded-full bg-black shrink-0 mt-1" />

                                                        <div>
                                                            <p className="text-[13px] font-semibold capitalize">
                                                                {String(
                                                                    log.status ||
                                                                        ""
                                                                ).replace(
                                                                    /_/g,
                                                                    " "
                                                                )}
                                                            </p>

                                                            {log.note && (
                                                                <p className="text-[12px] text-gray-500 mt-1">
                                                                    {
                                                                        log.note
                                                                    }
                                                                </p>
                                                            )}

                                                            <p className="text-[11px] text-gray-400 mt-1">
                                                                {formatDateTime(
                                                                    log.created_at
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {statusHistory.length > 0 && (
                                    <div className="border border-gray-200 rounded-xl p-5 mb-5">
                                        <h3 className="font-semibold text-[16px] mb-4">
                                            Order history
                                        </h3>

                                        <div className="flex flex-col gap-4">
                                            {statusHistory.map(
                                                (history, index) => (
                                                    <div
                                                        key={
                                                            history.id ||
                                                            `history-${index}`
                                                        }
                                                        className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                                                    >
                                                        <div className="flex justify-between gap-3">
                                                            <p className="text-[13px] font-medium">
                                                                {getOrderStatusText(
                                                                    history.new_status
                                                                )}
                                                            </p>

                                                            <p className="text-[11px] text-gray-400 whitespace-nowrap">
                                                                {formatDateTime(
                                                                    history.created_at
                                                                )}
                                                            </p>
                                                        </div>

                                                        <p className="text-[12px] text-gray-500 mt-1">
                                                            Status changed
                                                            from{" "}
                                                            <span className="font-medium">
                                                                {
                                                                    history.old_status
                                                                }
                                                            </span>{" "}
                                                            to{" "}
                                                            <span className="font-medium">
                                                                {
                                                                    history.new_status
                                                                }
                                                            </span>
                                                        </p>

                                                        {history.note && (
                                                            <p className="text-[12px] text-gray-500 mt-1">
                                                                {
                                                                    history.note
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {!loadingDetails && detailOrder && (
                            <div className="border-t border-gray-100 bg-white px-6 py-3 flex justify-end gap-2 max-[600px]:px-4">
                                <button
                                    type="button"
                                    className="px-4 py-2.5 rounded-lg bg-gray-100 text-[13px] font-medium hover:bg-gray-200 cursor-pointer"
                                >
                                    Save as Image
                                </button>

                                <button
                                    type="button"
                                    className="px-4 py-2.5 rounded-lg bg-black text-white text-[13px] font-medium hover:bg-gray-800 cursor-pointer"
                                >
                                    Save as PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Page;