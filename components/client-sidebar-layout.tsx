 "use client";
 
import { useRef, useState } from "react";
import { LayoutDashboard, Plus, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { RabbitIcon, type RabbitIconHandle } from "@/components/ui/rabbit";
import { useAppAlert } from "@/components/alert-provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { UserDialog } from "@/components/user-dialog";

type ClientSidebarLayoutProps = {
  children: React.ReactNode;
};

type UserButtonInFooterProps = {
  tooltipText: string;
  onClick: () => void;
};

function UserButtonInFooter({ tooltipText, onClick }: UserButtonInFooterProps) {
  const { isMobile } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="mx-auto"
          aria-label={tooltipText}
          onClick={onClick}
        >
          <UserRound className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={isMobile}>
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
}

export function ClientSidebarLayout({ children }: ClientSidebarLayoutProps) {
  const tApp = useTranslations("App");
  const tSidebar = useTranslations("Sidebar");
  const tUser = useTranslations("User");
  const locale = useLocale();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const rabbitRef = useRef<RabbitIconHandle | null>(null);
  const { showAlert } = useAppAlert();

  const handleOpenUserDialog = () => {
    setUserDialogOpen(true);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setUser({ name: "Alice Martin", email: "alice@example.com" });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const toggleLocale = () => {
    const nextLocale = locale === "fr" ? "en" : "fr";
    document.cookie = `locale=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  };

  const userTooltipText = isAuthenticated
    ? user?.name ?? tUser("accountTitle")
    : tUser("guest");

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <Sidebar collapsible="none" className="border-r">
            <SidebarHeader className="flex flex-col items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-md"
                aria-label={tApp("titleShort")}
                onClick={() => {
                  rabbitRef.current?.startAnimation();
                  window.setTimeout(() => {
                    rabbitRef.current?.stopAnimation();
                  }, 650);

                  showAlert({
                    variant: "default",
                    title: tApp("alertTitle"),
                    description: (
                      <span className="inline-flex flex-wrap items-center gap-x-1 gap-y-1">
                        <span>{tApp("alertDiscover")}</span>
                        <a
                          href="https://clementpoudree.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium underline underline-offset-2 hover:text-primary"
                        >
                          {tApp("alertMyPortfolio")}
                        </a>
                        <span>{tApp("alertAndThe")}</span>
                        <a
                          href="https://github.com/MRK4/todogether"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium underline underline-offset-2 hover:text-primary"
                        >
                          {tApp("alertGithubRepo")}
                        </a>
                        <span>{tApp("alertOfTheApp")}</span>
                      </span>
                    ),
                    autoCloseMs: 6000,
                  });
                }}
              >
                <RabbitIcon
                  ref={rabbitRef}
                  size={24}
                  className="text-sidebar-foreground"
                />
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  {tSidebar("languageToggle")}
                </TooltipContent>
              </Tooltip>
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
                      className="justify-center border border-dashed border-sidebar-border"
                      tooltip={tSidebar("newBoard")}
                    >
                      <Plus />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
              <UserButtonInFooter
                tooltipText={userTooltipText}
                onClick={handleOpenUserDialog}
              />
            </SidebarFooter>

            <SidebarRail />
          </Sidebar>

          <SidebarInset>{children}</SidebarInset>
        </div>

        <UserDialog
          open={userDialogOpen}
          onOpenChange={setUserDialogOpen}
          isAuthenticated={isAuthenticated}
          user={user ?? undefined}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      </SidebarProvider>
  );
}

export default ClientSidebarLayout;


