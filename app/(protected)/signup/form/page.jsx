'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import LoadingContainer from '../../../Components/LoadingContainer'
import Message from '../../../Components/Message'
import {
    FiArrowLeft,
    FiCheck,
    FiEye,
    FiEyeOff,
    FiMail,
    FiShield,
} from 'react-icons/fi'

const Page = () => {
    const [loading, setLoading] = useState(false)
    const router = useRouter();
    const [error, setError] = useState(null)

    const [showPassword, setShowPassword] = useState(false)
    const [showPassword2, setShowPassword2] = useState(false)

    const [form, setForm] = useState({
        "email": "",
        "first_Name": "",
        "last_Name": "",
        "password": "",
        "password2": "",
        "code": "",
    })

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedEmail = localStorage.getItem('email');

            if (storedEmail) {
                try {
                    const parsedEmail = JSON.parse(storedEmail);

                    setForm(f => ({
                        ...f,
                        email: parsedEmail
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

    const sendEmailCode = async () => {
        try {
            setLoading(true)

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/a/verifyemail/`,
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": 'application/json',
                    },
                    body: JSON.stringify({
                        "email": form.email,
                        "first_Name": form.first_Name,
                        "last_Name": form.last_Name,
                        "password": form.password,
                        "password2": form.password2,
                        "code": form.code,
                    })
                }
            )

            const data = await res.json()

            console.log(data)

            if (data.success) {
                router.push('/signup/verifyemail')
            } else {
                setError(
                    data.message ||
                    "Unable to verify your email. Please try again."
                )
            }

        } catch (error) {
            console.error(error)

            setError(
                "Network or server error. Please try again later."
            )
        } finally {
            setLoading(false)
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.password2) {
            setError(
                "Password and confirm password must be the same"
            )
            return
        }

        sendEmailCode();
    };

    return (
        <>
            <Message
                message={error}
                setError={setError}
            />

            <section className="min-h-screen w-full bg-[#fafafa] flex items-center justify-center px-5 py-10">

                <div className="w-full max-w-115">

                    {/* BACK */}
                    <button
                        type="button"
                        onClick={() => router.push('/signup')}
                        className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-black mb-5 cursor-pointer"
                    >
                        <FiArrowLeft />
                        Change email
                    </button>

                    {/* HEADER */}
                    <div className="text-center mb-7">

                        <div className="mx-auto w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-4">
                            <FiShield className="text-[21px]" />
                        </div>

                        <h1 className="text-[26px] font-bold text-gray-900">
                            Create your account
                        </h1>

                        <p className="text-[14px] text-gray-500 mt-2">
                            Enter your details to create your
                            Temmy Collection account.
                        </p>

                    </div>

                    {/* CARD */}
                    <form
                        onSubmit={handleSubmit}
                        className="w-full bg-white border border-gray-200 rounded-2xl p-7 shadow-sm"
                    >

                        {/* EMAIL */}
                        <div className="mb-5">

                            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
                                EMAIL ADDRESS
                            </label>

                            <div className="relative">

                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    required
                                    value={form.email}
                                    disabled
                                    className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-[14px] text-gray-500 outline-none"
                                />

                            </div>

                        </div>

                        {/* NAME */}
                        <div className="grid grid-cols-2 gap-3 mb-5">

                            <div>

                                <label
                                    htmlFor="firstName"
                                    className="block text-[12px] font-medium text-gray-500 mb-1.5"
                                >
                                    FIRST NAME
                                </label>

                                <input
                                    type="text"
                                    name="firstName"
                                    id="firstName"
                                    required
                                    value={form.first_Name}
                                    onChange={(e) =>
                                        setForm(f => ({
                                            ...f,
                                            first_Name: e.target.value
                                        }))
                                    }
                                    placeholder="First name"
                                    className="w-full h-11 rounded-lg border border-gray-200 px-3 text-[14px] text-gray-800 outline-none focus:border-black transition-colors"
                                />

                            </div>

                            <div>

                                <label
                                    htmlFor="lastName"
                                    className="block text-[12px] font-medium text-gray-500 mb-1.5"
                                >
                                    LAST NAME
                                </label>

                                <input
                                    type="text"
                                    name="lastName"
                                    id="lastName"
                                    required
                                    value={form.last_Name}
                                    onChange={(e) =>
                                        setForm(f => ({
                                            ...f,
                                            last_Name: e.target.value
                                        }))
                                    }
                                    placeholder="Last name"
                                    className="w-full h-11 rounded-lg border border-gray-200 px-3 text-[14px] text-gray-800 outline-none focus:border-black transition-colors"
                                />

                            </div>

                        </div>

                        {/* PASSWORD */}
                        <div className="mb-5">

                            <label
                                htmlFor="password"
                                className="block text-[12px] font-medium text-gray-500 mb-1.5"
                            >
                                PASSWORD
                            </label>

                            <div className="relative">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    id="password"
                                    required
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm(f => ({
                                            ...f,
                                            password: e.target.value
                                        }))
                                    }
                                    placeholder="Create a password"
                                    className="w-full h-11 rounded-lg border border-gray-200 px-3 pr-11 text-[14px] text-gray-800 outline-none focus:border-black transition-colors"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                                >
                                    {showPassword ? (
                                        <FiEyeOff />
                                    ) : (
                                        <FiEye />
                                    )}
                                </button>

                            </div>

                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="mb-5">

                            <label
                                htmlFor="password2"
                                className="block text-[12px] font-medium text-gray-500 mb-1.5"
                            >
                                CONFIRM PASSWORD
                            </label>

                            <div className="relative">

                                <input
                                    type={
                                        showPassword2
                                            ? "text"
                                            : "password"
                                    }
                                    name="password2"
                                    id="password2"
                                    required
                                    value={form.password2}
                                    onChange={(e) =>
                                        setForm(f => ({
                                            ...f,
                                            password2: e.target.value
                                        }))
                                    }
                                    placeholder="Confirm your password"
                                    className={`w-full h-11 rounded-lg border px-3 pr-11 text-[14px] text-gray-800 outline-none transition-colors ${
                                        form.password2 &&
                                        form.password !== form.password2
                                            ? "border-red-400"
                                            : "border-gray-200 focus:border-black"
                                    }`}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword2(!showPassword2)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                                >
                                    {showPassword2 ? (
                                        <FiEyeOff />
                                    ) : (
                                        <FiEye />
                                    )}
                                </button>

                            </div>

                            {form.password2 &&
                                form.password !== form.password2 && (
                                    <p className="text-[11px] text-red-500 mt-1">
                                        Passwords do not match
                                    </p>
                                )}

                            {form.password2 &&
                                form.password === form.password2 && (
                                    <p className="text-[11px] text-green-600 mt-1 flex items-center gap-1">
                                        <FiCheck />
                                        Passwords match
                                    </p>
                                )}

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
                                'Continue'
                            )}
                        </button>

                    </form>

                    {/* FOOTER */}
                    <p className="text-center text-[11px] text-gray-400 mt-5">
                        Your email will be verified before your
                        account is created.
                    </p>

                </div>

            </section>
        </>
    )
}

export default Page