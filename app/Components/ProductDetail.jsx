'use client'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import Image from "next/image";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import useSWR from 'swr';
import Message from './Message';
import api from '../api/api';
import { AuthContext } from './IsAuth';
import { FaRegHeart, FaHeart } from "react-icons/fa";
import ProductCollectionContainer from "../Components/Include/ProductCollectionContainer"
import { useProductDetail } from '../hook/useProductDetails';
import { useAddToCartItem, useCart, useRemoveCartItem } from '../hook/useCart';
import { productLikeApi, useProductDetailLike, useProductLike } from '../hook/useProductLike';
import { useRouter } from 'next/navigation';
import { Star, StarHalf } from 'lucide-react';
import { useAddProductView } from '../hook/UserProductView';
import CollectionProduct from '../Components/Include/CollectionProduct';

function DisplayStars({ rating }) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
        <div className="flex items-center gap-0.5 text-amber-400">
            {fullStars >= 1 && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
            {fullStars >= 2 && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
            {fullStars >= 3 && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
            {fullStars >= 4 && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
            {fullStars >= 5 && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />}

            {hasHalf && <StarHalf className="w-4 h-4 fill-amber-400 text-amber-400" />}

            {emptyStars >= 1 && <Star className="w-4 h-4 text-gray-300 fill-gray-200" />}
            {emptyStars >= 2 && <Star className="w-4 h-4 text-gray-300 fill-gray-200" />}
            {emptyStars >= 3 && <Star className="w-4 h-4 text-gray-300 fill-gray-200" />}
            {emptyStars >= 4 && <Star className="w-4 h-4 text-gray-300 fill-gray-200" />}
            {emptyStars >= 5 && <Star className="w-4 h-4 text-gray-300 fill-gray-200" />}
        </div>
    );
}

// Clickable Star Input (1, 2, 3, 4, 5 Full Integer Stars Only)
function PlayStoreStarInput({ rating, onSelectRating }) {
    const [hoverValue, setHoverValue] = useState(null);
    const activeRating = hoverValue !== null ? hoverValue : rating;

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((starIndex) => {
                const isSelected = activeRating >= starIndex;

                return (
                    <button
                        key={starIndex}
                        type="button"
                        className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none select-none"
                        onMouseEnter={() => setHoverValue(starIndex)}
                        onMouseLeave={() => setHoverValue(null)}
                        onClick={() => onSelectRating(starIndex)}
                    >
                        <Star
                            className={`w-7 h-7 ${isSelected
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300 fill-gray-100'
                                }`}
                        />
                    </button>
                );
            })}
            <span className="ml-2 text-sm font-semibold text-gray-700">
                {/* {activeRating > 0 ? `${activeRating} Star${activeRating > 1 ? 's' : ''}` : 'Select'} */}
                {activeRating > 0 && `${activeRating} Star${activeRating > 1 ? 's' : ''}`}
            </span>
        </div>
    );
}


const ProductDetail = ({ slug }) => {
    // USESTATE
    const [relatedProduct, setRelatedProduct] = useState([])
    const [selectedColor, setSelectedColor] = useState(0)
    const [selectedSize, setSelectedSize] = useState(0)
    const [stock, setStock] = useState(1)
    const [loading, setLoading] = useState(false)
    const [pError, setPError] = useState(null)
    const [addLoading, setAddLoading] = useState(false)
    const [reviewLoading, setReviewLoading] = useState(true)
    const [addReviewLoading, setAddReviewLoading] = useState(false)
    const [added, setAdded] = useState(false)
    const [error, setError] = useState(null);
    const [showdetails, SetShowDetails] = useState(true);
    const [userRating, setUserRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviews, setReviews] = useState([]);


    // PRODUCT
    const [product, setProduct] = useState({})
    const [message, setMessage] = useState(null)


    // HOOKS
    const { isAuthenticated } = useContext(AuthContext)
    const { data: cart, isLoading: loadingCart } = useCart(isAuthenticated)
    const { data, isLoading } = useProductDetail(slug);
    const productDetailLike = useProductDetailLike();
    const addproductViewed = useAddProductView()
    const addcartfetch = useAddToCartItem(isAuthenticated, setMessage);
    const handleCartItemDecrement = useRemoveCartItem(isAuthenticated);
    const productLikeFetch = useProductLike();



    // PACKAGES
    const router = useRouter();

    // PRODUCT
    useEffect(() => {
        setProduct(data?.product)
    }, [data])

    // AVAILABLE COLORS
    const availableColors = useMemo(() => {
        if (!product?.variations) return [];

        const unique = {};

        product.variations.forEach(v => {
            if (v.color) {
                unique[v.color.id] = v.color;
            }
        });

        return Object.values(unique);
    }, [product]);

    // AVAILABLE SIZES
    const availableSizes = useMemo(() => {
        if (!product?.variations || !selectedColor) return [];
        setAdded(false)
        setStock(1)

        const unique = {};

        product.variations
            .filter(v => v.color.id === selectedColor)
            .forEach(v => {
                if (v.size) {
                    unique[v.size.id] = v.size;
                }
            });

        return Object.values(unique);
    }, [product, selectedColor]);

    // SELECTED VARIANT
    const selectedVariant = useMemo(() => {
        if (!selectedColor) return null;
        return product?.variations?.find(
            v => {
                if (v.color && v.size) {
                    return v.color.id === selectedColor &&
                        v.size.id === selectedSize
                } else {
                    return v.color.id === selectedColor
                }

            }
        );
    }, [product, selectedColor, selectedSize]);

    // IN CART ITEM
    const inCartItem = useMemo(() => {
        // Directly returns the item matching the chosen variant instantly
        if (product?.variations?.length > 0) {
            if (!cart?.cartitems || cart.cartitems.length === 0 || !selectedVariant) {
                return {};
            }
            return cart.cartitems.find(ct => ct?.variations?.id === selectedVariant?.id) || null;
        }
        else {
            if (cart?.cartitems?.length > 0) {
                return cart?.cartitems.find(ct => ct?.product?.id === product?.id)
            }
            return {}

        }
    }, [product, selectedVariant, cart]);

    const handleAddToCart = (product, variation, cartItemId = null) => {
        addcartfetch.mutate({ product, variation, cartItemId });
    };

    const handleRemoveCartItem = (cartitemId, deleteItem = false) => {
        const resolvedCartId = localStorage.getItem('cart_id');
        handleCartItemDecrement.mutate({
            cartitemId,
            cartID: resolvedCartId,
            deleteItem
        });
    };

    const HandleStock = (assign) => {
        if (assign === "add") {
            if (availableColors.length > 0) {
                if (selectedColor !== 0) {
                    if (availableSizes.length > 0) {
                        if (selectedSize !== 0) {
                            if (cart === null) {
                                handleAddToCart(product.id, selectedVariant?.id || null)
                            } else {
                                handleAddToCart(product.id, selectedVariant?.id || null, cart)
                            }

                        } else {
                            setMessage("Please select a size")
                        }
                    } else {
                        if (cart === null) {
                            handleAddToCart(product.id, selectedVariant?.id || null)
                        } else {
                            handleAddToCart(product.id, selectedVariant?.id || null, cart)
                        }
                    }
                } else {
                    setMessage("Please select a color")
                }
            } else {
                // addcartfetch();
                if (cart === null) {
                    handleAddToCart(product.id, selectedVariant?.id || null)
                } else {
                    handleAddToCart(product.id, selectedVariant?.id || null, cart)
                }
            }
        }

        if (assign === "substract") {
            if (availableColors.length > 0) {
                if (selectedColor !== 0) {
                    if (availableSizes.length > 0) {
                        if (selectedSize !== 0) {
                            handleRemoveCartItem(inCartItem.id)
                        } else {
                            setMessage("Please select a size")
                        }
                    } else {
                        handleRemoveCartItem(inCartItem.id)
                    }
                } else {
                    setMessage("Please select a color")
                }
            } else {
                handleRemoveCartItem(inCartItem.id)
            }
        };
    }

    useEffect(() => {
        // console.log('cart', cart)
        // console.log('', reviews)
        // console.log('', data)

    }, [selectedVariant, inCartItem, product, reviews])

    const handleLike = (productSlug) => {
        if (!isAuthenticated) router.push('/signin')
        productDetailLike.mutate({ productSlug })
    };

    useEffect(() => {
        const fetchReviews = async () => {
            setReviewLoading(true)
            try {
                const res = await api.get(`api/p/productreview/?p=${product?.id}`)
                setReviews(res.data)
                setComment('')
                setUserRating(0)
            } catch (error) {
                console.error(error)
            } finally {
                setReviewLoading(false)
            }
        };
        if (product?.id) fetchReviews()
    }, [product])

    const Review = async () => {
        try {
            setAddReviewLoading(true)
            const res = await api.post('api/p/adduserreview/', {
                params: {
                    'product': product?.id,
                    'rating': userRating,
                    'comment': comment,
                }
            })
            setReviews(vl => ({ ...vl, data: ([...vl.data, res.data]) }))
            setComment('')
            setUserRating(0)
        } catch (error) {
            console.error(error)
        } finally {
            setAddReviewLoading(false)
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userRating <= 0) {
            setMessage('Rate the product')
            return
        }
        if (!product?.id || comment === '') return
        Review()
    };

    const timeAgo = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const seconds = Math.floor((now - past) / 1000);

        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return past.toLocaleDateString();
    }

    const handleProductViewed = (product) => {
        addproductViewed.mutate({ product })
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            handleProductViewed(product?.id)
        }, 5000);

        return () => clearTimeout(timer);
    }, [product])

    return (
        <>
            {/* PRODUCT DETAIL */}
            <Message message={message} setError={setMessage} />
            <section className="w-full h-auto flex px-10 lg:px-15 min-px-3 pb-5 pt-25 max-[740px]:pt-30 max-[740px]:placeholder-teal-300 max-[740px]:px-5">
                <div className="w-full h-full flex gap-7 max-[740px]:flex-col ">
                    {isLoading ? (
                        <>
                            <div className="w-[45%] flex flex-col gap-2 max-[740px]:w-full">
                                <div className="w-full h-90 skeleton">

                                </div>
                            </div>

                            <div className="w-[55%] max-[740px]:w-full">
                                <p className="mb-1.5 skeleton w-30">Jean</p>
                                <p className="mb-1.5 skeleton w-[70%] h-10">Jean</p>
                                <p className="mb-4 skeleton w-[40%] h-10">Jean</p>

                                <p className="mb-1.5 skeleton w-30">Jean</p>
                                <p className="mb-2 skeleton w-[70%]">Jean</p>

                                <p className="mb-1.5 skeleton w-20">Color</p>
                                <p className="mb-2 skeleton w-[30%] h-10">Jean</p>
                                <p className="mb-2 skeleton w-[35%] h-15">Jean</p>
                                <div className='flex items-center gap-3'>
                                    <p className="mb-1.5 skeleton w-[40%] h-10">Jean</p>
                                    <p className="mb-1.5 skeleton w-[10%] h-10">Jean</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-[45%] flex flex-col gap-2 max-[740px]:w-full">
                                <div className="w-full h-75">
                                    {/* <Image src={`${product?.image}`} width={100} height={100} alt="" className="w-full h-full object-contain" unoptimized /> */}
                                    <img
                                        src={`http://127.0.0.1:8000${product?.image}` || null}
                                        alt={product?.name || 'Product Image'}
                                        width={100}
                                        height={100}
                                        className="w-full h-full object-contain"
                                        unoptimized="true"
                                    />
                                </div>
                                {/* <div className="w-full h-20 flex gap-1">
                                    <div className="border-2 border-blue-600 w-[24%] h-full rounded-xl p-1"><img src={`http://127.0.0.1:8000${product?.image}` || null} alt={null} width={100} height={100} className="w-full h-full rounded-xl" unoptimized /></div>
                                    <div className="border-2 border-black/50 w-[24%] h-full rounded-xl p-1"><img src={`http://127.0.0.1:8000${product?.image}` || null} alt={null} width={100} height={100} className="w-full h-full rounded-xl" unoptimized /></div>
                                    <div className="border-2 border-blue-600 w-[24%] h-full rounded-xl p-1"><img src={`http://127.0.0.1:8000${product?.image}` || null} alt={null} width={100} height={100} className="w-full h-full rounded-xl" unoptimized /></div>
                                    <div className="border-2 border-black/50 w-[24%] h-full rounded-xl p-1"><img src={`http://127.0.0.1:8000${product?.image}` || null} alt={null} width={100} height={100} className="w-full h-full rounded-xl" unoptimized /></div>
                                </div> */}
                            </div>

                            <div className="w-[55%] max-[740px]:w-full relative">
                                {/* PRODUCT NAME */}
                                <p className="mb-0">{product?.category?.name}</p>

                                {/* OUT OF STOCK */}
                                <div className="flex items-center">
                                    <h3 className="pr-4 uppercase text-[1.8rem] leading-7">{product?.name}</h3>
                                    {product?.variations === null || product?.variations?.length <= 0 ? (
                                        product?.stock <= 0 && (<h4 className="py-1.5 px-3 border-2 border-red-600 rounded-xl" >OUT OF STOCK </h4>)
                                    ) : (
                                        selectedVariant?.id && (
                                            selectedVariant.stock <= 0 && (<h4 className="py-1.5 px-3 border-2 border-red-600 rounded-xl" >OUT OF STOCK </h4>)
                                        )
                                    )}
                                </div>

                                {/* PRICE */}
                                <div className="text-[1rem] flex items-center">
                                    {product?.variations?.length > 0 ? (
                                        selectedVariant?.id ? (
                                            product?.discount > 0 ? (
                                                <>
                                                    <h2 className="text-[1.8rem]">N{(((100 - product?.discount) / 100) * selectedVariant?.price).toLocaleString('en-NG')}</h2> &nbsp;<strike>N{parseInt(selectedVariant?.price).toLocaleString('en-NG')}</strike>
                                                    <div className='py-1.5 px-2 bg-amber-500 text-[13px] ml-2'>-{product?.discount}%</div>
                                                </>
                                            ) : (
                                                <>
                                                    <h2 className="text-[1.8rem]">N{parseInt(selectedVariant?.price)?.toLocaleString('en-NG') || 0.00}</h2>
                                                </>
                                            )
                                        ) : (
                                            product?.discount > 0 ? (
                                                <>
                                                    <h2 className="text-[1.8rem]">N{(((100 - product?.discount) / 100) * product?.price).toLocaleString('en-NG')}</h2> &nbsp;<strike>N{product?.price.toLocaleString('en-NG')}</strike>
                                                    <div className='py-1.5 px-2 bg-amber-500 text-[13px] ml-2'>-{product?.discount}%</div>
                                                </>
                                            ) : (
                                                <>
                                                    <h2 className="text-[1.8rem]">N{product?.price?.toLocaleString('en-NG') || 0.00}</h2>
                                                </>
                                            )
                                        )
                                    ) : (
                                        product?.discount > 0 ? (
                                            <>
                                                <h2 className="text-[1.8rem]">N{(((100 - product?.discount) / 100) * product?.price).toLocaleString('en-NG')}</h2> &nbsp;<strike>N{product?.price.toLocaleString('en-NG')}</strike>
                                                <div className='py-1.5 px-2 bg-amber-500 text-[13px] ml-2'>-{product?.discount}%</div>
                                            </>
                                        ) : (
                                            <>
                                                <h2 className="text-[1.8rem]">N{product?.price?.toLocaleString('en-NG') || 0.00}</h2>
                                            </>
                                        )
                                    )}
                                </div>

                                {/* DESCRIPTION */}
                                <h4 className="mt-2 font-semibold">DESCRIPTION</h4>
                                <p className="text-justify mb-2">
                                    {product?.description}
                                </p>

                                {/* VARIATIONS */}
                                <div className={`w-full h-auto flex items-center ${availableColors.length <= 0 && ('hidden')}`}>
                                    <div className="w-auto py-4 px-0">
                                        <p className="text-[13px] text-left mb-1 pl-1">Color</p>
                                        <select className="w-40 p-2.5 border outline-0 border-[#eee] mr-2.5"
                                            value={selectedColor}
                                            onChange={(e) => {
                                                setSelectedColor(Number(e.target.value));
                                                setSelectedSize(0);
                                            }}>
                                            <option value={0}>Select Color</option>
                                            {availableColors.map((color) => (
                                                <option key={color.id} value={color.id}>
                                                    {color.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={`w-auto py-4 px-0 ${!selectedColor && ('hidden')} ${availableSizes.length <= 0 && ('hidden')}`}>
                                        <p className="text-[13px] text-left mb-1 pl-1">Size</p>
                                        <select className={`w-40 p-2.5 border outline-0 border-[#eee] mr-2.5`}
                                            value={selectedSize}
                                            onChange={(e) => setSelectedSize(Number(e.target.value))}
                                            disabled={!selectedColor}>
                                            <option value={0}>Select Size</option>
                                            {availableSizes.map((size) => (
                                                <option key={size.id} value={size.id}>
                                                    {size.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* ADD QUANTITY */}
                                <div className="flex">
                                    {inCartItem?.id ? (
                                        product?.variations === null || product?.variations.length <= 0 ? (
                                            product?.stock > 0 && (
                                                <div className="w-full h-auto flex items-center">
                                                    <div className="flex gap-0.5">
                                                        <button className="w-11 py-2 px-2.5 cursor-pointer outline-0 bg-[#333] text-white" onClick={() => HandleStock("substract")}>-</button>
                                                        <div className="w-11 border-0 flex items-center justify-center">
                                                            {handleCartItemDecrement?.isPending || addcartfetch?.isPending ? (<div className="h-4 w-4 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />) : (
                                                                <p className="text-[15px]">{inCartItem.quantity}</p>
                                                            )}

                                                        </div>
                                                        <button className="w-11 py-2 px-2.5 cursor-pointer outline-0 bg-[#333] text-white" onClick={() => HandleStock("add", inCartItem?.id)}>+</button>
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            selectedVariant?.id && (
                                                selectedVariant.stock > 0 && (
                                                    <div className="w-full h-auto flex items-center">
                                                        <div className="flex gap-0.5">
                                                            <button className="w-11 py-2 px-2.5 cursor-pointer outline-0 bg-[#333] text-white" onClick={() => HandleStock("substract")}>-</button>
                                                            <div className="w-11 border-0 flex items-center justify-center">
                                                                {handleCartItemDecrement?.isPending || addcartfetch?.isPending ? (<div className="h-4 w-4 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />) : (
                                                                    <p className="text-[15px]">{inCartItem.quantity}</p>
                                                                )}

                                                            </div>
                                                            <button className="w-11 py-2 px-2.5 cursor-pointer outline-0 bg-[#333] text-white" onClick={() => HandleStock("add", inCartItem?.id)}>+</button>
                                                        </div>
                                                    </div>
                                                )
                                            )
                                        )
                                    ) : (
                                        product?.variations === null || product?.variations?.length <= 0 ? (
                                            product?.stock > 0 && (<button className="w-50 p-3 mt-2.5 border-0 rounded-xl cursor-pointer bg-[#333] text-white" onClick={() => HandleStock("add", null)}> Add To Cart</button>)
                                        ) : (
                                            selectedVariant?.id && (
                                                selectedVariant.stock > 0 && (<button className="w-50 p-3 mt-2.5 border-0 rounded-xl cursor-pointer bg-[#333] text-white" onClick={() => HandleStock("add", null)}> Add To Cart</button>)
                                            )
                                        )
                                    )}
                                </div>

                                <div className="product-heart text-[24px] absolute -top-1 right-1 cursor-pointer">
                                    {product?.is_Liked ? (
                                        <FaHeart onClick={() => handleLike(product?.slug)} className='text-red-600' />
                                    ) : (
                                        <FaRegHeart onClick={() => handleLike(product?.slug)} className='' />
                                    )}
                                </div>

                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* DESCRIPTION */}
            <section className='w-full h-auto px-10 lg:px-15 min-px-3 pb-5 pt-5 max-[740px]:placeholder-teal-300 max-[740px]:px-5'>
                <div className='w-full flex flex-col justify-center items-center'>
                    <div className='flex'>
                        <h4 className={`cursor-pointer pr-15 ${showdetails && ('font-bold')}`} onClick={() => SetShowDetails(true)}>DETAILS</h4>
                        <h4 className={`cursor-pointer ${!showdetails && ('font-bold')}`} onClick={() => SetShowDetails(false)}>ITEM DESCRIRTION</h4>
                    </div>
                    {showdetails ? (
                        <div className='w-full py-3 px-10 flex flex-col gap-1 max-[740px]:px-0'>
                            {product?.specs?.length > 0 ? (
                                product?.specs?.map(spec => {
                                    return (
                                        <div key={`specs_${spec?.id}`} className='flex items-center gap-3'>
                                            <div className='min-w-30 w-[25%] py-1 px-3 bg-[#333] text-white'>{spec?.key?.name}</div>
                                            <div>{spec?.value}</div>
                                        </div>
                                    )
                                })
                            ) : (<p>No Specification for this product</p>)}

                        </div>
                    ) : (
                        <div className='w-full py-3 px-10 max-[740px]:px-0'>
                            <h4 >{product?.description}</h4>
                        </div>
                    )}
                </div>
            </section>

            {/* REVIEWS AND  */}
            <section className="w-full flex flex-col px-5 sm:px-10 lg:px-16 pb-5">
                {/* OVERALL RATINGS */}
                {reviews?.total_reviews > 0 && (
                    <div className="w-full bg-white py-6 px-4 rounded-2xl shadow-sm mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
                            {/* Left Side: Big Average Number & Summary Stars */}
                            <div className="flex flex-col items-center justify-center min-w-30">
                                <span className="text-6xl font-bold text-gray-900 tracking-tight">
                                    {reviews?.overAll?.toFixed(1)}
                                </span>

                                <div className="flex items-center gap-1 mt-2 text-amber-400">
                                    {/* {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-4 h-4 ${star <= Math.floor(averageRating)
                                            ? 'fill-amber-400 text-amber-400'
                                            : star - averageRating <= 0.5
                                                ? 'fill-amber-400/50 text-amber-400'
                                                : 'fill-gray-200 text-gray-200'
                                            }`}
                                    />
                                ))} */}
                                    <DisplayStars rating={reviews?.overAll} />
                                </div>

                                <span className="text-xs text-gray-500 mt-1 font-medium">
                                    {reviews?.total_reviews?.toLocaleString()} ratings
                                </span>
                            </div>

                            {/* Right Side: Play Store Horizontal Progress Bars */}
                            <div className="flex-1 flex flex-col gap-2">
                                {reviews?.star?.map((starCount, index) => {
                                    const percentage = reviews?.total_reviews > 0 ? (starCount?.star / reviews?.total_reviews) * 100 : 0;

                                    return (
                                        <div key={index} className="flex items-center gap-3 text-xs font-medium text-gray-600">
                                            {/* Star Number Label */}
                                            <span className="w-3 text-right">{starCount?.id}</span>

                                            {/* Micro Star Icon */}
                                            <Star className="w-3 h-3 fill-gray-400 text-gray-400" />

                                            {/* Progress Bar Container */}
                                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
                                                <div
                                                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="w-full py-3 border-b border-gray-200">
                    <h4 className="font-semibold text-xl text-gray-800">Verified Customer Feedback</h4>
                </div>

                {/* Reviews List */}
                <div className="w-full flex flex-col py-4 gap-6">
                    {reviewLoading ? (
                        <div className='w-full h-20 flex justify-center items-center'>
                            <div className="h-5.5 w-5.5 animate-spin rounded-full border-4 border-gray-200 border-t-[#333]" />
                        </div>
                    ) : (
                        reviews?.data?.length > 0 ? (
                            reviews?.data?.map(review => {
                                return (
                                    <div key={`rating_${review.id}`} className="flex gap-4 border-b border-gray-100 pb-4">
                                        <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden border border-gray-300">
                                            {/* <Image
                                                src="/avatar-placeholder.png"
                                                alt="MD MERAJ"
                                                width={48}
                                                height={48}
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            /> */}
                                            <div className="w-full h-full rounded-full bg-black/5 font-semibold text-gray-800 text-sm flex items-center justify-center">
                                                {review.user.username.split(" ").map(n => n[0]).join("")}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="font-medium text-gray-900 leading-tight">{review?.user?.username}</h5>
                                                    <p className="text-xs text-gray-500 mt-0.5">{timeAgo(review?.created_at)}</p>
                                                </div>
                                                <DisplayStars rating={review.rating} />
                                            </div>

                                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                                {review.comment}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (<p>No Review</p>)
                    )}

                </div>

                {/* Form with 1-5 Integer Star Selection */}
                {product?.id && (
                    isAuthenticated ? (
                        data?.productPurchase ? (
                            <form onSubmit={handleSubmit} className="pt-4 border-t border-gray-200 flex flex-col gap-4">
                                <h4 className="font-semibold text-lg text-gray-800">Add a review</h4>

                                {/* Hidden form input for standard form submission */}
                                <input type="hidden" name="rating" value={userRating} />

                                {/* Interactive Play Store Style Star Rating */}
                                <div className="flex flex-col gap-1">
                                    {/* <label className="text-sm font-medium text-gray-600">Tap to rate:</label> */}
                                    <PlayStoreStarInput rating={userRating} onSelectRating={setUserRating} />
                                </div>

                                <textarea
                                    placeholder="Write your review here..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full h-24 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    required
                                ></textarea>

                                <div>
                                    {addReviewLoading ? (
                                        <button
                                            type="botton"
                                            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors cursor-pointer"
                                        >
                                            Submitting
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors cursor-pointer"
                                        >
                                            Submit Review
                                        </button>
                                    )}
                                </div>
                            </form>
                        ) : (<p>Purchase the product to write a review</p>)
                    ) : (<p>Sign in to write a review</p>)
                )}

            </section>

            {/* RELATED PRODUCTS */}
            {data?.relatedProduct?.length > 0 && (
                <section className="w-full h-auto flex px-10 lg:px-15 min-px-3 py-3 max-[740px]:px-5 ">
                    <div className="w-full h-full flex flex-col">
                        <div className="w-full h-full flex justify-between items-center bg-blue-600 py-1.5 px-3 text-white text-[13px]">
                            <h4>Related Products</h4>
                            {/* <Link href="">See All </Link> */}
                        </div>

                        <div className="w-full h-full flex overflow-x-scroll 
                                        [&::-webkit-scrollbar]:w-1
                                        [&::-webkit-scrollbar-track]:bg-transparent 
                                      [&::-webkit-scrollbar-thumb]:bg-gray-300 
                                        [&::-webkit-scrollbar-thumb]:rounded-full
                                        [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent]
                                    ">
                            {data?.relatedProduct?.map(rproduct => {
                                return (
                                    <CollectionProduct pr={rproduct} key={`prod_${rproduct.id}`} />
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* RECENT VIEWED PRODUCTS */}
            {data?.recentProductViewed?.length > 0 && (
                <section className="w-full h-auto flex px-10 lg:px-15 min-px-3 py-3 max-[740px]:px-5 ">
                    <div className="w-full h-full flex flex-col">
                        <div className="w-full h-full flex justify-between items-center bg-blue-600 py-1.5 px-3 text-white text-[13px]">
                            <h4>Recently Viewed</h4>
                            {/* <Link href="">See All </Link> */}
                        </div>

                        <div className="w-full h-full flex overflow-x-scroll 
                                        [&::-webkit-scrollbar]:w-1
                                        [&::-webkit-scrollbar-track]:bg-transparent 
                                      [&::-webkit-scrollbar-thumb]:bg-gray-300 
                                        [&::-webkit-scrollbar-thumb]:rounded-full
                                        [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent]
                                    ">
                            {data?.recentProductViewed?.map(recentproductv => {
                                return (
                                    <CollectionProduct pr={recentproductv?.product} key={`prod_${recentproductv.id}`} />
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}
        </>
    )
}

export default ProductDetail
