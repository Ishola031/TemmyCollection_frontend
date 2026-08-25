import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';



const fetchRecentSearch = async (isAuthenticated) => {
    if (isAuthenticated) {
        const res = await api.get(`api/p/recentsearchview/`)
        return await res.data
    }
    return []
};



export function useRecentSearch(isAuthenticated) {
    return useQuery({
        queryKey: ['recentsearch', isAuthenticated],
        queryFn: () => fetchRecentSearch(isAuthenticated),
    });
};