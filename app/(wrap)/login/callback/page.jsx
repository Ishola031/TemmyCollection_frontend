'use client';
import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useRouter } from 'next/navigation';

function LoginSuccess() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchuser = async () => {
            try {
                setLoading(true)
                const response = await api.post(
                    '/api/a/isauthenticated/', {}, {
                    withCredentials: true,
                });
                setError(null)
                const cart_id = localStorage.getItem('cart_id')
                if (cart_id) {
                    const merge = await api.post('http://localhost:8000/api/o/mergecart/', { "cart_id": cart_id })
                    localStorage.removeItem('cart_id');
                }
                router.push(`/`)
            } catch (error) {
                setError('Failed to login user. Please try again later...')
                router.push(`/signin`)
            } finally {
                setLoading(false)
            }
        };
        fetchuser();
    }, []);

    return (
        <div className='flex justify-center items-center w-full h-screen pt-18 px-17.5'>
            {loading ? (
                <h2 className='text-[19px] font-medium'>Completing secure login, please wait...</h2>
            ) : (
                error ? (
                    <h2 className='text-[19px] font-medium'>{error}</h2>
                ) : (
                    <h2 className='text-[19px] font-medium'>Login Successful</h2>
                )
            )}
        </div>
    );
}

export default LoginSuccess;