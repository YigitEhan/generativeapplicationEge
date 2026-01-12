import { Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middleware/auth';

const userService = new UserService();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

