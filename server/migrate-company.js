/**
 * Migration: Drop old PayrollRecord index and re-seed employees with companies
 * Run: node migrate-company.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/b-are-payroll';

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop old PayrollRecord index  {employee:1, period:1}
    const payrollCollection = mongoose.connection.collection('payrollrecords');
    try {
      await payrollCollection.dropIndex('employee_1_period_1');
      console.log('✅ Dropped old payroll index: employee_1_period_1');
    } catch (e) {
      console.log('⚠️ Old index not found or already dropped:', e.message);
    }

    // Also drop all existing payroll records since they don't have company field
    const result = await payrollCollection.deleteMany({});
    console.log(`🗑️ Cleared ${result.deletedCount} old payroll records (no company field)`);

    console.log('✅ Migration complete! Now run: node seed.js');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

migrate();
