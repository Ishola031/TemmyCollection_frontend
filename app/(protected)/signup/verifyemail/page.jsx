'use client'
import { useRouter } from 'next/navigation'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../Components/IsAuth'
import LoadingContainer from '../../../Components/LoadingContainer'
import Message from '../../../Components/Message'

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

    // Hydrate state from localStorage safely after mount

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedEmail = localStorage.getItem('email');
            if (storedEmail) {
                try {
                    setForm(f => ({ ...f, email: JSON.parse(storedEmail) }));
                } catch {
                    setForm(f => ({ ...f, email: storedEmail }));
                }
            } else {
                router.push('/signup');
            }
        }
    }, [router]);

    // Timer countdown loop
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

    // Check resend status once email is populated
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/a/user/register/`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (res.ok && data.success) {
                localStorage.removeItem('email');
                router.push('/');
            } else {
                setError(data.message || "Invalid verification code.");
            }
        } catch (err) {
            console.error(err);
            setError("Network or server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        try {
            setLoading(true);
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/a/reverifyemail/`, {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json',
                },
                body: JSON.stringify({
                    email: form.email,
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSeconds(data.remaining || 60);
                setCanResend(false);
            } else {
                setError(data.message || "Unable to resend OTP.");
            }
        } catch (err) {
            console.error(err);
            setError("Error resending code. Check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Message message={error} setError={setError} />
            <section className="w-full h-screen pt-18 px-17.5 pb-5 max-[740px]:px-5 flex justify-center items-center">
                <form onSubmit={handleSubmit} className="w-auto h-auto p-10 bg-white rounded-xl">
                    <h2 className="text-[#333] text-center text-[20px] pb-1">Sign Up</h2>
                    <p className='w-85 text-[15px] text-[#555] mb-2'>
                        To verify your email, we've sent a One Time Password (OTP) to <span className="font-semibold text-black">{form.email}</span>
                    </p>
                    <p
                        className='text-blue-500 pb-2 text-center cursor-pointer text-sm hover:underline'
                        onClick={() => router.push("/signup")}
                    >
                        Change email
                    </p>

                    <div className="relative w-85 h-10 mt-2.5 rounded-xl bg-transparent flex border border-[#333] mb-1">
                        <input
                            type="number"
                            name="code"
                            id="code"
                            required
                            value={form.code}
                            className="peer w-full h-full border-0 outline-0 px-2.5 text-[#333] z-9"
                            onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))}
                        />
                        <label htmlFor='code' className="absolute top-2 left-2 text-[#333] text-[0.9rem] peer-focus:-top-4.5 peer-valid:-top-4.5 transition-all duration-500 peer-focus:text-[0.8rem] peer-valid:text-[0.8rem]">Code</label>
                    </div>

                    <p
                        className={`text-[14px] mb-4 ${canResend ? 'cursor-pointer text-blue-600 hover:underline' : 'text-gray-500 cursor-not-allowed'}`}
                        onClick={handleResend}
                    >
                        {canResend ? `Resend Code` : `Resend code in ${seconds}s`}
                    </p>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-[#333] text-white text-[15px] cursor-pointer hover:bg-black flex justify-center items-center rounded-lg"
                    >
                        {loading ? <LoadingContainer /> : 'Create Account'}
                    </button>
                </form>
            </section>
        </>
    );
};

export default Page;