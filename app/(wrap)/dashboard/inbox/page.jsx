'use client';

import React, { useEffect, useState } from 'react';
import Dashboard from '../../../Components/Dashboard';
import { useNotifications } from '../../../hook/notifications';
import api from '../../../api/api';

const InboxPage = () => {
    const [initialNotifications, setInitialNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const initializeInbox = async () => {
            try {
                // Check authentication
                await api.post(
                    'http://localhost:8000/api/a/isauthenticated/'
                );

                setIsAuthenticated(true);

                // Fetch existing notifications
                const response = await api.get(
                    'http://localhost:8000/api/a/notifications/'
                );

                const data = response.data;

                setInitialNotifications(
                    Array.isArray(data)
                        ? data
                        : data.results || []
                );

            } catch (error) {
                console.error(
                    'Failed to initialize inbox:',
                    error
                );

                setIsAuthenticated(false);

            } finally {
                setLoading(false);
            }
        };

        initializeInbox();
    }, []);

    // WebSocket + notification state
    const { notifications } = useNotifications(isAuthenticated, initialNotifications);

    return (
        <section className="w-full h-screen pt-22 px-10 lg:px-15 min-px-3 pb-5 max-[740px]:px-5 max-[740px]:pt-30">

            <div className="flex gap-5">

                <Dashboard
                    custom="inbox"
                    display="hidden"
                />

                <div className="w-[70%] max-[850px]:w-full">

                    <div className="w-full h-auto rounded-md border-2 border-[#eee] px-4 py-3">

                        <h4 className="text-[20px] pb-2 font-semibold">
                            Messages
                        </h4>

                        <div className="w-full h-full">

                            {loading ? (

                                <div className="py-4 text-[#888]">
                                    Loading messages...
                                </div>

                            ) : notifications.length === 0 ? (

                                <div className="py-4 text-[#888]">
                                    No messages found.
                                </div>

                            ) : (

                                notifications.map((item) => (

                                    <div
                                        key={item.id}
                                        className="w-full h-full flex border-b border-[#eee] py-2 cursor-pointer hover:bg-[#eee]"
                                    >

                                        <p className="w-[80%] px-2 text-[16px] line-clamp-1 overflow-hidden text-ellipsis font-medium">
                                            {item.message || item.title}
                                        </p>

                                    </div>

                                ))

                            )}

                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default InboxPage;