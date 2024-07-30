import { prisma } from "../db";
import { Request, Response } from "express";

// Create Column
export const createColumn = async (req: Request, res: Response) => {
  const boardId = parseInt(req.params["board_id"]);
  const { title } = req.body;
  let position = 0;
  const columnAggregate = await prisma.column.aggregate({
    _max: {
      position: true,
    },
    where: {
      boardId: boardId,
    },
  });

  if (columnAggregate._max.position !== null) {
    position = columnAggregate._max.position + 1;
  }

  const result = await prisma.column.create({
    data: { title, boardId: boardId, position: position },
  });
  res.json({ data: result });
};

// Move Column
export const moveColumn = async (req: Request, res: Response) => {
  const boardId = parseInt(req.params["board_id"]);
  const { column, position } = req.body;

  const col = await prisma.column.findUnique({
    where: { id: column },
  });

  if (col) {
    // Update source positions
    await prisma.column.updateMany({
      where: { boardId: boardId, position: { gt: col.position } },
      data: { position: { decrement: 1 } },
    });
    // Update target positions
    await prisma.column.updateMany({
      where: { boardId: boardId, position: { gte: position } },
      data: { position: { increment: 1 } },
    });

    const updatedCol = await prisma.column.update({
      where: {
        id: column,
      },
      data: {
        position: position,
      },
    });
    res.json({ data: updatedCol });
  }
  res.json({ data: null });
};

// Delete Column
export const deleteColumn = async (req: Request, res: Response) => {
  const id = parseInt(req.params["id"]);
  const result = await prisma.column.delete({
    where: { id },
  });
  res.json({ data: result });
};

// Update Column
export const updateColumn = async (req: Request, res: Response) => {
  const id = parseInt(req.params["id"]);
  const { title } = req.body;
  const result = await prisma.column.update({
    where: { id },
    data: { title },
  });
  res.json({ data: result });
};

// Get all columns
export const getAllColumns = async (req: Request, res: Response) => {
  const boardId = parseInt(req.params["board_id"]);
  const result = await prisma.column.findMany({ where: { boardId: boardId } });
  res.json({ data: result });
};
