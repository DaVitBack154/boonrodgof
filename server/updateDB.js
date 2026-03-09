const mongoose = require('mongoose');

// require('dotenv').config({ path: './.env' });
// Since there's no dotenv config in standard, we can assume the db is local or we hardcode it for b-are-payroll since it's the standard DB
// Checking server/server.js for mongo URI
const MONGO_URI = 'mongodb://127.0.0.1:27017/b-are-payroll'; // default local uri used in this app

async function updateDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');
    const collections = await mongoose.connection.db.collections();
    
    for (const collection of collections) {
       const name = collection.collectionName;
       console.log('Processing collection:', name);
       
       if (name === 'employees') {
          const docs = await collection.find({}).toArray();
          let count = 0;
          for (const doc of docs) {
             let changed = false;
             if (doc.companies) {
                 for (let comp of doc.companies) {
                     if (comp.company === 'บริษัทพัฒนา') { comp.company = 'บุญรอดกอล์ฟพัฒนา'; changed = true; }
                     else if (comp.company === 'บริษัทTotal') { comp.company = 'บุญรอดกอล์ฟโทเทิล'; changed = true; }
                 }
             }
             if (changed) {
                 await collection.updateOne({ _id: doc._id }, { $set: { companies: doc.companies } });
                 count++;
             }
          }
          console.log(`Updated ${count} employees`);
       } else if (name === 'lessonrecords') {
          const r1 = await collection.updateMany({ company: 'บริษัทพัฒนา' }, { $set: { company: 'บุญรอดกอล์ฟพัฒนา' }});
          const r2 = await collection.updateMany({ company: 'บริษัทTotal' }, { $set: { company: 'บุญรอดกอล์ฟโทเทิล' }});
          console.log(`Updated ${r1.modifiedCount + r2.modifiedCount} lessonrecords`);
       } else if (name === 'payrollrecords') {
          const r1 = await collection.updateMany({ company: 'บริษัทพัฒนา' }, { $set: { company: 'บุญรอดกอล์ฟพัฒนา' }});
          const r2 = await collection.updateMany({ company: 'บริษัทTotal' }, { $set: { company: 'บุญรอดกอล์ฟโทเทิล' }});
          console.log(`Updated ${r1.modifiedCount + r2.modifiedCount} payrollrecords`);
       } else if (name === 'studentcourses') {
          const r1 = await collection.updateMany({ company: 'บริษัทพัฒนา' }, { $set: { company: 'บุญรอดกอล์ฟพัฒนา' }});
          const r2 = await collection.updateMany({ company: 'บริษัทTotal' }, { $set: { company: 'บุญรอดกอล์ฟโทเทิล' }});
          console.log(`Updated ${r1.modifiedCount + r2.modifiedCount} studentcourses`);
       }
    }
    console.log('DB Update complete');
  } catch (err) {
    console.error('Error updating DB:', err);
  } finally {
    process.exit();
  }
}

updateDB();
