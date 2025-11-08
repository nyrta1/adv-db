import { getSession } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new product and link it to Brand + Category
 * Expected body:
 * {
 *   "name": "Air Max 2024",
 *   "price": 159.99,
 *   "stock": 50,
 *   "brandId": "uuid-of-brand",
 *   "categoryId": "uuid-of-category",
 *   "imageUrl": "https://example.com/image.jpg" // optional
 * }
 */
export const createProduct = async (req, res) => {
  const session = getSession();
  const { name, price, stock, brandId, categoryId, imageUrl } = req.body;

  if (!name || !brandId || !categoryId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: name, brandId, categoryId',
    });
  }

  try {
    const id = uuidv4();

    const result = await session.run(
      `
      MATCH (b:Brand {id: $brandId})
      MATCH (c:Category {id: $categoryId})
      CREATE (p:Product {
        id: $id,
        name: $name,
        price: $price,
        stock: $stock,
        imageUrl: $imageUrl
      })
      MERGE (p)-[:OFFERED_BY]->(b)
      MERGE (p)-[:BELONGS_TO]->(c)
      RETURN p, b, c
      `,
      {
        id,
        name,
        price: price ?? null,
        stock: stock ?? 0,
        imageUrl: imageUrl || null,
        brandId,
        categoryId,
      }
    );

    const record = result.records[0];
    const product = {
      ...record.get('p').properties,
      brand: record.get('b').properties,
      category: record.get('c').properties,
    };

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  } finally {
    await session.close();
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (req, res) => {
  const session = getSession();
  const { id } = req.params;
  const user = req.user; // берём из basicAuth middleware

  try {
    // 🧩 1️⃣ Находим товар
    const result = await session.run(
      `
      MATCH (p:Product {id: $id})
      OPTIONAL MATCH (p)-[:BELONGS_TO]->(c:Category)
      OPTIONAL MATCH (p)-[:OFFERED_BY]->(b:Brand)
      RETURN p, c, b
      `,
      { id }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const record = result.records[0];
    const product = {
      ...record.get('p').properties,
      category: record.get('c')?.properties || null,
      brand: record.get('b')?.properties || null,
    };

    // 🧠 2️⃣ Если пользователь авторизован — создаём связь VIEWED
    if (user?.id) {
      await session.run(
        `
        MATCH (u:User {id: $userId}), (p:Product {id: $productId})
        MERGE (u)-[r:VIEWED]->(p)
        ON CREATE SET r.timestamp = datetime()
        ON MATCH SET r.timestamp = datetime()
        `,
        { userId: user.id, productId: id }
      );
    }

    // 🧾 3️⃣ Возвращаем результат
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    await session.close();
  }
};

// Combined handler: supports search + brand + category filters
export const getProducts = async (req, res) => {
    const session = getSession();
    const { query, brand, category } = req.query;

    try {
        // Build Cypher dynamically based on filters
        let cypher = `
      MATCH (p:Product)-[:BELONGS_TO]->(c:Category),
            (p)-[:OFFERED_BY]->(b:Brand)
    `;
        const conditions = [];
        const params = {};

        if (brand) {
            conditions.push('toLower(b.name) = toLower($brand)');
            params.brand = brand;
        }

        if (category) {
            conditions.push('toLower(c.name) = toLower($category)');
            params.category = category;
        }

        if (query) {
            conditions.push(
                '(toLower(p.name) CONTAINS toLower($query) OR toLower(p.description) CONTAINS toLower($query))'
            );
            params.query = query;
        }

        if (conditions.length > 0) {
            cypher += ' WHERE ' + conditions.join(' AND ');
        }

        cypher += ' RETURN p, b, c';

        const result = await session.run(cypher, params);

        const products = result.records.map((r) => ({
            ...r.get('p').properties,
            brand: r.get('b').properties,
            category: r.get('c').properties,
        }));

        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
        await session.close();
    }
};

export const toggleLikeProduct = async (req, res) => {
  const session = getSession();
  const userId = req.user?.id;
  const { id: productId } = req.params;

  if (!userId || !productId)
    return res.status(400).json({ success: false, message: "Missing user or product ID" });

  try {
    // Проверяем — уже лайкнут?
    const check = await session.run(
      `
      MATCH (u:User {id: $userId})-[r:LIKED]->(p:Product {id: $productId})
      RETURN r
      `,
      { userId, productId }
    );

    if (check.records.length > 0) {
      // Удаляем лайк
      await session.run(
        `MATCH (u:User {id: $userId})-[r:LIKED]->(p:Product {id: $productId}) DELETE r`,
        { userId, productId }
      );
      return res.json({ success: true, liked: false, message: "Product unliked" });
    } else {
      // Создаём лайк
      await session.run(
        `
        MATCH (u:User {id: $userId}), (p:Product {id: $productId})
        MERGE (u)-[r:LIKED]->(p)
        ON CREATE SET r.timestamp = datetime()
        RETURN p
        `,
        { userId, productId }
      );
      return res.json({ success: true, liked: true, message: "Product liked" });
    }
  } catch (err) {
    console.error("Error toggling like:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    await session.close();
  }
};

export const buyProduct = async (req, res) => {
  const session = getSession();
  const userId = req.user?.id;
  const { id: productId } = req.params;

  if (!userId || !productId)
    return res.status(400).json({ success: false, message: "Missing user or product ID" });

  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $userId}), (p:Product {id: $productId})
      WHERE p.stock > 0
      SET p.stock = p.stock - 1
      MERGE (u)-[r:BOUGHT]->(p)
      ON CREATE SET r.timestamp = datetime(), r.quantity = 1
      ON MATCH SET r.quantity = coalesce(r.quantity, 0) + 1, r.timestamp = datetime()
      RETURN p
      `,
      { userId, productId }
    );

    if (result.records.length === 0)
      return res.status(400).json({ success: false, message: "Product out of stock" });

    res.json({ success: true, message: "Product purchased successfully" });
  } catch (err) {
    console.error("Error buying product:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    await session.close();
  }
};
