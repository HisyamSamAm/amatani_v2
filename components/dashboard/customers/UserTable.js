import { useState, useMemo, useTransition } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/shadcnUi/table";
import { Button } from "@/components/shadcnUi/button";
import { MoreHorizontal, ArrowUpDown, Check, X, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcnUi/avatar";
import { Badge } from "@/components/shadcnUi/badge";
import { ColumnToggle } from './ColoumToggle';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/shadcnUi/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/shadcnUi/dropdown-menu";

export function UserTable({ users, onDelete, onEdit }) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [columns, setColumns] = useState([
        { key: 'avatar', label: 'Avatar', isVisible: true },
        { key: 'name', label: 'Name', isVisible: true },
        { key: 'email', label: 'Email', isVisible: true },
        { key: 'role', label: 'Role', isVisible: true },
        { key: 'verification', label: 'Verifikasi Email', isVisible: true },
    ]);

    const [isPending, startTransition] = useTransition();
    const [deletingUserId, setDeletingUserId] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const toggleColumn = (columnKey) => {
        setColumns(columns.map(col =>
            col.key === columnKey ? { ...col, isVisible: !col.isVisible } : col
        ));
    };

    const visibleColumns = useMemo(() => columns.filter(col => col.isVisible), [columns]);

    const sortedUsers = useMemo(() => {
        let sortableUsers = [...users];
        if (sortConfig.key) {
            sortableUsers.sort((a, b) => {
                const aValue = a[sortConfig.key] ?? '';
                const bValue = b[sortConfig.key] ?? '';
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableUsers;
    }, [users, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleDelete = (userId) => {
        setDeletingUserId(userId);
        startTransition(() => {
            onDelete(userId);
        });
    };

    const openDialog = (userId) => {
        setSelectedUserId(userId);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setSelectedUserId(null);
    };

    return (
        <div>
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">User List</h2>
                <ColumnToggle columns={columns} toggleColumn={toggleColumn} />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {visibleColumns.map((column) => (
                                <TableHead key={column.key}>
                                    {column.key !== 'avatar' && column.key !== 'verification' ? (
                                        <Button variant="ghost" onClick={() => requestSort(column.key)}>
                                            {column.label}
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        column.label
                                    )}
                                </TableHead>
                            ))}
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedUsers.map((user) => (
                            <TableRow key={user.id}>
                                {columns.find(col => col.key === 'avatar')?.isVisible && (
                                    <TableCell>
                                        <Avatar>
                                            <AvatarImage src={user.image} alt={user.name} />
                                            <AvatarFallback>
                                                {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'NA'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                )}
                                {columns.find(col => col.key === 'name')?.isVisible && (
                                    <TableCell>{user.name || 'N/A'}</TableCell>
                                )}
                                {columns.find(col => col.key === 'email')?.isVisible && (
                                    <TableCell>{user.email}</TableCell>
                                )}
                                {columns.find(col => col.key === 'role')?.isVisible && (
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                            {user.role || 'customer'}
                                        </Badge>
                                    </TableCell>
                                )}
                                {columns.find(col => col.key === 'verification')?.isVisible && (
                                    <TableCell>
                                        <Badge
                                            variant={user.emailVerified ? 'default' : 'secondary'}
                                            className={user.emailVerified ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-600'}
                                        >
                                            {user.emailVerified ? <Check className="h-3 w-3 mr-1 inline" /> : <X className="h-3 w-3 mr-1 inline" />}
                                            Email
                                        </Badge>
                                    </TableCell>
                                )}

                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => onEdit(user.id)}>Edit</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => openDialog(user.id)}
                                            >
                                                Hapus
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus pengguna ini?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeDialog}>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(selectedUserId)} disabled={isPending && deletingUserId === selectedUserId}>
                            {isPending && deletingUserId === selectedUserId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}