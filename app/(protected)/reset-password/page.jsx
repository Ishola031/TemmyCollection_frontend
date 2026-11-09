
"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

import {
    FiLock,
    FiEye,
    FiEyeOff,
    FiShield,
    FiArrowRight,
    FiCheckCircle,
    FiArrowLeft,
} from "react-icons/fi";

import Message from "../../Components/Message";
import LoadingContainer from "../../Components/LoadingContainer";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ResetPasswordContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const uid = searchParams.get("uid");
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError(null);

        if (!uid || !token) {
            setError("Invalid or missing password reset link.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            await axios.post(
                `${API_URL.replace(/\/$/, "")}/api/a/password/reset/confirm/`,
                {
                    uid,
                    token,
                    new_password: password,
                    confirm_password: confirmPassword,
                }
            );

            setSuccess(true);
            setPassword("");
            setConfirmPassword("");

        } catch (err) {
            console.error("Password reset failed:", err);

            if (err.response) {
                const data = err.response.data;

                const validationErrors = Array.isArray(data?.errors)
                    ? data.errors.join(" ")
                    : null;

                setError(
                    validationErrors ||
                    data?.message ||
                    data?.detail ||
                    "This reset link is invalid or has expired."
                );
            } else if (err.request) {
                setError("Unable to connect to the server. Please try again.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const passwordMismatch =
        confirmPassword.length > 0 && password !== confirmPassword;

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
                            {success
                                ? "Password updated"
                                : "Create new password"}
                        </h1>

                        <p className="text-[14px] text-gray-500 mt-1">
                            {success
                                ? "Your account is ready to use again."
                                : "Choose a strong password for your account."}
                        </p>
                    </div>

                    {/* FORM CARD */}
                    <div className="w-full bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">

                        {success ? (
                            /* SUCCESS */
                            <div className="text-center py-4">
                                <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-5">
                                    <FiCheckCircle className="text-green-600 text-2xl" />
                                </div>

                                <h2 className="text-[18px] font-semibold text-gray-900">
                                    Password reset successful!
                                </h2>

                                <p className="text-[13px] text-gray-500 mt-2 leading-6">
                                    Your password has been changed
                                    successfully. You can now sign in
                                    using your new password.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => router.push("/signin")}
                                    className="w-full h-11 mt-6 rounded-lg bg-black text-white text-[14px] font-medium hover:bg-gray-800 transition-colors cursor-pointer flex items-center justify-center gap-2"
                                >
                                    Continue to Sign In
                                    <FiArrowRight />
                                </button>
                            </div>
                        ) : (
                            <>
                                {!uid || !token ? (
                                    /* INVALID LINK */
                                    <div className="text-center py-4">
                                        <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
                                            <FiLock className="text-red-500 text-2xl" />
                                        </div>

                                        <h2 className="text-[17px] font-semibold text-gray-900">
                                            Invalid reset link
                                        </h2>

                                        <p className="text-[13px] text-gray-500 mt-2 leading-6">
                                            This password reset link is
                                            incomplete or invalid. Please
                                            request a new reset link.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => router.push("/forgot-password")}
                                            className="w-full h-11 mt-6 rounded-lg bg-black text-white text-[14px] font-medium cursor-pointer hover:bg-gray-800"
                                        >
                                            Request New Link
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        <p className="text-[13px] text-gray-500 mb-6 leading-6">
                                            Enter your new password below.
                                            Make sure it is something secure
                                            that you haven't used before.
                                        </p>

                                        {/* NEW PASSWORD */}
                                        <div className="mb-5">
                                            <label
                                                htmlFor="password"
                                                className="block text-[12px] font-medium text-gray-500 mb-1.5"
                                            >
                                                NEW PASSWORD
                                            </label>

                                            <div className="relative">
                                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    id="password"
                                                    required
                                                    minLength={8}
                                                    autoComplete="new-password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Enter new password"
                                                    className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-11 text-[14px] text-gray-800 outline-none focus:border-black transition-colors"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                                                >
                                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                                </button>
                                            </div>

                                            <p className="text-[11px] text-gray-400 mt-1.5">
                                                Use at least 8 characters.
                                            </p>
                                        </div>

                                        {/* CONFIRM PASSWORD */}
                                        <div className="mb-6">
                                            <label
                                                htmlFor="confirmPassword"
                                                className="block text-[12px] font-medium text-gray-500 mb-1.5"
                                            >
                                                CONFIRM NEW PASSWORD
                                            </label>

                                            <div className="relative">
                                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    id="confirmPassword"
                                                    required
                                                    autoComplete="new-password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm new password"
                                                    className={`w-full h-11 rounded-lg border pl-10 pr-11 text-[14px] text-gray-800 outline-none transition-colors ${
                                                        passwordMismatch
                                                            ? "border-red-400 focus:border-red-500"
                                                            : "border-gray-200 focus:border-black"
                                                    }`}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                                                >
                                                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                                </button>
                                            </div>

                                            {passwordMismatch && (
                                                <p className="text-[11px] text-red-500 mt-1.5">
                                                    Passwords do not match.
                                                </p>
                                            )}
                                        </div>

                                        {/* SUBMIT */}
                                        <button
                                            type="submit"
                                            disabled={
                                                loading ||
                                                !password ||
                                                !confirmPassword ||
                                                passwordMismatch
                                            }
                                            className="w-full h-11 rounded-lg bg-black text-white text-[14px] font-medium hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <LoadingContainer />
                                            ) : (
                                                <>
                                                    Reset Password
                                                    <FiArrowRight />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </>
                        )}

                        {/* BACK TO SIGN IN */}
                        {!success && (
                            <button
                                type="button"
                                onClick={() => router.push("/signin")}
                                className="w-full flex items-center justify-center gap-2 text-[13px] text-gray-500 hover:text-black mt-6 cursor-pointer transition-colors"
                            >
                                <FiArrowLeft />
                                Back to sign in
                            </button>
                        )}
                    </div>

                    <p className="text-center text-[12px] text-gray-400 mt-5">
                        TemmyCollection · Account Security
                    </p>
                </div>
            </section>
        </>
    );
};

const Page = () => {
    return (
        <Suspense fallback={<LoadingContainer />}>
            <ResetPasswordContent />
        </Suspense>
    );
};

export default Page;
