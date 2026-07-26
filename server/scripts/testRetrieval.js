const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
require('dotenv').config();
const retrieveChunks = require('../utils/retrieveChunks');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);

    const userId = '6a5a16eb9a3bf6cc2ea84315';
    const query = 'How many casual leave days am I allowed?';

    const results = await retrieveChunks(userId, query, 5, 0.5);

    console.log(`\nQuery: "${query}"`);
    console.log(`Found ${results.length} relevant chunks:\n`);

    results.forEach((r, i) => {
        console.log(`--- Result ${i + 1} (score: ${r.score.toFixed(4)}) ---`);
        console.log(`From: ${r.originalName}`);
        console.log(r.context);
        console.log();
    });

    await mongoose.disconnect();
}

run();