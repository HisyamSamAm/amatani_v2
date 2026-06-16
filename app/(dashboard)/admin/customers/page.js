"use client";
import { SidebarTrigger } from "@/components/shadcnUi/sidebar";
import { Separator } from "@/components/shadcnUi/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/shadcnUi/breadcrumb";
import { UserTable } from "@/components/dashboard/customers/UserTable";
import { useEffect, useState } from "react";
import { getAllUsers, deleteUserAction, updateUserAction } from "@/app/actions/v2/dashboard/admin/users/userActions";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/shadcnUi/dialog";
import { Button } from "@/components/shadcnUi/button";
import { Input } from "@/components/shadcnUi/input";
import { Label } from "@/components/shadcnUi/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcnUi/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CustomersPage() {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", email: "", role: "customer" });

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Gagal memuat data pelanggan");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId) => {
        try {
            await deleteUserAction(userId);
            setUsers(users.filter(user => user.id !== userId));
            toast.success("Pengguna berhasil dihapus");
        } catch (error) {
            console.error("Gagal menghapus:", error);
            toast.error("Gagal menghapus pengguna");
        }
    };

    const handleEditUser = (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        setEditingUser(user);
        setEditForm({ name: user.name || "", email: user.email || "", role: user.role || "customer" });
        setIsEditOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        setIsSaving(true);
        try {
            const result = await updateUserAction(editingUser.id, editForm.name, editForm.email, editForm.role);
            if (result.success) {
                toast.success("Data pengguna berhasil diperbarui");
                setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u));
                setIsEditOpen(false);
                setEditingUser(null);
            } else {
                toast.error(result.error || "Gagal memperbarui pengguna");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan saat menyimpan");
        } finally {
            setIsSaving(false);
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
                                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Customers</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            <div className="p-4 space-y-4 sm:mx-12">
                <h1 className="text-lg font-semibold">Semua Customers</h1>
                <UserTable users={users} onDelete={handleDeleteUser} onEdit={handleEditUser} />
            </div>

            {/* Modal Edit User */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Pengguna</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nama</Label>
                            <Input
                                id="edit-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                placeholder="Nama lengkap"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                placeholder="email@contoh.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">Role</Label>
                            <Select
                                value={editForm.role}
                                onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                            >
                                <SelectTrigger id="edit-role">
                                    <SelectValue placeholder="Pilih role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="customer">Customer</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
                        <Button onClick={handleSaveEdit} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}