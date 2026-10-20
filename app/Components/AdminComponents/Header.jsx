import React from 'react'
import {
    FiBell,
    FiBox,
    FiChevronDown,
    FiChevronRight,
    FiDollarSign,
    FiGrid,
    FiMenu,
    FiMoreHorizontal,
    FiPackage,
    FiSearch,
    FiShoppingBag,
    FiShoppingCart,
    FiUsers,
    FiX,
    FiArrowUpRight,
    FiArrowDownRight,
    FiPlus,
    FiSettings,
    FiLogOut,
    FiTag,
    FiStar,
} from "react-icons/fi";



const Header = ({setSidebarOpen}) => {
  return (
    <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-gray-200 bg-[#f7f7f5]/95 px-5 backdrop-blur-md sm:px-8 lg:px-10">
        <div className="flex items-center gap-4">
            <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-gray-200 bg-white p-2.5 lg:hidden"
            >
                <FiMenu size={20} />
            </button>

            <div className="hidden items-center gap-2 text-sm text-gray-400 sm:flex">
                <span>Admin</span>
                <FiChevronRight size={14} />
                <span className="font-medium text-black">
                    Overview
                </span>
            </div>

            <div className="sm:hidden">
                <p className="text-sm font-semibold">Overview</p>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
                <FiSearch
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                    placeholder="Search anything..."
                    className="h-10 w-[220px] rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-black"
                />
            </div>

            <button className="relative rounded-xl border border-gray-200 bg-white p-2.5 hover:bg-gray-50">
                <FiBell size={18} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>

            <button className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white p-1.5 pr-3 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-xs font-bold text-white">
                    SA
                </div>

                <div className="text-left">
                    <p className="text-xs font-semibold">
                        Sanni Admin
                    </p>
                    <p className="text-[10px] text-gray-400">
                        Administrator
                    </p>
                </div>

                <FiChevronDown
                    size={14}
                    className="ml-1 text-gray-400"
                />
            </button>
        </div>
    </header>
  )
}

export default Header
