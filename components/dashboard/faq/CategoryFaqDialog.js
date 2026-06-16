'use client';

import { Toaster, toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/shadcnUi/alert-dialog";
import { Button } from "@/components/shadcnUi/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/shadcnUi/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/shadcnUi/form";
import { Input } from "@/components/shadcnUi/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash } from 'lucide-react';
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ScrollArea } from "@/components/shadcnUi/scroll-area";
import { GetCategoriesFaqAction, InsertCategoriesFaqAction, DeleteCategoriesFaqAction } from "@/app/actions/v2/dashboard/admin/faq/categoriesActions";

const formSchema = z.object({
    name: z.string().min(1, { message: 'Jangan lupa di isi' })
});

export default function ManageCategoryFaqDialog() {
    const [categories, setCategories] = useState([]);
    const [isAdding, startAdding] = useTransition();
    const [isDeleting, startDeleting] = useTransition();
    const [pendingCategoryId, setPendingCategoryId] = useState(null);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });

    const fetchCategories = async () => {
        try {
            const data = await GetCategoriesFaqAction();
            if (Array.isArray(data)) {
                setCategories(data);
            } else {
                console.error("Categories data is not an array:", data);
                setCategories([]);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const onSubmit = (params) => {
        startAdding(async () => {
            try {
                const result = await InsertCategoriesFaqAction(params.name);

                if (result && !result.error) {
                    fetchCategories();
                    form.reset();
                    toast("Category added successfully", {
                        duration: 3000,
                        description: `The category "${params.name}" has been added.`,
                    });
                } else {
                    throw new Error(result?.error || 'Failed to add category');
                }
            } catch (error) {
                console.error('Error adding category:', error);
                toast("Failed to add category", {
                    duration: 3000,
                    description: error.message || "An error occurred while adding the category.",
                });
            }
        });
    };

    const handleDeleteCategory = (categoryId, categoryName) => {
        setPendingCategoryId(categoryId);
        startDeleting(async () => {
            try {
                const result = await DeleteCategoriesFaqAction(categoryId);

                if (result && !result.error) {
                    fetchCategories();
                    toast("Category deleted successfully", {
                        duration: 3000,
                        description: `The category "${categoryName}" has been deleted.`,
                    });
                } else {
                    throw new Error(result?.error || 'Failed to delete category');
                }
            } catch (error) {
                console.error('Failed to delete category:', error);
                toast("Failed to delete category", {
                    duration: 3000,
                    description: error.message || "An error occurred while deleting the category.",
                });
            } finally {
                setPendingCategoryId(null);
            }
        });
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div>
            <Toaster position="top-right" />
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                        Manage Categories
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>Categories</DialogTitle>
                    <DialogDescription>Add or delete categories FAQ.</DialogDescription>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                            <div className="flex items-end space-x-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Create Category</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="Enter category name"
                                                    {...field}
                                                    className="h-10"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="bg-red-600 hover:bg-rose-500 h-10" disabled={isAdding}>
                                    {isAdding ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4 mr-2" />
                                    )}
                                    {isAdding ? 'Adding...' : 'Add'}
                                </Button>
                            </div>
                        </form>
                    </Form>

                    {/* Daftar Kategori dengan ScrollArea */}
                    <h3 className="font-medium text-sm">Manage Categories ({categories.length})</h3>
                    <ScrollArea className="max-h-72 border rounded-md p-2 mt-2">
                        <div className="space-y-2"> {/* Tambahkan class ini */}
                            {Array.isArray(categories) && categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="flex items-center justify-between p-2 border rounded-md"
                                >
                                    <p className="text-sm">{category.name}</p>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-8 h-8 flex items-center justify-center"
                                                disabled={isDeleting && pendingCategoryId === category.id}
                                            >
                                                {isDeleting && pendingCategoryId === category.id ? (
                                                    <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                                                ) : (
                                                    <Trash className="w-4 h-4 text-red-500" />
                                                )}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. It will permanently delete the category.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDeleteCategory(category.id, category.name);
                                                    }}
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}