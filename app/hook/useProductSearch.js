import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';



const fetchProductSearch = async (filter) => {
    console.log(filter)
    const res = await api.get(`api/p/productsearch/`, { params: filter,
        paramsSerializer: {
            indexes: null // This removes the brackets '[]' from arrays completely
        }
     })
    return await res.data
};



export function useProductSearch(filter) {
    return useQuery({
        queryKey: ['productsearch', filter],
        queryFn: () => fetchProductSearch(filter),
    });
};