/**
 * @openapi
 * tags:
 *   name: Users
 *   description: User management & auth
 */

import bcrypt from 'bcrypt';
import { getSession } from '../config/db.js';

/**
 * @openapi
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - age
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@gmail.com
 *               age:
 *                 type: integer
 *                 example: 21
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists
 */
export const createUser = async (req, res) => {
    const session = getSession();
    const { name, email, age, password } = req.body;

    try {
        // Check for existing user
        const check = await session.run(`MATCH (u:User {email: $email}) RETURN u`, { email });
        if (check.records.length > 0) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await session.run(
            `
                CREATE (u:User {
                    id: randomUUID(),
                    name: $name,
                    email: $email,
                    age: $age,
                    password: $password
                })
                RETURN u
            `,
            { name, email, age: parseInt(age), password: hashedPassword }
        );

        const user = result.records[0].get('u').properties;
        delete user.password;

        res.status(201).json({ success: true, user });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
        await session.close();
    }
};

/**
 * @openapi
 * /users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@gmail.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
export const loginUser = async (req, res) => {
    const session = getSession();
    const { email, password } = req.body;

    try {
        const result = await session.run(`MATCH (u:User {email: $email}) RETURN u`, { email });

        if (result.records.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = result.records[0].get('u').properties;
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        delete user.password;
        res.status(200).json({ success: true, message: 'Login successful', user });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
        await session.close();
    }
};

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - BasicAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 77fa8f00-c71d-4ca4-b193-9c8ee2f743df
 *     responses:
 *       200:
 *         description: User object
 *       404:
 *         description: User not found
 */
export const getUser = async (req, res) => {
    const session = getSession();
    const { id } = req.params;

    try {
        const result = await session.run(`MATCH (u:User {id: $id}) RETURN u`, { id });

        if (result.records.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = result.records[0].get('u').properties;
        delete user.password;

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
        await session.close();
    }
};

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - BasicAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 77fa8f00-c71d-4ca4-b193-9c8ee2f743df
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: New Name
 *               email:
 *                 type: string
 *                 example: newemail@gmail.com
 *               age:
 *                 type: integer
 *                 example: 25
 *               password:
 *                 type: string
 *                 example: newpass123
 *     responses:
 *       200:
 *         description: Updated user data
 *       404:
 *         description: User not found
 */
export const updateUser = async (req, res) => {
    const session = getSession();
    const { id } = req.params;
    const { name, email, age, password } = req.body;

    try {
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

        const result = await session.run(
            `
                MATCH (u:User {id: $id})
                SET u.name = coalesce($name, u.name),
                    u.email = coalesce($email, u.email),
                    u.age = coalesce($age, u.age),
                    u.password = coalesce($password, u.password)
                RETURN u
            `,
            { id, name, email, age: age ? parseInt(age) : null, password: hashedPassword }
        );

        if (result.records.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = result.records[0].get('u').properties;
        delete user.password;

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
        await session.close();
    }
};

/**
 * @openapi
 * /users/{id}/history:
 *   get:
 *     summary: Get user activity history (viewed, liked, bought)
 *     tags: [Users]
 *     security:
 *       - BasicAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: 77fa8f00-c71d-4ca4-b193-9c8ee2f743df
 *     responses:
 *       200:
 *         description: List of actions sorted by timestamp (desc)
 *       404:
 *         description: User not found
 */
export const getUserHistory = async (req, res) => {
    const session = getSession();
    const { id: userId } = req.params;

    if (userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    try {
        const result = await session.run(
            `
      MATCH (u:User {id: $userId})
      OPTIONAL MATCH (u)-[v:VIEWED]->(vp:Product)
      OPTIONAL MATCH (u)-[l:LIKED]->(lp:Product)
      OPTIONAL MATCH (u)-[b:BOUGHT]->(bp:Product)
      RETURN 
        collect({type: "VIEWED", product: vp, time: v.timestamp}) +
        collect({type: "LIKED", product: lp, time: l.timestamp}) +
        collect({type: "BOUGHT", product: bp, time: b.timestamp}) as actions
      `,
            { userId }
        );

        const actions = result.records[0].get('actions') || [];
        const history = actions
            .filter((a) => a.product)
            .map((a) => ({
                type: a.type,
                timestamp: a.time,
                ...a.product.properties,
            }))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({ success: true, history });
    } catch (err) {
        console.error('Error fetching history:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        await session.close();
    }
};
