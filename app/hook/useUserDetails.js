import { useQuery } from '@tanstack/react-query';
import api from '../api/api';

// API
const fetchUserDetail = async (slug) => {
    const res = await api.get(`api/a/userdetail/`);
    return res.data;
};

// HOOK
export function useUserDetail(isAuthenticated) {
    return useQuery({
        queryKey: ['productDetail', isAuthenticated],
        queryFn: fetchUserDetail,
        enabled: isAuthenticated,
    });
}