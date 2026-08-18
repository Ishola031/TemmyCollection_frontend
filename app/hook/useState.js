import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';


// API
const fetchState = async () => {
    const res = await api.get('/api/o/states/')
    return await res.data;
};


// HOOK
export function useStateApi() {
    return useQuery({
        queryFn: fetchState,
        queryKey: ['State'],
    })
}