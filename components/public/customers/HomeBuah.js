"use client";

import { useEffect, useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/shadcnUi/scroll-area";
import { Card, CardHeader, CardContent } from "@/components/shadcnUi/card";
import { AspectRatio } from "@/components/shadcnUi/aspect-ratio";
import { AlertCircle } from "lucide-react"; // Ikon untuk fallback
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/shadcnUi/skeleton";
import { EmptyState } from "@/components/shadcnUi/empty-state";
import { GetAllProductPublic } from "@/app/actions/v2/public/landingPage";

export default function HomeBuah() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const maxRetries = 3;

    useEffect(() => {
        async function fetchProducts(retryCount = 0) {
            try {
                setIsLoading(true);
                const result = await GetAllProductPublic();
                if (!result.success) {
                    throw new Error(result.error || 'Failed to fetch products');
                }
                const data = result;
                console.log("Data Kategori:", data);
                console.log("Jumlah Kategori:", data.data?.length);
                setCategories(data.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching products:", error);
                if (retryCount < maxRetries) {
                    // Tunggu sebentar sebelum mencoba lagi
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return fetchProducts(retryCount + 1);
                }
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProducts();
    }, []);

    if (isLoading) {
        return (
            <section className="py-8 px-16 bg-white">
                <div className="container mx-auto">
                    <div className="flex flex-col gap-y-8">
                        {/* Skeleton Loading */}
                        {[...Array(3)].map((_, categoryIndex) => (
                            <div key={categoryIndex} className="gap-y-4">
                                <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                                    <Skeleton className="h-6 w-48" />
                                </h2>
                                <ScrollArea>
                                    <div className="flex gap-4">
                                        {[...Array(5)].map((_, productIndex) => (
                                            <div key={productIndex} className="flex-shrink-0 w-80">
                                                <Card className="border-none shadow-none">
                                                    <CardHeader className="p-0">
                                                        <AspectRatio ratio={1}>
                                                            <Skeleton className="w-full h-full rounded-md" />
                                                        </AspectRatio>
                                                    </CardHeader>
                                                    <CardContent className="space-y-2 p-4">
                                                        <Skeleton className="h-4 w-52" />
                                                        <Skeleton className="h-4 w-40" />
                                                        <Skeleton className="h-4 w-32" />
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        ))}
                                    </div>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">Error: {error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    if (!Array.isArray(categories) || categories.length === 0) {
        return (
            <section className="py-8 px-4 md:px-16">
                <div className="max-w-full container mx-auto">
                    <EmptyState 
                        title="Belum Ada Produk"
                        description="Toko kami masih bersiap-siap untuk panen. Mohon kembali lagi nanti untuk melihat produk segar kami."
                    />
                </div>
            </section>
        );
    }

    return (
        <section className="py-8 px-4 md:px-16">
            <div className="max-w-full container mx-auto ">
                {/* Scrollable Area */}
                <div className="flex flex-col gap-y-8">
                    {Array.isArray(categories) && categories.map((category, index) => (
                        <div key={category.id} className={index > 0 ? "gap-y-4" : "gap-y-0"}>
                            {/* Tambahkan judul kategori */}
                            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-800">
                                {category.name}
                            </h2>

                            {category.products && category.products.length > 0 && (
                                <ScrollArea>
                                    <div className="flex gap-4">
                                        {category.products.map((product) => (
                                            <ProductCard
                                                key={product.product_id}
                                                product_id={product.product_id}
                                                imageSrc={product.images?.[0] || "/placeholder-image.png"}
                                                name={product.name || "Nama tidak tersedia"}
                                                category={category.name}
                                                priceType={product.price_type}
                                                fixedPrice={product.fixed_price}
                                                wholesalePrices={product.wholesale_prices || []}
                                            />
                                        ))}
                                    </div>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ProductCard({ product_id, imageSrc, name, category, priceType, fixedPrice, wholesalePrices }) {
    let priceRange;

    if (priceType === 'wholesale' && wholesalePrices && wholesalePrices.length > 0) {
        const prices = wholesalePrices.map(price => price.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (minPrice === maxPrice) {
            priceRange = `Rp ${minPrice.toLocaleString()}`;
        } else {
            priceRange = `Rp ${minPrice.toLocaleString()} - Rp ${maxPrice.toLocaleString()}`;
        }
    } else if (priceType === 'fixed' && fixedPrice !== null) {
        priceRange = `Rp ${Number(fixedPrice).toLocaleString()}`;
    } else {
        priceRange = "Harga tidak tersedia";
    }

    return (
        <Link href={`/products/${product_id}`}>
            <Card className="flex-shrink-0 w-40 sm:w-60 md:w-72">
                <CardHeader className="p-0">
                    <AspectRatio ratio={1}>
                        <Image
                            src={imageSrc}
                            alt={name}
                            className="object-cover w-full h-full"
                            width={200}
                            height={200}
                        />
                    </AspectRatio>
                </CardHeader>
                <CardContent className="space-y-2 p-4">
                    <p className="text-sm md:text-lg font-semibold text-gray-800">{name}</p>
                    <p className="text-xs md:text-sm text-gray-500">{category}</p>
                    <p className="text-xs md:text-base font-bold text-rose-600">{priceRange}</p>
                </CardContent>
            </Card>
        </Link>
    );
}