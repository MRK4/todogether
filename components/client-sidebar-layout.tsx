"use client";

import { LayoutDashboard, LogIn, Plus } from "lucide-react";

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
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <Sidebar collapsible="none" className="border-r">
          <SidebarHeader className="flex items-center justify-center gap-2">
            <span className="text-sm font-semibold tracking-tight">TG</span>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="lg"
                    className="justify-center"
                    tooltip="Tableaux du compte"
                  >
                    <LayoutDashboard />
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="lg"
                    className="justify-center"
                    tooltip="Nouveau tableau"
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
              aria-label="Se connecter"
            >
              <LogIn className="h-5 w-5" />
            </Button>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default ClientSidebarLayout;

