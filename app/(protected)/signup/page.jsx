"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import LoadingContainer from "../../Components/LoadingContainer";
import Message from "../../Components/Message";
import {
    FiMail,
    FiArrowRight,
    FiShield,
} from "react-icons/fi";

const Page = () => {
    const [email, setEmail] = useState("");
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlesubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            localStorage.setItem(
                "email",
                JSON.stringify(email)
            );

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/a/checkemail/?email=${email}`
            );

            const data = await res.json();

            if (data.registered) {
                router.push("/signin");
            }

            if (data.unregistered) {
                router.push("/signup/form");
            }

            console.log(data);
        } catch (error) {
            console.error(error);

            if (error.response) {
                setError(
                    "Server Error, Please try again later."
                );
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

                    {/* BRAND */}
                    <div className="text-center mb-7">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-4">
                            <FiShield className="text-[21px]" />
                        </div>

                        <h1 className="text-[26px] font-bold text-gray-900">
                            Welcome to Temmy Collection
                        </h1>

                        <p className="text-[14px] text-gray-500 mt-2">
                            Enter your email to continue.
                        </p>
                    </div>

                    {/* CARD */}
                    <form
                        onSubmit={handlesubmit}
                        className="w-full bg-white border border-gray-200 rounded-2xl p-7 shadow-sm"
                    >
                        <div className="mb-6">
                            <h2 className="text-[17px] font-semibold text-gray-900">
                                Get started
                            </h2>

                            <p className="text-[13px] text-gray-500 mt-1">
                                We'll check if you already have
                                an account.
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
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your email"
                                    className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-3 text-[14px] text-gray-800 outline-none focus:border-black transition-colors"
                                />
                            </div>
                        </div>

                        {/* CONTINUE */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-lg bg-black text-white text-[14px] font-medium hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <LoadingContainer />
                            ) : (
                                <>
                                    Continue
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
                    <p className="text-center text-[11px] text-gray-400 mt-5">
                        By continuing, you agree to our terms
                        and privacy policy.
                    </p>
                </div>
            </section>
        </>
    );
};

export default Page;