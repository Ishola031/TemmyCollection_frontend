'use client'

import React, { useContext } from 'react'
import Link from 'next/link'
import { FiArrowRight, FiShoppingBag } from 'react-icons/fi'
import { AuthContext } from "../IsAuth";
import { useUserDetail } from '../../hook/useUserDetails'

const Hero = () => {
    const { isAuthenticated } = useContext(AuthContext)
    const { data } = useUserDetail(isAuthenticated);

    return (
        <>
            <div className='py-5'></div>
            <section className="w-full min-h-150 flex items-center px-10 lg:px-15 py-16 max-[740px]:px-5 max-[740px]:py-10">
                <div className="w-full flex items-center justify-between gap-10">

                    {/* LEFT */}
                    <div className="w-[55%] max-[860px]:w-full">

                        {/* GREETING */}
                        {isAuthenticated && data?.first_name ? (
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>

                                <p className="text-[14px] text-gray-500">
                                    Welcome back,{" "}
                                    <span className="font-semibold text-gray-900">
                                        {data.first_name}
                                    </span>
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mb-4">
                                <FiShoppingBag className="text-blue-600" />

                                <p className="text-[14px] font-medium text-gray-500">
                                    Welcome to Temmy Collection
                                </p>
                            </div>
                        )}

                        {/* TITLE */}
                        <h1 className="text-[5rem] font-bold tracking-[-3px] leading-[0.98] text-gray-900 max-[1000px]:text-[4rem] max-[600px]:text-[3.2rem] max-[400px]:text-[2.7rem]">

                            Building
                            <br />

                            a{" "}
                            <span className="text-blue-600">
                                better
                            </span>{" "}
                            you.

                        </h1>

                        {/* DESCRIPTION */}
                        <p className="max-w-142.5 text-[16px] leading-7 text-gray-500 mt-6 mb-7">
                            Anyone can beat you, but no one can beat
                            your outfit when you wear Temmy Outfits.
                            Discover styles made to make you stand out.
                        </p>

                        {/* ACTIONS */}
                        <div className="flex items-center gap-3 flex-wrap">

                            <Link
                                href="/store"
                                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-black text-white text-[14px] font-medium hover:bg-gray-800 transition-all"
                            >
                                Shop Collection
                                <FiArrowRight />
                            </Link>

                            <Link
                                href="/store"
                                className="px-6 py-3 rounded-lg border border-gray-200 text-gray-700 text-[14px] font-medium hover:bg-gray-50 transition-all"
                            >
                                Explore Products
                            </Link>

                        </div>

                        {/* SMALL STATS */}
                        <div className="flex items-center gap-8 mt-9">

                            <div>
                                <h3 className="text-[20px] font-bold text-gray-900">
                                    Quality
                                </h3>
                                <p className="text-[11px] text-gray-400">
                                    Carefully selected
                                </p>
                            </div>

                            <div className="w-px h-8 bg-gray-200"></div>

                            <div>
                                <h3 className="text-[20px] font-bold text-gray-900">
                                    Style
                                </h3>
                                <p className="text-[11px] text-gray-400">
                                    Made to stand out
                                </p>
                            </div>

                            <div className="w-px h-8 bg-gray-200"></div>

                            <div>
                                <h3 className="text-[20px] font-bold text-gray-900">
                                    Comfort
                                </h3>
                                <p className="text-[11px] text-gray-400">
                                    Made for you
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* RIGHT DECORATION */}
                    <div className="w-[40%] h-112.5 relative max-[860px]:hidden">

                        <div className="absolute right-0 top-5 w-82.5 h-82.5 rounded-full bg-blue-50"></div>

                        <div className="absolute right-8 top-14 w-70 h-95 rounded-[40px] bg-gray-100 rotate-3"></div>

                        <div className="absolute right-16 top-8 w-70 h-95 rounded-[40px] bg-blue-600 -rotate-6 flex items-center justify-center">

                            <div className="text-white text-center px-8">

                                <FiShoppingBag className="text-[55px] mx-auto mb-5" />

                                <p className="text-[13px] uppercase tracking-[4px] opacity-70">
                                    Temmy
                                </p>

                                <h3 className="text-[38px] font-bold leading-none mt-2">
                                    Collection
                                </h3>

                                <p className="text-[13px] mt-4 opacity-80">
                                    Dress better.
                                    <br />
                                    Feel better.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </section>
        </>
        
    )
}

export default Hero