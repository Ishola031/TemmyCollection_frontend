"use client";
import React, { useState } from 'react'
import Dashboard from '../../../../Components/Dashboard'
import Link from "next/link";
import Image from "next/image";
import { IoMdClose } from 'react-icons/io';

const page = () => {
    const [profile, setProfile] = useState({
        "oldPassword": "",
        "newPassword": "",
        "confirmPassword": "",
    });
    return (
        <>
            {/* DASHBOARD */}
            <section className="w-full h-screen pt-22 px-10 lg:px-15 min-px-3 pb-5 max-[740px]:px-5 max-[740px]:pt-30">
                <div className="flex gap-5">
                    <Dashboard custom={'profile'} display={'hidden'} />

                    <div className="w-[70%] max-[850px]:w-full">
                        <div className='w-full flex justify-between items-center pb-3 border-b-2 border-[#eee]'>
                            <div className=''>
                                <h4 className='font-medium text-[20px]'>Change Password</h4>
                                <p className=' text-[15px]'>Update Your Password</p>
                            </div>
                        </div>

                        <form className='w-full mt-4 flex flex-col items-start'>
                            <div className='w-full flex flex-wrap gap-5'>
                                <div className='flex-1 min-w-60 h-11 border-2 border-[#eee] relative rounded-lg'>
                                    <input type="text" name='oldPassword' id="oldPassword" required className='peer w-full h-full text-[14px] px-2 border-0 outline-0 rounded-lg' value={profile.oldPassword} onChange={(e) => setProfile(vl => ({ ...vl, "oldPassword": e.target.value }))} />
                                    <label htmlFor="oldPassword" className='absolute left-0 top-2.5 text-[14px] px-2 bg-white 
                                        peer-focus:-top-3 peer-valid:-top-3 transition-all duration-500
                                        peer-focus:text-[12px] peer-valid:text-[12px]
                                        peer-focus:bg-white  peer-valid:bg-white pointer-events-none
                                '>OLd Password</label>
                                </div>
                                <div className='flex-1 min-w-60 h-11 border-2 border-[#eee] relative rounded-lg'>
                                    <input type="text" name='newPassword' id="newPassword" required className='peer w-full h-full text-[14px] px-2 border-0 outline-0 rounded-lg' value={profile.newPassword} onChange={(e) => setProfile(vl => ({ ...vl, "newPassword": e.target.value }))} />
                                    <label htmlFor="newPassword" className='absolute left-0 top-2.5 text-[14px] px-2 bg-white 
                                        peer-focus:-top-3 peer-valid:-top-3 transition-all duration-500
                                        peer-focus:text-[12px] peer-valid:text-[12px]
                                        peer-focus:bg-white  peer-valid:bg-white pointer-events-none
                                '>New Password</label>
                                </div>
                                <div className='flex-1 min-w-60 h-11 border-2 border-[#eee] relative rounded-lg'>
                                    <input type="text" name='confirmPassword' id="confirmPassword" required className='peer w-full h-full text-[14px] px-2 border-0 outline-0 rounded-lg' value={profile.confirmPassword} onChange={(e) => setProfile(vl => ({ ...vl, "confirmPassword": e.target.value }))} />
                                    <label htmlFor="confirmPassword" className='absolute left-0 top-2.5 text-[14px] px-2 bg-white 
                                        peer-focus:-top-3 peer-valid:-top-3 transition-all duration-500
                                        peer-focus:text-[12px] peer-valid:text-[12px]
                                        peer-focus:bg-white  peer-valid:bg-white pointer-events-none
                                '>Confirm Password</label>
                                </div>
                            </div>
                            <button className='w-60 px-5 py-2 mt-2 text-white text-[15px] rounded-lg bg-[#333] cursor-pointer'>Change Password</button>
                        </form>
                    </div>

                </div>
            </section>
        </>
    )
}

export default page
