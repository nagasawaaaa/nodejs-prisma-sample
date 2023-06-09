import express, { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const app = express();
const port = 3000;

const prisma = new PrismaClient();

app.use(express.json());

app.get('/users', async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: { posts: true },
  });
  return res.json(users);
});

app.post('/users', async (req: Request, res: Response) => {
  const { name, email } = req.body;
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
      },
    });
    return res.json(user);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        return res.status(400).json({ error: 'There is a unique constraint violation, a new user cannot be created with this email' });
      }
    }
    return res.status(400).json(e);
  }
});

app.put('/users/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { name },
    });
    return res.json(user);
  } catch (e) {
    return res.status(400).json(e);
  }
});

app.delete('/users/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const user = await prisma.user.delete({
      where: { id },
    });
    return res.json(user);
  } catch (e) {
    return res.status(400).json(e);
  }
});

app.get('/users/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
      include: { posts: true },
    });
    return res.json(user);
  } catch (e) {
    return res.status(400).json(e);
  }
});

app.post('/posts', async (req: Request, res: Response) => {
  const { title, content, authorId } = req.body;
  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId
      }
    });
    return res.json(post);
  } catch (e) {
    return res.status(400).json(e);
  }
});

app.get('/posts', async (req: Request, res: Response) => {
  const posts = await prisma.post.findMany();
  return res.json(posts);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
