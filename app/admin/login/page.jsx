"use client";

import React, { useState } from "react";
import {
    FiArrowRight,
    FiEye,
    FiEyeOff,
    FiLock,
    FiMail,
    FiShield,
} from "react-icons/fi";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {

    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        if (!email.trim()) {
            setError("Please enter your email.");
            return;
        }

        if (!password) {
            setError("Please enter your password.");
            return;
        }

        setLoading(true);

        try {

            const response = await axios.post(
                "http://localhost:8000/api/admin/v2/login/",
                {
                    email: email.trim(),
                    password: password
                },
                {
                    withCredentials: true
                }
            );

            if (response.data?.success) {

                router.push("/admin/dashboard");

                return;
            }

            setError(
                response.data?.message ||
                "Unable to sign in. Please try again."
            );

        } catch (error) {

            console.log("Admin login error:", error);

            if (error.response) {

                const status = error.response.status;
                const data = error.response.data;

                if (status === 401) {

                    setError(
                        data?.message ||
                        "Invalid email or password."
                    );

                } else if (status === 403) {

                    setError(
                        data?.message ||
                        "You are not authorized to access the admin panel."
                    );

                } else if (status === 400) {

                    if (data?.email) {
                        setError(data.email[0]);
                    } else if (data?.password) {
                        setError(data.password[0]);
                    } else {
                        setError(
                            data?.message ||
                            "Please check your login details."
                        );
                    }

                } else {

                    setError(
                        data?.message ||
                        "Something went wrong. Please try again."
                    );
                }

            } else if (error.request) {

                setError(
                    "Unable to connect to the server. Please try again."
                );

            } else {

                setError(
                    "Something went wrong. Please try again."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f7f7f5]">
            <div className="flex min-h-screen">

                {/* Left */}
                <div className="hidden w-1/2 flex-col justify-between bg-black p-10 text-white lg:flex">

                    <div>
                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                                <span className="text-sm font-black">
                                    TC
                                </span>
                            </div>

                            <div>
                                <p className="text-sm font-bold">
                                    Temmy Collection
                                </p>

                                <p className="text-[9px] text-gray-500">
                                    Administration
                                </p>
                            </div>

                        </div>
                    </div>

                    <div className="max-w-lg">

                        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                            <FiShield size={22} />
                        </div>

                        <h1 className="text-4xl font-bold leading-tight tracking-tight">
                            Manage your store
                            <br />
                            from one place.
                        </h1>

                        <p className="mt-5 max-w-md text-sm leading-6 text-gray-400">
                            Access your Temmy Collection administration
                            panel to manage products, orders, inventory,
                            customers and more.
                        </p>

                        <div className="mt-8 flex gap-8">

                            <div>
                                <p className="text-lg font-bold">
                                    Secure
                                </p>

                                <p className="mt-1 text-[10px] text-gray-500">
                                    Admin access
                                </p>
                            </div>

                            <div>
                                <p className="text-lg font-bold">
                                    Simple
                                </p>

                                <p className="mt-1 text-[10px] text-gray-500">
                                    Store management
                                </p>
                            </div>

                            <div>
                                <p className="text-lg font-bold">
                                    Fast
                                </p>

                                <p className="mt-1 text-[10px] text-gray-500">
                                    Dashboard access
                                </p>
                            </div>

                        </div>

                    </div>

                    <p className="text-[10px] text-gray-600">
                        © {new Date().getFullYear()} Temmy Collection
                    </p>

                </div>

                {/* Right */}
                <div className="flex w-full items-center justify-center px-5 py-10 lg:w-1/2">

                    <div className="w-full max-w-md">

                        {/* Mobile Logo */}
                        <div className="mb-10 lg:hidden">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                                    <span className="text-sm font-black">
                                        TC
                                    </span>
                                </div>

                                <div>
                                    <p className="text-sm font-bold">
                                        Temmy Collection
                                    </p>

                                    <p className="text-[9px] text-gray-400">
                                        Administration
                                    </p>
                                </div>

                            </div>

                        </div>

                        {/* Heading */}
                        <div className="mb-8">

                            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                                <FiLock size={18} />
                            </div>

                            <h2 className="text-2xl font-bold tracking-tight">
                                Admin sign in
                            </h2>

                            <p className="mt-2 text-xs leading-5 text-gray-500">
                                Sign in to access your Temmy Collection
                                dashboard.
                            </p>

                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-xs font-medium text-red-600">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            {/* Email */}
                            <div>

                                <label className="mb-2 block text-[10px] font-semibold text-gray-600">
                                    Admin email
                                </label>

                                <div className="relative">

                                    <FiMail
                                        size={15}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        placeholder="admin@example.com"
                                        required
                                        disabled={loading}
                                        className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-xs outline-none transition focus:border-black disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                </div>

                            </div>

                            {/* Password */}
                            <div>

                                <div className="mb-2 flex items-center justify-between">

                                    <label className="text-[10px] font-semibold text-gray-600">
                                        Password
                                    </label>

                                    <button
                                        type="button"
                                        className="text-[10px] font-semibold text-gray-400 hover:text-black"
                                    >
                                        Forgot password?
                                    </button>

                                </div>

                                <div className="relative">

                                    <FiLock
                                        size={15}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter your password"
                                        required
                                        disabled={loading}
                                        className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-12 text-xs outline-none transition focus:border-black disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        disabled={loading}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                                    >
                                        {showPassword ? (
                                            <FiEyeOff size={16} />
                                        ) : (
                                            <FiEye size={16} />
                                        )}
                                    </button>

                                </div>

                            </div>

                            {/* Remember */}
                            <div className="flex items-center gap-2">

                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="h-3.5 w-3.5 rounded border-gray-300"
                                />

                                <label
                                    htmlFor="remember"
                                    className="text-[10px] text-gray-500"
                                >
                                    Keep me signed in
                                </label>

                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in to dashboard

                                        <FiArrowRight
                                            size={15}
                                            className="transition-transform group-hover:translate-x-1"
                                        />
                                    </>
                                )}

                            </button>

                        </form>

                        {/* Security */}
                        <div className="mt-8 flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">

                            <FiShield
                                size={15}
                                className="mt-0.5 shrink-0 text-gray-400"
                            />

                            <p className="text-[9px] leading-4 text-gray-400">
                                This area is restricted to authorized
                                Temmy Collection administrators. Your
                                login credentials should never be shared
                                with anyone.
                            </p>

                        </div>

                        <p className="mt-8 text-center text-[9px] text-gray-400">
                            © {new Date().getFullYear()} Temmy Collection
                        </p>

                    </div>

                </div>

            </div>
        </main>
    );
}
