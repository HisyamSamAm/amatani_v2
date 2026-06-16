"use client"

import { Minus, Plus, Search, Star, Truck, X, Heart } from "lucide-react";
import CarouselWithThumbnails from "./CarouselImages";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/shadcnUi/accordion";
import { Input } from "@/components/shadcnUi/input";
import { Button } from "@/components/shadcnUi/button";
import { Separator } from "@/components/shadcnUi/separator";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/shadcnUi/form";
import { z } from "zod";
import { useEffect, useState, useTransition } from "react";
import { useCart } from "../../Navbar/CartContext";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Skeleton } from "@/components/shadcnUi/skeleton";
import { GetProductDetailActionCustomers } from "@/app/actions/v2/public/product/productActions";
import { AddToCartCustomers } from "@/app/actions/v2/customer/cartActions";

const formSchema = z.object({
    quantity: z.number().min(1, "Quantity must be at least 1"),
});

export default function ProductDetailComponent({ product_id }) {
    // State untuk data produk dan loading state
    const [productsData, setProductsData] = useState(null);
    console.log("🚀 ~ ProductDetailComponent ~ productsData:", productsData)
    const [isLoading, setIsLoading] = useState(true);
    const { userId, setUserId, fetchCartCount } = useCart();
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Inisialisasi React Hook Form dengan Zod resolver
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quantity: 1,
        },
    });

    // Fetch data produk berdasarkan product_id dengan error handling
    useEffect(() => {
        async function fetchProducts(product_id) {
            try {
                const result = await GetProductDetailActionCustomers({ product_id });
                if (result && result.length > 0) {
                    setProductsData(result[0]);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
            setIsLoading(false);
        }
        fetchProducts(product_id);
    }, [product_id]);
    // Fungsi submit untuk form add-to-cart
    useEffect(() => {
        // Efek ini akan dijalankan saat komponen di-mount atau productsData berubah
        setIsLoading(true); // Mulai loading
        if (productsData) {
            setIsLoading(false); // Selesai loading jika productsData tersedia
        }
    }, [productsData]);

    // Fetch cart count jika userId tersedia
    useEffect(() => {
        if (userId) {
            fetchCartCount(userId);
        }
    }, [userId, fetchCartCount]);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 sm:px-4 md:px-16 lg:px-16 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                    {/* Skeleton Carousel Section */}
                    <div className="order-1 lg:order-1 lg:col-span-7">
                        <div className="bg-white rounded-lg p-4 flex flex-col-reverse lg:flex-row gap-4">
                            {/* Thumbnail Skeletons (6 gambar) */}
                            <div className="flex lg:flex-col items-center gap-2">
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton key={i} className="w-16 h-16 rounded-lg" />
                                ))}
                            </div>
                            {/* Main Image Skeleton */}
                            <div className="flex-1">
                                <Skeleton className="w-full h-[400px] rounded-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Skeleton Product Details Section */}
                    <div className="order-2 lg:order-2 lg:col-span-3 lg:sticky lg:top-4">
                        <div className="bg-white rounded-lg p-4 flex flex-col gap-6">
                            {/* Judul Produk Skeleton */}
                            <Skeleton className="h-10 w-full rounded-full" />
                            {/* Price Tiers Skeleton */}
                            <div className="grid grid-cols-3 gap-4 text-center w-full">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <Separator className="w-full" />
                            {/* Quantity Selector & Action Buttons Skeleton */}
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-14 h-10 rounded-full" />
                                <Skeleton className="flex-1 h-10" />
                                <Skeleton className="w-14 h-10 rounded-full" />
                            </div>
                            <div className="flex flex-col gap-4">
                                <Skeleton className="w-full h-12 rounded-full" />
                                <Skeleton className="w-full h-12 rounded-full" />
                            </div>
                            {/* Shipping Info Skeleton */}
                            {/* <div className="flex items-center gap-3 text-gray-500">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="w-24 h-4" />
              </div> */}
                        </div>
                    </div>

                    {/* Skeleton Product Description Section */}
                    <div className="order-3 lg:order-3 lg:col-span-7">
                        <div className="bg-white rounded-lg p-4 flex flex-col gap-4">
                            <Skeleton className="h-8 w-1/2 rounded" /> {/* Judul deskripsi */}
                            <Skeleton className="h-8 w-full rounded" />
                            <Skeleton className="h-24 w-full rounded" /> {/* Isi deskripsi */}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Mapping gambar untuk Carousel, jika ada
    const images = productsData?.images
        ? productsData.images.map((img) => ({
            src: img,
            alt: productsData.name,
        }))
        : [];

    const onSubmit = (data) => {
        startTransition(async () => {
            try {
                if (!userId) {
                    router.push('/login')
                    return
                }

                const result = await AddToCartCustomers({ 
                    product_id: productsData.id, 
                    quantity: data.quantity,
                    user_id: userId 
                })

                console.log("🚀 ~ startTransition ~ result:", result)

                if (!result.success) {
                    throw new Error(result.error || 'Failed to add to cart')
                }

                console.log('Added to cart successfully')
                if (userId) {
                    fetchCartCount(userId)
                } else if (result.data.user_id) {
                    setUserId(result.data.user_id)
                    fetchCartCount(result.data.user_id)
                }
            } catch (error) {
                console.error('Error adding to cart:', error)
            }
        })
    }



    // Mengurangi quantity
    const handleMinus = () => {
        const currentValue = form.getValues("quantity");
        if (currentValue > 1) {
            form.setValue("quantity", currentValue - 1);
        }
    };

    // Menambah quantity
    const handlePlus = () => {
        const currentValue = form.getValues("quantity");
        form.setValue("quantity", currentValue + 1);
    };

    // Menangani perubahan input quantity
    const handleChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value !== "") {
            const numValue = Number.parseInt(value);
            if (numValue >= 1) {
                form.setValue("quantity", numValue);
            }
        }
    };

    // Jika wholesale_prices ada, mapping ke variabel untuk ditampilkan
    const wholesalePrices = Array.isArray(productsData?.wholesale_prices) ? productsData.wholesale_prices : [];

    return (
        <div className="max-w-full container mx-auto px-4 sm:px-4 md:px-16 lg:px-16 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                {/* Carousel Section */}
                <div className="order-1 lg:order-1 lg:col-span-7">
                    <CarouselWithThumbnails images={images} />
                </div>
                {/* Product Details Section */}
                <div className="order-2 lg:order-2 lg:col-span-3 lg:sticky lg:top-4">
                    <h1 className="text-3xl font-bold mb-4">{productsData.name}</h1>
                    <div className="space-y-6 w-full">
                        <Separator />
                        <div className="flex justify-around text-center">
                            {productsData.price_type === "fixed" ? (
                                <div className="text-center">
                                    <div className="text-sm text-muted-foreground">Harga</div>
                                    <div className="font-semibold text-2xl">Rp {productsData.fixed_price}</div>
                                </div>
                            ) : (
                                wholesalePrices.map((price, index) => (
                                    <div key={index} className="text-center">
                                        <div className="text-sm text-muted-foreground">
                                            {price.max_quantity === null
                                                ? `> ${price.min_quantity} kg`
                                                : `${price.min_quantity} - ${price.max_quantity === Number.POSITIVE_INFINITY ? "∞" : price.max_quantity} kg`}
                                        </div>
                                        <div className="font-semibold">Rp {price.price}</div>
                                    </div>
                                ))
                            )}
                        </div>
                        <Separator />
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Quantity Form */}
                                <div className="flex items-center gap-2">
                                    <Button type="button" variant="outline" size="icon" onClick={handleMinus}>
                                        <Minus className="h-4 w-4" />
                                    </Button>

                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                    <Input {...field} onChange={handleChange} className="text-center" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="button" variant="outline" size="icon" onClick={handlePlus}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base bg-rose-600 hover:bg-rose-700 rounded-full"
                                        disabled={isPending}
                                    >
                                        {isPending ? "Adding..." : "Tambah Ke Keranjang"}
                                    </Button>
                                    <Button type="button" variant="outline" className="w-full h-12 text-base rounded-full">
                                        <Heart className="w-4 h-4 mr-2" />
                                        Tambah Ke Favorit
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
                {/* Product Description, Attributes and Reviews Section */}
                <div className="order-3 lg:order-3 lg:col-span-7">
                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4">Deskripsi Produk</h2>
                        <p className="text-gray-600">{productsData.products_description}</p>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4">Atribut Produk</h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="attributes">
                                <AccordionTrigger>Lihat Atribut</AccordionTrigger>
                                <AccordionContent>
                                    <div className="p-4 bg-muted rounded-lg">
                                        <table className="w-full">
                                            <tbody>
                                                <tr>
                                                    <td className="py-2">Stock</td>
                                                    <td className="py-2">{productsData.stock}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2">Kategori</td>
                                                    <td className="py-2">{productsData.categories_name}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4">Nilai dan Ulasan</h2>
                        <div className="flex items-center mb-4">
                            <div className="flex items-center">
                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                <Star className="w-5 h-5 text-gray-300 fill-current" />
                            </div>
                            <span className="ml-2 text-gray-600">4.0 out of 5</span>
                        </div>
                        <p className="text-gray-600">No reviews yet. Be the first to leave a review!</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
