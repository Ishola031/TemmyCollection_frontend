import Link from 'next/link';
import React from 'react'
import { IoMdClose } from "react-icons/io";
import { FaRegHeart } from "react-icons/fa";
import { AiOutlineUser } from "react-icons/ai";
import { FaInbox } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import { TfiPackage } from 'react-icons/tfi';

const Dashboard = ({ custom, display }) => {
    return (
        <div className={`w-[30%] h-auto ${display === 'hidden' && ('max-[850px]:hidden')} max-[850px]:w-full`}>
            <Link href="/dashboard" className={`w-full py-3 px-4 flex gap-2.5 items-center  cursor-pointer ${custom === 'dashboard' ? ('bg-[#333] text-white') : ('hover:bg-[#eee]')}`}>
                <AiOutlineUser className="text-[20px]" />
                <h4 className="text-[18px]">Dashboard</h4>
            </Link>
            <Link href="/dashboard/profile" className={`w-full py-3 px-4 flex gap-2.5 items-center  cursor-pointer ${custom === 'profile' ? ('bg-[#333] text-white') : ('hover:bg-[#eee]')}`}>
                <AiOutlineUser className="text-[20px]" />
                <h4 className="text-[18px]">My Profile</h4>
            </Link>
            <Link href="/dashboard/address" className={`w-full py-3 px-4 flex gap-2.5 items-center  cursor-pointer ${custom === 'address' ? ('bg-[#333] text-white') : ('hover:bg-[#eee]')}`}>
                <IoMdClose className="text-[20px]" />
                <h4 className="text-[18px]">Address</h4>
            </Link>

            <Link href="/dashboard/order" className={`w-full py-3 px-4 flex gap-2.5 items-center  cursor-pointer ${custom === 'order' ? ('bg-[#333] text-white') : ('hover:bg-[#eee]')}`}>
                <TfiPackage className="text-[20px]" />
                <h4 className="text-[18px]">Orders</h4>
            </Link>
            <Link href="/dashboard/inbox" className={`w-full py-3 px-4 flex gap-2.5 items-center  cursor-pointer ${custom === 'inbox' ? ('bg-[#333] text-white') : ('hover:bg-[#eee]')}`}>
                <FaInbox className="text-[20px]" />
                <h4 className="text-[18px]">Inbox</h4>
            </Link>
            <Link href="/dashboard/wishlist" className={`w-full py-3 px-4 flex gap-2.5 items-center  cursor-pointer ${custom === 'wishlist' ? ('bg-[#333] text-white') : ('hover:bg-[#eee]')}`}>
                <FaRegHeart className="text-[20px]" />
                <h4 className="text-[18px]">Wishlist</h4>
            </Link>
            <Link href="/dashboard/recentviewed" className={`w-full py-3 px-4 flex gap-2.5 items-center  cursor-pointer ${custom === 'recentviewed' ? ('bg-[#333] text-white') : ('hover:bg-[#eee]')}`}>
                <IoMdClose className="text-[20px]" />
                <h4 className="text-[18px]">Recent Viewed</h4>
            </Link>
            {/* <Link href="" className="w-full py-3 px-4 flex gap-2.5 items-center hover:bg-[#eee] cursor-pointer">
                <IoMdClose className="text-[20px]" />
                <h4 className="text-[18px] line-clamp-1 overflow-hidden text-ellipsis ">Account Management</h4>
            </Link> */}
            {/* <Link href="" className="w-full py-3 px-4 flex gap-2.5 items-center hover:bg-[#eee] cursor-pointer">
                <IoMdClose className="text-[20px]" />
                <h4 className="text-[18px]">Payment Settings</h4>
            </Link> */}

            {/* <Link href="" className="w-full py-3 px-4 flex gap-2.5 items-center hover:bg-[#eee] cursor-pointer border-b border-[#eee]">
                <IoMdClose className="text-[20px]" />
                <h4 className="text-[18px] line-clamp-1 overflow-hidden text-ellipsis">Newsletter Preferences</h4>
            </Link> */}
            <button className="w-full py-3 px-4 bg-[#333] text-white cursor-pointer flex items-center gap-3 justify-center"><IoIosLogOut className='text-[20px]' />Logout</button>
        </div>
    )
}

export default Dashboard