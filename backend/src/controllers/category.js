import { getSession } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

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
