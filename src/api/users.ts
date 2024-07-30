import { Request, Response } from "express";
import { Users } from "./../utils/enum";


export const userList = async (req: Request, res: Response) => {
  const users = Object.values(Users);
  res.json({ data: users });
};
