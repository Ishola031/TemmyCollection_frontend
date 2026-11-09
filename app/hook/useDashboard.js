import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';


const fetchDashboard = async () => {
    const res = await api.get('api/p/dashboard/')
    return res.data
}


export function useDashboard() {
    return useQuery({
        queryKey: ['dashboard'],
        queryFn: fetchDashboard,
    });
};