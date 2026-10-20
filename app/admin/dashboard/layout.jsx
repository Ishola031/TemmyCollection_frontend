"use client";

import React, { useState } from "react";
import Sidebar from "../../Components/AdminComponents/Sidebar";
import Header from "../../Components/AdminComponents/Header";
import { AdminAuthProvider } from "../../Components/AdminComponents/AdminAuthContext";

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f7f7f5] text-[#151515]">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            <main className="lg:ml-[255px]">
                <AdminAuthProvider>
                    <Header setSidebarOpen={setSidebarOpen} />
                </AdminAuthProvider>
                {children}
            </main>
        </div>
    );
}