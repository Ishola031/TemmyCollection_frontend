'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import LoadingContainer from '../../../Components/LoadingContainer'
import Message from '../../../Components/Message'
import {
    FiArrowLeft,
    FiMail,
    FiRefreshCw,
    FiShield,
} from 'react-icons/fi'

const Page = () => {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [seconds, setSeconds] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        email: "",
        code: "",
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedEmail = localStorage.getItem('email');

            if (storedEmail) {
                try {
                    setForm(f => ({
                        ...f,
                        email: JSON.parse(storedEmail)
                    }));
                } catch {
                    setForm(f => ({
                        ...f,
                        email: storedEmail
                    }));
                }
            } else {
                router.push('/signup');
            }
        }
    }, [router]);

    useEffect(() => {
        if (seconds <= 0) {
            setCanResend(true);
            return;
        }

        const timer = setInterval(() => {
            setSeconds(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds]);

    useEffect(() => {
        if (!form.email) return;

        const checkTimer = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/a/resend_status/?email=${encodeURIComponent(form.email)}`
                );

                const data = await res.json();

                if (data?.error) {
                    setError(data.error);
                }

                if (data?.can_resend === false) {
                    setCanResend(false);
                    setSeconds(data.remaining);
                } else if (data?.can_resend === true) {
                    setCanResend(true);
                    setSeconds(0);
                }
            } catch (err) {
                console.error("Timer check failed:", err);
            }
        };

        checkTimer();
    }, [form.email]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/a/user/register/`,
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(form)
                }
            );

            const data = await res.json();

            if (res.ok && data.success) {
                localStorage.removeItem('email');
                router.push('/');
            } else {
                setError(
                    data.message ||
                    "Invalid verification code."
                );
            }
        } catch (err) {
            console.error(err);

            setError(
                "Network or server error. Please try again later."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        try {
            setLoading(true);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/a/reverifyemail/`,
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: form.email,
                    })
                }
            );

            const data = await res.json();

            if (res.ok && data.success) {
                setSeconds(data.remaining || 60);
                setCanResend(false);
            } else {
                setError(
                    data.message ||
                    "Unable to resend OTP."
                );
            }
        } catch (err) {
            console.error(err);

            setError(
                "Error resending code. Check your connection."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Message
                message={error}
                setError={setError}
            />

            <section className="min-h-screen w-full bg-[#fafafa] flex items-center justify-center px-5 py-10">
                <div className="w-full max-w-107.5">

                    {/* TOP */}
                    <button
                        type="button"
                        onClick={() => router.push('/signup')}
                        className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-black mb-5 cursor-pointer"
                    >
                        <FiArrowLeft />
                        Change email
                    </button>

                    {/* BRAND */}
                    <div className="text-center mb-7">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-4">
                            <FiShield className="text-[21px]" />
                        </div>

                        <h1 className="text-[26px] font-bold text-gray-900">
                            Verify your email
                        </h1>

                        <p className="text-[14px] text-gray-500 mt-2">
                            Enter the verification code we sent
                            to your email.
                        </p>
                    </div>

                    {/* CARD */}
                    <form
                        onSubmit={handleSubmit}
                        className="w-full bg-white border border-gray-200 rounded-2xl p-7 shadow-sm"
                    >

                        {/* EMAIL */}
                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 mb-6">
                            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                                <FiMail className="text-gray-600" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-[11px] text-gray-400">
                                    CODE SENT TO
                                </p>

                                <p className="text-[13px] font-medium text-gray-800 truncate">
                                    {form.email}
                                </p>
                            </div>
                        </div>

                        {/* OTP */}
                        <div className="mb-4">
                            <label
                                htmlFor="code"
                                className="block text-[12px] font-medium text-gray-500 mb-1.5"
                            >
                                VERIFICATION CODE
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                name="code"
                                id="code"
                                required
                                maxLength={6}
                                value={form.code}
                                onChange={(e) =>
                                    setForm(f => ({
                                        ...f,
                                        code: e.target.value.replace(
                                            /\D/g,
                                            ''
                                        )
                                    }))
                                }
                                placeholder="Enter 6-digit code"
                                className="w-full h-12 rounded-lg border border-gray-200 px-4 text-[18px] tracking-[6px] text-center font-semibold outline-none focus:border-black transition-colors"
                            />
                        </div>

                        {/* RESEND */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-[12px] text-gray-400">
                                Didn't receive the code?
                            </p>

                            <button
                                type="button"
                                disabled={!canResend || loading}
                                onClick={handleResend}
                                className={`text-[12px] font-medium flex items-center gap-1.5 ${
                                    canResend
                                        ? 'text-blue-600 hover:text-blue-700 cursor-pointer'
                                        : 'text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <FiRefreshCw />

                                {canResend
                                    ? 'Resend code'
                                    : `Resend in ${seconds}s`}
                            </button>
                        </div>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-lg bg-black text-white text-[14px] font-medium hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <LoadingContainer />
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* FOOTER */}
                    <p className="text-center text-[11px] text-gray-400 mt-5">
                        Check your spam or junk folder if you
                        don't see the email.
                    </p>
                </div>
            </section>
        </>
    );
};

export default Page;