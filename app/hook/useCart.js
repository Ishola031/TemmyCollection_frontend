import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';


// CartItem Function
const fetchCart = async () => {
    const cart_id = localStorage.getItem('cart_id');
    const res = await api.get('api/o/cart/', {
        params: { cart_id },
        withCredentials: true,
    });
    return res.data;
};

// Add Item Function
const addCartItem = async ({ product, variation }) => {
    const cart_id = localStorage.getItem('cart_id');
    const payload = {
        product_id: product,
        quantity: 1,
        variations: variation || null,
        ...(cart_id && { cart_id }),
    };
    const res = await api.post('api/o/cart/addcartitem/', payload);
    return res.data;
};

// Remove Item Function
const removeCartItem = async ({ cartitemId, cartID, deleteItem }) => {
    const url = deleteItem
        ? 'api/o/cart/removecartitem/?f=delete'
        : 'api/o/cart/removecartitem/';

    const res = await api.post(url, { cartitemID: cartitemId, cartID });
    return res.data;
};

// Fetch Cart
export function useCart(isAuthenticated) {
    return useQuery({
        queryKey: ['cart', isAuthenticated],
        queryFn: fetchCart,
    });
}

// Add Item Hook
export function useAddToCartItem(isAuthenticated, setMessage) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addCartItem,
        onMutate: async ({ product, variation, cartItemId }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['cart', isAuthenticated] });

            // Snapshot current cart
            const previousCart = queryClient.getQueryData(['cart', isAuthenticated]);

            if (previousCart?.cartitems) {
                const getEntityId = (val) => (typeof val === 'object' && val !== null ? val.id : val);

                const targetProductId = getEntityId(product);
                const targetVariationId = getEntityId(variation);

                // Debug log to check payload IDs vs Cart IDs
                // console.log('Target Product ID:', targetProductId, 'Target Variation ID:', targetVariationId);

                const existingItemIndex = previousCart.cartitems.findIndex((item) => {
                    const itemProductId = getEntityId(item.product);
                    const itemVariationId = getEntityId(item.variations);

                    // If cartItemId is provided, match directly on item ID
                    if (cartItemId != null && item.id === cartItemId) {
                        return true;
                    }

                    // Otherwise match Product ID + Variation ID
                    const sameProduct = targetProductId != null && itemProductId === targetProductId;
                    const sameVariation = targetVariationId === itemVariationId;

                    return sameProduct && sameVariation;
                });

                let updatedItems;
                if (existingItemIndex > -1) {
                    // ITEM EXISTS: Increment quantity
                    updatedItems = previousCart.cartitems.map((item, index) =>
                        index === existingItemIndex
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                } else {
                    // NEW ITEM: Add placeholder
                    const newItemPlaceholder = {
                        id: `temp-${Date.now()}`,
                        product: typeof product === 'object' ? product : { id: product },
                        quantity: 1,
                        variations: variation || null,
                    };
                    updatedItems = [...previousCart.cartitems, newItemPlaceholder];
                }

                queryClient.setQueryData(['cart', isAuthenticated], {
                    ...previousCart,
                    cartitems: updatedItems,
                });
            }

            return { previousCart };
        },
        onSuccess: (data) => {
            if (data?.insufficient && setMessage) {
                setMessage('No more items available');
                // console.log('hi')
            } else {
                setMessage('Item added successfully');
                // console.log('hello')
            }

            if (data?.cart_id && !Boolean(localStorage.getItem('cart_id')) && !isAuthenticated) {
                localStorage.setItem('cart_id', data.cart_id);
            }
        },
        onError: (err, variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(['cart', isAuthenticated], context.previousCart);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['cart', isAuthenticated] });
        },
    });
}
// Remove Item Hook
export function useRemoveCartItem(isAuthenticated) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeCartItem, // Function that accepts { cartitemId, cartID, deleteItem }
        onMutate: async ({ cartitemId, deleteItem }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['cart', isAuthenticated] });

            // Snapshot prior value
            const previousCart = queryClient.getQueryData(['cart', isAuthenticated]);

            // Optimistically update cache UI instantly
            if (previousCart?.cartitems) {
                queryClient.setQueryData(['cart', isAuthenticated], {
                    ...previousCart,
                    cartitems: deleteItem
                        ? previousCart.cartitems.filter((item) => item.id !== cartitemId)
                        : previousCart.cartitems.map((item) =>
                            item.id === cartitemId
                                ? { ...item, quantity: Math.max(0, item.quantity - 1) }
                                : item
                        ),
                });
            }

            return { previousCart };
        },
        onSuccess: (data) => {

        },
        onError: (err, variables, context) => {
            console.error("Failed to update cart:", err);
            if (context?.previousCart) {
                queryClient.setQueryData(['cart', isAuthenticated], context.previousCart);
            }
        },
        onSettled: () => {
            // Force refetch to make sure UI matches server truth
            queryClient.invalidateQueries({ queryKey: ['cart', isAuthenticated] });
        },
    });
}

