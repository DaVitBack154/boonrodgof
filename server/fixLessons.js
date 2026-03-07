require('dotenv').config();
const mongoose = require('mongoose');
const StudentCourse = require('./models/StudentCourse');
const LessonRecord = require('./models/LessonRecord');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/b-are-payroll';

async function cleanup() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const courses = await StudentCourse.find();
  console.log(`Checking ${courses.length} courses...`);

  let overLimitCount = 0;
  let deletedLessons = 0;

  for (const course of courses) {
    // ดึงบทเรียนทั้งหมดของคอร์สนี้ เรียงตามลำดับเวลาที่เรียน (หรือ lessonNumber)
    const lessons = await LessonRecord.find({ studentCourse: course._id }).sort('lessonDate');
    
    if (lessons.length > course.totalLessons) {
      overLimitCount++;
      const excessLessons = lessons.slice(course.totalLessons); // เอาบทเรียนที่เกินจำนวน totalLessons
      
      const excessIds = excessLessons.map(l => l._id);
      
      // ลบเรคคอร์ดที่เกินทิ้ง
      const delResult = await LessonRecord.deleteMany({ _id: { $in: excessIds } });
      deletedLessons += delResult.deletedCount;
      
      console.log(`Course ${course.studentName} had ${lessons.length} lessons (limit ${course.totalLessons}). Deleted ${delResult.deletedCount} excess lessons.`);
    }

    // คำนวณ lessonsCompleted ใหม่เพื่อความชัวร์
    const completedCount = await LessonRecord.countDocuments({
      studentCourse: course._id,
      status: 'completed',
    });
    
    course.lessonsCompleted = completedCount;
    // ปรับสถานะ ถ้าเรียนครบแล้วให้เป็น completed
    if (completedCount >= course.totalLessons) {
      course.status = 'completed';
    } else {
        if(course.status === 'completed') {
            course.status = 'active'; // คืนค่ากลับไปเผื่อบัค
        }
    }
    await course.save();
  }

  console.log(`\n✅ Cleanup complete! Fixed ${overLimitCount} courses and deleted ${deletedLessons} excess lesson records.`);
  
  await mongoose.disconnect();
}

cleanup().catch(err => {
  console.error('❌ Cleanup error:', err);
  process.exit(1);
});
