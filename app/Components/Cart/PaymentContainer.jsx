"use client";
import React, { useEffect, useState } from 'react'
import Link from "next/link";
import api from '../../api/api';
import { MdOutlineDeleteOutline } from "react-icons/md";
import LoadingContainer from '../../Components/LoadingContainer'

const PaymentContainer = () => {
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false)
    const [error, setError] = useState(null)
    const [cart, setCart] = useState(true);
    const [summary, setSummary] = useState({
        "totalPrice": 0,
        "deliveryfees": 0,
        "total": 0,
    });

    const [checkout, setCheckout] = useState({
        "first_name": "",
        "last_name": "",
        "phone1": "",
        "phone2": "",
        "address_line_1": "",
        "city": "",
        "state": "",
        "country": "Nigeria",
        "order_note": "",
    });

    useEffect(() => {
        const fetchCheckout = async () => {
            try {
                const response = await api.get('/api/o/cart/checkoutview/')
                console.log(response.data)
                const data = response.data
                setCheckout(f => ({
                    ...f,
                    "first_name": data.order.shipping_address?.first_name,
                    "last_name": data.order.shipping_address?.last_name,
                    "phone1": data.order.shipping_address?.phone1,
                    "phone2": data.order.shipping_address?.phone2,
                    "address_line_1": data.order.shipping_address?.address_line_1,
                    "city": data.order.shipping_address?.city,
                    "state": data.order.shipping_address?.state.name,
                    "country": "Nigeria",
                    "order_note": data.order.order_note,
                }))
                setSummary(s => ({ ...s, "totalPrice": data.order.total_price, "deliveryfees": data.order.shipping_price, "total": data.order.sub_total }))
            } catch (error) {
                console.error(error)
            }
        };

        fetchCheckout();
    }, [])

    useEffect(() => {
        const fetchCart = async () => {
            try {
                setLoading(true)
                const cart_id = localStorage.getItem('cart_id')
                const response = await api.get(
                    '/api/o/cart', { params: { 'cart_id': cart_id } }, {
                    withCredentials: true,
                }
                );
                console.log(response.data)
                setCart(response.data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        };

        fetchCart();
    }, [])

    // useEffect(() => {
    //     let totalPrice = 0
    //     cart?.cartitems?.forEach(cat => {
    //         if (cat.is_active) {
    //             if (cat.product.discount > 0) {
    //                 if (cat.variations === null) {
    //                     totalPrice += ((100 - cat?.product?.discount) / 100 * cat?.product?.price) * cat.quantity
    //                 } else {
    //                     totalPrice += ((100 - cat?.product?.discount) / 100 * cat?.variations?.price) * cat.quantity
    //                 }
    //             } else {
    //                 totalPrice += cat.variations.price * cat.quantity
    //             }
    //         }
    //     })

    //     let tax = (2 * totalPrice) / 100

    //     setSummary(f => ({ ...f, "totalPrice": totalPrice }))
    // }, [cart])

    useEffect(() => {
        console.log(cart)
        console.log(summary)
    }, [cart, summary])

    const handlePayment = async () => {
        try {
            setPaymentLoading(true)
            const res = await api.post('/api/o/initiatepayment/')
            console.log(res.data)

            if (res.data.notifications.length > 0) {
                alert("message")
            } else {
                window.location.href = res.data.payment_gateway.data.link
            }
        } catch {
            console.error(error)
        } finally {
            setPaymentLoading(false)
        }
    };

    return (
        <>
            <div className="w-full h-auto py-5 px-10 lg:px-15 min-px-3 max-[740px]:px-5">
                <div className="w-full h-full flex gap-5 max-[740px]:flex-col">
                    <div className="w-[65%] h-full max-[740px]:w-full">
                        {/* BILLING ADDRESS */}
                        <div className='mb-2'>
                            <div className='w-full h-auto px-3 pt-1 bg-[#eee] mb-0.5 flex justify-between'>
                                <h4 className='text-[19px] font-medium'>Billing Address</h4>
                                <Link href={`/checkout/billingaddress/`} className='text-amber-500'>Edit </Link>
                            </div>

                            <div className='grid p-2.5'>
                                <div className='min-w-auto flex gap-1.5 items-center pb-1'><h4 className='text-[18px] font-semibold'>First name: </h4> <p>{checkout.first_name}</p></div>
                                <div className='min-w-auto flex gap-1.5 items-center pb-1'><h4 className='text-[18px] font-semibold'>Last name: </h4> <p>{checkout.last_name}</p></div>
                                <div className='min-w-auto flex gap-1.5 items-center pb-1'><h4 className='text-[18px] font-semibold'>Phone Number: </h4> <p>{checkout.phone1}</p></div>
                                {checkout.phone2 !== null && checkout.phone2 !== "" && (
                                    <div className='min-w-auto flex gap-1.5 items-center pb-1'><h4 className='text-[18px] font-semibold'>Phone Number: </h4> <p>{checkout.phone2}</p></div>
                                )}

                                <div className='min-w-auto flex gap-1.5 items-center pb-1'><h4 className='text-[18px] font-semibold'>Address: </h4> <p>{checkout.address_line_1}</p></div>
                                <div className='min-w-auto flex gap-1.5 items-center pb-1'><h4 className='text-[18px] font-semibold'>City: </h4> <p>{checkout.city}</p></div>
                                <div className='min-w-auto flex gap-1.5 items-center pb-1'><h4 className='text-[18px] font-semibold'>State: </h4> <p>{checkout.state}</p></div>
                                <div className='min-w-auto flex gap-1.5 items-center pb-1'><h4 className='text-[18px] font-semibold'>Country: </h4> <p>{checkout.country}</p></div>
                                <div className='min-w-auto flex gap-1.5 items-center pb-1'><h4 className='text-[18px] font-semibold'>Order Note: </h4> <p>{checkout.order_note}</p></div>
                            </div>
                        </div>
                        {/* SHIPPING ITEMS */}
                        <div>
                            <div className='w-full h-auto pt-1 pb-0.5 px-3 bg-[#eee] mb-1.5'>
                                <h4 className='text-[19px] font-medium mb-2'>Shipping Items</h4>
                            </div>

                            <div>
                                {loading ? (
                                    <div className="flex flex-col w-full items-center py-20">
                                        <div className="h-5.5 w-5.5 animate-spin rounded-full border-4 border-gray-200 border-t-[#333]" />
                                    </div>
                                ) : (
                                    cart?.cartitems?.map(ct => {
                                        let isactive = ct?.is_active
                                        if (!isactive) return
                                        return (
                                            // CART ITEMS
                                            <div className="flex flex-col w-full border-b border-[#333]" key={`cartitem-${ct.id}`}>
                                                <div className="w-full h-auto flex gap-2.5 py-1">
                                                    <div className={`w-[60] h-[60] max-h-30 max-[500px]:w-[25%] relative`}>
                                                        <img src={`http://127.0.0.1:8000${ct.product.image}`} width={100} height={100} alt={ct.product.name} className="w-full h-full rounded-xl" unoptimized />
                                                    </div>

                                                    <div className='w-[87%] max-[500px]:w-[75%]'>
                                                        <div className="flex justify-between max-[500px]:flex-col">
                                                            <div className="w-[80%] leading-5 text-[#333] max-[500px]:w-full">
                                                                <p className={`text-[17px] max-[500px]:text-[16px]`}>{ct?.product?.name}</p>

                                                                <div className={`flex gap-1 text-[12px]`} >{ct?.variations?.color && (<p>Color: {ct.variations.color.name} </p>)} {ct?.variations?.size && (<p>, Size: {ct.variations.size.name}</p>)}</div>
                                                            </div>

                                                            <div className="flex flex-col items-end mb-1 leading-6.5 max-[500px]:flex-row max-[500px]:gap-2 max-[500px]:items-center">
                                                                {ct.variations !== null ? (
                                                                    ct.product.discount ? (
                                                                        <>
                                                                            <h3 className={`text-black text-[1.2rem] font-bold`}><del>N</del>{((((100 - ct?.product?.discount) / 100) * ct?.variations?.price) * ct.quantity).toLocaleString('en-NG')}</h3>
                                                                            <div className="flex items-center gap-2">
                                                                                <h2 className='text-black'><del>N{(ct.variations.price * ct.quantity).toLocaleString('en-NG')}</del></h2>
                                                                                <div className={`bg-amber-400 text-[12px] px-1.5 max-[500px]:hidden`}>-{ct.product.discount}%</div>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <h3 className="text-[1.2rem] font-bold"><del>N</del>{(ct.variations.price * ct.quantity).toLocaleString('en-NG')}</h3>
                                                                        </>
                                                                    )
                                                                ) : (
                                                                    ct.product.discount ? (
                                                                        <>
                                                                            <h3 className={`text-black text-[1.2rem] font-bold`}><del>N</del>{((((100 - ct?.product?.discount) / 100) * ct?.product?.price) * ct.quantity).toLocaleString('en-NG')}</h3>
                                                                            <div className="flex items-center gap-2">
                                                                                <h2 className='text-black'><del>N{(ct.product.price * ct.quantity).toLocaleString('en-NG')}</del></h2>
                                                                                <div className={`bg-amber-400 text-[12px] px-1.5 max-[500px]:hidden`}>-{ct.product.discount}%</div>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <h3 className="text-[1.2rem] font-bold"><del>N</del>{(ct.product.price * ct.quantity).toLocaleString('en-NG')}</h3>
                                                                        </>
                                                                    )
                                                                )}
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                    </div>

                    <div className="w-[35%] max-[740px]:w-full">
                        <h4 className="text-[16px] px-1 py-1 border-b border-[#eee] text-[#333]">CART SUMMARY</h4>
                        <div className="flex justify-between items-center">
                            <h2 className="text-[16px]">Item's total ()</h2>
                            <h2 className="text-[16px]"><del>N</del>{parseInt(summary.totalPrice).toLocaleString('en-NG')}.00</h2>
                        </div>
                        <div className=" flex justify-between items-center">
                            <h2 className="text-[16px]">Delivery fees</h2>
                            <h2 className="text-[16px]"><del>N</del>{parseInt(summary.deliveryfees).toLocaleString('en-NG')}.00</h2>
                        </div>
                        <div className="py-0.5 flex justify-between items-center">
                            <h2 className="text-[16px] font-semibold">Subtotal</h2>
                            <h2 className="text-[16px] font-bold"><del>N</del>{parseInt(summary.total).toLocaleString('en-NG')}.00</h2>
                        </div>
                        <div className="flex flex-col">
                            <button onClick={() => handlePayment()} className="flex items-center justify-center py-3 px-8 bg-[#333] w-full mt-2 text-white text-[15px] cursor-pointer text-center">
                                {paymentLoading ? (
                                    <LoadingContainer />
                                ) : ('Pay With Flutterwave')}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default PaymentContainer
