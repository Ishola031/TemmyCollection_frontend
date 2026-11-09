import React from 'react'
import Link from "next/link";
import Dashboard from '../../Components/Dashboard';

const page = () => {
    return (
        <>
            {/* DASHBOARD */}
            <section className="w-full h-screen mb-10 pt-22 px-10 lg:px-15 min-px-3 pb-5 max-[740px]:px-5 max-[740px]:pt-30 ">
                <div className="flex gap-5">
                    <Dashboard custom={'dashboard'} display={''} />

                    {/* <div className="w-[70%] max-[850px]:hidden">
                        <h4 className='text-[20px] p-3 font-semibold border-b border-[#333]'>Account Overview</h4>

                    </div> */}
                    <div className="w-[70%] max-[850px]:w-full">
                        <div className="mb-6">
                            <p className="text-sm font-medium text-blue-600">MY ACCOUNT</p>
                            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
                            Welcome back
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-gray-500">
                            Your personal space to keep up with Temmy Collection.
                            </p>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl bg-gray-950 p-7 text-white sm:p-10">
                            <div className="relative z-10 max-w-lg">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                                Temmy Collection
                            </p>

                            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
                                Find a look that feels like you.
                            </h2>

                            <p className="mt-4 text-sm leading-6 text-gray-300">
                                Explore carefully selected styles made to help you look good, feel
                                comfortable, and stand out.
                            </p>

                            <Link
                                href="/store"
                                className="mt-7 inline-flex items-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                                Explore the collection
                            </Link>
                            </div>

                            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-24 right-16 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-xl border border-gray-200 bg-white p-5">
                            <p className="text-sm font-semibold text-gray-900">Need help?</p>
                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Have a question about an order or your account? We’re here to help.
                            </p>
                            <Link
                                href="/contact"
                                className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Contact us
                            </Link>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-white p-5">
                            <p className="text-sm font-semibold text-gray-900">A better fit for you</p>
                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Keep your delivery details up to date for a smoother checkout.
                            </p>
                            <Link
                                href="/dashboard/address"
                                className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Manage your address
                            </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default page