/**
 * Seed Commission Data - สร้างข้อมูลตัวอย่างคอร์สลูกค้า + บันทึกการเรียน
 * Run: node seedCommission.js
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

  // Clear existing commission data
  await StudentCourse.deleteMany({});
  await LessonRecord.deleteMany({});
  console.log('🗑️  Cleared existing commission data');

  // Get coaches (employees who are coaches)
  const coaches = await Employee.find({
    department: { $in: ['ผู้ฝึกสอน', 'ผู้ช่วยฝึกสอน'] },
    status: 'active',
  });
  console.log(`📋 Found ${coaches.length} coaches`);

  const branches = await Branch.find({});
  const ratchada = branches.find(b => b.code === 'ratchada');
  const srinakarin = branches.find(b => b.code === 'srinakarin');
  const bangna = branches.find(b => b.code === 'bangna');

  // Create student courses (matching Excel format)
  const coursesData = [
    { studentName: 'สายไหม', packagePrice: 19000, totalLessons: 20, commissionRate: 50, branch: [ratchada._id] },
    { studentName: 'เจ้าขา นักกีฬา', packagePrice: 85000, totalLessons: 100, commissionRate: 45, branch: [ratchada._id] },
    { studentName: 'เก๋า ต่อ2', packagePrice: 25220, totalLessons: 20, commissionRate: 40, branch: [ratchada._id] },
    { studentName: 'นก', packagePrice: 39285, totalLessons: 30, commissionRate: 40, branch: [ratchada._id] },
    { studentName: 'เอคจี้', packagePrice: 28809, totalLessons: 35, commissionRate: 50, branch: [srinakarin._id] },
    { studentName: 'Matin', packagePrice: 49500, totalLessons: 52, commissionRate: 45, branch: [srinakarin._id] },
    { studentName: 'Phing', packagePrice: 28500, totalLessons: 20, commissionRate: 40, branch: [ratchada._id] },
    { studentName: 'เมืิ่ง', packagePrice: 45000, totalLessons: 40, commissionRate: 40, branch: [srinakarin._id] },
    { studentName: 'ตัว โบ้ท', packagePrice: 45000, totalLessons: 40, commissionRate: 40, branch: [bangna._id] },
    { studentName: 'Si', packagePrice: 32000, totalLessons: 30, commissionRate: 40, branch: [ratchada._id] },
    { studentName: 'พีแอน', packagePrice: 18000, totalLessons: 15, commissionRate: 40, branch: [srinakarin._id] },
    { studentName: 'Nook', packagePrice: 13500, totalLessons: 10, commissionRate: 40, branch: [ratchada._id] },
    { studentName: 'เจ้าขา นักกีฬา', packagePrice: 85000, totalLessons: 100, commissionRate: 45, branch: [ratchada._id] },
    { studentName: 'Pink Party ต่อ3', packagePrice: 16000, totalLessons: 15, commissionRate: 40, branch: [bangna._id] },
    { studentName: 'Tintin', packagePrice: 33950, totalLessons: 35, commissionRate: 60, branch: [srinakarin._id] },
    { studentName: 'น้องมัน', packagePrice: 10000, totalLessons: 10, commissionRate: 60, branch: [ratchada._id] },
    { studentName: 'ชุณีม', packagePrice: 15000, totalLessons: 10, commissionRate: 40, branch: [bangna._id] },
  ];

  const courses = [];
  for (const data of coursesData) {
    const course = new StudentCourse(data);
    await course.save();
    courses.push(course);
  }
  console.log(`✅ Created ${courses.length} student courses`);

  // Create sample lesson records for February 2026
  // Distribute lessons across coaches
  const lessonEntries = [];
  const now = new Date(2026, 1, 1); // Feb 2026

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    // Each course has a few lessons this month, assigned to random coaches
    const lessonsThisMonth = Math.min(course.totalLessons, Math.floor(Math.random() * 6) + 2);
    
    for (let j = 1; j <= lessonsThisMonth; j++) {
      const coach = coaches[Math.floor(Math.random() * coaches.length)];
      const day = Math.min(28, j * 3 + i); // spread across month
      const lessonDate = new Date(2026, 1, day, 10 + (j % 8), 0, 0);

      lessonEntries.push({
        studentCourse: course._id,
        coach: coach._id,
        lessonNumber: j,
        lessonDate,
        status: 'completed',
      });
    }

    // Update lessonsCompleted
    course.lessonsCompleted = lessonsThisMonth;
    await course.save();
  }

  await LessonRecord.insertMany(lessonEntries);
  console.log(`✅ Created ${lessonEntries.length} lesson records`);

  // Summary
  console.log('\n📊 Commission Summary:');
  for (const coach of coaches) {
    const lessons = await LessonRecord.find({
      coach: coach._id,
      status: 'completed',
    }).populate('studentCourse', 'commissionPerLesson');

    let totalCom = 0;
    for (const l of lessons) {
      if (l.studentCourse) totalCom += l.studentCourse.commissionPerLesson;
    }
    console.log(`   ${coach.firstNameTh} ${coach.lastNameTh}: ${lessons.length} lessons, ฿${totalCom.toFixed(2)} commission`);
  }

  await mongoose.disconnect();
  console.log('\n✅ Seed commission data complete!');
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
