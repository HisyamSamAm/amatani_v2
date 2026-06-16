'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from "@/components/shadcnUi/input";
import { Button } from "@/components/shadcnUi/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/shadcnUi/form";
import { Toaster, toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/shadcnUi/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/shadcnUi/alert-dialog";
import { ScrollArea } from "@/components/shadcnUi/scroll-area";
import Image from "next/image";
import { useState, useTransition, useRef, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/shadcnUi/progress';
import FoodCategoryPreview from './previewcomponent/FoodCategoryPreview';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/shadcnUi/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/shadcnUi/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { AspectRatio } from "@/components/shadcnUi/aspect-ratio";
import { GetFoodCategoriesAction, InsertFoodCategoriesAction, DeleteFoodCategoriesAction } from "@/app/actions/v2/dashboard/admin/sd/foodCategories";
import { GetCategoriesAction } from "@/app/actions/v2/dashboard/admin/products/categoriesActions";

const formSchema = z.object({
    category_id: z.string().min(1, { message: "Tidak boleh kosong" }),
    categoryImage: z.any().refine((file) => {
        if (!file || file.length === 0) return false;
        const acceptedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        return acceptedFormats.includes(file[0].type);
    }, "Format gambar harus PNG, JPG, JPEG, atau WEBP").refine((file) => {
        if (!file || file.length === 0) return false;
        return file[0].size <= 2 * 1024 * 1024; // 2MB
    }, "Ukuran gambar harus kurang dari 2MB"),
});

export default function KategoriPangan() {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            category_id: "",
            categoryImage: null,
        },
    });

    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const [refreshPreview, setRefreshPreview] = useState(false);
    const [foodCategoryList, setFoodCategoryList] = useState([]);
    const [categories, setCategories] = useState([]); // State untuk menyimpan data kategori

    const fileInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [preview, setPreview] = useState(null);
    const [open, setOpen] = useState(false)

    // Fungsi untuk mengambil data food category dari API
    const fetchFoodCategoryList = async () => {
        try {
            const result = await GetFoodCategoriesAction();
            if (result.success) {
                setFoodCategoryList(result.data);
            } else {
                console.error('Failed to fetch food category list:', result.error);
            }
        } catch (error) {
            console.error('Error fetching food category list:', error);
        }
    };

    // Fungsi untuk mengambil data kategori dari API
    const fetchCategories = async () => {
        try {
            const result = await GetCategoriesAction();
            if (result.success && Array.isArray(result.data)) {
                setCategories(result.data);
            } else {
                console.error("Categories data is not an array:", result);
                setCategories([]);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    // Fungsi untuk menghapus food category
    const handleDelete = async (food_categories_id) => {
        const toastId = "delete-food-category-toast"; // ID unik untuk toast ini

        startDeleteTransition(async () => {
            try {
                const result = await DeleteFoodCategoriesAction(food_categories_id);

                if (!result.success) {
                    throw new Error(result.error || 'Failed to delete food category');
                }

                console.log('Food category deleted successfully:', result.data);
                toast.success("Food category berhasil dihapus!", {
                    id: toastId,
                    description: "Food category telah berhasil dihapus.",
                    duration: 3000,
                });

                fetchFoodCategoryList();
                setRefreshPreview(prev => !prev);
            } catch (error) {
                console.error('Error deleting food category:', error);
                toast.error("Gagal menghapus food category", {
                    id: toastId,
                    description: error.message || "Terjadi kesalahan saat menghapus food category.",
                    duration: 3000,
                });
            }
        });
    };

    useEffect(() => {
        fetchFoodCategoryList();
        fetchCategories(); // Panggil fungsi untuk mengambil data kategori
    }, []);

    // Fungsi untuk menambahkan food category baru
    const onSubmit = async (data) => {
        console.log("🚀 ~ onSubmit ~ data:", data)
        // ID unik untuk toast ini

        startTransition(async () => {
            try {
                setIsLoading(true);
                setProgress(0);

                const result = await InsertFoodCategoriesAction(data.category_id, data.categoryImage[0]);

                if (!result.success) {
                    throw new Error(result.error || 'Failed to insert food category');
                }

                console.log('Food category inserted successfully:', result.data);
                toast.success("Data berhasil disimpan!", {
                    description: "Food category telah berhasil diperbarui.",
                    duration: 3000,
                });

                form.reset();
                if (fileInputRef.current) fileInputRef.current.value = null;
                fetchFoodCategoryList();
                setRefreshPreview(prev => !prev);
                setPreview(null);
                setIsLoading(false);
            } catch (error) {
                console.error('Error submitting form:', error);
                toast.error("Gagal menyimpan data", {
                    description: error.message || "Terjadi kesalahan saat menyimpan data.",
                    duration: 3000,
                });
                setIsLoading(false);
            }
        });
    };

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
            form.setValue('categoryImage', e.target.files);
        }
    }, [form]);

    return (
        <div className="w-full">
            {/* Combined Form and Preview Section */}
            <div className="md:flex gap-6 rounded-lg overflow-hidden w-full">
                {/* Form Section */}
                <div className="w-full md:w-2/5 p-6">
                    <Toaster position="top-right" expand={false} />
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                            <div>
                                <div className="flex justify-between items-center pb-4 w-full">
                                    <h1 className="text-xl font-semibold">Food Category</h1>
                                    <div className="flex gap-3">
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button variant="outline" size="sm">Kelola</Button>
                                            </SheetTrigger>
                                            <SheetContent className="w-full sm:max-w-[400px]">
                                                <SheetHeader>
                                                    <SheetTitle>Kelola Food Category</SheetTitle>
                                                </SheetHeader>
                                                <ScrollArea className="h-full w-full">
                                                    <div className="p-4 w-full">
                                                        <div className="grid grid-cols-1 gap-4 w-full">
                                                            {foodCategoryList.map((category) => (
                                                                <div key={category.food_categories_id} className="flex items-center justify-between p-2 border rounded-lg w-full">
                                                                    <div className="flex items-center">
                                                                        <Image
                                                                            src={category.image_path}
                                                                            alt="Food Category Image"
                                                                            width={100}
                                                                            height={100}
                                                                            className="object-cover rounded-lg"
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center">
                                                                        <span className="ml-4">{category.categories_name}</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-end">
                                                                        <AlertDialog>
                                                                            <AlertDialogTrigger asChild>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    className="ml-4"
                                                                                    disabled={isDeleting}
                                                                                >
                                                                                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Hapus'}
                                                                                </Button>
                                                                            </AlertDialogTrigger>
                                                                            <AlertDialogContent>
                                                                                <AlertDialogHeader>
                                                                                    <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                                                                                    <AlertDialogDescription>
                                                                                        Apakah Anda yakin ingin menghapus food category ini?
                                                                                    </AlertDialogDescription>
                                                                                </AlertDialogHeader>
                                                                                <AlertDialogFooter>
                                                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                                    <AlertDialogAction onClick={() => handleDelete(category.food_categories_id)} disabled={isDeleting}>
                                                                                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Hapus'}
                                                                                    </AlertDialogAction>
                                                                                </AlertDialogFooter>
                                                                            </AlertDialogContent>
                                                                        </AlertDialog>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </ScrollArea>
                                            </SheetContent>
                                        </Sheet>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            className={`bg-rose-600 hover:bg-rose-500 ${isPending ? 'cursor-not-allowed' : ''}`}
                                            disabled={isPending}
                                        >
                                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Simpan'}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-4 w-full">
                                    <FormField
                                        control={form.control}
                                        name="category_id"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col w-full">
                                                <FormLabel>Category ID</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={open}
                                                                className="w-full justify-between"
                                                            >
                                                                {field.value
                                                                    ? (categories.find(
                                                                        (category) => category.categories_id === field.value
                                                                    )?.categories_name)
                                                                    : "Select category..."}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0">
                                                        <Command>
                                                            <CommandList className="w-full">
                                                                <CommandEmpty>No category found.</CommandEmpty>
                                                                <CommandGroup className="w-full">
                                                                    {categories.map((category) => (
                                                                        <CommandItem
                                                                            key={category.categories_id}
                                                                            value={category.categories_name}
                                                                            onSelect={() => {
                                                                                field.onChange(category.categories_id);
                                                                                setOpen(false);
                                                                            }}
                                                                            className="w-full"
                                                                        >
                                                                            <Check
                                                                                className="mr-2 h-4 w-4"
                                                                                style={{
                                                                                    visibility:
                                                                                        field.value === category.categories_id
                                                                                            ? "visible"
                                                                                            : "hidden",
                                                                                }}
                                                                            />
                                                                            {category.categories_name}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="categoryImage"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>Image</FormLabel>
                                                <FormControl className="w-full">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        ref={fileInputRef}
                                                        className="w-full"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {isLoading && (
                                        <div className="mt-4 w-full">
                                            <Progress value={progress} className="w-full" />
                                            <p className="text-sm text-gray-500 mt-2">Mengunggah gambar: {Math.round(progress)}%</p>
                                        </div>
                                    )}
                                    {preview && (
                                        <figure className="flex flex-col justify-start items-center flex-none w-32 md:w-48">
                                            {/* Gambar Background */}
                                            <AspectRatio ratio={1 / 1} className="w-full">
                                                <Image
                                                    src={preview}
                                                    alt="Food Category"
                                                    fill
                                                    className="object-cover rounded-lg"

                                                />
                                            </AspectRatio>
                                            {/* Label Nama Kategori */}
                                        </figure>
                                    )}
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>

                {/* Preview Section */}
                <div className="w-full md:w-3/5 flex justify-center items-center">
                    <div className="w-full">
                        <FoodCategoryPreview refresh={refreshPreview} />
                    </div>
                </div>
            </div>
        </div>
    );
}