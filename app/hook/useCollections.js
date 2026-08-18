import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';

// API
const fetchCollection = async (page) => {
    const res = await api.get(`api/p/collection/?page=${page}`)
    return await res.data;
};


// HOOK
export function useCollections(page) {
    return useQuery({
        queryKey: ['collections', page],
        queryFn: () => fetchCollection(page),
    })
}