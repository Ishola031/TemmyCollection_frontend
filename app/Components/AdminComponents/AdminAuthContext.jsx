"use client"

import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import adminApi from "../../api/adminApi"

const AdminAuthContext = createContext()

export function AdminAuthProvider({ children }) {

    const router = useRouter()

    const [admin, setAdmin] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const lastActivitySent = useRef(0)
    const inactivityTimer = useRef(null)

    const API = "http://localhost:8000/api/admin"

    const logout = async () => {

        try {
            await adminApi.post(`logout/`,{},
                {
                    withCredentials: true
                }
            )
        } catch (error) {
            console.log("Logout error:", error)
        }

        setAdmin(null)
        setIsAuthenticated(false)

        router.push("/admin/login")
    }

    const checkAuth = async () => {

        try {

            const response = await adminApi.get(`me/`,
                {
                    withCredentials: true
                }
            )

            if (response.data.success) {
                setAdmin(response.data.user)
                setIsAuthenticated(true)
                return true
            }

        } catch (error) {

            if (error.response?.status === 401) {

                try {

                    await adminApi.post(`refresh/`,{},
                        {
                            withCredentials: true
                        }
                    )

                    const response = await adminApi.get(
                        `me/`,
                        {
                            withCredentials: true
                        }
                    )

                    if (response.data.success) {
                        setAdmin(response.data.user)
                        setIsAuthenticated(true)
                        return true
                    }

                } catch (refreshError) {
                    setAdmin(null)
                    setIsAuthenticated(false)
                }
            }
        }

        return false
    }

    const login = async (email, password) => {

        try {

            const response = await adminApi.post(
                `login/`,
                {
                    email,
                    password
                },
                {
                    withCredentials: true
                }
            )

            if (response.data.success) {

                const authenticated = await checkAuth()

                if (authenticated) {
                    router.push("/admin/dashboard")
                    return {
                        success: true
                    }
                }
            }

            return {
                success: false,
                message: "Unable to login."
            }

        } catch (error) {

            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Invalid email or password."
            }
        }
    }

    const resetInactivityTimer = () => {

        if (inactivityTimer.current) {
            clearTimeout(inactivityTimer.current)
        }

        inactivityTimer.current = setTimeout(() => {
            logout()
        }, 30 * 60 * 1000)
    }

    useEffect(() => {

        const initialize = async () => {

            const authenticated = await checkAuth()

            if (!authenticated) {
                setAdmin(null)
                setIsAuthenticated(false)
            }

            setLoading(false)
        }

        initialize()

    }, [])

    useEffect(() => {

        if (!isAuthenticated) {
            return
        }

        const events = [
            "mousemove",
            "mousedown",
            "keydown",
            "scroll",
            "touchstart"
        ]

        // const handleActivity = () => {
        //     resetInactivityTimer()
        // }

        const handleActivity = () => {

            resetInactivityTimer()

            const now = Date.now()

            if (now - lastActivitySent.current < 5 * 60 * 1000) {
                return
            }

            lastActivitySent.current = now

            adminApi.post(
                `activity/`,
                {},
                {
                    withCredentials: true
                }
            ).catch((error) => {

                if (error.response?.status === 401) {
                    logout()
                }

            })
        }

        events.forEach((event) => {
            window.addEventListener(event, handleActivity)
        })

        resetInactivityTimer()

        return () => {

            events.forEach((event) => {
                window.removeEventListener(event, handleActivity)
            })

            if (inactivityTimer.current) {
                clearTimeout(inactivityTimer.current)
            }
        }

    }, [isAuthenticated])

    return (
        <AdminAuthContext.Provider
            value={{
                admin,
                loading,
                isAuthenticated,
                login,
                logout,
                checkAuth
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    )
}

export function useAdminAuth() {
    return useContext(AdminAuthContext)
}