"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from "@/components/shadcnUi/card";
import { AspectRatio } from "@/components/shadcnUi/aspect-ratio";
import { AlertCircle, AlignJustify, ChevronDown, Filter, Search, X } from "lucide-react"; // Ikon untuk fallback
import { Input } from "@/components/shadcnUi/input";
import { Button } from "@/components/shadcnUi/button";
import Image from "next/image";
import Link from "next/link";
import CategoryMenu from '@/components/public/customers/Navbar/CategoryMenu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/shadcnUi/hover-card';
import { Skeleton } from "@/components/shadcnUi/skeleton"; // Import Skeleton component
import { GetProductActionPublic } from '@/app/actions/v2/public/product/productActions';
import { GetCategoriesActionPublic } from '@/app/actions/v2/public/landingPage';

export default function Product() {
    const [productsData, setProductsData] = useState([]);
    console.log("🚀 ~ Product ~ productsData:", productsData)
    const [categoryName, setCategoryName] = useState('');
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true); // State untuk mengontrol loading

    const categoriesQuery = searchParams.get('category');
    const productsQuery = searchParams.get('products');
    const search = searchParams.get('search');
    const query = categoriesQuery || productsQuery || search || '';
    const type = categoriesQuery ? 'categories' : (productsQuery ? 'products' : 'search');
    const formattedQuery = categoriesQuery;

    console.log('Formatted Query:', formattedQuery);
    console.log('Query:', query);
    console.log('Type:', type);

    useEffect(() => {


        async function fetchProducts() {
            setIsLoading(true); // Mulai loading sebelum fetch

            try {
                const data = await GetProductActionPublic({ category: formattedQuery, search });

                if (data && !data.error) {
                    setProductsData(data);
                    if (data.length > 0) {
                        setCategoryName(categoriesQuery ? data[0].name : 'Semua Produk');
                    } else {
                        setCategoryName(categoriesQuery ? formattedQuery : 'Semua Produk');
                    }
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setIsLoading(false); // Selesai loading setelah fetch (berhasil atau gagal)
            }
        }

        fetchProducts();
    }, [search]);
    useEffect(() => {

        // Fungsi untuk menghapus query params saat reload
        const clearQueryParams = () => {
            const currentUrl = window.location.origin + window.location.pathname;
            router.replace(currentUrl);
        };

        // Panggil fungsi saat komponen di-mount
        clearQueryParams();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };
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
        <div className="mx-auto px-4 md:px-16">
            {/* Mobile & Medium Layout */}
            <div className="flex mt-4 flex-col gap-2 lg:hidden">

                {/* Search Input */}
                <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
                    <div className="relative flex items-center w-full">
                        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground pointer-events-none" />
                        <Input
                            type="text"
                            placeholder="Cari produk"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-8 rounded-full"
                        />
                        <Button
                            size="icon"
                            className="bg-transparent hover:bg-transparent hover:text-gray-800 shadow-none absolute right-1 top-1/2 -translate-y-1/2 transform"
                        >
                            <X className="h-4 w-4 text-gray-950" />
                        </Button>
                    </div>
                    <Button type="submit" className="bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-full">
                        Cari
                    </Button>
                </form>

                {/* Tombol Semua Produk
                <Button variant="outline" className="w-full my-2">
                    <Link href="/products?all_product=true">Semua Produk</Link>
                </Button> */}

                {/* Hasil Pencarian, Filter, dan Sort By */}
                <div className="flex justify-between items-center w-full">
                    <p className="text-xl font-semibold text-gray-800">
                        {categoryName ? categoryName : 'Semua Produk'} ({productsData.length})
                    </p>
                    {/* <div className="flex items-center gap-4">
                        <Button className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100">
                            <Filter className="w-4 h-4 text-gray-950" />
                            <span className="text-gray-950">Filter</span>
                        </Button>
                        <Button className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100">
                            <span className="text-gray-950">Short By</span>
                            <ChevronDown className="w-4 h-4 text-gray-950" />
                        </Button>
                    </div> */}
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex lg:flex-row lg:justify-between lg:items-center lg:w-full py-4">
                <div>
                    <p className="text-sm text-gray-800">Hasil pencarian:</p>
                    <p className="text-xl font-semibold text-gray-800">
                        {categoryName ? categoryName : 'Semua Produk'} ({productsData.length})
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    {/* <Button variant="outline">
                        <Link href="/products?all_product=true">Semua Produk</Link>
                    </Button> */}
                    {/* Search Input */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 flex-grow lg:flex-grow-0 w-full lg:w-auto">
                        <div className="relative flex items-center w-full lg:w-[300px]">
                            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground pointer-events-none" />
                            <Input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-8 rounded-full"
                            />
                            <Button
                                size="icon"
                                className="bg-transparent hover:bg-transparent hover:text-gray-800 shadow-none absolute right-1 top-1/2 -translate-y-1/2 transform"
                            >
                                <X className="h-4 w-4 text-gray-950" />
                            </Button>
                        </div>
                        <Button type="submit" className="bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-full">
                            <Search className="w-4 h-4 mr-2" />
                            Cari
                        </Button>
                    </form>
                    {/* Filter dan Sort By Buttons */}
                    {/* <div className="flex items-center gap-2">
                        <Button className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100">
                            <Filter className="w-4 h-4 text-gray-950" />
                            <span className="text-gray-950">Filter</span>
                        </Button>
                        <Button className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100">
                            <span className="text-gray-950">Sort By</span>
                            <ChevronDown className="w-4 h-4 text-gray-950" />
                        </Button>
                    </div> */}
                </div>
            </div>

            {/* Grid Produk */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
                {isLoading ? (
                    // Tampilkan skeleton loading saat isLoading bernilai true
                    [...Array(8)].map((_, i) => ( // Membuat 8 skeleton card
                        <div key={i} className="w-full">
                            <Card className="w-full border-0 shadow-none">
                                <CardHeader className="p-0">
                                    <AspectRatio ratio={1 / 1}>
                                        <Skeleton className="w-full h-full rounded-none" />
                                    </AspectRatio>
                                </CardHeader>
                                <CardContent className="space-y-2 p-4">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-1/3" />
                                </CardContent>
                            </Card>
                        </div>
                    ))
                ) : productsData.length > 0 ? (
                    // Tampilkan data produk jika ada dan tidak sedang dalam keadaan loading
                    productsData.map((product) => (
                        <ProductCard
                            key={product.id}
                            imageSrc={product.images[0] || "/placeholder-image.png"}
                            name={product.name || "Nama tidak tersedia"}
                            category={product.name || "Kategori tidak tersedia"}
                            priceType={product.price_type}
                            fixedPrice={product.price}
                            wholesalePrices={product.wholesale_prices || []}
                            product_id={product.id}
                            stock={product.stock}
                        />
                    ))
                ) : (
                    <NoProduct />
                )}
            </div>
        </div>
    );
}

function ProductCard({ imageSrc, name, category, priceType, fixedPrice, wholesalePrices, product_id, stock }) {
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

    const cardContent = (
        <Card className="w-full border-0 shadow-none">
            <CardHeader className="p-0">
                <AspectRatio ratio={1 / 1}>
                    <Image
                        width={200}
                        height={200}
                        src={imageSrc.startsWith('http') 
                            ? imageSrc 
                            : "/placeholder-image.png"}
                        alt={name}
                        className={`object-cover w-full h-full ${stock === 0 ? 'grayscale' : ''}`}
                    />
                    {stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <span className="text-white text-2xl font-bold">Stok Habis</span>
                        </div>
                    )}
                </AspectRatio>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
                <p className="text-lg font-semibold text-gray-800">{name}</p>
                <p className="text-sm text-gray-500">{category}</p>
                <p className="text-base font-bold text-rose-600">{priceRange}</p>
            </CardContent>
        </Card>
    );

    return stock === 0 ? (
        <div className="pointer-events-none">{cardContent}</div>
    ) : (
        <Link href={`/products/${product_id}`}>{cardContent}</Link>
    );
}

function NoProduct() {
    return (
        <Card className="flex items-center justify-center w-full h-64 bg-gray-100">
            <div className="flex flex-col items-center text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-gray-500" />
                <p className="text-gray-500">Tidak ada produk!</p>
            </div>
        </Card>
    );
}