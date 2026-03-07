require('dotenv').config();
const mongoose = require('mongoose');
const StudentCourse = require('./models/StudentCourse');
const LessonRecord = require('./models/LessonRecord');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/b-are-payroll';

async function clearData() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // 1. ลบ LessonRecord ทั้งหมด
  const deletedLessons = await LessonRecord.deleteMany({});
  console.log(`🗑️  Deleted ${deletedLessons.deletedCount} Lesson Records.`);

  // 2. รีเซ็ตคอร์สลูกค้าทั้งหมดให้เป็น 0
  const courses = await StudentCourse.find({});
  let resetCount = 0;
  for (const course of courses) {
    course.lessonsCompleted = 0;
    course.status = 'active'; // ถ้าเคยถูกมาร์คว่า completed ให้คืนเป็น active
    await course.save();
    resetCount++;
  }
  console.log(`♻️  Reset ${resetCount} Student Courses to 0 completed lessons.`);

  console.log('\n✅ All mock lesson data cleared successfully!');
  await mongoose.disconnect();
}

clearData().catch(err => {
  console.error('❌ Error clearing data:', err);
  process.exit(1);
});
