"use client";

import React, { useContext, useEffect, useState } from "react";
import Dashboard from "../../../Components/Dashboard";
import Link from "next/link";
import { FiEdit3, FiMail, FiUser, FiPhone, FiShield } from "react-icons/fi";
import { useUserDetail } from "../../../hook/useUserDetails";
import { AuthContext } from "../../../Components/IsAuth";

const page = () => {
    const [profile, setProfile] = useState({
        email: "",
        userName: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
    });

    const [editProfile, setEditProfile] = useState(false);

    const { isAuthenticated } = useContext(AuthContext);
    const { data } = useUserDetail(isAuthenticated);

    useEffect(() => {
        if (!data) {
            return;
        }

        setProfile({
            email: data?.email || "",
            userName: data?.username || "",
            firstName: data?.first_name || "",
            lastName: data?.last_name || "",
            phoneNumber: data?.phone_number || "",
        });
    }, [data]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setProfile((vl) => ({
            ...vl,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Profile update API will go here
        setEditProfile(false);
    };

    const fullName =
        `${profile.firstName} ${profile.lastName}`.trim() ||
        profile.userName ||
        "Your Profile";

    const initials =
        `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`
            .toUpperCase() ||
        profile.userName?.[0]?.toUpperCase() ||
        "U";

    return (
        <>
            <section className="w-full min-h-screen pt-22 px-10 lg:px-15 pb-10 max-[740px]:px-5 max-[740px]:pt-30">
                <div className="flex gap-6">
                    <Dashboard custom={"profile"} display={"hidden"} />

                    <div className="w-[70%] max-[850px]:w-full">
                        {/* PAGE HEADER */}
                        <div className="mb-6">
                            <h1 className="text-[25px] font-bold">
                                My Profile
                            </h1>

                            <p className="text-[14px] text-gray-500 mt-1">
                                Manage your personal information and
                                account settings.
                            </p>
                        </div>

                        {/* PROFILE HEADER CARD */}
                        <div className="w-full rounded-2xl border border-gray-200 bg-white overflow-hidden">
                            <div className="h-28 bg-gray-900 relative">
                                <div className="absolute -bottom-10 left-6">
                                    <div className="w-20 h-20 rounded-full bg-white p-1">
                                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                                            <span className="text-[24px] font-bold text-gray-700">
                                                {initials}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 pt-14 pb-5 flex justify-between items-end gap-4 max-[600px]:flex-col max-[600px]:items-start">
                                <div>
                                    <h2 className="text-[20px] font-bold">
                                        {fullName}
                                    </h2>

                                    <p className="text-[13px] text-gray-500 mt-1">
                                        @{profile.userName}
                                    </p>
                                </div>

                                <Link
                                    href="/dashboard/profile/changepassword"
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[13px] font-medium transition-colors"
                                >
                                    <FiShield />
                                    Change Password
                                </Link>
                            </div>
                        </div>

                        {/* ACCOUNT INFORMATION */}
                        <div className="mt-5 border border-gray-200 rounded-2xl bg-white p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-[18px] font-semibold">
                                        Account information
                                    </h3>

                                    <p className="text-[13px] text-gray-500 mt-1">
                                        Keep your account details up to
                                        date.
                                    </p>
                                </div>

                                {!editProfile && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditProfile(true)
                                        }
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-[13px] font-medium hover:bg-gray-800 cursor-pointer"
                                    >
                                        <FiEdit3 />
                                        Edit
                                    </button>
                                )}
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="w-full"
                            >
                                <div className="grid grid-cols-2 gap-5 max-[650px]:grid-cols-1">
                                    {/* FIRST NAME */}
                                    <div>
                                        <label
                                            htmlFor="firstName"
                                            className="text-[12px] font-medium text-gray-500"
                                        >
                                            FIRST NAME
                                        </label>

                                        <div className="relative mt-1">
                                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                            <input
                                                type="text"
                                                name="firstName"
                                                id="firstName"
                                                value={
                                                    profile.firstName
                                                }
                                                onChange={handleChange}
                                                disabled={!editProfile}
                                                className={`w-full h-11 rounded-lg border pl-10 pr-3 text-[14px] outline-none ${
                                                    editProfile
                                                        ? "border-gray-300 focus:border-black"
                                                        : "border-gray-200 bg-gray-50 text-gray-500"
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    {/* LAST NAME */}
                                    <div>
                                        <label
                                            htmlFor="lastName"
                                            className="text-[12px] font-medium text-gray-500"
                                        >
                                            LAST NAME
                                        </label>

                                        <div className="relative mt-1">
                                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                            <input
                                                type="text"
                                                name="lastName"
                                                id="lastName"
                                                value={
                                                    profile.lastName
                                                }
                                                onChange={handleChange}
                                                disabled={!editProfile}
                                                className={`w-full h-11 rounded-lg border pl-10 pr-3 text-[14px] outline-none ${
                                                    editProfile
                                                        ? "border-gray-300 focus:border-black"
                                                        : "border-gray-200 bg-gray-50 text-gray-500"
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    {/* EMAIL */}
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="text-[12px] font-medium text-gray-500"
                                        >
                                            EMAIL ADDRESS
                                        </label>

                                        <div className="relative mt-1">
                                            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                value={profile.email}
                                                disabled
                                                className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-[14px] text-gray-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* USERNAME */}
                                    <div>
                                        <label
                                            htmlFor="userName"
                                            className="text-[12px] font-medium text-gray-500"
                                        >
                                            USERNAME
                                        </label>

                                        <div className="relative mt-1">
                                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                            <input
                                                type="text"
                                                name="userName"
                                                id="userName"
                                                value={
                                                    profile.userName
                                                }
                                                disabled
                                                className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-[14px] text-gray-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* PHONE */}
                                    <div className="max-[650px]:col-span-1">
                                        <label
                                            htmlFor="phoneNumber"
                                            className="text-[12px] font-medium text-gray-500"
                                        >
                                            PHONE NUMBER
                                        </label>

                                        <div className="relative mt-1">
                                            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                id="phoneNumber"
                                                value={
                                                    profile.phoneNumber
                                                }
                                                onChange={handleChange}
                                                disabled={!editProfile}
                                                className={`w-full h-11 rounded-lg border pl-10 pr-3 text-[14px] outline-none ${
                                                    editProfile
                                                        ? "border-gray-300 focus:border-black"
                                                        : "border-gray-200 bg-gray-50 text-gray-500"
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* EDIT ACTIONS */}
                                {editProfile && (
                                    <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
                                        <button
                                            type="submit"
                                            className="px-5 py-2.5 rounded-lg bg-black text-white text-[13px] font-medium hover:bg-gray-800 cursor-pointer"
                                        >
                                            Save Changes
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditProfile(false)
                                            }
                                            className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-[13px] font-medium hover:bg-gray-200 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* SECURITY CARD */}
                        <div className="mt-5 border border-gray-200 rounded-2xl bg-white p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                                    <FiShield className="text-gray-700 text-[19px]" />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-semibold text-[15px]">
                                        Account security
                                    </h3>

                                    <p className="text-[12px] text-gray-500 mt-1">
                                        Keep your password secure and
                                        update it regularly.
                                    </p>
                                </div>

                                <Link
                                    href="/dashboard/profile/changepassword"
                                    className="text-[13px] font-medium text-gray-700 hover:text-black"
                                >
                                    Manage
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default page;