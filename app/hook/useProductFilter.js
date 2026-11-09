import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';


// API
const productFilterAPI = async (filterForm, page) => {
    const res = await api.get(`/api/p/product/filter/?page=${page}`, {
        params: filterForm,
        // Add this serializer configuration:
        // This removes the brackets '[]' from arrays completely
        paramsSerializer: {indexes: null}
    });
    return await res.data;
};

const mobileProductFilterAPI = async (filterForm) => {
    const res = await api.get(`/api/p/product/filter/mobile/`, {
        params: filterForm,
        paramsSerializer: {indexes: null}
    });
    return await res.data;
};

// HOOK

export function useProductFilter(filterForm, page) {
    return useQuery({
        queryFn: () => productFilterAPI(filterForm, page),
        queryKey: ["productFilter", filterForm, page],
    });
}


export function useMobileProductFilter(filterForm) {
    return useQuery({
        queryFn: () => mobileProductFilterAPI(filterForm),
        queryKey: ["mobileproductFilter", filterForm],
    });
}

