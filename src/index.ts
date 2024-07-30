import cors from "cors";
import swaggerUi from "swagger-ui-express";
import express, { ErrorRequestHandler } from "express";
import { Request, Response, NextFunction } from "express";
import { validate, ValidationError } from "express-validation";
// import { PrismaClient } from '@prisma/client';
// import { algoliaMiddleware } from './../prisma/middlewares';
import { userList } from "./api/users";
import * as swaggerDocument from "./swagger.json";
import { filterValidation } from "./validations/task";
import {
  getAllBoards,
  getBoard,
  createBoard,
  deleteBoard,
  updateBoard,
} from "./api/boards";
import {
  createColumn,
  moveColumn,
  deleteColumn,
  updateColumn,
  getAllColumns,
} from "./api/columns";
import {
  createTask,
  moveTask,
  deleteTask,
  updateTask,
  filterTask,
  taskCategories,
} from "./api/tasks";
import { indexData, searchData } from "./algolia/indexData";
import { configureIndex } from "./algolia/configureIndex";

// const prisma = new PrismaClient();
// prisma.$use(algoliaMiddleware);

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Board routes
app.post(`/api/v1/boards`, createBoard);
app.get(`/api/v1/boards`, getAllBoards);
app.get(`/api/v1/boards/:id`, getBoard);
app.delete(`/api/v1/boards/:id`, deleteBoard);
app.patch(`/api/v1/boards/:id`, updateBoard);

// Column routes
app.get(`/api/v1/board/:board_id/columns`, getAllColumns);
app.post(`/api/v1/boards/:board_id/columns`, createColumn);
app.post(`/api/v1/boards/:board_id/move-column`, moveColumn);
app.delete(`/api/v1/boards/:board_id/columns/:id`, deleteColumn);
app.patch(`/api/v1/boards/:board_id/columns/:id`, updateColumn);

// Task routes
app.post(`/api/v1/boards/:board_id/columns/:column_id/tasks`, createTask);
app.post(`/api/v1/boards/:board_id/move-task`, moveTask);
app.delete(`/api/v1/boards/:board_id/columns/:column_id/tasks/:id`, deleteTask);
app.patch(`/api/v1/boards/:board_id/columns/:column_id/tasks/:id`, updateTask);
app.post(`/api/v1/tasks`, validate(filterValidation), filterTask);
app.get(`/api/v1/users`, userList);
app.get(`/api/v1/tasks/categories`, taskCategories);

//Insert Index Data
app.post(`/api/v1/tasks/indexData`, indexData);
app.get(`/api/v1/tasks/search`, searchData);

app.use(
  (
    err: ErrorRequestHandler,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json(err.details.body);
    }
    return res.status(500).json(err);
  }
);

// Start server
configureIndex().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost${PORT}`);
  });
});
