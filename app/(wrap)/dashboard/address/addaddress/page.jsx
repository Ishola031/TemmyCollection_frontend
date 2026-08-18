'use client';
import React, { useEffect, useState, Suspense } from 'react'
import Dashboard from '../../../../Components/Dashboard'
import Link from "next/link";
import { useStateApi } from '../../../../hook/useState';
import { useSearchParams } from 'next/navigation';



const AddAddressContent = () => {
    const searchParams = useSearchParams();
    const addressID = searchParams.get('address')
    const [formData, setFormData] = useState({
        "id": "",
        "first_name": "",
        "last_name": "",
        "phone1": "",
        "phone2": "",
        "address_line_1": "",
        "city": "",
        "state": "",
        "country": "Nigeria",
    });
    const { data: states } = useStateApi();
    const [loading, setLoading] = useState(true);
    const [addLoading, setAddLoading] = useState(false);


    useEffect(() => {
        const fetchCheckout = async () => {
            try {
                if (addressID) {
                    setLoading(true)
                    const response = await api.get(`/api/o/useraddress/`, { params: { 'addressID': addressID } })
                    setFormData(f => ({
                        ...f,
                        "id": response.data.id,
                        "address_type": response.data.address_type,
                        "first_name": response.data.first_name,
                        "last_name": response.data.last_name,
                        "phone1": response.data.phone1,
                        "phone2": response.data.phone2,
                        "address_line_1": response.data.address_line_1,
                        "city": response.data.city,
                        "state": response.data.state.id,
                        "country": "Nigeria",
                    }))
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        };
        fetchCheckout();
    }, [])

    return (
        <>
            <section className="w-full h-screen pt-22 px-10 lg:px-15 min-px-3 pb-5 max-[740px]:px-5 max-[740px]:pt-30">
                <div className="flex gap-5">
                    <Dashboard custom={'address'} display={'hidden'} />

                    <div className="w-[70%] max-[850px]:w-full">
                        <div className='w-full flex justify-between items-center pb-2 border-b-2 border-[#eee]'>
                            <div className=''>
                                <h4 className='font-medium text-[20px]'>Add Address</h4>
                                <p className=' text-[15px]'></p>
                            </div>
                            {/* <Link href="/dashboard/profile/changepassword" className='py-2 px-4 bg-blue-600 text-white text-[14px] cursor-pointer rounded-lg hover:bg-blue-700'>Change Password</Link> */}
                        </div>

                        <form className="w-full h-auto py-10 bg-white rounded-xlpx-0">
                            {/* <h2 className="text-[#333] text-center mt-2.5 mb-2 text-[20px] pb-10">Billing Address</h2> */}

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
                                        {states?.map(st => {
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

                            <div className='w-full h-10 flex gap-3 mb-1'>
                                <div className='w-full relative border border-[#aaa] rounded-lg'>
                                    <label htmlFor="address_type" className='absolute -top-5.5 -left-1 text-[#333] text-[0.93rem] pointer-events-none py-0 px-1 '>Address Type (Home , Office etc)</label>
                                    <input type="text" name="address_type" className="w-full h-full border-0 outline-0 py-0 px-2 rounded-sm bg-transparent text-[#333] z-100 text-[0.9rem]" required value={formData.address_type} onChange={(e) => setFormData(f => ({ ...f, "address_type": e.target.value }))} />
                                </div>
                            </div>

                            <button className="w-full py-2.5 bg-[#333] text-white text-[15px] cursor-pointer hover:bg-black mt-3 flex justify-center items-center">{addLoading ? (<LoadingContainer />) : ('Save')}</button>
                        </form>


                    </div>
                </div>
            </section>
        </>
    )
}

const page = () => {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading address form...</div>}>
            <AddAddressContent />
        </Suspense>
    );
};

export default page
