import { Prisma } from '@prisma/client';

const columnData = Prisma.validator<Prisma.ColumnArgs>()({
  select: { title: true, position: true, boardId: true }
})

export type ColumnData = Prisma.ColumnGetPayload<typeof columnData>

const taskData = Prisma.validator<Prisma.TaskArgs>()({
  select: { description: true, position: true, columnId: true, category: true, user: true }
})

export type TaskData = Prisma.TaskGetPayload<typeof columnData>

