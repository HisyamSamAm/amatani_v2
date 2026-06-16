"use client";
import { useState, useEffect, useCallback, useRef, useTransition } from "react";
import { Badge } from "@/components/shadcnUi/badge";
import { Button } from "@/components/shadcnUi/button";
import { Input } from "@/components/shadcnUi/input";
import { Edit, Trash, Plus, SortDesc, Search, X, Loader2 } from 'lucide-react';
import Link from "next/link";
import { GetProductAction, DeleteProductAction } from "@/app/actions/v2/dashboard/admin/products/productsActions";
import { SidebarTrigger } from "@/components/shadcnUi/sidebar";
import { Separator } from "@/components/shadcnUi/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/shadcnUi/breadcrumb";
import Image from "next/image";
import ManageCategoriesDialog from "@/components/dashboard/product/CategoryDialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/shadcnUi/dropdown-menu"
import { ArrowUpAZ, ArrowDownAZ, ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/shadcnUi/alert-dialog";
import { Toaster, toast } from "sonner";
import { EmptyState } from "@/components/shadcnUi/empty-state";
import { PackageOpen } from "lucide-react";

// Komponen Reusable untuk Rentang Harga
const PriceRange = ({ label, price }) => (
    <div className="flex flex-col items-center">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-black">{price}</p>
    </div>
);

// Komponen Reusable untuk Tombol Tindakan
const ActionButtons = ({ product_id, onDelete }) => {
    const [isPending, startTransition] = useTransition();

    const handleDelete = (e) => {
        e.preventDefault();
        startTransition(async () => {
            try {
                await onDelete(product_id);
                toast.success("Product deleted successfully");
            } catch (error) {
                console.error("Gagal menghapus produk:", error);
            }
        });
    };

    return (
        <div className="flex space-x-3">
            <Button asChild variant="outline" className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 rounded-md">
                <Link href={`/admin/products/edit/${product_id}`} >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                </Link>
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="flex items-center justify-center w-9 h-9 rounded-md relative"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Trash className="w-5 h-5" />
                        )}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                            {isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

// Komponen Reusable untuk Card Produk
const ProductCard = ({ product, onDelete }) => {
    let priceRanges;

    if (product.price_type === 'wholesale' && product.wholesale_prices) {
        priceRanges = product.wholesale_prices.map((price, index) => (
            <PriceRange
                key={index}
                label={price.max_quantity === null ? `> ${price.min_quantity}` : `${price.min_quantity} - ${price.max_quantity}`}
                price={`Rp ${price.price}`}
            />
        ));
    } else if (product.price_type === 'fixed') {
        priceRanges = (
            <PriceRange label="Harga Tetap" price={`Rp ${product.fixed_price}`} />
        );
    }

    return (
        <div className="flex items-center p-4 sm:p-6 border rounded-lg border-gray-300 gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-lg">
                {product.images && product.images.length > 0 && (
                    <Image
                        width={200}
                        height={200}
                        src={product.images[0].startsWith('http') 
                            ? product.images[0] 
                            : "/placeholder-image.png"}
                        alt={product.name}
                        className="object-cover w-full h-full rounded-lg"
                    />
                )}
            </div>
            <div className="flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                    <Badge className="text-red-400 bg-red-100 hover:bg-rose-200 hover:text-red-600">
                        {product.price_type === 'wholesale' ? 'Grosir' : 'Harga Tetap'}
                    </Badge>
                    <Badge className="text-red-400 bg-red-100 hover:bg-rose-200 hover:text-red-600">
                        {product.name}
                    </Badge>
                </div>
                <h2 className="text-sm sm:text-base font-semibold text-black">{product.name}</h2>
            </div>
            <div className="flex flex-1 justify-start gap-8">
                {priceRanges}
            </div>
            <p className="text-sm sm:text-base text-black flex-shrink-0">Stock: {product.stock}</p>
            <ActionButtons product_id={product.product_id} onDelete={onDelete} />
        </div>
    );
};

// Skeleton Loader Component
const ProductCardSkeleton = () => (
    <div className="flex items-center p-4 sm:p-6 border rounded-lg border-gray-300 gap-6 animate-pulse">
        <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
        <div className="flex-1 space-y-2">
            <div className="flex flex-wrap gap-2">
                <div className="h-6 w-16 bg-gray-300 rounded-md"></div>
                <div className="h-6 w-24 bg-gray-300 rounded-md"></div>
            </div>
            <div className="h-6 w-3/4 bg-gray-300 rounded-md"></div>
        </div>
        <div className="flex flex-1 justify-between gap-4">
            <div className="h-6 w-16 bg-gray-300 rounded-md"></div>
        </div>
        <div className="h-6 w-24 bg-gray-300 rounded-md"></div>
    </div>
);

// Halaman Utama
export default function ProductPage() {
    const [currentSort, setCurrentSort] = useState('Sort by')
    const [products, setProducts] = useState([]);
    const [isPending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState("");
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loading, setLoading] = useState(true); // State for loading
    const observer = useRef();

    const fetchProducts = useCallback(async (query = "", sort = "", limit = 10, offset = 0) => {
        const maxRetries = 3;
        let currentRetry = 0;

        while (currentRetry < maxRetries) {
            try {
                setLoading(true);
                const data = await GetProductAction({ searchQuery: query, sort, limit, offset });

                // Pastikan data adalah array
                const productsArray = Array.isArray(data) ? data : [];

                if (offset === 0) {
                    setProducts(productsArray);
                } else {
                    setProducts(prevProducts => [...prevProducts, ...productsArray]);
                }

                setHasMore(productsArray.length === limit);
                return;

            } catch (error) {
                currentRetry++;
                console.error(`Attempt ${currentRetry} failed:`, error);

                if (currentRetry === maxRetries) {
                    toast.error(`Gagal memuat produk: ${error.message}`);
                    setProducts([]);
                    setHasMore(false);
                    return; // Hindari throw error agar UI tetap berjalan
                }

                await new Promise(resolve => setTimeout(resolve, 1000 * currentRetry));
            } finally {
                setLoading(false);
            }
        }
    }, []);

    // Update useEffect to handle errors
    useEffect(() => {
        let isMounted = true;

        const loadProducts = async () => {
            try {
                await fetchProducts("", currentSort, 10, 0);
            } catch (error) {
                if (isMounted) {
                    console.error("Failed to load products:", error);
                }
            }
        };

        startTransition(() => {
            loadProducts();
        });

        return () => {
            isMounted = false;
        };
    }, [fetchProducts, currentSort]);

    const handleSearch = (e) => {
        e.preventDefault();
        setOffset(0);
        startTransition(() => {
            fetchProducts(searchQuery, currentSort, 10, 0);
        });
    };

    const handleDeleteProduct = useCallback(async (productId) => {
        try {
            const res = await DeleteProductAction(productId);
            if (res && res.error) {
                throw new Error(res.error);
            }
            setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Failed to delete product");
            throw error;
        }
    }, []);

    const handleSort = (sortType) => {
        setCurrentSort(sortType);
        setOffset(0);
        startTransition(() => {
            fetchProducts(searchQuery, sortType, 10, 0);
        });
    };

    const lastProductElementRef = useCallback(node => {
        if (isPending || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setLoadingMore(true);
                setOffset(prevOffset => {
                    const newOffset = prevOffset + 10;
                    fetchProducts(searchQuery, currentSort, 10, newOffset).then(() => {
                        setLoadingMore(false);
                    });
                    return newOffset;
                });
            }
        });
        if (node) observer.current.observe(node);
    }, [isPending, loadingMore, hasMore, fetchProducts, searchQuery, currentSort]);

    return (
        <div>

            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
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
            <Toaster position="top-right" />
            <div className="p-4 sm:p-6 space-y-6">
                <div className="space-y-2">
                    <h1 className="text-lg sm:text-xl font-semibold">Semua produk</h1>
                    <p className="text-xs text-gray-500">Total ada {products.length} produk</p>
                </div>
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <ManageCategoriesDialog />
                    <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
                        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
                            <div className="flex items-center w-full lg:w-auto">
                                <div className="relative flex items-center w-full lg:w-[220px]">
                                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground pointer-events-none" />
                                    <Input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-8 pr-8 rounded-l-full rounded-r-none"
                                    />
                                    <Button
                                        type="reset"
                                        size="icon"
                                        className="bg-transparent hover:border hover:rounded-full hover:bg-transparent hover:text-gray-800 shadow-none absolute right-1 top-1/2 -translate-y-1/2 transform"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        <X className="h-4 w-4 text-gray-950" />
                                    </Button>
                                </div>
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full sm:w-auto rounded-r-full rounded-l-none"
                                >
                                    Cari
                                </Button>
                            </div>
                        </form>
                        <Link href="/admin/products/add" passHref>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Plus className="w-5 h-5 mr-2" />
                                Add produk
                            </Button>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    {currentSort}
                                    <SortDesc className="w-5 h-5 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                                <DropdownMenuItem onClick={() => handleSort('A-Z')}>
                                    <ArrowUpAZ className="mr-2 h-4 w-4" />
                                    <span>A-Z</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSort('Z-A')}>
                                    <ArrowDownAZ className="mr-2 h-4 w-4" />
                                    <span>Z-A</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSort('Newest')}>
                                    <ArrowDownWideNarrow className="mr-2 h-4 w-4" />
                                    <span>Newest</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSort('Oldest')}>
                                    <ArrowUpWideNarrow className="mr-2 h-4 w-4" />
                                    <span>Oldest</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                {/* Daftar Produk */}
                <div className="space-y-4">
                    {loading ? (
                        Array.from({ length: 2 }).map((_, index) => (
                            <ProductCardSkeleton key={index} />
                        ))
                    ) : products.length === 0 ? (
                        <div className="py-8">
                            <EmptyState 
                                icon={PackageOpen}
                                title="Tidak Ada Produk"
                                description="Anda belum menambahkan satupun produk. Klik tombol 'Add produk' untuk menambahkan data ke katalog."
                            />
                        </div>
                    ) : (
                        products.map((product, index) => (
                            <div ref={index === products.length - 1 ? lastProductElementRef : null} key={`${product.id}-${index}`}>
                                <ProductCard
                                    onDelete={handleDeleteProduct}
                                    product={{
                                        product_id: product.id,
                                        name: product.name,
                                        description: product.description,
                                        category_id: product.category_id,
                                        name: product.name,
                                        stock: product.stock,
                                        images: product.images,
                                        price_type: product.price_type,
                                        fixed_price: product.price,
                                        wholesale_prices: product.wholesale_prices,
                                    }}
                                />
                            </div>
                        ))
                    )}
                    {loadingMore && (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}