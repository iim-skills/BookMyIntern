/**
 * One-time migration: mark all existing users as emailVerified=true.
 *
 * Run ONCE from the job-portal/ directory:
 *   npx ts-node --project tsconfig.json scripts/fix-unverified-users.ts
 *
 * Or run with tsx (simpler):
 *   npx tsx scripts/fix-unverified-users.ts
 *
 * This is safe to run multiple times — it only updates documents where
 * emailVerified is falsy.
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set. Add it to .env.local');
  process.exit(1);
}

async function run() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI);

  const result = await mongoose.connection.collection('users').updateMany(
    { emailVerified: { $ne: true } },
    { $set: { emailVerified: true, verificationToken: null, tokenExpiry: null } }
  );

  console.log(`Done! Updated ${result.modifiedCount} user(s).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
