"use client";

import { useEffect, useState, useTransition } from "react";
import { SidebarTrigger } from "@/components/shadcnUi/sidebar";
import { Separator } from "@/components/shadcnUi/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/shadcnUi/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcnUi/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcnUi/table";
import { Button } from "@/components/shadcnUi/button";
import { Input } from "@/components/shadcnUi/input";
import { Badge } from "@/components/shadcnUi/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/shadcnUi/alert-dialog";
import { Loader2, Search, ShoppingCart, Users, Banknote, Trash2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { getAllCartOrdersAction, deleteCartItemAction, getOrderSummaryAction } from "@/app/actions/v2/dashboard/admin/orders/ordersActions";

function formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

function formatDate(ts) {
    if (!ts) return "-";
    return new Date(ts).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [summary, setSummary] = useState(null);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, startDelete] = useTransition();
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [ordersResult, summaryResult] = await Promise.all([
                getAllCartOrdersAction(),
                getOrderSummaryAction(),
            ]);
            if (ordersResult.success) setOrders(ordersResult.data);
            if (summaryResult.success) setSummary(summaryResult.data);
        } catch (e) {
            toast.error("Gagal memuat data pesanan");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = (item) => setDeleteTarget(item);

    const confirmDelete = () => {
        if (!deleteTarget) return;
        startDelete(async () => {
            const result = await deleteCartItemAction(deleteTarget.id);
            if (result.success) {
                toast.success("Item berhasil dihapus dari keranjang");
                setOrders(prev => prev.filter(o => o.id !== deleteTarget.id));
                setDeleteTarget(null);
            } else {
                toast.error(result.error || "Gagal menghapus item");
            }
        });
    };

    const filtered = orders.filter(o =>
        o.user_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.user_email?.toLowerCase().includes(search.toLowerCase()) ||
        o.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <Toaster position="top-right" />
            <header className="flex h-16 shrink-0 items-center gap-2">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Pesanan</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            <div className="p-4 space-y-4">
                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Item Keranjang</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {summary ? parseInt(summary.total_items).toLocaleString('id-ID') : <Loader2 className="h-5 w-5 animate-spin" />}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pengguna Aktif</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {summary ? parseInt(summary.active_users).toLocaleString('id-ID') : <Loader2 className="h-5 w-5 animate-spin" />}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Nilai Keranjang</CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {summary ? formatCurrency(summary.total_value) : <Loader2 className="h-5 w-5 animate-spin" />}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Info notice */}
                <div className="rounded-lg border border-dashed border-blue-300 bg-blue-50 dark:bg-blue-950/20 px-4 py-3 text-sm text-blue-700 dark:text-blue-400">
                    <strong>Catatan:</strong> Halaman ini menampilkan item yang ada di keranjang belanja pengguna.
                    Tabel <code className="font-mono">orders</code> dan <code className="font-mono">payments</code> belum dibuat — fitur checkout belum tersedia.
                </div>

                {/* Search & Table */}
                <div className="rounded-md border bg-white dark:bg-background">
                    <div className="flex items-center gap-3 p-4 border-b">
                        <h2 className="font-semibold text-base flex-1">Item di Keranjang Pengguna</h2>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama, email, produk..."
                                className="pl-8 w-64"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground text-sm">
                            {search ? "Tidak ada hasil yang cocok" : "Belum ada item di keranjang"}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Pengguna</TableHead>
                                    <TableHead>Produk</TableHead>
                                    <TableHead>Tipe Harga</TableHead>
                                    <TableHead className="text-right">Harga Satuan</TableHead>
                                    <TableHead className="text-center">Qty</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead className="text-center">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-sm">{item.user_name || 'N/A'}</p>
                                                <p className="text-xs text-muted-foreground">{item.user_email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={item.price_type === 'wholesale' ? 'default' : 'secondary'}>
                                                {item.price_type === 'wholesale' ? 'Grosir' : 'Ecer'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatCurrency(item.unit_price * item.quantity)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{formatDate(item.created_at)}</TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(item)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            {/* Delete confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Item Keranjang?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Produk <strong>{deleteTarget?.name}</strong> milik <strong>{deleteTarget?.user_name}</strong> akan dihapus dari keranjang.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}