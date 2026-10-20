"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    FiArrowLeft,
    FiMoreVertical,
    FiMail,
    FiPhone,
    FiPhoneCall,
    FiMapPin,
    FiCalendar,
    FiShoppingBag,
    FiDollarSign,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiUser,
    FiMessageSquare,
    FiSlash,
    FiEdit,
    FiTrash2,
    FiCreditCard,
    FiActivity,
    FiChevronRight,
} from "react-icons/fi";
import adminApi from "../../../api/adminApi";


function formatCurrency(value) {
    return `₦${Number(value).toLocaleString()}`;
}

function StatusBadge({ status }) {
    const styles = {
        Delivered: "bg-green-100 text-green-700",
        Processing: "bg-blue-100 text-blue-700",
        Pending: "bg-yellow-100 text-yellow-700",
        Cancelled: "bg-red-100 text-red-700",
        Paid: "bg-green-100 text-green-700",
        Refunded: "bg-gray-100 text-gray-700",
    };

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
                styles[status] || "bg-gray-100 text-gray-700"
            }`}
        >
            {status}
        </span>
    );
}

function StatCard({ icon, title, value, description }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-gray-500">{title}</p>

                    <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                        {value}
                    </h3>

                    {description && (
                        <p className="mt-1 text-xs text-gray-500">
                            {description}
                        </p>
                    )}
                </div>

                <div className="rounded-lg bg-gray-100 p-3 text-gray-700">
                    {icon}
                </div>
            </div>
        </div>
    );
}


const CustomerDetails = ({username}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showBanModal, setShowBanModal] = useState(false);
    const [isBanned, setIsBanned] = useState();
    const [activeTab, setActiveTab] = useState("orders");
    const [loading, setLoading] = useState(true);
    const [loadingOrder, setLoadingOrder] = useState(true);
    const [loadingAddress, setLoadingAddress] = useState(true);
    const [customer, setCustomer] = useState({});
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [error, setError] = useState("");

    const customerName = `${customer.first_name} ${customer.last_name}`;

    const handleBanCustomer = () => {
        setIsBanned(!isBanned);
        setShowBanModal(false);
    };

    const fetchCustomer = async () => {
        try {
            setLoading(true);
            // setError("");

            const response = await adminApi.get(`customersdetails/?username=${username}`);
            const data = response.data;
            // console.log(data)

            setCustomer(data);
        } catch (error) {
            console.error("Customer fetch error:", error);

            // setError(
            //     error?.response?.data?.message ||
            //     "Unable to load customers."
            // );

            setCustomer({});
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerOrders = async () => {
        try {
            setLoadingOrder(true);
            // setError("");

            const response = await adminApi.get(`userorders/?username=${username}`);
            const data = response.data;
            // console.log(data)

            setOrders(data);
        } catch (error) {
            console.error("Customer fetch error:", error);

            // setError(
            //     error?.response?.data?.message ||
            //     "Unable to load customers."
            // );

            // setCustomer({});
        } finally {
            setLoadingOrder(false);
        }
    };

    const fetchCustomerAddresses = async () => {
        try {
            setLoadingAddress(true);
            // setError("");

            const response = await adminApi.get(`useraddresses/?username=${username}`);
            const data = response.data;
            console.log(data)

            setAddresses(data);
        } catch (error) {
            console.error("Customer fetch error:", error);

            // setError(
            //     error?.response?.data?.message ||
            //     "Unable to load customers."
            // );

            // setCustomer({});
        } finally {
            setLoadingAddress(false);
        }
    };



    useEffect(()=> {
        fetchCustomer()
        fetchCustomerOrders()
        fetchCustomerAddresses()
    },[username])

    const shortDate = (date)=> {
        const Da = new Date(date);
        const shortD = Da.toLocaleDateString('en-US',{
            month:'short',
            day: 'numeric'
        });
        return shortD
    }

    const FullDate = (date)=> {
        const Da = new Date(date);
        const longD = Da.toLocaleDateString('en-US',{
            month:'long',
            day: 'numeric',
            year: 'numeric'
        });
        return longD
    }


  return (
    <>
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">

                {loading? (
                    <>
                        <p>Loading</p>
                    </>
                ):(
                    <>
                        {/* BACK BUTTON */}
                        <Link href="/admin/dashboard/customers" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black">
                            <FiArrowLeft />
                            Back to Customers
                        </Link>

                        {/* CUSTOMER HEADER */}
                        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-900 text-xl font-semibold text-white">
                                        {customer?.image ? (
                                            <img
                                                src={customer.image}
                                                alt={customerName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <>
                                                {customer?.first_name[0]}
                                                {customer?.last_name[0]}
                                            </>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h1 className="text-2xl font-semibold text-gray-900">
                                                {customerName}
                                            </h1>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    customer?.isbanned
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-green-100 text-green-700"
                                                }`}
                                            >
                                                {customer?.isbanned ? "Banned" : "Active"}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Customer ID: {customer?.id}
                                        </p>
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="relative flex flex-wrap gap-2">

                                    <a
                                        href={`tel:${customer?.phone_number}`}
                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                                    >
                                        <FiPhoneCall />
                                        Call
                                    </a>

                                    <button
                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                                    >
                                        <FiMessageSquare />
                                        Message
                                    </button>

                                    <button
                                        onClick={() => setShowBanModal(true)}
                                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ${
                                            customer?.isbanned
                                                ? "bg-green-600 text-white hover:bg-green-700"
                                                : "bg-red-600 text-white hover:bg-red-700"
                                        }`}
                                    >
                                        <FiSlash />

                                        {customer?.isbanned ? "Unban" : "Ban"}
                                    </button>

                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="rounded-lg border border-gray-200 p-2.5 hover:bg-gray-50"
                                    >
                                        <FiMoreVertical />
                                    </button>

                                    {showMenu && (
                                        <div className="absolute right-0 top-12 z-30 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">

                                            <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50">
                                                <FiEdit />
                                                Edit Customer
                                            </button>

                                            <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                                                <FiTrash2 />
                                                Delete Customer
                                            </button>

                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>


                        {/* MAIN STATS */}
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                            <StatCard
                                icon={<FiDollarSign size={20} />}
                                title="Total Spent"
                                value={formatCurrency(customer.total_spent)}
                                description="Lifetime customer spending"
                            />

                            <StatCard
                                icon={<FiShoppingBag size={20} />}
                                title="Total Orders"
                                value={customer?.order_count}
                                description={`Total order`}
                            />

                            <StatCard
                                icon={<FiCreditCard size={20} />}
                                title="Average Order"
                                value={formatCurrency(customer?.avg_order)}
                                description="Average order value"
                            />

                            <StatCard
                                icon={<FiClock size={20} />}
                                title="Last Order"
                                value={shortDate(customer?.last_order_date)}
                                description={FullDate(customer?.last_order_date)}
                            />

                        </div>


                        {/* MAIN CONTENT */}
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                            {/* LEFT CONTENT */}
                            <div className="space-y-6 xl:col-span-2">

                                {/* TABS */}
                                <div className="rounded-xl border border-gray-200 bg-white">

                                    <div className="flex overflow-x-auto border-b border-gray-200">
                                        {[["orders", "Orders"],["activity", "Activity"],["addresses", "Addresses"],].map(([id, label]) => (
                                            <button key={id} onClick={() => setActiveTab(id)}
                                                className={`whitespace-nowrap px-6 py-4 text-sm font-medium ${
                                                    activeTab === id
                                                        ? "border-b-2 border-black text-black"
                                                        : "text-gray-500 hover:text-gray-900"
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        ))}

                                    </div>

                                    {/* ORDERS */}
                                    {activeTab === "orders" && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-187.5">
                                                <thead>
                                                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase text-gray-500">
                                                        <th className="px-6 py-4">
                                                            Order
                                                        </th>

                                                        <th className="px-6 py-4">
                                                            Date
                                                        </th>

                                                        <th className="px-6 py-4">
                                                            Items
                                                        </th>

                                                        <th className="px-6 py-4">
                                                            Total
                                                        </th>

                                                        <th className="px-6 py-4">
                                                            Payment
                                                        </th>

                                                        <th className="px-6 py-4">
                                                            Status
                                                        </th>

                                                        <th className="px-6 py-4"></th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {orders?.results?.map((order) => (
                                                        <tr key={order?.order_number} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                                            <td className="px-6 py-4 text-sm font-medium">
                                                                {order?.order_number}
                                                            </td>

                                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                                {order?.created_at}
                                                            </td>

                                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                                {order?.items}
                                                            </td>

                                                            <td className="px-6 py-4 text-sm font-medium">
                                                                {formatCurrency(order?.sub_total)}
                                                            </td>

                                                            {/* <td className="px-6 py-4">
                                                                <StatusBadge
                                                                    status={order?.payment}
                                                                />
                                                            </td> */}

                                                            <td className="px-6 py-4">
                                                                <StatusBadge
                                                                    status={
                                                                        order?.status
                                                                    }
                                                                />
                                                            </td>

                                                            <td className="px-6 py-4">
                                                                <button className="text-gray-500 hover:text-black">
                                                                    <FiChevronRight />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* ACTIVITY */}
                                    {activeTab === "activity" && (
                                        <div className="p-6">

                                            <div className="space-y-6">

                                                {/* {activities?.map(
                                                    (activity, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex gap-4"
                                                        >
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">

                                                                {activity.type ===
                                                                "order" ? (
                                                                    <FiShoppingBag />
                                                                ) : activity.type ===
                                                                "payment" ? (
                                                                    <FiCreditCard />
                                                                ) : activity.type ===
                                                                "login" ? (
                                                                    <FiUser />
                                                                ) : (
                                                                    <FiActivity />
                                                                )}

                                                            </div>

                                                            <div className="flex-1">

                                                                <div className="flex justify-between gap-4">

                                                                    <p className="text-sm font-medium">
                                                                        {
                                                                            activity.title
                                                                        }
                                                                    </p>

                                                                    <span className="whitespace-nowrap text-xs text-gray-400">
                                                                        {
                                                                            activity.time
                                                                        }
                                                                    </span>

                                                                </div>

                                                                <p className="mt-1 text-sm text-gray-500">
                                                                    {
                                                                        activity.description
                                                                    }
                                                                </p>

                                                            </div>
                                                        </div>
                                                    )
                                                )} */}

                                            </div>

                                        </div>
                                    )}

                                    {/* ADDRESSES */}
                                    {activeTab === "addresses" && (
                                        <div className="grid gap-4 p-6 md:grid-cols-2">

                                            {addresses?.results?.map((address) => (
                                                <div
                                                    key={address?.id}
                                                    className="rounded-lg border border-gray-200 p-5"
                                                >
                                                    <div className="mb-4 flex items-center justify-between">

                                                        <h3 className="font-medium">
                                                            {address?.address_type}
                                                        </h3>

                                                        {/* <button className="text-sm text-gray-500 hover:text-black">
                                                            Edit
                                                        </button> */}

                                                    </div>

                                                    <p className="text-sm font-medium">
                                                        {address?.first_name} {address?.last_name}
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {address?.address_line_1}
                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        {address?.city},{" "}
                                                        {address?.state?.name}
                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        {address?.country}
                                                    </p>

                                                    <p className="mt-2 text-sm text-gray-500">
                                                        {address?.phone1}
                                                    </p>

                                                </div>
                                            ))}

                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT SIDEBAR */}
                            <div className="space-y-6">

                                {/* CUSTOMER INFORMATION */}
                                <div className="rounded-xl border border-gray-200 bg-white p-6">

                                    <h2 className="mb-5 text-lg font-semibold">
                                        Customer Information
                                    </h2>

                                    <div className="space-y-5">

                                        <div className="flex gap-3">
                                            <FiMail className="mt-0.5 shrink-0 text-gray-400" />

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Email
                                                </p>

                                                <p className="mt-1 break-all text-sm">
                                                    {customer?.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <FiPhone className="mt-0.5 shrink-0 text-gray-400" />

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Phone
                                                </p>

                                                <a
                                                    href={`tel:${customer?.phone_number}`}
                                                    className="mt-1 block text-sm hover:underline"
                                                >
                                                    {customer?.phone_number || 'Null'}
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <FiCalendar className="mt-0.5 shrink-0 text-gray-400" />

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Customer Since
                                                </p>

                                                <p className="mt-1 text-sm">
                                                    {customer.joined}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <FiClock className="mt-0.5 shrink-0 text-gray-400" />

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Last Login
                                                </p>

                                                <p className="mt-1 text-sm">
                                                    {FullDate(customer?.last_login)}
                                                </p>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* ORDER BREAKDOWN */}
                                <div className="rounded-xl border border-gray-200 bg-white p-6">

                                    <h2 className="mb-5 text-lg font-semibold">
                                        Order Breakdown
                                    </h2>

                                    <div className="space-y-4">

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FiCheckCircle className="text-green-600" />
                                                <span className="text-sm text-gray-600">
                                                    Completed
                                                </span>
                                            </div>

                                            <span className="text-sm font-medium">
                                                {customer.successful_orders}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FiClock className="text-yellow-600" />
                                                <span className="text-sm text-gray-600">
                                                    Pending
                                                </span>
                                            </div>

                                            <span className="text-sm font-medium">
                                                {customer.pending_orders}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FiXCircle className="text-red-600" />
                                                <span className="text-sm text-gray-600">
                                                    Cancelled
                                                </span>
                                            </div>

                                            <span className="text-sm font-medium">
                                                {customer.cancelled_orders}
                                            </span>
                                        </div>

                                    </div>

                                </div>

                                {/* ACCOUNT STATUS */}
                                <div className="rounded-xl border border-gray-200 bg-white p-6">

                                    <h2 className="mb-4 text-lg font-semibold">
                                        Account Status
                                    </h2>

                                    {isBanned ? (
                                        <div className="rounded-lg bg-red-50 p-4">

                                            <div className="flex gap-3">
                                                <FiAlertCircle className="mt-0.5 shrink-0 text-red-600" />

                                                <div>
                                                    <p className="text-sm font-medium text-red-800">
                                                        Customer is banned
                                                    </p>

                                                    <p className="mt-1 text-xs leading-5 text-red-600">
                                                        This customer cannot place new
                                                        orders or access restricted
                                                        account features.
                                                    </p>
                                                </div>
                                            </div>

                                        </div>
                                    ) : (
                                        <div className="rounded-lg bg-green-50 p-4">

                                            <div className="flex gap-3">
                                                <FiCheckCircle className="mt-0.5 shrink-0 text-green-600" />

                                                <div>
                                                    <p className="text-sm font-medium text-green-800">
                                                        Account is active
                                                    </p>

                                                    <p className="mt-1 text-xs leading-5 text-green-600">
                                                        Customer can shop and use their
                                                        account normally.
                                                    </p>
                                                </div>
                                            </div>

                                        </div>
                                    )}

                                </div>

                                {/* QUICK ACTIONS */}
                                <div className="rounded-xl border border-gray-200 bg-white p-6">

                                    <h2 className="mb-4 text-lg font-semibold">
                                        Quick Actions
                                    </h2>

                                    <div className="space-y-2">

                                        <a
                                            href={`tel:${customer.phone}`}
                                            className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left text-sm hover:bg-gray-50"
                                        >
                                            <FiPhoneCall />
                                            Call Customer
                                        </a>

                                        <button className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left text-sm hover:bg-gray-50">
                                            <FiMessageSquare />
                                            Send Message
                                        </button>

                                        <button className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left text-sm hover:bg-gray-50">
                                            <FiMail />
                                            Send Email
                                        </button>

                                        <button className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left text-sm hover:bg-gray-50">
                                            <FiEdit />
                                            Edit Customer
                                        </button>

                                    </div>

                                </div>

                            </div>
                        </div>





                    </>
                )}

                

                

                

                

                {/* BAN MODAL */}
                {showBanModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                                <FiSlash size={22} />
                            </div>

                            <h2 className="text-xl font-semibold">
                                {isBanned
                                    ? "Unban Customer?"
                                    : "Ban Customer?"}
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                {isBanned
                                    ? `Are you sure you want to restore ${customerName}'s account?`
                                    : `Are you sure you want to ban ${customerName}? They will not be able to use restricted account features.`}
                            </p>

                            <div className="mt-6 flex justify-end gap-3">

                                <button
                                    onClick={() =>
                                        setShowBanModal(false)
                                    }
                                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleBanCustomer}
                                    className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white ${
                                        isBanned
                                            ? "bg-green-600 hover:bg-green-700"
                                            : "bg-red-600 hover:bg-red-700"
                                    }`}
                                >
                                    {isBanned
                                        ? "Unban Customer"
                                        : "Ban Customer"}
                                </button>

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </>
  )
}

export default CustomerDetails
