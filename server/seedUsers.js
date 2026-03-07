require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const User = require('./models/User');

async function migrateUsers() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/b-are-payroll';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const employees = await Employee.find();
    console.log(`Found ${employees.length} employees to process.`);

    let created = 0;
    
    for (const emp of employees) {
      // Use their employee email, or mockup one if missing
      const email = emp.email || `employee_${emp.employeeId}@bare.com`;
      
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        let role = 'coach';
        if (emp.department === 'ผู้ฝึกสอน') role = 'coach';
        
        // Example logic for creating an admin - maybe just manager for now?
        if (emp.level === 'manager') role = 'admin';

        await User.create({
          email,
          password: '123456',
          role,
          employee: emp._id
        });
        created++;
      }
    }

    console.log(`🎉 Migration complete! Created ${created} User records.`);
    
  } catch (err) {
    console.error('❌ Migration Error:', err);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

migrateUsers();
