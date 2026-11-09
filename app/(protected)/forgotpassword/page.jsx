
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
    FiMail,
    FiShield,
    FiArrowLeft,
    FiArrowRight,
    FiCheckCircle,
} from "react-icons/fi";

import Message from "../../Components/Message";
import LoadingContainer from "../../Components/LoadingContainer";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ForgotPasswordPage = () => {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setError("Please enter your email address.");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await axios.post(
                `${API_URL.replace(/\/$/, "")}/api/a/password/reset/`,
                {
                    email: normalizedEmail,
                }
            );

            setEmail(normalizedEmail);
            setSuccess(true);
        } catch (err) {
            console.error("Password reset request failed:", err);

            if (err.response) {
                setError(
                    err.response.data?.message ||
                    "Unable to process your request. Please try again."
                );
            } else if (err.request) {
                setError(
                    "Unable to connect to the server. Please check your internet connection."
                );
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTryAnotherEmail = () => {
        setSuccess(false);
        setEmail("");
        setError(null);
    };

    return (
        <>
            <Message message={error} setError={setError} />

            <section className="min-h-screen w-full bg-[#fafafa] flex items-center justify-center px-5 py-10">
                <div className="w-full max-w-107.5">

                    {/* BRAND */}
                    <div className="text-center mb-7">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-4">
                            <FiShield className="text-[21px]" />
                        </div>

                        <h1 className="text-[26px] font-bold text-gray-900">
                            Forgot password?
                        </h1>

                        <p className="text-[14px] text-gray-500 mt-1">
                            No worries, we'll help you reset it.
                        </p>
                    </div>

                    {/* FORM CARD */}
                    <div className="w-full bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">

                        {success ? (
                            /* SUCCESS STATE */
                            <div className="text-center py-3">

                                <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-5">
                                    <FiCheckCircle className="text-green-600 text-2xl" />
                                </div>

                                <h2 className="text-[18px] font-semibold text-gray-900">
                                    Check your email
                                </h2>

                                <p className="text-[13px] text-gray-500 mt-2 leading-6">
                                    If an account exists with this email,
                                    you will receive instructions to reset
                                    your password.
                                </p>

                                <p className="text-[13px] font-medium text-gray-700 mt-4 break-all">
                                    {email}
                                </p>

                                <button
                                    type="button"
                                    onClick={handleTryAnotherEmail}
                                    className="text-[12px] text-blue-600 hover:underline mt-5 cursor-pointer"
                                >
                                    Try another email
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>

                                {/* DESCRIPTION */}
                                <div className="mb-6">
                                    <p className="text-[13px] text-gray-500 leading-6">
                                        Enter the email address associated
                                        with your account. We'll send you a
                                        secure link to reset your password.
                                    </p>
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
                                            autoComplete="email"
                                            autoFocus
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            placeholder="Enter your email"
                                            className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-3 text-[14px] text-gray-800 outline-none focus:border-black transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* SUBMIT */}
                                <button
                                    type="submit"
                                    disabled={loading || !email.trim()}
                                    className="w-full h-11 rounded-lg bg-black text-white text-[14px] font-medium hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <LoadingContainer />
                                    ) : (
                                        <>
                                            Send Reset Link
                                            <FiArrowRight />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* BACK TO SIGN IN */}
                        <button
                            type="button"
                            onClick={() => router.push("/signin")}
                            className="w-full flex items-center justify-center gap-2 text-[13px] text-gray-500 hover:text-black mt-6 cursor-pointer transition-colors"
                        >
                            <FiArrowLeft />
                            Back to sign in
                        </button>
                    </div>

                    {/* FOOTER */}
                    <p className="text-center text-[12px] text-gray-400 mt-5">
                        Need help? Contact our support team.
                    </p>
                </div>
            </section>
        </>
    );
};

export default ForgotPasswordPage;
