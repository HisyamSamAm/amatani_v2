// components/customer/Navbar/CategoryMenu.js
'use client';

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/shadcnUi/hover-card";
import { AlignJustify } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/shadcnUi/button";
import { useEffect, useState } from "react";
import { GetCategoriesActionPublic } from "@/app/actions/v2/public/landingPage";


export default function CategoryMenu({ isRootPath }) {
    const [Categories, SetCategories] = useState([])
    console.log("🚀 ~ CategoryMenu ~ Categories:", Categories)
    useEffect(() => {
        async function GetCategories() {
            try {
                const data = await GetCategoriesActionPublic();
                console.log("🚀 ~ GetCategories ~ data:", data);

                if (data && data.success && Array.isArray(data.data)) {
                    SetCategories(data.data); // Mengakses data.data
                } else {
                    console.error("Invalid data format from Action");
                    SetCategories([]);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                SetCategories([]);
            }
        }
        GetCategories()
    }, [])


    return (
        <HoverCard openDelay={0} closeDelay={100}>
            <HoverCardTrigger asChild>
                <div className="flex items-center space-x-4 cursor-pointer">
                    <AlignJustify className={`${isRootPath ? "text-white" : "text-gray-950"}`} />
                    <span className={`${isRootPath ? "text-white" : "text-gray-950"}`}>Kategori Produk</span>
                </div>
            </HoverCardTrigger>
            <HoverCardContent className="p-3 w-56 bg-white rounded-md shadow-md translate-x-7">
                {Categories.length > 0 ? (
                    Categories.map((category) => {
                        const formattedCategoryName = category.name.toLowerCase();
                        return (
                            <Button
                                key={category.id}
                                className="w-full text-left mt-2 text-gray-950 bg-white hover:bg-rose-100 hover:outline hover:outline-2 hover:outline-rose-600"
                                asChild
                            >
                                <Link href={`/products?category=${formattedCategoryName}`}>{category.name}</Link>
                            </Button>
                        );
                    })
                ) : (
                    <p className="text-gray-500">No categories available</p>
                )}

            </HoverCardContent>
        </HoverCard>
    );
}