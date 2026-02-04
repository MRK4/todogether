import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const createBodySchema = z.object({
  title: z.string().min(1).max(100),
  order: z.number().int().min(0).optional(),
  color: z.union([z.string().regex(/^#[0-9A-Fa-f]{6}$/), z.literal("")]).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { id: true },
  });
  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const columns = await prisma.column.findMany({
    where: { boardId },
    orderBy: { order: "asc" },
    select: { id: true, title: true, order: true, color: true },
  });

  return NextResponse.json(columns);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { id: true },
  });
  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = createBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  let order = parsed.data.order;
  if (order === undefined) {
    const max = await prisma.column.aggregate({
      where: { boardId },
      _max: { order: true },
    });
    order = (max._max.order ?? -1) + 1;
  }

  const color =
    parsed.data.color && parsed.data.color !== "" ? parsed.data.color : null;

  const column = await prisma.column.create({
    data: {
      boardId,
      title: parsed.data.title.trim(),
      order,
      color,
    },
  });

  return NextResponse.json(
    { id: column.id, title: column.title, order: column.order, color: column.color },
    { status: 201 }
  );
}
