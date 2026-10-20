"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {FiArrowLeft,FiCalendar,FiCheck,FiChevronRight,FiClock,FiMapPin,FiPackage,FiPhone,FiRefreshCw,FiTruck,FiUser,FiX,} from "react-icons/fi";
import adminApi from "../../../api/adminApi";

const HOME_DELIVERY_STATUSES = [
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
];

const PICKUP_STATUSES = [
    "Processing",
    "Shipped",
    "At_Pickup_Station",
    "Ready_for_Pickup",
    "Collected",
    "Cancelled",
];

const HOME_DELIVERY_STEPS = [
    "Processing",
    "Shipped",
    "Delivered",
];

const PICKUP_STEPS = [
    "Processing",
    "Shipped",
    "At_Pickup_Station",
    "Ready_for_Pickup",
    "Collected",
];

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

const formatMoney = (amount, currency = "NGN") => {
    if (amount === null || amount === undefined) {
        return "—";
    }

    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(Number(amount));
};

const getAdminName = (admin) => {
    if (!admin) return "Admin";

    const fullName = [admin.first_name, admin.last_name]
        .filter(Boolean)
        .join(" ");

    return (
        fullName ||
        admin.username ||
        admin.email ||
        "Admin"
    );
};

const getStatusLabel = (status) => {
    const labels = {
        Successful: "Successful",
        Processing: "Processing",
        Shipped: "Shipped",
        Delivered: "Delivered",
        Cancelled: "Cancelled",
        At_Pickup_Station: "At Pickup Station",
        Ready_for_Pickup: "Ready for Pickup",
        Collected: "Collected",
        in_transit: "In Transit",
        Picked_up: "Picked Up",
        Out_for_Delivery: "Out for Delivery",
    };

    return labels[status] || status || "Unknown";
};

const getStatusClass = (status) => {
    const classes = {
        Successful:
            "bg-green-50 text-green-700 border-green-200",

        Processing:
            "bg-amber-50 text-amber-700 border-amber-200",

        Shipped:
            "bg-blue-50 text-blue-700 border-blue-200",

        Delivered:
            "bg-green-50 text-green-700 border-green-200",

        Cancelled:
            "bg-red-50 text-red-700 border-red-200",

        At_Pickup_Station:
            "bg-purple-50 text-purple-700 border-purple-200",

        Ready_for_Pickup:
            "bg-indigo-50 text-indigo-700 border-indigo-200",

        Collected:
            "bg-green-50 text-green-700 border-green-200",

        in_transit:
            "bg-blue-50 text-blue-700 border-blue-200",

        Picked_up:
            "bg-blue-50 text-blue-700 border-blue-200",

        Out_for_Delivery:
            "bg-blue-50 text-blue-700 border-blue-200",
    };

    return (
        classes[status] ||
        "bg-gray-50 text-gray-700 border-gray-200"
    );
};

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                status
            )}`}
        >
            {getStatusLabel(status)}
        </span>
    );
}

function Section({ title, icon: Icon, children, right }) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div className="flex items-center gap-2">
                    {Icon && (
                        <Icon className="h-4 w-4 text-gray-500" />
                    )}

                    <h2 className="text-sm font-semibold text-gray-900">
                        {title}
                    </h2>
                </div>

                {right}
            </div>

            <div className="p-5">{children}</div>
        </section>
    );
}

function ProgressStep({
    label,
    active,
    completed,
    last,
}) {
    return (
        <div className="flex min-w-0 flex-1 items-start">
            <div className="flex flex-col items-center">
                <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
                        completed || active
                            ? "border-black bg-black text-white"
                            : "border-gray-200 bg-white text-gray-400"
                    }`}
                >
                    {completed ? (
                        <FiCheck className="h-4 w-4" />
                    ) : (
                        <span className="h-2 w-2 rounded-full bg-current" />
                    )}
                </div>

                <span
                    className={`mt-2 max-w-[100px] text-center text-[11px] font-medium ${
                        active || completed
                            ? "text-gray-900"
                            : "text-gray-400"
                    }`}
                >
                    {getStatusLabel(label)}
                </span>
            </div>

            {!last && (
                <div
                    className={`mt-4 h-[2px] min-w-5 flex-1 ${
                        completed
                            ? "bg-black"
                            : "bg-gray-200"
                    }`}
                />
            )}
        </div>
    );
}

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const orderId = useMemo(() => {
        return (
            params?.orderId ||
            params?.id ||
            params?.orderid ||
            ""
        );
    }, [params]);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [showStatusModal, setShowStatusModal] =
        useState(false);

    const [showShipmentModal, setShowShipmentModal] =
        useState(false);

    const [selectedStatus, setSelectedStatus] =
        useState("");

    const [statusNote, setStatusNote] =
        useState("");

    const [courierName, setCourierName] =
        useState("");

    const [saving, setSaving] = useState(false);
    const [creatingShipment, setCreatingShipment] =
        useState(false);

    const order = data?.order;
    const orderItems = data?.order_items || [];
    const shipment = data?.shipment;
    const trackingLogs = data?.tracking_logs || [];
    const statusHistory = data?.status_history || [];

    const isPickup =
        order?.delivery_method?.toLowerCase() === "pickup";

    /*
     * Determine the visible progress status.
     *
     * IMPORTANT:
     * The Order.status is the high-level order status.
     * Shipment.status contains the detailed delivery status.
     *
     * HOME DELIVERY:
     *
     * Successful
     *      ↓
     * Processing
     *      ↓
     * Shipped / in_transit / Out_for_Delivery
     *      ↓
     * Delivered
     *
     * PICKUP:
     *
     * Successful
     *      ↓
     * Processing
     *      ↓
     * Shipped / in_transit
     *      ↓
     * At_Pickup_Station
     *      ↓
     * Ready_for_Pickup
     *      ↓
     * Collected
     */
    const currentStatus = useMemo(() => {
        if (!order) return "";

        const shipmentStatus = shipment?.status;

        /*
         * HOME DELIVERY
         */
        if (!isPickup) {
            if (order.status === "Delivered") {
                return "Delivered";
            }

            if (shipmentStatus === "Delivered") {
                return "Delivered";
            }

            if (
                order.status === "Shipped" ||
                shipmentStatus === "in_transit" ||
                shipmentStatus === "Out_for_Delivery" ||
                shipmentStatus === "Picked_up"
            ) {
                return "Shipped";
            }

            if (
                order.status === "Processing" ||
                shipmentStatus === "Processing"
            ) {
                return "Processing";
            }

            if (order.status === "Successful") {
                return "Processing";
            }

            return order.status;
        }

        /*
         * PICKUP
         */
        if (shipmentStatus === "Collected") {
            return "Collected";
        }

        if (shipmentStatus === "Ready_for_Pickup") {
            return "Ready_for_Pickup";
        }

        if (shipmentStatus === "At_Pickup_Station") {
            return "At_Pickup_Station";
        }

        if (
            order.status === "Shipped" ||
            shipmentStatus === "in_transit"
        ) {
            return "Shipped";
        }

        if (
            order.status === "Processing" ||
            shipmentStatus === "Processing"
        ) {
            return "Processing";
        }

        if (order.status === "Successful") {
            return "Processing";
        }

        return order.status;
    }, [order, shipment, isPickup]);

    const progressSteps = isPickup
        ? PICKUP_STEPS
        : HOME_DELIVERY_STEPS;

    const currentProgressIndex =
        progressSteps.indexOf(currentStatus);

    /*
     * IMPORTANT FIX:
     *
     * The current/final step must also be considered completed.
     *
     * Previously:
     *
     * index < currentProgressIndex
     *
     * meant that when Delivered/Collected was the current step,
     * the final circle was only "active", not "completed".
     *
     * Now:
     *
     * index <= currentProgressIndex
     *
     * makes the current step show the check icon too.
     */
    const availableStatuses = isPickup
        ? PICKUP_STATUSES
        : HOME_DELIVERY_STATUSES;

    const loadOrder = async (isRefresh = false) => {
        if (!orderId) {
            setLoading(false);
            setError("Order ID is missing from the URL.");
            return;
        }

        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await adminApi.get(
                `orderdetails/?orderid=${encodeURIComponent(
                    orderId
                )}`
            );

            setData(response.data);
        } catch (err) {
            console.error(
                "Order details error:",
                err
            );

            setError(
                err?.response?.data?.error ||
                    "Unable to load order details."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const getNextStatus = () => {
        if (!order) return "";

        if (isPickup) {
            if (order.status === "Successful") {
                return "Processing";
            }

            if (
                order.status === "Processing" &&
                shipment
            ) {
                return "Shipped";
            }

            if (
                order.status === "Shipped" &&
                shipment?.status === "in_transit"
            ) {
                return "At_Pickup_Station";
            }

            if (
                shipment?.status ===
                "At_Pickup_Station"
            ) {
                return "Ready_for_Pickup";
            }

            if (
                shipment?.status ===
                "Ready_for_Pickup"
            ) {
                return "Collected";
            }

            return "";
        }

        if (order.status === "Successful") {
            return "Processing";
        }

        if (
            order.status === "Processing" &&
            shipment
        ) {
            return "Shipped";
        }

        if (
            order.status === "Shipped" &&
            shipment?.status === "in_transit"
        ) {
            return "Delivered";
        }

        if (
            order.status === "Shipped" &&
            shipment?.status === "Out_for_Delivery"
        ) {
            return "Delivered";
        }

        return "";
    };

    const openStatusModal = () => {
        setSelectedStatus(getNextStatus());
        setStatusNote("");
        setShowStatusModal(true);
    };

    const closeStatusModal = () => {
        if (saving) return;

        setShowStatusModal(false);
        setSelectedStatus("");
        setStatusNote("");
    };

    const createShipment = async () => {
        if (
            !courierName.trim() ||
            creatingShipment
        ) {
            return;
        }

        try {
            setCreatingShipment(true);
            setError("");

            await adminApi.post(
                "orders/shipment/create/",
                {
                    orderid: order.order_number,
                    courier_name: courierName.trim(),
                }
            );

            setShowShipmentModal(false);
            setCourierName("");

            await loadOrder(true);
        } catch (err) {
            console.error(
                "Create shipment error:",
                err
            );

            setError(
                err?.response?.data?.error ||
                    "Unable to create shipment."
            );
        } finally {
            setCreatingShipment(false);
        }
    };

    const updateStatus = async () => {
        if (!selectedStatus || saving) {
            return;
        }

        try {
            setSaving(true);
            setError("");

            await adminApi.post(
                "orders/status/update/",
                {
                    orderid: order.order_number,
                    status: selectedStatus,
                    note: statusNote.trim(),
                }
            );

            setShowStatusModal(false);
            setSelectedStatus("");
            setStatusNote("");

            await loadOrder(true);
        } catch (err) {
            console.error(
                "Update status error:",
                err
            );

            setError(
                err?.response?.data?.error ||
                    "Unable to update order status."
            );
        } finally {
            setSaving(false);
        }
    };

    const isCompleted = isPickup
        ? shipment?.status === "Collected"
        : order?.status === "Delivered" ||
          shipment?.status === "Delivered";

    const canCreateShipment =
        order?.status === "Successful" &&
        !shipment &&
        !isCompleted;

    const canUpdateStatus =
        order?.status !== "Cancelled" &&
        !isCompleted &&
        !!shipment;

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <FiRefreshCw className="h-4 w-4 animate-spin" />
                    Loading order...
                </div>
            </div>
        );
    }

    if (error && !order) {
        return (
            <div className="p-6">
                <button
                    onClick={() => router.back()}
                    className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
                >
                    <FiArrowLeft />
                    Back
                </button>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                    Order not found.
                </div>
            </div>
        );
    }

    const customer = order.user;
    const payment = order.payment;
    const address = order.shipping_address;
    const pickupStation = order.pickup_station;

    const currency = payment?.currency || "NGN";

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* HEADER */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black"
                    >
                        <FiArrowLeft />
                        Back to orders
                    </button>

                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Order #{order.order_number}
                        </h1>

                        <StatusBadge
                            status={
                                isPickup
                                    ? currentStatus
                                    : order.status
                            }
                        />
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                        Placed{" "}
                        {formatDate(order.created_at)}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => loadOrder(true)}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        <FiRefreshCw
                            className={
                                refreshing
                                    ? "h-4 w-4 animate-spin"
                                    : "h-4 w-4"
                            }
                        />
                        Refresh
                    </button>

                    {canCreateShipment && (
                        <button
                            onClick={() =>
                                setShowShipmentModal(
                                    true
                                )
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            <FiTruck className="h-4 w-4" />
                            Create Shipment
                        </button>
                    )}

                    {canUpdateStatus && (
                        <button
                            onClick={openStatusModal}
                            className="inline-flex items-center gap-2 rounded-xl border border-black bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-50"
                        >
                            <FiRefreshCw className="h-4 w-4" />
                            Update Status
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* ORDER PROGRESS */}
            <Section
                title="Order Progress"
                icon={FiPackage}
                right={
                    <span className="text-xs text-gray-400">
                        {isPickup
                            ? "Pickup Order"
                            : "Home Delivery"}
                    </span>
                }
            >
                <div className="overflow-x-auto pb-2">
                    <div className="flex min-w-[600px] items-start">
                        {progressSteps.map(
                            (step, index) => {
                                /*
                                 * FIX:
                                 *
                                 * <= instead of <
                                 *
                                 * This means the current step,
                                 * including Delivered/Collected,
                                 * receives the check mark.
                                 */
                                const completed =
                                    currentProgressIndex >=
                                        0 &&
                                    index <=
                                        currentProgressIndex;

                                const active =
                                    index ===
                                    currentProgressIndex;

                                return (
                                    <ProgressStep
                                        key={step}
                                        label={step}
                                        completed={
                                            completed
                                        }
                                        active={active}
                                        last={
                                            index ===
                                            progressSteps.length -
                                                1
                                        }
                                    />
                                );
                            }
                        )}
                    </div>
                </div>

                {isPickup && shipment && (
                    <div className="mt-5 rounded-xl bg-gray-50 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs text-gray-500">
                                    Shipment Status
                                </p>

                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                    {getStatusLabel(
                                        shipment.status
                                    )}
                                </p>
                            </div>

                            {shipment.tracking_number && (
                                <div className="sm:text-right">
                                    <p className="text-xs text-gray-500">
                                        Tracking Number
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                        {
                                            shipment.tracking_number
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Section>

            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                    {/* ITEMS */}
                    <Section
                        title="Order Items"
                        icon={FiPackage}
                    >
                        <div className="divide-y divide-gray-100">
                            {orderItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4 py-4 first:pt-0 last:pb-0"
                                >
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                        {item.product?.image ? (
                                            <img
                                                src={
                                                    item
                                                        .product
                                                        .image
                                                }
                                                alt={
                                                    item
                                                        .product
                                                        .name ||
                                                    "Product"
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-gray-400">
                                                <FiPackage />
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                                            <div>
                                                <h3 className="truncate text-sm font-semibold text-gray-900">
                                                    {
                                                        item
                                                            .product
                                                            ?.name
                                                    }
                                                </h3>

                                                {item.variation && (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {
                                                            item
                                                                .variation
                                                                ?.name
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <p className="text-sm font-semibold text-gray-900">
                                                {formatMoney(
                                                    Number(
                                                        item.price
                                                    ) *
                                                        Number(
                                                            item.quantity
                                                        ),
                                                    currency
                                                )}
                                            </p>
                                        </div>

                                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                            <span>
                                                Qty:{" "}
                                                {
                                                    item.quantity
                                                }
                                            </span>

                                            <span>
                                                Unit:{" "}
                                                {formatMoney(
                                                    item.price,
                                                    currency
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* CUSTOMER */}
                    <Section
                        title="Customer"
                        icon={FiUser}
                    >
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                                {customer?.image ? (
                                    <img
                                        src={customer.image}
                                        alt={getAdminName(
                                            customer
                                        )}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <FiUser className="h-6 w-6 text-gray-400" />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900">
                                    {getAdminName(customer)}
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    {customer?.email ||
                                        "No email"}
                                </p>

                                {customer?.phone_number && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        {
                                            customer.phone_number
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    </Section>

                    {/* DELIVERY / PICKUP */}
                    <Section
                        title={
                            isPickup
                                ? "Pickup Information"
                                : "Delivery Information"
                        }
                        icon={
                            isPickup
                                ? FiMapPin
                                : FiTruck
                        }
                    >
                        {isPickup ? (
                            pickupStation ? (
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Pickup Station
                                        </p>

                                        <p className="mt-1 font-semibold text-gray-900">
                                            {
                                                pickupStation.name
                                            }
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Address
                                        </p>

                                        <p className="mt-1 text-sm text-gray-700">
                                            {
                                                pickupStation.address
                                            }
                                        </p>

                                        <p className="text-sm text-gray-700">
                                            {
                                                pickupStation.city
                                            }
                                            {pickupStation
                                                .state
                                                ?.name &&
                                                `, ${pickupStation.state.name}`}
                                        </p>
                                    </div>

                                    {pickupStation.phone_number && (
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <FiPhone className="text-gray-400" />
                                            {
                                                pickupStation.phone_number
                                            }
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    No pickup station information.
                                </p>
                            )
                        ) : address ? (
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Recipient
                                    </p>

                                    <p className="mt-1 font-semibold text-gray-900">
                                        {
                                            address.first_name
                                        }{" "}
                                        {
                                            address.last_name
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Address
                                    </p>

                                    <p className="mt-1 text-sm text-gray-700">
                                        {
                                            address.address_line_1
                                        }
                                    </p>

                                    <p className="text-sm text-gray-700">
                                        {address.city}
                                        {address.state
                                            ?.name &&
                                            `, ${address.state.name}`}
                                    </p>

                                    <p className="text-sm text-gray-700">
                                        {address.country}
                                    </p>
                                </div>

                                {address.phone1 && (
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <FiPhone className="text-gray-400" />
                                        {address.phone1}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                No delivery address.
                            </p>
                        )}
                    </Section>

                    {/* SHIPMENT */}
                    {shipment && (
                        <Section
                            title="Shipment"
                            icon={FiTruck}
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Courier
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                        {
                                            shipment.courier_name
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Tracking Number
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                        {
                                            shipment.tracking_number
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Shipment Status
                                    </p>

                                    <div className="mt-1">
                                        <StatusBadge
                                            status={
                                                shipment.status
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Shipped At
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                        {formatDate(
                                            shipment.shipped_at
                                        )}
                                    </p>
                                </div>

                                {shipment.delivered_at && (
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Delivered At
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                            {formatDate(
                                                shipment.delivered_at
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Section>
                    )}

                    {/* SHIPMENT ACTIVITY */}
                    {trackingLogs.length > 0 && (
                        <Section
                            title="Shipment Activity"
                            icon={FiClock}
                        >
                            <div className="space-y-5">
                                {trackingLogs.map(
                                    (tracking) => (
                                        <div
                                            key={
                                                tracking.id
                                            }
                                            className="flex gap-3"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                                                <FiCheck className="h-4 w-4 text-gray-600" />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {getStatusLabel(
                                                            tracking.status
                                                        )}
                                                    </p>

                                                    <span className="text-xs text-gray-400">
                                                        {formatDate(
                                                            tracking.created_at
                                                        )}
                                                    </span>
                                                </div>

                                                {tracking.note && (
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {
                                                            tracking.note
                                                        }
                                                    </p>
                                                )}

                                                {tracking.admin && (
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        Updated
                                                        by{" "}
                                                        {getAdminName(
                                                            tracking.admin
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </Section>
                    )}

                    {/* ORDER HISTORY */}
                    {statusHistory.length > 0 && (
                        <Section
                            title="Order Status History"
                            icon={FiClock}
                        >
                            <div className="space-y-5">
                                {statusHistory.map(
                                    (history) => (
                                        <div
                                            key={
                                                history.id
                                            }
                                            className="flex gap-3"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                                                <FiRefreshCw className="h-4 w-4 text-gray-600" />
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {getStatusLabel(
                                                        history.old_status
                                                    )}

                                                    <FiChevronRight className="mx-1 inline h-3 w-3" />

                                                    {getStatusLabel(
                                                        history.new_status
                                                    )}
                                                </p>

                                                {history.note && (
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {
                                                            history.note
                                                        }
                                                    </p>
                                                )}

                                                <p className="mt-1 text-xs text-gray-400">
                                                    {getAdminName(
                                                        history.admin
                                                    )}{" "}
                                                    ·{" "}
                                                    {formatDate(
                                                        history.created_at
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </Section>
                    )}
                </div>

                {/* RIGHT SIDE */}
                <div className="space-y-6">
                    {/* SUMMARY */}
                    <Section
                        title="Order Summary"
                        icon={FiPackage}
                    >
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">
                                    Subtotal
                                </span>

                                <span className="font-medium text-gray-900">
                                    {formatMoney(
                                        order.sub_total,
                                        currency
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">
                                    Shipping
                                </span>

                                <span className="font-medium text-gray-900">
                                    {formatMoney(
                                        order.shipping_price,
                                        currency
                                    )}
                                </span>
                            </div>

                            {Number(
                                order.coupon_discount || 0
                            ) > 0 && (
                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">
                                        Discount
                                    </span>

                                    <span className="font-medium text-green-600">
                                        -
                                        {formatMoney(
                                            order.coupon_discount,
                                            currency
                                        )}
                                    </span>
                                </div>
                            )}

                            <div className="border-t border-gray-100 pt-4">
                                <div className="flex justify-between gap-4">
                                    <span className="font-semibold text-gray-900">
                                        Total
                                    </span>

                                    <span className="text-lg font-bold text-gray-900">
                                        {formatMoney(
                                            order.total_price,
                                            currency
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* PAYMENT */}
                    <Section
                        title="Payment"
                        icon={FiCheck}
                    >
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">
                                    Status
                                </span>

                                <StatusBadge
                                    status={
                                        payment?.status
                                    }
                                />
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">
                                    Method
                                </span>

                                <span className="font-medium text-gray-900">
                                    {payment?.payment_method ||
                                        "—"}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">
                                    Gateway
                                </span>

                                <span className="font-medium text-gray-900">
                                    {payment?.gateway ||
                                        "—"}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">
                                    Paid At
                                </span>

                                <span className="text-right font-medium text-gray-900">
                                    {formatDate(
                                        payment?.paid_at
                                    )}
                                </span>
                            </div>
                        </div>
                    </Section>

                    {/* ORDER INFO */}
                    <Section
                        title="Order Information"
                        icon={FiCalendar}
                    >
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-500">
                                    Order Number
                                </p>

                                <p className="mt-1 font-semibold text-gray-900">
                                    #{order.order_number}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Delivery Method
                                </p>

                                <p className="mt-1 font-semibold capitalize text-gray-900">
                                    {
                                        order.delivery_method
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Created
                                </p>

                                <p className="mt-1 font-medium text-gray-900">
                                    {formatDate(
                                        order.created_at
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Last Updated
                                </p>

                                <p className="mt-1 font-medium text-gray-900">
                                    {formatDate(
                                        order.updated_at
                                    )}
                                </p>
                            </div>
                        </div>
                    </Section>

                    {/* ORDER NOTE */}
                    {order.order_note && (
                        <Section
                            title="Order Note"
                            icon={FiClock}
                        >
                            <p className="text-sm leading-6 text-gray-600">
                                {order.order_note}
                            </p>
                        </Section>
                    )}
                </div>
            </div>

            {/* CREATE SHIPMENT MODAL */}
            {showShipmentModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onMouseDown={(e) => {
                        if (
                            e.target ===
                                e.currentTarget &&
                            !creatingShipment
                        ) {
                            setShowShipmentModal(false);
                        }
                    }}
                >
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Create Shipment
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    Order #
                                    {
                                        order.order_number
                                    }
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowShipmentModal(
                                        false
                                    )
                                }
                                disabled={
                                    creatingShipment
                                }
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-50"
                            >
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-5 p-5">
                            <div className="rounded-xl bg-gray-50 p-4">
                                <p className="text-xs text-gray-500">
                                    Current Order Status
                                </p>

                                <div className="mt-2">
                                    <StatusBadge
                                        status={
                                            order.status
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-900">
                                    Courier Name
                                </label>

                                <input
                                    type="text"
                                    value={courierName}
                                    onChange={(e) =>
                                        setCourierName(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="e.g. GIG Logistics"
                                    disabled={
                                        creatingShipment
                                    }
                                    className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none transition focus:border-black disabled:bg-gray-50"
                                />
                            </div>

                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm leading-5 text-blue-700">
                                Creating this shipment will
                                automatically move the order
                                from{" "}
                                <strong>
                                    Successful
                                </strong>{" "}
                                to{" "}
                                <strong>
                                    Processing
                                </strong>{" "}
                                and create an order status
                                history record.
                            </div>

                            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowShipmentModal(
                                            false
                                        )
                                    }
                                    disabled={
                                        creatingShipment
                                    }
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        createShipment
                                    }
                                    disabled={
                                        !courierName.trim() ||
                                        creatingShipment
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {creatingShipment && (
                                        <FiRefreshCw className="h-4 w-4 animate-spin" />
                                    )}

                                    {creatingShipment
                                        ? "Creating..."
                                        : "Create Shipment"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STATUS MODAL */}
            {showStatusModal && (
                <div
                    className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4"
                    onMouseDown={(e) => {
                        if (
                            e.target ===
                                e.currentTarget &&
                            !saving
                        ) {
                            closeStatusModal();
                        }
                    }}
                >
                    <div className="flex min-h-full items-center justify-center">
                        <div className="my-4 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Update Order Status
                                    </h2>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Order #
                                        {
                                            order.order_number
                                        }
                                    </p>
                                </div>

                                <button
                                    onClick={
                                        closeStatusModal
                                    }
                                    disabled={saving}
                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    <FiX className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="min-h-0 overflow-y-auto p-5">
                                <div className="space-y-5">
                                    <div className="rounded-xl bg-gray-50 p-4">
                                        <p className="text-xs text-gray-500">
                                            Current Status
                                        </p>

                                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <StatusBadge
                                                status={
                                                    currentStatus
                                                }
                                            />

                                            {shipment && (
                                                <span className="text-xs text-gray-400">
                                                    Shipment:{" "}
                                                    {getStatusLabel(
                                                        shipment.status
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-900">
                                            New Status
                                        </label>

                                        <div className="space-y-2">
                                            {availableStatuses.map(
                                                (
                                                    status
                                                ) => {
                                                    const isCancelled =
                                                        status ===
                                                        "Cancelled";

                                                    const selected =
                                                        selectedStatus ===
                                                        status;

                                                    let disabled =
                                                        false;

                                                    if (
                                                        isCancelled
                                                    ) {
                                                        disabled =
                                                            order.status ===
                                                            "Cancelled";
                                                    } else if (
                                                        status ===
                                                        "Processing"
                                                    ) {
                                                        disabled =
                                                            order.status !==
                                                            "Successful";
                                                    } else if (
                                                        status ===
                                                        "Shipped"
                                                    ) {
                                                        disabled =
                                                            order.status !==
                                                                "Processing" ||
                                                            !shipment;
                                                    } else if (
                                                        status ===
                                                        "Delivered"
                                                    ) {
                                                        disabled =
                                                            isPickup ||
                                                            order.status !==
                                                                "Shipped" ||
                                                            ![
                                                                "in_transit",
                                                                "Out_for_Delivery",
                                                            ].includes(
                                                                shipment?.status
                                                            );
                                                    } else if (
                                                        status ===
                                                        "At_Pickup_Station"
                                                    ) {
                                                        disabled =
                                                            !isPickup ||
                                                            order.status !==
                                                                "Shipped" ||
                                                            shipment?.status !==
                                                                "in_transit";
                                                    } else if (
                                                        status ===
                                                        "Ready_for_Pickup"
                                                    ) {
                                                        disabled =
                                                            !isPickup ||
                                                            shipment?.status !==
                                                                "At_Pickup_Station";
                                                    } else if (
                                                        status ===
                                                        "Collected"
                                                    ) {
                                                        disabled =
                                                            !isPickup ||
                                                            shipment?.status !==
                                                                "Ready_for_Pickup";
                                                    }

                                                    return (
                                                        <button
                                                            key={
                                                                status
                                                            }
                                                            type="button"
                                                            disabled={
                                                                disabled
                                                            }
                                                            onClick={() =>
                                                                setSelectedStatus(
                                                                    status
                                                                )
                                                            }
                                                            className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                                                                selected
                                                                    ? "border-black bg-gray-50"
                                                                    : disabled
                                                                    ? "cursor-not-allowed border-gray-100 bg-gray-50 opacity-50"
                                                                    : isCancelled
                                                                    ? "border-red-100 hover:border-red-300 hover:bg-red-50"
                                                                    : "border-gray-200 hover:border-gray-400"
                                                            }`}
                                                        >
                                                            <span
                                                                className={`text-sm font-semibold ${
                                                                    isCancelled
                                                                        ? "text-red-600"
                                                                        : "text-gray-900"
                                                                }`}
                                                            >
                                                                {getStatusLabel(
                                                                    status
                                                                )}
                                                            </span>

                                                            {selected && (
                                                                <FiCheck className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-900">
                                            Note{" "}
                                            <span className="font-normal text-gray-400">
                                                (optional)
                                            </span>
                                        </label>

                                        <textarea
                                            value={
                                                statusNote
                                            }
                                            onChange={(e) =>
                                                setStatusNote(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            rows={3}
                                            placeholder="Add a note about this status update..."
                                            className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black"
                                        />
                                    </div>

                                    {selectedStatus ===
                                        "Cancelled" && (
                                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700">
                                            Cancelling an
                                            order is
                                            permanent. Make
                                            sure this action
                                            is intentional.
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                                        <button
                                            type="button"
                                            onClick={
                                                closeStatusModal
                                            }
                                            disabled={
                                                saving
                                            }
                                            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            onClick={
                                                updateStatus
                                            }
                                            disabled={
                                                !selectedStatus ||
                                                saving
                                            }
                                            className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {saving && (
                                                <FiRefreshCw className="h-4 w-4 animate-spin" />
                                            )}

                                            {saving
                                                ? "Updating..."
                                                : "Update Status"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}