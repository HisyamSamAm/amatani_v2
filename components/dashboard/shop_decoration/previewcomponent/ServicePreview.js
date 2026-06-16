import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AspectRatio } from "@/components/shadcnUi/aspect-ratio"
import { GetServiceAction } from "@/app/actions/v2/dashboard/admin/sd/serviceActions";

export default function ServicePreview({ refresh }) {
    const [features, setFeatures] = useState([]);

    const fetchJasaData = async () => {
        try {
            const result = await GetServiceAction();
            if (result.success) {
                setFeatures(result.data);
            } else {
                console.error('Failed to fetch jasa data:', result.error);
            }
        } catch (error) {
            console.error('Error fetching jasa data:', error);
        }
    };

    // Mengambil data jasa saat komponen pertama kali dirender
    useEffect(() => {
        fetchJasaData();
    }, []);

    // Mengambil data jasa setiap kali refresh berubah
    useEffect(() => {
        fetchJasaData();
    }, [refresh]);

    return (
        <section className="bg-white w-full">
            <div className="container mx-auto py-6 w-full">
                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
                    Kostumisasi Produk <br /> Sesuai Kebutuhan Usaha Anda.
                </h2>
                <div className="flex justify-center mb-8">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        Gratis!
                    </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            className="relative group flex flex-col items-center overflow-hidden w-full md:w-full"
                        >
                            <AspectRatio ratio={1 / 2} className="w-full ">
                                <Image
                                    src={feature.image_path}
                                    alt="Jasa Gratis"
                                    fill
                                    className="object-cover"
                                    style={{ position: 'absolute' }}
                                />
                            </AspectRatio>
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 text-sm font-semibold py-1 px-4 rounded-full shadow-md">
                                {feature.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}