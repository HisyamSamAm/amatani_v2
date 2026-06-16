"use client";

import { useEffect, useState } from 'react';
import { Skeleton } from "@/components/shadcnUi/skeleton";
import { EmptyState } from "@/components/shadcnUi/empty-state";
import { GetKategoriPanganActionPublic } from "@/app/actions/v2/public/landingPage";

export default function HomeKPangan() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true); // Mulai loading
                const response = await GetKategoriPanganActionPublic();
                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch categories');
                }
                setCategories(response.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError(error.message);
            } finally {
                setIsLoading(false); // Selesai loading
            }
        };

        fetchCategories();
    }, []);

    if (isLoading) {
        return (
            <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 bg-white">
                <div className="container mx-auto">
                    {/* Judul Skeleton */}
                    <Skeleton className="mb-4 h-6 w-48 bg-gray-200 rounded-md" />

                    {/* Grid Produk Skeleton */}
                    <div className="flex overflow-x-auto space-x-4 py-4 w-full">
                        {/* Skeleton Card (repeat as needed) */}
                        {[...Array(5)].map((_, index) => (
                            <div
                                key={index}
                                className="flex flex-col justify-start items-center flex-none w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px] xl:w-[350px] h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] relative"
                            >
                                {/* Skeleton Gambar Background */}
                                <Skeleton className="w-full h-full bg-gray-200 rounded-lg shadow-md" />
                                {/* Skeleton Label Nama Kategori */}
                                <Skeleton className="absolute bottom-2 left-2 h-6 w-24 bg-gray-100 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    }

    if (!Array.isArray(categories) || categories.length === 0) {
        return (
            <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 bg-white">
                <div className="container mx-auto">
                    <EmptyState 
                        title="Belum Ada Kategori Pangan"
                        description="Toko kami masih dalam tahap persiapan. Nantikan hasil pangan terbaik kami segera!"
                    />
                </div>
            </section>
        );
    }

    return (
        <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 bg-white">
            <div className="container mx-auto">
                {/* Judul */}
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Kategori Pangan
                </h2>
                {/* Grid Produk */}
                <div
                    className="flex overflow-x-auto space-x-4 py-4 w-full scroll-snap-x"
                    style={{ scrollSnapType: "x mandatory" }}
                >
                    {Array.isArray(categories) && categories.map((category) => (
                        <ProductCard
                            key={category.food_categories_id}
                            imageSrc={category.image_path}
                            categoryName={category.categories_name}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ProductCard({ imageSrc, categoryName }) {
    return (
        <div
            className="flex flex-col justify-start items-center flex-none w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px] xl:w-[350px] h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] relative"
            style={{ scrollSnapAlign: "center" }}
        >
            {/* Gambar Background */}
            <div
                className="w-full h-full bg-cover bg-no-repeat bg-center rounded-lg shadow-lg"
                style={{ backgroundImage: `url(${imageSrc})` }}
            ></div>
            {/* Label Nama Kategori */}
            <div className="absolute bottom-2 left-2 flex justify-start items-center px-2 py-1 rounded-full bg-white bg-opacity-90">
                <p className="text-xs sm:text-sm font-semibold text-left text-gray-800">
                    {categoryName}
                </p>
            </div>
        </div>
    );
}