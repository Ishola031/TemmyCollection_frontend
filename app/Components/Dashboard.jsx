import Link from 'next/link';
import React from 'react'
import { IoMdClose } from "react-icons/io";
import { FaRegHeart } from "react-icons/fa";
import { AiOutlineUser } from "react-icons/ai";
import { FaInbox } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import { TfiPackage } from 'react-icons/tfi';
import { IoLocationOutline, IoTimeOutline } from "react-icons/io5";

const Dashboard = ({ custom, display }) => {
    return (
        <div className={`w-[30%] h-auto ${display === 'hidden' && ('max-[850px]:hidden')} max-[850px]:w-full`}>
            
            {/* SIDEBAR */}
            <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

                {/* HEADER */}
                <div className="px-5 py-5 bg-[#333] text-white">
                    <h2 className="text-[20px] font-semibold">
                        My Account
                    </h2>
                    <p className="text-[13px] text-gray-300 mt-1">
                        Manage your Temmy Collection account
                    </p>
                </div>

                {/* ACCOUNT MENU */}
                <div className="py-2">

                    <p className="px-5 pt-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        Account
                    </p>

                    <Link
                        href="/dashboard"
                        className={`mx-2 px-4 py-3 rounded-lg flex gap-3 items-center cursor-pointer transition-all
                        ${custom === 'dashboard'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-[#333] hover:bg-gray-100'}`}
                    >
                        <AiOutlineUser className="text-[21px]" />
                        <h4 className="text-[15px] font-medium">
                            Dashboard
                        </h4>
                    </Link>

                    <Link
                        href="/dashboard/profile"
                        className={`mx-2 px-4 py-3 rounded-lg flex gap-3 items-center cursor-pointer transition-all
                        ${custom === 'profile'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-[#333] hover:bg-gray-100'}`}
                    >
                        <AiOutlineUser className="text-[21px]" />
                        <h4 className="text-[15px] font-medium">
                            My Profile
                        </h4>
                    </Link>

                    <Link
                        href="/dashboard/address"
                        className={`mx-2 px-4 py-3 rounded-lg flex gap-3 items-center cursor-pointer transition-all
                        ${custom === 'address'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-[#333] hover:bg-gray-100'}`}
                    >
                        <IoLocationOutline className="text-[21px]" />
                        <h4 className="text-[15px] font-medium">
                            Address
                        </h4>
                    </Link>

                    {/* SHOPPING */}
                    <p className="px-5 pt-5 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        Shopping
                    </p>

                    <Link
                        href="/dashboard/order"
                        className={`mx-2 px-4 py-3 rounded-lg flex gap-3 items-center cursor-pointer transition-all
                        ${custom === 'order'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-[#333] hover:bg-gray-100'}`}
                    >
                        <TfiPackage className="text-[20px]" />
                        <h4 className="text-[15px] font-medium">
                            Orders
                        </h4>
                    </Link>

                    <Link
                        href="/dashboard/inbox"
                        className={`mx-2 px-4 py-3 rounded-lg flex gap-3 items-center cursor-pointer transition-all
                        ${custom === 'inbox'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-[#333] hover:bg-gray-100'}`}
                    >
                        <FaInbox className="text-[19px]" />
                        <h4 className="text-[15px] font-medium">
                            Inbox
                        </h4>
                    </Link>

                    <Link
                        href="/dashboard/wishlist"
                        className={`mx-2 px-4 py-3 rounded-lg flex gap-3 items-center cursor-pointer transition-all
                        ${custom === 'wishlist'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-[#333] hover:bg-gray-100'}`}
                    >
                        <FaRegHeart className="text-[19px]" />
                        <h4 className="text-[15px] font-medium">
                            Wishlist
                        </h4>
                    </Link>

                    <Link
                        href="/dashboard/recentviewed"
                        className={`mx-2 px-4 py-3 rounded-lg flex gap-3 items-center cursor-pointer transition-all
                        ${custom === 'recentviewed'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-[#333] hover:bg-gray-100'}`}
                    >
                        <IoTimeOutline className="text-[21px]" />
                        <h4 className="text-[15px] font-medium">
                            Recently Viewed
                        </h4>
                    </Link>

                </div>

                {/* LOGOUT */}
                <div className="border-t border-gray-200 p-3 mt-2">
                    <button
                        className="w-full py-3 px-4 rounded-lg bg-[#333] text-white cursor-pointer flex items-center gap-3 justify-center hover:bg-black transition-colors"
                    >
                        <IoIosLogOut className="text-[20px]" />
                        <span className="text-[15px] font-medium">
                            Logout
                        </span>
                    </button>
                </div>

            </div>
        </div>
    )
}

export default Dashboard