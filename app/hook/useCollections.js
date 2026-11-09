import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';

// API
const fetchCollection = async (page) => {
    const res = await api.get(`api/p/collection/?page=${page}`)
    return await res.data;
};

const fetchCollectionDetail = async (productSlug, filterForm, page) => {
    const res = await api.get(`api/p/collection/filter/?q=${productSlug}&page=${page}`,{
        params: filterForm,
        // Add this serializer configuration:
        paramsSerializer: {
            indexes: null // This removes the brackets '[]' from arrays completely
        }
    })
    return await res.data;
};

const fetchMobileCollectionDetail = async (productSlug, filterForm) => {
    const res = await api.get(`api/p/collection/filter/mobile/?q=${productSlug}`,{
        params: filterForm,
        // Add this serializer configuration:
        paramsSerializer: {
            indexes: null // This removes the brackets '[]' from arrays completely
        }
    })
    return await res.data;
};


// HOOK
export function useCollections(page) {
    return useQuery({
        queryKey: ['collections', page],
        queryFn: () => fetchCollection(page),
    })
}

export function useCollectionDetail(productSlug, filterForm,page) {
    return useQuery({
        queryKey: ['collectionDetail', productSlug, filterForm, page],
        queryFn: () => fetchCollectionDetail(productSlug, filterForm, page),
        placeholderData: undefined,
    })
}

export function useMobileCollectionDetail(productSlug, filterForm,) {
    return useQuery({
        queryKey: ['mobilecollectionDetail', productSlug, filterForm,],
        queryFn: () => fetchMobileCollectionDetail(productSlug, filterForm),
        placeholderData: undefined,
    })
}