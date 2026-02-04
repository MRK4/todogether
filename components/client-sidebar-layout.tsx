"use client";

import { LayoutDashboard, LogIn, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";

type ClientSidebarLayoutProps = {
  children: React.ReactNode;
};

export function ClientSidebarLayout({ children }: ClientSidebarLayoutProps) {
  const tApp = useTranslations("App");
  const tSidebar = useTranslations("Sidebar");
  const locale = useLocale();
  const router = useRouter();

  const toggleLocale = () => {
    const nextLocale = locale === "fr" ? "en" : "fr";
    document.cookie = `locale=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <Sidebar collapsible="none" className="border-r">
          <SidebarHeader className="flex flex-col items-center justify-center gap-2">
            <span className="text-sm font-semibold tracking-tight">
              {tApp("titleShort")}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={tSidebar("languageToggle")}
              onClick={toggleLocale}
            >
              <span className="text-[10px] font-semibold uppercase">
                {locale === "fr" ? "FR" : "EN"}
              </span>
            </Button>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="lg"
                    className="justify-center"
                    tooltip={tSidebar("accountBoards")}
                  >
                    <LayoutDashboard />
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="lg"
                    className="justify-center"
                    tooltip={tSidebar("newBoard")}
                  >
                    <Plus />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <Button
              variant="ghost"
              size="icon"
              className="mx-auto"
              aria-label={tSidebar("signIn")}
            >
              <LogIn className="h-5 w-5" />
            </Button>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset>{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default ClientSidebarLayout;


