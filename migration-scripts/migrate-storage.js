const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
// Load environment variables from .env.local
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// --- CONFIGURATION ---

// 1. OLD CLOUD DETAILS (Source)
const OLD_URL = 'https://jzgocimbraxghmvdqwno.supabase.co';
const OLD_SERVICE_KEY = 'PLACE_YOUR_OLD_SERVICE_ROLE_KEY_HERE'; // Found in Dashboard > Settings > API

// 2. NEW AWS DETAILS (Destination)
const NEW_URL = process.env.VITE_SUPABASE_URL;
const NEW_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 3. BUCKET NAME
const BUCKET_NAME = 'project-files';

// ---------------------

const oldClient = createClient(OLD_URL, OLD_SERVICE_KEY);
const newClient = createClient(NEW_URL, NEW_SERVICE_KEY);

async function migrate() {
  console.log('🚀 Starting Storage Migration...');

  // 1. List all files in the old bucket
  console.log('1️⃣ Listing files from old Supabase...');
  const { data: files, error: listError } = await oldClient
    .storage
    .from(BUCKET_NAME)
    .list('', { limit: 1000, offset: 0 }); // Note: recursive listing depends on folder structure

  if (listError) {
    console.error('❌ Error listing files:', listError);
    return;
  }

  console.log(`Found ${files.length} items (files/folders).`);

  // We need to handle folders recursively, but for KABS flattened structure, 
  // we usually have user_id/filename. Let's iterate.

  // NOTE: The .list() command at root might only show folders (user_ids).
  // We iterate through root items.
  for (const item of files) {
    if (!item.id) {
      // It's likely a folder
      console.log(`📂 Checking folder: ${item.name}`);
      const { data: subFiles } = await oldClient.storage.from(BUCKET_NAME).list(item.name);

      if (subFiles) {
        for (const file of subFiles) {
          await transferFile(`${item.name}/${file.name}`);
        }
      }
    } else {
      // It's a file at root
      await transferFile(item.name);
    }
  }

  console.log('✅ Migration Complete!');
}

async function transferFile(filePath) {
  console.log(`   Processing: ${filePath}`);

  // 2. Download from OLD
  const { data: blob, error: downError } = await oldClient
    .storage
    .from(BUCKET_NAME)
    .download(filePath);

  if (downError) {
    console.error(`   ❌ Failed to download ${filePath}:`, downError.message);
    return;
  }

  // 3. Upload to NEW
  // We use arrayBuffer because Node 'Blob' support varies, usually Buffer is safer for Node scripts
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: upError } = await newClient
    .storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType: blob.type,
      upsert: true
    });

  if (upError) {
    console.error(`   ❌ Failed to upload ${filePath} to new server:`, upError.message);
  } else {
    console.log(`   ✅ Transferred: ${filePath}`);
  }
}

migrate();
