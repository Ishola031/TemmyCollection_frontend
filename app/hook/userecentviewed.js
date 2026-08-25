import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';


const fetchRecentViewed = async () => {
    const res = await api.get('api/p/recentviewed/')
    return res.data
}


export function useRecentViewed() {
    return useQuery({
        queryKey: ['recentviewed'],
        queryFn: fetchRecentViewed,
    });
};