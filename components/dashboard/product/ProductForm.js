import React, { useCallback, useEffect, useState, useTransition } from 'react';
import { GetCategoriesAction } from '@/app/actions/v2/dashboard/admin/products/categoriesActions';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from "@/components/shadcnUi/input";
import { Button } from "@/components/shadcnUi/button";
import { Textarea } from "@/components/shadcnUi/textarea";
import { Label } from "@/components/shadcnUi/label";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/shadcnUi/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/shadcnUi/form";
import { RadioGroup, RadioGroupItem } from "@/components/shadcnUi/radio-group";
import { ProductImageUpload } from "@/components/dashboard/product/DropProductImage";
import { Trash2, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcnUi/card';
import { Separator } from '@/components/shadcnUi/separator';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { ScrollArea } from "@/components/shadcnUi/scroll-area"

// Define the form schema using Zod for validation
const formSchema = z.object({
    products_name: z.string().min(1, { message: "Tidak boleh kosong" }),
    category: z.object({
        categories_id: z.string().min(1, { message: "Kategori produk harus dipilih" }),
        categories_name: z.string().min(1, { message: "Kategori produk harus dipilih" }),
    }),
    stock: z.coerce.number().min(1, { message: "Harus lebih dari 0" }),
    product_id: z.string().min(0, { message: "Product Id tidak di temukan" }),
    products_description: z.string().min(1, { message: "Tidak boleh kosong" }),
    price_type: z.enum(["fixed", "wholesale"]),
    fixed_price: z.coerce.number().nullable(),
    wholesalePrices: z.array(z.object({
        min_quantity: z.number(),
        max_quantity: z.number().nullable(),
        price: z.number()
    })).nullable(),
    product_images: z.array(z.any()).min(1, { message: "Setidaknya ada 1 gambar produk" }),
}).superRefine((data, ctx) => {
    if (data.price_type === 'fixed') {
        if (!data.fixed_price || data.fixed_price <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Harga tetap harus diisi dan lebih besar dari 0",
                path: ["fixed_price"],
            });
        }
    } else if (data.price_type === 'wholesale') {
        if (!data.wholesalePrices || data.wholesalePrices.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Harga grosir harus diisi",
                path: ["wholesalePrices"],
            });
        }

        if (data.wholesalePrices) {
            data.wholesalePrices.forEach((price, index) => {
                if (!price.price || price.price <= 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Harga harus lebih besar dari 0",
                        path: ["wholesalePrices", index, "price"],
                    });
                }
                if (price.min_quantity < 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Kuantitas minimum tidak boleh negatif",
                        path: ["wholesalePrices", index, "min_quantity"],
                    });
                }
            });
        }
    }
});

// Define the ProductForm component
export default function ProductForm({ mode, product, onSubmit }) {

    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    // State for product preview
    const [productPreview, setProductPreview] = useState({
        products_name: '',
        products_description: '',
        stock: 0,
        category: { categories_id: '', categories_name: '' },
        price_type: 'fixed',
        fixed_price: 0,
        wholesalePrices: [],
        product_images: [],
    });

    // Initialize the form using useForm hook
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            product_id: '',
            products_name: '',
            products_description: '',
            stock: 0,
            category: { categories_id: '', categories_name: '' },
            price_type: 'fixed',
            fixed_price: 0,
            wholesalePrices: [],
            product_images: []
        }
    });

    // Watch the price_type field
    const price_type = useWatch({
        control: form.control,
        name: "price_type",
    });

    // State for categories
    const [categories, setCategories] = useState([]);

    // Update product preview when form values change
    useEffect(() => {
        const subscription = form.watch((value) => {
            setProductPreview(value);
        });
        return () => subscription.unsubscribe();
    }, [form]);

    // Fetch categories data from API
    useEffect(() => {
        async function GetData() {
            try {
                const result = await GetCategoriesAction();
                if (result.success && Array.isArray(result.data)) {
                    setCategories(result.data);
                } else {
                    console.error("Fetched data is not an array:", result);
                    setCategories([]);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                setCategories([]);
            }
        }
        GetData();
    }, []);

    // Populate form with product data when in edit mode
    useEffect(() => {
        if (mode === 'edit' && product && categories.length > 0) {
            // Check if the category exists in the categories data
            const categoryExists = categories.some(
                (category) => category.id === product.category_id
            );

            // If the category exists, set the form values
            if (categoryExists) {
                form.setValue("product_id", product.id);
                form.setValue("products_name", product.name);
                form.setValue("category", {
                    categories_id: product.category_id.toString(),
                    categories_name: product.category_name,
                });
                form.setValue("stock", product.stock);
                form.setValue("products_description", product.description);
                form.setValue("price_type", product.price_type);
                form.setValue("fixed_price", product.price_type === 'fixed' ? Number(product.fixed_price) : 0);
                form.setValue(
                    "wholesalePrices",
                    product.price_type === 'wholesale' ? product.wholesale_prices : [{ min_quantity: 0, max_quantity: 0, price: 0 }]
                );
                form.setValue("product_images", product.images);
            } else {
                // If the category does not exist, display a warning and set a default category
                console.warn(`Category with ID ${product.category_id} not found in categories data.`);
                toast.error(`Kategori dengan ID ${product.category_id} tidak ditemukan. Silakan pilih kategori lain.`);
                form.setValue("category", { categories_id: "", categories_name: "Tidak ada kategori" });
            }
        }
    }, [mode, product, categories, form]);

    // Handle changes based on the price type
    useEffect(() => {
        if (price_type === 'fixed') {
            form.setValue("wholesalePrices", null);
            form.setValue("fixed_price", form.getValues("fixed_price") || 0);
        } else if (price_type === 'wholesale') {
            form.setValue("fixed_price", null);
            const currentWholesalePrices = form.getValues("wholesalePrices");
            if (!currentWholesalePrices || !Array.isArray(currentWholesalePrices) || currentWholesalePrices.length === 0) {
                form.setValue("wholesalePrices", [{ min_quantity: 0, max_quantity: 0, price: 0 }]);
            }
        }
    }, [price_type, form]);

    // Function to add a wholesale price
    const addWholesalePrice = () => {
        form.setValue("wholesalePrices", [...form.watch("wholesalePrices"), { min_quantity: 0, max_quantity: 0, price: 0 }]);
    };

    // Function to add a wholesale price with no max quantity
    const addMoreThanQuantity = () => {
        form.setValue("wholesalePrices", [...form.watch("wholesalePrices"), { min_quantity: 0, max_quantity: null, price: 0 }]);
    };

    // Function to remove a wholesale price
    const removeWholesalePrice = (index) => {
        const wholesalePrices = form.watch("wholesalePrices");
        if (wholesalePrices.length > 1 && index > 0) {
            wholesalePrices.splice(index, 1);
            form.setValue("wholesalePrices", [...wholesalePrices]);
        }
    };

    // Handle form submission
    const handleSubmit = async (data) => {
        startTransition(async () => {
            try {
                const toastId = toast.loading("Sedang memperbarui produk...");

                if (mode === 'edit') {
                    data.product_id = product.id;
                }
                const result = await onSubmit(data);
                // Menampilkan toast sukses jika operasi berhasil
                if (result?.success) {
                    toast.success(mode === 'add' ? "Produk berhasil ditambahkan" : "Produk berhasil diperbarui", { id: toastId });
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast.error(error.message);
            }
        });
    };

    // Show loading state when in edit mode and product data is not yet loaded
    if (mode === 'edit' && !product) {
        return <div>Loading...</div>;
    }

    // Render the form
    return (
        <>
            <div className="w-2/4 flex gap-x-16">
                <Toaster position="top-right" expand={false} />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full ">
                        <div className="sticky top-0 py-6 bg-white z-10 flex justify-between items-center pb-4">
                            <h1 className="text-xl font-semibold">{mode === 'add' ? 'Tambah Produk' : 'Edit Produk'}</h1>
                            <div className="flex gap-3">
                                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" variant="default" className="bg-rose-600 hover:bg-rose-700" disabled={isPending}>
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {mode === 'add' ? 'Menambahkan...' : 'Menyimpan...'}
                                        </>
                                    ) : (
                                        mode === 'add' ? 'Tambah' : 'Perbarui'
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="container mx-auto space-y-12">
                            <input type="hidden" {...form.register("product_id")} />
                            <Separator />
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold">Informasi Produk</h2>
                                <FormField
                                    control={form.control}
                                    name="products_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Produk</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Pisang muli" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kategori Produk</FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={(value) => {
                                                        const selectedCategory = categories.find(category => category.id.toString() === value);
                                                          field.onChange(selectedCategory ? { categories_id: selectedCategory.id.toString(), categories_name: selectedCategory.name } : { categories_id: "", categories_name: "" });
                                                    }}
                                                    value={field.value.categories_id || undefined}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih Kategori" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map(category => (
                                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stock</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="100"
                                                    className="flex-1"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (!isNaN(value)) {
                                                            field.onChange(Number(value));
                                                        } else {
                                                            field.onChange(0);
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="products_description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Deskripsi Produk</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Masukkan Deskripsi Produk"
                                                    {...field}
                                                    onInput={(e) => {
                                                        e.target.style.height = 'auto';
                                                        e.target.style.height = `${e.target.scrollHeight}px`;
                                                    }}
                                                    style={{ overflow: 'hidden' }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Separator />
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold">Gambar Produk</h2>
                                <FormField
                                    control={form.control}
                                    name="product_images"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <ProductImageUpload
                                                    mode={mode}
                                                    onChange={field.onChange}
                                                    value={field.value}
                                                    error={form.formState.errors.product_images?.message}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Separator />
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold">Harga Produk</h2>
                                <FormField
                                    control={form.control}
                                    name="price_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type Harga </FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    {...field}
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    className="flex space-x-4"
                                                >
                                                    <div className={`flex-1 ${price_type === "wholesale" ? "border-gray-600" : "border-gray-200 text-gray-500"} border-2 rounded-md overflow-hidden`}>
                                                        <RadioGroupItem value="wholesale" id="wholesale" className="sr-only" />
                                                        <Label
                                                            htmlFor="wholesale"
                                                            className={`flex items-center justify-center w-full h-full py-2 px-4 cursor-pointer ${price_type === "wholesale" ? "" : "bg-white hover:bg-gray-50"
                                                                }`}
                                                        >
                                                            Harga Grosir
                                                        </Label>
                                                    </div>
                                                    <div className={`flex-1 ${price_type === "fixed" ? "border-gray-600" : "border-gray-200 text-gray-500"} border-2 rounded-md overflow-hidden`}>
                                                        <RadioGroupItem value="fixed" id="fixed" className="sr-only" />
                                                        <Label
                                                            htmlFor="fixed"
                                                            className={`flex items-center justify-center w-full h-full py-2 px-4 cursor-pointer ${price_type === "fixed" ? "" : "bg-white hover:bg-gray-50"
                                                                }`}
                                                        >
                                                            Harga Tetap
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            </FormControl>
                                            {price_type === "wholesale" && form.watch("wholesalePrices")?.length === 0 && (
                                                <FormDescription>Minimal ada 1 variant harga</FormDescription>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {price_type === "wholesale" && form.watch("wholesalePrices") && (
                                    <div className="space-y-2">
                                        {form.watch("wholesalePrices").map((price, index) => (
                                            <div key={index} className="flex gap-2 items-end">
                                                {price.max_quantity == null && (
                                                    <div className="flex-1 items-center flex-col  bg-gray-50">
                                                        <FormLabel>Lebih Dari</FormLabel>
                                                        <div className=" justify-center border mt-2 flex h-9 w-full rounded-md  border-zinc-200 bg-transparent px-3 py-1 text-base shadow-sm ">
                                                            <ChevronRight />
                                                        </div>
                                                    </div>
                                                )}
                                                <FormField
                                                    control={form.control}
                                                    name={`wholesalePrices.${index}.min_quantity`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Min Quantity</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Min Jumlah"
                                                                    className="flex-1"
                                                                    {...field}
                                                                    value={field.value || ''}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (!isNaN(value)) {
                                                                            field.onChange(Number(value));
                                                                        }
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                {price.max_quantity !== null && (
                                                    <FormField
                                                        control={form.control}
                                                        name={`wholesalePrices.${index}.max_quantity`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Max Quantity</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Max Jumlah"
                                                                        className="flex-1"
                                                                        {...field}
                                                                        value={field.value ?? ''}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            if (!isNaN(value)) {
                                                                                field.onChange(Number(value));
                                                                            } else {
                                                                                field.onChange(0);
                                                                            }
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}
                                                <FormField
                                                    control={form.control}
                                                    name={`wholesalePrices.${index}.price`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Harga</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Harga"
                                                                    className="flex-1"
                                                                    {...field}
                                                                    value={field.value || ''}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (!isNaN(value)) {
                                                                            field.onChange(Number(value));
                                                                        } else {
                                                                            field.onChange(0);
                                                                        }
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                {form.watch("wholesalePrices").length > 1 && index > 0 && (
                                                    <Button type="button" className="bg-white border px-3 hover:bg-gray-100" onClick={() => removeWholesalePrice(index)}>
                                                        <Trash2 className="text-gray-900" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        {form.watch("wholesalePrices").length < 3 && !form.watch("wholesalePrices").some(price => price.max_quantity === null) && (
                                            <div className='flex gap-2 '>
                                                <Button type="button" variant="outline" onClick={addWholesalePrice}>
                                                    Tambah Variant
                                                </Button>
                                                <Button type="button" variant="outline" onClick={addMoreThanQuantity}>
                                                    <ChevronRight className="mr-2 h-4 w-4" />
                                                    Lebih Dari
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {price_type === "fixed" && (
                                    <FormField
                                        control={form.control}
                                        name="fixed_price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Harga Tetap</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Harga"
                                                        className="flex-1"
                                                        {...field}
                                                        value={field.value || ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (!isNaN(value)) {
                                                                field.onChange(Number(value));
                                                            } else {
                                                                field.onChange(0);
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                            <Separator />
                        </div>

                    </form>
                </Form>
            </div>
            {/* <div className="w-2/4">
                <div className="sticky top-4">
                    <h2 className="text-lg font-semibold mb-2">Preview Produk</h2>
                    <div className="border-2 border-dashed rounded-lg p-4">
                        {productPreview.product_images && productPreview.product_images.length > 0 ? (
                            <CarouselWithThumbnails images={productPreview.product_images.map((img) => ({
                                src: URL.createObjectURL(img),
                                alt: productPreview.products_name,
                            }))} />
                        ) : (
                            <p className="text-sm text-muted-foreground">Tidak ada gambar produk.</p>
                        )}
                        <h3 className="m-4 text-xl font-bold">{productPreview.products_name}</h3>
                    </div>
                </div>
            </div> */}
        </>

    );
}

// CarouselWithThumbnails component
function CarouselWithThumbnails({ images }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mainCarouselRef, mainEmbla] = useEmblaCarousel({ skipSnaps: false });
    const [thumbCarouselRef, thumbEmbla] = useEmblaCarousel({
        containScroll: 'keepSnaps',
        dragFree: true,
        axis: 'y'
    });

    const onThumbClick = useCallback(
        (index) => {
            if (!mainEmbla || !thumbEmbla) return;
            mainEmbla.scrollTo(index);
        },
        [mainEmbla, thumbEmbla]
    );

    const onSelect = useCallback(() => {
        if (!mainEmbla || !thumbEmbla) return;
        setSelectedIndex(mainEmbla.selectedScrollSnap());
        thumbEmbla.scrollTo(mainEmbla.selectedScrollSnap());
    }, [mainEmbla, thumbEmbla]);

    useEffect(() => {
        if (!mainEmbla) return;
        onSelect();
        mainEmbla.on('select', onSelect);
        return () => {
            mainEmbla.off('select', onSelect);
        };
    }, [mainEmbla, onSelect]);

    return (
        <div className="flex gap max-w-5xl mx-auto h-[200px]">
            {/* Thumbnails with ScrollArea */}
            <div className="w-24 h-full relative">
                <ScrollArea className="h-full ">
                    <div className="p-4" ref={thumbCarouselRef}>
                        <div className="flex flex-col gap-4 pb-3">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    className={`relative w-16 h-16 shrink-0 rounded-md overflow-hidden transition-all ${index === selectedIndex ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-2 hover:ring-muted hover:ring-offset-2'}`}
                                    onClick={() => onThumbClick(index)}
                                    type="button"
                                >
                                    <Image
                                        src={image.src}
                                        alt={image.alt}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Main Carousel */}
            <div className="relative bg-muted/5 rounded-lg flex-1 h-full">
                <div className="overflow-hidden rounded-lg h-full" ref={mainCarouselRef}>
                    <div className="flex h-full">
                        {images.map((image, index) => (
                            <div className="relative flex-[0_0_100%] h-full" key={index}>
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    onClick={() => mainEmbla?.scrollPrev()}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    onClick={() => mainEmbla?.scrollNext()}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
