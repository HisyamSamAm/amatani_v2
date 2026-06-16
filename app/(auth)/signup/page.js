'use client'

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { registerUser } from '@/app/actions/v2/auth/registerAction';
import { Button } from '@/components/shadcnUi/button';
import { Input } from '@/components/shadcnUi/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/shadcnUi/form';
import { Alert, AlertDescription } from '@/components/shadcnUi/alert';
import { Loader2, AlertCircle } from 'lucide-react';

const signupSchema = z.object({
    name: z.string().min(2, { message: "Nama lengkap minimal 2 karakter" }),
    email: z.string().email({ message: "Format email tidak valid" }),
    password: z.string().min(6, { message: "Kata sandi minimal 6 karakter" }),
});

export default function SignupPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();

    const form = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
    });

    const onSubmit = (values) => {
        setError('');
        
        startTransition(async () => {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('email', values.email);
            formData.append('password', values.password);

            const res = await registerUser(formData);

            if (res?.error) {
                setError(res.error);
            } else if (res?.success) {
                router.push('/login?registered=true');
            }
        });
    };

    return (
        <div className="h-screen w-full flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center items-center min-h-screen">
                <div className="w-full max-w-md space-y-6">
                    <h1 className="text-2xl font-semibold">Daftar Akun Baru</h1>
                    <p className="text-gray-600">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="text-rose-600 hover:underline">
                            Masuk di sini
                        </Link>
                    </p>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Formulir Pendaftaran menggunakan Shadcn Form & Zod */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Lengkap</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Masukkan nama Anda"
                                                {...field}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="nama@email.com"
                                                {...field}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Minimal 6 karakter"
                                                {...field}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button 
                                type="submit" 
                                className="w-full bg-rose-600 text-white hover:bg-rose-700"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Mendaftarkan...
                                    </>
                                ) : (
                                    'Daftar Sekarang'
                                )}
                            </Button>
                        </form>
                    </Form>

                    <p className="text-sm text-gray-600 mt-4 text-center">
                        Dengan mendaftar, saya menyetujui{' '}
                        <a href="#" className="text-rose-600 hover:underline">Syarat & Ketentuan</a>{' '}
                        serta{' '}
                        <a href="#" className="text-rose-600 hover:underline">Kebijakan Privasi</a> Kitapanen.
                    </p>
                </div>
            </div>

            {/* Right side with image */}
            <div className="hidden md:flex w-1/2 bg-gray-100 items-center justify-center">
                <Image src="/FE/img01.jpg" width={800} height={800} alt="Background Image" className="w-full h-full object-cover" />
            </div>
        </div>
    );
}
