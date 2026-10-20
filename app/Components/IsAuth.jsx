'use client';

import React, { createContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import api from '../api/api';

const AuthContext = createContext();

const IsAuth = ({ children }) => {
    const pathname = usePathname();

    const [user, setUser] = useState({});
    const [isLoadings, setIsLoadings] = useState(true);
    const [cart, setCart] = useState({});
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const isAdminPage = pathname?.startsWith('/admin');

        if (isAdminPage) {
            setIsLoadings(false);
            return;
        }

        const fetchauth = async () => {
            try {
                setIsLoadings(true);

                const response = await api.post(
                    '/api/a/isauthenticated/'
                );

                setIsAuthenticated(
                    Boolean(response.data.isAuthenticated)
                );

                if (response.data.user) {
                    setUser(response.data.user);
                } else {
                    setUser({});
                }

            } catch (error) {
                console.error(
                    'Authentication check failed:',
                    error
                );

                setIsAuthenticated(false);
                setUser({});

            } finally {
                setIsLoadings(false);
            }
        };

        fetchauth();

    }, [pathname]);

    const logout = async () => {
        try {
            setIsLoadings(true);

            await api.post('/api/a/logout/');

            setIsAuthenticated(false);
            setUser({});

        } catch (error) {
            console.error('Logout error:', error);

        } finally {
            setIsLoadings(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoadings,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default IsAuth;
export { AuthContext };