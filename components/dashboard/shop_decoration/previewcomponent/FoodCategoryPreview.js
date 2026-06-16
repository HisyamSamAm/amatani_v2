"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AspectRatio } from "@/components/shadcnUi/aspect-ratio";
import { ScrollArea, ScrollBar } from "@/components/shadcnUi/scroll-area";
import { GetFoodCategoriesAction } from "@/app/actions/v2/dashboard/admin/sd/foodCategories";

export default function FoodCategoryPreview({ refresh }) {
    const [categories, setCategories] = useState([]);

    const fetchCategories = async () => {
        try {
            const result = await GetFoodCategoriesAction();
            if (result.success) {
                setCategories(result.data);
            } else {
                console.error('Failed to fetch categories:', result.error);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [refresh]);

    return (
        <section className="w-full bg-white py-8">
            <div className="container mx-auto">
                {/* Judul */}
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
                    Kategori Pangan
                </h2>
                {/* Grid Produk */}
                <ScrollArea className="w-full">
                    <div className="flex space-x-4 p-4 w-max">
                        {Array.isArray(categories) && categories.map((category, index) => (
                            <ProductCard
                                key={index}
                                imageSrc={category.image_path}
                                categoryName={category.categories_name}
                            />
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </section>
    );
}

function ProductCard({ imageSrc, categoryName }) {
    return (
        <figure className="flex flex-col justify-start items-center flex-none w-24 md:w-32 lg:w-40 relative">
            {/* Gambar Background */}
            <AspectRatio ratio={1 / 1} className="w-full">
                <Image
                    src={imageSrc}
                    alt="Food Category"
                    fill
                    className="object-cover rounded-lg"
                    style={{ objectFit: 'cover' }}

                />
            </AspectRatio>
            {/* Label Nama Kategori */}
            <figcaption className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-2 flex justify-start items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white bg-opacity-90">
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-left text-gray-800">
                    {categoryName}
                </p>
            </figcaption>
        </figure>
    );
}