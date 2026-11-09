import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';



const fetchProductSearch = async (filter, page) => {
    console.log(filter)
    const res = await api.get(`api/p/productsearch/?page=${page}`, { params: filter,
        paramsSerializer: {
            indexes: null // This removes the brackets '[]' from arrays completely
        }
     })
    return await res.data
};

const fetchMobileProductSearch = async (filter) => {
    console.log(filter)
    const res = await api.get(`api/p/productsearch/mobile/`, { params: filter,
        paramsSerializer: {
            indexes: null // This removes the brackets '[]' from arrays completely
        }
     })
    return await res.data
};



export function useProductSearch(filter,page) {
    return useQuery({
        queryKey: ['productsearch', filter, page],
        queryFn: () => fetchProductSearch(filter, page),
    });
};


export function useMobileProductSearch(filter) {
    return useQuery({
        queryKey: ['mobileproductsearch', filter],
        queryFn: () => fetchMobileProductSearch(filter),
    });
};