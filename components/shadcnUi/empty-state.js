import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({ 
    icon: Icon = FolderOpen, 
    title = "Belum Ada Data", 
    description = "Sepertinya tempat ini masih kosong. Data yang ditambahkan akan muncul di sini.", 
    action, 
    className 
}) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px] border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50", className)}>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 mb-4">
                <Icon className="h-10 w-10 text-rose-600" aria-hidden="true" />
            </div>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 mb-6 text-sm text-gray-500 max-w-sm mx-auto">
                {description}
            </p>
            {action && (
                <div className="mt-4">
                    {action}
                </div>
            )}
        </div>
    );
}
