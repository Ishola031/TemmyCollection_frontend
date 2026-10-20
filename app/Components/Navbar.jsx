"use client";

import Link from "next/link";
import { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineMenu, AiOutlineUser } from "react-icons/ai";
import { IoCartOutline, IoSearch, IoNotificationsOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { FaRegHeart } from "react-icons/fa";
import { FaInbox } from "react-icons/fa6";
import { TfiPackage } from "react-icons/tfi";
import EnableCustomerNotifications from "../Components/EnableCustomerNotifications";
import { AuthContext } from "./IsAuth";
import { useCart } from "../hook/useCart";
import { useCategory } from "../hook/useCategory";
import { useRecentSearch } from "../hook/useRecentSearch";
import api from "../api/api";

const Navbar = () => {
    const { isAuthenticated } = useContext(AuthContext);

    const [showCategory, setShowCategory] = useState(false);
    const [showCategoryChild, setShowCategoryChild] = useState({});
    const [searchSuggestions, setSearchSuggestions] = useState({});
    const [search, setSearch] = useState("");
    const [showSearchRecommendations, setShowSearchRecommendations] =
        useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);

    const { data: cart } = useCart(isAuthenticated);
    const { data: category } = useCategory();
    const { data: recentSearches } = useRecentSearch(isAuthenticated);

    const searchRef = useRef(null);
    const router = useRouter();

    // INITIALIZE CATEGORY DROPDOWNS
    useEffect(() => {
        if (!category) return;

        const initialStates = {};

        category.forEach((cat) => {
            initialStates[`category_${cat.id}`] = false;
        });

        setShowCategoryChild(initialStates);
    }, [category]);

    // PREVENT BODY SCROLL WHEN CATEGORY SIDEBAR IS OPEN
    useEffect(() => {
        document.body.style.overflow = showCategory ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [showCategory]);

    // CLOSE SEARCH SUGGESTIONS WHEN CLICKING OUTSIDE
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setShowSearchRecommendations(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // UPDATE CART COUNT
    useEffect(() => {
        if (!cart || cart.error || !Array.isArray(cart.cartitems)) {
            setCartCount(0);
            return;
        }

        const count = cart.cartitems.reduce((total, item) => {
            return item.is_active === true
                ? total + (Number(item.quantity) || 0)
                : total;
        }, 0);

        setCartCount(count);
    }, [cart]);

    // CUSTOMER NOTIFICATION UNREAD COUNT
    // useEffect(() => {
    //     if (!isAuthenticated) {
    //         setUnreadCount(0);
    //         return;
    //     }

    //     let cancelled = false;

    //     const fetchUnreadCount = async () => {
    //         try {
    //             const response = await api.get(
    //                 "/api/notifications/customer/unread-count/"
    //             );

    //             if (!cancelled) {
    //                 setUnreadCount(
    //                     Number(response.data?.unread_count) || 0
    //                 );
    //             }
    //         } catch (error) {
    //             if (!cancelled) {
    //                 console.error(
    //                     "Failed to fetch customer notification count:",
    //                     error
    //                 );
    //             }
    //         }
    //     };

    //     fetchUnreadCount();

    //     const intervalId = setInterval(fetchUnreadCount, 30000);

    //     return () => {
    //         cancelled = true;
    //         clearInterval(intervalId);
    //     };
    // }, [isAuthenticated]);

    // TOGGLE CATEGORY DROPDOWN
    const toggleCategoryChild = (catId) => {
        setShowCategoryChild((previous) => ({
            ...previous,
            [`category_${catId}`]: !previous[`category_${catId}`],
        }));
    };

    // SEARCH PRODUCTS
    const handleSearch = (value = search) => {
        const searchValue = value.trim();

        if (!searchValue) return;

        setShowSearchRecommendations(false);
        setSearch(searchValue);

        router.push(`/catalog/?q=${encodeURIComponent(searchValue)}`);
    };

    // CLEAR SEARCH
    const clearSearch = () => {
        setSearch("");
        setShowSearchRecommendations(true);
        setSearchSuggestions({});
    };

    // SEARCH INPUT SUGGESTIONS
    useEffect(() => {
        if (!search.trim()) {
            setSearchSuggestions({});
            return;
        }

        let cancelled = false;

        const fetchSearchSuggestions = async () => {
            try {
                const response = await api.get(
                    `/api/p/searchsuggestion/?q=${encodeURIComponent(search.trim())}`
                );

                if (!cancelled) {
                    setSearchSuggestions(response.data || {});
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Failed to fetch search suggestions:", error);
                }
            }
        };

        fetchSearchSuggestions();

        return () => {
            cancelled = true;
        };
    }, [search]);

    const notificationLink = "/dashboard/inbox";

    // NOTIFICATION BELL
    const NotificationBell = ({ mobile = false }) => (
        <Link
            href={notificationLink}
            aria-label={`Notifications, ${unreadCount} unread`}
            className={
                mobile
                    ? "relative flex items-center justify-center text-[25px]"
                    : "flex items-center gap-1.5 text-[17px]"
            }
        >
            <span className="relative inline-flex">
                <IoNotificationsOutline
                    className={mobile ? "text-[25px]" : "text-[23px]"}
                />

                {unreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex min-w-4 items-center justify-center rounded-full bg-red-600 px-1 py-0.5 text-[10px] leading-none text-white ring-2 ring-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </span>

            {!mobile && (
                <span className="max-[860px]:hidden">Notifications</span>
            )}
        </Link>
    );

    return (
        <nav className="fixed top-0 z-[400] flex w-full items-center justify-between gap-4 bg-white px-6 py-3 shadow-sm lg:gap-6 lg:px-10 max-[1100px]:px-4 max-[740px]:flex-col max-[740px]:items-stretch max-[740px]:gap-2 max-[740px]:px-4 max-[740px]:py-3">
            {/* BRAND AND MOBILE NAVIGATION */}
            <div className="flex shrink-0 items-center max-[740px]:w-full max-[740px]:justify-between">
                <div className="flex min-w-0 items-center">
                    <button
                        type="button"
                        aria-label="Open categories menu"
                        className="mr-2 cursor-pointer text-[23px]"
                        onClick={() => setShowCategory((previous) => !previous)}
                    >
                        <AiOutlineMenu />
                    </button>

                    <Link href="/" className="text-[1.3rem] font-bold text-[#333]">
                        Temmy <span className="text-blue-600">Collection</span>
                    </Link>
                </div>

                <div className="flex shrink-0 items-center gap-4 text-2xl min-[741px]:hidden">
                    {isAuthenticated && <NotificationBell mobile />}

                    <Link
                        href="/dashboard"
                        aria-label="Account"
                        className="text-[25px]"
                    >
                        <AiOutlineUser />
                    </Link>

                    <Link
                        href="/cart"
                        aria-label={`Cart, ${cartCount} items`}
                        className="relative text-[25px]"
                    >
                        <IoCartOutline />
                        {cartCount > 0 && (
                            <span className="absolute -right-2 -top-1.5 rounded-full border-2 border-white bg-amber-500 px-1 text-center text-[10px] text-white">
                                {cartCount > 99 ? "99+" : cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* SEARCH + CUSTOMER NOTIFICATIONS */}
            <div className="flex min-w-0 flex-1 items-center gap-3 max-[740px]:w-full max-[740px]:flex-col max-[740px]:items-stretch">
            <div
                ref={searchRef}
                className="relative flex min-w-0 flex-1 items-center max-[740px]:w-full"
            >
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        handleSearch();
                    }}
                    className="relative z-30 flex w-full min-w-0 items-center rounded-2xl bg-[#eee] pl-2.5"
                >
                    <IoSearch className="mr-1 text-lg text-gray-500" />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        onFocus={() => setShowSearchRecommendations(true)}
                        placeholder="Search products, brands and categories"
                        className="w-full border-0 bg-transparent px-1 py-2.5 text-[14px] outline-0"
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            aria-label="Clear search"
                            className="mr-2 cursor-pointer text-xl text-gray-500 hover:text-black"
                        >
                            <IoMdClose />
                        </button>
                    )}

                    <button
                        type="submit"
                        aria-label="Search"
                        className="flex h-10 w-20 min-w-20 cursor-pointer items-center justify-center rounded-r-2xl bg-blue-600 text-2xl text-white"
                    >
                        <IoSearch />
                    </button>
                </form>

                {/* SEARCH RECOMMENDATIONS */}
                {showSearchRecommendations && (
                    <div className="absolute top-10.75 right-0 left-0 z-20 overflow-hidden rounded-b-xl border border-gray-100 bg-white shadow-xl">
                        {!search.trim() && (
                            <div className="py-3">
                                {recentSearches?.results?.length > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between px-4 py-2">
                                            <h3 className="text-[14px] font-semibold">
                                                {recentSearches.results.length === 1
                                                    ? "Recent search"
                                                    : "Recent searches"}
                                            </h3>

                                            <button
                                                type="button"
                                                onClick={() => {}}
                                                className="cursor-pointer text-xs text-blue-600"
                                            >
                                                Clear
                                            </button>
                                        </div>

                                        {recentSearches.results.map((item) => (
                                            <button
                                                type="button"
                                                key={item.id}
                                                onClick={() => handleSearch(item.keyword)}
                                                className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50"
                                            >
                                                <IoSearch className="text-gray-400" />
                                                <span className="text-sm text-gray-700">
                                                    {item.keyword}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-2">
                                    <h3 className="px-4 py-2 text-[14px] font-semibold">
                                        Popular searches
                                    </h3>

                                    {[
                                        "Sneakers",
                                        "Smart watches",
                                        "Phones",
                                        "Men shirts",
                                        "Women dresses",
                                    ].map((item) => (
                                        <button
                                            type="button"
                                            key={item}
                                            onClick={() => handleSearch(item)}
                                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50"
                                        >
                                            <IoSearch className="text-gray-400" />
                                            <span className="text-sm text-gray-700">
                                                {item}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {search.trim() && (
                            <div className="py-2">
                                <h3 className="px-4 py-2 text-[14px] font-semibold">
                                    Search suggestions
                                </h3>

                                {searchSuggestions?.suggestions?.map((suggestion) => (
                                    <Link
                                        key={suggestion.slug || suggestion.text}
                                        href={`/catalog/?q=${encodeURIComponent(suggestion.text || "")}`}
                                        onClick={() =>
                                            setShowSearchRecommendations(false)
                                        }
                                        className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-gray-50"
                                    >
                                        <IoSearch className="text-gray-400" />
                                        <span className="text-sm text-gray-700">
                                            {suggestion.text}
                                        </span>
                                    </Link>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => handleSearch()}
                                    className="mt-1 flex w-full cursor-pointer items-center gap-3 border-t px-4 py-3 text-left hover:bg-gray-50"
                                >
                                    <IoSearch className="text-blue-600" />
                                    <span className="text-sm">
                                        Search for <strong>"{search}"</strong>
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* <div className="flex shrink-0 items-center max-[740px]:w-full max-[740px]:justify-start max-[740px]:border-t max-[740px]:border-gray-200 max-[740px]:py-2">
                <EnableCustomerNotifications />
            </div> */}

            </div>

            {/* DESKTOP NAVIGATION */}
            <div className="flex shrink-0 gap-4 max-[740px]:hidden">
                {isAuthenticated && <NotificationBell />}

                <Link
                    href="/dashboard"
                    className="flex items-center gap-1 text-[17px]"
                >
                    <AiOutlineUser className="text-[23px]" />
                    <span className="max-[860px]:hidden">Account</span>
                </Link>

                <Link
                    href="/cart"
                    className="relative flex items-center gap-1.5 text-[17px]"
                >
                    <IoCartOutline className="text-[23px]" />

                    {cartCount > 0 && (
                        <span className="absolute -top-1.5 left-3 rounded-full border-2 border-white bg-amber-500 px-1 text-center text-[10px] text-white">
                            {cartCount > 99 ? "99+" : cartCount}
                        </span>
                    )}

                    <span className="max-[860px]:hidden">Cart</span>
                </Link>
            </div>

            {/* CATEGORY SIDEBAR */}
            {showCategory && (
                <div className="fixed inset-0 z-50 flex items-start">
                    <button
                        type="button"
                        aria-label="Close categories menu"
                        className="absolute inset-0 cursor-pointer bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowCategory(false)}
                    />

                    <div className="relative z-10 h-full w-80 overflow-y-auto bg-white text-[#333] shadow-xl">
                        <div className="flex w-full justify-between px-3 py-3 pb-4">
                            <h4 className="text-[20px] font-semibold">
                                Temmy <span className="text-blue-600">Collection</span>
                            </h4>

                            <button
                                type="button"
                                aria-label="Close menu"
                                className="ml-2 cursor-pointer text-[26px] focus:outline-none"
                                onClick={() => setShowCategory(false)}
                            >
                                <IoMdClose />
                            </button>
                        </div>

                        {/* ACCOUNT LINKS */}
                        <div className="h-auto w-full pb-3">
                            <Link
                                href="/dashboard"
                                onClick={() => setShowCategory(false)}
                                className="block w-full border-t border-[#aaa] px-4 pt-3 py-2 text-[14px] font-semibold"
                            >
                                TEMMY COLLECTION ACCOUNT
                            </Link>

                            <Link
                                href="/dashboard/order"
                                onClick={() => setShowCategory(false)}
                                className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3"
                            >
                                <TfiPackage className="text-[20px] font-medium" />
                                <span className="text-[15px]">Orders</span>
                            </Link>

                            <Link
                                href="/dashboard/inbox"
                                onClick={() => setShowCategory(false)}
                                className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3"
                            >
                                <FaInbox className="text-[20px]" />
                                <span className="text-[15px]">Inbox</span>

                                {unreadCount > 0 && (
                                    <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </span>
                                )}
                            </Link>

                            <Link
                                href="/dashboard/wishlist"
                                onClick={() => setShowCategory(false)}
                                className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3"
                            >
                                <FaRegHeart className="text-[20px]" />
                                <span className="text-[15px]">Wishlist</span>
                            </Link>
                        </div>

                        {/* CATEGORIES */}
                        <div>
                            <Link
                                href="/"
                                onClick={() => setShowCategory(false)}
                                className="block border-t border-[#aaa] px-4 py-2 text-[14px] font-semibold"
                            >
                                OUR CATEGORIES
                            </Link>

                            <div className="pb-2">
                                {category?.map((cat) => {
                                    const isOpen =
                                        showCategoryChild[`category_${cat.id}`];

                                    return (
                                        <div
                                            key={`cat-${cat.id}`}
                                            className="w-full border-b border-gray-50 last:border-0"
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleCategoryChild(cat.id)
                                                }
                                                className="flex w-full cursor-pointer items-center justify-between px-6 py-3 text-left transition-colors hover:bg-gray-50"
                                            >
                                                <span className="font-medium text-black">
                                                    {cat.name}
                                                </span>

                                                <AiOutlineMenu
                                                    className={`transform text-sm transition-transform duration-200 ${
                                                        isOpen
                                                            ? "rotate-90 text-blue-600"
                                                            : ""
                                                    }`}
                                                />
                                            </button>

                                            <div
                                                className={`flex flex-col overflow-hidden bg-gray-50 transition-all duration-300 ease-in-out ${
                                                    isOpen
                                                        ? "max-h-125 py-2"
                                                        : "max-h-0"
                                                }`}
                                            >
                                                {cat.children?.map((child) => (
                                                    <Link
                                                        href={`/${child.slug}`}
                                                        key={`child-${child.id}`}
                                                        onClick={() =>
                                                            setShowCategory(false)
                                                        }
                                                        className="pr-6 pl-10 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600"
                                                    >
                                                        {child.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* FOOTER LINKS */}
                        <div>
                            <div className="border-t border-[#aaa] px-4 py-2" />

                            <Link
                                href="/"
                                onClick={() => setShowCategory(false)}
                                className="flex w-full items-center gap-2.5 px-4 py-2"
                            >
                                <span className="text-[17px]">Service Center</span>
                            </Link>

                            <Link
                                href="/"
                                onClick={() => setShowCategory(false)}
                                className="flex w-full items-center gap-2.5 px-4 py-2"
                            >
                                <span className="text-[17px]">Contact us</span>
                            </Link>

                            <Link
                                href="/"
                                onClick={() => setShowCategory(false)}
                                className="flex w-full items-center gap-2.5 px-4 py-2"
                            >
                                <span className="text-[17px]">About us</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;