import React from 'react'
import Dashboard from '../../../Components/Dashboard'
import Link from "next/link";

const page = () => {
    return (
        <>
            {/* DASHBOARD */}
            <section className="w-full h-screen pt-22 px-10 lg:px-15 min-px-3 pb-5 max-[740px]:px-5 max-[740px]:pt-30">
                <div className="flex gap-5">
                    <Dashboard custom={'inbox'} display={'hidden'} />

                    <div className="w-[70%] max-[850px]:w-full">
                        <div className='w-full h-auto rounded-md border-2 border-[#eee] px-4 py-3'>
                            <h4 className='text-[20px] pb-2 font-semibold'>Messages</h4>

                            <div className='w-full h-full'>
                                {/* HEADER */}
                                {/* <div className='w-full h-full flex border-b border-[#eee] py-2'>
                                    <p className='w-[80%] px-2 text-[17px] line-clamp-1 overflow-hidden text-ellipsis'>Order Number</p>
                                    <p className='w-[20%] px-2 text-[17px]'>Status</p>
                                </div> */}
                                {/* BODY */}
                                <div className='w-full h-full flex border-b border-[#eee] py-2 cursor-pointer hover:bg-[#eee]'>
                                    <p className='w-[80%] px-2 text-[16px] line-clamp-1 overflow-hidden text-ellipsis font-medium'>987475756565656565656</p>
                                    {/* <p className='w-[20%] px-2 text-[16px] line-clamp-1 overflow-hidden text-ellipsis font-medium'>Paid</p> */}
                                </div>

                                <div className='w-full h-full flex py-2 cursor-pointer hover:bg-[#eee]'>
                                    <p className='w-[80%] px-2 text-[16px] line-clamp-1 overflow-hidden text-ellipsis font-medium'>987475756565656565656</p>
                                    {/* <p className='w-[20%] px-2 text-[16px] line-clamp-1 overflow-hidden text-ellipsis font-medium'>Paid</p> */}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </>
    )
}

export default page