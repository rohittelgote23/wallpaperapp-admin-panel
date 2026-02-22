"use client";

import { use } from "react";
import CategoryDetailsView from "@/components/categories/category-details-view";

export default function CategoryDetailsPage({
    params,
}: {
    params: Promise<{ categoryId: string }>;
}) {
    const { categoryId } = use(params);
    return <CategoryDetailsView categoryId={categoryId} />;
}
