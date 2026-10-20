"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    FiArrowLeft,
    FiCheck,
    FiChevronLeft,
    FiChevronRight,
    FiHeart,
    FiImage,
    FiMinus,
    FiMonitor,
    FiPlus,
    FiSave,
    FiSearch,
    FiShoppingBag,
    FiSmartphone,
    FiTrash2,
    FiUpload,
    FiX,
} from "react-icons/fi";

import adminApi from "../../../../api/adminApi";

/* =========================================================
   PRODUCT PREVIEW
========================================================= */

function ProductPreview({
    mode,
    productName,
    description,
    price,
    discount,
    stock,
    images,
    variations,
    colors,
    sizes,
    selectedCategory,
    brand,
    brands,
    previewImage,
    setPreviewImage,
}) {
    const isMobile = mode === "mobile";

    const selectedBrand = brands.find(
        (item) => String(item.id) === String(brand)
    );

    const getColor = (id) =>
        colors.find((item) => String(item.id) === String(id));

    const getSize = (id) =>
        sizes.find((item) => String(item.id) === String(id));

    const availableColors = [
        ...new Map(
            variations
                .filter((item) => item.color)
                .map((item) => {
                    const color = getColor(item.color);

                    return [
                        item.color,
                        {
                            id: item.color,
                            name: color?.name || "Color",
                            hex: color?.hexcode || "#000000",
                        },
                    ];
                })
        ).values(),
    ];

    const availableSizes = [
        ...new Map(
            variations
                .filter((item) => item.size)
                .map((item) => {
                    const size = getSize(item.size);

                    return [
                        item.size,
                        {
                            id: item.size,
                            name: size?.name || "Size",
                        },
                    ];
                })
        ).values(),
    ];

    const basePrice = Number(price) || 0;
    const discountValue = Number(discount) || 0;

    const finalPrice =
        discountValue > 0
            ? basePrice - (basePrice * discountValue) / 100
            : basePrice;

    const totalStock =
        variations.length > 0
            ? variations.reduce(
                  (total, variation) =>
                      total + (Number(variation.stock) || 0),
                  0
              )
            : Number(stock) || 0;

    const formatPrice = (value) =>
        Number(value || 0).toLocaleString("en-NG");

    const currentImage =
        images.length > 0
            ? images[previewImage]?.url
            : null;

    const nextImage = () => {
        if (!images.length) return;

        setPreviewImage((previous) =>
            previous >= images.length - 1
                ? 0
                : previous + 1
        );
    };

    const previousImage = () => {
        if (!images.length) return;

        setPreviewImage((previous) =>
            previous <= 0
                ? images.length - 1
                : previous - 1
        );
    };

    return (
        <div
            className={
                isMobile
                    ? "mx-auto w-[390px] max-w-full overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-2xl"
                    : "w-[1180px] min-w-[1180px] overflow-hidden rounded-2xl border border-gray-200 bg-white"
            }
        >
            <div className="w-full bg-white">
                {/* BREADCRUMB */}

                <div
                    className={
                        isMobile
                            ? "px-4 pt-5"
                            : "px-8 pt-7"
                    }
                >
                    <div className="flex items-center gap-2 overflow-hidden text-[10px] text-gray-400">
                        <span className="shrink-0">
                            Home
                        </span>

                        <FiChevronRight
                            size={11}
                            className="shrink-0"
                        />

                        <span className="truncate">
                            {selectedCategory?.name ||
                                "Category"}
                        </span>

                        <FiChevronRight
                            size={11}
                            className="shrink-0"
                        />

                        <span className="truncate font-medium text-gray-700">
                            {productName || "Product"}
                        </span>
                    </div>
                </div>

                {/* MAIN */}

                <section
                    className={
                        isMobile
                            ? "px-4 pb-8 pt-5"
                            : "px-8 pb-12 pt-8"
                    }
                >
                    <div
                        className={
                            isMobile
                                ? "grid grid-cols-1 gap-7"
                                : "grid grid-cols-2 gap-12"
                        }
                    >
                        {/* IMAGES */}

                        <div className="min-w-0">
                            <div
                                className={
                                    isMobile
                                        ? "flex flex-col gap-3"
                                        : "flex flex-row gap-4"
                                }
                            >
                                {images.length > 0 && (
                                    <div
                                        className={
                                            isMobile
                                                ? "order-2 flex w-full gap-2 overflow-x-auto pb-1"
                                                : "order-1 flex w-[72px] shrink-0 flex-col gap-3 overflow-y-auto"
                                        }
                                    >
                                        {images.map(
                                            (
                                                image,
                                                index
                                            ) => (
                                                <button
                                                    key={`${image.name}-${index}`}
                                                    type="button"
                                                    onClick={() =>
                                                        setPreviewImage(
                                                            index
                                                        )
                                                    }
                                                    className={`shrink-0 overflow-hidden rounded-xl border-2 ${
                                                        previewImage ===
                                                        index
                                                            ? "border-black"
                                                            : "border-gray-200"
                                                    }`}
                                                >
                                                    <img
                                                        src={
                                                            image.url
                                                        }
                                                        alt=""
                                                        className={
                                                            isMobile
                                                                ? "h-16 w-16 object-cover"
                                                                : "h-[68px] w-[68px] object-cover"
                                                        }
                                                    />
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}

                                <div
                                    className={
                                        isMobile
                                            ? "order-1 relative h-[350px] w-full overflow-hidden rounded-2xl bg-gray-50"
                                            : "order-2 relative h-[520px] min-w-0 flex-1 overflow-hidden rounded-3xl bg-gray-50"
                                    }
                                >
                                    {currentImage ? (
                                        <img
                                            src={currentImage}
                                            alt={
                                                productName ||
                                                "Product"
                                            }
                                            className="h-full w-full object-contain p-5"
                                        />
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center text-gray-300">
                                            <FiImage
                                                size={
                                                    isMobile
                                                        ? 38
                                                        : 48
                                                }
                                            />

                                            <p className="mt-3 text-[10px]">
                                                Product image
                                            </p>
                                        </div>
                                    )}

                                    {discountValue > 0 && (
                                        <span className="absolute left-4 top-4 rounded-full bg-black px-3 py-1.5 text-[10px] font-bold text-white">
                                            -{discountValue}%
                                        </span>
                                    )}

                                    {images.length > 0 && (
                                        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-semibold text-gray-600">
                                            {previewImage + 1} /{" "}
                                            {images.length}
                                        </span>
                                    )}

                                    <button
                                        type="button"
                                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
                                    >
                                        <FiHeart size={18} />
                                    </button>

                                    {images.length > 1 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={
                                                    previousImage
                                                }
                                                className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-sm"
                                            >
                                                <FiChevronLeft
                                                    size={15}
                                                />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={
                                                    nextImage
                                                }
                                                className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-sm"
                                            >
                                                <FiChevronRight
                                                    size={15}
                                                />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* INFORMATION */}

                        <div
                            className={
                                isMobile
                                    ? "min-w-0"
                                    : "flex min-w-0 flex-col justify-center"
                            }
                        >
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                                {selectedCategory?.name ||
                                    "Category"}
                            </p>

                            <h1
                                className={
                                    isMobile
                                        ? "mt-2 text-2xl font-bold leading-tight text-gray-950"
                                        : "mt-3 text-4xl font-bold leading-tight text-gray-950"
                                }
                            >
                                {productName ||
                                    "Your product name"}
                            </h1>

                            {selectedBrand && (
                                <p className="mt-2 text-xs text-gray-400">
                                    {selectedBrand.name}
                                </p>
                            )}

                            <div className="mt-4 flex items-center gap-2">
                                <div className="flex gap-0.5 text-black">
                                    <span>★</span>
                                    <span>★</span>
                                    <span>★</span>
                                    <span>★</span>
                                    <span className="text-gray-300">
                                        ★
                                    </span>
                                </div>

                                <span className="text-[10px] text-gray-400">
                                    No reviews yet
                                </span>
                            </div>

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                <span
                                    className={
                                        isMobile
                                            ? "text-2xl font-bold"
                                            : "text-3xl font-bold"
                                    }
                                >
                                    ₦
                                    {formatPrice(
                                        finalPrice
                                    )}
                                </span>

                                {discountValue > 0 && (
                                    <>
                                        <span className="text-sm text-gray-400 line-through">
                                            ₦
                                            {formatPrice(
                                                basePrice
                                            )}
                                        </span>

                                        <span className="rounded-full bg-green-50 px-2 py-1 text-[9px] font-bold text-green-600">
                                            SAVE{" "}
                                            {discountValue}%
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="mt-6">
                                <p className="text-xs leading-6 text-gray-500">
                                    {description ||
                                        "Your product description will appear here."}
                                </p>
                            </div>

                            {availableColors.length > 0 && (
                                <div className="mt-7">
                                    <p className="mb-3 text-xs font-semibold">
                                        Color
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {availableColors.map(
                                            (color) => (
                                                <div
                                                    key={
                                                        color.id
                                                    }
                                                    className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-[10px]"
                                                >
                                                    <span
                                                        className="h-4 w-4 rounded-full border border-gray-200"
                                                        style={{
                                                            backgroundColor:
                                                                color.hex,
                                                        }}
                                                    />

                                                    {
                                                        color.name
                                                    }
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {availableSizes.length > 0 && (
                                <div className="mt-6">
                                    <p className="mb-3 text-xs font-semibold">
                                        Size
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {availableSizes.map(
                                            (size) => (
                                                <div
                                                    key={
                                                        size.id
                                                    }
                                                    className="rounded-xl border border-gray-200 px-4 py-2 text-[10px] font-medium"
                                                >
                                                    {
                                                        size.name
                                                    }
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex items-center gap-2">
                                <span
                                    className={`h-2 w-2 rounded-full ${
                                        totalStock > 0
                                            ? "bg-green-500"
                                            : "bg-red-500"
                                    }`}
                                />

                                <span className="text-[10px] font-medium text-gray-500">
                                    {totalStock > 0
                                        ? `${totalStock} items in stock`
                                        : "Out of stock"}
                                </span>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <div className="flex h-11 items-center justify-center rounded-xl border border-gray-200">
                                    <button
                                        type="button"
                                        className="flex h-full w-10 items-center justify-center"
                                    >
                                        <FiMinus
                                            size={13}
                                        />
                                    </button>

                                    <span className="w-7 text-center text-xs font-semibold">
                                        1
                                    </span>

                                    <button
                                        type="button"
                                        className="flex h-full w-10 items-center justify-center"
                                    >
                                        <FiPlus
                                            size={13}
                                        />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-black px-5 text-xs font-semibold text-white"
                                >
                                    <FiShoppingBag
                                        size={15}
                                    />
                                    Add to cart
                                </button>
                            </div>

                            <div
                                className={
                                    isMobile
                                        ? "mt-6 grid grid-cols-1 gap-2"
                                        : "mt-7 grid grid-cols-2 gap-3"
                                }
                            >
                                <div className="rounded-xl bg-gray-50 p-4">
                                    <p className="text-[10px] font-semibold">
                                        Secure shopping
                                    </p>

                                    <p className="mt-1 text-[9px] leading-4 text-gray-400">
                                        Your order and
                                        payment are
                                        secure.
                                    </p>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-4">
                                    <p className="text-[10px] font-semibold">
                                        Fast delivery
                                    </p>

                                    <p className="mt-1 text-[9px] leading-4 text-gray-400">
                                        Reliable delivery
                                        to your location.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    className={
                        isMobile
                            ? "border-t border-gray-100 bg-gray-50 px-4 py-7"
                            : "border-t border-gray-100 bg-gray-50 px-8 py-10"
                    }
                >
                    <div className="max-w-5xl">
                        <div className="flex items-center gap-6 border-b border-gray-200">
                            <button
                                type="button"
                                className="border-b-2 border-black pb-3 text-xs font-semibold"
                            >
                                Description
                            </button>

                            <button
                                type="button"
                                className="pb-3 text-xs text-gray-400"
                            >
                                Specifications
                            </button>
                        </div>

                        <p className="mt-5 text-xs leading-6 text-gray-500">
                            {description ||
                                "Detailed product information will appear here once you add your product description."}
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}

/* =========================================================
   ADD PRODUCT PAGE
========================================================= */

export default function AddProductPage() {
    const [images, setImages] = useState([]);

    const [status, setStatus] = useState("Draft");

    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [discount, setDiscount] = useState("");
    const [stock, setStock] = useState("");
    const [brand, setBrand] = useState("");
    const [isVisible, setIsVisible] = useState(true);

    const [brands, setBrands] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);

    const [optionsLoading, setOptionsLoading] =
        useState(false);
    const [optionsError, setOptionsError] = useState("");

    const [variations, setVariations] = useState([]);

    /* =====================================================
       CATEGORY
    ===================================================== */

    const [categories, setCategories] = useState([]);
    const [categoryLoading, setCategoryLoading] =
        useState(false);
    const [categoryError, setCategoryError] = useState("");
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState("");
    const [categoryPath, setCategoryPath] = useState([]);
    const [selectedCategory, setSelectedCategory] =
        useState(null);

    /* =====================================================
       SUBMIT
    ===================================================== */

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] =
        useState("");

    /* =====================================================
       PREVIEW
    ===================================================== */

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewMode, setPreviewMode] =
        useState("desktop");
    const [previewImage, setPreviewImage] = useState(0);

    /* =====================================================
       FETCH INITIAL DATA
    ===================================================== */

    useEffect(() => {
        fetchCategories();
        fetchOptions();

        return () => {
            images.forEach((image) => {
                if (image.url) {
                    URL.revokeObjectURL(image.url);
                }
            });
        };
    }, []);

    /* =====================================================
       CATEGORIES
    ===================================================== */

    const fetchCategories = async () => {
        try {
            setCategoryLoading(true);
            setCategoryError("");

            const response = await adminApi.get(
                "products/categories/"
            );

            setCategories(response.data || []);
        } catch (error) {
            console.error(error);

            setCategoryError(
                error?.response?.data?.detail ||
                    "Failed to load categories."
            );
        } finally {
            setCategoryLoading(false);
        }
    };

    /* =====================================================
       OPTIONS
    ===================================================== */

    const fetchOptions = async () => {
        try {
            setOptionsLoading(true);
            setOptionsError("");

            const response = await adminApi.get(
                "products/options/"
            );

            const data = response.data || {};

            setBrands(data.brands || []);
            setColors(data.colors || []);
            setSizes(data.sizes || []);
        } catch (error) {
            console.error(error);

            setOptionsError(
                error?.response?.data?.detail ||
                    "Failed to load product options."
            );
        } finally {
            setOptionsLoading(false);
        }
    };

    /* =====================================================
       CATEGORY HELPERS
    ===================================================== */

    const flattenCategories = (
        items,
        parents = []
    ) => {
        let result = [];

        items.forEach((category) => {
            const currentPath = [
                ...parents,
                {
                    id: category.id,
                    name: category.name,
                },
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
    };

    const allCategories = useMemo(
        () => flattenCategories(categories),
        [categories]
    );

    const filteredCategories = useMemo(() => {
        const search = categorySearch
            .trim()
            .toLowerCase();

        if (!search) return [];

        return allCategories.filter((category) => {
            const fullPath = category.path
                .map((item) => item.name)
                .join(" → ")
                .toLowerCase();

            return (
                category.name
                    .toLowerCase()
                    .includes(search) ||
                fullPath.includes(search)
            );
        });
    }, [categorySearch, allCategories]);

    const currentCategories = useMemo(() => {
        if (!categoryPath.length) {
            return categories;
        }

        const currentParent =
            categoryPath[categoryPath.length - 1];

        return currentParent.children || [];
    }, [categories, categoryPath]);

    const selectCategoryLevel = (category) => {
        if (category.children?.length) {
            setCategoryPath((previous) => [
                ...previous,
                category,
            ]);

            setCategorySearch("");
            return;
        }

        selectFinalCategory(category);
    };

    const selectFinalCategory = (category) => {
        const path = [
            ...categoryPath,
            category,
        ];

        setSelectedCategory({
            id: category.id,
            name: category.name,
            path,
        });

        setCategoryOpen(false);
        setCategorySearch("");
        setCategoryPath([]);
    };

    const selectSearchResult = (category) => {
        setSelectedCategory({
            id: category.id,
            name: category.name,
            path: category.path,
        });

        setCategoryOpen(false);
        setCategorySearch("");
        setCategoryPath([]);
    };

    const goBackCategory = () => {
        setCategoryPath((previous) =>
            previous.slice(0, -1)
        );
    };

    const closeCategoryPicker = () => {
        setCategoryOpen(false);
        setCategorySearch("");
        setCategoryPath([]);
    };

    /* =====================================================
       IMAGE HANDLING
    ===================================================== */

    const handleImages = (event) => {
        const files = Array.from(
            event.target.files || []
        );

        const newImages = files.map((file) => ({
            id:
                typeof crypto !== "undefined" &&
                crypto.randomUUID
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            url: URL.createObjectURL(file),
        }));

        setImages((previous) => [
            ...previous,
            ...newImages,
        ]);

        event.target.value = "";
    };

    const removeImage = (id) => {
        setImages((previous) => {
            const image = previous.find(
                (item) => item.id === id
            );

            if (image?.url) {
                URL.revokeObjectURL(image.url);
            }

            return previous.filter(
                (item) => item.id !== id
            );
        });

        setPreviewImage(0);
    };

    /* =====================================================
       VARIATIONS
    ===================================================== */

    const addVariation = () => {
        setVariations((previous) => [
            ...previous,
            {
                id:
                    typeof crypto !== "undefined" &&
                    crypto.randomUUID
                        ? crypto.randomUUID()
                        : `${Date.now()}-${Math.random()}`,
                color: "",
                size: "",
                price: price || "",
                stock: "",
            },
        ]);
    };

    const removeVariation = (id) => {
        setVariations((previous) =>
            previous.filter(
                (variation) =>
                    variation.id !== id
            )
        );
    };

    const updateVariation = (
        id,
        field,
        value
    ) => {
        setVariations((previous) =>
            previous.map((variation) =>
                variation.id === id
                    ? {
                          ...variation,
                          [field]: value,
                      }
                    : variation
            )
        );
    };

    const duplicateVariation = (variation) => {
        setVariations((previous) => [
            ...previous,
            {
                ...variation,
                id:
                    typeof crypto !== "undefined" &&
                    crypto.randomUUID
                        ? crypto.randomUUID()
                        : `${Date.now()}-${Math.random()}`,
            },
        ]);
    };

    /* =====================================================
       FORMAT
    ===================================================== */

    const formatNumber = (value) => {
        if (!value) return "";

        return Number(value).toLocaleString(
            "en-NG"
        );
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateProduct = () => {
        if (!productName.trim()) {
            return "Product name is required.";
        }

        if (!description.trim()) {
            return "Product description is required.";
        }

        if (!price || Number(price) < 0) {
            return "Enter a valid product price.";
        }

        if (
            discount !== "" &&
            (Number(discount) < 0 ||
                Number(discount) > 100)
        ) {
            return "Discount must be between 0 and 100.";
        }

        if (!selectedCategory?.id) {
            return "Please select a category.";
        }

        if (!brand) {
            return "Please select a brand.";
        }

        if (!images.length) {
            return "Please upload at least one product image.";
        }

        for (let index = 0; index < variations.length; index++) {
            const variation = variations[index];

            if (!variation.color && !variation.size) {
                return `Variation ${
                    index + 1
                } must have a color or size.`;
            }

            if (
                variation.stock === "" ||
                Number(variation.stock) < 0
            ) {
                return `Enter a valid stock for variation ${
                    index + 1
                }.`;
            }

            if (
                variation.price !== "" &&
                Number(variation.price) < 0
            ) {
                return `Enter a valid price for variation ${
                    index + 1
                }.`;
            }
        }

        return null;
    };

    /* =====================================================
       SUBMIT
    ===================================================== */

    const handleSubmit = async (
        publish = false
    ) => {
        setSubmitError("");
        setSubmitSuccess("");

        const validationError =
            validateProduct();

        if (validationError) {
            setSubmitError(validationError);
            return;
        }

        try {
            setSubmitting(true);

            const formData = new FormData();

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
                price
            );

            formData.append(
                "discount",
                discount || "0"
            );

            formData.append(
                "stock",
                stock || "0"
            );

            formData.append(
                "is_available",
                String(publish && isVisible)
            );

            formData.append(
                "brand",
                String(brand)
            );

            formData.append(
                "category",
                String(selectedCategory.id)
            );

            /*
             * First image becomes the Product.image
             */
            if (images[0]?.file) {
                formData.append(
                    "image",
                    images[0].file
                );
            }

            /*
             * Remaining images become gallery images.
             */
            images.slice(1).forEach((image) => {
                if (image.file) {
                    formData.append(
                        "gallery",
                        image.file
                    );
                }
            });

            if (variations.length > 0) {

                const variationData = variations.map(
                    (variation) => ({
                        color: variation.color
                            ? Number(variation.color)
                            : null,

                        size: variation.size
                            ? Number(variation.size)
                            : null,

                        stock: Number(
                            variation.stock || 0
                        ),

                        price: Number(
                            variation.price || 0
                        ),
                    })
                );

                formData.append(
                    "variations",
                    JSON.stringify(variationData)
                );
            }

            const response = await adminApi.post(
                "products/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log(
                "Product created:",
                response.data
            );

            setStatus(
                publish ? "Published" : "Draft"
            );

            setSubmitSuccess(
                publish
                    ? "Product published successfully."
                    : "Product saved successfully."
            );

            /*
             * Keep the form visible after creation.
             * This makes it easier to inspect the created data.
             */
        } catch (error) {
            console.error(
                "Product creation failed:",
                error
            );

            const data =
                error?.response?.data;

            if (
                typeof data === "object" &&
                data !== null
            ) {
                const messages = Object.entries(
                    data
                )
                    .map(([field, value]) => {
                        const message = Array.isArray(
                            value
                        )
                            ? value.join(", ")
                            : String(value);

                        return `${field}: ${message}`;
                    })
                    .join(" ");

                setSubmitError(
                    messages ||
                        "Failed to create product."
                );
            } else {
                setSubmitError(
                    "Failed to create product. Please try again."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    /* =====================================================
       PREVIEW
    ===================================================== */

    const openPreview = () => {
        setPreviewImage(0);
        setPreviewMode("desktop");
        setPreviewOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="sticky top-0 z-40 border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <Link
                            href="/admin/dashboard/inventory"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50"
                        >
                            <FiArrowLeft size={16} />
                        </Link>

                        <div className="min-w-0">
                            <h1 className="truncate text-sm font-bold text-gray-950 sm:text-base">
                                Add Product
                            </h1>

                            <p className="hidden text-[10px] text-gray-400 sm:block">
                                Create a new product
                                for your store.
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                        <button
                            type="button"
                            onClick={openPreview}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[10px] font-semibold hover:bg-gray-50 sm:px-4 sm:py-3 sm:text-xs"
                        >
                            <FiMonitor size={15} />

                            <span className="hidden sm:inline">
                                Preview
                            </span>
                        </button>

                        <button
                            type="button"
                            disabled={submitting}
                            onClick={() =>
                                handleSubmit(false)
                            }
                            className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-semibold hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
                        >
                            <FiSave size={15} />

                            Save draft
                        </button>

                        <button
                            type="button"
                            disabled={submitting}
                            onClick={() =>
                                handleSubmit(true)
                            }
                            className="flex items-center gap-2 rounded-xl bg-black px-3 py-2.5 text-[10px] font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-xs"
                        >
                            <FiCheck size={15} />

                            {submitting
                                ? "Saving..."
                                : "Publish"}
                        </button>
                    </div>
                </div>
            </div>

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
                {submitError && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                        {submitError}
                    </div>
                )}

                {submitSuccess && (
                    <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-600">
                        {submitSuccess}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
                    {/* =================================================
                        LEFT
                    ================================================= */}

                    <div className="space-y-6">
                        {/* BASIC */}

                        <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                            <div className="mb-6">
                                <h2 className="text-sm font-bold">
                                    Basic information
                                </h2>

                                <p className="mt-1 text-[10px] text-gray-400">
                                    Add the basic
                                    information customers
                                    need to know.
                                </p>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block text-[10px] font-semibold text-gray-700">
                                        Product name
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            productName
                                        }
                                        onChange={(e) =>
                                            setProductName(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter product name"
                                        className="h-11 w-full rounded-xl border border-gray-200 px-4 text-xs outline-none focus:border-black"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-[10px] font-semibold text-gray-700">
                                        Description
                                    </label>

                                    <textarea
                                        value={
                                            description
                                        }
                                        onChange={(e) =>
                                            setDescription(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="Describe your product..."
                                        rows={6}
                                        className="w-full resize-none rounded-xl border border-gray-200 p-4 text-xs leading-6 outline-none focus:border-black"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-[10px] font-semibold text-gray-700">
                                        Category
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCategoryOpen(
                                                true
                                            )
                                        }
                                        className="flex min-h-11 w-full items-center justify-between rounded-xl border border-gray-200 px-4 text-left"
                                    >
                                        <div className="min-w-0">
                                            {selectedCategory ? (
                                                <>
                                                    <p className="truncate text-xs font-medium">
                                                        {
                                                            selectedCategory.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 truncate text-[9px] text-gray-400">
                                                        {selectedCategory.path
                                                            ?.map(
                                                                (
                                                                    item
                                                                ) =>
                                                                    item.name
                                                            )
                                                            .join(
                                                                " → "
                                                            )}
                                                    </p>
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    Select category
                                                </span>
                                            )}
                                        </div>

                                        <FiChevronRight
                                            size={16}
                                            className="shrink-0 text-gray-400"
                                        />
                                    </button>

                                    {categoryError && (
                                        <p className="mt-2 text-[10px] text-red-500">
                                            {
                                                categoryError
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* PRICING */}

                        <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                            <div className="mb-6">
                                <h2 className="text-sm font-bold">
                                    Pricing & inventory
                                </h2>

                                <p className="mt-1 text-[10px] text-gray-400">
                                    Set your product
                                    price, discount and
                                    available stock.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-[10px] font-semibold text-gray-700">
                                        Price
                                    </label>

                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                            ₦
                                        </span>

                                        <input
                                            type="number"
                                            min="0"
                                            value={price}
                                            onChange={(e) =>
                                                setPrice(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="0"
                                            className="h-11 w-full rounded-xl border border-gray-200 pl-8 pr-4 text-xs outline-none focus:border-black"
                                        />
                                    </div>

                                    {price && (
                                        <p className="mt-2 text-[9px] text-gray-400">
                                            ₦
                                            {formatNumber(
                                                price
                                            )}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-[10px] font-semibold text-gray-700">
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
                                            onChange={(e) =>
                                                setDiscount(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="0"
                                            className="h-11 w-full rounded-xl border border-gray-200 px-4 pr-10 text-xs outline-none focus:border-black"
                                        />

                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                            %
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-[10px] font-semibold text-gray-700">
                                        Stock
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={stock}
                                        onChange={(e) =>
                                            setStock(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="0"
                                        className="h-11 w-full rounded-xl border border-gray-200 px-4 text-xs outline-none focus:border-black"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* IMAGES */}

                        <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                            <div className="mb-6">
                                <h2 className="text-sm font-bold">
                                    Product images
                                </h2>

                                <p className="mt-1 text-[10px] text-gray-400">
                                    The first image will
                                    become the main product
                                    image. Additional images
                                    will be added to the
                                    gallery.
                                </p>
                            </div>

                            <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-5 text-center hover:border-gray-400">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                                    <FiUpload size={20} />
                                </div>

                                <p className="mt-4 text-xs font-semibold">
                                    Upload product images
                                </p>

                                <p className="mt-1 text-[10px] text-gray-400">
                                    PNG, JPG or WEBP
                                </p>

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

                            {images.length > 0 && (
                                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                                    {images.map(
                                        (
                                            image,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    image.id
                                                }
                                                className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                                            >
                                                <img
                                                    src={
                                                        image.url
                                                    }
                                                    alt={
                                                        image.name
                                                    }
                                                    className="h-full w-full object-cover"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeImage(
                                                            image.id
                                                        )
                                                    }
                                                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-white opacity-0 transition group-hover:opacity-100"
                                                >
                                                    <FiTrash2
                                                        size={
                                                            13
                                                        }
                                                    />
                                                </button>

                                                {index ===
                                                    0 && (
                                                    <span className="absolute bottom-2 left-2 rounded-full bg-black px-2 py-1 text-[8px] font-semibold text-white">
                                                        Main
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </section>

                        {/* VARIATIONS */}

                        <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-sm font-bold">
                                        Product variations
                                    </h2>

                                    <p className="mt-1 text-[10px] text-gray-400">
                                        Add colors, sizes,
                                        prices and stock.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        addVariation
                                    }
                                    className="flex shrink-0 items-center gap-2 rounded-xl bg-black px-3 py-2.5 text-[10px] font-semibold text-white"
                                >
                                    <FiPlus size={14} />
                                    Add variation
                                </button>
                            </div>

                            {optionsError && (
                                <div className="mb-4 rounded-xl bg-red-50 p-3 text-[10px] text-red-500">
                                    {optionsError}
                                </div>
                            )}

                            {optionsLoading ? (
                                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center text-[10px] text-gray-400">
                                    Loading product
                                    options...
                                </div>
                            ) : variations.length ===
                              0 ? (
                                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center">
                                    <p className="text-xs font-semibold">
                                        No variations
                                    </p>

                                    <p className="mt-1 text-[10px] text-gray-400">
                                        Add variations if
                                        your product has
                                        different colors
                                        or sizes.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {variations.map(
                                        (
                                            variation,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    variation.id
                                                }
                                                className="rounded-2xl border border-gray-200 p-4"
                                            >
                                                <div className="mb-4 flex items-center justify-between">
                                                    <p className="text-[10px] font-bold">
                                                        Variation{" "}
                                                        {index +
                                                            1}
                                                    </p>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                duplicateVariation(
                                                                    variation
                                                                )
                                                            }
                                                            className="text-[9px] font-medium text-gray-500 hover:text-black"
                                                        >
                                                            Duplicate
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeVariation(
                                                                    variation.id
                                                                )
                                                            }
                                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                                                        >
                                                            <FiTrash2
                                                                size={
                                                                    13
                                                                }
                                                            />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                                    <div>
                                                        <label className="mb-2 block text-[9px] font-semibold text-gray-600">
                                                            Color
                                                        </label>

                                                        <select
                                                            value={
                                                                variation.color
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updateVariation(
                                                                    variation.id,
                                                                    "color",
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-[10px] outline-none focus:border-black"
                                                        >
                                                            <option value="">
                                                                No
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
                                                        <label className="mb-2 block text-[9px] font-semibold text-gray-600">
                                                            Size
                                                        </label>

                                                        <select
                                                            value={
                                                                variation.size
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updateVariation(
                                                                    variation.id,
                                                                    "size",
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-[10px] outline-none focus:border-black"
                                                        >
                                                            <option value="">
                                                                No
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
                                                        <label className="mb-2 block text-[9px] font-semibold text-gray-600">
                                                            Price
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                variation.price
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updateVariation(
                                                                    variation.id,
                                                                    "price",
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder={
                                                                price ||
                                                                "Optional"
                                                            }
                                                            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-[10px] outline-none focus:border-black"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-2 block text-[9px] font-semibold text-gray-600">
                                                            Stock
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                variation.stock
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updateVariation(
                                                                    variation.id,
                                                                    "stock",
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="0"
                                                            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-[10px] outline-none focus:border-black"
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

                    <aside className="space-y-6">
                        <section className="rounded-2xl border border-gray-200 bg-white p-5">
                            <h2 className="text-sm font-bold">
                                Product status
                            </h2>

                            <p className="mt-1 text-[10px] text-gray-400">
                                Control whether the
                                product is visible.
                            </p>

                            <div className="mt-5 rounded-xl bg-gray-50 p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-semibold">
                                        Status
                                    </span>

                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[8px] font-bold ${
                                            status ===
                                            "Published"
                                                ? "bg-green-100 text-green-600"
                                                : "bg-yellow-100 text-yellow-700"
                                        }`}
                                    >
                                        {status}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-gray-200 bg-white p-5">
                            <h2 className="text-sm font-bold">
                                Organization
                            </h2>

                            <div className="mt-5">
                                <label className="mb-2 block text-[10px] font-semibold text-gray-700">
                                    Brand
                                </label>

                                <select
                                    value={brand}
                                    onChange={(e) =>
                                        setBrand(
                                            e.target
                                                .value
                                        )
                                    }
                                    disabled={
                                        optionsLoading
                                    }
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-black"
                                >
                                    <option value="">
                                        {optionsLoading
                                            ? "Loading brands..."
                                            : "Select brand"}
                                    </option>

                                    {brands.map(
                                        (item) => (
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
                        </section>

                        <section className="rounded-2xl border border-gray-200 bg-white p-5">
                            <h2 className="text-sm font-bold">
                                Visibility
                            </h2>

                            <div className="mt-5 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-semibold">
                                        Visible in store
                                    </p>

                                    <p className="mt-1 text-[9px] leading-4 text-gray-400">
                                        Customers can see
                                        this product.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsVisible(
                                            !isVisible
                                        )
                                    }
                                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
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
                        </section>

                        <section className="rounded-2xl bg-black p-5 text-white">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                                    <FiImage size={16} />
                                </div>

                                <div>
                                    <h3 className="text-xs font-semibold">
                                        Image tip
                                    </h3>

                                    <p className="mt-2 text-[9px] leading-5 text-gray-400">
                                        The first uploaded
                                        image becomes
                                        your main product
                                        image. Other
                                        images are stored
                                        in the gallery.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </main>

            {/* =========================================================
                CATEGORY PICKER
            ========================================================= */}

            {categoryOpen && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
                    <div className="flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <div className="flex items-center gap-3">
                                {categoryPath.length >
                                    0 && (
                                    <button
                                        type="button"
                                        onClick={
                                            goBackCategory
                                        }
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200"
                                    >
                                        <FiChevronLeft
                                            size={15}
                                        />
                                    </button>
                                )}

                                <div>
                                    <h3 className="text-sm font-bold">
                                        Select category
                                    </h3>

                                    <p className="mt-1 text-[9px] text-gray-400">
                                        Choose the final
                                        category for
                                        your product.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeCategoryPicker
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
                            >
                                <FiX size={16} />
                            </button>
                        </div>

                        <div className="border-b border-gray-200 p-4">
                            <div className="relative">
                                <FiSearch
                                    size={15}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={
                                        categorySearch
                                    }
                                    onChange={(e) =>
                                        setCategorySearch(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Search categories..."
                                    className="h-10 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-xs outline-none focus:border-black"
                                />
                            </div>
                        </div>

                        {categoryPath.length > 0 && (
                            <div className="border-b border-gray-100 px-5 py-3">
                                <div className="flex items-center gap-1 overflow-x-auto">
                                    {categoryPath.map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <React.Fragment
                                                key={
                                                    item.id
                                                }
                                            >
                                                {index >
                                                    0 && (
                                                    <FiChevronRight
                                                        size={
                                                            11
                                                        }
                                                        className="shrink-0 text-gray-300"
                                                    />
                                                )}

                                                <span className="shrink-0 text-[9px] font-medium text-gray-500">
                                                    {
                                                        item.name
                                                    }
                                                </span>
                                            </React.Fragment>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="min-h-0 flex-1 overflow-y-auto p-4">
                            {categoryLoading ? (
                                <div className="py-10 text-center text-[10px] text-gray-400">
                                    Loading categories...
                                </div>
                            ) : categorySearch.trim() ? (
                                filteredCategories.length >
                                0 ? (
                                    <div className="space-y-2">
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
                                                        selectSearchResult(
                                                            category
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-gray-200 p-3 text-left hover:border-black hover:bg-gray-50"
                                                >
                                                    <p className="text-xs font-semibold">
                                                        {
                                                            category.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-[9px] text-gray-400">
                                                        {category.path
                                                            .map(
                                                                (
                                                                    item
                                                                ) =>
                                                                    item.name
                                                            )
                                                            .join(
                                                                " → "
                                                            )}
                                                    </p>
                                                </button>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center text-[10px] text-gray-400">
                                        No categories
                                        found.
                                    </div>
                                )
                            ) : currentCategories.length >
                              0 ? (
                                <div className="space-y-2">
                                    {currentCategories.map(
                                        (
                                            category
                                        ) => (
                                            <button
                                                key={
                                                    category.id
                                                }
                                                type="button"
                                                onClick={() =>
                                                    selectCategoryLevel(
                                                        category
                                                    )
                                                }
                                                className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-3 text-left hover:border-black hover:bg-gray-50"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-semibold">
                                                        {
                                                            category.name
                                                        }
                                                    </p>

                                                    {!category
                                                        .children
                                                        ?.length && (
                                                        <p className="mt-1 text-[9px] text-gray-400">
                                                            Final
                                                            category
                                                        </p>
                                                    )}
                                                </div>

                                                {category
                                                    .children
                                                    ?.length >
                                                    0 && (
                                                    <FiChevronRight
                                                        size={
                                                            15
                                                        }
                                                        className="shrink-0 text-gray-400"
                                                    />
                                                )}
                                            </button>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="py-10 text-center text-[10px] text-gray-400">
                                    No categories
                                    available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================
                PREVIEW
            ========================================================= */}

            {previewOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-black">
                    <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setPreviewOpen(
                                        false
                                    )
                                }
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50"
                            >
                                <FiX size={16} />
                            </button>

                            <div>
                                <p className="truncate text-xs font-bold">
                                    Product preview
                                </p>

                                <p className="hidden text-[9px] text-gray-400 sm:block">
                                    Preview how
                                    customers will see
                                    this product.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setPreviewMode(
                                        "desktop"
                                    );
                                    setPreviewImage(0);
                                }}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-semibold ${
                                    previewMode ===
                                    "desktop"
                                        ? "bg-black text-white"
                                        : "text-gray-400"
                                }`}
                            >
                                <FiMonitor size={14} />

                                <span className="hidden sm:inline">
                                    Desktop
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setPreviewMode(
                                        "mobile"
                                    );
                                    setPreviewImage(0);
                                }}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-semibold ${
                                    previewMode ===
                                    "mobile"
                                        ? "bg-black text-white"
                                        : "text-gray-400"
                                }`}
                            >
                                <FiSmartphone
                                    size={14}
                                />

                                <span className="hidden sm:inline">
                                    Mobile
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-auto bg-gray-200 p-3 sm:p-6">
                        {previewMode ===
                        "mobile" ? (
                            <div className="flex min-h-full items-start justify-center py-3 sm:py-6">
                                <div className="w-[402px] max-w-full shrink-0 overflow-hidden rounded-[34px] border-[6px] border-black bg-black shadow-2xl">
                                    <div className="flex h-7 items-center justify-center bg-white">
                                        <div className="h-1.5 w-20 rounded-full bg-black" />
                                    </div>

                                    <div className="max-h-[calc(100vh-155px)] overflow-y-auto bg-white">
                                        <ProductPreview
                                            mode="mobile"
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
                                            stock={stock}
                                            images={images}
                                            variations={
                                                variations
                                            }
                                            colors={
                                                colors
                                            }
                                            sizes={sizes}
                                            selectedCategory={
                                                selectedCategory
                                            }
                                            brand={brand}
                                            brands={brands}
                                            previewImage={
                                                previewImage
                                            }
                                            setPreviewImage={
                                                setPreviewImage
                                            }
                                        />
                                    </div>

                                    <div className="flex h-6 items-center justify-center bg-white">
                                        <div className="h-1 w-24 rounded-full bg-black" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex min-h-full min-w-[1180px] justify-center py-3 sm:py-6">
                                <ProductPreview
                                    mode="desktop"
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
                                    stock={stock}
                                    images={images}
                                    variations={
                                        variations
                                    }
                                    colors={colors}
                                    sizes={sizes}
                                    selectedCategory={
                                        selectedCategory
                                    }
                                    brand={brand}
                                    brands={brands}
                                    previewImage={
                                        previewImage
                                    }
                                    setPreviewImage={
                                        setPreviewImage
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}