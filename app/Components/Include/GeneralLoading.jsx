
"use client";

import React from "react";
import { FiLoader } from "react-icons/fi";

const GeneralLoading = ({
    type = "spinner",
    text = "Loading...",
    size = "lg",
    transparence= null
}) => {

    const sizes = {
        sm: "w-6 h-6",
        md: "w-10 h-10",
        lg: "w-14 h-14",
    };

    return (
        <div className={`fixed inset-0 z-9999 w-screen h-screen ${transparence? `bg-white/${transparence}`: 'bg-white'}  flex items-center justify-center`}>

            {type === "skeleton" ? (
                <div className="w-full h-full p-6 animate-pulse space-y-5">
                    <div className="h-10 bg-gray-200 rounded-lg w-1/3" />
                    <div className="h-5 bg-gray-200 rounded w-2/3" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="space-y-3">
                                <div className="aspect-square bg-gray-200 rounded-xl" />
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-5">
                    <FiLoader
                        className={`${sizes[size] || sizes.lg} text-blue-600 animate-spin`}
                    />

                    {text && (
                        <p className="text-sm font-medium text-gray-500">
                            {text}
                        </p>
                    )}
                </div>
            )}

        </div>
    );
};

export default GeneralLoading;
