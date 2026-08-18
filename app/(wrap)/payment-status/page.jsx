"use client";
import React, { useContext, useEffect, useState } from 'react'
import api from '../../api/api';
import Link from "next/link";
import { AuthContext } from '../../Components/IsAuth';
import { useCart } from '../../hook/useCart';

const page = () => {
    const [statusMessage, setStatusMessage] = useState('Verifying your Payment')
    const [statusSubMessage, setStatusSubMessage] = useState('wait a moment, Your payment is being verified!')
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
        <>
            <div style={{ padding: '70px 0' }}></div>
            <div style={{ width: '100%', height: 'calc(90vh - 140px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h4 style={{ fontSize: '40px', fontWeight: '600', letterSpacing: '-0.5px', color: '#333' }}>{statusMessage}</h4>
                <p style={{ fontSize: '17px', paddingTop: '5px' }}>{statusSubMessage}</p>
                {!loading && (
                    error ? (
                        <p style={{ fontSize: '15px', paddingTop: '5px' }} > {error}</p>
                    ) : (
                        <Link href={`/`} className="text-[16px] py-2 px-4 bg-[#333] text-[#eee] cursor-pointer mt-3">Continue Shopping</Link>
                    )
                )}
            </div >
        </>
    )
}

export default page
