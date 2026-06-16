"use client";

import ProductForm from "@/components/dashboard/product/ProductForm";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/shadcnUi/breadcrumb";
import { Separator } from "@/components/shadcnUi/separator";
import { SidebarTrigger } from "@/components/shadcnUi/sidebar";
import { InsertProductAction } from "@/app/actions/v2/dashboard/admin/products/productsActions";
// import { toast } from "sonner";


export default function AddProductPage() {

    const handleAddProduct = async (params) => {
        console.log('Adding product:', params);
        // const toastId = toast.loading("Sedang memperbarui produk...");

        const formData = new FormData();
        formData.append('name', params.products_name);
        formData.append('description', params.products_description);
        formData.append('stock', params.stock);
        formData.append('fixed_price', params.fixed_price);
        formData.append('price_type', params.price_type);
        formData.append('category', JSON.stringify({
            category_id: params.category.categories_id,
            name: params.category.categories_name
        }));
        formData.append('wholesalePrices', JSON.stringify(params.wholesalePrices));

        params.product_images.forEach((image) => {
            formData.append(`product_images`, image);
        });

        try {
            const data = await InsertProductAction(formData);

            if (data && !data.error) {
                // Menampilkan toast sukses dengan sonner
                // toast.success("Produk berhasil diperbarui", { id: toastId });
                return { success: true, data };
            }

            throw new Error(data?.error || "Gagal menambahkan produk");
        } catch (error) {
            console.error(`Gagal menambahkan produk:`, error);
            // toast.error(error.message || "Gagal memperbarui produk", { id: toastId });
            return { success: false, message: error.message };
        }
    };

    return (
        <div>
            {/* <Toaster position="top-right" /> */}
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">Produk</BreadcrumbLink>
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
                    <ProductForm mode="add" onSubmit={handleAddProduct} />
                </div>
            </div>
        </div>
    );
}