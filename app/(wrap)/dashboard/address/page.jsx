'use client';
import React, { useContext } from 'react'
import Dashboard from '../../../Components/Dashboard'
import Link from "next/link";
import Image from "next/image";
import { IoMdClose } from 'react-icons/io';
import { useAddress } from '../../../hook/useAddress';
import { AuthContext } from '../../../Components/IsAuth';

const page = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const { data: addresses, isLoading } = useAddress(isAuthenticated)
    console.log(addresses)
    return (
        <>
            {/* DASHBOARD */}
            <section className="w-full h-screen pt-22 px-10 lg:px-15 min-px-3 pb-5 max-[740px]:px-5 max-[740px]:pt-30">
                <div className="flex gap-5">
                    <Dashboard custom={'address'} display={'hidden'} />

                    <div className="w-[70%] max-[850px]:w-full">
                        <div className='w-full flex justify-between items-center pb-3 border-b-2 border-[#eee]'>
                            <div className=''>
                                <h4 className='font-medium text-[20px]'>Address</h4>
                                <p className=' text-[15px]'>Manage Your Address</p>
                            </div>
                            <Link href="/dashboard/address/addaddress" className='py-2 px-9 bg-blue-600 text-white text-[14px] cursor-pointer rounded-lg hover:bg-blue-700'>Add Address</Link>
                        </div>

                        {/* <form className='w-full mt-4 flex flex-col items-start'>

                        </form> */}
                        <div className='w-full flex flex-col gap-3 pt-3'>
                            {isLoading ? (<></>) : (
                                addresses?.length > 0 ? (
                                    addresses?.map(address => {
                                        return (
                                            <div key={`address_${address.id}`} className='bg-[#eee] border-2 border-[#eee] rounded-lg py-4 px-4 flex gap-3.5 justify-between'>
                                                <div className='' style={{ lineHeight: '21px' }}>
                                                    <p className='text-[15px] capitalize bg-[#aaa] w-fit px-2 py-0.5 mb-2 rounded-sm'>{address?.address_type}</p>
                                                    <h4 className='font-medium uppercase'>{address?.first_name} {address?.last_name}</h4>
                                                    <p className='text-[15px]'>{`${address?.address_line_1} ${address?.city} ${address?.state?.name} State ${address?.country}`}</p>
                                                    <p className='text-[15px]'>{address?.phone1} {address?.phone2 && (`, ${address?.phone2}`)}</p>

                                                </div>
                                                <div>
                                                    <Link href={`/checkout/billingaddress?address=${address?.id}`} className='font-medium text-blue-500'>EDIT</Link>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (<></>)
                            )}

                        </div>
                    </div>

                </div>
            </section>
        </>
    )
}

export default page
