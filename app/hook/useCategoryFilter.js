import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';



// API
const categoryFilterAPI = async (category) => {
    if (category !== null) {
        const res = await api.get(`/api/p/categoryfilter/?slug=${category}`)
        return await res.data
    } else {
        const res = await api.get(`/api/p/categoryfilter/`)
        return await res.data
    }
};

// HOOK
export function useCategoryFilter(category) {
    return useQuery({
        queryFn: () => categoryFilterAPI(category),
        queryKey: ["categoryFilter", category]
    })
}