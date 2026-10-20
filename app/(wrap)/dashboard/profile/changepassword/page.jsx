"use client";

import React, { useState } from "react";
import Dashboard from "../../../../Components/Dashboard";
import Link from "next/link";
import {
    FiLock,
    FiShield,
    FiArrowLeft,
    FiEye,
    FiEyeOff,
} from "react-icons/fi";

const page = () => {
    const [profile, setProfile] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setProfile((vl) => ({
            ...vl,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Change password API will go here
    };

    return (
        <>
            <section className="w-full min-h-screen pt-22 px-10 lg:px-15 pb-10 max-[740px]:px-5 max-[740px]:pt-30">
                <div className="flex gap-6">
                    <Dashboard
                        custom={"profile"}
                        display={"hidden"}
                    />

                    <div className="w-[70%] max-[850px]:w-full">
                        {/* PAGE HEADER */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/dashboard/profile"
                                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                    <FiArrowLeft />
                                </Link>

                                <div>
                                    <h1 className="text-[25px] font-bold">
                                        Change Password
                                    </h1>

                                    <p className="text-[14px] text-gray-500 mt-1">
                                        Update your password to keep
                                        your account secure.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-[1fr_280px] gap-5 max-[850px]:grid-cols-1">
                            {/* CHANGE PASSWORD */}
                            <div className="border border-gray-200 rounded-2xl bg-white p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                                        <FiLock className="text-gray-700 text-[19px]" />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-[17px]">
                                            Password
                                        </h2>

                                        <p className="text-[12px] text-gray-500 mt-1">
                                            Enter your current password
                                            and choose a new one.
                                        </p>
                                    </div>
                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    className="flex flex-col gap-5"
                                >
                                    {/* OLD PASSWORD */}
                                    <div>
                                        <label
                                            htmlFor="oldPassword"
                                            className="text-[12px] font-medium text-gray-500"
                                        >
                                            CURRENT PASSWORD
                                        </label>

                                        <div className="relative mt-1">
                                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                            <input
                                                type={
                                                    showOldPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="oldPassword"
                                                id="oldPassword"
                                                required
                                                value={
                                                    profile.oldPassword
                                                }
                                                onChange={handleChange}
                                                className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-11 text-[14px] outline-none focus:border-black transition-colors"
                                                placeholder="Enter current password"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowOldPassword(
                                                        !showOldPassword
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                                            >
                                                {showOldPassword ? (
                                                    <FiEyeOff />
                                                ) : (
                                                    <FiEye />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* NEW PASSWORD */}
                                    <div>
                                        <label
                                            htmlFor="newPassword"
                                            className="text-[12px] font-medium text-gray-500"
                                        >
                                            NEW PASSWORD
                                        </label>

                                        <div className="relative mt-1">
                                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                            <input
                                                type={
                                                    showNewPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="newPassword"
                                                id="newPassword"
                                                required
                                                value={
                                                    profile.newPassword
                                                }
                                                onChange={handleChange}
                                                className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-11 text-[14px] outline-none focus:border-black transition-colors"
                                                placeholder="Enter new password"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowNewPassword(
                                                        !showNewPassword
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                                            >
                                                {showNewPassword ? (
                                                    <FiEyeOff />
                                                ) : (
                                                    <FiEye />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* CONFIRM PASSWORD */}
                                    <div>
                                        <label
                                            htmlFor="confirmPassword"
                                            className="text-[12px] font-medium text-gray-500"
                                        >
                                            CONFIRM NEW PASSWORD
                                        </label>

                                        <div className="relative mt-1">
                                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                            <input
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="confirmPassword"
                                                id="confirmPassword"
                                                required
                                                value={
                                                    profile.confirmPassword
                                                }
                                                onChange={handleChange}
                                                className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-11 text-[14px] outline-none focus:border-black transition-colors"
                                                placeholder="Confirm new password"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                                            >
                                                {showConfirmPassword ? (
                                                    <FiEyeOff />
                                                ) : (
                                                    <FiEye />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 rounded-lg bg-black text-white text-[13px] font-medium hover:bg-gray-800 cursor-pointer"
                                        >
                                            Update Password
                                        </button>

                                        <Link
                                            href="/dashboard/profile"
                                            className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-[13px] font-medium hover:bg-gray-200"
                                        >
                                            Cancel
                                        </Link>
                                    </div>
                                </form>
                            </div>

                            {/* SECURITY INFO */}
                            <div className="border border-gray-200 rounded-2xl bg-white p-5 h-fit">
                                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <FiShield className="text-gray-700 text-[19px]" />
                                </div>

                                <h3 className="font-semibold text-[16px]">
                                    Keep your account secure
                                </h3>

                                <p className="text-[13px] text-gray-500 leading-5 mt-2">
                                    Use a strong password that you don't
                                    use on other websites.
                                </p>

                                <div className="border-t border-gray-100 mt-5 pt-4">
                                    <p className="text-[12px] font-medium text-gray-700">
                                        Password tips
                                    </p>

                                    <ul className="mt-2 space-y-2 text-[12px] text-gray-500">
                                        <li>
                                            • Use at least 8 characters
                                        </li>

                                        <li>
                                            • Mix letters and numbers
                                        </li>

                                        <li>
                                            • Add special characters
                                        </li>

                                        <li>
                                            • Avoid using your name
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default page;