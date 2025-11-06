import neo4j from 'neo4j-driver';

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

try {
    const serverInfo = await driver.getServerInfo();
    console.log('Neo4j AuraDB connected successfully:', serverInfo.agent);
} catch {
    console.error('Could not connect to database');
}

export const getSession = () => driver.session();

process.on('exit', async () => {
    await driver.close();
    console.log('Neo4j AuraDB driver closed.');
});
