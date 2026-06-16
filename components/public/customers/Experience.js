'use client';
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/shadcnUi/skeleton";
import { GetExperiencesActionPublic } from "@/app/actions/v2/public/landingPage";

export default function Experience({ fetchTrigger }) {
    const [stats, setStats] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // State untuk menandakan apakah sedang loading

    const fetchStatistics = async () => {
        setIsLoading(true); // Set loading menjadi true sebelum fetch
        try {
            const response = await GetExperiencesActionPublic();
            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch statistics');
            }
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setIsLoading(false); // Set loading menjadi false setelah fetch selesai (berhasil atau gagal)
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, []);

    useEffect(() => {
        fetchStatistics();
    }, [fetchTrigger]);

    return(
        <section className="bg-white">
            <div className="max-w-full container mx-auto px-4 md:px-16 py-8">
                {/* Grid untuk mobile dan tablet, flex untuk desktop */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading ? ( // Tampilkan skeleton jika sedang loading
                        // Skeleton Loading
                        [...Array(4)].map((_, index) => (
                            <div key={index} className="flex flex-col justify-center items-center py-8">
                                <Skeleton className="h-8 w-16 rounded-full" /> {/* Skeleton untuk angka */}
                                <Skeleton className="h-4 w-24 mt-2 rounded-full" /> {/* Skeleton untuk deskripsi */}
                            </div>
                        ))
                    ) : (
                        // Data Siap Ditampilkan
                        stats.map((stat, index) => (
                            <div
                                key={index}
                                className="flex flex-col justify-center items-center py-8"
                            >
                                <p className="text-3xl font-bold text-gray-800">{stat.number}</p>
                                <p className="text-gray-600 text-sm mt-2">{stat.description}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    )
}