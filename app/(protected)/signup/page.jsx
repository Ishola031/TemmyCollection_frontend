'use client'
import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react'
import { AuthContext } from '../../Components/IsAuth'
import LoadingContainer from '../../Components/LoadingContainer';
import Message from '../../Components/Message';

const Page = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter();
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handlesubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true)
            localStorage.setItem('email', JSON.stringify(email));

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/a/checkemail/?email=${email}`
            );

            const data = await res.json();

            if (data.registered) {
                router.push('/signin')
            }
            if (data.unregistered) {
                router.push('/signup/form');
                console.log('push')
            }
            console.log(data)

        } catch (error) {
            console.error(error);
            console.error(error)
            if (error.response) {
                setError("Server Error, Please try again later.")
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

    return (
        <>
            <Message message={error} setError={setError} />
            <section className="w-full h-screen pt-18 px-17.5 pb-5 max-[740px]:px-5 flex justify-center items-center">
                <form onSubmit={handlesubmit} className="w-auto h-auto p-10 bg-white rounded-xl ">
                    <h2 className="text-[#333] text-center text-[15px] pb-8">
                        Welcome to temmy Collection
                    </h2>

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

                    <button className="w-full mb-1.5 py-2.5 bg-[#333] text-white text-[15px] cursor-pointer hover:bg-black flex  justify-center items-center">
                        {loading ? (<LoadingContainer />) : 'Continue'}
                    </button>

                    <button
                        type='button'
                        className="w-full py-2.5 bg-[#333] text-white text-[15px] cursor-pointer hover:bg-black"
                    >
                        Continue with Google
                    </button>
                </form>
            </section>
        </>
    )
}

export default Page