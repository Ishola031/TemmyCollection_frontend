"use client";
import React, { useEffect, useState } from 'react'
import Link from "next/link";
import api from '../../api/api';
import { MdOutlineDeleteOutline } from "react-icons/md";
import { useRouter } from 'next/navigation';

const CheckoutContainer = () => {
    const [loading, setLoading] = useState(false);
    const [mountloading, setMountLoading] = useState(true);
    const [error, setError] = useState(null)
    const [cart, setCart] = useState(true);
    const [states, setStates] = useState([]);
    const [checkout, setCheckout] = useState([]);
    const [summary, setSummary] = useState({});
    const router = useRouter();
    const [formData, setFormData] = useState({
        "first_name": "",
        "last_name": "",
        "phone1": "",
        "phone2": "",
        "address_line_1": "",
        "city": "",
        "state": "",
        "country": "Nigeria",
        "order_note": "",
        "total_price": 0,
    });
    const [orderFormData, setOrderFormData] = useState({
        "shipping_address": null,
        "order_note": "",
        "total_price": 0,
    });

    const [addresses, setAddresses] = useState([])
    const [HasAddress, setHasAddress] = useState(false)

    // CART
    useEffect(() => {
        const fetchCart = async () => {
            try {
                setMountLoading(true)
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
                setMountLoading(false)
            }
        };

        fetchCart();
    }, [])

    // STATE
    useEffect(() => {
        const fetchState = async () => {
            try {
                setMountLoading(true)
                const response = await api.get('/api/o/states/')
                console.log(response.data)
                setStates(response.data)
            } catch (error) {
                console.error(error)
            } finally {
                setMountLoading(false)
            }
        };

        fetchState();
    }, [])

    // FORMDATA
    useEffect(() => {
        const fetchCheckout = async () => {
            try {
                setMountLoading(true)
                const response = await api.get('/api/o/cart/checkoutview/')
                console.log(response.data)
                setOrderFormData(vl => ({ ...vl, "order_note": response.data.order.order_note, "shipping_address": response.data.order.shipping_address.id }))
            } catch (error) {
                console.error(error)
            } finally {
                setMountLoading(false)
            }
        };

        fetchCheckout();
    }, [])

    // 
    useEffect(() => {
        const fetchUserAddress = async () => {
            try {
                setMountLoading(true)
                const res = await api.get('api/o/useraddress/');
                console.log(res.data);
                setAddresses(res.data)
                setHasAddress(true)
            } catch (error) {
                setHasAddress(false)
            } finally {
                setMountLoading(false)
            }
        };
        fetchUserAddress();
    }, [])

    useEffect(() => {
        console.log(orderFormData)
    }, [orderFormData])

    // SUMMARY
    useEffect(() => {
        let totalPrice = 0
        cart?.cartitems?.forEach(cat => {
            if (cat.product.discount > 0) {
                if (cat.variations === null) {
                    totalPrice += (((100 - cat?.product?.discount) / 100) * (cat?.product?.price)) * cat.quantity
                } else {
                    totalPrice += (((100 - cat?.product?.discount) / 100) * (cat?.variations?.price)) * cat.quantity
                }
            } else {
                if (cat.variations === null) {
                    totalPrice += (cat?.product?.price) * cat?.quantity
                } else {
                    totalPrice += (cat?.variations?.price) * cat?.quantity
                }
            }
        })

        // let tax = (2 * totalPrice) / 100
        const i = {
            "total_price": totalPrice,
        }
        setSummary(i)
        setFormData(f => ({ ...f, "total_price": i.total_price }))
    }, [cart])

    // HANDLESUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true)
            if (addresses.length > 0) {
                const res = await api.post('api/o/cart/checkout/', orderFormData)
                console.log(res.data)
            } else {
                const res = await api.post('api/o/cart/checkout/', formData)
                console.log(res.data)
            }
            router.push('/checkout/payment/')
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    };

    const isChecked = (shipping_address, value) => {
        return orderFormData[shipping_address] ? orderFormData[shipping_address] == value : false;
    };

    return (
        <>
            <div className="w-full h-auto py-5 px-10 lg:px-15 min-px-3 max-[740px]:px-5">
                <form onSubmit={handleSubmit} className="w-full h-full flex gap-5 max-[740px]:flex-col">
                    <div className="w-[65%] h-full max-[740px]:w-full">
                        {/* BILLING ADDRESS */}
                        <div className='mb-2'>
                            {mountloading ? (
                                <div className='w-full h-70 flex items-center justify-center'>
                                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
                                </div>
                            ) : (
                                addresses.length <= 0 ? (
                                    <div className=''>
                                        <div className='w-full h-auto px-3 pt-1 bg-[#eee] mb-7'>
                                            <h4 className='text-[19px] font-medium mb-2'>Billing Address</h4>
                                        </div>

                                        <div>

                                            <div className='w-full h-10 flex gap-3 mb-7 max-[500px]:flex-col max-[500px]:h-auto'>
                                                <div className='w-[50%] relative border border-[#aaa] rounded-lg max-[500px]:w-full max-[500px]:mb-3'>
                                                    <label htmlFor="" className='absolute -top-5.5 -left-1 text-[#333] text-[0.93rem] pointer-events-none py-0 px-1 '>First Name</label>
                                                    <input type="text" name="first_name" className="w-full h-full border-0 outline-0 py-0 px-2 rounded-sm bg-transparent text-[#333] z-100 text-[0.9rem] max-[500px]:py-2.5" required value={formData.first_name} onChange={(e) => setFormData(f => ({ ...f, "first_name": e.target.value }))} />
                                                </div>

                                                <div className='w-[50%] relative border border-[#aaa] rounded-lg max-[500px]:w-full'>
                                                    <label htmlFor="" className='absolute -top-5.5 -left-1 text-[#333] text-[0.93rem] pointer-events-none py-0 px-1 '>Last Name</label>
                                                    <input type="text" name="last_name" className="w-full h-full border-0 outline-0 py-0 px-2 rounded-sm bg-transparent text-[#333] z-100 text-[0.9rem] max-[500px]:py-2.5" required value={formData.last_name} onChange={(e) => setFormData(f => ({ ...f, "last_name": e.target.value }))} />
                                                </div>
                                            </div>

                                            <div className='w-full h-10 flex gap-3 mb-7'>
                                                <div className='w-full relative border border-[#aaa] rounded-lg'>
                                                    <label htmlFor="" className='absolute -top-5.5 -left-1 text-[#333] text-[0.93rem] pointer-events-none py-0 px-1 '>Address</label>
                                                    <input type="text" name="address" className="w-full h-full border-0 outline-0 py-0 px-2 rounded-sm bg-transparent text-[#333] z-100 text-[0.9rem]" required value={formData.address_line_1} onChange={(e) => setFormData(f => ({ ...f, "address_line_1": e.target.value }))} />
                                                </div>
                                            </div>

                                            <div className='w-full h-10 flex gap-3 mb-7 max-[500px]:flex-col max-[500px]:h-auto'>
                                                <div className='w-[50%] relative border border-[#aaa] rounded-lg max-[500px]:w-full max-[500px]:mb-4'>
                                                    <label htmlFor="" className='absolute -top-5.5 -left-1 text-[#333] text-[0.93rem] pointer-events-none py-0 px-1 '>Phone Number</label>
                                                    <input type="number" name="phonenumber1" className="w-full h-full border-0 outline-0 py-0 px-2 rounded-sm bg-transparent text-[#333] z-100 text-[0.9rem] max-[500px]:py-2.5" required value={formData.phone1} onChange={(e) => setFormData(f => ({ ...f, "phone1": e.target.value }))} />
                                                </div>

                                                <div className='w-[50%] relative border border-[#aaa] rounded-lg max-[500px]:w-full'>
                                                    <label htmlFor="" className='absolute -top-5.5 -left-1 text-[#333] text-[0.93rem] pointer-events-none py-0 px-1 '>Phone Number (Optional)</label>
                                                    <input type="number" name="phonenumber2" className="w-full h-full border-0 outline-0 py-0 px-2 rounded-sm bg-transparent text-[#333] z-100 text-[0.9rem] max-[500px]:py-2.5" value={formData.phone2} onChange={(e) => setFormData(f => ({ ...f, "phone2": e.target.value }))} />
                                                </div>
                                            </div>

                                            <div className='w-full h-10 flex gap-3 mb-7 max-[500px]:flex-col max-[500px]:h-auto'>
                                                <div className='w-[50%] relative border border-[#aaa] rounded-lg max-[500px]:w-full max-[500px]:mb-3.5'>
                                                    <label htmlFor="" className='absolute -top-5.5 -left-1 text-[#333] text-[0.93rem] pointer-events-none py-0 px-1 '>Country</label>
                                                    <input type="text" name="country" className="w-full h-full border-0 outline-0 py-0 px-2 rounded-sm bg-transparent text-[#333] z-100 text-[0.9rem] max-[500px]:py-3" disabled={true} required value={formData.country} onChange={(e) => setFormData(f => ({ ...f, "country": e.target.value }))} />
                                                </div>

                                                <div className='w-[50%] relative border border-[#aaa] rounded-lg max-[500px]:w-full max-[500px]:mb-3.5'>
                                                    <label htmlFor="" className='absolute -top-5.5 -left-1 text-[#333] text-[0.93rem] pointer-events-none py-0 px-1 '>State</label>
                                                    <select name="state" className="w-full h-full border-0 outline-0 py-0 px-2 rounded-sm bg-transparent text-[#333] z-100 text-[0.9rem] max-[500px]:py-3" required value={formData.state} onChange={(e) => setFormData(f => ({ ...f, "state": e.target.value }))}>
                                                        <option value="">................</option>
                                                        {states.map(st => {
                                                            return (
                                                                <option key={st.id} value={st.id}>{st.name}</option>
                                                            )
                                                        })}
                                                    </select>
                                                </div>

                                                <div className='w-[50%] relative border border-[#aaa] rounded-lg max-[500px]:w-full'>
                                                    <label htmlFor="" className='absolute -top-5.5 -left-1 text-[#333] text-[0.93rem] pointer-events-none py-0 px-1 '>City</label>
                                                    <input type="text" name="city" className="w-full h-full border-0 outline-0 py-0 px-2 rounded-sm bg-transparent text-[#333] z-100 text-[0.9rem] max-[500px]:py-3" required value={formData.city} onChange={(e) => setFormData(f => ({ ...f, "city": e.target.value }))} />
                                                </div>
                                            </div>

                                            <div className='w-full h-10 flex gap-3 mb-7'>
                                                <div className='w-full relative border border-[#aaa] rounded-lg'>
                                                    <label htmlFor="" className='absolute -top-5.5 -left-1 text-[#333] text-[0.93rem] pointer-events-none py-0 px-1 '>Address Type (Home , Office etc)</label>
                                                    <input type="text" name="address" className="w-full h-full border-0 outline-0 py-0 px-2 rounded-sm bg-transparent text-[#333] z-100 text-[0.9rem]" required value={formData.address_type} onChange={(e) => setFormData(f => ({ ...f, "address_type": e.target.value }))} />
                                                </div>
                                            </div>

                                            <div className='w-full h-auto flex gap-5'>
                                                <div className='w-full relative border border-[#aaa] rounded-lg'>
                                                    <label htmlFor="" className='absolute -top-5.5 -left-1 text-[#333] text-[0.93rem] pointer-events-none py-0 px-1 '>Order Note (Optional)</label>
                                                    <textarea name="order_note" rows="2" className="w-full h-full border-0 outline-0 py-1 px-2 rounded-sm bg-transparent text-[#333] z-100 text-[0.9rem]" value={formData.order_note} onChange={(e) => setFormData(f => ({ ...f, "order_note": e.target.value }))}></textarea>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                ) : (
                                    <div className='flex flex-col gap-8'>
                                        <div className='w-full border-2 border-[#eee] rounded-lg px-4 py-6'>
                                            <div className='flex justify-between items-center mb-6'>
                                                <h4 className='text-[19px] font-normal mb-2'>Select Delivery Address</h4>
                                                <Link href={`/checkout/billingaddress`} className='px-3 py-1 border-2 border-blue-600 text-[14px] rounded-lg'>Add New Address</Link>
                                            </div>

                                            <div className='w-full flex flex-col gap-3'>
                                                {addresses.map(ad => {
                                                    return (
                                                        <div key={`address-${ad.id}`} className='border-2 border-[#eee] rounded-lg py-3 px-3.5 flex gap-3.5 justify-between'>
                                                            <div className='flex gap-3.5'>
                                                                <div>
                                                                    <input type="radio" name="address" className='scale-150' checked={isChecked('shipping_address', ad.id)} onChange={() => setOrderFormData(vl => ({ ...vl, "shipping_address": ad.id }))} required />
                                                                </div>

                                                                <div className='' style={{ lineHeight: '21px' }}>
                                                                    <p className='text-[16px] capitalize'>{ad.address_type}</p>
                                                                    <h4 className='font-medium uppercase'>{`${ad.first_name} ${ad.last_name}`}</h4>
                                                                    <p className='text-[15px]'>{`${ad.address_line_1}, ${ad.city} ${ad.state.name} State`}</p>
                                                                    <p className='text-[15px]'>{`${ad.country}`}</p>
                                                                    <p className='text-[15px]'>{`${ad.phone1}`} {ad.phone2 !== null && ad.phone2 !== "" && (`, ${ad.phone2}`)}</p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Link href={`/checkout/billingaddress?address=${ad.id}`} className='font-medium text-blue-500'>EDIT</Link>
                                                            </div>
                                                        </div>
                                                    )
                                                })}

                                            </div>
                                        </div>

                                        <div className='w-full h-auto flex gap-5'>
                                            <div className='w-full relative border border-[#aaa] rounded-lg'>
                                                <label htmlFor="" className='absolute -top-5.5 -left-1 text-[#333] text-[0.93rem] pointer-events-none py-0 px-1 '>Order Note (Optional)</label>
                                                <textarea name="order_note" rows="2" className="w-full h-full border-0 outline-0 py-1 px-2 rounded-sm bg-transparent text-[#333] z-100 text-[0.9rem]" value={orderFormData.order_note} onChange={(e) => setOrderFormData(f => ({ ...f, "order_note": e.target.value }))}></textarea>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                        {/* SHIPPING ITEMS */}
                        <div>
                            <div className='w-full h-auto pt-1 pb-0.5 px-3 bg-[#eee] mb-1.5'>
                                <h4 className='text-[19px] font-medium mb-2'>Shipping Items</h4>
                            </div>

                            <div>
                                {mountloading ? (
                                    <div className="flex flex-col w-full items-center py-20">
                                        <div className="h-5.5 w-5.5 animate-spin rounded-full border-4 border-gray-200 border-t-[#333]" />
                                    </div>
                                ) : (
                                    cart?.cartitems?.length > 0 ? (
                                        cart?.cartitems?.map(ct => {
                                            let isactive = ct?.is_active
                                            if (!isactive) return
                                            return (
                                                // CART ITEMS
                                                <div className="flex flex-col w-full border-b border-[#333]" key={`cartitem-${ct.id}`}>
                                                    <div className="w-full h-auto flex gap-2.5 py-1">
                                                        <div className={`w-[60] h-[60] max-h-30 max-[500px]:w-[25%] relative`}>
                                                            <img src={`${ct.product.image}`} width={100} height={100} alt={ct.product.name} className="w-full h-full rounded-xl" unoptimized />
                                                        </div>

                                                        <div className='w-[87%] max-[500px]:w-[75%]'>
                                                            <div className="flex justify-between max-[500px]:flex-col">
                                                                <div className="w-[80%] leading-5 text-[#333] max-[500px]:w-full">
                                                                    <p className={`text-[17px] max-[500px]:text-[16px]`}>{ct?.product?.name}</p>

                                                                    <div className={`flex gap-1 text-[12px]`} >{ct?.variations?.color && (<p>Color: {ct.variations.color.name} </p>)} {ct?.variations?.size && (<p>, Size: {ct.variations.size.name}</p>)}</div>
                                                                </div>

                                                                <div className="flex flex-col items-end mb-1 leading-6.5 max-[500px]:flex-row max-[500px]:gap-2 max-[500px]:items-center">
                                                                    {ct.variations !== null ? (
                                                                        ct.product.discount > 0 ? (
                                                                            <>
                                                                                <h3 className={`text-black text-[1.2rem] font-bold`}><del>N</del>{((((100 - ct?.product?.discount) / 100) * ct?.variations?.price) * ct.quantity).toLocaleString('en-NG')}</h3>
                                                                                <div className="flex items-center gap-2">
                                                                                    <h2 className='text-black'><del>N{(ct?.variations?.price * ct?.quantity).toLocaleString('en-NG')}</del></h2>
                                                                                    <div className={`bg-amber-400 text-[12px] px-1.5 max-[500px]:hidden`}>-{ct.product.discount}%</div>
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <h3 className="text-[1.2rem] font-bold"><del>N</del>{(ct?.variations?.price * ct?.quantity).toLocaleString('en-NG')}</h3>
                                                                            </>
                                                                        )
                                                                    ) : (
                                                                        ct.product.discount > 0 ? (
                                                                            <>
                                                                                <h3 className={`text-black text-[1.2rem] font-bold`}><del>N</del>{((((100 - ct?.product?.discount) / 100) * ct?.product?.price) * ct.quantity).toLocaleString('en-NG')}</h3>
                                                                                <div className="flex items-center gap-2">
                                                                                    <h2 className='text-black'><del>N{(ct?.product?.price * ct?.quantity).toLocaleString('en-NG')}</del></h2>
                                                                                    <div className={`bg-amber-400 text-[12px] px-1.5 max-[500px]:hidden`}>-{ct.product.discount}%</div>
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <h3 className="text-[1.2rem] font-bold"><del>N</del>{(ct?.product?.price * ct?.quantity).toLocaleString('en-NG')}</h3>
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
                                    ) : (
                                        // NO CART
                                        <div className="flex flex-col w-full items-center text-xl py-20">
                                            <p className="pb-5">No cart</p>
                                        </div>
                                    )
                                )}

                            </div>
                        </div>

                    </div>

                    <div className="w-[35%] max-[740px]:w-full sticky">
                        <h4 className="text-[16px] px-1 py-1 border-b border-[#eee] text-[#333]">CART SUMMARY</h4>
                        <div className="py-1 flex justify-between items-center">
                            <h2 className="text-[16px] font-semibold">Subtotal</h2>
                            <h2 className="text-[19px] font-bold"><del>N</del>{parseInt(summary.total_price)?.toLocaleString('en-NG')}.00</h2>
                        </div>
                        <div className="flex flex-col">
                            <button type='submit' className="py-2 px-8 bg-[#333] w-full mt-2 text-white text-[15px] cursor-pointer text-center">Confirm Order</button>
                            <Link href={`/`} className="py-2 px-8 bg-[#333] mt-1 text-white text-[15px] cursor-pointer text-center">Continue Shopping</Link>
                        </div>
                        <p className='text-[15px] text-center py-2'>Please make sure the phone number on your account is active on WhatsApp to receive your order updates. By proceeding, you are automatically accepting the Terms & Conditions</p>
                    </div>
                </form >
            </div >
        </>
    )
}

export default CheckoutContainer
