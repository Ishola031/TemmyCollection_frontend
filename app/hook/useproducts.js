import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';

// API
const fetchProduct = async (filterForm) => {
    const res = await api.get(`api/p/product/filter/`, {
        params: filterForm,
        // Add this serializer configuration:
        paramsSerializer: {
            indexes: null // This removes the brackets '[]' from arrays completely
        }
    })
    return res.data;
};


// HOOK
export function useProduct(filterForm) {

    return useQuery({
        queryKey: ['product', filterForm],
        queryFn: () => fetchProduct(filterForm),
    })
}