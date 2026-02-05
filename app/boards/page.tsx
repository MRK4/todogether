import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { auth } from "@/auth";
import { getBoardsForUser } from "@/lib/boards";
import { Button } from "@/components/ui/button";

export default async function BoardsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const boards = await getBoardsForUser(session.user.id);
  const t = await getTranslations("Board");

  return (
    <div className="flex min-h-full w-full flex-col gap-6 p-6">
      <h1 className="font-mono text-2xl font-semibold">{t("boardsTitle")}</h1>

      {boards.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("noBoards")}</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <li key={board.id}>
              <Button variant="outline" className="h-auto w-full justify-start p-4" asChild>
                <Link href={`/boards/${board.id}`}>
                  <span className="truncate font-medium">{board.title}</span>
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
