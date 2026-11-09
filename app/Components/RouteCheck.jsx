"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

import ProductFilter from "./ProductFilter";
import ProductDetail from "./ProductDetail";
import NotFound from "./NotFound";
import CollectionView from "./CollectionView";
import GeneralLoading from "./Include/GeneralLoading";

const RouteCheck = ({ slug }) => {

    const { data: route, isLoading, isError } = useQuery({
        queryKey: ["routeCheck", slug],
        queryFn: async () => {
            const res = await api.get(`/api/pages/${slug}/`);
            return res.data;
        },
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) return <GeneralLoading />;

    if (isError || route?.route === "No route") {
        return <NotFound />;
    }

    switch (route?.route) {
        case "product":
            return <ProductDetail slug={slug} />;

        case "category":
            return <ProductFilter slug={slug} />;

        case "collection":
            return <CollectionView slug={slug} />;

        default:
            return <NotFound />;
    }
};

export default RouteCheck;