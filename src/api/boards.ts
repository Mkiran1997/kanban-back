import { prisma } from '../db'
import { Request, Response } from 'express'
import { ColumnData } from '../types'

// Get All Boards
export const getAllBoards = async (req: Request, res: Response) => {
  const boards = await prisma.board.findMany()
  res.json({ data: boards })
}

// Get Board by id, with columns and tasks
export const getBoard = async (req: Request, res: Response) => {
  const id = parseInt(req.params['id'])
  const board = await prisma.board.findUnique({
    where: { id },
    include: {
      columns: {
        orderBy: {
          position: 'asc'
        },
        include: {
          tasks: {
            orderBy: {
              position: 'asc'
            },
          }
        }
      }
    }
  })
  res.json({ data: board })
}

// Create Board
export const createBoard = async (req: Request, res: Response) => {
  const { title, description } = req.body

  const result = await prisma.board.create({
    data: {
      title,
      description
    }
  })
  // Default columns
  let defaultColumns: ColumnData[] = [
    {
      title: 'To Do',
      position: 0,
      boardId: result.id
    },
    {
      title: 'In Process',
      position: 1,
      boardId: result.id
    },
    {
      title: 'Done',
      position: 2,
      boardId: result.id
    }

  ]
  await Promise.all(
    defaultColumns.map(async (col) => {
      await prisma.column.create({
        data: col,
      })
    })
  )
  res.json({ data: result })
}

// Delete Board
export const deleteBoard = async (req: Request, res: Response) => {
  const id = parseInt(req.params['id'])
  const result = await prisma.board.delete({
    where: { id }
  })
  res.json({ data: result })
}

// Update Board
export const updateBoard = async (req: Request, res: Response) => {
  const id = parseInt(req.params['id'])
  const { title, description } = req.body
  const result = await prisma.board.update({
    where: { id },
    data: {
      title,
      description
    }
  })
  res.json({ data: result })
}