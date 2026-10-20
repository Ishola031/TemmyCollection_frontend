"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import api from "../../../api/api";
import LoadingContainer from "../../../Components/LoadingContainer";
import { useStateApi } from "../../../hook/useState";
import Link from "next/link";
import {
    FiArrowLeft,
    FiMapPin,
    FiPhone,
    FiUser,
    FiHome,
} from "react-icons/fi";

const BillingAddressContent = () => {
    const searchParams = useSearchParams();
    const addressID = searchParams.get("address");

    const [loading, setLoading] = useState(true);
    const [addLoading, setAddLoading] = useState(false);
    const [error, setError] = useState(null);

    const { data: states } = useStateApi();
    const router = useRouter();

    const [formData, setFormData] = useState({
        id: "",
        first_name: "",
        last_name: "",
        phone1: "",
        phone2: "",
        address_line_1: "",
        city: "",
        state: "",
        country: "Nigeria",
        address_type: "",
    });

    useEffect(() => {
        const fetchCheckout = async () => {
            try {
                if (addressID) {
                    setLoading(true);

                    const response = await api.get(
                        `/api/o/useraddress/`,
                        {
                            params: {
                                addressID: addressID,
                            },
                        }
                    );

                    setFormData((f) => ({
                        ...f,
                        id: response.data.id,
                        address_type:
                            response.data.address_type,
                        first_name:
                            response.data.first_name,
                        last_name:
                            response.data.last_name,
                        phone1: response.data.phone1,
                        phone2: response.data.phone2,
                        address_line_1:
                            response.data.address_line_1,
                        city: response.data.city,
                        state: response.data.state.id,
                        country: "Nigeria",
                    }));
                }
            } catch (error) {
                console.error(error);
                setError("Unable to load this address.");
            } finally {
                setLoading(false);
            }
        };

        fetchCheckout();
    }, [addressID]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((f) => ({
            ...f,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setAddLoading(true);
            setError(null);

            const res = await api.post(
                "api/o/createuseraddress/",
                formData
            );

            console.log(res.data);

            router.push("/checkout");
        } catch (error) {
            console.error(error);
            setError(
                error?.response?.data?.detail ||
                    "Unable to save address. Please try again."
            );
        } finally {
            setAddLoading(false);
        }
    };

    return (
        <section className="w-full min-h-screen bg-[#fafafa] pt-22 pb-10 px-10 max-[740px]:px-5 max-[740px]:pt-30">
            <div className="max-w-4xl mx-auto">
                {/* BACK */}
                <Link
                    href="/checkout"
                    className="inline-flex items-center gap-2 text-[13px] text-gray-500 hover:text-black mb-5"
                >
                    <FiArrowLeft />
                    Back to Checkout
                </Link>

                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-[26px] font-bold text-gray-900">
                            {addressID
                                ? "Edit Billing Address"
                                : "Add Billing Address"}
                        </h1>

                        <p className="text-[14px] text-gray-500 mt-1">
                            {addressID
                                ? "Update your billing address details."
                                : "Add an address for your order and checkout."}
                        </p>
                    </div>

                    <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center max-[500px]:hidden">
                        <FiMapPin className="text-gray-700 text-[19px]" />
                    </div>
                </div>

                {loading && addressID ? (
                    <div className="bg-white border border-gray-200 rounded-2xl p-7 animate-pulse">
                        <div className="w-40 h-5 bg-gray-100 rounded mb-8" />

                        <div className="grid grid-cols-2 gap-5 max-[600px]:grid-cols-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(
                                (item) => (
                                    <div key={item}>
                                        <div className="w-24 h-3 bg-gray-100 rounded mb-2" />
                                        <div className="w-full h-11 bg-gray-100 rounded-lg" />
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white border border-gray-200 rounded-2xl p-7"
                    >
                        {/* FORM HEADER */}
                        <div className="flex items-center gap-3 pb-5 mb-6 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <FiHome className="text-gray-700" />
                            </div>

                            <div>
                                <h2 className="text-[16px] font-semibold">
                                    Address Information
                                </h2>

                                <p className="text-[12px] text-gray-500">
                                    Make sure your address details
                                    are correct.
                                </p>
                            </div>
                        </div>

                        {/* ERROR */}
                        {error && (
                            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[13px]">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-5 max-[600px]:grid-cols-1">
                            {/* FIRST NAME */}
                            <div>
                                <label className="text-[12px] font-medium text-gray-500">
                                    FIRST NAME
                                </label>

                                <div className="relative mt-1">
                                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                    <input
                                        type="text"
                                        name="first_name"
                                        required
                                        value={
                                            formData.first_name
                                        }
                                        onChange={handleChange}
                                        placeholder="First name"
                                        className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-3 text-[14px] outline-none focus:border-black transition-colors"
                                    />
                                </div>
                            </div>

                            {/* LAST NAME */}
                            <div>
                                <label className="text-[12px] font-medium text-gray-500">
                                    LAST NAME
                                </label>

                                <div className="relative mt-1">
                                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                    <input
                                        type="text"
                                        name="last_name"
                                        required
                                        value={
                                            formData.last_name
                                        }
                                        onChange={handleChange}
                                        placeholder="Last name"
                                        className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-3 text-[14px] outline-none focus:border-black transition-colors"
                                    />
                                </div>
                            </div>

                            {/* ADDRESS */}
                            <div className="col-span-2 max-[600px]:col-span-1">
                                <label className="text-[12px] font-medium text-gray-500">
                                    STREET ADDRESS
                                </label>

                                <div className="relative mt-1">
                                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                    <input
                                        type="text"
                                        name="address_line_1"
                                        required
                                        value={
                                            formData.address_line_1
                                        }
                                        onChange={handleChange}
                                        placeholder="Street address"
                                        className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-3 text-[14px] outline-none focus:border-black transition-colors"
                                    />
                                </div>
                            </div>

                            {/* PHONE */}
                            <div>
                                <label className="text-[12px] font-medium text-gray-500">
                                    PHONE NUMBER
                                </label>

                                <div className="relative mt-1">
                                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                    <input
                                        type="tel"
                                        name="phone1"
                                        required
                                        value={formData.phone1}
                                        onChange={handleChange}
                                        placeholder="Phone number"
                                        className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-3 text-[14px] outline-none focus:border-black transition-colors"
                                    />
                                </div>
                            </div>

                            {/* SECOND PHONE */}
                            <div>
                                <label className="text-[12px] font-medium text-gray-500">
                                    SECOND PHONE{" "}
                                    <span className="text-gray-400">
                                        OPTIONAL
                                    </span>
                                </label>

                                <div className="relative mt-1">
                                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                    <input
                                        type="tel"
                                        name="phone2"
                                        value={formData.phone2}
                                        onChange={handleChange}
                                        placeholder="Optional phone number"
                                        className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-3 text-[14px] outline-none focus:border-black transition-colors"
                                    />
                                </div>
                            </div>

                            {/* COUNTRY */}
                            <div>
                                <label className="text-[12px] font-medium text-gray-500">
                                    COUNTRY
                                </label>

                                <input
                                    type="text"
                                    value={formData.country}
                                    disabled
                                    className="w-full h-11 mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-[14px] text-gray-500 outline-none"
                                />
                            </div>

                            {/* STATE */}
                            <div>
                                <label className="text-[12px] font-medium text-gray-500">
                                    STATE
                                </label>

                                <select
                                    name="state"
                                    required
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full h-11 mt-1 rounded-lg border border-gray-200 bg-white px-3 text-[14px] outline-none focus:border-black"
                                >
                                    <option value="">
                                        Select state
                                    </option>

                                    {states?.map((st) => (
                                        <option
                                            key={st.id}
                                            value={st.id}
                                        >
                                            {st.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* CITY */}
                            <div>
                                <label className="text-[12px] font-medium text-gray-500">
                                    CITY
                                </label>

                                <input
                                    type="text"
                                    name="city"
                                    required
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="City"
                                    className="w-full h-11 mt-1 rounded-lg border border-gray-200 px-3 text-[14px] outline-none focus:border-black transition-colors"
                                />
                            </div>

                            {/* ADDRESS TYPE */}
                            <div>
                                <label className="text-[12px] font-medium text-gray-500">
                                    ADDRESS TYPE
                                </label>

                                <input
                                    type="text"
                                    name="address_type"
                                    required
                                    value={
                                        formData.address_type
                                    }
                                    onChange={handleChange}
                                    placeholder="Home, Office, etc."
                                    className="w-full h-11 mt-1 rounded-lg border border-gray-200 px-3 text-[14px] outline-none focus:border-black transition-colors"
                                />
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-3 mt-7 pt-5 border-t border-gray-100">
                            <Link
                                href="/checkout"
                                className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-[13px] font-medium hover:bg-gray-200"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={addLoading}
                                className="min-w-32 px-5 py-2.5 rounded-lg bg-black text-white text-[13px] font-medium hover:bg-gray-800 cursor-pointer disabled:opacity-50 flex justify-center items-center"
                            >
                                {addLoading ? (
                                    <LoadingContainer />
                                ) : addressID ? (
                                    "Update Address"
                                ) : (
                                    "Save Address"
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
};

const page = () => {
    return (
        <Suspense fallback={<LoadingContainer />}>
            <BillingAddressContent />
        </Suspense>
    );
};

export default page;