"use client";

import React, { useEffect, useState, Suspense } from "react";
import Dashboard from "../../../../Components/Dashboard";
import Link from "next/link";
import { FiArrowLeft, FiMapPin, FiPhone, FiUser, FiHome } from "react-icons/fi";
import { useStateApi } from "../../../../hook/useState";
import { useSearchParams } from "next/navigation";
import api from "../../../../api/api";

const AddAddressContent = () => {
    const searchParams = useSearchParams();
    const addressID = searchParams.get("address");

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

    const { data: states } = useStateApi();

    const [loading, setLoading] = useState(true);
    const [addLoading, setAddLoading] = useState(false);

    useEffect(() => {
        const fetchCheckout = async () => {
            try {
                if (addressID) {
                    setLoading(true);

                    const response = await api.get(
                        "/api/o/useraddress/",
                        {
                            params: {
                                addressID: addressID,
                            },
                        }
                    );

                    setFormData((f) => ({
                        ...f,
                        id: response.data.id,
                        address_type: response.data.address_type,
                        first_name: response.data.first_name,
                        last_name: response.data.last_name,
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
            } finally {
                setLoading(false);
            }
        };

        fetchCheckout();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((f) => ({
            ...f,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Keep your existing save API logic here
    };

    return (
        <section className="w-full min-h-screen pt-22 px-10 lg:px-15 pb-10 max-[740px]:px-5 max-[740px]:pt-30">
            <div className="flex gap-6">
                <Dashboard
                    custom={"address"}
                    display={"hidden"}
                />

                <div className="w-[70%] max-[850px]:w-full">
                    {/* HEADER */}
                    <div className="mb-6">
                        <Link
                            href="/dashboard/address"
                            className="inline-flex items-center gap-2 text-[13px] text-gray-500 hover:text-black mb-4 transition-colors"
                        >
                            <FiArrowLeft />
                            Back to Addresses
                        </Link>

                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h1 className="text-[25px] font-bold">
                                    {addressID
                                        ? "Edit Address"
                                        : "Add Address"}
                                </h1>

                                <p className="text-[14px] text-gray-500 mt-1">
                                    {addressID
                                        ? "Update your saved address details."
                                        : "Add a delivery address to your account."}
                                </p>
                            </div>

                            <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                                <FiMapPin className="text-gray-700 text-[19px]" />
                            </div>
                        </div>
                    </div>

                    {loading && addressID ? (
                        <div className="border border-gray-200 rounded-2xl bg-white p-6 animate-pulse">
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
                            className="w-full border border-gray-200 rounded-2xl bg-white p-6"
                        >
                            {/* FORM HEADER */}
                            <div className="flex items-center gap-3 pb-5 mb-6 border-b border-gray-100">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <FiHome className="text-gray-700" />
                                </div>

                                <div>
                                    <h2 className="text-[16px] font-semibold">
                                        Address details
                                    </h2>

                                    <p className="text-[12px] text-gray-500 mt-1">
                                        Enter the information for this
                                        address.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5 max-[600px]:grid-cols-1">
                                {/* FIRST NAME */}
                                <div>
                                    <label
                                        htmlFor="first_name"
                                        className="text-[12px] font-medium text-gray-500"
                                    >
                                        FIRST NAME
                                    </label>

                                    <div className="relative mt-1">
                                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                        <input
                                            type="text"
                                            id="first_name"
                                            name="first_name"
                                            required
                                            value={
                                                formData.first_name
                                            }
                                            onChange={handleChange}
                                            className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-3 text-[14px] outline-none focus:border-black transition-colors"
                                            placeholder="First name"
                                        />
                                    </div>
                                </div>

                                {/* LAST NAME */}
                                <div>
                                    <label
                                        htmlFor="last_name"
                                        className="text-[12px] font-medium text-gray-500"
                                    >
                                        LAST NAME
                                    </label>

                                    <div className="relative mt-1">
                                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                        <input
                                            type="text"
                                            id="last_name"
                                            name="last_name"
                                            required
                                            value={
                                                formData.last_name
                                            }
                                            onChange={handleChange}
                                            className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-3 text-[14px] outline-none focus:border-black transition-colors"
                                            placeholder="Last name"
                                        />
                                    </div>
                                </div>

                                {/* ADDRESS */}
                                <div className="col-span-2 max-[600px]:col-span-1">
                                    <label
                                        htmlFor="address_line_1"
                                        className="text-[12px] font-medium text-gray-500"
                                    >
                                        ADDRESS
                                    </label>

                                    <div className="relative mt-1">
                                        <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                        <input
                                            type="text"
                                            id="address_line_1"
                                            name="address_line_1"
                                            required
                                            value={
                                                formData.address_line_1
                                            }
                                            onChange={handleChange}
                                            className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-3 text-[14px] outline-none focus:border-black transition-colors"
                                            placeholder="Street address"
                                        />
                                    </div>
                                </div>

                                {/* PHONE 1 */}
                                <div>
                                    <label
                                        htmlFor="phone1"
                                        className="text-[12px] font-medium text-gray-500"
                                    >
                                        PHONE NUMBER
                                    </label>

                                    <div className="relative mt-1">
                                        <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                        <input
                                            type="tel"
                                            id="phone1"
                                            name="phone1"
                                            required
                                            value={formData.phone1}
                                            onChange={handleChange}
                                            className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-3 text-[14px] outline-none focus:border-black transition-colors"
                                            placeholder="Phone number"
                                        />
                                    </div>
                                </div>

                                {/* PHONE 2 */}
                                <div>
                                    <label
                                        htmlFor="phone2"
                                        className="text-[12px] font-medium text-gray-500"
                                    >
                                        SECOND PHONE{" "}
                                        <span className="text-gray-400">
                                            (OPTIONAL)
                                        </span>
                                    </label>

                                    <div className="relative mt-1">
                                        <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                        <input
                                            type="tel"
                                            id="phone2"
                                            name="phone2"
                                            value={formData.phone2}
                                            onChange={handleChange}
                                            className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-3 text-[14px] outline-none focus:border-black transition-colors"
                                            placeholder="Optional phone number"
                                        />
                                    </div>
                                </div>

                                {/* COUNTRY */}
                                <div>
                                    <label
                                        htmlFor="country"
                                        className="text-[12px] font-medium text-gray-500"
                                    >
                                        COUNTRY
                                    </label>

                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        disabled
                                        className="w-full h-11 mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-[14px] text-gray-500 outline-none"
                                    />
                                </div>

                                {/* STATE */}
                                <div>
                                    <label
                                        htmlFor="state"
                                        className="text-[12px] font-medium text-gray-500"
                                    >
                                        STATE
                                    </label>

                                    <select
                                        id="state"
                                        name="state"
                                        required
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full h-11 mt-1 rounded-lg border border-gray-200 px-3 text-[14px] bg-white outline-none focus:border-black"
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
                                    <label
                                        htmlFor="city"
                                        className="text-[12px] font-medium text-gray-500"
                                    >
                                        CITY
                                    </label>

                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full h-11 mt-1 rounded-lg border border-gray-200 px-3 text-[14px] outline-none focus:border-black transition-colors"
                                        placeholder="City"
                                    />
                                </div>

                                {/* ADDRESS TYPE */}
                                <div>
                                    <label
                                        htmlFor="address_type"
                                        className="text-[12px] font-medium text-gray-500"
                                    >
                                        ADDRESS TYPE
                                    </label>

                                    <input
                                        type="text"
                                        id="address_type"
                                        name="address_type"
                                        required
                                        value={
                                            formData.address_type
                                        }
                                        onChange={handleChange}
                                        className="w-full h-11 mt-1 rounded-lg border border-gray-200 px-3 text-[14px] outline-none focus:border-black transition-colors"
                                        placeholder="Home, Office, etc."
                                    />
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex items-center justify-end gap-3 mt-7 pt-5 border-t border-gray-100">
                                <Link
                                    href="/dashboard/address"
                                    className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-[13px] font-medium hover:bg-gray-200"
                                >
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    disabled={addLoading}
                                    className="min-w-32 px-5 py-2.5 rounded-lg bg-black text-white text-[13px] font-medium hover:bg-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {addLoading
                                        ? "Saving..."
                                        : addressID
                                        ? "Update Address"
                                        : "Save Address"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
};

const page = () => {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center items-center min-h-screen">
                    Loading address form...
                </div>
            }
        >
            <AddAddressContent />
        </Suspense>
    );
};

export default page;