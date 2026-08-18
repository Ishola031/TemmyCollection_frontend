import React from 'react'
import Dashboard from '../../../Components/Dashboard'
import Link from "next/link";
import Image from "next/image";
import { IoMdClose } from 'react-icons/io';

const page = () => {
    return (
        <>
            {/* DASHBOARD */}
            <section className="w-full h-screen pt-22 px-10 lg:px-15 min-px-3 pb-5 max-[740px]:px-5 max-[740px]:pt-30">
                <div className="flex gap-5">
                    <Dashboard custom={'recentviewed'} display={'hidden'} />

                    <div className="w-[75%] max-[850px]:w-full">
                        <h4 className='text-[17px] py-1.5 px-2 font-semibold bg-[#eee]'>Recent Viewed</h4>
                        <div className="w-full h-auto grid grid-cols-4 gap-3 max-[850px]:grid-cols-4 max-[750px]:grid-cols-3 max-[530px]:grid-cols-2 pt-2 max-[1244px]:grid-cols-3  max-[380px]:grid-cols-1">
                            <div className="min-w-40 h-58 p-0 relative max-[740px]:min-w-[33.3%] max-[350px]:min-w-full">
                                <div className="w-full h-40">
                                    <Link href={``}>
                                        <Image src={``} width={100} height={100} alt={``} className="w-full h-full object-contain" unoptimized />
                                    </Link>
                                </div>
                                <h2 className="text-[17px] pt-2 tracking-[0.5px] line-clamp-2 overflow-hidden text-ellipsis" style={{ lineHeight: '19px' }}>Snicker</h2>
                                <div className="">
                                    <h2 className="text-[21px] font-bold flex items-center gap-1 max-[740px]:text-[18px]"><del>N</del>200,000 <span className="text-[13px] font-normal"><del>N250,000</del></span></h2>
                                </div>

                                <div className="absolute top-0 right-0 bg-amber-300 text-[12px] py-1 px-1.5">
                                    <h3>-10%</h3>
                                </div>
                            </div>
                            <div className="min-w-40 h-58 p-0 relative max-[740px]:min-w-[33.3%] max-[350px]:min-w-full">
                                <div className="w-full h-40">
                                    <Link href={``}>
                                        <Image src={``} width={100} height={100} alt={``} className="w-full h-full object-contain" unoptimized />
                                    </Link>
                                </div>
                                <h2 className="text-[17px] pt-2 tracking-[0.5px] line-clamp-2 overflow-hidden text-ellipsis" style={{ lineHeight: '19px' }}>Snicker</h2>
                                <div className="">
                                    <h2 className="text-[21px] font-bold flex items-center gap-1 max-[740px]:text-[18px]"><del>N</del>200,000 <span className="text-[13px] font-normal"><del>N250,000</del></span></h2>
                                </div>

                                <div className="absolute top-0 right-0 bg-amber-300 text-[12px] py-1 px-1.5">
                                    <h3>-10%</h3>
                                </div>
                            </div>
                            <div className="min-w-40 h-58 p-0 relative max-[740px]:min-w-[33.3%] max-[350px]:min-w-full">
                                <div className="w-full h-40">
                                    <Link href={``}>
                                        <Image src={``} width={100} height={100} alt={``} className="w-full h-full object-contain" unoptimized />
                                    </Link>
                                </div>
                                <h2 className="text-[17px] pt-2 tracking-[0.5px] line-clamp-2 overflow-hidden text-ellipsis" style={{ lineHeight: '19px' }}>Snicker</h2>
                                <div className="">
                                    <h2 className="text-[21px] font-bold flex items-center gap-1 max-[740px]:text-[18px]"><del>N</del>200,000 <span className="text-[13px] font-normal"><del>N250,000</del></span></h2>
                                </div>

                                <div className="absolute top-0 right-0 bg-amber-300 text-[12px] py-1 px-1.5">
                                    <h3>-10%</h3>
                                </div>
                            </div>
                            <div className="min-w-40 h-58 p-0 relative max-[740px]:min-w-[33.3%] max-[350px]:min-w-full">
                                <div className="w-full h-40">
                                    <Link href={``}>
                                        <Image src={``} width={100} height={100} alt={``} className="w-full h-full object-contain" unoptimized />
                                    </Link>
                                </div>
                                <h2 className="text-[17px] pt-2 tracking-[0.5px] line-clamp-2 overflow-hidden text-ellipsis" style={{ lineHeight: '19px' }}>Snicker</h2>
                                <div className="">
                                    <h2 className="text-[21px] font-bold flex items-center gap-1 max-[740px]:text-[18px]"><del>N</del>200,000 <span className="text-[13px] font-normal"><del>N250,000</del></span></h2>
                                </div>

                                <div className="absolute top-0 right-0 bg-amber-300 text-[12px] py-1 px-1.5">
                                    <h3>-10%</h3>
                                </div>
                            </div>
                            <div className="min-w-40 h-58 p-0 relative max-[740px]:min-w-[33.3%] max-[350px]:min-w-full">
                                <div className="w-full h-40">
                                    <Link href={``}>
                                        <Image src={``} width={100} height={100} alt={``} className="w-full h-full object-contain" unoptimized />
                                    </Link>
                                </div>
                                <h2 className="text-[17px] pt-2 tracking-[0.5px] line-clamp-2 overflow-hidden text-ellipsis" style={{ lineHeight: '19px' }}>Snicker</h2>
                                <div className="">
                                    <h2 className="text-[21px] font-bold flex items-center gap-1 max-[740px]:text-[18px]"><del>N</del>200,000 <span className="text-[13px] font-normal"><del>N250,000</del></span></h2>
                                </div>

                                <div className="absolute top-0 right-0 bg-amber-300 text-[12px] py-1 px-1.5">
                                    <h3>-10%</h3>
                                </div>
                            </div>
                            <div className="min-w-40 h-58 p-0 relative max-[740px]:min-w-[33.3%] max-[350px]:min-w-full">
                                <div className="w-full h-40">
                                    <Link href={``}>
                                        <Image src={``} width={100} height={100} alt={``} className="w-full h-full object-contain" unoptimized />
                                    </Link>
                                </div>
                                <h2 className="text-[17px] pt-2 tracking-[0.5px] line-clamp-2 overflow-hidden text-ellipsis" style={{ lineHeight: '19px' }}>Snicker</h2>
                                <div className="">
                                    <h2 className="text-[21px] font-bold flex items-center gap-1 max-[740px]:text-[18px]"><del>N</del>200,000 <span className="text-[13px] font-normal"><del>N250,000</del></span></h2>
                                </div>

                                <div className="absolute top-0 right-0 bg-amber-300 text-[12px] py-1 px-1.5">
                                    <h3>-10%</h3>
                                </div>
                            </div>
                            <div className="min-w-40 h-58 p-0 relative max-[740px]:min-w-[33.3%] max-[350px]:min-w-full">
                                <div className="w-full h-40">
                                    <Link href={``}>
                                        <Image src={``} width={100} height={100} alt={``} className="w-full h-full object-contain" unoptimized />
                                    </Link>
                                </div>
                                <h2 className="text-[17px] pt-2 tracking-[0.5px] line-clamp-2 overflow-hidden text-ellipsis" style={{ lineHeight: '19px' }}>Snicker</h2>
                                <div className="">
                                    <h2 className="text-[21px] font-bold flex items-center gap-1 max-[740px]:text-[18px]"><del>N</del>200,000 <span className="text-[13px] font-normal"><del>N250,000</del></span></h2>
                                </div>

                                <div className="absolute top-0 right-0 bg-amber-300 text-[12px] py-1 px-1.5">
                                    <h3>-10%</h3>
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
