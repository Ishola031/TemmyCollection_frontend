import React from 'react'
import Image from "next/image";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import ProductDetail from '../../../Components/ProductDetail';
const page = async ({ params }) => {
    const { slug } = await params;

    return (
        <>
            {/*  */}
            <ProductDetail slug={slug} />
        </>
    )
}

export default page