'use client'
import React from 'react'
import { useContext } from "react";
import { AuthContext } from "../IsAuth";

const Hero = () => {
    const { isAuthenticated, isLoading, logout } = useContext(AuthContext)
    return (
        <section className="w-full h-130 flex pt-38 py-4 px-10 lg:px-15 min-px-3 max-[740px]:px-5">
            <div className="w-[50%] h-full flex flex-col items-start justify-center max-[860px]:w-full">
                {isAuthenticated ? (
                    <h4 className="mb-1 text-[20px] text-[#333]">Welcome, <span className="text-blue-600"></span></h4>
                ) : (
                    <h4 className="mb-1 text-[20px] text-[#333]">Temmy<span className="text-blue-600"> Collection</span></h4>
                )}
                <h2 className="text-[5rem] font-semibold mb-5 text-[#333] leading-16.5">Building <br />a <span className="text-blue-600">better</span> you</h2>
                <p className="text-4.5 mb-2.5 text-[#333]">Anyone can beat you but no one can beat your outfit as long as you wear Temmy Outfits.</p>
            </div>
        </section>
    )
}

export default Hero
