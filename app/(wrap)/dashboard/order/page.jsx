"use client";
import React, { useEffect, useRef, useState } from 'react'
import Dashboard from '../../../Components/Dashboard'
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import Image from "next/image";
import api from "../../../api/api"

const page = () => {
    const [orders, setOrder] = useState([]);
    const [orderDetail, setOrderDetail] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const orderDetailRef = useRef(null)

    useEffect(() => {
        const handleSidebarClickOutside = (event) => {
            if (orderDetailRef.current && !orderDetailRef.current.contains(event.target)) {
                setShowDetail(false)
            }
        };
        document.addEventListener('mousedown', handleSidebarClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleSidebarClickOutside)
        };
    }, [])

    useEffect(() => {
        if (showDetail) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Clean up style if component unmounts unexpectedly
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showDetail]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/api/o/user/orders/')
                console.log(res.data)
                setOrder(res.data)
            } catch (error) {

            } finally {

            }
        };
        fetchOrders();
    }, [])

    const handleOrderDetail = async (orderID) => {
        setShowDetail(true)
        try {
            setLoadingDetails(true)
            const res = await api.get(`/api/o/user/orderdetail/?orderID=${orderID}`)
            console.log(res.data)
            setOrderDetail(res.data)
        } catch (error) {

        } finally {
            setLoadingDetails(false)
        }
    };

    const handleDateFormat = (date) => {
        let d = new Date(date);
        let day = String(d.getDate()).padStart(2, '0');
        let month = String(d.getMonth() + 1).padStart(2, '0');
        let year = d.getFullYear();

        let formatted = `${day}/${month}/${year}`;
        return formatted
    };

    return (
        <>
            {/* DASHBOARD */}
            <section className="w-full h-screen pt-22 px-9 lg:px-15 min-px-3 pb-5 max-[740px]:px-5 max-[740px]:pt-30">
                <div className="flex gap-5">
                    <Dashboard custom={'order'} display={'hidden'} />
                    <div className="w-[70%] max-[850px]:w-full">
                        {/* <div className='flex gap-7 px-3 py-3'>
                            <button className='text-[15px] font-semibold'>ONGOING/DELIVERED (0)</button>
                            <button className='text-[15px]'>CANCELED/RETURNED (0)</button>
                        </div> */}
                        {orders.length > 0 ? (
                            <div className='w-full h-auto rounded-md border-2 border-[#eee] px-2 pt-3 pb-2'>
                                <h4 className='text-[20px] pb-2 font-semibold'>Order List</h4>

                                <div className='w-full h-full'>
                                    {/* HEADER */}
                                    <div className='w-full h-full flex py-2'>
                                        <p className='w-[20%] px-2 text-[17px] line-clamp-1 overflow-hidden text-ellipsis max-[600px]:w-[30%] max-[600px]:text-[15px]'>Order Number</p>
                                        <p className='w-[20%] px-2 text-[17px] max-[600px]:w-[25%] max-[600px]:text-[15px]'>Date</p>
                                        {/* <p className='w-[20%] px-2 text-[17px]'>Customer</p> */}
                                        <p className='w-[30%] px-2 text-[17px] max-[600px]:hidden max-[600px]:text-[15px]'>Email</p>
                                        <p className='w-[20%] px-2 text-[17px max-[600px]:w-[25%] max-[600px]:text-[15px]'>Amount</p>
                                        <p className='w-[10%] px-2 text-[17px] max-[600px]:w-[20%] max-[600px]:text-[15px]'>Status</p>
                                        {/* <p>Action</p> */}
                                    </div>
                                    {/* BODY */}
                                    {orders.map(order => {
                                        return (
                                            <div key={`order-${order.order_number}`} className='w-full h-full flex border-t border-[#eee] py-2 cursor-pointer hover:bg-[#eee]' onClick={() => handleOrderDetail(order.order_number)}>
                                                <p className='w-[20%] px-2 text-[16px] line-clamp-1 overflow-hidden text-ellipsis font-medium max-[600px]:w-[30%] max-[600px]:text-[14px]'>{order.order_number}</p>
                                                <p className='w-[20%] px-2 text-[16px] line-clamp-1 overflow-hidden text-ellipsis font-medium max-[600px]:w-[25%] max-[600px]:text-[14px]'>{handleDateFormat(order?.payment?.paid_at || order?.created_at)}</p>
                                                {/* <p className='w-[20%] px-2 text-[16px] line-clamp-1 overflow-hidden text-ellipsis font-medium'>Sanni Sodiq Ishola</p> */}
                                                <p className='w-[30%] px-2 text-[16px] line-clamp-1 overflow-hidden text-ellipsis font-medium max-[600px]:hidden max-[600px]:text-[14px]'>{order.user.email}</p>
                                                <p className='w-[20%] px-2 text-[16px] line-clamp-1 overflow-hidden text-ellipsis font-medium max-[600px]:w-[25%] max-[600px]:text-[14px]'><del>N</del>{parseInt(order.sub_total).toLocaleString('en-NG')}.00</p>
                                                <p className='w-[10%] px-2 text-[16px] font-medium max-[600px]:w-[20%]'>{order?.status === 'Successful' ? 'Paid' : 'Pending'}</p>
                                                {/* <p>Action</p> */}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (<></>)}

                    </div>
                </div>
            </section >

            <div className={`w-full h-screen ${showDetail ? 'fixed' : 'hidden'}  z-700 bg-black/20`}>
                <div className='w-full h-full flex justify-center items-center '>
                    <div className='relative overflow-hidden w-150 h-auto max-h-100 min-h-70 px-3 bg-white rounded-md overflow-y-scroll 
                                        [&::-webkit-scrollbar]:w-1
                                        [&::-webkit-scrollbar-track]:bg-transparent 
                                      [&::-webkit-scrollbar-thumb]:bg-gray-300 
                                        [&::-webkit-scrollbar-thumb]:rounded-full
                                        [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent]' ref={orderDetailRef}>
                        <div className='sticky w-full flex top-0 left-0 px-1 pt-3 pb-2 justify-between items-center mb-2.5 bg-white'>
                            <h4 className='font-semibold text-[19px]'>Order Details</h4>
                            <div><IoMdClose className='cursor-pointer text-[20px]' onClick={() => setShowDetail(false)} /></div>
                        </div>

                        {loadingDetails ? (
                            <div className='w-full h-50 flex justify-center items-center'>
                                <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
                            </div>
                        ) : (
                            <div>
                                <div className=''>
                                    <div className='w-full mb-2'>
                                        <h4 className='text-[16.5px] font-semibold'>Order ID: <span className='font-normal'>{orderDetail?.order?.order_number}</span></h4>
                                        <h4 className='text-[16.5px] font-semibold'>Customer: <span className='font-normal'>{orderDetail?.order?.shipping_address.first_name} {orderDetail?.order?.shipping_address?.last_name}</span></h4>
                                        <h4 className='text-[16.5px] font-semibold'>Email: <span className='font-normal'>{orderDetail?.order?.user?.email}</span></h4>
                                        <h4 className='text-[16.5px] font-semibold'>Date: <span className='font-normal'>{handleDateFormat(orderDetail.order?.payment?.paid_at || orderDetail.order?.created_at)}</span></h4>
                                        <h4 className='text-[16.5px] font-semibold'>Status: <span className='font-normal text-blue-500'>{orderDetail?.order?.status === 'Successful' ? 'Paid' : 'Pending'}</span></h4>
                                    </div>

                                    <div className='w-full'>
                                        {/* PRODUCT HEADER */}
                                        <div className='flex items-center py-1.5 border-b-2 border-[#eee]'>
                                            <p className='w-[65%]'>Product</p>
                                            <p className='w-[15%]'>Quantity</p>
                                            <p className='w-[20%]'>Price</p>
                                        </div>

                                        {/* PRODUCT LIST */}
                                        {orderDetail?.orderItems?.map(orderItem => {
                                            return (
                                                <div key={`orderItem_${orderItem.id}`} className='flex items-center py-1 border-b-2 border-[#eee]'>
                                                    <div className='w-[65%] flex items-center gap-2 px-2'>
                                                        <div className="w-[20%] h-10">
                                                            <Image src={`${orderItem?.product?.image}`} width={100} height={100} alt={orderItem.product.name} className="w-full h-full object-contain" unoptimized />
                                                        </div>
                                                        <h4 className='text-[15px] line-clamp-1 overflow-hidden text-ellipsis font-medium'>{orderItem.product.name}</h4>
                                                    </div>
                                                    <div className='w-[15%] px-2 font-medium'>{orderItem?.quantity}</div>
                                                    <div className='w-[20%] px-2 font-medium'><del>N</del>{orderItem.discount > 0 ? (((((100 - orderItem.discount) / 100) * orderItem?.price) * orderItem?.quantity).toLocaleString('en-NG')) : (parseInt(orderItem.price * orderItem?.quantity)?.toLocaleString('en-NG'))}.00</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className='sticky bottom-0 left py-2.5 px-2 bg-white flex flex-col'>
                                    <div className='flex items-center'>
                                        <p className='w-[65%] flex items-center gap-1.5'>
                                            {/* <button className='text-[13px] px-2 bg-[#333] text-white py-1.5 cursor-pointer'>Save as Image</button>
                                            <button className='text-[13px] px-2 bg-[#333] text-white py-1.5 cursor-pointer'>Save as PDF</button> */}
                                        </p>
                                        <p className='w-[15%] font-medium text-[15px]'>Shipping:</p>
                                        <p className='w-[20%] font-medium text-[15px]'><del>N</del>{parseInt(orderDetail?.order?.shipping_price)?.toLocaleString('en-NG')}.00</p>
                                    </div>
                                    <div className='flex items-center'>
                                        <p className='w-[65%] flex items-center gap-1.5'>
                                            <button className='text-[13px] px-2 bg-[#333] text-white py-1.5 cursor-pointer'>Save as Image</button>
                                            <button className='text-[13px] px-2 bg-[#333] text-white py-1.5 cursor-pointer'>Save as PDF</button>
                                        </p>
                                        <p className='w-[15%] font-medium text-[15px]'>Total:</p>
                                        <p className='w-[20%] font-medium text-[15px]'><del>N</del>{parseInt(orderDetail?.order?.sub_total)?.toLocaleString('en-NG')}.00</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default page