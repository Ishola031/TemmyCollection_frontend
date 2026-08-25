import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';


const fetchWishList = async () => {
    const res = await api.get('api/p/wishlist/')
    return res.data
}


export function useWishList() {
    return useQuery({
        queryKey: ['wishlist'],
        queryFn: fetchWishList
    });
};