const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
require('dotenv').config();
const Chunk = require('../models/Chunk');
const Document = require('../models/Document');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const allChunks = await Chunk.find({});
  const validDocIds = new Set((await Document.find({}).select('_id')).map((d) => d._id.toString()));

  const orphaned = allChunks.filter((c) => !validDocIds.has(c.document.toString()));

  console.log(`Total chunks: ${allChunks.length}`);
  console.log(`Orphaned chunks (document deleted): ${orphaned.length}`);
  console.log('Orphaned chunk IDs:', orphaned.map((c) => c._id.toString()));

  await mongoose.disconnect();
}

run();