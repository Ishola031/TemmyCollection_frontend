import api from '../api/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


export const productLikeApi = async ({ productSlug }) => {
    const res = await api.post('api/p/productlike/', {
        params: { productSlug },
    })
    return res.data
};

export function useProductLike() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: productLikeApi,
        onMutate: async ({ productSlug }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['product'] });

            // Snapshot current cart
            const previousProduct = queryClient.getQueryData(['product']);
            // console.log(previousProduct)

            let updatedProduct;
            if (previousProduct?.length > 0) {
                updatedProduct = previousProduct.map(product =>
                    product.slug === productSlug
                        ? { ...product, "is_Liked": !product.is_Liked }
                        : product
                )

                // console.log(updatedProduct)
                queryClient.setQueryData(['product'], updatedProduct);
            }

            return { previousProduct };
        },
        onSuccess: () => {

        },
        onError: async ({ productSlug }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['product'] });

            // Snapshot current cart
            const previousProduct = queryClient.getQueryData(['product']);
            // console.log(previousProduct)

            let updatedProduct;
            if (previousProduct?.length > 0) {
                updatedProduct = previousProduct.map(product =>
                    product.slug === productSlug
                        ? { ...product, "is_Liked": !product.is_Liked }
                        : product
                )

                // console.log(updatedProduct)
                queryClient.setQueryData(['product'], updatedProduct);
            }

            return { previousProduct };
        },
    })
}

export function useProductDetailLike() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productLikeApi,
        onMutate: async ({ productSlug }) => {
            const queryKey = ['productDetail', productSlug];

            // 1. Cancel outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey });

            // 2. Snapshot current data for rollback
            const previousProduct = queryClient.getQueryData(queryKey);

            // 3. Optimistically update state using setQueryData
            if (previousProduct?.product) {
                queryClient.setQueryData(queryKey, (oldData) => ({
                    ...oldData,
                    product: {
                        ...oldData.product,
                        is_Liked: !oldData.product.is_Liked,
                    },
                }));
            }

            return { previousProduct, queryKey };
        },
        onError: (err, variables, context) => {
            // Rollback cache if mutation fails
            if (context?.previousProduct) {
                queryClient.setQueryData(context.queryKey, context.previousProduct);
            }
        },
        onSettled: (data, error, variables) => {
            // Sync cache with backend data
            queryClient.invalidateQueries({
                queryKey: ['productDetail', variables.productSlug],
            });
        },
    });
}


