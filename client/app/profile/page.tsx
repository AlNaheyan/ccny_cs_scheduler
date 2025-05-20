"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Nav from "@/components/Nav";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface UserProfile {
	name: string;
	avatar_url: string;
	email: string;
}

export default function ProfilePage() {
	const { isSignedIn, isLoaded } = useUser();
	const router = useRouter();
	const [profile, setProfile] = useState<UserProfile | null>(null);

	useEffect(() => {
		if (isLoaded && !isSignedIn) {
			router.push("/sign-in");
		}
	}, [isLoaded, isSignedIn, router]);

	useEffect(() => {
        const fetchProfile = async () => {
            const res = await fetch("/api/profile");
            if (!res.ok) {
                console.error("Failed to load profile");
                return;
            }
            const data = await res.json();
            if (data?.name) {
                setProfile(data);
            } else {
                console.warn("No profile data found");
                setProfile(null); // optional: keep null or show error message
            }
        };
    
        if (isLoaded && isSignedIn) {
            fetchProfile();
        }
    }, [isLoaded, isSignedIn]);

	if (!isSignedIn) return null;

	return (
		<div className="min-h-screen bg-white text-black p-10">
			<Nav />

			<div className="max-w-3xl mx-auto mt-20 border rounded-lg p-6 bg-gray-50 shadow-md">
				<h1 className="text-3xl font-bold mb-6">Student Profile</h1>

				{!profile ? (
					<p>Loading profile...</p>
				) : (
					<div className="space-y-4">
						<Image
							src={profile.avatar_url}
							alt="Profile"
							width={96}
							height={96}
							className="w-24 h-24 rounded-full object-cover"
						/>
						<p>
							<strong>Name:</strong> {profile.name}
						</p>
						<p>
							<strong>Email:</strong> {profile.email}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
