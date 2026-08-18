import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';


// API
const fetchCategory = async () => {
    const res = await api.get('/api/p/category/')
    return await res.data;
};


// HOOK
export function useCategory() {
    return useQuery({
        queryFn: fetchCategory,
        queryKey: ['category'],
    })
}