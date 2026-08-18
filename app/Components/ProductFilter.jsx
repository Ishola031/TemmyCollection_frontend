"use client"
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { IoMdClose } from "react-icons/io";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from 'swr';
import { AiOutlineMenu } from "react-icons/ai";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { IoMdArrowBack } from 'react-icons/io';
import axios from 'axios'
import { AuthContext } from './IsAuth';
import api from '../api/api';
import Message from './Message';
import ProductCollectionContainer from "../Components/Include/ProductCollectionContainer"
import { useCategoryFilter } from '../hook/useCategoryFilter';
import { useAddToCartItem, useCart, useRemoveCartItem } from '../hook/useCart';
import { productLikeApi, useProductLike } from '../hook/useProductLike';
import { useProduct } from '../hook/useproducts';

const ProductFilter = ({ slug }) => {
    const searchParams = useSearchParams();
    const [message, setMessage] = useState(null)
    const router = useRouter();
    const [showfilter, setSHowFilter] = useState(false);
    const [showVariation, setShowVariation] = useState(false);
    const [product, setProduct] = useState(null);
    // const [loadingProduct, setLoadingProduct] = useState(true);
    const [addLoading, setAddLoading] = useState({});
    // const [products, setProducts] = useState([]);
    const sidebarRef = useRef(null)
    const { isAuthenticated } = useContext(AuthContext)
    const { data: filters, isLoading: categoryFilterLoading } = useCategoryFilter(slug || null)
    const { data: cart, isLoading: loadingCart } = useCart(isAuthenticated)
    const [filterForm, setFilterForm] = useState({
        "category": slug,
        "colors": [],
        "sizes": [],
        "brands": [],
    });
    const [showCategoryChild, setShowCategoryChild] = useState({});
    const [error, setError] = useState(null);
    const addcartfetch = useAddToCartItem(isAuthenticated, setMessage);
    const productLikeFetch = useProductLike();
    const handleCartItemDecrement = useRemoveCartItem(isAuthenticated);
    const { data: products, isLoading: loadingProduct } = useProduct(filterForm)
    // console.log(products)

    useEffect(() => {
        const parsedFilters = {
            ...filterForm,
            category: slug || "fashion"
        };
        // URLSearchParams.getAll() extracts ALL matching keys as a clean array: ['Nike', '919 JEANS']
        searchParams.forEach((value, key) => {
            // If the key already exists in our object, it means it's an array parameter (like brands)
            if (parsedFilters[key]) {
                if (Array.isArray(parsedFilters[key])) {
                    // If it's already an array, check for duplicates and push the new value
                    if (!parsedFilters[key].includes(value)) {
                        parsedFilters[key].push(value);
                    }
                } else {
                    // If it's currently a single string but we found a duplicate key, convert it into an array
                    if (parsedFilters[key] !== value) {
                        parsedFilters[key] = [parsedFilters[key], value];
                    }
                }
            } else {
                // If it's a brand new key we haven't seen yet, assume it's an array by default
                // (This keeps it compatible with your checkbox .includes() checks)
                parsedFilters[key] = [value];
            }
        });

        // Update your state with whatever was living inside the URL
        setFilterForm(parsedFilters);
    }, []);

    const handleRouter = (category) => {
        if (!category) return;
        updateURL();
        setFilterForm(f => ({ ...f, "category": category }))
    };

    const updateURL = () => {
        // 1. Start with a fresh or existing mutable params instance
        const params = new URLSearchParams();

        Object.entries(filterForm).forEach(([key, value]) => {
            if (key === "category") return;

            // If the filter is empty, ensure it's removed from the URL params completely
            if (!value || value.length === 0) {
                params.delete(key);
                return;
            }

            if (Array.isArray(value)) {
                params.delete(key); // Clear old array values to avoid duplicates like Nike & Nike

                // Use a Set to strictly prevent duplicate values from making it to the URL
                const uniqueValues = [...new Set(value)];
                uniqueValues.forEach(v => params.append(key, v));
            } else {
                params.set(key, value);
            }
        });

        // 2. Build the category path (fallback to dynamic slug or empty string safely)
        const categoryPath = filterForm.category ? `/${filterForm.category}` : '';

        // 3. Construct the clean URL string WITHOUT spaces next to the '?'
        const queryString = params.toString();
        const finalURL = queryString ? `${categoryPath}?${queryString}` : categoryPath;

        // 4. Update the address bar seamlessly
        window.history.replaceState({}, "", finalURL);
    };

    const toggleCategoryChild = (filter) => {
        setShowCategoryChild(prev => ({
            ...prev,
            [`${filter}`]: !prev[`${filter}`]
        }));
    };

    const isChecked = (category, value) => {
        return filterForm[category] ? filterForm[category].includes(value) : false;
    };

    const toggleFilter = (key, value) => {
        setFilterForm((prev) => {
            // 1. If key is category, handle it (or return prev if it's a no-op for now)
            if (key === "category") {
                return {
                    ...prev,
                    // If you actually want to toggle categories later, handle it here
                };
            }

            // 2. Fallback to an empty array if prev[key] doesn't exist yet
            const current = prev[key] || [];

            // 3. Check if the value is already selected
            const exists = current.includes(value);

            // 4. Add or remove the item safely
            const updated = exists
                ? current.filter(v => v !== value)
                : [...current, value];

            return {
                ...prev,
                [key]: updated,
            };
        });
    };


    // console.log(p)
    useEffect(() => {
        updateURL()
        const updateProduct = async () => {
            if (!categoryFilterLoading) {

                // setProducts()
            }
        }
        updateProduct();
    }, [filterForm, categoryFilterLoading]);

    // PREVENT SCROLLING WHEN VIRIATION IS OPEN
    useEffect(() => {
        if (showVariation) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Clean up style if component unmounts unexpectedly
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showVariation]);

    // HIDE VARIATION WHEN USER CLICK OUTSIDE THE VARIATION CONTAINER
    useEffect(() => {
        const handleSidebarClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setShowVariation(false)
            }
        };
        document.addEventListener('mousedown', handleSidebarClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleSidebarClickOutside)
        };
    }, [])

    const handleAddToCart = (product, variation, cartItemId = null) => {
        // console.log(product, variation)
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

    const handleAddVariations = (product) => {
        if (product?.variations?.length > 0) {
            setProduct(product)
            setShowVariation(true);
        } else {
            handleAddToCart(product?.id)
        }
    };

    const handleRemoveVariation = (product, cartitemId) => {
        if (product?.variations?.length > 0) {
            setProduct(product)
            setShowVariation(true);
        } else {
            // handleCartItemDecrement(instock?.id, cartID, product?.id, null)
            handleRemoveCartItem(cartitemId)
        }
    };

    const isItemLoading = (productID, variation, cartItemId) => {
        if (
            addcartfetch.isPending &&
            addcartfetch.variables?.product === productID &&
            addcartfetch.variables?.variation === variation
        ) {
            return true;
        }
        if (
            handleCartItemDecrement.isPending &&
            handleCartItemDecrement.variables?.cartitemId === cartItemId
        ) {
            return true;
        }
        return false;
    };

    useEffect(() => {
        console.log('filterform', filterForm);
        // console.log('filters', filters);
        // console.log('products', products);
        // console.log('cart', cart);
        // console.log('loading', addLoading);
    }, [filterForm, products, cart, addLoading, filters])

    const handleLike = (productSlug) => {
        if (!isAuthenticated) router.push('/signin')
        productLikeFetch.mutate({ productSlug })
    };

    return (
        <>
            <Message message={message} setError={setMessage} />
            <div className={`max-[760px]:fixed  pt-1 max-[760px]:top-0 max-[760px]:left-0 max-[760px]:h-full max-[760px]:bg-white max-[760px]:w-full max-[760px]:flex-col max-[760px]:z-100 hidden ${showfilter && ('max-[760px]:flex')}`}>
                <div className='overflow-y-scroll px-2.5'>
                    <div className='flex items-center gap-2.5 py-2'>
                        <IoMdArrowBack className={`text-[24px] font-medium transform transition-transform duration-200 cursor-pointer`} onClick={() => setSHowFilter(vl => !vl)} />
                        <h4 className='font-medium text-[20px]'>Filter</h4>
                    </div>

                    {/* CATEGORY */}
                    <div>
                        <div className="w-full border-y-2 border-[#eee]">
                            <div className='flex justify-between items-center py-1.5 hover:bg-gray-50 cursor-pointer transition-colors '
                                onClick={() => toggleCategoryChild("category")}>
                                <div style={{ lineHeight: '18px' }}>
                                    <p className='text-black font-medium text-[17px]'>Category</p>
                                    <p className='text-black text-[14px]'>Fashion</p>
                                </div>
                                <AiOutlineMenu className={`text-sm transform transition-transform duration-200 ${showCategoryChild["category"] ? 'rotate-90 text-blue-600' : ''}`} />
                            </div>

                            <div className={`flex flex-col bg-white transition-all duration-300 ease-in-out overflow-hidden ${showCategoryChild["category"] ? 'max-h-125 py-2' : 'max-h-0'}`}>
                                {filters?.subcategories.length > 0 ? (
                                    <ul className="pt-1">
                                        {filters?.subcategories.map(sub => {
                                            return (
                                                <div key={`sub-${sub.id}`} className="flex gap-2 items-center px-1 py-1.5">
                                                    <input type="radio" name="brand" value="ADIDAS" className='scale-140' />
                                                    <label htmlFor="brand" className="text-[15px] cursor-pointer">{sub.name}</label>
                                                </div>
                                            )
                                        })}
                                    </ul>
                                ) : (
                                    <ul className="pl-3 pt-1">
                                        {filters?.category?.id && (
                                            <div className="flex gap-2 items-center px-1 py-1.5">
                                                <input type="radio" name="brand" value="ADIDAS" className='scale-140' />
                                                <label htmlFor="brand" className="text-[15px] cursor-pointer">{filters?.category?.name}</label>
                                            </div>
                                        )}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* BRAND */}
                    <div>
                        <div className="w-full border-b-2 border-[#eee]">
                            <div className='flex justify-between items-center py-1.5 hover:bg-gray-50 cursor-pointer transition-colors border-[#eee]'
                                onClick={() => toggleCategoryChild("brand")}>
                                <div style={{ lineHeight: '18px' }}>
                                    <p className='text-black font-medium text-[17px]'>Brand</p>
                                    <p className='text-black text-[14px]'>Fashion</p>
                                </div>
                                <AiOutlineMenu className={`text-sm transform transition-transform duration-200 ${showCategoryChild["brand"] ? 'rotate-90 text-blue-600' : ''}`} />
                            </div>

                            <div className={`flex flex-col bg-white transition-all duration-300 ease-in-out overflow-hidden ${showCategoryChild["brand"] ? 'max-h-125 py-1' : 'max-h-0'}`}>
                                {filters?.brands?.length > 0 && (
                                    <>
                                        {filters?.brands.map(br => {
                                            return (
                                                <div key={`brand-${br.id}`} className="flex gap-2 items-center px-1 py-1">
                                                    <input type="checkbox" name="brand" className='scale-140' checked={filterForm.brands.includes(`${br.name}`)} onChange={() => toggleFilter("brands", `${br.name}`)} />
                                                    <label htmlFor="brand" className="text-[15px] cursor-pointer">{br.name}</label>
                                                </div>
                                            )
                                        })}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* COLOR */}
                    <div>
                        {filters?.colors?.length > 0 && (
                            <div className="w-full border-b-2 border-[#eee]">
                                <div className='flex justify-between items-center py-1.5 hover:bg-gray-50 cursor-pointer transition-colors border-[#eee]'
                                    onClick={() => toggleCategoryChild("color")}>
                                    <div style={{ lineHeight: '18px' }}>
                                        <p className='text-black font-medium text-[18px]'>Color</p>
                                        <p className='text-black text-[13px]'>Gold</p>
                                    </div>
                                    <AiOutlineMenu className={`text-sm transform transition-transform duration-200 ${showCategoryChild["color"] ? 'rotate-90 text-blue-600' : ''}`} />
                                </div>

                                <div className={`flex flex-col bg-white transition-all duration-300 ease-in-out overflow-hidden ${showCategoryChild["color"] ? 'max-h-125 py-1' : 'max-h-0'}`}>
                                    {filters?.colors?.map(cl => {
                                        return (
                                            <div key={`color-${cl.id}`} className="flex gap-2 items-center px-1 py-1">
                                                <input type="checkbox" name="color" className='scale-140' checked={filterForm.colors.includes(`${cl.name}`)} onChange={() => toggleFilter("colors", `${cl.name}`)} />
                                                <label htmlFor="color" className="text-[15px] cursor-pointer">{cl.name}</label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SIZE */}
                    <div>
                        {filters?.sizes?.length > 0 && (
                            <div className="w-full border-b-2 border-[#eee]">
                                <div className='flex justify-between items-center py-1.5 hover:bg-gray-50 cursor-pointer transition-colors border-[#eee]'
                                    onClick={() => toggleCategoryChild("size")}>
                                    <div style={{ lineHeight: '18px' }}>
                                        <p className='text-black font-medium text-[18px]'>Size</p>
                                        <p className='text-black text-[13px]'>Xl</p>
                                    </div>
                                    <AiOutlineMenu className={`text-sm transform transition-transform duration-200 ${showCategoryChild["size"] ? 'rotate-90 text-blue-600' : ''}`} />
                                </div>

                                <div className={`flex flex-col bg-white transition-all duration-300 ease-in-out overflow-hidden ${showCategoryChild["size"] ? 'max-h-125 py-1' : 'max-h-0'}`}>
                                    {filters?.sizes?.map(sz => {
                                        return (
                                            <div key={`color-${sz.id}`} className="flex gap-2 items-center px-1 py-1">
                                                <input type="checkbox" name="size" className='scale-140' checked={filterForm.sizes.includes(`${sz.name}`)} onChange={() => toggleFilter("sizes", `${sz.name}`)} />
                                                <label htmlFor="size" className="text-[15px] cursor-pointer">{sz.name}</label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CATEGORY ATTRIBUTES */}

                </div>
            </div>

            {/* HEADER */}
            <div className='w-full h-auto pt-22 px-10 lg:px-15 min-px-3  max-[740px]:px-5 max-[740px]:pt-30'>
                <div className='bg-[#eee] p-1 text-[15px] font-medium'>
                    <h4 className='uppercase text-center'>{filterForm.category.replaceAll('-', " ")}</h4>
                </div>
            </div>

            {/* SUBCATEGORIES */}
            {filters?.subcategories?.length > 0 && (
                <section className="w-full h-auto flex px-10 lg:px-15 min-px-3 py-3 max-[740px]:px-5 ">
                    <div className="w-full h-full flex flex-col">
                        <div className="w-full h-full font-medium text-center bg-blue-600 py-2 px-3 text-white text-[13px]">
                            <h4 className=''>CALL TO ORDER 09069491320</h4>
                            {/* <h4>Time Left: 00h : 00m: 10s</h4> */}
                            {/* <Link href="">See All </Link> */}
                        </div>

                        <div className="w-full h-full flex overflow-x-scroll gap-3 pt-1
                                        [&::-webkit-scrollbar]:w-1
                                        [&::-webkit-scrollbar-track]:bg-transparent 
                                      [&::-webkit-scrollbar-thumb]:bg-gray-300 
                                        [&::-webkit-scrollbar-thumb]:rounded-full
                                        [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent]
                                    ">
                            {filters?.subcategories?.map(sb => {
                                return (
                                    <div key={`sb-${sb.id}`} className="w-[20%]  h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                        <div className="w-full h-25 rounded-xl mb-0.5">
                                            <Link href={`/`}><img src={`http://127.0.0.1:8000${sb?.image}`} width={100} height={100} alt={`${sb.name}`} className="w-full h-full object-contain rounded-xl" unoptimized /></Link>
                                        </div>
                                        <h2 className="text-[14px] pt-2 tracking-[1px] text-center" style={{ lineHeight: '16px' }}>{sb.name}</h2>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* COLLECTION */}
            {filters?.collections?.length > 0 && (
                filters?.collections?.map(col => {
                    return (
                        <ProductCollectionContainer key={`col-${col.id}`} col={col} />
                    )
                })
            )}

            {/* COLLECTION TOP DEALS */}
            {/* <section className="w-full h-auto flex px-10 lg:px-15 min-px-3 py-3 max-[740px]:px-5 ">
                <div className="w-full h-full flex flex-col">
                    <div className="w-full h-full flex justify-between items-center bg-blue-600 py-2 px-3 text-white text-[13px]">
                        <h4>Top Deals</h4>
                        <h4>Time Left: 00h : 00m: 10s</h4>
                        <Link href="">See All </Link>
                    </div>

                    <div className="w-full h-full flex overflow-x-scroll 
                                        [&::-webkit-scrollbar]:w-1
                                        [&::-webkit-scrollbar-track]:bg-transparent 
                                      [&::-webkit-scrollbar-thumb]:bg-gray-300 
                                        [&::-webkit-scrollbar-thumb]:rounded-full
                                        [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent]
                                    ">
                        {col.product.map(pr => {
                        return (
                            <div key={`pr-${pr.id}`} className="w-[25%] min-w-[25%] h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full">
                                <div className="w-full h-45 rounded-xl mb-0.5">
                                    <Link href={`/store/${pr.slug}`}><Image src={`http://127.0.0.1:8000${pr.image}`} width={100} height={100} alt={`${pr.name}`} className="w-full h-full object-contain rounded-xl" unoptimized /></Link>
                                </div>
                                <h2 className="text-[14px] pt-2 tracking-[1px] line-clamp-1 overflow-hidden text-ellipsis" style={{ lineHeight: '16px' }}>{pr.name}</h2>
                                <div className="">
                                    {pr.discount > 0 ? (
                                        <h2 className="text-[16px] flex items-center gap-1 font-semibold">N{(((100 - pr?.discount) / 100) * pr?.price).toLocaleString('en-NG')} <span className="text-[11px] font-normal"><del>N{pr.price.toLocaleString('en-NG')}</del></span></h2>
                                    ) : (
                                        <h2 className="text-[16px] font-semibold"><del>N</del>{pr.price.toLocaleString('en-NG')}</h2>
                                    )}
                                </div>
                                {pr.discount > 0 && (
                                    <div className="absolute top-4.5 right-2.5 bg-amber-300 text-[12px] py-1 px-1.5">
                                        <h3>-{pr.discount}%</h3>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    </div>
                </div>
            </section> */}

            {/* OFFIAL STORES */}
            {filters?.brands.length > 0 && (
                <section className="w-full h-auto flex px-10 lg:px-15 min-px-3 py-3 max-[740px]:px-5 ">
                    <div className="w-full h-full flex flex-col">
                        <div className="w-full h-full font-medium text-center bg-blue-600 py-2 px-3 text-white text-[13px]">
                            <h4 className='uppercase'>Official Stores</h4>
                            {/* <h4>Time Left: 00h : 00m: 10s</h4> */}
                            {/* <Link href="">See All </Link> */}
                        </div>

                        <div className="w-full h-full flex overflow-x-scroll gap-3 pt-2
                                        [&::-webkit-scrollbar]:w-1
                                        [&::-webkit-scrollbar-track]:bg-transparent 
                                      [&::-webkit-scrollbar-thumb]:bg-gray-300 
                                        [&::-webkit-scrollbar-thumb]:rounded-full
                                        [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent]
                                    ">
                            {filters?.brands?.map(br => {
                                return (
                                    <div key={`br-${br.id}`} className="w-[20%]  h-auto p-3 relative max-[700px]:min-w-[33.3%] max-[500px]:min-w-[50%] max-[500px]:px-1 max-[340px]:min-w-full border border-[#333]">
                                        <div className="w-full h-10 rounded-xl mb-0.5">
                                            <Link href={`/`}><img src={`http://127.0.0.1:8000${br?.image}`} width={100} height={100} alt={`${br.name}`} className="w-full h-full object-contain rounded-xl" unoptimized /></Link>
                                        </div>
                                        {/* <h2 className="text-[14px] pt-2 tracking-[1px] text-center" style={{ lineHeight: '16px' }}>{sb.name}</h2> */}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}


            {/* SECTION */}
            <section className="w-full h-auto pb-10 pt-5 px-10 lg:px-15 min-px-3 max-[740px]:px-5">
                <div className="w-full h-full flex gap-8 max-[760px]:flex-col">
                    {/* Sidebar Filters */}
                    <div className="sticky self-start top-20 h-auto w-[25%] shadow-xl p-3 rounded-xl max-[870px]:w-[30%] max-[760px]:hidden">

                        {/* Category Section */}
                        <div className="w-full h-auto pb-3">
                            {!categoryFilterLoading && <h4 className="text-[16px] font-semibold">CATEGORY</h4>}
                            {categoryFilterLoading ? (
                                <ul className="pt-1">
                                    <li className="p-2 mb-1 pl-5 skeleton w-25"></li>
                                    <li className="p-2 mb-1 pl-5 skeleton"></li>
                                    <li className="ml-3 p-2 pl-5 mb-1 skeleton"></li>
                                    <li className="ml-3 p-2 pl-5 mb-1 skeleton"></li>
                                    <li className="ml-3 p-2 pl-5 mb-1 skeleton"></li>
                                    <li className="ml-3 p-2 pl-5 mb-1 skeleton"></li>
                                    <li className="ml-3 p-2 pl-5 mb-1 skeleton"></li>
                                    <li className="ml-3 p-2 pl-5 mb-1 skeleton"></li>
                                </ul>
                            ) : filters?.subcategories ? (
                                <ul className="pl-3 pt-1">
                                    <li className="font-semibold cursor-pointer">{filters?.category?.name}</li>
                                    {filters?.subcategories.map((sub) => (
                                        <li
                                            key={`sub-${sub.id}`}
                                            className="pl-3 pt-1 cursor-pointer"
                                            onClick={() => handleRouter(sub.slug)}
                                        >
                                            {sub.name}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <ul className="pl-3 pt-1">
                                    {filters?.category?.map((cat) => (
                                        <li key={`cat-${cat.id}`} className="cursor-pointer">{cat.name}</li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Brand Section */}
                        <div className="w-full h-auto pb-3">
                            {categoryFilterLoading ? (
                                <ul className="pt-1">
                                    <li className="p-2 mb-1 pl-5 skeleton w-25"></li>
                                    <li className="p-2 mb-1 pl-5 skeleton"></li>
                                    <li className="ml-3 p-2 pl-5 mb-1 skeleton"></li>
                                    <li className="ml-3 p-2 pl-5 mb-1 skeleton"></li>
                                    <li className="ml-3 p-2 pl-5 mb-1 skeleton"></li>
                                    <li className="ml-3 p-2 pl-5 mb-1 skeleton"></li>
                                </ul>
                            ) : filters?.brands?.length > 0 && (
                                <>
                                    <h4 className="text-[16px] font-semibold">BRAND</h4>
                                    <div className="flex items-center border border-[#333] rounded-xl p-1 mb-2">
                                        <IoMdClose className="text-[17px] cursor-pointer mr-0.5" />
                                        <input type="text" className="border-0 outline-0 w-[80%] text-[14px]" />
                                    </div>
                                    <div>
                                        {filters?.brands.map((br) => (
                                            <div className="flex gap-1 items-center" key={`brand-${br.id}`}>
                                                <input
                                                    type="checkbox"
                                                    id={`brand-${br.id}`}
                                                    name="brand"
                                                    checked={filterForm.brands.includes(`${br.slug}`)}
                                                    onChange={() => toggleFilter("brands", `${br.slug}`)}
                                                />
                                                <label htmlFor={`brand-${br.id}`} className="text-[14px] cursor-pointer">{br.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Size Section */}
                        <div className="w-full h-auto pb-3">
                            {!categoryFilterLoading && filters?.sizes?.length > 0 && (
                                <>
                                    <h4 className="text-[16px] font-semibold">SIZE</h4>
                                    <div>
                                        {filters?.sizes.map((sz) => (
                                            <div className="flex gap-1.5 items-center" key={`size-${sz.id}`}>
                                                <input
                                                    type="checkbox"
                                                    id={`size-${sz.id}`}
                                                    name="size"
                                                    checked={filterForm.sizes.includes(`${sz.slug}`)}
                                                    onChange={() => toggleFilter("sizes", `${sz.slug}`)}
                                                />
                                                <label htmlFor={`size-${sz.id}`} className="text-[14px] cursor-pointer">{sz.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Color Section */}
                        <div className="w-full h-auto pb-3">
                            {!categoryFilterLoading && filters?.colors?.length > 0 && (
                                <>
                                    <h4 className="text-[16px] font-semibold">COLOR</h4>
                                    <div>
                                        {filters?.colors.map((cl) => (
                                            <div className="flex gap-1.5 items-center" key={`color-${cl.id}`}>
                                                <input
                                                    type="checkbox"
                                                    id={`color-${cl.id}`}
                                                    name="color"
                                                    checked={filterForm.colors.includes(`${cl.slug}`)}
                                                    onChange={() => toggleFilter("colors", `${cl.slug}`)}
                                                />
                                                <label htmlFor={`color-${cl.id}`} className="text-[14px] cursor-pointer">{cl.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Products Area */}
                    <div className="w-[75%] h-auto flex flex-col max-[870px]:w-[70%] max-[760px]:w-full max-[760px]:pt-7">
                        <div className="flex items-center justify-between bg-white z-10 py-1 max-[760px]:w-full">
                            <h4 className="text-[17px] font-medium uppercase">
                                {(filterForm.category || slug).replaceAll("-", " ")}
                            </h4>
                            <p className="text-[18px]">Sort</p>
                        </div>

                        <div className="flex gap-3 items-center">
                            <div className="relative">
                                <button className="py-1.5 bg-[#333] px-4.5 cursor-pointer rounded-xl text-white text-[15px]">Brand</button>
                            </div>
                            <div className="relative">
                                <button className="py-1.5 bg-[#333] px-4.5 cursor-pointer rounded-xl text-white text-[15px]">Price</button>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="w-full h-auto grid grid-cols-4 pt-4.5 max-[1244px]:grid-cols-3 max-[970px]:grid-cols-2 max-[380px]:grid-cols-1 gap-8">
                            {loadingProduct ? (
                                [1, 2, 3, 4].map((i) => (
                                    <div key={`skel-${i}`} className="min-w-55 h-auto p-2 relative max-[740px]:min-w-[50%] max-[350px]:min-w-full">
                                        <div className="w-full h-45 skeleton"></div>
                                        <h2 className="text-[22px] font-bold pb-0 skeleton p-6 w-30 mt-1"></h2>
                                        <h2 className="text-[22px] font-bold pb-0 skeleton p-6 w-40 mt-1"></h2>
                                        <div className="flex items-center justify-between mt-1">
                                            <button className="py-1.5 px-4 bg-[#333] rounded-xl text-[#eee] text-[15px] skeleton">Add To Cart</button>
                                            <IoMdClose className="text-[25px] cursor-pointer skeleton" />
                                        </div>
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

                                    return (
                                        <div key={`pr-${pr.id}`} className="min-w-55 h-78 p-0 relative max-[740px]:min-w-[50%] max-[350px]:min-w-full">
                                            <div className="w-full h-45">
                                                <Link href={`/store/${pr.slug}`}>
                                                    {/* <Image
                                                        src={`http://127.0.0.1:8000${pr.image}`}
                                                        width={100}
                                                        height={100}
                                                        alt={pr.name}
                                                        className="w-full h-full object-contain"
                                                        unoptimized
                                                    /> */}
                                                    <Image
                                                        src={pr.image}
                                                        alt={pr.name || 'Product Image'}
                                                        width={100}
                                                        height={100}
                                                        className="w-full h-full object-contain"
                                                        unoptimized
                                                    />
                                                </Link>
                                            </div>

                                            <h2 className="text-[17px] pt-2 tracking-[0.5px] line-clamp-2 overflow-hidden text-ellipsis" style={{ lineHeight: '19px' }}>
                                                {pr.name}
                                            </h2>

                                            <div>
                                                {pr.discount ? (
                                                    <h2 className="text-[21px] font-bold flex items-center gap-1">
                                                        <del>N</del>{(((100 - pr?.discount) / 100) * pr?.price).toLocaleString('en-NG')}{' '}
                                                        <span className="text-[13px] font-normal">
                                                            <del>N{pr.price.toLocaleString('en-NG')}</del>
                                                        </span>
                                                    </h2>
                                                ) : (
                                                    <h2 className="text-[21px]"><del>N</del>{pr.price.toLocaleString('en-NG')}</h2>
                                                )}
                                            </div>

                                            {pr.discount > 0 && (
                                                <div className="absolute top-0 right-0 bg-amber-300 text-[12px] py-1 px-1.5">
                                                    <h3>-{pr.discount}%</h3>
                                                </div>
                                            )}

                                            <div className='absolute text-[23px] right-1 top-38 cursor-pointer'>
                                                {pr?.is_Liked ? (
                                                    <FaHeart onClick={() => handleLike(pr?.slug)} className='text-red-600' />
                                                ) : (
                                                    <FaRegHeart onClick={() => handleLike(pr?.slug)} className='' />
                                                )}
                                            </div>

                                            <div className="w-full absolute bottom-0 flex items-center justify-between">
                                                {pr.variations.length > 0 ? (
                                                    inStock.length > 0 ? (
                                                        <div className="w-full flex items-center gap-1">
                                                            <button className="py-1.5 px-4.5 bg-amber-500 text-white font-semibold cursor-pointer" onClick={() => handleRemoveVariation(pr, inStock[0]?.id)}>-</button>
                                                            <div className="w-[90%] min-w-10 py-1.5 px-3 text-[15px] text-center flex items-center justify-center">
                                                                {isItemLoading(pr?.id, inStock[0]?.variations?.id, inStock[0]?.id) ? (
                                                                    <div className="mx-auto h-3.5 w-2.5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
                                                                ) : (
                                                                    quantity
                                                                )}
                                                            </div>
                                                            <button className="py-1.5 px-4.5 bg-amber-500 text-white font-semibold cursor-pointer" onClick={() => handleAddVariations(pr)}>+</button>
                                                        </div>
                                                    ) : (
                                                        <button className="w-full py-2 px-4 bg-[#333] rounded-xl text-[#eee] text-[15px] cursor-pointer" onClick={() => handleAddVariations(pr)}>
                                                            {isItemLoading(pr?.id, null, null) ? (
                                                                <div className="mx-auto h-3.5 w-2.5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
                                                            ) : ('Add To Cart')}
                                                        </button>
                                                    )
                                                ) : pr?.stock > 0 ? (
                                                    inStock.length > 0 ? (
                                                        <div className="w-full flex items-center gap-1">
                                                            <button className="py-1.5 px-4.5 bg-amber-500 text-white font-semibold cursor-pointer" onClick={() => handleRemoveVariation(pr, inStock[0]?.id)}>-</button>
                                                            <div className="w-[90%] min-w-10 py-1.5 px-3 text-[15px] text-center flex items-center justify-center">
                                                                {isItemLoading(pr?.id, undefined, inStock[0]?.id) ? (
                                                                    <div className="h-3.5 w-2.5 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
                                                                ) : (
                                                                    inStock[0]?.quantity
                                                                )}
                                                            </div>
                                                            <button className="py-1.5 px-4.5 bg-amber-500 text-white font-semibold cursor-pointer" onClick={() => handleAddVariations(pr)}>+</button>
                                                        </div>
                                                    ) : (
                                                        <button className="w-full py-2 px-4 bg-[#333] rounded-xl text-[#eee] text-[15px] cursor-pointer flex justify-center items-center" onClick={() => handleAddVariations(pr)}>
                                                            {isItemLoading(pr?.id, undefined, null) ? (
                                                                <div className="h-3.5 w-2.5 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
                                                            ) : ('Add To Cart')}
                                                        </button>
                                                    )
                                                ) : (
                                                    <button className="w-full py-2 px-4 bg-[#333] rounded-xl text-[#eee] text-[15px] cursor-pointer">Out Of Stock</button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* <div className={`${showVariation ? ('fixed') : ('hidden')} w-full h-screen bg-black/20 top-0 left-0 z-700`}>
                <div className='w-full h-full flex justify-center items-center'>
                    <div className='w-150 h-auto p-3 bg-white' ref={sidebarRef}>
                        <div className='w-full flex justify-between items-center'>
                            <h4 className='font-medium text-[19px]'>Select a variation</h4>
                            <div><IoMdClose className='cursor-pointer text-[20px]' onClick={() => setShowVariation(false)} /></div>
                        </div>

                        <div>
                            {product?.variations?.length > 0 && (
                                product?.variations?.map(vr => {
                                    let exist = cart?.cartitems?.filter(ct => ct?.product?.id === product?.id && ct?.variations?.id === vr.id)
                                    let variations = exist?.length > 0 && exist[0]?.variations || null
                                    return (
                                        <div key={`vr-${vr.id}`} className='w-full h-auto flex justify-between items-center pt-5'>
                                            <div style={{ lineHeight: '20px' }}>
                                                
                                                <h4 className='text-[13px]'>
                                                    {exist?.length > 0 ? (
                                                        <>
                                                            {variations?.color?.id && (`Color: ${variations?.color?.name}, `)}
                                                            {variations?.size?.id && (`Size: ${variations?.size?.name}`)}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {vr?.color?.id && (`Color: ${vr?.color?.name}, `)}
                                                            {vr?.size?.id && (`Size: ${vr?.size?.name}`)}
                                                        </>
                                                    )}
                                                </h4>
                                                
                                                {exist?.length > 0 ? (
                                                    exist[0]?.variations !== null ? (
                                                        exist[0]?.product?.discount > 0 ? (
                                                            <h3 className='font-semibold text-[18px] flex items-center'><del>N</del>{(((100 - exist[0]?.product?.discount) / 100) * (exist[0]?.variations?.price) * exist[0].quantity).toLocaleString('en-NG')}<span className='font-light text-[13px] pl-1'> <del>N{exist[0]?.variations?.price * exist[0].quantity}</del></span></h3>
                                                        ) : (<h3 className='font-semibold text-[18px]'><del>N</del> {(exist[0]?.variations?.price * exist[0]?.quantity).toLocaleString('en-NG')}</h3>)
                                                    ) : (
                                                        exist[0]?.product?.discount > 0 ? (
                                                            <h3 className='font-semibold text-[18px] flex items-center'><del>N</del>{(((100 - exist[0]?.product?.discount) / 100) * (exist[0]?.product?.price) * exist[0].quantity).toLocaleString('en-NG')}<span className='font-light text-[13px] pl-1'> <del>N{exist[0]?.product?.price * exist[0].quantity}</del></span></h3>
                                                        ) : (<h3 className='font-semibold text-[18px]'><del>N</del> {(exist[0]?.product?.price * exist[0]?.quantity).toLocaleString('en-NG')}</h3>)
                                                    )
                                                ) : (
                                                    product?.discount > 0 ? (
                                                        <h3 className='font-semibold text-[18px] flex items-center'><del>N</del>{((100 - product?.discount) / 100) * (vr?.price).toLocaleString('en-NG')}<span className='font-light text-[13px] pl-1'> <del>N{vr?.price}</del></span></h3>
                                                    ) : (<h3 className='font-semibold text-[18px]'><del>N</del> {vr?.price.toLocaleString('en-NG')}</h3>)
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                {exist?.length > 0 ? (
                                                    <>
                                                        {exist[0]?.is_active === true ? (
                                                            <div className="flex items-center gap-1">

                                                                <button className="py-1.5 px-3 bg-amber-500 text-white font-semibold cursor-pointer" onClick={() => handleRemoveCartItem(exist[0]?.id)}>-</button>
                                                                <div className="py-1.5 px-3 text-[15px]">{isItemLoading(product?.id, exist[0]?.variations?.id, exist[0]?.id) ? (<div className="h-3.5 w-3.5 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />) : (exist[0]?.quantity)}</div>
                                                                <button className="py-1.5 px-3 bg-amber-500 text-white font-semibold cursor-pointer" onClick={() => handleAddToCart(product?.id, exist[0]?.variations?.id)}>+</button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-start justify-end">
                                                                <p className="py-1.5 px-3.5 bg-[#333] text-white rounded-lg">Sold out</p>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        {vr?.stock > 0 ? (
                                                            <div className="flex items-center gap-1">
                                                                <button className="py-1.5 px-3 bg-amber-500 text-white font-semibold cursor-pointer">-</button>
                                                                <div className="py-1.5 px-3 text-[15px]">{isItemLoading(product?.id, vr?.id, null) ? (<div className="h-3.5 w-3.5 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />) : (0)}</div>
                                                                <button className="py-1.5 px-3 bg-amber-500 text-white font-semibold cursor-pointer" onClick={() => handleAddToCart(product?.id, vr?.id)}>+</button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-start justify-end">
                                                                <p className="py-1.5 px-3.5 bg-[#333] text-white rounded-lg">Sold out</p>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div> */}

            <div className={`${showVariation ? "fixed" : "hidden"} top-0 left-0 z-700 h-screen w-full bg-black/20`}>
                <div className="flex h-full w-full items-center justify-center">
                    <div className="h-auto w-150 max-w-[90vw] bg-white p-4 shadow-lg rounded-md" ref={sidebarRef}>
                        {/* Header */}
                        <div className="flex w-full items-center justify-between border-b pb-3">
                            <h4 className="text-[19px] font-medium">Select a variation</h4>
                            <IoMdClose
                                className="cursor-pointer text-[20px] hover:text-gray-600 transition-colors"
                                onClick={() => setShowVariation(false)}
                            />
                        </div>

                        {/* Variations List */}
                        <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
                            {product?.variations?.length > 0 &&
                                product.variations.map((vr) => {
                                    // Find existing cart item for this variation
                                    const cartItem = cart?.cartitems?.find(
                                        (ct) => ct?.product?.id === product?.id && ct?.variations?.id === vr.id
                                    );
                                    const variation = cartItem?.variations || vr;
                                    const quantity = cartItem?.quantity || 0;
                                    const isDiscounted = (product?.discount || 0) > 0;
                                    const basePrice = variation?.price ?? product?.price ?? 0;

                                    // Calculate final price based on quantity or unit price
                                    const multiplier = cartItem ? quantity : 1;
                                    const unitFinalPrice = isDiscounted
                                        ? ((100 - product.discount) / 100) * basePrice
                                        : basePrice;

                                    const totalPrice = unitFinalPrice * multiplier;
                                    const originalTotalPrice = basePrice * multiplier;

                                    return (
                                        <div
                                            key={`vr-${vr.id}`}
                                            className="flex w-full items-center justify-between py-4"
                                        >
                                            {/* Details & Pricing */}
                                            <div style={{ lineHeight: "20px" }}>
                                                <h4 className="text-[13px] font-medium text-gray-800">
                                                    {variation?.color?.name && `Color: ${variation.color.name}`}
                                                    {variation?.color?.name && variation?.size?.name && ", "}
                                                    {variation?.size?.name && `Size: ${variation.size.name}`}
                                                </h4>

                                                <div className="mt-1">
                                                    {isDiscounted ? (
                                                        <h3 className="flex items-center text-[18px] font-semibold text-gray-900">
                                                            <span className="mr-0.5">₦</span>
                                                            {totalPrice.toLocaleString("en-NG")}
                                                            <span className="pl-2 text-[13px] font-light text-gray-500 line-through">
                                                                ₦{originalTotalPrice.toLocaleString("en-NG")}
                                                            </span>
                                                        </h3>
                                                    ) : (
                                                        <h3 className="text-[18px] font-semibold text-gray-900">
                                                            ₦{totalPrice.toLocaleString("en-NG")}
                                                        </h3>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quantity Controls / Actions */}
                                            <div className="flex items-center">
                                                {cartItem ? (
                                                    cartItem.is_active ? (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                className="px-3 py-1.5 font-semibold text-white bg-amber-500 rounded hover:bg-amber-600 transition-colors cursor-pointer"
                                                                onClick={() => handleRemoveCartItem(cartItem.id)}
                                                            >
                                                                -
                                                            </button>
                                                            <div className="min-w-9 text-center text-[15px]">
                                                                {isItemLoading(product?.id, cartItem.variations?.id, cartItem.id) ? (
                                                                    <div className="mx-auto h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
                                                                ) : (
                                                                    quantity
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="px-3 py-1.5 font-semibold text-white bg-amber-500 rounded hover:bg-amber-600 transition-colors cursor-pointer"
                                                                onClick={() => handleAddToCart(product?.id, cartItem.variations?.id)}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="rounded-lg bg-gray-800 px-3.5 py-1.5 text-xs text-white">
                                                            Sold out
                                                        </span>
                                                    )
                                                ) : vr?.stock > 0 ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            disabled
                                                            className="px-3 py-1.5 font-semibold text-white bg-amber-300 opacity-50 cursor-not-allowed rounded"
                                                        >
                                                            -
                                                        </button>
                                                        <div className="min-w-9 text-center text-[15px]">
                                                            {isItemLoading(product?.id, vr?.id, null) ? (
                                                                <div className="mx-auto h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
                                                            ) : (
                                                                0
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="px-3 py-1.5 font-semibold text-white bg-amber-500 rounded hover:bg-amber-600 transition-colors cursor-pointer"
                                                            onClick={() => handleAddToCart(product?.id, vr?.id)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="rounded-lg bg-gray-800 px-3.5 py-1.5 text-xs text-white">
                                                        Sold out
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductFilter
