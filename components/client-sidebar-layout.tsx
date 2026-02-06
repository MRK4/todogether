"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Plus, UserRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { signOut, useSession } from "next-auth/react";

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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createBoard } from "@/lib/actions/boards";
import { UserDialog } from "@/components/user-dialog";

type BoardListItem = {
  id: string;
  title: string;
  description: string | null;
};

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
  const tBoard = useTranslations("Board");
  const tSidebar = useTranslations("Sidebar");
  const tUser = useTranslations("User");
  const locale = useLocale();
  const router = useRouter();

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [guestBoardsDialogOpen, setGuestBoardsDialogOpen] = useState(false);
  const rabbitRef = useRef<RabbitIconHandle | null>(null);
  const { showAlert } = useAppAlert();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = !!session?.user;
  const [userBoards, setUserBoards] = useState<BoardListItem[]>([]);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !session?.user?.id) {
      setUserBoards([]);
      return;
    }
    fetch("/api/boards")
      .then((res) => res.json())
      .then((data: BoardListItem[]) => setUserBoards(Array.isArray(data) ? data : []))
      .catch(() => setUserBoards([]));
  }, [isAuthenticated, session?.user?.id]);

  const user = session?.user
    ? {
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      }
    : null;

  useEffect(() => {
    console.log("user", session?.user);
  }, [session?.user]);

  const handleOpenUserDialog = () => {
    setUserDialogOpen(true);
  };

  const handleLogin = () => {
    setUserDialogOpen(false);
    router.push("/login");
  };

  const handleLogout = () => {
    setUserDialogOpen(false);
    signOut({ callbackUrl: "/" });
  };

  const toggleLocale = () => {
    const nextLocale = locale === "fr" ? "en" : "fr";
    document.cookie = `locale=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  };

  const userTooltipText = isAuthenticated
    ? user?.name ?? tUser("accountTitle")
    : tUser("guest");

  const handleBoardsAction = async () => {
    if (!isAuthenticated) {
      setGuestBoardsDialogOpen(true);
      return;
    }
    setIsCreatingBoard(true);
    const result = await createBoard(tBoard("newBoardDefaultTitle"));
    setIsCreatingBoard(false);
    if (result.success) {
      const boards = await fetch("/api/boards").then((res) => res.json());
      setUserBoards(Array.isArray(boards) ? boards : []);
      router.push(`/boards/${result.boardId}`);
    }
  };

  return (
    <SidebarProvider defaultOpen className="h-full min-h-0">
<div className="flex h-full min-h-0 min-w-0 w-full">
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
                  {!isAuthenticated ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        size="lg"
                        className="justify-center"
                        tooltip={tSidebar("myBoard")}
                        isActive={pathname === "/"}
                      >
                        <Link href="/">
                          <LayoutDashboard className="shrink-0 size-4" />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : (
                    userBoards.map((board) => (
                      <SidebarMenuItem key={board.id}>
                        <SidebarMenuButton
                          asChild
                          size="lg"
                          className="justify-center"
                          tooltip={board.title}
                          isActive={
                              pathname === `/boards/${board.id}` ||
                              (pathname === "/" && userBoards[0]?.id === board.id)
                            }
                        >
                          <Link href={`/boards/${board.id}`}>
                            <LayoutDashboard className="shrink-0 size-4" />
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      size="lg"
                      className="justify-center border border-dashed border-sidebar-border"
                      tooltip={tSidebar("newBoard")}
                      onClick={handleBoardsAction}
                      disabled={isCreatingBoard}
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

          <SidebarInset className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 min-w-0 flex-1 min-w-full w-full overflow-auto">
              {children}
            </div>
          </SidebarInset>
        </div>

        <UserDialog
          open={userDialogOpen}
          onOpenChange={setUserDialogOpen}
          isAuthenticated={isAuthenticated}
          user={user ?? undefined}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        <AlertDialog
          open={guestBoardsDialogOpen}
          onOpenChange={setGuestBoardsDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {tSidebar("guestBoardsDialogTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {tSidebar("guestBoardsDialogDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button
                type="button"
                onClick={() => {
                  setGuestBoardsDialogOpen(false);
                  router.push("/login");
                }}
              >
                {tSidebar("guestBoardsDialogClose")}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarProvider>
  );
}

export default ClientSidebarLayout;


