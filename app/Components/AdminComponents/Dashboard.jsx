"use client";

import React from "react";
import {
    FiGrid,
    FiShoppingBag,
    FiShoppingCart,
    FiUsers,
    FiBox,
    FiTag,
    FiBarChart2,
    FiTruck,
    FiMail,
    FiSettings,
    FiMenu,
    FiX,
    FiLogOut,
} from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: FiGrid,
    },
    {
        label: "Orders",
        href: "/admin/dashboard/orders",
        icon: FiShoppingCart,
    },
    {
        label: "Products",
        href: "/admin/dashboard/products",
        icon: FiShoppingBag,
    },
    {
        label: "Inventory",
        href: "/admin/dashboard/inventory",
        icon: FiBox,
    },
    {
        label: "Customers",
        href: "/admin/dashboard/customers",
        icon: FiUsers,
    },
    {
        label: "Categories",
        href: "/admin/dashboard/categories",
        icon: FiTag,
    },
    {
        label: "Coupons",
        href: "/admin/dashboard/coupons",
        icon: FiTag,
    },
    {
        label: "Analytics",
        href: "/admin/dashboard/analytics",
        icon: FiBarChart2,
    },
    {
        label: "Shipping",
        href: "/admin/dashboard/shipping",
        icon: FiTruck,
    },
    {
        label: "Newsletter",
        href: "/admin/dashboard/newsletter",
        icon: FiMail,
    },
];

export default function Dashboard({ children }) {
    const pathname = usePathname();

    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const isActive = (href) => {
        if (href === "/admin/dashboard") {
            return pathname === href;
        }

        return pathname?.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* MOBILE OVERLAY */}
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                }`}
            >
                {/* LOGO */}
                <div className="flex h-20 items-center justify-between border-b border-gray-100 px-5">
                    <Link
                        href="/admin/dashboard"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-sm font-bold text-white">
                            TC
                        </div>

                        <div>
                            <h1 className="text-base font-bold tracking-tight text-gray-900">
                                Temmy
                            </h1>

                            <p className="text-xs text-gray-400">
                                Collection
                            </p>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* NAVIGATION */}
                <div className="flex-1 overflow-y-auto px-3 py-5">
                    <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Store
                    </p>

                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() =>
                                        setSidebarOpen(false)
                                    }
                                    className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                                        active
                                            ? "bg-gray-900 text-white shadow-sm"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                                >
                                    <Icon
                                        size={18}
                                        className={
                                            active
                                                ? "text-white"
                                                : "text-gray-400 group-hover:text-gray-700"
                                        }
                                    />

                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="my-6 border-t border-gray-100" />

                    <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        System
                    </p>

                    <Link
                        href="/admin/dashboard/settings"
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                            isActive("/admin/dashboard/settings")
                                ? "bg-gray-900 text-white"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                    >
                        <FiSettings
                            size={18}
                            className="text-gray-400 group-hover:text-gray-700"
                        />

                        <span>Settings</span>
                    </Link>
                </div>

                {/* ADMIN PROFILE */}
                <div className="border-t border-gray-100 p-4">
                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                            A
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">
                                Admin
                            </p>

                            <p className="truncate text-xs text-gray-400">
                                Store Administrator
                            </p>
                        </div>

                        <button
                            type="button"
                            title="Logout"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white hover:text-red-500"
                        >
                            <FiLogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN AREA */}
            <div className="lg:pl-64">
                {/* TOP BAR */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 lg:hidden"
                    >
                        <FiMenu size={21} />
                    </button>

                    <div className="hidden lg:block">
                        <p className="text-sm font-medium text-gray-500">
                            Temmy Collection Admin
                        </p>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-semibold text-gray-900">
                                Admin
                            </p>

                            <p className="text-xs text-gray-400">
                                Administrator
                            </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                            A
                        </div>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}