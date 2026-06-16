import { AppSidebar } from "@/components/dashboard/appSidebar"
import { SidebarInset, SidebarProvider } from "@/components/shadcnUi/sidebar"
import { auth } from "@/auth";

export default async function DashboardLayout({ children }) {
    const session = await auth();


    return (
        <SidebarProvider>
            <AppSidebar user={session?.user} />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}