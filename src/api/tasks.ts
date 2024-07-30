import { prisma } from "../db";
import { Request, Response } from "express";
import { TaskCategories } from "./../utils/enum";

// Create Task
export const createTask = async (req: Request, res: Response) => {
  const columnId = parseInt(req.params["column_id"]);
  const { description, category, user } = req.body;
  let position = 0;

  const taskAggregate = await prisma.task.aggregate({
    _max: {
      position: true,
    },
    where: {
      columnId: columnId,
    },
  });

  if (taskAggregate._max.position !== null) {
    console.log(taskAggregate._max.position);
    position = taskAggregate._max.position + 1;
  } else {
    position = 0;
  }

  const result = await prisma.task.create({
    data: {
      description,
      columnId: columnId,
      position: position,
      category: category,
      user: user,
    },
  });
  res.json({ data: result });
};

// Move Task
export const moveTask = async (req: Request, res: Response) => {
  const boardId = parseInt(req.params["board_id"]);
  const { task, destination, position } = req.body;

  try {
    // Find the task to move
    const the_task = await prisma.task.findUnique({
      where: { id: task },
    });

    if (!the_task) {
      // Task not found, return a 404 response
      return res.status(404).json({ error: "Task not found" });
    }

    // Update source positions
    await prisma.task.updateMany({
      where: {
        columnId: the_task.columnId,
        position: { gt: the_task.position },
      },
      data: { position: { decrement: 1 } },
    });

    // Update target positions
    await prisma.task.updateMany({
      where: { columnId: destination, position: { gte: position } },
      data: { position: { increment: 1 } },
    });

    // Update the task's columnId and position
    const updatedTask = await prisma.task.update({
      where: {
        id: task,
      },
      data: {
        columnId: destination,
        position: position,
      },
    });

    // Send the updated task as the response
    return res.json({ data: updatedTask });
  } catch (error) {
    // Handle errors and send a 500 response
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete Task
export const deleteTask = async (req: Request, res: Response) => {
  const id = parseInt(req.params["id"]);
  const result = await prisma.task.delete({
    where: { id },
  });
  res.json({ data: result });
};

// Update Task
export const updateTask = async (req: Request, res: Response) => {
  const id = parseInt(req.params["id"]);
  const { description } = req.body;
  const result = await prisma.task.update({
    where: { id },
    data: { description },
  });
  res.json({ data: result });
};

export const filterTask = async (req: Request, res: Response) => {
  // Extract query parameters
  const { users, categories, startDate, endDate, columnId } = req.body;

  try {
    // Construct the where condition object based on provided query parameters
    const whereCondition: {
      user?: {
        in?: string[];
      };
      category?: {
        in?: string[];
      };
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
      columnId?: number;
    } = {};

    if (Array.isArray(users) && users.length > 0) {
      whereCondition.user = {
        in: users,
      };
    }

    if (Array.isArray(categories) && categories.length > 0) {
      whereCondition.category = {
        in: categories,
      };
    }
    if (startDate && endDate) {
      // Validate and convert date strings to Date objects
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Ensure the end date is not before the start date
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        return res.status(400).json({ error: "Invalid date range" });
      }

      whereCondition.createdAt = {
        gte: start,
        lte: end,
      };
    }

    if (columnId !== undefined) {
      whereCondition.columnId = columnId;
    }

    // Perform the query with optional filtering
    const tasks = await prisma.task.findMany({
      where: whereCondition,
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const taskCategories = async (req: Request, res: Response) => {
  const users = Object.values(TaskCategories);
  res.json({ data: users });
};
