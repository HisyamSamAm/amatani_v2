'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from "@/components/shadcnUi/input";
import { Button } from "@/components/shadcnUi/button";
import { Textarea } from "@/components/shadcnUi/textarea";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/shadcnUi/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/shadcnUi/form";
import { Loader2 } from 'lucide-react';
import { Toaster, toast } from "sonner";
import { useRouter } from 'next/navigation';
import { GetCategoriesFaqAction } from "@/app/actions/v2/dashboard/admin/faq/categoriesActions";

const formSchema = z.object({
    title: z.string().min(1, { message: "Tidak boleh kosong" }),
    content: z.string().min(1, { message: "Tidak boleh kosong" }),
    category: z.object({
        category_id: z.string().min(1, { message: "Kategori FAQ harus dipilih" }),
        category_name: z.string().min(1, { message: "Kategori FAQ harus dipilih" }),
    }),
});

export default function FAQForm({ mode, faq, onSubmit }) {
    const [categories, setCategories] = useState([]);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            content: "",
            category: { category_id: "", category_name: "" },
        },
    });

    useEffect(() => {
        async function fetchCategories() {
            try {
                const data = await GetCategoriesFaqAction();
                if (Array.isArray(data)) {
                    setCategories(data);
                    console.log("Fetched categories:", data);
                } else {
                    console.error("Categories data is not an array:", data);
                    setCategories([]);
                }

                if (mode === 'edit' && faq) {
                    form.setValue("title", faq.title);
                    form.setValue("content", faq.content);
                    form.setValue("category", {
                        category_id: faq.category_id ? faq.category_id.toString() : "",
                        category_name: faq.name || "",
                    });
                }
            } catch (error) {
                console.error("Failed to fetch FAQ categories:", error);
                setCategories([]);
            }
        }
        fetchCategories();
    }, [mode, faq, form]);

    useEffect(() => {
        if (mode === 'edit' && faq && categories.length > 0) {
            const categoryExists = categories.some(category => category.id.toString() === faq.category_id?.toString());
            console.log("Category exists:", categoryExists);
            if (categoryExists) {
                form.setValue("title", faq.title);
                form.setValue("content", faq.content);
                form.setValue("category", {
                    category_id: faq.category_id ? faq.category_id.toString() : "",
                    category_name: faq.name || "",
                });
            } else {
                console.error("Category not found in categories data.");
            }
        }
    }, [mode, faq, categories, form]);

    const handleSubmit = (data) => {
        console.log("Submitting form data:", data);
        startTransition(async () => {
            try {
                await onSubmit(data);
                // toast.success(`FAQ ${mode === 'add' ? 'added' : 'updated'} successfully!`);
                if (mode === 'add') {
                    form.reset();
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                // toast.error(`Failed to ${mode === 'add' ? 'add' : 'update'} FAQ`);
            }
        });
    };

    return (
        <div className="lg:w-4/6">
            <Toaster position="top-right" />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="lg:w-4/6">
                    <div className="">
                        <div className="flex justify-between items-center pb-4">
                            <h1 className="text-xl font-semibold">{mode === 'add' ? 'Tambah FAQ' : 'Edit FAQ'}</h1>
                            <div className="flex gap-3">
                                <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                                <Button
                                    variant="default"
                                    type="submit"
                                    className="bg-rose-600 hover:bg-rose-500"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {mode === 'add' ? 'Menambahkan...' : 'Menyimpan...'}
                                        </>
                                    ) : (
                                        mode === 'add' ? 'Tambah' : 'Simpan Perubahan'
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="container mx-auto space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Judul FAQ</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Masukkan judul FAQ" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Konten FAQ</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Masukkan konten FAQ"
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
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kategori FAQ</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={(value) => {
                                                    const selectedCategory = categories.find(category => category.id.toString() === value);
                                                    console.log("Selected category:", selectedCategory);
                                                    field.onChange(selectedCategory ? { category_id: selectedCategory.id.toString(), category_name: selectedCategory.name } : { category_id: "", category_name: "" });
                                                }}
                                                value={field.value.category_id || undefined}
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
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}