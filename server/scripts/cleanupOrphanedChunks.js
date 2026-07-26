const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
require('dotenv').config();
const Chunk = require('../models/Chunk');
const Document = require('../models/Document');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const validDocIds = (await Document.find({}).select('_id')).map((d) => d._id);

  const result = await Chunk.deleteMany({ document: { $nin: validDocIds } });

  console.log(`Deleted ${result.deletedCount} orphaned chunks`);

  await mongoose.disconnect();
}

run();