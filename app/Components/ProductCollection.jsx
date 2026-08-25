"use client";
import React, { useEffect, useState } from 'react'
import Image from "next/image";
import Link from "next/link";
import useSWR from 'swr';
import { FaRegHeart } from "react-icons/fa";
import ProductCollectionContainer from "../Components/Include/ProductCollectionContainer"
import { useCollections } from '../hook/useCollections'

const ProductCollection = () => {
    const loop = [1, 2, 3]
    const [collection, setCollection] = useState([]);
    const [page, setPage] = useState(1)
    const [errors, setErrors] = useState(null)
    const { data: collections, isLoading } = useCollections(1);

    useEffect(() => {
        if (collections) {
            setCollection(prev => {
                const ids = new Set(prev.map(p => p.id));

                const newCollection = collections?.results?.filter(
                    p => !ids.has(p.id)
                );

                return [...prev, ...newCollection];
            });
        }
    }, [collections]);

    return (
        isLoading ? (
            loop.map(lop => {
                return (
                    <section key={lop} className="w-full h-auto flex px-10 lg:px-15 min-px-3 py-3 max-[740px]:px-5 ">
                        <div className="w-full h-full flex flex-col">
                            <div className="w-full h-full flex justify-between items-center skeleton py-1.5 px-3 text-white text-[13px]">
                                <h4>name</h4>
                            </div>

                            <div className="w-full h-full flex overflow-x-scroll 
                                        [&::-webkit-scrollbar]:w-1
                                        [&::-webkit-scrollbar-track]:bg-transparent 
                                      [&::-webkit-scrollbar-thumb]:bg-gray-300 
                                        [&::-webkit-scrollbar-thumb]:rounded-full
                                        [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent]">
                                <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                    <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                    <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                    <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                                </div>
                                <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                    <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                    <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                    <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                                </div>
                                <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                    <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                    <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                    <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                                </div>
                                <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                    <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                    <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                    <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                                </div>
                                <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                    <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                    <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                    <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                                </div>
                                <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                    <div className="w-full h-40 rounded-xl mb-1.5 skeleton">p</div>
                                    <h2 className="w-[80%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1.5" style={{ lineHeight: '16px' }}>name</h2>
                                    <h2 className="w-[65%] text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis skeleton mb-1" style={{ lineHeight: '16px' }}>name</h2>
                                </div>
                            </div>

                        </div>
                    </ section>
                )
            })
        ) : (
            collection && (
                collection.map(col => {
                    return (
                        <ProductCollectionContainer key={`col-${col.id}`} col={col} />
                    )
                })
            )
        )
    )
}

export default ProductCollection
