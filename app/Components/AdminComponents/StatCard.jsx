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


const StatCard = ({title,value,change,positive,icon:Icon}) => {
  return (
    <div
        key={title}
        className="group rounded-2xl border border-gray-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
        <div className="mb-6 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <Icon size={19} />
            </div>

            <button className="text-gray-300 transition group-hover:text-gray-500">
                <FiMoreHorizontal size={19} />
            </button>
        </div>

        <p className="text-sm text-gray-500">
            {title}
        </p>

        <div className="mt-1 flex items-end justify-between gap-3">
            <h3 className="text-xl font-bold tracking-tight">
                {value}
            </h3>

            <span
                className={`mb-0.5 flex items-center gap-1 text-xs font-semibold ${
                    positive
                        ? "text-emerald-600"
                        : "text-red-500"
                }`}
            >
                {positive ? (
                    <FiArrowUpRight size={13} />
                ) : (
                    <FiArrowDownRight size={13} />
                )}
                {change}
            </span>
        </div>
    </div>
  )
}

export default StatCard
