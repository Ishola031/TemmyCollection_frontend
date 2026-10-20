"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    FiArrowLeft,
    FiCheck,
    FiChevronRight,
    FiImage,
    FiMonitor,
    FiPackage,
    FiPlus,
    FiSave,
    FiSearch,
    FiSmartphone,
    FiTrash2,
    FiUpload,
    FiX,
} from "react-icons/fi";
import  adminApi  from "../../../../../api/adminApi";

/* =========================================================
   PRODUCT PREVIEW
========================================================= */

function ProductPreview({
    productName,
    description,
    price,
    discount,
    images,
    selectedCategory,
    brandName,
    previewMode,
    previewImage,
    setPreviewImage,
}) {
    const imageList = images || [];

    const currentImage =
        imageList.length > 0
            ? imageList[
                  Math.min(
                      previewImage,
                      imageList.length - 1
                  )
              ]?.url
            : null;

    const finalPrice =
        price && discount
            ? Number(price) -
              (Number(price) * Number(discount)) / 100
            : Number(price || 0);

    const formatPrice = (value) => {
        if (!value) return "₦0";

        return `₦${Number(value).toLocaleString("en-NG")}`;
    };

    const isMobile = previewMode === "mobile";

    return (
        <div className="flex h-full flex-col">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                    Product Preview
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                    See how your product will appear in the store.
                </p>
            </div>

            <div className="flex flex-1 items-center justify-center overflow-auto rounded-2xl bg-gray-100 p-6">
                <div
                    className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl transition-all ${
                        isMobile
                            ? "w-[375px] max-w-full"
                            : "w-full max-w-[900px]"
                    }`}
                >
                    <div className="flex h-14 items-center justify-between border-b px-5">
                        <div className="text-sm font-bold text-gray-900">
                            Temmy Collection
                        </div>

                        <div className="flex gap-4 text-xs text-gray-500">
                            <span>Shop</span>
                            <span>Categories</span>
                            <span>Cart</span>
                        </div>
                    </div>

                    <div
                        className={`grid gap-8 p-6 ${
                            isMobile
                                ? "grid-cols-1"
                                : "grid-cols-2"
                        }`}
                    >
                        <div>
                            <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                                {currentImage ? (
                                    <img
                                        src={currentImage}
                                        alt={
                                            productName ||
                                            "Product"
                                        }
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-400">
                                        <FiImage size={42} />
                                    </div>
                                )}
                            </div>

                            {imageList.length > 1 && (
                                <div className="mt-3 flex gap-2 overflow-x-auto">
                                    {imageList.map(
                                        (image, index) => (
                                            <button
                                                key={image.id}
                                                type="button"
                                                onClick={() =>
                                                    setPreviewImage(
                                                        index
                                                    )
                                                }
                                                className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                                                    previewImage ===
                                                    index
                                                        ? "border-black"
                                                        : "border-transparent"
                                                }`}
                                            >
                                                <img
                                                    src={
                                                        image.url
                                                    }
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                                {selectedCategory?.name ||
                                    "Category"}
                            </p>

                            <h2 className="text-2xl font-bold text-gray-900">
                                {productName ||
                                    "Product name"}
                            </h2>

                            {brandName && (
                                <p className="mt-2 text-sm text-gray-500">
                                    {brandName}
                                </p>
                            )}

                            <div className="mt-5 flex items-center gap-3">
                                <span className="text-2xl font-bold text-gray-900">
                                    {formatPrice(
                                        finalPrice
                                    )}
                                </span>

                                {discount > 0 && (
                                    <span className="text-sm text-gray-400 line-through">
                                        {formatPrice(
                                            price
                                        )}
                                    </span>
                                )}
                            </div>

                            {discount > 0 && (
                                <span className="mt-2 inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                                    {discount}% OFF
                                </span>
                            )}

                            <p className="mt-6 text-sm leading-6 text-gray-600">
                                {description ||
                                    "Your product description will appear here."}
                            </p>

                            <button
                                type="button"
                                className="mt-7 w-full rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   HELPERS
========================================================= */

function getImageUrl(image) {
    if (!image) return "";

    if (typeof image === "string") {
        return image;
    }

    return (
        image.url ||
        image.image ||
        image.image_url ||
        image.secure_url ||
        ""
    );
}

function getRelationId(value) {
    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value === "object") {
        return value.id ?? "";
    }

    return value;
}

function findCategoryById(categories, id) {
    if (!id) return null;

    for (const category of categories) {
        if (String(category.id) === String(id)) {
            return category;
        }

        if (category.children?.length) {
            const found = findCategoryById(
                category.children,
                id
            );

            if (found) {
                return found;
            }
        }
    }

    return null;
}

function flattenCategories(
    categories,
    parentPath = []
) {
    let result = [];

    categories.forEach((category) => {
        const currentPath = [
            ...parentPath,
            category.name,
        ];

        result.push({
            ...category,
            path: currentPath,
        });

        if (category.children?.length) {
            result = [
                ...result,
                ...flattenCategories(
                    category.children,
                    currentPath
                ),
            ];
        }
    });

    return result;
}

/* =========================================================
   EDIT PRODUCT PAGE
========================================================= */

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();

    const productId = params?.productid;
    console.log(productId)

    /* =========================================================
       PRODUCT
    ========================================================= */

    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [discount, setDiscount] = useState("");
    const [stock, setStock] = useState("");
    const [brand, setBrand] = useState("");
    const [isVisible, setIsVisible] = useState(true);
    const [productCategoryId, setProductCategoryId] = useState("");

    /* =========================================================
       OPTIONS
    ========================================================= */

    const [brands, setBrands] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);

    const [optionsLoading, setOptionsLoading] =
        useState(false);
    const [optionsError, setOptionsError] =
        useState("");

    /* =========================================================
       CATEGORIES
    ========================================================= */

    const [categories, setCategories] = useState([]);
    const [categoryLoading, setCategoryLoading] =
        useState(false);
    const [categoryError, setCategoryError] =
        useState("");

    const [categoryOpen, setCategoryOpen] =
        useState(false);
    const [categorySearch, setCategorySearch] =
        useState("");
    const [selectedCategory, setSelectedCategory] =
        useState(null);

    /* =========================================================
       IMAGES
    ========================================================= */

    const [images, setImages] = useState([]);

    const [removedImageIds, setRemovedImageIds] =
        useState([]);

    const [mainImageFile, setMainImageFile] =
        useState(null);

    const [mainImagePreview, setMainImagePreview] =
        useState("");

    /* =========================================================
       VARIATIONS
    ========================================================= */

    const [variations, setVariations] = useState([]);

    /* =========================================================
       PAGE STATE
    ========================================================= */

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [submitting, setSubmitting] =
        useState(false);

    const [submitError, setSubmitError] =
        useState("");

    const [submitSuccess, setSubmitSuccess] =
        useState("");

    /* =========================================================
       PREVIEW
    ========================================================= */

    const [previewOpen, setPreviewOpen] =
        useState(false);

    const [previewMode, setPreviewMode] =
        useState("desktop");

    const [previewImage, setPreviewImage] =
        useState(0);

    /* =========================================================
       LOAD CATEGORIES
    ========================================================= */

    useEffect(() => {
        let mounted = true;

        const loadCategories = async () => {
            setCategoryLoading(true);
            setCategoryError("");

            try {
                const response =
                    await adminApi.get(
                        "products/categories/"
                    );

                if (!mounted) return;

                setCategories(
                    response.data?.results ||
                        response.data ||
                        []
                );
            } catch (error) {
                console.error(
                    "Failed to load categories:",
                    error
                );

                if (mounted) {
                    setCategoryError(
                        "Unable to load product categories."
                    );
                }
            } finally {
                if (mounted) {
                    setCategoryLoading(false);
                }
            }
        };

        loadCategories();

        return () => {
            mounted = false;
        };
    }, []);

    /* =========================================================
       LOAD OPTIONS
    ========================================================= */

    useEffect(() => {
        let mounted = true;

        const loadOptions = async () => {
            setOptionsLoading(true);
            setOptionsError("");

            try {
                const response =
                    await adminApi.get(
                        "products/options/"
                    );

                const data = response.data || {};

                if (!mounted) return;

                setBrands(data.brands || []);
                setColors(data.colors || []);
                setSizes(data.sizes || []);
            } catch (error) {
                console.error(
                    "Failed to load product options:",
                    error
                );

                if (mounted) {
                    setOptionsError(
                        "Unable to load product options."
                    );
                }
            } finally {
                if (mounted) {
                    setOptionsLoading(false);
                }
            }
        };

        loadOptions();

        return () => {
            mounted = false;
        };
    }, []);

    /* =========================================================
       LOAD PRODUCT
    ========================================================= */

    useEffect(() => {
        if (!productId) {
            setLoadError("Product ID is missing.");
            setLoading(false);
            return;
        }

        const loadProduct = async () => {
            try {
                setLoading(true);
                setLoadError("");

                console.log("Loading product:", productId);

                const response = await adminApi.get(
                    `products/${productId}/`
                );

                console.log("Product response:", response.data);

                const product = response.data;

                setProductName(product.name || "");
                setDescription(product.description || "");
                setPrice(product.price ?? "");
                setDiscount(product.discount ?? "");
                setStock(product.stock ?? 0);
                setIsVisible(product.is_available ?? true);

                // Brand
                if (product.brand) {
                    setBrand(String(product.brand.id));
                } else {
                    setBrand("");
                }

                // Category
                if (product.category) {
                    setProductCategoryId(
                        String(product.category.id)
                    );
                } else {
                    setProductCategoryId("");
                }

                // Main image
                const loadedImages = [];

                if (product.image) {
                    loadedImages.push({
                        id: `main-${product.id}`,
                        existing: true,
                        isMain: true,
                        imageId: null,
                        name: "Main image",
                        url: product.image,
                        file: null,
                    });
                }

                // Gallery images
                if (Array.isArray(product.images)) {
                    product.images.forEach((image) => {
                        if (!image?.image) return;

                        loadedImages.push({
                            id: `existing-${image.id}`,
                            existing: true,
                            isMain: false,
                            imageId: image.id,
                            name: "Gallery image",
                            url: image.image,
                            file: null,
                        });
                    });
                }

                setImages(loadedImages);

                // Variations
                if (Array.isArray(product.variations)) {
                    setVariations(
                        product.variations.map((variation) => ({
                            id: variation.id,
                            existing: true,
                            color: variation.color
                                ? String(
                                    variation.color.id ??
                                    variation.color
                                )
                                : "",
                            size: variation.size
                                ? String(
                                    variation.size.id ??
                                    variation.size
                                )
                                : "",
                            price: variation.price ?? "",
                            stock: variation.stock ?? 0,
                        }))
                    );
                } else {
                    setVariations([]);
                }

                setLoading(false);
            } catch (error) {
                console.error(
                    "PRODUCT LOAD ERROR:",
                    error
                );

                console.error(
                    "STATUS:",
                    error?.response?.status
                );

                console.error(
                    "DATA:",
                    error?.response?.data
                );

                setLoadError(
                    error?.response?.data?.error ||
                    error?.response?.data?.detail ||
                    "Unable to load product."
                );

                setLoading(false);
            }
        };

        loadProduct();
    }, [productId]);

    /* =========================================================
       SET CATEGORY AFTER CATEGORIES LOAD
    ========================================================= */

    useEffect(() => {
        if (
            !categories.length ||
            !productId ||
            selectedCategory
        ) {
            return;
        }

        let mounted = true;

        const loadProductCategory = async () => {
            try {
                const response =
                    await adminApi.get(
                        `products/${productId}/`
                    );

                if (!mounted) return;

                const categoryId =
                    getRelationId(
                        response.data?.category
                    );

                const found =
                    findCategoryById(
                        categories,
                        categoryId
                    );

                if (found) {
                    setSelectedCategory(found);
                }
            } catch (error) {
                console.error(
                    "Unable to determine product category:",
                    error
                );
            }
        };

        loadProductCategory();

        return () => {
            mounted = false;
        };
    }, [
        categories,
        productId,
        selectedCategory,
    ]);

    /* =========================================================
       CATEGORY HELPERS
    ========================================================= */

    const flattenedCategories = useMemo(() => {
        return flattenCategories(categories);
    }, [categories]);

    const filteredCategories = useMemo(() => {
        const search =
            categorySearch.trim().toLowerCase();

        if (!search) {
            return flattenedCategories;
        }

        return flattenedCategories.filter(
            (category) =>
                `${category.name} ${category.path.join(
                    " "
                )}`
                    .toLowerCase()
                    .includes(search)
        );
    }, [
        flattenedCategories,
        categorySearch,
    ]);

    const openCategoryPicker = () => {
        setCategorySearch("");
        setCategoryOpen(true);
    };

    const selectCategory = (category) => {
        setSelectedCategory(category);
        setCategoryOpen(false);
        setCategorySearch("");
    };

    /* =========================================================
       MAIN IMAGE
    ========================================================= */

    const handleMainImage = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (mainImagePreview) {
            URL.revokeObjectURL(
                mainImagePreview
            );
        }

        const preview =
            URL.createObjectURL(file);

        setMainImageFile(file);
        setMainImagePreview(preview);

        event.target.value = "";
    };

    const removeMainImageReplacement = () => {
        if (mainImagePreview) {
            URL.revokeObjectURL(
                mainImagePreview
            );
        }

        setMainImageFile(null);
        setMainImagePreview("");
    };

    /* =========================================================
       GALLERY IMAGES
    ========================================================= */

    const handleImages = (event) => {
        const files = Array.from(
            event.target.files || []
        );

        if (!files.length) return;

        const newImages = files.map((file) => ({
            id:
                typeof crypto !== "undefined" &&
                crypto.randomUUID
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random()}`,
            existing: false,
            isMain: false,
            imageId: null,
            file,
            name: file.name,
            url: URL.createObjectURL(file),
        }));

        setImages((prev) => [
            ...prev,
            ...newImages,
        ]);

        event.target.value = "";
    };

    const removeImage = (id) => {
        setImages((prev) => {
            const image = prev.find(
                (item) => item.id === id
            );

            if (!image) return prev;

            /*
             * The main Product.image cannot be
             * deleted directly. It can be replaced
             * using the Replace Main Image control.
             */
            if (image.isMain) {
                return prev;
            }

            if (
                !image.existing &&
                image.url
            ) {
                URL.revokeObjectURL(
                    image.url
                );
            }

            if (
                image.existing &&
                image.imageId
            ) {
                setRemovedImageIds(
                    (current) => {
                        if (
                            current.includes(
                                image.imageId
                            )
                        ) {
                            return current;
                        }

                        return [
                            ...current,
                            image.imageId,
                        ];
                    }
                );
            }

            return prev.filter(
                (item) => item.id !== id
            );
        });

        setPreviewImage(0);
    };

    /* =========================================================
       VARIATIONS
    ========================================================= */

    const addVariation = () => {
        setVariations((current) => [
            ...current,
            {
                id: `new-${Date.now()}`,
                existing: false,
                color: "",
                size: "",
                stock: 0,
                price: "",
            },
        ]);
    };

    const updateVariation = (id, field, value) => {
        setVariations((current) =>
            current.map((variation) =>
                variation.id === id
                    ? {
                        ...variation,
                        [field]: value,
                    }
                    : variation
            )
        );
    };

    const removeVariation = (id) => {
        setVariations((prev) =>
            prev.filter(
                (variation) =>
                    variation.id !== id
            )
        );
    };

    /* =========================================================
       BRAND NAME
    ========================================================= */

    const brandName = useMemo(() => {
        const found = brands.find(
            (item) =>
                String(item.id) ===
                String(brand)
        );

        return found?.name || "";
    }, [brands, brand]);

    /* =========================================================
       PREVIEW IMAGES
    ========================================================= */

    const previewImages = useMemo(() => {
        const result = [];

        const mainImage = images.find(
            (image) => image.isMain
        );

        if (mainImage) {
            result.push(
                mainImageFile && mainImagePreview
                    ? {
                          ...mainImage,
                          url: mainImagePreview,
                      }
                    : mainImage
            );
        }

        images
            .filter((image) => !image.isMain)
            .forEach((image) =>
                result.push(image)
            );

        return result;
    }, [
        images,
        mainImageFile,
        mainImagePreview,
    ]);

    /* =========================================================
       VALIDATION
    ========================================================= */

    const validateForm = () => {
        if (!productName.trim()) {
            return "Product name is required.";
        }

        if (!description.trim()) {
            return "Product description is required.";
        }

        if (
            price === "" ||
            Number.isNaN(Number(price)) ||
            Number(price) < 0
        ) {
            return "Enter a valid product price.";
        }

        if (
            discount !== "" &&
            (Number.isNaN(Number(discount)) ||
                Number(discount) < 0 ||
                Number(discount) > 100)
        ) {
            return "Discount must be between 0 and 100.";
        }

        if (
            stock === "" ||
            Number.isNaN(Number(stock)) ||
            Number(stock) < 0
        ) {
            return "Enter a valid product stock.";
        }

        if (!selectedCategory) {
            return "Please select a category.";
        }

        if (!brand) {
            return "Please select a brand.";
        }

        const mainImageExists =
            images.some(
                (image) => image.isMain
            ) || mainImageFile;

        if (!mainImageExists) {
            return "Product must have a main image.";
        }

        for (const variation of variations) {
            if (
                !variation.color &&
                !variation.size
            ) {
                return "Every variation must have a color or size.";
            }

            if (
                variation.stock === "" ||
                Number(variation.stock) < 0
            ) {
                return "Every variation must have valid stock.";
            }

            if (
                variation.price !== "" &&
                Number(variation.price) < 0
            ) {
                return "Variation prices cannot be negative.";
            }
        }

        return null;
    };

    /* =========================================================
       SUBMIT
    ========================================================= */

    const handleSubmit = async () => {
        setSubmitError("");
        setSubmitSuccess("");

        const validationError =
            validateForm();

        if (validationError) {
            setSubmitError(
                validationError
            );
            return;
        }

        if (!productId) {
            setSubmitError(
                "Product ID is missing."
            );
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();

            /* -----------------------------
               Product fields
            ----------------------------- */

            formData.append(
                "name",
                productName.trim()
            );

            formData.append(
                "description",
                description.trim()
            );

            formData.append(
                "price",
                String(price)
            );

            formData.append(
                "discount",
                String(discount || 0)
            );

            formData.append(
                "stock",
                String(stock || 0)
            );

            formData.append(
                "is_available",
                isVisible
                    ? "true"
                    : "false"
            );

            formData.append(
                "brand",
                String(brand)
            );

            formData.append(
                "category",
                String(selectedCategory.id)
            );

            /* -----------------------------
               Main image replacement
            ----------------------------- */

            if (mainImageFile) {
                formData.append(
                    "image",
                    mainImageFile
                );
            }

            /* -----------------------------
               New gallery images
            ----------------------------- */

            const newGalleryImages =
                images.filter(
                    (image) =>
                        !image.existing &&
                        !image.isMain &&
                        image.file
                );

            newGalleryImages.forEach(
                (image) => {
                    formData.append(
                        "gallery",
                        image.file
                    );
                }
            );

            /* -----------------------------
               Removed gallery images
            ----------------------------- */

            removedImageIds.forEach(
                (imageId) => {
                    formData.append(
                        "removed_images",
                        String(imageId)
                    );
                }
            );

            /* -----------------------------
               Variations
            ----------------------------- */

            
            const variationData = variations.map((variation) => {
                const data = {
                    color: variation.color
                        ? Number(variation.color)
                        : null,

                    size: variation.size
                        ? Number(variation.size)
                        : null,

                    stock: Number(variation.stock || 0),

                    price:
                        variation.price === "" ||
                        variation.price === null ||
                        variation.price === undefined
                            ? null
                            : Number(variation.price),
                };

                // Only send id for existing variations
                if (
                    variation.existing &&
                    variation.id !== null &&
                    variation.id !== undefined
                ) {
                    data.id = Number(variation.id);
                }

                return data;
            });

            console.log(
                "VARIATIONS BEING SENT:",
                variationData
            );

            console.log(
                "VARIATIONS JSON:",
                JSON.stringify(variationData)
            );

            formData.append(
                "variations",
                JSON.stringify(variationData)
            );

            

            /* -----------------------------
               PATCH
            ----------------------------- */

            const response =
                await adminApi.patch(
                    `products/${productId}/`,
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );

            const updatedProduct =
                response.data?.product;

            setSubmitSuccess(
                "Product updated successfully."
            );

            /*
             * If the name changed, the backend
             * may have generated a new slug.
             */
            const newSlug =
                updatedProduct?.slug;

            setTimeout(() => {
                if (newSlug) {
                    router.push(
                        `/admin/dashboard/inventory/${newSlug}`
                    );
                } else {
                    router.push(
                        "/admin/dashboard/inventory"
                    );
                }
            }, 800);
        } catch (error) {
            console.error(
                "Failed to update product:",
                error
            );

            const data =
                error?.response?.data;

            let message =
                "Unable to update product.";

            if (
                data?.detail
            ) {
                message = data.detail;
            } else if (
                data?.error
            ) {
                message = data.error;
            } else if (
                typeof data === "object" &&
                data !== null
            ) {
                const firstError =
                    Object.values(data)
                        .flat()
                        .find(
                            (item) =>
                                typeof item ===
                                "string"
                        );

                if (firstError) {
                    message =
                        firstError;
                }
            }

            setSubmitError(message);
        } finally {
            setSubmitting(false);
        }
    };

    /* =========================================================
       CLEANUP
    ========================================================= */

    useEffect(() => {
        return () => {
            images.forEach((image) => {
                if (
                    !image.existing &&
                    image.url
                ) {
                    URL.revokeObjectURL(
                        image.url
                    );
                }
            });

            if (mainImagePreview) {
                URL.revokeObjectURL(
                    mainImagePreview
                );
            }
        };
    }, []);




    // 


    useEffect(() => {
        if (!productCategoryId || !categories.length) {
            return;
        }

        const findCategory = (items) => {
            for (const category of items) {
                if (String(category.id) === String(productCategoryId)) {
                    return category;
                }

                if (category.children?.length) {
                    const found = findCategory(category.children);

                    if (found) {
                        return found;
                    }
                }
            }

            return null;
        };

        const category = findCategory(categories);

        if (category) {
            setSelectedCategory(category);
        }
    }, [productCategoryId, categories]);

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />

                    <p className="mt-4 text-sm text-gray-500">
                        Loading product...
                    </p>
                </div>
            </div>
        );
    }

    /* =========================================================
       ERROR
    ========================================================= */

    if (loadError) {
        return (
            <div className="p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm font-medium text-red-700">
                        {loadError}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            router.back()
                        }
                        className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="min-h-screen bg-gray-50">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="sticky top-0 z-30 border-b bg-white">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/dashboard/inventory"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                            <FiArrowLeft
                                size={18}
                            />
                        </Link>

                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                Edit Product
                            </h1>

                            <p className="text-sm text-gray-500">
                                Update your product
                                information.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setPreviewOpen(
                                    true
                                )
                            }
                            className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex"
                        >
                            <FiMonitor
                                size={16}
                            />
                            Preview
                        </button>

                        <button
                            type="button"
                            disabled={
                                submitting
                            }
                            onClick={
                                handleSubmit
                            }
                            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <FiSave
                                size={16}
                            />

                            {submitting
                                ? "Saving..."
                                : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>

            {/* =================================================
                CONTENT
            ================================================= */}

            <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    {/* =================================================
                        MAIN COLUMN
                    ================================================= */}

                    <div className="space-y-6">
                        {/* BASIC INFORMATION */}

                        <section className="rounded-xl border border-gray-200 bg-white p-6">
                            <div className="mb-6">
                                <h2 className="text-base font-semibold text-gray-900">
                                    Basic Information
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Update the basic
                                    details of your
                                    product.
                                </p>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Product Name
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            productName
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setProductName(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter product name"
                                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Description
                                    </label>

                                    <textarea
                                        rows={5}
                                        value={
                                            description
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setDescription(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Describe your product..."
                                        className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* PRICING */}

                        <section className="rounded-xl border border-gray-200 bg-white p-6">
                            <div className="mb-6">
                                <h2 className="text-base font-semibold text-gray-900">
                                    Pricing & Inventory
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Update pricing,
                                    discounts and
                                    stock.
                                </p>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Price
                                    </label>

                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                            ₦
                                        </span>

                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                price
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setPrice(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-200 py-3 pl-8 pr-3 text-sm outline-none focus:border-black"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Discount
                                    </label>

                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={
                                                discount
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setDiscount(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-200 px-4 py-3 pr-10 text-sm outline-none focus:border-black"
                                        />

                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                            %
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Stock
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={stock}
                                        onChange={(
                                            event
                                        ) =>
                                            setStock(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* IMAGES */}

                        <section className="rounded-xl border border-gray-200 bg-white p-6">
                            <div className="mb-6">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Product Images
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Manage your main
                                        product image
                                        and gallery
                                        images.
                                    </p>
                                </div>
                            </div>

                            {/* MAIN IMAGE */}

                            <div className="mb-6 rounded-xl border border-gray-200 p-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Main Image
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-500">
                                            This image is
                                            stored in the
                                            product's main
                                            image field.
                                        </p>
                                    </div>

                                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        <FiUpload
                                            size={15}
                                        />
                                        Replace

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={
                                                handleMainImage
                                            }
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {images.find(
                                    (image) =>
                                        image.isMain
                                ) ? (
                                    <div className="relative max-w-[260px] overflow-hidden rounded-xl border border-gray-200">
                                        <div className="aspect-square">
                                            <img
                                                src={
                                                    mainImagePreview ||
                                                    images.find(
                                                        (
                                                            image
                                                        ) =>
                                                            image.isMain
                                                    )?.url
                                                }
                                                alt="Main product"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div className="absolute left-2 top-2 rounded-full bg-black px-2 py-1 text-[10px] font-semibold text-white">
                                            Main Image
                                        </div>

                                        {mainImageFile && (
                                            <div className="absolute bottom-2 left-2 rounded-full bg-white px-2 py-1 text-[10px] font-medium text-gray-700 shadow">
                                                New image
                                            </div>
                                        )}

                                        {mainImageFile && (
                                            <button
                                                type="button"
                                                onClick={
                                                    removeMainImageReplacement
                                                }
                                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow hover:bg-red-50"
                                            >
                                                <FiX
                                                    size={
                                                        15
                                                    }
                                                />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex min-h-[220px] items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                                        <label className="flex cursor-pointer flex-col items-center">
                                            <FiImage
                                                size={
                                                    36
                                                }
                                                className="text-gray-400"
                                            />

                                            <p className="mt-3 text-sm font-medium text-gray-700">
                                                Add main
                                                image
                                            </p>

                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={
                                                    handleMainImage
                                                }
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* GALLERY */}

                            <div>
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Gallery Images
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Additional
                                            product
                                            images.
                                        </p>
                                    </div>

                                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        <FiUpload
                                            size={16}
                                        />
                                        Add Images

                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={
                                                handleImages
                                            }
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {images.filter(
                                    (image) =>
                                        !image.isMain
                                ).length === 0 ? (
                                    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                                        <FiImage
                                            size={34}
                                            className="text-gray-400"
                                        />

                                        <p className="mt-3 text-sm font-medium text-gray-700">
                                            No gallery
                                            images
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Add additional
                                            images for
                                            your product.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                        {images
                                            .filter(
                                                (
                                                    image
                                                ) =>
                                                    !image.isMain
                                            )
                                            .map(
                                                (
                                                    image
                                                ) => (
                                                    <div
                                                        key={
                                                            image.id
                                                        }
                                                        className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                                                    >
                                                        <div className="aspect-square">
                                                            <img
                                                                src={
                                                                    image.url
                                                                }
                                                                alt={
                                                                    image.name
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>

                                                        {image.existing && (
                                                            <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-gray-600">
                                                                Existing
                                                            </div>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeImage(
                                                                    image.id
                                                                )
                                                            }
                                                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 opacity-0 shadow-sm transition group-hover:opacity-100 hover:bg-red-50"
                                                        >
                                                            <FiTrash2
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* VARIATIONS */}

                        <section className="rounded-xl border border-gray-200 bg-white p-6">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Product Variations
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Manage colors,
                                        sizes, prices
                                        and stock.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        addVariation
                                    }
                                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    <FiPlus
                                        size={16}
                                    />
                                    Add Variation
                                </button>
                            </div>

                            {variations.length ===
                            0 ? (
                                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                                    <FiPackage
                                        size={30}
                                        className="mx-auto text-gray-400"
                                    />

                                    <p className="mt-3 text-sm font-medium text-gray-700">
                                        No variations
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Add color or
                                        size
                                        variations if
                                        your product
                                        needs them.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {variations.map(
                                        (
                                            variation,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    variation.id
                                                }
                                                className="rounded-xl border border-gray-200 p-4"
                                            >
                                                <div className="mb-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                                                            {index +
                                                                1}
                                                        </span>

                                                        {variation.existing && (
                                                            <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500">
                                                                Existing
                                                            </span>
                                                        )}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeVariation(
                                                                variation.id
                                                            )
                                                        }
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <FiTrash2
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-4">
                                                    <div>
                                                        <label className="mb-2 block text-xs font-medium text-gray-600">
                                                            Color
                                                        </label>

                                                        <select
                                                            value={
                                                                variation.color
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateVariation(
                                                                    variation.id,
                                                                    "color",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                                                        >
                                                            <option value="">
                                                                Select
                                                                color
                                                            </option>

                                                            {colors.map(
                                                                (
                                                                    color
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            color.id
                                                                        }
                                                                        value={
                                                                            color.id
                                                                        }
                                                                    >
                                                                        {
                                                                            color.name
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="mb-2 block text-xs font-medium text-gray-600">
                                                            Size
                                                        </label>

                                                        <select
                                                            value={
                                                                variation.size
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateVariation(
                                                                    variation.id,
                                                                    "size",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                                                        >
                                                            <option value="">
                                                                Select
                                                                size
                                                            </option>

                                                            {sizes.map(
                                                                (
                                                                    size
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            size.id
                                                                        }
                                                                        value={
                                                                            size.id
                                                                        }
                                                                    >
                                                                        {
                                                                            size.name
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="mb-2 block text-xs font-medium text-gray-600">
                                                            Price
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                variation.price
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateVariation(
                                                                    variation.id,
                                                                    "price",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-2 block text-xs font-medium text-gray-600">
                                                            Stock
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                variation.stock
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateVariation(
                                                                    variation.id,
                                                                    "stock",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* =================================================
                        SIDEBAR
                    ================================================= */}

                    <div className="space-y-6">
                        {/* STATUS */}

                        <section className="rounded-xl border border-gray-200 bg-white p-5">
                            <h2 className="text-sm font-semibold text-gray-900">
                                Product Status
                            </h2>

                            <div className="mt-4 rounded-lg border border-gray-200 p-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {isVisible
                                                ? "Published"
                                                : "Draft"}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {isVisible
                                                ? "Visible in your store"
                                                : "Hidden from your store"}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsVisible(
                                                (
                                                    current
                                                ) =>
                                                    !current
                                            )
                                        }
                                        className={`relative h-6 w-11 rounded-full transition ${
                                            isVisible
                                                ? "bg-black"
                                                : "bg-gray-300"
                                        }`}
                                    >
                                        <span
                                            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                                                isVisible
                                                    ? "left-6"
                                                    : "left-1"
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* ORGANIZATION */}

                        <section className="rounded-xl border border-gray-200 bg-white p-5">
                            <h2 className="text-sm font-semibold text-gray-900">
                                Organization
                            </h2>

                            <div className="mt-5 space-y-5">
                                <div>
                                    <label className="mb-2 block text-xs font-medium text-gray-600">
                                        Brand
                                    </label>

                                    <select
                                        value={brand}
                                        onChange={(
                                            event
                                        ) =>
                                            setBrand(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            optionsLoading
                                        }
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                                    >
                                        <option value="">
                                            Select brand
                                        </option>

                                        {brands.map(
                                            (
                                                item
                                            ) => (
                                                <option
                                                    key={
                                                        item.id
                                                    }
                                                    value={
                                                        item.id
                                                    }
                                                >
                                                    {
                                                        item.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-gray-600">
                                        Category
                                    </label>

                                    <button
                                        type="button"
                                        onClick={
                                            openCategoryPicker
                                        }
                                        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm hover:bg-gray-50"
                                    >
                                        <span
                                            className={
                                                selectedCategory
                                                    ? "text-gray-900"
                                                    : "text-gray-400"
                                            }
                                        >
                                            {selectedCategory
                                                ? selectedCategory.path?.join(
                                                      " → "
                                                  ) ||
                                                  selectedCategory.name
                                                : "Select category"}
                                        </span>

                                        <FiChevronRight
                                            size={
                                                16
                                            }
                                            className="text-gray-400"
                                        />
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* SAVE */}

                        <section className="rounded-xl border border-gray-200 bg-white p-5">
                            <button
                                type="button"
                                onClick={
                                    handleSubmit
                                }
                                disabled={
                                    submitting
                                }
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <FiCheck
                                    size={17}
                                />

                                {submitting
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                            <Link
                                href="/admin/dashboard/inventory"
                                className="mt-3 flex w-full items-center justify-center rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                        </section>

                        {/* ERRORS */}

                        {submitError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                <p className="text-sm text-red-700">
                                    {submitError}
                                </p>
                            </div>
                        )}

                        {submitSuccess && (
                            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                                <p className="text-sm text-green-700">
                                    {
                                        submitSuccess
                                    }
                                </p>
                            </div>
                        )}

                        {optionsError && (
                            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                                <p className="text-sm text-yellow-700">
                                    {
                                        optionsError
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* =================================================
                CATEGORY MODAL
            ================================================= */}

            {categoryOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b px-5 py-4">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">
                                    Select Category
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    Choose the category
                                    for this
                                    product.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setCategoryOpen(
                                        false
                                    )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                            >
                                <FiX
                                    size={18}
                                />
                            </button>
                        </div>

                        <div className="border-b p-4">
                            <div className="relative">
                                <FiSearch
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={
                                        categorySearch
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setCategorySearch(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Search categories..."
                                    className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-black"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3">
                            {categoryLoading ? (
                                <div className="p-8 text-center text-sm text-gray-500">
                                    Loading
                                    categories...
                                </div>
                            ) : categoryError ? (
                                <div className="p-8 text-center text-sm text-red-500">
                                    {
                                        categoryError
                                    }
                                </div>
                            ) : filteredCategories.length ===
                              0 ? (
                                <div className="p-8 text-center text-sm text-gray-500">
                                    No categories
                                    found.
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredCategories.map(
                                        (
                                            category
                                        ) => (
                                            <button
                                                key={
                                                    category.id
                                                }
                                                type="button"
                                                onClick={() =>
                                                    selectCategory(
                                                        category
                                                    )
                                                }
                                                className={`w-full rounded-lg px-3 py-3 text-left transition hover:bg-gray-50 ${
                                                    selectedCategory?.id ===
                                                    category.id
                                                        ? "bg-gray-100"
                                                        : ""
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {
                                                                category.name
                                                            }
                                                        </p>

                                                        {category
                                                            .path
                                                            ?.length >
                                                            1 && (
                                                            <p className="mt-1 text-xs text-gray-400">
                                                                {category.path
                                                                    .slice(
                                                                        0,
                                                                        -1
                                                                    )
                                                                    .join(
                                                                        " → "
                                                                    )}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {selectedCategory?.id ===
                                                        category.id && (
                                                        <FiCheck
                                                            size={
                                                                17
                                                            }
                                                            className="text-black"
                                                        />
                                                    )}
                                                </div>
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* =================================================
                PREVIEW MODAL
            ================================================= */}

            {previewOpen && (
                <div className="fixed inset-0 z-50 bg-black/60">
                    <div className="flex h-full flex-col">
                        <div className="flex items-center justify-between border-b bg-white px-5 py-4">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">
                                    Product Preview
                                </h2>

                                <p className="text-xs text-gray-500">
                                    Preview the product
                                    before saving.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setPreviewOpen(
                                        false
                                    )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                            >
                                <FiX
                                    size={19}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 border-b bg-white py-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setPreviewMode(
                                        "desktop"
                                    )
                                }
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                                    previewMode ===
                                    "desktop"
                                        ? "bg-black text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                <FiMonitor
                                    size={16}
                                />
                                Desktop
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setPreviewMode(
                                        "mobile"
                                    )
                                }
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                                    previewMode ===
                                    "mobile"
                                        ? "bg-black text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                <FiSmartphone
                                    size={16}
                                />
                                Mobile
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 p-4">
                            <ProductPreview
                                productName={
                                    productName
                                }
                                description={
                                    description
                                }
                                price={price}
                                discount={
                                    discount
                                }
                                images={
                                    previewImages
                                }
                                selectedCategory={
                                    selectedCategory
                                }
                                brandName={
                                    brandName
                                }
                                previewMode={
                                    previewMode
                                }
                                previewImage={
                                    previewImage
                                }
                                setPreviewImage={
                                    setPreviewImage
                                }
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}