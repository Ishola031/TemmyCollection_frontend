import React from 'react'
import Image from "next/image";
import Link from "next/link";
import { FaRegHeart } from "react-icons/fa";
import CollectionProduct from '../Include/CollectionProduct'
const ProductCollectionContainer = ({ col }) => {
    return (
        <section className="w-full h-auto flex px-10 lg:px-15 min-px-3 py-3 max-[740px]:px-5 ">
            <div className="w-full h-full flex flex-col">
                <div className="w-full h-full flex justify-between items-center bg-blue-600 py-1.5 px-3 text-white text-[13px]">
                    <h4>{col.name}</h4>
                    {/* <h4>Time Left: 00h : 00m: 10s</h4> */}
                    <Link href="">See All </Link>
                </div>

                <div className="w-full h-full flex overflow-x-scroll 
                                        [&::-webkit-scrollbar]:w-1
                                        [&::-webkit-scrollbar-track]:bg-transparent 
                                      [&::-webkit-scrollbar-thumb]:bg-gray-300 
                                        [&::-webkit-scrollbar-thumb]:rounded-full
                                        [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent]
                                    ">
                    {col?.product?.map(pr => {
                        return (
                            <CollectionProduct pr={pr} key={`prod_${pr.id}`} />
                        )
                    })}
                </div>

            </div>
        </section>
    )
}

export default ProductCollectionContainer
