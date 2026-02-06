"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Task as TaskCardTask } from "@/components/task-card";
import type { BoardWithColumnsAndTasks, ColumnWithTasks } from "@/lib/boards";

const GUEST_BOARD_STORAGE_KEY = "todogether_guest_board";
export const GUEST_BOARD_ID = "guest-local";

function defaultGuestBoard(): BoardWithColumnsAndTasks {
  return {
    id: GUEST_BOARD_ID,
    title: "Mon tableau",
    description: null,
    locked: false,
    columns: [],
  };
}

function guestTask(
  overrides: Partial<TaskCardTask> & { id: string; title: string }
): TaskCardTask {
  const now = new Date().toISOString();
  return {
    id: overrides.id,
    title: overrides.title,
    description: overrides.description ?? undefined,
    priority: overrides.priority ?? "medium",
    author: "Invité",
    assignee: undefined,
    assigneeId: undefined,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

function parseStoredBoard(raw: string | null): BoardWithColumnsAndTasks | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as BoardWithColumnsAndTasks).id === "string" &&
      Array.isArray((parsed as BoardWithColumnsAndTasks).columns)
    ) {
      return parsed as BoardWithColumnsAndTasks;
    }
  } catch {
    // ignore
  }
  return null;
}

function persist(board: BoardWithColumnsAndTasks) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_BOARD_STORAGE_KEY, JSON.stringify(board));
}

type GuestBoardContextValue = {
  board: BoardWithColumnsAndTasks;
  setBoard: React.Dispatch<React.SetStateAction<BoardWithColumnsAndTasks>>;
  updateBoardTitle: (title: string) => void;
  updateBoardLocked: (locked: boolean) => void;
  resetBoard: () => void;
  createColumn: (title: string, color?: string | null) => void;
  updateColumn: (
    columnId: string,
    data: { title?: string; color?: string | null }
  ) => void;
  createTask: (
    columnId: string,
    data: {
      title: string;
      description?: string | null;
      priority?: string;
    }
  ) => void;
  updateTask: (
    taskId: string,
    data: Partial<Pick<TaskCardTask, "title" | "description" | "priority">>
  ) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, targetColumnId: string) => void;
};

const GuestBoardContext = createContext<GuestBoardContextValue | null>(null);

export function GuestBoardProvider({ children }: { children: ReactNode }) {
  const [board, setBoardState] = useState<BoardWithColumnsAndTasks>(
    () => defaultGuestBoard()
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(GUEST_BOARD_STORAGE_KEY);
    const stored = parseStoredBoard(raw);
    if (stored) setBoardState(stored);
    setHydrated(true);
  }, []);

  const setBoard = useCallback(
    (updater: React.SetStateAction<BoardWithColumnsAndTasks>) => {
      setBoardState((prev) => {
        const next =
          typeof updater === "function" ? updater(prev) : updater;
        persist(next);
        return next;
      });
    },
    []
  );

  const updateBoardTitle = useCallback(
    (title: string) => {
      setBoard((prev) => ({ ...prev, title: title.trim() || prev.title }));
    },
    [setBoard]
  );

  const updateBoardLocked = useCallback(
    (locked: boolean) => {
      setBoard((prev) => ({ ...prev, locked }));
    },
    [setBoard]
  );

  const resetBoard = useCallback(() => {
    const def = defaultGuestBoard();
    setBoardState(def);
    persist(def);
  }, []);

  const createColumn = useCallback(
    (title: string, color?: string | null) => {
      const id = crypto.randomUUID();
      setBoard((prev) => {
        const order = prev.columns.length;
        const newColumn: ColumnWithTasks = {
          id,
          title: title.trim() || "Colonne",
          order,
          color: color ?? null,
          tasks: [],
        };
        return {
          ...prev,
          columns: [...prev.columns, newColumn].sort((a, b) => a.order - b.order),
        };
      });
    },
    [setBoard]
  );

  const updateColumn = useCallback(
    (
      columnId: string,
      data: { title?: string; color?: string | null }
    ) => {
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) =>
          col.id !== columnId
            ? col
            : {
                ...col,
                ...(data.title !== undefined && { title: data.title.trim() }),
                ...(data.color !== undefined && { color: data.color }),
              }
        ),
      }));
    },
    [setBoard]
  );

  const createTask = useCallback(
    (
      columnId: string,
      data: {
        title: string;
        description?: string | null;
        priority?: string;
      }
    ) => {
      const taskId = crypto.randomUUID();
      const priority =
        data.priority === "low" ||
        data.priority === "high" ||
        data.priority === "critical"
          ? data.priority
          : "medium";
      const task = guestTask({
        id: taskId,
        title: data.title.trim() || "Tâche",
        description: data.description?.trim() || undefined,
        priority,
      });
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) => {
          if (col.id !== columnId) return col;
          return {
            ...col,
            tasks: [...col.tasks, { ...task, id: taskId }],
          };
        }),
      }));
    },
    [setBoard]
  );

  const updateTask = useCallback(
    (
      taskId: string,
      data: Partial<Pick<TaskCardTask, "title" | "description" | "priority">>
    ) => {
      const now = new Date().toISOString();
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) =>
            t.id !== taskId
              ? t
              : {
                  ...t,
                  ...(data.title !== undefined && { title: data.title.trim() }),
                  ...(data.description !== undefined && {
                    description: data.description?.trim() || undefined,
                  }),
                  ...(data.priority !== undefined && {
                    priority:
                      data.priority === "low" ||
                      data.priority === "high" ||
                      data.priority === "critical"
                        ? data.priority
                        : "medium",
                  }),
                  updatedAt: now,
                }
          ),
        })),
      }));
    },
    [setBoard]
  );

  const deleteTask = useCallback((taskId: string) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) => t.id !== taskId),
      })),
    }));
  }, [setBoard]);

  const moveTask = useCallback(
    (taskId: string, targetColumnId: string) => {
      const now = new Date().toISOString();
      setBoard((prev) => {
        let moved: TaskCardTask | null = null;
        const columnsWithout = prev.columns.map((col) => {
          const found = col.tasks.find((t) => t.id === taskId);
          if (found) {
            moved = { ...found, updatedAt: now };
            return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
          }
          return col;
        });
        if (!moved) return prev;
        return {
          ...prev,
          columns: columnsWithout.map((col) => {
            if (col.id !== targetColumnId) return col;
            return {
              ...col,
              tasks: [...col.tasks, moved!],
            };
          }),
        };
      });
    },
    [setBoard]
  );

  const value: GuestBoardContextValue = {
    board,
    setBoard,
    updateBoardTitle,
    updateBoardLocked,
    resetBoard,
    createColumn,
    updateColumn,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  };

  if (!hydrated) {
    return (
      <GuestBoardContext.Provider value={value}>
        {children}
      </GuestBoardContext.Provider>
    );
  }

  return (
    <GuestBoardContext.Provider value={value}>
      {children}
    </GuestBoardContext.Provider>
  );
}

export function useGuestBoard(): GuestBoardContextValue {
  const ctx = useContext(GuestBoardContext);
  if (!ctx) throw new Error("useGuestBoard must be used within GuestBoardProvider");
  return ctx;
}

export function useGuestBoardOrNull(): GuestBoardContextValue | null {
  return useContext(GuestBoardContext);
}
