'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from "@/components/shadcnUi/input";
import { Button } from "@/components/shadcnUi/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/shadcnUi/form";
import { Toaster, toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/shadcnUi/sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/shadcnUi/alert-dialog";
import { Loader2 } from 'lucide-react';
import ExperiencePreview from './previewcomponent/ExperiencePreview';
import { SidebarTrigger } from '@/components/shadcnUi/sidebar';
import { Separator } from '@/components/shadcnUi/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/shadcnUi/breadcrumb';
import { GetExperiencesAction, InsertExperienceAction, DeleteExperienceAction } from "@/app/actions/v2/dashboard/admin/sd/experienceActions";

const formSchema = z.object({
    number: z
        .number({ invalid_type_error: "Harus berupa angka" })
        .min(1, { message: "Nilai harus lebih dari 0" }),
    description: z.string().min(1, { message: "Deskripsi tidak boleh kosong" }),
});

export default function Experience() {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            number: 0,
            description: "",
        },
    });

    const [experiences, setExperiences] = useState([]);
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();

    const fetchExperiences = async () => {
        try {
            const result = await GetExperiencesAction();
            if (result.success) {
                setExperiences(result.data);
            } else {
                console.error('Failed to fetch experiences:', result.error);
            }
        } catch (error) {
            console.error('Error fetching experiences:', error);
        }
    };

    useEffect(() => {
        fetchExperiences();
    }, []);

    const onSubmit = async (data) => {

        startTransition(async () => {
            try {
                const result = await InsertExperienceAction(data.number, data.description);

                if (!result.success) {
                    throw new Error(result.error || 'Failed to insert experiences');
                }

                console.log('Experiences inserted successfully:', result.data);
                toast.success("Data berhasil disimpan!", {
                    description: `Berhasil simpan data`,
                    duration: 3000,
                });

                form.reset();
                fetchExperiences();
            } catch (error) {
                console.error('Error submitting form:', error);
                toast.error("Gagal menyimpan data", {
                    description: error.message || "Terjadi kesalahan saat menyimpan data.",
                    duration: 3000,
                });
            }
        });
    };

    const handleDelete = async (experience_id) => {


        startDeleteTransition(async () => {
            try {
                const result = await DeleteExperienceAction(experience_id);

                if (!result.success) {
                    throw new Error(result.error || 'Failed to delete experience');
                }

                console.log('Experience deleted successfully:', result.data);
                toast.success("Data berhasil dihapus!", {
                    description: `Data Statistik telah berhasil dihapus.`,
                    duration: 3000,
                });

                fetchExperiences();
            } catch (error) {
                console.error('Error deleting experience:', error);
                toast.error("Gagal menghapus data", {
                    description: error.message || "Terjadi kesalahan saat menghapus data.",
                    duration: 3000,
                });
            }
        });
    };

    return (
        <div className="w-full">

            {/* Menggunakan flex-col untuk stack vertikal pada mobile, dan flex-row pada medium+ */}
            <header className="flex  shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">
                                    Produk
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            {/* <BreadcrumbSeparator className="hidden md:block" />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                                        </BreadcrumbItem> */}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <div className="flex flex-col md:flex-row gap-4 rounded-lg overflow-hidden w-full">
                {/* Form Section */}
                <div className="w-full md:w-2/5 p-4">
                    <Toaster position="top-right" expand={false} />
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                            {/* Judul dan tombol diatur agar responsif */}
                            <div className="flex  sm:flex-row justify-between items-center pb-4 w-full">
                                <h1 className="text-xl font-semibold">Experience</h1>
                                <div className="flex gap-2 mt-2 sm:mt-0">
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="outline" size="sm">Kelola</Button>
                                        </SheetTrigger>
                                        <SheetContent className="w-full sm:max-w-sm">
                                            <SheetHeader>
                                                <SheetTitle>Kelola Experience</SheetTitle>
                                            </SheetHeader>
                                            <div className="p-4">
                                                {experiences.map(stat => (
                                                    <div key={stat.id} className="flex justify-between items-center mb-4 w-full">
                                                        <div>
                                                            <p className="text-sm">{stat.number}</p>
                                                            <p className="text-xs text-gray-500">{stat.description}</p>
                                                        </div>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="outline" size="" disabled={isDeleting}>Hapus</Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Apakah Anda yakin ingin menghapus statistik ini?
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleDelete(stat.id);
                                                                    }} disabled={isDeleting}>
                                                                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Hapus'}
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                ))}
                                            </div>
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
                            {/* Form fields diatur agar responsif */}
                            <div className="grid gap-4 w-full">
                                <FormField
                                    control={form.control}
                                    name="number"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Number</FormLabel>
                                            <FormControl className="w-full">
                                                <Input
                                                    placeholder="10000"
                                                    {...field}
                                                    className="w-full"
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
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Deskripsi</FormLabel>
                                            <FormControl className="w-full">
                                                <Input placeholder="Deskripsi singkat" {...field} className="w-full" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </form>
                    </Form>
                </div>

                {/* Preview Section */}
                <div className="w-full md:w-3/5 flex flex-col justify-center items-center p-4">
                    <h2 className="text-xl font-semibold mb-4">Preview</h2>
                    <div className="w-full ">
                        <ExperiencePreview fetchStatistics={fetchExperiences} />
                    </div>
                </div>
            </div>
        </div>
    );
}