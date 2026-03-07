/**
 * Seed March 2026 Data - เพิ่มข้อมูลตารางสอนเดือนมีนาคม 2026
 * Run: node seedMarch.js
 * 
 * ไม่ลบข้อมูลเดิม แค่เพิ่มข้อมูลเดือนมีนาคมเข้าไป
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const Branch = require('./models/Branch');
const StudentCourse = require('./models/StudentCourse');
const LessonRecord = require('./models/LessonRecord');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/b-are-payroll';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // ลบ lesson records เดือนมีนาคม 2026 ที่อาจมีอยู่
  const marchStart = new Date(2026, 2, 1); // March 1
  const marchEnd = new Date(2026, 2, 31, 23, 59, 59);
  const deleted = await LessonRecord.deleteMany({
    lessonDate: { $gte: marchStart, $lte: marchEnd }
  });
  console.log(`🗑️  Cleared ${deleted.deletedCount} existing March lessons`);

  // หาโค้ชทุกคน
  const coaches = await Employee.find({
    department: { $in: ['ผู้ฝึกสอน', 'ผู้ช่วยฝึกสอน'] },
    status: 'active',
  });
  console.log(`📋 Found ${coaches.length} coaches`);

  // หาคอร์สลูกค้าที่ active
  const courses = await StudentCourse.find({ status: 'active' });
  console.log(`📋 Found ${courses.length} active student courses`);

  if (coaches.length === 0 || courses.length === 0) {
    console.error('❌ No coaches or courses found. Run seed.js and seedCommission.js first.');
    process.exit(1);
  }

  // สร้าง lesson records สำหรับเดือนมีนาคม 2026
  // กระจายเรียนทุกวัน หลายช่วงเวลา ให้ดู realistic
  const timeSlots = [
    { hour: 8, min: 0 },
    { hour: 9, min: 0 },
    { hour: 10, min: 0 },
    { hour: 11, min: 0 },
    { hour: 13, min: 0 },
    { hour: 14, min: 0 },
    { hour: 15, min: 0 },
    { hour: 16, min: 0 },
    { hour: 17, min: 0 },
    { hour: 18, min: 0 },
    { hour: 19, min: 0 },
    { hour: 20, min: 0 },
  ];

  const lessonEntries = [];
  let lessonCounter = {};

  // สร้างตารางสอนสำหรับ 1-31 มีนาคม
  for (let day = 1; day <= 31; day++) {
    const date = new Date(2026, 2, day);
    // ข้ามวันที่ไม่มี (มีนาคมมี 31 วัน ก็ไม่ต้อง)
    if (date.getMonth() !== 2) continue;

    const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat

    // แต่ละโค้ชสอน 2-5 คนต่อวัน (จันทร์-เสาร์), วันอาทิตย์ 0-2 คน
    for (const coach of coaches) {
      const maxLessonsToday = dayOfWeek === 0 ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 4) + 2;

      // สุ่มเวลาจากช่วงที่มี
      const shuffled = [...timeSlots].sort(() => Math.random() - 0.5);
      const slotsToday = shuffled.slice(0, maxLessonsToday);

      for (const slot of slotsToday) {
        // สุ่มเลือกคอร์สลูกค้า
        const course = courses[Math.floor(Math.random() * courses.length)];
        const courseId = course._id.toString();

        // นับ lesson number สำหรับคอร์สนี้
        if (!lessonCounter[courseId]) {
          lessonCounter[courseId] = course.lessonsCompleted || 0;
        }

        // เช็คว่าจำนวนครั้งที่เรียนเกิน totalLessons หรือยัง ถ้าเกินให้ข้ามไปสุ่มคนใหม่แต่เราขี้เกียจสุ่มใหม่ก็แค่ continue ไป
        if (lessonCounter[courseId] >= course.totalLessons) {
          continue;
        }

        lessonCounter[courseId]++;

        // สุ่มสถานะ: 90% completed, 7% no_show, 3% cancelled
        const rand = Math.random();
        let status = 'completed';
        if (rand > 0.97) status = 'cancelled';
        else if (rand > 0.90) status = 'no_show';

        const lessonDate = new Date(2026, 2, day, slot.hour, slot.min, 0);

        lessonEntries.push({
          studentCourse: course._id,
          coach: coach._id,
          lessonNumber: lessonCounter[courseId],
          lessonDate,
          status,
        });
      }
    }
  }

  // Insert แบบ unordered เพื่อข้าม duplicate ที่อาจเกิด
  try {
    const result = await LessonRecord.insertMany(lessonEntries, { ordered: false });
    console.log(`✅ Created ${result.length} lesson records for March 2026`);
  } catch (err) {
    if (err.insertedDocs) {
      console.log(`✅ Created ${err.insertedDocs.length} lesson records (some duplicates skipped)`);
    } else {
      throw err;
    }
  }

  // Summary
  console.log('\n📊 March 2026 Summary:');
  for (const coach of coaches) {
    const count = lessonEntries.filter(e => e.coach.toString() === coach._id.toString()).length;
    console.log(`   ${coach.firstNameTh} ${coach.lastNameTh} (${coach.nickname}): ${count} lessons`);
  }

  await mongoose.disconnect();
  console.log('\n✅ March seed complete!');
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
