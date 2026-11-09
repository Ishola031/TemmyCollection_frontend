import api from '../api/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


export const productLikeApi = async ({ productSlug}) => {
    console.log('hi', productSlug)
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

export function useProductSearchLike() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productLikeApi,
        onMutate: async ({ productSlug, filterForm, page }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['productsearch', filterForm] });

            // Snapshot current cart
            const previousProduct = queryClient.getQueryData(['productsearch', filterForm, page]);

            let updatedProduct;
            if (previousProduct?.products?.results?.length > 0) {
                updatedProduct = {
                    ...previousProduct,
                    'products': {
                        ...previousProduct.products, 
                        'results': previousProduct?.products?.results?.map(product =>
                            product.slug === productSlug
                            ? { ...product, "is_Liked": !product.is_Liked }
                            : product
                        )
                    }
                }
                queryClient.setQueryData(['productsearch', filterForm, page], updatedProduct);
            }

            return { previousProduct };
        },
        onSuccess: () => {

        },
        onError: async ({ productSlug, filterForm, page }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['productsearch', filterForm, page] });

            // Snapshot current cart
            const previousProduct = queryClient.getQueryData(['productsearch', filterForm, page]);

            let updatedProduct;
            if (previousProduct?.products?.results?.length > 0) {
                updatedProduct = {
                    ...previousProduct,
                    'products': {
                        ...previousProduct.products, 
                        'results': previousProduct?.products?.results?.map(product =>
                            product.slug === productSlug
                            ? { ...product, "is_Liked": !product.is_Liked }
                            : product
                        )
                    }
                }

                queryClient.setQueryData(['productsearch', filterForm, page], updatedProduct);
            }

            return { previousProduct };
        },
    })
}


export function useCollectionProductFilterLike() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productLikeApi,

        onMutate: async ({ productSlug, collectionSlug }) => {

            // Get all queries belonging to this collection
            const queryKey = ['collectionDetail', collectionSlug];

            await queryClient.cancelQueries({ queryKey });

            // Save previous data for rollback
            const previousProducts = queryClient.getQueriesData({ queryKey });

            // Update all matching cached queries
            queryClient.setQueriesData(
                { queryKey },
                (oldData) => {
                    if (!oldData?.products?.results) return oldData;

                    return {
                        ...oldData,
                        products: {
                            ...oldData.products,
                            results: oldData.products.results.map(product =>
                                product.slug === productSlug
                                    ? {
                                        ...product,
                                        is_Liked: !product.is_Liked
                                    }
                                    : product
                            )
                        }
                    };
                }
            );

            return { previousProducts };
        },

        onError: (error, variables, context) => {

            // Restore previous data if the request fails
            context?.previousProducts?.forEach(([key, data]) => {
                queryClient.setQueryData(key, data);
            });

        }
    });
}

export function useProductFilterLike() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productLikeApi,
        onMutate: async ({ productSlug, filterForm, page }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['productFilter', filterForm, page] });

            // Snapshot current cart
            const previousProduct = queryClient.getQueryData(['productFilter', filterForm, page]);

            let updatedProduct;
            if (previousProduct?.products?.results?.length > 0) {
                updatedProduct = {
                    ...previousProduct,
                    'products': {
                        ...previousProduct.products, 
                        'results': previousProduct?.products?.results?.map(product =>
                            product.slug === productSlug
                            ? { ...product, "is_Liked": !product.is_Liked }
                            : product
                        )
                    }
                }

                queryClient.setQueryData(['productFilter', filterForm, page], updatedProduct);
            }

            return { previousProduct };
        },
        onSuccess: () => {

        },
        onError: async ({ productSlug, filterForm, page }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['productFilter', filterForm, page] });

            // Snapshot current cart
            const previousProduct = queryClient.getQueryData(['productFilter', filterForm, page]);

            let updatedProduct;
            if (previousProduct?.products?.results?.length > 0) {
                updatedProduct = {
                    ...previousProduct,
                    'products': {
                        ...previousProduct.products, 
                        'results': previousProduct?.products?.results?.map(product =>
                            product.slug === productSlug
                            ? { ...product, "is_Liked": !product.is_Liked }
                            : product
                        )
                    }
                }

                queryClient.setQueryData(['productFilter', filterForm, page], updatedProduct);
            }

            return { previousProduct };
        },
    })
}


export function useRecentViewedLike() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: productLikeApi,
        onMutate: async ({ productSlug }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['recentviewed'] });

            // Snapshot current cart
            const previousProduct = queryClient.getQueryData(['recentviewed']);
            // console.log(previousProduct)

            let updatedProduct;
            if (previousProduct?.length > 0) {
                updatedProduct = previousProduct.map(pr =>
                    pr.product.slug === productSlug
                        ? { ...pr,  product: {...pr.product, "is_Liked": !pr.product.is_Liked}}
                        : pr
                )

                // console.log(updatedProduct)
                queryClient.setQueryData(['recentviewed'], updatedProduct);
            }
            return { previousProduct };
        },
        onSuccess: () => {

        },
        onError: async ({ productSlug }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['recentviewed'] });

            // Snapshot current cart
            const previousProduct = queryClient.getQueryData(['recentviewed']);
            // console.log(previousProduct)

            let updatedProduct;
            if (previousProduct?.length > 0) {
                updatedProduct = previousProduct.map(pr =>
                    pr.product.slug === productSlug
                        ? { ...pr,  product: {...pr.product, "is_Liked": !pr.product.is_Liked}}
                        : pr
                )

                // console.log(updatedProduct)
                queryClient.setQueryData(['recentviewed'], updatedProduct);
            }
            return { previousProduct };
        },
    })
}


export function useProductWishListLike() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: productLikeApi,
        onMutate: async ({ productSlug }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['wishlist'] });

            // Snapshot current cart
            const previousProduct = queryClient.getQueryData(['wishlist']);

            let updatedProduct;
            if (previousProduct?.length > 0) {
                updatedProduct = previousProduct.filter(product =>
                    product.slug !== productSlug
                )

                queryClient.setQueryData(['wishlist'], updatedProduct);
            }
            return { previousProduct };
        },
        onSuccess: () => {

        },
        onError: async ({ productSlug }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['wishlist'] });

            // Snapshot current cart
            const previousProduct = queryClient.getQueryData(['wishlist']);

            let updatedProduct;
            if (previousProduct?.length > 0) {
                updatedProduct = previousProduct.map(product =>
                    product.slug === productSlug
                        ? { ...product, "is_Liked": !product.is_Liked }
                        : product
                )
                queryClient.setQueryData(['wishlist'], updatedProduct);
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


