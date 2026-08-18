import React from 'react'
import Image from "next/image";
import CheckoutContainer from '../../Components/Cart/CheckoutContainer';

const page = () => {
    return (
        <>
            {/*  */}
            <div className='py-8 max-[740px]:py-12'></div>
            <CheckoutContainer />
        </>
    )
}

export default page