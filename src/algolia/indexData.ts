import { PrismaClient } from '@prisma/client';
import { algoliaIndex } from "../algolia/client";
import { Request, Response } from 'express';
const prisma = new PrismaClient();


export const indexData = async (req: Request, res: Response) => {
  try {
    const data = await prisma.task.findMany();

    const objects = data.map((item) => ({
      objectID: item.id,
      ...item,
    }));

    await algoliaIndex.saveObjects(objects);

    return res.status(200).json("Data indexed to Algolia");
  } catch (error) {
    console.error("Error indexing data:", error);
    return res.status(500).json({ error: "Failed to index data" });
  } finally {
    await prisma.$disconnect();
  }
};

export const searchData = async (req: Request, res: Response) => {
    const { query } = req.query;
  
    try {
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
  
      const { hits, nbHits } = await algoliaIndex.search(query as string);
  
      res.json({
        totalResults: nbHits,
        results: hits,
      });
    } catch (error) {
      console.error('Error searching data:', error);
      res.status(500).json({ error: 'Failed to perform search' });
    }
  };
