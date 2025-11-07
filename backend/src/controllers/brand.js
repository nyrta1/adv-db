import { getSession } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

// Получить все бренды
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

// Получить бренд по ID
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

// 💥 Создать новый бренд
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
