const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
require('dotenv').config();
const retrieveChunks = require('../utils/retrieveChunks');
const generateAnswer = require('../utils/generateAnswer');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const userId = '6a5a16eb9a3bf6cc2ea84315';
  const question = 'How many casual leave days am I allowed?';

  console.log(`Question: ${question}\n`);

  const chunks = await retrieveChunks(userId, question);
  console.log(`Retrieved ${chunks.length} chunks\n`);

  const result = await generateAnswer(question, chunks);

  console.log('--- Answer ---');
  console.log(result.answer);
  console.log('\n--- Sources ---');
  console.log(result.sources);

  await mongoose.disconnect();
}

run();