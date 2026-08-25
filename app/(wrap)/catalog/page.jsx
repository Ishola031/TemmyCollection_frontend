'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useContext } from 'react'
import { AuthContext } from '../../Components/IsAuth';
import { useRecentSearch } from '../../hook/useRecentSearch';
import ProductSearch from '../../Components/ProductSearch';

const page = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const { data } = useRecentSearch(isAuthenticated)
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    console.log(query)
    const router = useRouter();

    return (
        <>
            <div className=''></div>
            <ProductSearch query={query} />
        </>
    )
}

export default page
