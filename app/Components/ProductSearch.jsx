import { useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from './IsAuth';
import { useCategoryFilter } from '../hook/useCategoryFilter';
import { useAddToCartItem, useCart, useRemoveCartItem } from '../hook/useCart';
import { useProductLike } from '../hook/useProductLike';
import { useProduct } from '../hook/useproducts';
import { IoMdClose } from "react-icons/io";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineMenu } from "react-icons/ai";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { IoMdArrowBack } from 'react-icons/io';
import Message from './Message';



const ProductSearch = ({ query }) => {
    const slug = query
    const searchParams = useSearchParams();
    const [message, setMessage] = useState(null)
    const router = useRouter();
    const [showfilter, setSHowFilter] = useState(false);
    const [showVariation, setShowVariation] = useState(false);
    const [product, setProduct] = useState(null);
    const [addLoading, setAddLoading] = useState({});
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


    useEffect(() => {
        const parsedFilters = {
            ...filterForm,
            category: slug
        };

        searchParams.forEach((value, key) => {
            // 🚨 IF THE URL HAS "q", STORE IT AS "category" IN STATE
            const targetKey = key === "q" ? "category" : key;

            if (parsedFilters[targetKey]) {
                if (Array.isArray(parsedFilters[targetKey])) {
                    if (!parsedFilters[targetKey].includes(value)) {
                        parsedFilters[targetKey].push(value);
                    }
                } else {
                    if (parsedFilters[targetKey] !== value) {
                        parsedFilters[targetKey] = [parsedFilters[targetKey], value];
                    }
                }
            } else {
                parsedFilters[targetKey] = [value];
            }
        });

        // Make sure 'q' key is deleted so it never lives inside filterForm state
        delete parsedFilters.q;

        setFilterForm(parsedFilters);
    }, []);

    const handleRouter = (category) => {
        if (!category) return;
        updateURL();
        setFilterForm(f => ({ ...f, "category": category }))
    };

    const toggleCategoryChild = (filter) => {
        setShowCategoryChild(prev => ({
            ...prev,
            [`${filter}`]: !prev[`${filter}`]
        }));
    };

    const updateURL = () => {
        const params = new URLSearchParams();

        Object.entries(filterForm).forEach(([key, value]) => {
            // 1. Map 'category' to the query parameter 'q'
            const paramKey = key === "category" ? "q" : key;

            // 2. Clear empty values
            if (!value || value.length === 0) {
                params.delete(paramKey);
                return;
            }

            // 3. Process arrays vs. single values
            if (Array.isArray(value)) {
                params.delete(paramKey);
                const uniqueValues = [...new Set(value)];
                uniqueValues.forEach(v => params.append(paramKey, v));
            } else {
                params.set(paramKey, value);
            }
        });

        // 4. Construct URL with fixed base path '/catalog'
        const queryString = params.toString();
        const finalURL = queryString ? `/catalog?${queryString}` : '/catalog';

        // 5. Update address bar
        window.history.replaceState({}, "", finalURL);
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

    const handleLike = (productSlug) => {
        if (!isAuthenticated) router.push('/signin')
        productLikeFetch.mutate({ productSlug })
    };

    // 1. State for local input values (if not already managed inside filterForm)
    const [priceRange, setPriceRange] = useState({
        minPrice: filterForm?.minPrice || "",
        maxPrice: filterForm?.maxPrice || "",
    });

    // 2. Handle changes in min/max inputs
    const handlePriceChange = (field, value) => {
        setPriceRange((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // 3. Apply price range filter to state / trigger API refetch
    const applyPriceFilter = () => {
        // If using a state updater like toggleFilter or setFilterForm:
        setFilterForm((prev) => ({
            ...prev,
            minPrice: priceRange.minPrice,
            maxPrice: priceRange.maxPrice,
        }));

        // Trigger your router update or refetch function here if applicable
        // e.g., fetchProducts({ ...filterForm, ...priceRange });
    };

    // 4. Handle discount percentage select/toggle
    const handleDiscountChange = (discount) => {
        setFilterForm((prev) => ({
            ...prev,
            discount: prev.discount === discount ? null : discount, // toggles selection
        }));
    };

    return (
        <>
            <div className='py-10'></div>

            <div className={`max-[760px]:fixed max-[760px]:inset-0 max-[760px]:bg-white max-[760px]:z-50 max-[760px]:flex-col hidden ${showfilter ? 'max-[760px]:flex' : ''}`}>
                {/* Mobile Header */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setSHowFilter((vl) => !vl)} className="p-1 -ml-1 text-gray-700 hover:text-black rounded-full transition-colors active:bg-gray-100" aria-label="Close filters">
                            <IoMdArrowBack className="text-2xl" />
                        </button>
                        <h3 className="font-bold text-lg text-gray-900 tracking-tight">Filters</h3>
                    </div>

                    <button type="button" onClick={() => {
                        handlePriceChange('minPrice', ''); handlePriceChange('maxPrice', '');
                        if (typeof setFilterForm === 'function') {
                            setFilterForm((prev) => ({
                                ...prev,
                                brands: [],
                                colors: [],
                                sizes: [],
                                discount: null,
                            }));
                        }
                    }} className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors uppercase tracking-wider">
                        Clear All
                    </button>
                </div>

                {/* Scrollable Filter Options */}
                <div className="flex-1 overflow-y-auto px-4 divide-y divide-gray-100 pb-24">
                    {/* CATEGORY SECTION */}
                    <div className="py-3.5">
                        <button type="button" className="w-full flex justify-between items-center text-left py-1 group" onClick={() => toggleCategoryChild('category')}>
                            <div>
                                <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">Category</p>
                                <p className="text-xs text-gray-500 font-medium">
                                    {filters?.category?.name || 'All Categories'}
                                </p>
                            </div>
                            <AiOutlineMenu className={`text-sm text-gray-400 group-hover:text-black transition-transform duration-200 ${showCategoryChild['category'] ? 'rotate-90 text-amber-500 font-bold' : ''}`} />
                        </button>

                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showCategoryChild['category'] ? 'max-h-96 pt-3 pb-1' : 'max-h-0'}`}>
                            {filters?.subcategories?.length > 0 ? (
                                <ul className="space-y-2 pl-1">
                                    {filters?.subcategories.map((sub) => (
                                        <li key={`sub-${sub.id}`} onClick={() => handleRouter(sub.slug)} className="flex items-center justify-between text-xs text-gray-700 py-1.5 px-2.5 rounded-lg hover:bg-gray-50 cursor-pointer font-medium transition-colors">
                                            <span>{sub.name}</span>
                                            <span className="text-gray-400 text-[10px]">→</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                filters?.category?.id && (
                                    <div className="text-xs py-1.5 px-2.5 bg-amber-50 rounded-lg text-amber-800 font-semibold border border-amber-200/60">
                                        {filters?.category?.name}
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* PRICE FILTER SECTION */}
                    <div className="py-3.5">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">Price (₦)</p>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                            <div className="relative w-1/2">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">₦</span>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filterForm?.minPrice || ''}
                                    onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                                    className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-amber-500 transition-all font-medium"
                                />
                            </div>
                            <span className="text-gray-400 text-xs">-</span>
                            <div className="relative w-1/2">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">₦</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filterForm?.maxPrice || ''}
                                    onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                                    className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-amber-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Quick Range Presets */}
                        <div className="flex flex-wrap gap-1.5">
                            {[
                                { label: 'Under ₦10k', min: 0, max: 10000 },
                                { label: '₦10k - ₦50k', min: 10000, max: 50000 },
                                { label: '₦50k - ₦100k', min: 50000, max: 100000 },
                                { label: 'Above ₦100k', min: 100000, max: '' },
                            ].map((preset, idx) => (
                                <button
                                    key={`preset-${idx}`}
                                    type="button"
                                    onClick={() => {
                                        handlePriceChange('minPrice', preset.min);
                                        handlePriceChange('maxPrice', preset.max);
                                    }}
                                    className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-all ${filterForm?.minPrice === preset.min && filterForm?.maxPrice === preset.max
                                        ? 'bg-amber-50 border-amber-500 text-amber-700 font-semibold'
                                        : 'bg-gray-50 border-gray-200 text-gray-600'
                                        }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* BRAND SECTION */}
                    {filters?.brands?.length > 0 && (
                        <div className="py-3.5">
                            <button
                                type="button"
                                className="w-full flex justify-between items-center text-left py-1 group"
                                onClick={() => toggleCategoryChild('brand')}
                            >
                                <div>
                                    <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">Brand</p>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {filterForm.brands?.length > 0 ? `${filterForm.brands.length} selected` : 'All Brands'}
                                    </p>
                                </div>
                                <AiOutlineMenu
                                    className={`text-sm text-gray-400 group-hover:text-black transition-transform duration-200 ${showCategoryChild['brand'] ? 'rotate-90 text-amber-500 font-bold' : ''
                                        }`}
                                />
                            </button>

                            <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${showCategoryChild['brand'] ? 'max-h-60 pt-3' : 'max-h-0'
                                    }`}
                            >
                                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                                    {filters?.brands.map((br) => (
                                        <label
                                            key={`brand-${br.id}`}
                                            htmlFor={`brand-m-${br.id}`}
                                            className="flex items-center gap-3 py-1 cursor-pointer group"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`brand-m-${br.id}`}
                                                name="brand"
                                                checked={filterForm.brands.includes(`${br.slug || br.name}`)}
                                                onChange={() => toggleFilter('brands', `${br.slug || br.name}`)}
                                                className="w-4 h-4 accent-amber-500 rounded border-gray-300 cursor-pointer"
                                            />
                                            <span className="text-xs font-medium text-gray-700 group-hover:text-black">
                                                {br.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* COLOR SECTION */}
                    {filters?.colors?.length > 0 && (
                        <div className="py-3.5">
                            <button
                                type="button"
                                className="w-full flex justify-between items-center text-left py-1 group"
                                onClick={() => toggleCategoryChild('color')}
                            >
                                <div>
                                    <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">Color</p>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {filterForm.colors?.length > 0 ? `${filterForm.colors.length} selected` : 'All Colors'}
                                    </p>
                                </div>
                                <AiOutlineMenu
                                    className={`text-sm text-gray-400 group-hover:text-black transition-transform duration-200 ${showCategoryChild['color'] ? 'rotate-90 text-amber-500 font-bold' : ''
                                        }`}
                                />
                            </button>

                            <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${showCategoryChild['color'] ? 'max-h-60 pt-3' : 'max-h-0'
                                    }`}
                            >
                                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                                    {filters?.colors.map((cl) => (
                                        <label
                                            key={`color-${cl.id}`}
                                            htmlFor={`color-m-${cl.id}`}
                                            className="flex items-center gap-3 py-1 cursor-pointer group"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`color-m-${cl.id}`}
                                                name="color"
                                                checked={filterForm.colors.includes(`${cl.slug || cl.name}`)}
                                                onChange={() => toggleFilter('colors', `${cl.slug || cl.name}`)}
                                                className="w-4 h-4 accent-amber-500 rounded border-gray-300 cursor-pointer"
                                            />
                                            <span className="text-xs font-medium text-gray-700 group-hover:text-black">
                                                {cl.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SIZE SECTION */}
                    {filters?.sizes?.length > 0 && (
                        <div className="py-3.5">
                            <button
                                type="button"
                                className="w-full flex justify-between items-center text-left py-1 group"
                                onClick={() => toggleCategoryChild('size')}
                            >
                                <div>
                                    <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">Size</p>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {filterForm.sizes?.length > 0 ? `${filterForm.sizes.length} selected` : 'All Sizes'}
                                    </p>
                                </div>
                                <AiOutlineMenu
                                    className={`text-sm text-gray-400 group-hover:text-black transition-transform duration-200 ${showCategoryChild['size'] ? 'rotate-90 text-amber-500 font-bold' : ''
                                        }`}
                                />
                            </button>

                            <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${showCategoryChild['size'] ? 'max-h-60 pt-3' : 'max-h-0'
                                    }`}
                            >
                                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                                    {filters?.sizes.map((sz) => (
                                        <label
                                            key={`size-${sz.id}`}
                                            htmlFor={`size-m-${sz.id}`}
                                            className="flex items-center gap-3 py-1 cursor-pointer group"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`size-m-${sz.id}`}
                                                name="size"
                                                checked={filterForm.sizes.includes(`${sz.slug || sz.name}`)}
                                                onChange={() => toggleFilter('sizes', `${sz.slug || sz.name}`)}
                                                className="w-4 h-4 accent-amber-500 rounded border-gray-300 cursor-pointer"
                                            />
                                            <span className="text-xs font-medium text-gray-700 group-hover:text-black">
                                                {sz.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Fixed Bottom Action Bar for Mobile */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg z-20">
                    <button
                        type="button"
                        onClick={() => {
                            if (typeof applyPriceFilter === 'function') applyPriceFilter();
                            setSHowFilter(false);
                        }}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/*  */}
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
                                        <input type="text" className="border-0 outline-0 w-[80%] text-[14px]" placeholder="Search brand..." />
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

                        {/* Price Range Filter (Jumia Style) */}
                        <div className="w-full h-auto pb-4 border-t border-gray-200 pt-3">
                            <h4 className="text-[16px] font-semibold mb-2">PRICE (₦)</h4>
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filterForm?.minPrice || ''}
                                    onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                                    className="w-1/2 p-1.5 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-black"
                                />
                                <span className="text-gray-500">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filterForm?.maxPrice || ''}
                                    onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                                    className="w-1/2 p-1.5 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-black"
                                />
                            </div>
                            <button
                                onClick={applyPriceFilter}
                                className="w-full py-1.5 bg-[#333] text-white text-[13px] font-semibold rounded-lg hover:bg-black transition-all"
                            >
                                APPLY
                            </button>
                        </div>

                        {/* Discount Percentage Filter (Jumia Style) */}
                        <div className="w-full h-auto pb-4 border-t border-gray-200 pt-3">
                            <h4 className="text-[16px] font-semibold mb-2">DISCOUNT PERCENTAGE</h4>
                            <div className="flex flex-col gap-1.5">
                                {[50, 40, 30, 20, 10].map((discount) => (
                                    <div className="flex gap-2 items-center" key={`discount-${discount}`}>
                                        <input
                                            type="radio"
                                            id={`discount-${discount}`}
                                            name="discountFilter"
                                            checked={filterForm?.discount === discount}
                                            onChange={() => handleDiscountChange(discount)}
                                            className="cursor-pointer"
                                        />
                                        <label htmlFor={`discount-${discount}`} className="text-[14px] cursor-pointer">
                                            {discount}% off or more
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Size Section */}
                        <div className="w-full h-auto pb-3 border-t border-gray-200 pt-3">
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
                        <div className="w-full h-auto pb-3 border-t border-gray-200 pt-3">
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
                    <div className="w-[75%] h-auto flex flex-col max-[870px]:w-[70%] max-[760px]:w-full max-[760px]:pt-5">

                        {/* Top Header & Active Filters Bar */}
                        <div className="flex items-center justify-between bg-white z-10 pb-4 border-b border-gray-100 max-[760px]:w-full">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 capitalize tracking-tight">
                                    {(filterForm.category || slug)?.replaceAll("-", " ") || "All Products"}
                                </h1>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Showing {products?.length || 0} results
                                </p>
                            </div>

                            {/* Sort Controls */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:inline">Sort by:</span>
                                <select className="bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg font-medium p-2 pr-8 outline-none focus:border-gray-400 transition-colors cursor-pointer">
                                    <option value="popular">Most Popular</option>
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="w-full grid grid-cols-4 pt-6 max-[1280px]:grid-cols-3 max-[970px]:grid-cols-2 max-[480px]:grid-cols-1 gap-5">
                            {loadingProduct ? (
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
                    </div>
                </div>
            </section>

            {/*  */}
            <div className={`${showVariation ? "fixed inset-0 z-700 opacity-100 pointer-events-auto" : "hidden opacity-0 pointer-events-none"} transition-opacity duration-300 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4`}>
                <div ref={sidebarRef} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-300 scale-100">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Select Variation</h3>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product?.name}</p>
                        </div>
                        <button type="button" onClick={() => setShowVariation(false)} className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors">
                            <IoMdClose className="text-xl" />
                        </button>
                    </div>

                    {/* Variations List */}
                    <div className="p-6 divide-y divide-gray-100 max-h-[65vh] overflow-y-auto space-y-1">
                        {product?.variations?.length > 0 &&
                            product.variations.map((vr) => {
                                const cartItem = cart?.cartitems?.find(
                                    (ct) => ct?.product?.id === product?.id && ct?.variations?.id === vr.id
                                );
                                const variation = cartItem?.variations || vr;
                                const quantity = cartItem?.quantity || 0;
                                const isDiscounted = (product?.discount || 0) > 0;
                                const basePrice = variation?.price ?? product?.price ?? 0;

                                const multiplier = cartItem ? quantity : 1;
                                const unitFinalPrice = isDiscounted
                                    ? ((100 - product.discount) / 100) * basePrice
                                    : basePrice;

                                const totalPrice = unitFinalPrice * multiplier;
                                const originalTotalPrice = basePrice * multiplier;

                                return (
                                    <div
                                        key={`vr-${vr.id}`}
                                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4"
                                    >
                                        {/* Variation Details & Price */}
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-gray-800">
                                                    {[variation?.color?.name, variation?.size?.name]
                                                        .filter(Boolean)
                                                        .join(" / ") || "Standard Option"}
                                                </span>
                                                {vr?.stock <= 0 && (
                                                    <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-baseline gap-2">
                                                <span className="text-base font-bold text-gray-900">
                                                    ₦{totalPrice.toLocaleString("en-NG")}
                                                </span>
                                                {isDiscounted && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        ₦{originalTotalPrice.toLocaleString("en-NG")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Controls / Actions */}
                                        <div className="flex items-center">
                                            {cartItem ? (
                                                cartItem.is_active ? (
                                                    <div className="flex items-center gap-1 bg-gray-900 text-white rounded-xl p-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveCartItem(cartItem.id)}
                                                            className="w-7 h-7 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold transition-colors"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center text-xs font-semibold">
                                                            {isItemLoading(product?.id, cartItem.variations?.id, cartItem.id) ? (
                                                                <div className="mx-auto h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                            ) : (
                                                                quantity
                                                            )}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddToCart(product?.id, cartItem.variations?.id)}
                                                            className="w-7 h-7 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="px-3 py-1.5 bg-gray-100 text-gray-400 text-xs font-semibold rounded-xl">
                                                        Unavailable
                                                    </span>
                                                )
                                            ) : vr?.stock > 0 ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddToCart(product?.id, vr?.id)}
                                                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all active:scale-95 flex items-center gap-2"
                                                >
                                                    {isItemLoading(product?.id, vr?.id, null) ? (
                                                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                    ) : (
                                                        "Add to Cart"
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="px-4 py-2 bg-gray-100 text-gray-400 text-xs font-semibold rounded-xl cursor-not-allowed"
                                                >
                                                    Sold out
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductSearch
