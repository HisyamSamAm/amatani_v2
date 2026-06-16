"use client";

import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/shadcnUi/sidebar";
import { Separator } from "@/components/shadcnUi/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/shadcnUi/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcnUi/card";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/shadcnUi/chart";
import { getDashboardStatsAction, getRecentUsersAction } from "@/app/actions/v2/dashboard/admin/users/userActions";
import { Users, Package, ShoppingCart, Warehouse, TrendingUp, Loader2 } from "lucide-react";
import { Badge } from "@/components/shadcnUi/badge";
import { Avatar, AvatarFallback } from "@/components/shadcnUi/avatar";

const chartConfig = {
    count: { label: "Jumlah", color: "hsl(var(--chart-1))" },
};

// Data grafik statis mingguan (placeholder sampai tabel orders dibuat)
const weeklyData = [
    { day: "Sen", count: 0 },
    { day: "Sel", count: 0 },
    { day: "Rab", count: 0 },
    { day: "Kam", count: 0 },
    { day: "Jum", count: 0 },
    { day: "Sab", count: 0 },
    { day: "Min", count: 0 },
];

function StatCard({ icon: Icon, title, value, desc, color }) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="h-4 w-4 text-white" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {value !== null ? value.toLocaleString('id-ID') : <Loader2 className="h-5 w-5 animate-spin" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </CardContent>
        </Card>
    );
}

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [statsResult, usersResult] = await Promise.all([
                    getDashboardStatsAction(),
                    getRecentUsersAction(),
                ]);
                if (statsResult.success) setStats(statsResult.data);
                if (usersResult.success) setRecentUsers(usersResult.data);
            } catch (err) {
                console.error("Dashboard load error:", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Dashboard</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={Users}
                        title="Total Pengguna"
                        value={stats?.totalUsers ?? null}
                        desc="Semua pengguna terdaftar"
                        color="bg-blue-500"
                    />
                    <StatCard
                        icon={Package}
                        title="Total Produk"
                        value={stats?.totalProducts ?? null}
                        desc="Produk aktif di katalog"
                        color="bg-emerald-500"
                    />
                    <StatCard
                        icon={ShoppingCart}
                        title="Item di Keranjang"
                        value={stats?.totalCartItems ?? null}
                        desc="Item belum di-checkout"
                        color="bg-orange-500"
                    />
                    <StatCard
                        icon={Warehouse}
                        title="Total Stok"
                        value={stats?.totalStock ?? null}
                        desc="Unit tersedia di gudang"
                        color="bg-rose-500"
                    />
                </div>

                {/* Chart + Recent Users */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Weekly Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Aktivitas Mingguan</CardTitle>
                            <CardDescription>
                                Grafik aktivitas 7 hari terakhir — akan aktif setelah modul pesanan tersambung
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[220px] w-full">
                                <BarChart data={weeklyData} margin={{ top: 24 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="day"
                                        tickLine={false}
                                        tickMargin={8}
                                        axisLine={false}
                                    />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                    <Bar dataKey="count" fill="var(--color-count)" radius={6}>
                                        <LabelList position="top" offset={10} className="fill-foreground" fontSize={11} />
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Recent Users */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Pengguna Terbaru</CardTitle>
                            <CardDescription>5 pengguna terakhir terdaftar</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : recentUsers.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">Belum ada pengguna</p>
                            ) : (
                                <ul className="space-y-3">
                                    {recentUsers.map((user) => (
                                        <li key={user.id} className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="text-xs">
                                                    {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'NA'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{user.name || 'Tanpa Nama'}</p>
                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs shrink-0">
                                                {user.role}
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Info Banner */}
                <Card className="border-dashed border-orange-300 bg-orange-50 dark:bg-orange-950/20">
                    <CardContent className="flex items-center gap-3 py-4">
                        <TrendingUp className="h-5 w-5 text-orange-500 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Dashboard dalam pengembangan</p>
                            <p className="text-xs text-orange-600 dark:text-orange-500">
                                Statistik pesanan dan transaksi akan tampil setelah tabel <code className="font-mono">orders</code> dan <code className="font-mono">payments</code> dibuat di database.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}