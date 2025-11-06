import bcrypt from 'bcrypt';
import { getSession } from '../config/db.js';

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
