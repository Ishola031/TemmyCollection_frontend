'use client'
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useEffect, useState, Suspense } from 'react'
import axios from 'axios'
import { AuthContext } from '../../Components/IsAuth'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../api/token';
import api from '../../api/api';
import Message from '../../Components/Message';
import LoadingContainer from '../../Components/LoadingContainer'

// 1. Core Sign-In Component using useSearchParams
const SignInContent = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter();
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const searchparams = useSearchParams()
    const next = searchparams.get('next')

    const handlesubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true)
            const response = await axios.post(
                'http://localhost:8000/api/a/token/', {
                email, password
            }, {
                withCredentials: true,
            }
            );
            setError(null)
            const cart_id = localStorage.getItem('cart_id')
            if (cart_id) {
                const merge = await api.post('http://localhost:8000/api/o/mergecart/', { "cart_id": cart_id })
                localStorage.removeItem('cart_id');
            }

            // Fallback to '/' if 'next' parameter doesn't exist
            router.push(next || '/')
            return response.data.success
        } catch (error) {
            console.error(error)
            if (error.response) {
                if (error.response.status === 401) {
                    setError("Email or Password is incorrect")
                } else {
                    setError("Server Error, Please try again later.")
                }
            } else if (error.request) {
                // No response received
                console.log("Network error. Is Django running?");
                setError("Network error, Please try again later")
            } else {
                console.log("Unexpected error:", error.message);
                setError("Unexpected error, Please try again later")
            }
        } finally {
            setLoading(false)
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8000/accounts/google/login'
    };

    return (
        <>
            <Message message={error} setError={setError} />
            <section className="w-full h-screen pt-18 px-17.5 pb-5 max-[740px]:px-5 flex justify-center items-center">
                <form onSubmit={handlesubmit} className="w-auto h-auto p-10 bg-white rounded-xl ">
                    <h2 className="text-[#333] text-center text-[15px] pb-2">
                        Looks like you already have an account
                    </h2>

                    <p
                        className='text-blue-500 pb-2 text-center cursor-pointer'
                        onClick={() => router.push('/signup')}
                    >
                        Change email
                    </p>

                    {/* Email */}
                    <div className="relative w-85 h-10 rounded-xl bg-transparent flex border border-[#333] mb-5">
                        <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="peer w-full h-full border-0 outline-0 px-2.5 text-[#333] z-9 rounded-xl"
                        />

                        <label
                            htmlFor='email'
                            className="absolute top-2 left-2 text-[#333] text-[0.9rem]
                                peer-focus:-top-4.5 peer-valid:-top-4.5
                                transition-all duration-500
                                peer-focus:text-[0.8rem] peer-valid:text-[0.8rem]"
                        >
                            Email
                        </label>
                    </div>

                    {/* Password */}
                    <div className="relative w-85 h-10 mt-2.5 rounded-xl bg-transparent flex border border-[#333] mb-5">
                        <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="peer w-full h-full border-0 outline-0 px-2.5 text-[#333] z-9 rounded-xl"
                        />

                        <label
                            htmlFor='password'
                            className="absolute top-2 left-2 text-[#333] text-[0.9rem]
                                peer-focus:-top-4.5 peer-valid:-top-4.5
                                transition-all duration-500
                                peer-focus:text-[0.8rem] peer-valid:text-[0.8rem]"
                        >
                            Password
                        </label>
                    </div>

                    <button className="w-full mb-1.5 py-2.5 bg-[#333] text-white text-[15px] cursor-pointer hover:bg-black flex justify-center items-center">
                        {loading ? (<LoadingContainer />) : 'Sign In'}
                    </button>

                    <button
                        type='button'
                        className="w-full py-2.5 bg-[#333] text-white text-[15px] cursor-pointer hover:bg-black"
                        onClick={() => handleGoogleLogin()}
                    >
                        Continue with Google
                    </button>
                </form>
            </section>
        </>
    )
}

// 2. Export wrapped in Suspense boundary
const Page = () => {
    return (
        <Suspense fallback={<LoadingContainer />}>
            <SignInContent />
        </Suspense>
    )
}

export default Page