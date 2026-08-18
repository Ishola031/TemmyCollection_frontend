import React from 'react'
import Link from "next/link";
import Dashboard from '../../Components/Dashboard';

const page = () => {
    return (
        <>
            {/* DASHBOARD */}
            <section className="w-full h-screen pt-22 px-10 lg:px-15 min-px-3 pb-5 max-[740px]:px-5 max-[740px]:pt-30">
                <div className="flex gap-5">
                    <Dashboard custom={'dashboard'} display={''} />

                    <div className="w-[70%] max-[850px]:hidden">
                        {/* <h4 className='text-[20px] p-3 font-semibold border-b border-[#333]'>Account Overview</h4> */}

                    </div>

                </div>
            </section>
        </>
    )
}

export default page