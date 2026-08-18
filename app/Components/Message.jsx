'use client'
import React, { useEffect } from 'react'

const Message = ({ message, setError }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setError(null);
            }, 3000); // disappears after 3 seconds

            return () => clearTimeout(timer);
        }
    }, [message]);
    return (
        <div className="w-full h-auto flex justify-center items-center text-[#333] z-300">
            {message && (
                <div className="fixed top-20 max-[740px]:top-35 w-auto bg-[#333] text-white py-2 px-3 rounded-xl message-card">
                    {message}
                </div>
            )}
        </div>
    )
}

export default Message
