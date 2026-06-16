"use client";

import FaqForm from "@/components/dashboard/faq/FaqForm";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/shadcnUi/breadcrumb";
import { Separator } from "@/components/shadcnUi/separator";
import { SidebarTrigger } from "@/components/shadcnUi/sidebar";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { InsertFaqAction } from "@/app/actions/v2/dashboard/admin/faq/faqActions";

export default function AddFaqPage() {
    const router = useRouter();
    const handleAddFaq = async (params) => {
        console.log('Adding FAQ:', params);
        const formData = new FormData();
        formData.append('title', params.title);
        formData.append('content', params.content);
        formData.append('category_id', params.category.category_id);

        try {
            const data = await InsertFaqAction(formData);

            if (data && !data.error) {
                console.log('result =', data);
                console.log('FAQ berhasil ditambahkan');
            } else {
                console.error('Error:', data?.error);
                toast.error(data?.error || "Failed to add FAQ");
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error("Failed to add FAQ");
        }
    };

    return (
        <div>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">FAQ</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Tambah Produk</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <div className="mx-auto px-12 py-6">
                <div className="lg:flex justify-between sm:gap-x-12 xl:gap-x-20">
                    <FaqForm mode="add" onSubmit={handleAddFaq} />
                </div>
            </div>
        </div>
    );
}