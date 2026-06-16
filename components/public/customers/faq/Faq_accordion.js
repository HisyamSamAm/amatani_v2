"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/shadcnUi/accordion";
import { GetCategoriesFaqActionPublic } from "@/app/actions/v2/public/faq/faqCategoriesActions";
import { GetFaqActionPublic } from "@/app/actions/v2/public/faq/faqActions";

export default function FaqAccordion({ searchTerm, selectedCategory }) {
    const [faqItems, setFaqItems] = useState([]);

    // Fungsi untuk mengambil data FAQ dari API
    const fetchFaqs = useCallback(async () => {
        try {
            let categoryName = null;

            // Tambahkan parameter kategori jika kategori dipilih (selain "all")
            if (selectedCategory !== "all" && selectedCategory) {
                // Fetch data kategori dari API
                const dataCategory = await GetCategoriesFaqActionPublic();

                if (dataCategory && Array.isArray(dataCategory)) {
                    // Cari nama kategori berdasarkan ID
                    categoryName = dataCategory.find(cat => cat.category_id === selectedCategory)?.category_name;
                }
            }

            const data = await GetFaqActionPublic({ category: categoryName, search: searchTerm });
            console.log("🚀 ~ fetchFaqs ~ data:", data);

            if (data && Array.isArray(data)) {
                setFaqItems(data);
            } else {
                console.error("Invalid data format from API");
                setFaqItems([]);
            }
        } catch (error) {
            console.error("Failed to fetch FAQs:", error);
            setFaqItems([]);
        }
    }, [searchTerm, selectedCategory]);

    // Efek untuk memanggil fetchFaqs setiap kali searchTerm atau selectedCategory berubah
    useEffect(() => {
        fetchFaqs();
    }, [fetchFaqs]);

    return (
        <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
                <AccordionItem key={item.id} value={`item-${item.id}`}>
                    <AccordionTrigger className="w-full">{item.title}</AccordionTrigger>
                    <AccordionContent className="w-full">{item.content}</AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}