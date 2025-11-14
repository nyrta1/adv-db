/**
 * @openapi
 * tags:
 *   name: Categories
 *   description: Category management
 */

import { getSession } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Get all product categories
 *     tags: [Categories]
 *     security:
 *       - BasicAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 38cc83f2-95e8-4f4a-b7c1-4972f598cb8a
 *                       name:
 *                         type: string
 *                         example: Sneakers
 *       500:
 *         description: Internal server error
 */
export const getCategories = async (req, res) => {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (c:Category)
      RETURN c
      ORDER BY c.name ASC
    `);

    const categories = result.records.map(r => r.get('c').properties);
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    await session.close();
  }
};

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Categories]
 *     security:
 *       - BasicAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "d19f4d1a-92a3-448e-a3f0-71b0f80d9c32"
 *     responses:
 *       200:
 *         description: Category object returned
 *       404:
 *         description: Category not found
 */
export const getCategoryById = async (req, res) => {
  const session = getSession();
  const { id } = req.params;

  try {
    const result = await session.run(
      `MATCH (c:Category {id: $id}) RETURN c`,
      { id }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const category = result.records[0].get('c').properties;
    res.status(200).json({ success: true, category });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    await session.close();
  }
};

/**
 * @openapi
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - BasicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Running Shoes"
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Missing required field [name]
 *       500:
 *         description: Internal server error
 */
export const createCategory = async (req, res) => {
  const session = getSession();
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  try {
    const id = uuidv4();
    await session.run(
      `
      CREATE (c:Category {id: $id, name: $name})
      RETURN c
      `,
      { id, name }
    );

    res.status(201).json({ success: true, message: 'Category created successfully', category: { id, name } });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    await session.close();
  }
};
