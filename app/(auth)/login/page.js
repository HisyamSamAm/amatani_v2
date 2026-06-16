'use client'

import { useState, useTransition } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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

const loginSchema = z.object({
    email: z.string().email({ message: "Format email tidak valid" }),
    password: z.string().min(1, { message: "Kata sandi tidak boleh kosong" }),
});

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = (values) => {
        setError('');
        startTransition(async () => {
            const res = await signIn('credentials', {
                redirect: false,
                email: values.email,
                password: values.password,
            });

            if (res?.error) {
                setError('Email atau password salah!');
            } else {
                router.push('/');
                router.refresh();
            }
        });
    };

    return (
        <div className="h-screen w-full flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center items-center min-h-screen">
                <div className="w-full max-w-md space-y-6">
                    <h1 className="text-2xl font-semibold">Selamat datang</h1>
                    <p className="text-gray-600">
                        Belum punya akun?{' '}
                        <Link href="/signup" className="text-rose-600 hover:underline">
                            Daftar di sini
                        </Link>
                    </p>

                    {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('registered') === 'true' && (
                        <Alert className="bg-green-50 border-green-200 text-green-800">
                            <AlertDescription className="font-medium text-center">
                                Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.
                            </AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Formulir Login Kredensial menggunakan Shadcn Form & Zod */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                                placeholder="Masukkan sandi rahasia"
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
                                        Memproses...
                                    </>
                                ) : (
                                    'Masuk'
                                )}
                            </Button>
                        </form>
                    </Form>

                    <p className="text-sm text-gray-600 mt-4 text-center">
                        Dengan masuk, saya menyetujui{' '}
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
