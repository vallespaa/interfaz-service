const redis = require('redis');

const subClient = redis.createClient({ url: process.env.REDIS_URL });
const pubClient = redis.createClient({ url: process.env.REDIS_URL });

subClient.on('error', (err) => console.error('Redis Sub Error:', err));
pubClient.on('error', (err) => console.error('Redis Pub Error:', err));

module.exports = { subClient, pubClient };