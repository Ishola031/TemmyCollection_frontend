'use client'
import { useRouter } from 'next/navigation'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../Components/IsAuth'
import LoadingContainer from '../../../Components/LoadingContainer'
import Message from '../../../Components/Message'

const Page = () => {
    const [loading, setLoading] = useState(false)
    const router = useRouter();
    const [error, setError] = useState(null)

    const [form, setForm] = useState({
        "email": "",
        "first_Name": "",
        "last_Name": "",
        "password": "",
        "password2": "",
        "code": "",
    })

    // Safely load email from localStorage on mount and handle redirect
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedEmail = localStorage.getItem('email');
            if (storedEmail) {
                try {
                    const parsedEmail = JSON.parse(storedEmail);
                    setForm(f => ({ ...f, email: parsedEmail }));
                } catch {
                    setForm(f => ({ ...f, email: storedEmail }));
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
                `${process.env.NEXT_PUBLIC_API_URL}/api/a/verifyemail/`, {
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
            }

        } catch (error) {
            console.error(error)
            if (error.response) {
                setError("Server Error, Please try again later.")
            } else if (error.request) {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.password2) {
            alert("Password and confirm password must be the same")
            return
        }
        sendEmailCode();
    };

    return (
        <>
            {/* SIGN UP */}
            <Message message={error} setError={setError} />
            <section className="w-full h-screen pt-18 px-17.5 pb-5 max-[740px]:px-5 flex justify-center items-center">
                <form onSubmit={handleSubmit} className="w-auto h-auto p-10 bg-white rounded-xl ">
                    <h2 className="text-[#333] text-center text-[20px] pb-1">Sign Up</h2>
                    <p
                        className='text-blue-500 pb-1 text-center cursor-pointer'
                        onClick={() => router.push("/signup")}
                    >
                        Change email
                    </p>
                    <div className="relative w-85 h-10 mt-2.5 rounded-xl bg-transparent flex border border-[#333] mb-5">
                        <input type="email" name="email" id="email" required value={form.email} className="peer w-full h-full border-0 outline-0 px-2.5 text-[#333] z-9" disabled />
                    </div>
                    <div className="relative w-85 h-10 mt-2.5 rounded-xl bg-transparent flex border border-[#333] mb-5">
                        <input type="text" name="firstName" id="firstName" required value={form.first_Name} className="peer w-full h-full border-0 outline-0 px-2.5 text-[#333] z-9" onChange={(e) => setForm(f => ({ ...f, "first_Name": e.target.value }))} />
                        <label htmlFor='firstName' className={`absolute top-2 left-2 text-[#333] text-[0.9rem] peer-focus:-top-4.5 peer-valid:-top-4.5 transition-all duration-500 peer-focus:text-[0.8rem] peer-valid:text-[0.8rem]`}>First Name</label>
                    </div>
                    <div className="relative w-85 h-10 mt-2.5 rounded-xl bg-transparent flex border border-[#333] mb-5">
                        <input type="text" name="lastName" id="lastName" required value={form.last_Name} className="peer w-full h-full border-0 outline-0 px-2.5 text-[#333] z-9" onChange={(e) => setForm(f => ({ ...f, "last_Name": e.target.value }))} />
                        <label htmlFor='lastName' className={`absolute top-2 left-2 text-[#333] text-[0.9rem] peer-focus:-top-4.5 peer-valid:-top-4.5 transition-all duration-500 peer-focus:text-[0.8rem] peer-valid:text-[0.8rem]`}>Last Name</label>
                    </div>

                    <div className="relative w-85 h-10 mt-2.5 rounded-xl bg-transparent flex border border-[#333] mb-5">
                        <input type="password" name="password" id="password" required value={form.password} className="peer w-full h-full border-0 outline-0 px-2.5 text-[#333] z-9" onChange={(e) => setForm(f => ({ ...f, "password": e.target.value }))} />
                        <label htmlFor='password' className={`absolute top-2 left-2 text-[#333] text-[0.9rem] peer-focus:-top-4.5 peer-valid:-top-4.5 transition-all duration-500 peer-focus:text-[0.8rem] peer-valid:text-[0.8rem]`}>Password</label>
                    </div>

                    <div className="relative w-85 h-10 mt-2.5 rounded-xl bg-transparent flex border border-[#333] mb-5">
                        <input type="password" name="password2" id="password2" required value={form.password2} className="peer w-full h-full border-0 outline-0 px-2.5 text-[#333] z-9" onChange={(e) => setForm(f => ({ ...f, "password2": e.target.value }))} />
                        <label htmlFor='password2' className={`absolute top-2 left-2 text-[#333] text-[0.9rem] peer-focus:-top-4.5 peer-valid:-top-4.5 transition-all duration-500 peer-focus:text-[0.8rem] peer-valid:text-[0.8rem]`}>Confirm Password</label>
                    </div>
                    <button className="w-full py-2.5 bg-[#333] text-white text-[15px] cursor-pointer hover:bg-black flex justify-center items-center">
                        {loading ? (<LoadingContainer />) : 'Verify Email'}
                    </button>
                </form>
            </section>
        </>
    )
}

export default Page