 "use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function Home() {
  const tBoard = useTranslations("Board");
  const columnKeys: Array<"todo" | "inProgress" | "done"> = [
    "todo",
    "inProgress",
    "done",
  ];

  return (
    <div className="flex h-full flex-1 flex-col gap-4 p-6">
      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {columnKeys.map((key) => (
          <Card
            key={key}
            className="flex h-full min-h-[280px] min-w-[260px] max-w-xs flex-1 flex-col"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
              <CardTitle className="text-sm font-semibold">
                {tBoard(`columns.${key}`)}
              </CardTitle>
              <Button
                size="icon-xs"
                variant="ghost"
                className="shrink-0"
              >
                <Plus className="h-3 w-3" />
                <span className="sr-only">
                  {tBoard("empty")}
                </span>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              <div className="border-dashed bg-muted/40 text-muted-foreground flex flex-1 items-center justify-center rounded-lg border text-xs">
                {tBoard("empty")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
