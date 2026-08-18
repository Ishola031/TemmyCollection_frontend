"use client";
import React, { useContext, useEffect, useState } from 'react'
import Dashboard from '../../../Components/Dashboard'
import Link from "next/link";
import Image from "next/image";
import { IoMdClose } from 'react-icons/io';
import { useUserDetail } from '../../../hook/useUserDetails';
import { AuthContext } from '../../../Components/IsAuth';

const page = () => {
    const [profile, setProfile] = useState({
        "email": "",
        "userName": "",
        "firstName": "",
        "lastName": "",
        "phoneNumber": "",

    });
    const [editProfile, setEditProfile] = useState(false)
    const { isAuthenticated } = useContext(AuthContext);
    const { data } = useUserDetail(isAuthenticated);
    useEffect(() => {
        setProfile(vl => ({ "email": data?.email, "userName": data?.username, "firstName": data?.first_name, "lastName": data?.last_name, "phoneNumber": data?.phone_number }))
    }, [data])
    return (
        <>
            {/* DASHBOARD */}
            <section className="w-full h-screen pt-22 px-10 lg:px-15 min-px-3 pb-5 max-[740px]:px-5 max-[740px]:pt-30">
                <div className="flex gap-5">
                    <Dashboard custom={'profile'} display={'hidden'} />

                    <div className="w-[70%] max-[850px]:w-full">
                        <div className='w-full flex justify-between items-center pb-3 border-b-2 border-[#eee]'>
                            <div className=''>
                                <h4 className='font-medium text-[20px]'>My Profile</h4>
                                <p className=' text-[15px]'>All your accounts information in one place</p>
                            </div>
                            <Link href="/dashboard/profile/changepassword" className='py-2 px-4 bg-blue-600 text-white text-[14px] cursor-pointer rounded-lg hover:bg-blue-700'>Change Password</Link>
                        </div>

                        <form className='w-full mt-4 flex flex-col items-start'>
                            <div className='w-full flex flex-wrap gap-5'>
                                <div className='flex-1 min-w-60 h-11 border-2 border-[#eee] relative rounded-lg'>
                                    <input type="text" name='email' id="email" required className='peer w-full h-full text-[14px] px-2 border-0 outline-0 rounded-lg' value={profile.email} disabled />
                                    <label htmlFor="email" className='absolute left-0 -top-3 text-[12px] px-2 bg-white 
                                     pointer-events-none
                                '>EMAIL</label>
                                </div>
                                <div className='flex-1 min-w-60 h-11 border-2 border-[#eee] relative rounded-lg'>
                                    <input type="text" name='userName' id="userName" required className='peer w-full h-full text-[14px] px-2 border-0 outline-0 rounded-lg' value={profile.userName} disabled />
                                    <label htmlFor="userName" className='absolute left-0 -top-3 text-[12px] px-2 bg-white 
                                        pointer-events-none
                                '>USERNAME</label>
                                </div>
                                <div className='flex-1 min-w-60 h-11 border-2 border-[#eee] relative rounded-lg'>
                                    <input type="text" name='firstName' id="firstName" required className='peer w-full h-full text-[14px] px-2 border-0 outline-0 rounded-lg' value={profile.firstName} onChange={(e) => setProfile(vl => ({ ...vl, "firstName": e.target.value }))} disabled={!editProfile} />
                                    <label htmlFor="firstName" className={`absolute left-0 ${editProfile ? ('top-2.5') : ('-top-3')} text-[14px] px-2 bg-white 
                                        peer-focus:-top-3 peer-valid:-top-3 transition-all duration-500
                                        peer-focus:text-[12px] peer-valid:text-[12px]
                                        peer-focus:bg-white  peer-valid:bg-white pointer-events-none`}>FIRST NAME</label>
                                </div>
                                <div className='flex-1 min-w-60 h-11 border-2 border-[#eee] relative rounded-lg'>
                                    <input type="text" name='lastName' id="lastName" required className='peer w-full h-full text-[14px] px-2 border-0 outline-0 rounded-lg' value={profile.lastName} onChange={(e) => setProfile(vl => ({ ...vl, "lastName": e.target.value }))} disabled={!editProfile} />
                                    <label htmlFor="lastName" className={`absolute left-0 ${editProfile ? ('top-2.5') : ('-top-3')} text-[14px] px-2 bg-white 
                                        peer-focus:-top-3 peer-valid:-top-3 transition-all duration-500
                                        peer-focus:text-[12px] peer-valid:text-[12px]
                                        peer-focus:bg-white  peer-valid:bg-white pointer-events-none`}>LAST NAME</label>
                                </div>
                                <div className='flex-1 min-w-60 h-11 border-2 border-[#eee] relative rounded-lg'>
                                    <input type="text" name='phoneNumber' id="phoneNumber" required className='peer w-full h-full text-[14px] px-2 border-0 outline-0 rounded-lg' value={profile.phoneNumber} onChange={(e) => setProfile(vl => ({ ...vl, "phoneNumber": e.target.value }))} disabled={!editProfile} />
                                    <label htmlFor="phoneNumber" className={`absolute left-0 ${editProfile ? ('top-2.5') : ('-top-3')} text-[14px] px-2 bg-white 
                                        peer-focus:-top-3 peer-valid:-top-3 transition-all duration-500
                                        peer-focus:text-[12px] peer-valid:text-[12px]
                                        peer-focus:bg-white  peer-valid:bg-white pointer-events-none`}>PHONE NUMBER</label>
                                </div>
                            </div>

                            {editProfile ? (
                                <button type='submit' className='w-60 px-5 py-2 mt-2 text-white text-[15px] rounded-lg bg-[#333] cursor-pointer'>Update Profile</button>
                            ) : (
                                <div className='w-60 px-5 py-2 mt-2 text-white text-[15px] rounded-lg bg-[#333] cursor-pointer text-center' onClick={() => setEditProfile(true)}>Edit Profile</div>
                            )}
                        </form>
                    </div>

                </div>
            </section>
        </>
    )
}

export default page
