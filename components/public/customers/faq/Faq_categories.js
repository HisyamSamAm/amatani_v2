"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/shadcnUi/button";
import { GetCategoriesFaqActionPublic } from "@/app/actions/v2/public/faq/faqCategoriesActions";

export default function FaqCategories({ onSelectCategory, selectedCategory }) {
    const [categories, setCategories] = useState([]);

    // Ambil data kategori dari API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await GetCategoriesFaqActionPublic();
                console.log("🚀 ~ fetchCategories ~ data:", data)

                if (data && Array.isArray(data)) {
                    // Map data dari API ke format yang sesuai
                    const formattedCategories = [
                        {
                            id: "all",
                            name: "Semua Pertanyaan",
                        },
                        ...data.map(category => ({
                            id: category.id,
                            name: category.name,
                        }))
                    ];
                    setCategories(formattedCategories);
                } else {
                    console.error("Invalid data format from API");
                    setCategories([]);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                setCategories([]);
            }
        };

        fetchCategories();
    }, [onSelectCategory, selectedCategory]);

    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold mb-4">Kategori</h2>
            {categories.map((category) => (
                <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => onSelectCategory(category.id)}
                >
                    {category.name}
                </Button>
            ))}
        </div>
    );
}