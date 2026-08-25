'use client';
import React from 'react'
import Dashboard from '../../../Components/Dashboard'
import Link from "next/link";
import Image from "next/image";
import { IoMdClose } from 'react-icons/io';
import { useRecentViewed } from '../../../hook/userecentviewed';

const page = () => {
    const { data: viewedproducts, isLoading } = useRecentViewed();
    console.log(viewedproducts)
    return (
        <>
            {/* DASHBOARD */}
            <section className="w-full h-screen pt-22 px-10 lg:px-15 min-px-3 pb-5 max-[740px]:px-5 max-[740px]:pt-30">
                <div className="flex gap-5">
                    <Dashboard custom={'recentviewed'} display={'hidden'} />

                    <div className="w-[75%] max-[850px]:w-full">
                        <h4 className='text-[17px] py-1.5 px-2 font-semibold bg-[#eee]'>Recent Viewed</h4>
                        <div className="w-full h-auto grid grid-cols-4 gap-3 max-[850px]:grid-cols-4 max-[750px]:grid-cols-3 max-[530px]:grid-cols-2 pt-2 max-[1244px]:grid-cols-3  max-[380px]:grid-cols-1">
                            {isLoading ? (<></>) : (
                                viewedproducts?.length > 0 ? (
                                    viewedproducts?.map(viewedproduct => {
                                        return (
                                            <div key={`product_viewed_${viewedproduct?.id}`} className="min-w-40 h-58 p-0 relative max-[740px]:min-w-[33.3%] max-[350px]:min-w-full">
                                                <div className="w-full h-40">
                                                    <Link href={`/store/${viewedproduct?.product?.slug}`}>
                                                        <Image src={`${viewedproduct?.product?.image}`} width={100} height={100} alt={``} className="w-full h-full object-contain" unoptimized />
                                                    </Link>
                                                </div>
                                                <h2 className="text-[15px] pt-2 tracking-[0.5px] line-clamp-2 overflow-hidden text-ellipsis" style={{ lineHeight: '19px' }}>{viewedproduct?.product?.name}</h2>
                                                <div className="">
                                                    {/* <h2 className="text-[21px] font-bold flex items-center gap-1 max-[740px]:text-[18px]"><del>N</del>200,000 <span className="text-[13px] font-normal"><del>N250,000</del></span></h2> */}
                                                    {viewedproduct?.product?.discount > 0 ? (
                                                        <h2 className="text-[16px] flex items-center gap-1 font-semibold">N{(((100 - viewedproduct?.product?.discount) / 100) * viewedproduct?.product?.price).toLocaleString('en-NG')} <span className="text-[11px] font-normal"><del>N{viewedproduct?.product?.price.toLocaleString('en-NG')}</del></span></h2>
                                                    ) : (
                                                        <h2 className="text-[16px] font-semibold"><del>N</del>{viewedproduct?.product?.price?.toLocaleString('en-NG')}</h2>
                                                    )}
                                                </div>

                                                {viewedproduct?.product?.discount > 0 && (
                                                    <div className="absolute top-0 right-0 bg-amber-300 text-[12px] py-1 px-1.5">
                                                        <h3>-{viewedproduct?.product?.discount}%</h3>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                ) : (
                                    <p>You have not Viewed any Product</p>
                                )
                            )}


                        </div>
                    </div>

                </div>
            </section>
        </>
    )
}

export default page
