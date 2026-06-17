const pool = require('../config/db');

async function migrate() {
  try {
    console.log('🔄 Running migration: add_universitas...');

    // Add universitas column to users table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS universitas VARCHAR(200) DEFAULT NULL
    `);
    console.log('✅ Column "universitas" added to users table');

    // Add index for universitas filtering
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_universitas ON users(universitas)
    `);
    console.log('✅ Index "idx_users_universitas" created');

    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrate();
