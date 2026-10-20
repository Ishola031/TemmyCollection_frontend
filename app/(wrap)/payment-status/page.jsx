"use client";
import React, { useContext, useEffect, useState } from 'react'
import api from '../../api/api';
import Link from "next/link";
import { AuthContext } from '../../Components/IsAuth';
import { useCart } from '../../hook/useCart';
import { MdCheckCircle, MdErrorOutline, MdOutlinePayment } from "react-icons/md";

const page = () => {
    const [statusMessage, setStatusMessage] = useState('Verifying your Payment')
    const [statusSubMessage, setStatusSubMessage] = useState('Wait a moment, your payment is being verified!')
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useContext(AuthContext);
    const { data: cart, isLoading: loadingCart } = useCart(isAuthenticated);

    useEffect(() => {
        const callback = async () => {
            try {
                setLoading(true)

                const queryParams = new URLSearchParams(location.search);
                const status = queryParams.get('status');
                const txRef = queryParams.get('tx_ref')
                const transactionId = queryParams.get('transaction_id');

                if (status && txRef && transactionId) {
                    const res = await api.post(`/api/o/payment_callback/?status=${status}&tx_ref=${txRef}&transaction_id=${transactionId}`)

                    setStatusMessage(res.data.message)
                    setStatusSubMessage(res.data.subMessage)

                    console.log(res.data)
                }

                setError(null)
            } catch (error) {
                setError('Network Error. Please connect to the internet.')
                console.error(error)
            } finally {
                setLoading(false)
            }
        };

        callback();
    }, [])

    return (
        <div className="w-full min-h-[calc(100vh-80px)] px-5 py-10 flex items-center justify-center bg-[#fafafa]">

            <div className="w-full max-w-[650px]">

                <div className="bg-white border border-[#eee] rounded-2xl shadow-sm overflow-hidden">

                    {/* TOP SECTION */}
                    <div className="flex flex-col items-center text-center px-6 py-12">

                        {/* STATUS ICON */}
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                            loading
                                ? 'bg-[#f5f5f5]'
                                : error
                                    ? 'bg-red-50'
                                    : 'bg-green-50'
                        }`}>

                            {loading ? (
                                <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-[#333]" />
                            ) : error ? (
                                <MdErrorOutline className="text-[50px] text-red-500" />
                            ) : (
                                <MdCheckCircle className="text-[50px] text-green-500" />
                            )}

                        </div>

                        {/* STATUS */}
                        <h1 className="text-[30px] font-semibold text-[#222] leading-tight max-[500px]:text-[25px]">
                            {statusMessage}
                        </h1>

                        <p className="text-[15px] text-[#777] mt-3 max-w-[450px] leading-6">
                            {statusSubMessage}
                        </p>

                        {/* ERROR */}
                        {!loading && error && (
                            <div className="w-full mt-7 px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
                                <p className="text-[14px] text-red-600">
                                    {error}
                                </p>
                            </div>
                        )}

                    </div>


                    {/* PAYMENT INFORMATION */}
                    {!loading && !error && (
                        <div className="border-t border-[#eee]">

                            <div className="px-6 py-5">

                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center">
                                        <MdOutlinePayment className="text-[23px] text-[#333]" />
                                    </div>

                                    <div>
                                        <h3 className="text-[16px] font-semibold text-[#333]">
                                            Payment Status
                                        </h3>

                                        <p className="text-[13px] text-[#888]">
                                            Your transaction has been processed
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full bg-[#fafafa] rounded-lg px-4 py-3 flex justify-between items-center">
                                    <p className="text-[14px] text-[#777]">
                                        Status
                                    </p>

                                    <p className="text-[14px] font-semibold text-green-600">
                                        Completed
                                    </p>
                                </div>

                            </div>

                            {/* ACTIONS */}
                            <div className="px-6 py-5 border-t border-[#eee] flex gap-3 max-[500px]:flex-col">

                                <Link
                                    href="/"
                                    className="flex-1 py-3 px-5 bg-[#333] text-white text-[14px] font-medium text-center rounded-lg hover:bg-black transition"
                                >
                                    Continue Shopping
                                </Link>

                                <Link
                                    href="/dashboard/order"
                                    className="flex-1 py-3 px-5 border border-[#333] text-[#333] text-[14px] font-medium text-center rounded-lg hover:bg-[#f5f5f5] transition"
                                >
                                    View Orders
                                </Link>

                            </div>

                        </div>
                    )}

                </div>

                {/* FOOTER MESSAGE */}
                <p className="text-center text-[12px] text-[#999] mt-5">
                    Thank you for shopping with us.
                </p>

            </div>

        </div>
    )
}

export default page