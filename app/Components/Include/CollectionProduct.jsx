import React from 'react'
import Link from "next/link";
import Image from "next/image";
const CollectionProduct = ({ pr }) => {
    return (
        <div className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
            <div className="w-full h-40 rounded-xl mb-0.5">
                <Link href={`/store/${pr.slug}`}><img src={`http://127.0.0.1:8000${pr?.image}`} width={100} height={100} alt={`${pr.name}`} className="w-full h-full object-contain rounded-xl" unoptimized={true} /></Link>
            </div>
            <h2 className="text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis" style={{ lineHeight: '16px' }}>{pr.name}</h2>
            <div className="">
                {pr.discount > 0 ? (
                    <h2 className="text-[16px] flex items-center gap-1 font-semibold">N{(((100 - pr?.discount) / 100) * pr?.price).toLocaleString('en-NG')} <span className="text-[11px] font-normal"><del>N{pr.price.toLocaleString('en-NG')}</del></span></h2>
                ) : (
                    <h2 className="text-[16px] font-semibold"><del>N</del>{pr?.price?.toLocaleString('en-NG')}</h2>
                )}
            </div>
            {pr.discount > 0 && (
                <div className="absolute top-4.5 right-2.5 bg-amber-300 text-[12px] py-1 px-1.5">
                    <h3>-{pr.discount}%</h3>
                </div>
            )}
        </div>
    )
}

export default CollectionProduct
