'use client';
import React, { createContext, useEffect, useState } from 'react'
import api from '../api/api';
import useSWR from 'swr';
// import { useRouter } from 'next/router';
const AuthContext = createContext()
const IsAuth = ({ children }) => {
    const [user, setUser] = useState({})
    // const router = useRouter();
    const [isLoadings, setIsLoadings] = useState(true)
    const [cart, setCart] = useState({})
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        const fetchauth = async () => {
            try {
                setIsLoadings(true)
                const response = await api.post(
                    '/api/a/isauthenticated/', {}, {
                    withCredentials: true,
                }
                );
                setIsAuthenticated(response.data.isAuthenticated)
                // setUser(response.data.user)
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoadings(false)
            }
        };

        fetchauth();
    }, [])

    const logout = async () => {
        try {
            setIsLoading(true)
            const response = await api.post(
                '/api/a/logout/',
            );
            console.log(response.data)
            setIsAuthenticated(false)
            setUser({})
            // router.reload()
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoadings, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export default IsAuth
export { AuthContext }
