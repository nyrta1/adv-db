/**
 * @openapi
 * tags:
 *   name: Brands
 *   description: Brand management
 */

import { getSession } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @openapi
 * /brands:
 *   get:
 *     summary: Get all brands
 *     tags: [Brands]
 *     security:
 *       - BasicAuth: []
 *     responses:
 *       200:
 *         description: List of brands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 brands:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "59f3d880-a62b-4c26-8968-9311a2b51d51"
 *                       name:
 *                         type: string
 *                         example: "Nike"
 *       500:
 *         description: Internal server error
 */
export const getBrands = async (req, res) => {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (b:Brand)
      RETURN b
      ORDER BY b.name ASC
    `);

    const brands = result.records.map(r => r.get('b').properties);
    res.status(200).json({ success: true, brands });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    await session.close();
  }
};

/**
 * @openapi
 * /brands/{id}:
 *   get:
 *     summary: Get brand by ID
 *     tags: [Brands]
 *     security:
 *       - BasicAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "c132a0bb-8ce1-44a2-b169-d320d44f34c3"
 *     responses:
 *       200:
 *         description: Brand object returned
 *       404:
 *         description: Brand not found
 */
export const getBrandById = async (req, res) => {
  const session = getSession();
  const { id } = req.params;

  try {
    const result = await session.run(
      `MATCH (b:Brand {id: $id}) RETURN b`,
      { id }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    const brand = result.records[0].get('b').properties;
    res.status(200).json({ success: true, brand });
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    await session.close();
  }
};

/**
 * @openapi
 * /brands:
 *   post:
 *     summary: Create a new brand
 *     tags: [Brands]
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
 *                 example: "Adidas"
 *     responses:
 *       201:
 *         description: Brand created successfully
 *       400:
 *         description: Missing required field [name]
 *       500:
 *         description: Internal server error
 */
export const createBrand = async (req, res) => {
  const session = getSession();
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  try {
    const id = uuidv4();
    await session.run(
      `
      CREATE (b:Brand {id: $id, name: $name})
      RETURN b
      `,
      { id, name }
    );

    res.status(201).json({ success: true, message: 'Brand created successfully', brand: { id, name } });
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    await session.close();
  }
};
