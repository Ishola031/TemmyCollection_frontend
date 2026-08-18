import { useQuery } from '@tanstack/react-query';
import api from '../api/api';

// API
const fetchProductDetail = async (slug) => {
    const res = await api.get(`api/p/productdetail/?slug=${slug}`);
    return res.data; // `res.data` is already resolved data, so `await` isn't needed here
};

// HOOK
export function useProductDetail(slug) {
    return useQuery({
        queryKey: ['productDetail', slug],
        queryFn: () => fetchProductDetail(slug),
        enabled: !!slug,
    });
}