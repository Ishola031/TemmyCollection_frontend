'use client'

import React, { useContext } from 'react'
import Link from 'next/link'
import { FiShoppingBag } from 'react-icons/fi'
import { AuthContext } from "../IsAuth";
import { useUserDetail } from '../../hook/useUserDetails'

const HeroSkeleton = () => {
    return (
        <section className="w-full min-h-150 flex items-center px-10 lg:px-15 py-16 max-[740px]:px-5 max-[740px]:py-10">
            <div className="w-full flex items-center justify-between gap-10 animate-pulse">

                {/* LEFT */}
                <div className="w-[55%] max-[860px]:w-full">

                    {/* GREETING */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                        <div className="h-3 w-44 bg-gray-200 rounded"></div>
                    </div>

                    {/* TITLE */}
                    <div className="space-y-4">
                        <div className="h-16 w-[85%] bg-gray-200 rounded-lg max-[600px]:h-12"></div>
                        <div className="h-16 w-[65%] bg-gray-200 rounded-lg max-[600px]:h-12"></div>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="mt-7 space-y-3 max-w-142.5">
                        <div className="h-3 w-full bg-gray-200 rounded"></div>
                        <div className="h-3 w-[90%] bg-gray-200 rounded"></div>
                        <div className="h-3 w-[65%] bg-gray-200 rounded"></div>
                    </div>

                    {/* BUTTON */}
                    <div className="mt-8">
                        <div className="h-12 w-40 bg-gray-200 rounded-lg"></div>
                    </div>

                    {/* STATS */}
                    <div className="flex items-center gap-8 mt-10">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="space-y-2">
                                <div className="h-5 w-20 bg-gray-200 rounded"></div>
                                <div className="h-3 w-24 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* RIGHT DECORATION */}
                <div className="w-[40%] h-112.5 relative max-[860px]:hidden">
                    <div className="absolute right-0 top-5 w-82.5 h-82.5 rounded-full bg-gray-100"></div>
                    <div className="absolute right-8 top-14 w-70 h-95 rounded-[40px] bg-gray-200 rotate-3"></div>
                    <div className="absolute right-16 top-8 w-70 h-95 rounded-[40px] bg-gray-200 -rotate-6"></div>
                </div>

            </div>
        </section>
    );
};


const Hero = () => {
    const { isAuthenticated } = useContext(AuthContext)
    const { data, isLoading } = useUserDetail(isAuthenticated);

    if (isLoading && isAuthenticated) {
        return (
            <>
                <div className='py-5'></div>
                <HeroSkeleton />
            </>
        );
    }

    return (
        <>
            <div className='py-5'></div>

            <section className="w-full min-h-150 flex items-center px-10 lg:px-15 py-16 max-[740px]:px-5 max-[740px]:py-10">
                <div className="w-full flex items-center justify-between gap-10">

                    {/* LEFT */}
                    <div className="w-[55%] max-[860px]:w-full">

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

                        <h1 className="text-[5rem] font-bold tracking-[-3px] leading-[0.98] text-gray-900 max-[1000px]:text-[4rem] max-[600px]:text-[3.2rem] max-[400px]:text-[2.7rem]">
                            Building
                            <br />
                            a{" "}
                            <span className="text-blue-600">better</span>{" "}
                            you.
                        </h1>

                        <p className="max-w-142.5 text-[16px] leading-7 text-gray-500 mt-6 mb-7">
                            Anyone can beat you, but no one can beat
                            your outfit when you wear Temmy Outfits.
                            Discover styles made to make you stand out.
                        </p>

                        <div className="flex items-center gap-3 flex-wrap">
                            <Link
                                href="/catalog"
                                className="px-6 py-3 rounded-lg border border-gray-200 text-gray-700 text-[14px] font-medium hover:bg-gray-50 transition-all"
                            >
                                Explore Products
                            </Link>
                        </div>

                        <div className="flex items-center gap-8 mt-9">
                            <div>
                                <h3 className="text-[20px] font-bold text-gray-900">Quality</h3>
                                <p className="text-[11px] text-gray-400">Carefully selected</p>
                            </div>

                            <div className="w-px h-8 bg-gray-200"></div>

                            <div>
                                <h3 className="text-[20px] font-bold text-gray-900">Style</h3>
                                <p className="text-[11px] text-gray-400">Made to stand out</p>
                            </div>

                            <div className="w-px h-8 bg-gray-200"></div>

                            <div>
                                <h3 className="text-[20px] font-bold text-gray-900">Comfort</h3>
                                <p className="text-[11px] text-gray-400">Made for you</p>
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