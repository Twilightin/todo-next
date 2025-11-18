// lib/db.js
import pg from 'pg';

const { Pool } = pg;

// 创建数据库连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 测试连接
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on PostgreSQL client', err);
  process.exit(-1);
});

export default pool;