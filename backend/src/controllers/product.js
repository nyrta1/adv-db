// src/controllers/product.js
import { getSession } from '../config/db.js';

/**
 * Get product by ID
 */
export const getProductById = async (req, res) => {
    const session = getSession();
    const { id } = req.params;

    try {
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
