"use client";

import { SidebarTrigger } from "@/components/shadcnUi/sidebar";
import { Separator } from "@/components/shadcnUi/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/shadcnUi/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcnUi/card";
import { Receipt, CreditCard, ClipboardList, AlertCircle } from "lucide-react";

const steps = [
    {
        icon: ClipboardList,
        title: "Buat Tabel Database",
        desc: "Buat tabel orders dan payments di PostgreSQL.",
        code: `CREATE TABLE orders (
  order_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  status      VARCHAR(20) DEFAULT 'pending',
  total       BIGINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payments (
  payment_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(order_id) ON DELETE CASCADE,
  method          VARCHAR(50),
  status          VARCHAR(20) DEFAULT 'pending',
  paid_at         TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);`,
    },
    {
        icon: CreditCard,
        title: "Buat Server Actions",
        desc: "Buat file app/actions/v2/dashboard/admin/transactions/transactionActions.js untuk query DB.",
        code: null,
    },
    {
        icon: Receipt,
        title: "Sambungkan ke Halaman Ini",
        desc: "Gunakan Server Actions untuk menampilkan daftar transaksi di halaman ini.",
        code: null,
    },
];

export default function TransactionPage() {
    return (
        <div>
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
                                <BreadcrumbPage>Transaksi</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            <div className="p-4 space-y-6">
                {/* Status banner */}
                <div className="flex items-start gap-3 rounded-lg border border-orange-300 bg-orange-50 dark:bg-orange-950/20 p-4">
                    <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-orange-700 dark:text-orange-400">Halaman dalam pengembangan</p>
                        <p className="text-sm text-orange-600 dark:text-orange-500 mt-1">
                            Fitur transaksi membutuhkan tabel <code className="font-mono">orders</code> dan <code className="font-mono">payments</code> di database.
                            Selesaikan langkah-langkah di bawah untuk mengaktifkan halaman ini.
                        </p>
                    </div>
                </div>

                {/* Roadmap */}
                <h2 className="text-base font-semibold">Langkah untuk Mengaktifkan Transaksi</h2>
                <div className="grid gap-4">
                    {steps.map((step, idx) => (
                        <Card key={idx}>
                            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                    <step.icon className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Langkah {idx + 1}</p>
                                    <CardTitle className="text-sm">{step.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground">{step.desc}</p>
                                {step.code && (
                                    <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                        <code>{step.code}</code>
                                    </pre>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
