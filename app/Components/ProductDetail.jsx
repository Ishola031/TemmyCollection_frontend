"use client"

import React, {
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react"
import Link from "next/link"
import { FaHeart, FaRegHeart } from "react-icons/fa"
import {
    Star,
    StarHalf,
    Minus,
    Plus,
    ShoppingBag,
    Check,
    ChevronRight,
    ChevronLeft,
} from "lucide-react"

import api from "../api/api"
import Message from "./Message"
import { AuthContext } from "./IsAuth"
import CollectionProduct from "../Components/Include/CollectionProduct"
import { useProductDetail } from "../hook/useProductDetails"
import {
    useAddToCartItem,
    useCart,
    useRemoveCartItem,
} from "../hook/useCart"
import { useProductDetailLike } from "../hook/useProductLike"
import { useRouter } from "next/navigation"
import { useAddProductView } from "../hook/UserProductView"


function DisplayStars({ rating }) {
    const fullStars = Math.floor(rating || 0)
    const hasHalf = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)

    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: fullStars }).map((_, index) => (
                <Star
                    key={`full-${index}`}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                />
            ))}

            {hasHalf && (
                <StarHalf className="w-4 h-4 fill-amber-400 text-amber-400" />
            )}

            {Array.from({ length: emptyStars }).map((_, index) => (
                <Star
                    key={`empty-${index}`}
                    className="w-4 h-4 fill-gray-100 text-gray-300"
                />
            ))}
        </div>
    )
}


function PlayStoreStarInput({ rating, onSelectRating }) {
    const [hoverValue, setHoverValue] = useState(null)

    const activeRating =
        hoverValue !== null ? hoverValue : rating

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((starIndex) => {
                const isSelected = activeRating >= starIndex

                return (
                    <button
                        key={starIndex}
                        type="button"
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                        onMouseEnter={() => setHoverValue(starIndex)}
                        onMouseLeave={() => setHoverValue(null)}
                        onClick={() => onSelectRating(starIndex)}
                    >
                        <Star
                            className={`w-7 h-7 ${
                                isSelected
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-gray-100 text-gray-300"
                            }`}
                        />
                    </button>
                )
            })}

            {activeRating > 0 && (
                <span className="ml-2 text-sm font-semibold text-gray-600">
                    {activeRating} Star{activeRating > 1 ? "s" : ""}
                </span>
            )}
        </div>
    )
}


const ProductDetail = ({ slug }) => {
    const [selectedColor, setSelectedColor] = useState(0)
    const [selectedSize, setSelectedSize] = useState(0)

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)

    const [showdetails, SetShowDetails] = useState(true)

    const [userRating, setUserRating] = useState(0)
    const [comment, setComment] = useState("")
    const [reviews, setReviews] = useState([])

    const [reviewLoading, setReviewLoading] = useState(true)
    const [addReviewLoading, setAddReviewLoading] = useState(false)

    const [product, setProduct] = useState({})
    const [selectedImage, setSelectedImage] = useState(0)

    const { isAuthenticated } = useContext(AuthContext)

    const { data: cart } = useCart(isAuthenticated)
    const { data, isLoading } = useProductDetail(slug)

    const productDetailLike = useProductDetailLike()

    const addcartfetch = useAddToCartItem(
        isAuthenticated,
        setMessage
    )

    const handleCartItemDecrement =
        useRemoveCartItem(isAuthenticated)

    const addproductViewed = useAddProductView()

    const router = useRouter()


    useEffect(() => {
        if (data?.product) {
            setProduct(data.product)
            setSelectedImage(0)
        }
    }, [data])


    /*
    PRODUCT IMAGES
    */

    const productImages = useMemo(() => {
        const images = []

        if (product?.images?.length > 0) {
            product.images.forEach((item) => {
                if (item?.image) {
                    images.push(item.image)
                }
            })
        }

        if (
            product?.image &&
            !images.includes(product.image)
        ) {
            images.unshift(product.image)
        }

        return images
    }, [product])


    const activeImage =
        productImages[selectedImage] ||
        product?.image ||
        "/images/product-placeholder.jpg"


    /*
    AVAILABLE COLORS
    */

    const availableColors = useMemo(() => {
        if (!product?.variations) return []

        const unique = {}

        product.variations.forEach((v) => {
            if (v.color) {
                unique[v.color.id] = v.color
            }
        })

        return Object.values(unique)
    }, [product])


    /*
    AVAILABLE SIZES
    */

    const availableSizes = useMemo(() => {
        if (!product?.variations || !selectedColor) {
            return []
        }

        const unique = {}

        product.variations
            .filter(
                (v) =>
                    v.color?.id === selectedColor
            )
            .forEach((v) => {
                if (v.size) {
                    unique[v.size.id] = v.size
                }
            })

        return Object.values(unique)
    }, [product, selectedColor])


    /*
    RESET SIZE
    */

    useEffect(() => {
        setSelectedSize(0)
    }, [selectedColor])


    /*
    SELECTED VARIANT
    */

    const selectedVariant = useMemo(() => {
        if (!selectedColor) return null

        return product?.variations?.find((v) => {
            if (v.color && v.size) {
                return (
                    v.color.id === selectedColor &&
                    v.size.id === selectedSize
                )
            }

            return v.color?.id === selectedColor
        })
    }, [
        product,
        selectedColor,
        selectedSize,
    ])


    /*
    CART ITEM
    */

    const inCartItem = useMemo(() => {
        if (product?.variations?.length > 0) {
            if (!cart?.cartitems || !selectedVariant) {
                return {}
            }

            return (
                cart.cartitems.find(
                    (ct) =>
                        ct?.variations?.id ===
                        selectedVariant?.id
                ) || null
            )
        }

        if (cart?.cartitems?.length > 0) {
            return cart.cartitems.find(
                (ct) =>
                    ct?.product?.id === product?.id
            )
        }

        return {}
    }, [
        product,
        selectedVariant,
        cart,
    ])


    /*
    PRICE
    */

    const currentPrice =
        selectedVariant?.price ||
        product?.price ||
        0

    const discountedPrice =
        product?.discount > 0
            ? ((100 - product.discount) / 100) *
              currentPrice
            : currentPrice


    /*
    STOCK
    */

    const currentStock =
        selectedVariant?.stock ??
        product?.stock ??
        0


    /*
    ADD TO CART
    */

    const handleAddToCart = (
        productId,
        variation,
        cartItemId = null
    ) => {
        addcartfetch.mutate({
            product: productId,
            variation,
            cartItemId,
        })
    }


    /*
    REMOVE FROM CART
    */

    const handleRemoveCartItem = (
        cartitemId,
        deleteItem = false
    ) => {
        const resolvedCartId =
            localStorage.getItem("cart_id")

        handleCartItemDecrement.mutate({
            cartitemId,
            cartID: resolvedCartId,
            deleteItem,
        })
    }


    /*
    CART ACTION
    */

    const HandleStock = (assign) => {
        if (assign === "add") {
            if (
                availableColors.length > 0 &&
                !selectedColor
            ) {
                setMessage("Please select a color")
                return
            }

            if (
                availableSizes.length > 0 &&
                !selectedSize
            ) {
                setMessage("Please select a size")
                return
            }

            handleAddToCart(
                product.id,
                selectedVariant?.id || null,
                cart
            )

            return
        }

        if (assign === "substract") {
            if (!inCartItem?.id) return

            handleRemoveCartItem(
                inCartItem.id
            )
        }
    }


    /*
    LIKE
    */

    const handleLike = (productSlug) => {
        if (!isAuthenticated) {
            router.push("/signin")
            return
        }

        productDetailLike.mutate({
            productSlug,
        })
    }


    /*
    REVIEWS
    */

    useEffect(() => {
        const fetchReviews = async () => {
            setReviewLoading(true)

            try {
                const res = await api.get(
                    `api/p/productreview/?p=${product?.id}`
                )

                setReviews(res.data)
                setComment("")
                setUserRating(0)
            } catch (error) {
                console.error(error)
            } finally {
                setReviewLoading(false)
            }
        }

        if (product?.id) {
            fetchReviews()
        }
    }, [product])


    /*
    ADD REVIEW
    */

    const Review = async () => {
        try {
            setAddReviewLoading(true)

            const res = await api.post(
                "api/p/adduserreview/",
                {
                    params: {
                        product: product?.id,
                        rating: userRating,
                        comment,
                    },
                }
            )

            setReviews((vl) => ({
                ...vl,
                data: [
                    ...vl.data,
                    res.data,
                ],
            }))

            setComment("")
            setUserRating(0)
        } catch (error) {
            console.error(error)
        } finally {
            setAddReviewLoading(false)
        }
    }


    const handleSubmit = (e) => {
        e.preventDefault()

        if (userRating <= 0) {
            setMessage("Rate the product")
            return
        }

        if (!product?.id || comment === "") {
            return
        }

        Review()
    }


    /*
    TIME AGO
    */

    const timeAgo = (dateString) => {
        const now = new Date()
        const past = new Date(dateString)

        const seconds = Math.floor(
            (now - past) / 1000
        )

        if (seconds < 60) {
            return `${seconds}s ago`
        }

        if (seconds < 3600) {
            return `${Math.floor(seconds / 60)}m ago`
        }

        if (seconds < 86400) {
            return `${Math.floor(seconds / 3600)}h ago`
        }

        if (seconds < 604800) {
            return `${Math.floor(seconds / 86400)}d ago`
        }

        return past.toLocaleDateString()
    }


    /*
    PRODUCT VIEW
    */

    useEffect(() => {
        if (!product?.id) return

        const timer = setTimeout(() => {
            addproductViewed.mutate({
                product: product.id,
            })
        }, 5000)

        return () => clearTimeout(timer)
    }, [product])


    /*
    IMAGE NAVIGATION
    */

    const nextImage = () => {
        if (productImages.length <= 1) return

        setSelectedImage((current) =>
            current === productImages.length - 1
                ? 0
                : current + 1
        )
    }


    const previousImage = () => {
        if (productImages.length <= 1) return

        setSelectedImage((current) =>
            current === 0
                ? productImages.length - 1
                : current - 1
        )
    }


    /*
    LOADING
    */

    if (isLoading) {
        return (
            <section className="w-full min-h-screen px-5 lg:px-15 pt-28 pb-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="h-[500px] skeleton rounded-2xl" />

                        <div className="space-y-5">
                            <div className="h-5 w-28 skeleton" />
                            <div className="h-12 w-3/4 skeleton" />
                            <div className="h-8 w-40 skeleton" />
                            <div className="h-20 w-full skeleton" />
                            <div className="h-12 w-1/2 skeleton" />
                            <div className="h-14 w-48 skeleton" />
                        </div>
                    </div>
                </div>
            </section>
        )
    }


    return (
        <>
            <Message
                message={message}
                setError={setMessage}
            />

            {/* PRODUCT */}

            <section className="w-full pt-28 pb-10 px-5 lg:px-15">
                <div className="max-w-7xl mx-auto">

                    {/* BREADCRUMB */}

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-7">
                        <Link
                            href="/"
                            className="hover:text-black"
                        >
                            Home
                        </Link>

                        <ChevronRight className="w-4 h-4" />

                        <span>
                            {product?.category?.name}
                        </span>
                    </div>


                    <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">

                        {/* PRODUCT IMAGES */}

                        <div className="flex flex-col-reverse sm:flex-row gap-4">

                            {/* THUMBNAILS */}

                            {productImages.length > 1 && (
                                <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[520px] sm:w-20">

                                    {productImages.map(
                                        (image, index) => (
                                            <button
                                                key={`${image}-${index}`}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedImage(index)
                                                }
                                                className={`relative shrink-0 w-20 h-20 sm:w-18 sm:h-18 rounded-xl overflow-hidden border-2 bg-gray-50 transition ${
                                                    selectedImage === index
                                                        ? "border-black"
                                                        : "border-transparent hover:border-gray-300"
                                                }`}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${product?.name} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        )
                                    )}

                                </div>
                            )}


                            {/* MAIN IMAGE */}

                            <div className="flex-1">

                                <div className="relative bg-gray-50 rounded-3xl h-[430px] sm:h-[520px] flex items-center justify-center overflow-hidden">

                                    <img
                                        src={activeImage}
                                        alt={
                                            product?.name ||
                                            "Product Image"
                                        }
                                        className="w-full h-full object-contain p-8 transition-opacity duration-300"
                                    />


                                    {/* DISCOUNT */}

                                    {product?.discount > 0 && (
                                        <div className="absolute top-5 left-5 bg-amber-500 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                                            -{product.discount}%
                                        </div>
                                    )}


                                    {/* IMAGE COUNTER */}

                                    {productImages.length > 1 && (
                                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">
                                            {selectedImage + 1} /{" "}
                                            {productImages.length}
                                        </div>
                                    )}


                                    {/* PREVIOUS */}

                                    {productImages.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={previousImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition cursor-pointer"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                    )}


                                    {/* NEXT */}

                                    {productImages.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition cursor-pointer"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    )}


                                    {/* LIKE */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleLike(product?.slug)
                                        }
                                        className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center cursor-pointer hover:scale-105 transition"
                                    >
                                        {product?.is_Liked ? (
                                            <FaHeart className="text-red-500 text-xl" />
                                        ) : (
                                            <FaRegHeart className="text-gray-700 text-xl" />
                                        )}
                                    </button>

                                </div>

                            </div>

                        </div>


                        {/* PRODUCT INFO */}

                        <div className="flex flex-col">

                            <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide">
                                {product?.category?.name}
                            </p>


                            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight">
                                {product?.name}
                            </h1>


                            {/* RATING */}

                            <div className="flex items-center gap-3 mt-4">
                                <DisplayStars
                                    rating={reviews?.overAll || 0}
                                />

                                <span className="text-sm text-gray-500">
                                    ({reviews?.total_reviews || 0} reviews)
                                </span>
                            </div>


                            {/* PRICE */}

                            <div className="flex items-center gap-3 mt-6">
                                <h2 className="text-3xl font-bold text-gray-900">
                                    N
                                    {discountedPrice.toLocaleString(
                                        "en-NG"
                                    )}
                                </h2>

                                {product?.discount > 0 && (
                                    <>
                                        <span className="text-gray-400 line-through">
                                            N
                                            {Number(
                                                currentPrice
                                            ).toLocaleString(
                                                "en-NG"
                                            )}
                                        </span>

                                        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                                            SAVE {product.discount}%
                                        </span>
                                    </>
                                )}
                            </div>


                            {/* DESCRIPTION */}

                            <div className="mt-7 border-t border-gray-100 pt-6">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    Description
                                </h3>

                                <p className="text-gray-600 leading-7">
                                    {product?.description}
                                </p>
                            </div>


                            {/* COLORS */}

                            {availableColors.length > 0 && (
                                <div className="mt-7">

                                    <div className="flex items-center justify-between mb-3">
                                        <p className="font-semibold text-gray-900">
                                            Color
                                        </p>

                                        {selectedColor !== 0 && (
                                            <span className="text-sm text-gray-500">
                                                {
                                                    availableColors.find(
                                                        (c) =>
                                                            c.id ===
                                                            selectedColor
                                                    )?.name
                                                }
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {availableColors.map(
                                            (color) => (
                                                <button
                                                    key={color.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedColor(
                                                            color.id
                                                        )
                                                    }
                                                    className={`px-4 py-2.5 border rounded-lg text-sm cursor-pointer transition ${
                                                        selectedColor ===
                                                        color.id
                                                            ? "border-black bg-black text-white"
                                                            : "border-gray-200 hover:border-gray-500"
                                                    }`}
                                                >
                                                    {color.name}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}


                            {/* SIZE */}

                            {selectedColor !== 0 &&
                                availableSizes.length > 0 && (
                                    <div className="mt-6">
                                        <p className="font-semibold text-gray-900 mb-3">
                                            Size
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {availableSizes.map(
                                                (size) => (
                                                    <button
                                                        key={size.id}
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedSize(
                                                                size.id
                                                            )
                                                        }
                                                        className={`min-w-12 px-4 py-2.5 border rounded-lg text-sm cursor-pointer transition ${
                                                            selectedSize ===
                                                            size.id
                                                                ? "border-black bg-black text-white"
                                                                : "border-gray-200 hover:border-gray-500"
                                                        }`}
                                                    >
                                                        {size.name}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}


                            {/* STOCK */}

                            <div className="mt-6">
                                {currentStock > 0 ? (
                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                        <Check className="w-4 h-4" />
                                        In stock
                                    </div>
                                ) : (
                                    <div className="text-sm text-red-500 font-medium">
                                        Out of stock
                                    </div>
                                )}
                            </div>


                            {/* CART */}

                            <div className="mt-7">

                                {inCartItem?.id ? (
                                    <div className="flex items-center gap-4">

                                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    HandleStock(
                                                        "substract"
                                                    )
                                                }
                                                className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 cursor-pointer"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>

                                            <div className="w-12 text-center font-semibold">
                                                {handleCartItemDecrement?.isPending ||
                                                addcartfetch?.isPending ? (
                                                    <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
                                                ) : (
                                                    inCartItem.quantity
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    HandleStock(
                                                        "add"
                                                    )
                                                }
                                                className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 cursor-pointer"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>

                                        </div>

                                        <Link
                                            href="/cart"
                                            className="flex-1 h-12 flex items-center justify-center gap-2 bg-black text-white rounded-xl hover:bg-gray-800 transition"
                                        >
                                            <ShoppingBag className="w-5 h-5" />
                                            View Cart
                                        </Link>

                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={
                                            currentStock <= 0 ||
                                            addcartfetch?.isPending
                                        }
                                        onClick={() =>
                                            HandleStock("add")
                                        }
                                        className="w-full h-14 flex items-center justify-center gap-2 bg-black text-white rounded-xl font-medium cursor-pointer hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                                    >
                                        {addcartfetch?.isPending ? (
                                            <>
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingBag className="w-5 h-5" />
                                                Add To Cart
                                            </>
                                        )}
                                    </button>
                                )}

                            </div>


                            {/* SMALL INFO */}

                            <div className="grid grid-cols-2 gap-3 mt-7">

                                <div className="border border-gray-100 rounded-xl p-4">
                                    <p className="text-xs text-gray-400">
                                        Secure Shopping
                                    </p>

                                    <p className="text-sm font-medium mt-1">
                                        Safe & protected
                                    </p>
                                </div>

                                <div className="border border-gray-100 rounded-xl p-4">
                                    <p className="text-xs text-gray-400">
                                        Delivery
                                    </p>

                                    <p className="text-sm font-medium mt-1">
                                        Fast delivery
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            </section>


            {/* DETAILS */}

            <section className="w-full px-5 lg:px-15 py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto">

                    <div className="flex items-center gap-8 border-b border-gray-200">

                        <button
                            type="button"
                            onClick={() =>
                                SetShowDetails(true)
                            }
                            className={`pb-4 text-sm font-semibold cursor-pointer border-b-2 ${
                                showdetails
                                    ? "border-black text-black"
                                    : "border-transparent text-gray-400"
                            }`}
                        >
                            Specifications
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                SetShowDetails(false)
                            }
                            className={`pb-4 text-sm font-semibold cursor-pointer border-b-2 ${
                                !showdetails
                                    ? "border-black text-black"
                                    : "border-transparent text-gray-400"
                            }`}
                        >
                            Description
                        </button>

                    </div>


                    {showdetails ? (
                        <div className="py-7 max-w-4xl">

                            {product?.specs?.length > 0 ? (
                                <div className="border border-gray-200 rounded-xl overflow-hidden">

                                    {product.specs.map(
                                        (spec, index) => (
                                            <div
                                                key={`spec-${spec?.id}`}
                                                className={`grid grid-cols-2 ${
                                                    index !==
                                                    product.specs.length - 1
                                                        ? "border-b border-gray-100"
                                                        : ""
                                                }`}
                                            >
                                                <div className="p-4 bg-gray-100 text-sm font-semibold">
                                                    {spec?.key?.name}
                                                </div>

                                                <div className="p-4 text-sm text-gray-600">
                                                    {spec?.value}
                                                </div>
                                            </div>
                                        )
                                    )}

                                </div>
                            ) : (
                                <p className="text-gray-500">
                                    No specification for this product.
                                </p>
                            )}

                        </div>
                    ) : (
                        <div className="max-w-4xl py-7">
                            <p className="text-gray-600 leading-8">
                                {product?.description}
                            </p>
                        </div>
                    )}

                </div>
            </section>


            {/* REVIEWS */}

            <section className="w-full px-5 lg:px-15 py-12">
                <div className="max-w-7xl mx-auto">

                    <div className="mb-8">
                        <p className="text-sm text-gray-400 uppercase tracking-wider">
                            Customer feedback
                        </p>

                        <h2 className="text-2xl font-semibold mt-1">
                            Reviews & Ratings
                        </h2>
                    </div>


                    {reviews?.total_reviews > 0 && (
                        <div className="grid md:grid-cols-[220px_1fr] gap-10 border-b border-gray-100 pb-10">

                            <div className="flex flex-col items-center justify-center">

                                <span className="text-6xl font-bold">
                                    {reviews?.overAll?.toFixed(1)}
                                </span>

                                <DisplayStars
                                    rating={reviews?.overAll}
                                />

                                <p className="text-sm text-gray-400 mt-2">
                                    {reviews?.total_reviews?.toLocaleString()} ratings
                                </p>

                            </div>


                            <div className="flex flex-col justify-center gap-3">

                                {reviews?.star?.map(
                                    (starCount, index) => {
                                        const percentage =
                                            reviews?.total_reviews > 0
                                                ? (starCount?.star /
                                                      reviews.total_reviews) *
                                                  100
                                                : 0

                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3"
                                            >
                                                <span className="w-3 text-sm text-gray-500">
                                                    {starCount?.id}
                                                </span>

                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />

                                                <div className="flex-1 max-w-xl h-2 bg-gray-100 rounded-full overflow-hidden">

                                                    <div
                                                        className="h-full bg-amber-400 rounded-full"
                                                        style={{
                                                            width: `${percentage}%`,
                                                        }}
                                                    />

                                                </div>

                                                <span className="text-xs text-gray-400">
                                                    {starCount?.star}
                                                </span>
                                            </div>
                                        )
                                    }
                                )}

                            </div>

                        </div>
                    )}


                    {/* REVIEWS LIST */}

                    <div className="py-8">

                        {reviewLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
                            </div>
                        ) : reviews?.data?.length > 0 ? (
                            <div className="flex flex-col gap-7">

                                {reviews.data.map(
                                    (review) => (
                                        <div
                                            key={`review-${review.id}`}
                                            className="flex gap-4 pb-7 border-b border-gray-100"
                                        >

                                            <div className="w-11 h-11 shrink-0 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-sm">
                                                {review?.user?.username
                                                    ?.split(" ")
                                                    .map(
                                                        (n) => n[0]
                                                    )
                                                    .join("")}
                                            </div>

                                            <div className="flex-1">

                                                <div className="flex justify-between gap-5">

                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">
                                                            {review?.user?.username}
                                                        </h4>

                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {timeAgo(
                                                                review?.created_at
                                                            )}
                                                        </p>
                                                    </div>

                                                    <DisplayStars
                                                        rating={
                                                            review.rating
                                                        }
                                                    />

                                                </div>

                                                <p className="text-sm text-gray-600 leading-7 mt-3">
                                                    {review.comment}
                                                </p>

                                            </div>

                                        </div>
                                    )
                                )}

                            </div>
                        ) : (
                            <div className="py-10 text-center text-gray-400">
                                No reviews yet.
                            </div>
                        )}

                    </div>


                    {/* REVIEW FORM */}

                    {product?.id && (
                        isAuthenticated ? (
                            data?.productPurchase ? (
                                <form
                                    onSubmit={handleSubmit}
                                    className="border-t border-gray-100 pt-8 max-w-2xl"
                                >
                                    <h3 className="text-xl font-semibold">
                                        Write a review
                                    </h3>

                                    <p className="text-sm text-gray-400 mt-1 mb-5">
                                        Share your experience with this product.
                                    </p>

                                    <PlayStoreStarInput
                                        rating={userRating}
                                        onSelectRating={
                                            setUserRating
                                        }
                                    />

                                    <textarea
                                        placeholder="Write your review here..."
                                        value={comment}
                                        onChange={(e) =>
                                            setComment(
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-32 mt-5 border border-gray-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-black"
                                        required
                                    />

                                    <button
                                        type="submit"
                                        disabled={addReviewLoading}
                                        className="mt-4 px-6 py-3 bg-black text-white rounded-xl text-sm font-medium cursor-pointer disabled:bg-gray-300"
                                    >
                                        {addReviewLoading
                                            ? "Submitting..."
                                            : "Submit Review"}
                                    </button>
                                </form>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    Purchase this product to write a review.
                                </p>
                            )
                        ) : (
                            <p className="text-sm text-gray-500">
                                Sign in to write a review.
                            </p>
                        )
                    )}

                </div>
            </section>


            {/* RELATED PRODUCTS */}

            {data?.relatedProduct?.length > 0 && (
                <section className="w-full px-5 lg:px-15 py-10 bg-gray-50">
                    <div className="max-w-7xl mx-auto">

                        <div className="mb-5">
                            <p className="text-xs uppercase tracking-wider text-gray-400">
                                You may also like
                            </p>

                            <h2 className="text-xl font-semibold mt-1">
                                Related Products
                            </h2>
                        </div>

                        <div className="flex overflow-x-auto gap-4 pb-3 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-gray-300">
                            {data.relatedProduct.map(
                                (rproduct) => (
                                    <CollectionProduct
                                        pr={rproduct}
                                        key={`related-${rproduct.id}`}
                                    />
                                )
                            )}
                        </div>

                    </div>
                </section>
            )}


            {/* RECENTLY VIEWED */}

            {data?.recentProductViewed?.length > 0 && (
                <section className="w-full px-5 lg:px-15 py-10">
                    <div className="max-w-7xl mx-auto">

                        <div className="mb-5">
                            <p className="text-xs uppercase tracking-wider text-gray-400">
                                Your history
                            </p>

                            <h2 className="text-xl font-semibold mt-1">
                                Recently Viewed
                            </h2>
                        </div>

                        <div className="flex overflow-x-auto gap-4 pb-3 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-gray-300">

                            {data.recentProductViewed.map(
                                (recentproductv) => (
                                    <CollectionProduct
                                        pr={
                                            recentproductv?.product
                                        }
                                        key={`recent-${recentproductv.id}`}
                                    />
                                )
                            )}

                        </div>

                    </div>
                </section>
            )}

        </>
    )
}

export default ProductDetail
