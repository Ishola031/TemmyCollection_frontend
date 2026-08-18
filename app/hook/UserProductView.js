import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';

// API FUNCTION
const fetchUserProductView = async () => {
    const res = await api.get()
    return await res.data
};

const addUserProductView = async ({ product }) => {
    const res = api.post(`api/p/addproductviewed/`, { params: { product } })
    return await res.data
};

// HOOKS
export function useAddProductView() {
    return useMutation({
        mutationFn: addUserProductView,
    })
}

export function useProductView(isAuthenticated) {
    return useQuery({
        queryKey: ['productView', isAuthenticated],
        queryFn: fetchUserProductView,
    })
}

