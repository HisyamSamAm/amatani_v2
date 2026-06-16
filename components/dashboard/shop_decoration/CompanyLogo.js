'use client';

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
import CompanyLogosPreview from './previewcomponent/CompanyLogoPreview';
import { AspectRatio } from "@/components/shadcnUi/aspect-ratio";
import { GetCompanyLogosAction, InsertCompanyLogoAction, DeleteCompanyLogoAction } from "@/app/actions/v2/dashboard/admin/sd/companyLogosActions";

const formSchema = z.object({
    logo: z.any().refine((file) => {
        if (!file || file.length === 0) return false;
        const acceptedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        return acceptedFormats.includes(file[0].type);
    }, "Format gambar harus PNG, JPG, JPEG, atau WEBP").refine((file) => {
        if (!file || file.length === 0) return false;
        return file[0].size <= 2 * 1024 * 1024; // 2MB
    }, "Ukuran gambar harus kurang dari 2MB"),
});

export default function CompanyLogo() {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            logo: null,
        },
    });

    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const [refreshPreview, setRefreshPreview] = useState(false);
    const [companyLogoList, setCompanyLogoList] = useState([]);
    const fileInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [preview, setPreview] = useState(null);

    // Fungsi untuk mengambil data company logo dari API
    const fetchCompanyLogoList = async () => {
        try {
            const result = await GetCompanyLogosAction();
            if (result.success) {
                setCompanyLogoList(result.data);
            } else {
                console.error('Failed to fetch company logo list:', result.error);
            }
        } catch (error) {
            console.error('Error fetching company logo list:', error);
        }
    };

    // Fungsi untuk menghapus company logo
    const handleDelete = async (cp_id) => {
        const toastId = "delete-company-logo-toast"; // ID unik untuk toast ini

        startDeleteTransition(async () => {
            try {
                const result = await DeleteCompanyLogoAction(cp_id);

                if (!result.success) {
                    throw new Error(result.error || 'Failed to delete company logo');
                }

                console.log('Company logo deleted successfully:', result.data);
                toast.success("Company logo berhasil dihapus!", {
                    id: toastId,
                    description: "Company logo telah berhasil dihapus.",
                    duration: 3000,
                });

                fetchCompanyLogoList();
                setRefreshPreview(prev => !prev);
            } catch (error) {
                console.error('Error deleting company logo:', error);
                toast.error("Gagal menghapus company logo", {
                    id: toastId,
                    description: error.message || "Terjadi kesalahan saat menghapus company logo.",
                    duration: 3000,
                });
            }
        });
    };

    useEffect(() => {
        fetchCompanyLogoList();
    }, []);

    // Fungsi untuk menambahkan company logo baru
    const onSubmit = async (data) => {
        const toastId = "company-logo-toast"; // ID unik untuk toast ini

        startTransition(async () => {
            try {
                setIsLoading(true);
                setProgress(0);

                const result = await InsertCompanyLogoAction(data.logo[0]);

                if (!result.success) {
                    throw new Error(result.error || 'Failed to insert company logo');
                }

                console.log('Company logo inserted successfully:', result.data);
                toast.success("Data berhasil disimpan!", {
                    id: toastId,
                    description: "Company logo telah berhasil diperbarui.",
                    duration: 3000,
                });

                form.reset();
                if (fileInputRef.current) fileInputRef.current.value = null;
                fetchCompanyLogoList();
                setRefreshPreview(prev => !prev);
                setPreview(null);
                setIsLoading(false);
            } catch (error) {
                console.error('Error submitting form:', error);
                toast.error("Gagal menyimpan data", {
                    id: toastId,
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
            form.setValue('logo', e.target.files);
        }
    }, [form]);

    return (
        <div className="w-full">
            {/* Combined Form and Preview Section */}
            <div className="md:flex gap-6 rounded-lg overflow-hidden w-full">
                {/* Form Section */}
                <div className="w-full md:w-2/5 p-6">
                    <Toaster position="top-right" />
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                            <div>
                                <div className="flex justify-between items-center pb-4 w-full">
                                    <h1 className="text-xl font-semibold">Company Logo</h1>
                                    <div className="flex gap-3">
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button variant="outline" size="sm">Kelola</Button>
                                            </SheetTrigger>
                                            <SheetContent className="w-full sm:max-w-[400px]">
                                                <SheetHeader>
                                                    <SheetTitle>Kelola Company Logo</SheetTitle>
                                                </SheetHeader>
                                                <ScrollArea className="h-full w-full">
                                                    <div className="p-4 w-full">
                                                        <div className="grid grid-cols-1 gap-4 w-full">
                                                            {companyLogoList.map((logo) => (
                                                                <div key={logo.id} className="flex items-center justify-between p-2 border rounded-lg w-full">
                                                                    <div className="flex items-center">
                                                                        <Image
                                                                            src={logo.image_path}
                                                                            alt="Company Logo"
                                                                            width={100}
                                                                            height={100}
                                                                            className="object-cover rounded-lg"
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center justify-end">
                                                                        <AlertDialog>
                                                                            <AlertDialogTrigger asChild>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
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
                                                                                        Apakah Anda yakin ingin menghapus company logo ini?
                                                                                    </AlertDialogDescription>
                                                                                </AlertDialogHeader>
                                                                                <AlertDialogFooter>
                                                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                                    <AlertDialogAction onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        handleDelete(logo.id);
                                                                                    }} disabled={isDeleting}>
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
                                        name="logo"
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
                                        <div className="mt-4 w-full">
                                            <AspectRatio ratio={1 / 1} className="w-24 sm:w-32">
                                                <Image
                                                    src={preview}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                    style={{ position: 'absolute' }}
                                                />
                                            </AspectRatio>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>

                {/* Preview Section */}
                <div className="w-full md:w-3/5 flex justify-center items-center">
                    <div className="w-full">
                        <CompanyLogosPreview refresh={refreshPreview} />
                    </div>
                </div>
            </div>
        </div>
    );
}