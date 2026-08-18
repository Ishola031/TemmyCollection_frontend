'use client'
import Link from 'next/link';
import { AiOutlineMenu } from "react-icons/ai";
import { AiOutlineUser } from "react-icons/ai";
import { IoCartOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from './IsAuth';
import { FaRegHeart } from "react-icons/fa";
import { FaInbox } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import { TfiPackage } from 'react-icons/tfi';
import { useCart } from '../hook/useCart';
import { useCategory } from '../hook/useCategory';

const Navbar = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const [showCategory, setShowCategory] = useState(false);
    const { data: cart, isLoading: loadingCart } = useCart(isAuthenticated);
    const { data: category, isLoading: loadingCategory } = useCategory();
    const [cartCount, setCartCount] = useState(0);
    const [showCategoryChild, setShowCategoryChild] = useState({});


    // Initialize state mapping for each category dropdown
    useEffect(() => {
        if (category) {
            const initialStates = {};
            category.forEach(ct => {
                initialStates[`category_${ct.id}`] = false;
            });
            setShowCategoryChild(initialStates);
        }
    }, [category]);

    // PREVENT SCROLLING WHEN SIDEBAR IS OPEN
    useEffect(() => {
        if (showCategory) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Clean up style if component unmounts unexpectedly
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showCategory]);

    // Toggle function for a specific category's dropdown list
    const toggleCategoryChild = (catId) => {
        setShowCategoryChild(prev => ({
            ...prev,
            [`category_${catId}`]: !prev[`category_${catId}`]
        }));
    };

    useEffect(() => {
        if (cart?.error) {
            setCartCount(0)
        }
        else if (cart?.cartitems?.length > 0) {
            let cartCount = 0
            cart?.cartitems?.forEach(item => {
                if (item.is_active === true) {
                    cartCount += item.quantity
                };
            });
            setCartCount(cartCount)
        };
    }, [cart])

    return (
        <>
            <nav className='fixed flex w-full py-4 px-10 lg:px-15 min-px-3 items-center justify-between lg:gap-10 gap-3 max-[740px]:flex-col max-[740px]:items-start max-[740px]:gap-1 max-[740px]:px-5 z-400 bg-white shadow-sm'>

                {/* Brand Logo & Mobile Icons */}
                <div className='flex items-center max-[740px]:justify-between max-[740px]:w-full'>
                    <div className='flex items-center w-55'>
                        <div className="text-[23px] mr-2 cursor-pointer" onClick={() => setShowCategory(p => !p)}>
                            <AiOutlineMenu className="i-menu" />
                        </div>

                        <div>
                            <Link href="/" className="text-[1.3rem] font-bold text-[#333]">
                                Temmy <span className='text-blue-600'>Collection</span>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Only Navigation Icons */}
                    <div className='hidden items-center max-[740px]:flex text-2xl gap-3'>
                        <Link href="/dashboard" className="text-[25px]"><AiOutlineUser /></Link>
                        <Link href="/cart" className="text-[25px relative">
                            <IoCartOutline />
                            <span className='absolute left-4 -top-1.5 px-1 rounded-full bg-amber-500 text-[10px] text-white text-center border-3 border-white'>
                                {cartCount || 0}
                            </span>
                        </Link>
                    </div>

                </div>

                {/* Search Bar Container */}
                <div className='flex items-center min-w-[40%] w-[50%] max-[860px]:w-[60%] max-[740px]:w-full'>
                    <form className='flex items-center w-full bg-[#eee] pl-2.5 rounded-2xl'>
                        <input type="text" placeholder="Search products, brands and categories" className="px-1 py-2.5 w-full bg-transparent border-0 outline-0 text-[14px]" />
                        <div className="text-xl mr-2 cursor-pointer"><IoMdClose className="i-x" /></div>
                        <Link href="" className='w-20 text-center bg-blue-600 h-10 rounded-r-2xl text-white text-2xl flex justify-center items-center'>
                            <IoSearch />
                        </Link>
                    </form>
                </div>

                {/* Desktop Navigation Links */}
                <div className='flex gap-4 max-[740px]:hidden'>
                    <Link href="/dashboard" className="flex items-center gap-1 text-[17px]">
                        <AiOutlineUser className="text-[23px]" />
                        <p className='max-[860px]:hidden'>Account</p>
                    </Link>
                    <Link href="/cart" className="flex items-center gap-1.5 text-[17px relative">
                        <IoCartOutline className="text-[23px]" />
                        <span className='absolute left-3 -top-1.5 px-1 rounded-full bg-amber-500 text-[10px] text-white text-center border-3 border-white'>
                            {cartCount || 0}
                        </span>
                        <p className='max-[860px]:hidden'>Cart</p>
                    </Link>
                </div>

                {/* Sidebar Menu Drawer Container */}
                {showCategory && (
                    <div className='fixed inset-0 z-50 flex items-start'>

                        {/* BACKDROP: Clicking here closes the sidebar */}
                        <div className='absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer'
                            onClick={() => setShowCategory(false)}
                        />

                        {/* Drawer content surface */}
                        <div className='relative bg-white w-80 h-full text-[#333] overflow-y-auto transition-all duration-300 shadow-xl z-10'>
                            <div className='w-full '>
                                <div className='py-3 pb-4 px-3 flex justify-between'>
                                    <h4 className='text-[20px] font-semibold'>Temmy <span className='text-blue-600'>Collection</span></h4>
                                    <button className='text-[#333] text-[26px] ml-2 focus:outline-none cursor-pointer' onClick={() => setShowCategory(false)}>
                                        <IoMdClose />
                                    </button>
                                </div>

                                {/* Account */}
                                <div>
                                    <div className={`w-full h-auto pb-3`}>
                                        <Link href="/dashboard" className='block w-full text-[14px] px-4 py-2 font-semibold border-t pt-3 border-[#aaa]'>TEMMY COLLECTION ACCOUNT</Link>

                                        <Link href="/dashboard/order" className={`w-full py-3 px-4 flex gap-2.5 items-center  cursor-pointer`}>
                                            <TfiPackage className="text-[20px] font-medium" />
                                            <h4 className="text-[15px]">Orders</h4>
                                        </Link>

                                        <Link href="/dashboard/inbox" className={`w-full py-3 px-4 flex gap-2.5 items-center  cursor-pointer`}>
                                            <FaInbox className="text-[20px]" />
                                            <h4 className="text-[15px]">Inbox</h4>
                                        </Link>

                                        <Link href="/dashboard/wishlist" className={`w-full py-3 px-4 flex gap-2.5 items-center  cursor-pointer`}>
                                            <FaRegHeart className="text-[20px]" />
                                            <h4 className="text-[15px]">Wishlist</h4>
                                        </Link>

                                    </div>
                                </div>

                                {/* CATEGORY */}
                                <div>
                                    <Link href={`/`} className='block text-[14px] px-4 py-2 font-semibold border-t border-[#aaa]'>OUR CATEGORIES</Link>
                                    <div className='pb-2'>
                                        {category?.map(cat => {
                                            const isOpen = showCategoryChild[`category_${cat.id}`];
                                            return (
                                                <div key={`cat-${cat.id}`} className="w-full border-b border-gray-50 last:border-0">
                                                    <div
                                                        className='flex justify-between items-center px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors'
                                                        onClick={() => toggleCategoryChild(cat.id)}
                                                    >
                                                        <p className='text-black font-medium'>{cat?.name}</p>
                                                        <AiOutlineMenu className={`text-sm transform transition-transform duration-200 ${isOpen ? 'rotate-90 text-blue-600' : ''}`} />
                                                    </div>

                                                    <div className={`flex flex-col bg-gray-50 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-125 py-2' : 'max-h-0'}`}>
                                                        {cat?.children?.map(ch => (
                                                            <Link
                                                                href={`/${ch.slug}`}
                                                                key={`child-${ch.id}`}
                                                                className='text-gray-700 pr-6 pl-10 py-2 text-sm hover:text-blue-600 hover:bg-gray-100 transition-colors'
                                                                onClick={() => setShowCategory(false)}
                                                            >
                                                                {ch?.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <h4 className='block text-[14px] px-4 py-2 font-semibold border-t border-[#aaa]'></h4>
                                    <Link href="/" className={`w-full py-2 px-4 flex gap-2.5 items-center  cursor-pointer`}>
                                        <h4 className="text-[17px]">Service Center</h4>
                                    </Link>
                                    <Link href="/" className={`w-full py-2 px-4 flex gap-2.5 items-center  cursor-pointer`}>
                                        <h4 className="text-[17px]">Contact us</h4>
                                    </Link>
                                    <Link href="/" className={`w-full py-2 px-4 flex gap-2.5 items-center  cursor-pointer`}>
                                        <h4 className="text-[17px]">About us</h4>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Inline Close Button overlay */}
                    </div>
                )}

            </nav>
        </>
    );
};

export default Navbar;