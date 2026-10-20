"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, Suspense } from "react";
import axios from "axios";
import api from "../../api/api";
import Message from "../../Components/Message";
import LoadingContainer from "../../Components/LoadingContainer";
import {
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiArrowRight,
    FiShield,
} from "react-icons/fi";

const SignInContent = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const searchparams = useSearchParams();
    const next = searchparams.get("next");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlesubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:8000/api/a/token/",
                {
                    email,
                    password,
                },
                {
                    withCredentials: true,
                }
            );

            setError(null);

            const cart_id = localStorage.getItem("cart_id");

            if (cart_id) {
                const merge = await api.post(
                    "http://localhost:8000/api/o/mergecart/",
                    {
                        cart_id: cart_id,
                    }
                );

                localStorage.removeItem("cart_id");
            }

            router.push(next || "/");

            return response.data.success;
        } catch (error) {
            console.error(error);

            if (error.response) {
                if (error.response.status === 401) {
                    setError("Email or Password is incorrect");
                } else {
                    setError(
                        "Server Error, Please try again later."
                    );
                }
            } else if (error.request) {
                setError(
                    "Network error, Please try again later"
                );
            } else {
                setError(
                    "Unexpected error, Please try again later"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href =
            "http://localhost:8000/accounts/google/login";
    };

    return (
        <>
            <Message
                message={error}
                setError={setError}
            />

            <section className="min-h-screen w-full bg-[#fafafa] flex items-center justify-center px-5 py-10">
                <div className="w-full max-w-107.5">
                    {/* LOGO / BRAND */}
                    <div className="text-center mb-7">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-4">
                            <FiShield className="text-[21px]" />
                        </div>

                        <h1 className="text-[26px] font-bold text-gray-900">
                            Welcome back
                        </h1>

                        <p className="text-[14px] text-gray-500 mt-1">
                            Sign in to continue shopping with us.
                        </p>
                    </div>

                    {/* FORM CARD */}
                    <form
                        onSubmit={handlesubmit}
                        className="w-full bg-white border border-gray-200 rounded-2xl p-7 shadow-sm"
                    >
                        {/* CHANGE EMAIL */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-[12px] text-gray-400">
                                    Account
                                </p>

                                <p className="text-[13px] font-medium text-gray-700 mt-0.5">
                                    {email ||
                                        "Enter your account details"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    router.push("/signup")
                                }
                                className="text-[12px] text-blue-600 hover:text-blue-700 cursor-pointer"
                            >
                                Change email
                            </button>
                        </div>

                        {/* EMAIL */}
                        <div className="mb-5">
                            <label
                                htmlFor="email"
                                className="block text-[12px] font-medium text-gray-500 mb-1.5"
                            >
                                EMAIL ADDRESS
                            </label>

                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    required
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="Enter your email"
                                    className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-3 text-[14px] text-gray-800 outline-none focus:border-black transition-colors"
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div className="mb-2">
                            <div className="flex items-center justify-between mb-1.5">
                                <label
                                    htmlFor="password"
                                    className="text-[12px] font-medium text-gray-500"
                                >
                                    PASSWORD
                                </label>

                                <button
                                    type="button"
                                    className="text-[12px] text-blue-600 hover:text-blue-700 cursor-pointer"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    id="password"
                                    required
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter your password"
                                    className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-11 text-[14px] text-gray-800 outline-none focus:border-black transition-colors"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                                >
                                    {showPassword ? (
                                        <FiEyeOff />
                                    ) : (
                                        <FiEye />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* SIGN IN */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 mt-5 rounded-lg bg-black text-white text-[14px] font-medium hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <LoadingContainer />
                            ) : (
                                <>
                                    Sign In
                                    <FiArrowRight />
                                </>
                            )}
                        </button>

                        {/* DIVIDER */}
                        <div className="flex items-center gap-3 my-5">
                            <div className="h-px flex-1 bg-gray-100" />

                            <span className="text-[11px] text-gray-400">
                                OR
                            </span>

                            <div className="h-px flex-1 bg-gray-100" />
                        </div>

                        {/* GOOGLE */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full h-11 rounded-lg border border-gray-200 bg-white text-gray-700 text-[13px] font-medium hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-3"
                        >
                            <span className="font-bold text-[15px]">
                                G
                            </span>

                            Continue with Google
                        </button>
                    </form>

                    {/* FOOTER */}
                    <p className="text-center text-[12px] text-gray-400 mt-5">
                        Don't have an account?{" "}
                        <button
                            type="button"
                            onClick={() =>
                                router.push("/signup")
                            }
                            className="text-black font-medium hover:underline cursor-pointer"
                        >
                            Create one
                        </button>
                    </p>
                </div>
            </section>
        </>
    );
};

const Page = () => {
    return (
        <Suspense fallback={<LoadingContainer />}>
            <SignInContent />
        </Suspense>
    );
};

export default Page;