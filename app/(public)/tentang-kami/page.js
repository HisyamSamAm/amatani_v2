import { Card, CardHeader, CardContent } from "@/components/shadcnUi/card";
import { AspectRatio } from "@/components/shadcnUi/aspect-ratio";
import { AlertCircle, Users, ShoppingCart, Globe } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "Tentang Kami | Amatani",
  description: "Pelajari lebih lanjut tentang misi, visi, dan komitmen Amatani dalam menyediakan produk pertanian segar dan berkualitas.",
};

export default function TentangKami() {
    return (
        <div className="container mx-auto py-20 px-6 lg:px-16">


            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-800 mb-6">Mengapa Memilih Kami?</h2>
                <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                    Kami berkomitmen untuk menyediakan pengalaman belanja yang luar biasa dengan fokus pada kualitas, layanan, dan inovasi.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {/* Customers */}
                <Card className="text-center">
                    <CardHeader className="p-6">
                        <Users className="w-12 h-12 text-rose-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800">Pelanggan Puas</h3>
                    </CardHeader>
                    <CardContent className="p-6">
                        <p className="text-gray-600">
                            Kami selalu mengutamakan kepuasan pelanggan dengan layanan yang ramah dan solusi tepat waktu.
                        </p>
                    </CardContent>
                </Card>

                {/* High-Quality Products */}
                <Card className="text-center">
                    <CardHeader className="p-6">
                        <ShoppingCart className="w-12 h-12 text-rose-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800">Produk Berkualitas</h3>
                    </CardHeader>
                    <CardContent className="p-6">
                        <p className="text-gray-600">
                            Semua produk kami dipilih dengan cermat untuk memastikan standar kualitas tertinggi.
                        </p>
                    </CardContent>
                </Card>

                {/* International Shipping */}
                <Card className="text-center">
                    <CardHeader className="p-6">
                        <Globe className="w-12 h-12 text-rose-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800">Pengiriman Internasional</h3>
                    </CardHeader>
                    <CardContent className="p-6">
                        <p className="text-gray-600">
                            Layanan pengiriman kami menjangkau seluruh dunia dengan cepat dan aman.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
