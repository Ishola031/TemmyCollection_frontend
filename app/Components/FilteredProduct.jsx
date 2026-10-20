'use client';
import React, { useState } from 'react'

const FilteredProduct = () => {
  const [product, setProduct] = useState([]);

  return (
    <>
       <div className="w-full grid grid-cols-4 pt-6 max-[1280px]:grid-cols-3 max-[970px]:grid-cols-2 max-[480px]:grid-cols-1 gap-5">
            {categoryFilterLoading ? (
                /* Skeleton Loading Cards */
                [1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={`skel-${i}`} className="flex flex-col bg-gray-50/50 rounded-2xl p-3 border border-gray-100 animate-pulse">
                        <div className="w-full aspect-square bg-gray-200 rounded-xl mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-9 bg-gray-200 rounded-xl w-full mt-auto"></div>
                    </div>
                ))
            ) : (
                products?.length > 0 &&
                products.map((pr) => {
                    const inStock = cart?.cartitems?.filter((ct) => {
                        if (ct?.product?.id !== pr?.id) return false;
                        if (pr?.variations?.length > 0) {
                            return pr.variations.some((vr) => vr.id === ct?.variations?.id);
                        }
                        return true;
                    }) || [];

                    const quantity = inStock.reduce((acc, item) => acc + (item.quantity || 0), 0);
                    const discountedPrice = pr.discount ? ((100 - pr.discount) / 100) * pr.price : pr.price;

                    return (
                        <div
                            key={`pr-${pr.id}`}
                            className="group relative flex flex-col justify-between bg-white rounded-2xl border border-gray-100 p-3.5 transition-all duration-300 hover:shadow-xl hover:shadow-gray-100 hover:border-gray-200"
                        >
                            {/* Top Badges & Heart Container */}
                            <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 flex items-center justify-center p-2">
                                {/* Discount Badge */}
                                {pr.discount > 0 && (
                                    <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                                        -{pr.discount}%
                                    </span>
                                )}

                                {/* Wishlist Button */}
                                <button
                                    onClick={() => handleLike(pr?.slug)}
                                    className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-md text-gray-700 hover:text-red-500 hover:bg-white transition-all shadow-sm"
                                >
                                    {pr?.is_Liked ? (
                                        <FaHeart className="text-red-500 text-sm" />
                                    ) : (
                                        <FaRegHeart className="text-sm" />
                                    )}
                                </button>

                                {/* Product Image */}
                                <Link href={`/store/${pr.slug}`} className="w-full h-full flex items-center justify-center">
                                    <Image
                                        src={pr.image}
                                        alt={pr.name || 'Product Image'}
                                        width={180}
                                        height={180}
                                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 ease-out"
                                        unoptimized
                                    />
                                </Link>
                            </div>

                            {/* Product Info */}
                            <div className="flex flex-col grow">
                                <Link href={`/store/${pr.slug}`}>
                                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-10 hover:text-black transition-colors">
                                        {pr.name}
                                    </h3>
                                </Link>

                                {/* Price Section */}
                                <div className="mt-2 mb-3 flex items-baseline gap-2">
                                    <span className="text-base font-bold text-gray-900">
                                        ₦{discountedPrice.toLocaleString('en-NG')}
                                    </span>
                                    {pr.discount > 0 && (
                                        <span className="text-xs text-gray-400 line-through font-normal">
                                            ₦{pr.price.toLocaleString('en-NG')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons & Counter Controls */}
                            <div className="w-full mt-auto">
                                {pr.stock <= 0 ? (
                                    <button disabled className="w-full py-2 bg-gray-100 text-gray-400 text-xs font-semibold rounded-xl cursor-not-allowed">
                                        Out of Stock
                                    </button>
                                ) : inStock.length > 0 ? (
                                    <div className="w-full flex items-center justify-between bg-gray-900 text-white rounded-xl overflow-hidden p-1">
                                        <button
                                            onClick={() => handleRemoveVariation(pr, inStock[0]?.id)}
                                            className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="text-xs font-semibold px-2">
                                            {isItemLoading(pr?.id, inStock[0]?.variations?.id, inStock[0]?.id) ? (
                                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            ) : (
                                                quantity
                                            )}
                                        </span>
                                        <button
                                            onClick={() => handleAddVariations(pr)}
                                            className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleAddVariations(pr)}
                                        className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {isItemLoading(pr?.id, null, null) ? (
                                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        ) : (
                                            "Add to Cart"
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    </>
  )
}

export default FilteredProduct
