"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    FiGrid,
    FiShoppingCart,
    FiPackage,
    FiTag,
    FiUsers,
    FiStar,
    FiMail,
    FiSettings,
    FiLogOut,
    FiX,
    FiChevronRight,
    FiLoader,
} from "react-icons/fi";

import adminApi from "../../api/adminApi";

const menuGroups = [
    {
        title: "MAIN",
        items: [
            {
                label: "Overview",
                icon: FiGrid,
                link: "/admin/dashboard",
            },
            {
                label: "Orders",
                icon: FiShoppingCart,
                link: "/admin/dashboard/orders",
            },
            {
                label: "Inventory",
                icon: FiPackage,
                link: "/admin/dashboard/inventory",
            },
            {
                label: "Coupons",
                icon: FiTag,
                link: "/admin/dashboard/coupons",
            },
            {
                label: "Customers",
                icon: FiUsers,
                link: "/admin/dashboard/customers",
            },
        ],
    },
    {
        title: "STORE",
        items: [
            {
                label: "Categories",
                icon: FiGrid,
                link: "/admin/dashboard/categories",
            },
            {
                label: "Reviews",
                icon: FiStar,
                link: "/admin/dashboard/reviews",
            },
            {
                label: "Newsletter",
                icon: FiMail,
                link: "/admin/dashboard/newsletter",
            },
            {
                label: "Notifications",
                icon: FiMail,
                link: "/admin/dashboard/notifications",
            },
        ],
    },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const pathname = usePathname();
    const router = useRouter();

    const [loggingOut, setLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    const isActive = (link) => {
        if (link === "/admin/dashboard") {
            return (
                pathname === link ||
                pathname === "/admin/dashboard/"
            );
        }

        return (
            pathname === link ||
            pathname.startsWith(`${link}/`)
        );
    };

    const handleNavigation = () => {
        setSidebarOpen(false);
        setLogoutError("");
    };

    const handleLogout = async () => {
        if (loggingOut) return;

        setLoggingOut(true);
        setLogoutError("");

        try {
            await adminApi.post("auth/logout/");

            setSidebarOpen(false);
            router.replace("/admin/login");
            router.refresh();
        } catch (error) {
            console.error("Admin logout failed:", error);

            setLogoutError(
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                "Unable to log out. Please try again."
            );
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-50 flex h-screen w-[255px] flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                }`}
            >
                {/* Brand */}
                <div className="flex h-[82px] shrink-0 items-center justify-between border-b border-gray-100 px-6">
                    <Link
                        href="/admin/dashboard"
                        onClick={handleNavigation}
                        className="group"
                    >
                        <h1 className="text-2xl font-black tracking-tight text-gray-950">
                            TEMMY<span className="text-gray-400">.</span>
                        </h1>

                        <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-gray-400">
                            Collection Admin
                        </p>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close sidebar"
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 lg:hidden"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav
                    aria-label="Admin navigation"
                    className="flex-1 overflow-y-auto px-4 py-7"
                >
                    {menuGroups.map((group) => (
                        <div key={group.title} className="mb-8">
                            <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.18em] text-gray-400">
                                {group.title}
                            </p>

                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.link);

                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.link}
                                            onClick={handleNavigation}
                                            aria-current={
                                                active ? "page" : undefined
                                            }
                                            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200 ${
                                                active
                                                    ? "bg-gray-950 font-semibold text-white shadow-sm"
                                                    : "font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-950"
                                            }`}
                                        >
                                            <Icon
                                                size={18}
                                                className={
                                                    active
                                                        ? "text-white"
                                                        : "text-gray-400 transition-colors group-hover:text-gray-900"
                                                }
                                            />

                                            <span className="flex-1">
                                                {item.label}
                                            </span>

                                            {active && (
                                                <FiChevronRight
                                                    size={15}
                                                    className="text-gray-400"
                                                />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom actions */}
                <div className="shrink-0 border-t border-gray-100 p-4">
                    <Link
                        href="/admin/dashboard/settings"
                        onClick={handleNavigation}
                        className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                            isActive("/admin/dashboard/settings")
                                ? "bg-gray-100 text-gray-950"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-950"
                        }`}
                    >
                        <FiSettings size={18} />
                        <span className="flex-1">Settings</span>
                    </Link>

                    {logoutError && (
                        <p
                            role="alert"
                            className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600"
                        >
                            {logoutError}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loggingOut ? (
                            <FiLoader
                                size={18}
                                className="animate-spin"
                            />
                        ) : (
                            <FiLogOut size={18} />
                        )}

                        <span>
                            {loggingOut ? "Logging out..." : "Logout"}
                        </span>
                    </button>

                    <p className="mt-4 px-3 text-[10px] text-gray-400">
                        TemmyCollection Admin
                    </p>
                </div>
            </aside>
        </>
    );
}
