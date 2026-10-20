"use client";

import React, { useContext } from "react";
import Dashboard from "../../../Components/Dashboard";
import Link from "next/link";
import {
    FiMapPin,
    FiPlus,
    FiEdit3,
    FiPhone,
    FiChevronRight,
} from "react-icons/fi";
import { useAddress } from "../../../hook/useAddress";
import { AuthContext } from "../../../Components/IsAuth";

const page = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const { data: addresses, isLoading } =
        useAddress(isAuthenticated);

    console.log(addresses);

    return (
        <>
            <section className="w-full min-h-screen pt-22 px-10 lg:px-15 pb-10 max-[740px]:px-5 max-[740px]:pt-30">
                <div className="flex gap-6">
                    <Dashboard
                        custom={"address"}
                        display={"hidden"}
                    />

                    <div className="w-[70%] max-[850px]:w-full">
                        {/* PAGE HEADER */}
                        <div className="flex items-center justify-between gap-4 mb-6 max-[550px]:items-start">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-[25px] font-bold">
                                        My Addresses
                                    </h1>

                                    {!isLoading &&
                                        addresses?.length > 0 && (
                                            <span className="min-w-6 h-6 px-1.5 rounded-full bg-black text-white text-[11px] flex justify-center items-center">
                                                {addresses.length}
                                            </span>
                                        )}
                                </div>

                                <p className="text-[14px] text-gray-500 mt-1">
                                    Manage your delivery and billing
                                    addresses.
                                </p>
                            </div>

                            <Link
                                href="/dashboard/address/addaddress"
                                className="flex items-center gap-2 px-4 py-2.5 bg-black text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
                            >
                                <FiPlus />
                                Add Address
                            </Link>
                        </div>

                        {/* LOADING */}
                        {isLoading ? (
                            <div className="flex flex-col gap-4">
                                {[1, 2].map((item) => (
                                    <div
                                        key={item}
                                        className="border border-gray-200 rounded-2xl p-5 animate-pulse"
                                    >
                                        <div className="flex justify-between">
                                            <div className="space-y-3 w-[70%]">
                                                <div className="w-20 h-6 bg-gray-100 rounded" />
                                                <div className="w-40 h-4 bg-gray-100 rounded" />
                                                <div className="w-full h-4 bg-gray-100 rounded" />
                                                <div className="w-32 h-4 bg-gray-100 rounded" />
                                            </div>

                                            <div className="w-16 h-8 bg-gray-100 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : addresses?.length > 0 ? (
                            /* ADDRESS LIST */
                            <div className="flex flex-col gap-4">
                                {addresses.map((address) => (
                                    <div
                                        key={`address_${address.id}`}
                                        className="group border border-gray-200 rounded-2xl bg-white p-5 hover:border-gray-300 hover:shadow-sm transition-all"
                                    >
                                        <div className="flex justify-between gap-5">
                                            {/* ADDRESS INFO */}
                                            <div className="flex gap-4 min-w-0">
                                                <div className="w-11 h-11 shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <FiMapPin className="text-gray-600 text-[18px]" />
                                                </div>

                                                <div
                                                    className="min-w-0"
                                                    style={{
                                                        lineHeight:
                                                            "21px",
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                                        <span className="capitalize text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                                                            {address?.address_type ||
                                                                "Address"}
                                                        </span>
                                                    </div>

                                                    <h3 className="font-semibold text-[15px] text-gray-900 uppercase">
                                                        {
                                                            address?.first_name
                                                        }{" "}
                                                        {
                                                            address?.last_name
                                                        }
                                                    </h3>

                                                    <p className="text-[13px] text-gray-600 mt-1 leading-5">
                                                        {
                                                            address?.address_line_1
                                                        }{" "}
                                                        {
                                                            address?.city
                                                        }{" "}
                                                        {
                                                            address?.state
                                                                ?.name
                                                        }{" "}
                                                        State,{" "}
                                                        {
                                                            address?.country
                                                        }
                                                    </p>

                                                    <div className="flex items-center gap-1.5 text-[13px] text-gray-500 mt-2">
                                                        <FiPhone className="text-[13px]" />

                                                        <span>
                                                            {
                                                                address?.phone1
                                                            }

                                                            {address?.phone2 &&
                                                                `, ${address.phone2}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* EDIT */}
                                            <Link
                                                href={`/checkout/billingaddress?address=${address?.id}`}
                                                className="flex items-center gap-1.5 h-fit px-3 py-2 rounded-lg text-[12px] font-medium text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                                            >
                                                <FiEdit3 />

                                                <span className="max-[500px]:hidden">
                                                    Edit
                                                </span>
                                            </Link>
                                        </div>

                                        {/* BOTTOM ROW */}
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <p className="text-[11px] text-gray-400">
                                                Saved delivery address
                                            </p>

                                            <Link
                                                href={`/checkout/billingaddress?address=${address?.id}`}
                                                className="text-[11px] text-gray-500 hover:text-black flex items-center gap-1"
                                            >
                                                Manage
                                                <FiChevronRight />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* EMPTY STATE */
                            <div className="border border-gray-200 rounded-2xl bg-white py-20 px-5 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <FiMapPin className="text-[25px] text-gray-400" />
                                </div>

                                <h3 className="text-[17px] font-semibold">
                                    No saved addresses
                                </h3>

                                <p className="text-[13px] text-gray-500 mt-1 max-w-sm">
                                    Add an address to make checkout
                                    faster and easier.
                                </p>

                                <Link
                                    href="/dashboard/address/addaddress"
                                    className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black text-white text-[13px] font-medium hover:bg-gray-800"
                                >
                                    <FiPlus />
                                    Add Address
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default page;