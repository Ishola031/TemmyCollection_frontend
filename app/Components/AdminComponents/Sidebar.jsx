
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
    FiLayers,
    FiAward,
    FiDroplet,
    FiMaximize,
    FiSliders,
    FiBell,
    FiHome,
} from "react-icons/fi";

import adminApi from "../../api/adminApi";

const menuGroups = [
    {
        title: "GENERAL",
        items: [
            {
                label: "Overview",
                icon: FiHome,
                link: "/admin/dashboard",
            },
            {
                label: "Notifications",
                icon: FiBell,
                link: "/admin/dashboard/notifications",
            },
        ],
    },
    {
        title: "SALES & CUSTOMERS",
        items: [
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
            {
                label: "Reviews",
                icon: FiStar,
                link: "/admin/dashboard/reviews",
            },
        ],
    },
    {
        title: "CATALOG MANAGEMENT",
        items: [
            {
                label: "Categories",
                icon: FiGrid,
                link: "/admin/dashboard/categories",
            },
            {
                label: "Catalog",
                icon: FiLayers,
                link: "/admin/dashboard/catalog",
            },
            
        ],
    },
    {
        title: "MARKETING",
        items: [
            {
                label: "Newsletter",
                icon: FiMail,
                link: "/admin/dashboard/newsletter",
            },
        ],
    },
];

function NavigationGroup({ group, pathname, onNavigate }) {
    return (
        <div className="mb-7">
            <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.18em] text-gray-400">
                {group.title}
            </p>

            <div className="space-y-1">
                {group.items.map((item) => {
                    const Icon = item.icon;

                    const active =
                        item.link === "/admin/dashboard"
                            ? pathname === item.link ||
                              pathname === `${item.link}/`
                            : pathname === item.link ||
                              pathname.startsWith(`${item.link}/`);

                    return (
                        <Link
                            key={item.link}
                            href={item.link}
                            onClick={onNavigate}
                            aria-current={active ? "page" : undefined}
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
                                        ? "shrink-0 text-white"
                                        : "shrink-0 text-gray-400 transition-colors group-hover:text-gray-900"
                                }
                            />

                            <span className="min-w-0 flex-1">
                                {item.label}
                            </span>

                            {active && (
                                <FiChevronRight
                                    size={15}
                                    className="shrink-0 text-gray-400"
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const pathname = usePathname();
    const router = useRouter();

    const [loggingOut, setLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

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

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[255px] flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out ${
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
                    className="min-h-0 flex-1 overflow-y-auto px-4 py-6"
                >
                    {menuGroups.map((group) => (
                        <NavigationGroup
                            key={group.title}
                            group={group}
                            pathname={pathname}
                            onNavigate={handleNavigation}
                        />
                    ))}
                </nav>

                {/* Footer actions */}
                <div className="shrink-0 border-t border-gray-100 p-4">
                    <Link
                        href="/admin/dashboard/settings"
                        onClick={handleNavigation}
                        aria-current={
                            pathname === "/admin/dashboard/settings" ||
                            pathname.startsWith(
                                "/admin/dashboard/settings/"
                            )
                                ? "page"
                                : undefined
                        }
                        className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                            pathname === "/admin/dashboard/settings" ||
                            pathname.startsWith(
                                "/admin/dashboard/settings/"
                            )
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
                            className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-600"
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
