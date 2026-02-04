 "use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

const DEFAULT_COLUMNS = ["À faire", "En cours", "Terminé"];

export default function Home() {
  return (
    <div className="flex h-full flex-1 flex-col gap-4 p-6">
      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {DEFAULT_COLUMNS.map((title) => (
          <Card
            key={title}
            className="flex h-full min-h-[280px] min-w-[260px] max-w-xs flex-1 flex-col"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
              <CardTitle className="text-sm font-semibold">
                {title}
              </CardTitle>
              <Button
                size="icon-xs"
                variant="ghost"
                className="shrink-0"
              >
                <Plus className="h-3 w-3" />
                <span className="sr-only">
                  Ajouter une tâche dans &quot;{title}&quot;
                </span>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              <div className="border-dashed bg-muted/40 text-muted-foreground flex flex-1 items-center justify-center rounded-lg border text-xs">
                Aucune tâche pour l&apos;instant.
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
