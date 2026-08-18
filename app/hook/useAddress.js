import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';


// API
const fetchAddress = async () => {
    const res = await api.get('/api/o/useraddress/')
    return await res.data;
};

const AddOrEditAddress = async (formData) => {
    const res = await api.post('api/o/createuseraddress/', formData)
    return await res.data;
};


// HOOK
export function useAddress(isAuthenticated) {
    return useQuery({
        queryFn: fetchAddress,
        queryKey: ['Address', isAuthenticated],
    })
}