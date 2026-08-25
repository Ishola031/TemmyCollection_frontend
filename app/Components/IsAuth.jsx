'use client';
import React, { createContext, useEffect, useState } from 'react';
import api from '../api/api';

const AuthContext = createContext();

const IsAuth = ({ children }) => {
    const [user, setUser] = useState({});
    const [isLoadings, setIsLoadings] = useState(true);
    const [cart, setCart] = useState({});
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const fetchauth = async () => {
            try {
                setIsLoadings(true);
                // Using GET or POST with withCredentials: true enabled in api.js
                const response = await api.post('/api/a/isauthenticated/');

                setIsAuthenticated(Boolean(response.data.isAuthenticated));
                if (response.data.user) {
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error('Authentication check failed:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoadings(false);
            }
        };

        fetchauth();
    }, []);

    const logout = async () => {
        try {
            setIsLoadings(true); // Fixed state variable name
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
        <AuthContext.Provider value={{ user, isAuthenticated, isLoadings, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default IsAuth;
export { AuthContext };