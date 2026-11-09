import React from 'react'
import ProductFilter from '../../Components/ProductFilter';


const page = async ({ params }) => {
    const { slug } = await params;

    return (
        <>
            {/* STORE */}
            <ProductFilter slug={slug}/>
        </>
    )
}

export default page