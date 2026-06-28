const { Client } = require('pg');

const poolers = [
  'aws-1-ap-northeast-2.pooler.supabase.com',
  'aws-0-ap-south-1.pooler.supabase.com'
];
const port = 6543; // Transaction pooler port (standard for Supabase pooler)
const user = 'postgres.vttrmmrirdnijhklgllx';
const database = 'postgres';
const password = 'Madhavan@172006';

async function check(host) {
  const client = new Client({
    host,
    port,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    await client.end();
    return true;
  } catch (err) {
    console.log(`Failed for host ${host}: ${err.message}`);
    return false;
  }
}

async function run() {
  console.log(`Testing pooler hosts...`);
  for (const host of poolers) {
    const success = await check(host);
    if (success) {
      console.log(`\n🎉 SUCCESS! Database connected via pooler host: ${host}\n`);
      process.exit(0);
    }
  }
  console.log("None of the pooler connections succeeded.");
  process.exit(1);
}

run();
