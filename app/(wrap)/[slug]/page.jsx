import React from 'react'
import { IoMdClose } from "react-icons/io";
import Image from "next/image";
import Link from "next/link";
import ProductFilter from '../../Components/ProductFilter';

const page = async ({ params }) => {
    const { slug } = await params;

    return (
        <>
            {/* STORE */}
            <ProductFilter slug={slug} />
        </>
    )
}

export default page