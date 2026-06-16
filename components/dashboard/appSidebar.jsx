'use client'

import {
  ChartColumnIncreasing,
  ChevronsUpDown,
  FileQuestion,
  LogOut,
  Package2,
  ShoppingCart,
  Star,
  UsersRound,
  WalletMinimal,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/shadcnUi/sidebar"
import { Home } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../shadcnUi/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../shadcnUi/avatar"
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../shadcnUi/button"
import { signOut } from "next-auth/react"

export function AppSidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter()

  const userName = user?.name || "Loading...";
  const userEmail = user?.email || "Loading...";
  const userAvatar = user?.image || "/FE/img02.png";

  return (
    <Sidebar collapsible="icon">
      {/* header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Avatar>
              <AvatarImage src="\FE\IconAmatani.svg" />
              <AvatarFallback>KP</AvatarFallback>
            </Avatar>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {/* content */}
      <SidebarContent>
        {/* group 1 */}
        <SidebarGroup>
          <SidebarGroupContent>
            {/* Home */}
            <SidebarMenu>
              <SidebarMenuItem >
                <SidebarMenuButton asChild isActive={pathname === "/admin"} className="w-full hover:bg-accent hover:text-accent-foreground">
                  <a href="/admin" className="w-full">
                    <Home />
                    <span>Home</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* grouop 2 */}
        <SidebarSeparator className="md:block" />
        <SidebarGroup>
          <SidebarGroupContent>
            {/* Home */}
            <SidebarMenu>
              <SidebarMenuItem >
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/products')} className="w-full hover:bg-accent hover:text-accent-foreground">
                  <a href="/admin/products" className="w-full">
                    <Package2 />
                    <span>Produk</span>
                  </a>
                </SidebarMenuButton>
                {/* <SidebarMenuBadge>24</SidebarMenuBadge> */}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarGroupContent>
            {/* Home */}
            <SidebarMenu>
              <SidebarMenuItem >
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/orders')} className="w-full hover:bg-accent hover:text-accent-foreground">
                  <a href="/admin/orders" className="w-full">
                    <ShoppingCart />
                    <span>Pesanan</span>
                  </a>
                </SidebarMenuButton>
                {/* <SidebarMenuBadge>24</SidebarMenuBadge> */}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarGroupContent>
            {/* Home */}
            <SidebarMenu>
              <SidebarMenuItem >
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/reviews')} className="w-full hover:bg-accent hover:text-accent-foreground">
                  <a href="/admin/reviews" className="w-full">
                    <Star />
                    <span>Penilaian</span>
                  </a>
                </SidebarMenuButton>
                {/* <SidebarMenuBadge>24</SidebarMenuBadge> */}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* group 3 */}
        <SidebarSeparator className="md:block" />
        <SidebarGroup>
          <SidebarGroupContent>
            {/* Home */}
            <SidebarMenu>
              <SidebarMenuItem >
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/wallet')} className="w-full hover:bg-accent hover:text-accent-foreground">
                  <a href="/admin/wallet" className="w-full">
                    <WalletMinimal />
                    <span>Dompet</span>
                  </a>
                </SidebarMenuButton>

              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* group 3 */}
        <SidebarSeparator className="md:block" />
        <SidebarGroup>
          <SidebarGroupContent>
            {/* Home */}
            <SidebarMenu>
              <SidebarMenuItem >
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/customers')} className="w-full hover:bg-accent hover:text-accent-foreground">
                  <a href="/admin/customers" className="w-full">
                    <UsersRound />
                    <span>Customers</span>
                  </a>
                </SidebarMenuButton>

              </SidebarMenuItem>
            </SidebarMenu>
            {/* Home */}
            <SidebarMenu>
              <SidebarMenuItem >
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/faq')} className="w-full hover:bg-accent hover:text-accent-foreground">
                  <a href="/admin/faq" className="w-full">
                    <FileQuestion />
                    <span>FAQ</span>
                  </a>
                </SidebarMenuButton>

              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* group 3 */}
        <SidebarSeparator className="md:block" />
        <SidebarGroup>
          <SidebarGroupContent>
            {/* Home */}
            <SidebarMenu>
              <SidebarMenuItem >
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/report')} className="w-full hover:bg-accent hover:text-accent-foreground">
                  <a href="/admin/report" className="w-full">
                    <ChartColumnIncreasing />
                    <span>Reports</span>
                  </a>
                </SidebarMenuButton>
                {/* <SidebarMenuBadge>24</SidebarMenuBadge> */}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarGroupContent>
            {/* Home */}
            <SidebarMenu>
              <SidebarMenuItem >
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/shop_decoration')} className="w-full hover:bg-accent hover:text-accent-foreground">
                  <a href="/admin/shop_decoration" className="w-full">
                    <ShoppingCart />
                    <span>Dekorasi Toko</span>
                  </a>
                </SidebarMenuButton>
                <SidebarMenuBadge></SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className=""
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={userAvatar}
                      alt={userName}
                    />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {userName}
                    </span>
                    <span className="truncate text-xs">
                      {userEmail}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={userAvatar}
                        alt={userName}
                      />
                      <AvatarFallback className="rounded-lg">
                        CN
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {userName}
                      </span>
                      <span className="truncate text-xs">
                        {userEmail}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  {/* logout */}
                  <Button variant='link' onClick={() => signOut({ callbackUrl: '/' })} className="w-full">
                    <LogOut />
                    Log out
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}