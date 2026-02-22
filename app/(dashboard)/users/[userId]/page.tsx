"use client";

import { use } from "react";
import UserDetailsView from "@/components/users/user-details-view";

export default function UserInfoPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params);
    return <UserDetailsView userId={userId} />;
}
