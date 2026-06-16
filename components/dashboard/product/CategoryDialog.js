'use client'

import { Toaster, toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/shadcnUi/alert-dialog";
import { Button } from "@/components/shadcnUi/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, DialogHeader } from "@/components/shadcnUi/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/shadcnUi/form";
import { Input } from "@/components/shadcnUi/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ScrollArea } from "@/components/shadcnUi/scroll-area";
import { GetCategoriesAction, InsertCategoryAction, DeleteCategoryAction } from "@/app/actions/v2/dashboard/admin/products/categoriesActions";

const formschema = z.object({
    categories_name: z.string().min(1, { message: 'Jangan lupa di isi' })
});

export default function ManageCategoriesDialog() {
    const [categories, setCategories] = useState([]);
    const [isAdding, startAdding] = useTransition();
    const [isDeleting, startDeleting] = useTransition();
    const [pendingCategoryId, setPendingCategoryId] = useState(null);

    const form = useForm({
        resolver: zodResolver(formschema),
        defaultValues: {
            categories_name: "",
        },
    });

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

    const onSubmit = (params) => {
        startAdding(async () => {
            try {
                const result = await InsertCategoryAction(params.categories_name);

                if (!result.success) throw new Error(result.error || 'Failed to add category');

                fetchCategories();
                form.reset();
                toast.success("Category added successfully!", { duration: 3000 });
            } catch (error) {
                console.error('Error adding category:', error);
                toast.error(error.message || "Failed to add category.", { duration: 3000 });
            }
        });
    };

    const handleDeleteCategory = (categoryId, categoryName) => {
        setPendingCategoryId(categoryId);
        startDeleting(async () => {
            try {
                const result = await DeleteCategoryAction(categoryId);

                if (!result.success) throw new Error(result.error || 'Failed to delete category');

                fetchCategories();
                toast.success(`Category "${categoryName}" deleted successfully.`, { duration: 3000 });
            } catch (error) {
                console.error('Failed to delete category:', error);
                toast.error(error.message || "Failed to delete category.", { duration: 3000 });
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
                    <DialogHeader>
                        <DialogTitle>Manage Your Categories</DialogTitle>
                        <DialogDescription>Add or delete categories for your products.</DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                            <div className="flex items-end space-x-2">
                                <FormField
                                    control={form.control}
                                    name="categories_name"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Category Name</FormLabel>
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

                    <h3 className="font-medium text-sm mt-4">Manage Categories ({categories.length})</h3>
                    <ScrollArea className="max-h-72 border rounded-md p-2 mt-2">
                        <div className="space-y-2">
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
                                                    onClick={() => handleDeleteCategory(category.id, category.name)}
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
