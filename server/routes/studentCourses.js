const express = require('express');
const router = express.Router();
const StudentCourse = require('../models/StudentCourse');
const LessonRecord = require('../models/LessonRecord');
const Employee = require('../models/Employee');

// POST /api/student-courses/test-lesson - สร้าง lesson สำหรับลูกค้าทดลองเรียน (Test)
router.post('/test-lesson', async (req, res) => {
  try {
    const { testCustomerName, coach, lessonDate, referredBy } = req.body;
    if (!testCustomerName || !coach || !lessonDate) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ (ชื่อลูกค้า, โค้ช, วันที่)' });
    }

    const lesson = new LessonRecord({
      coach,
      lessonDate,
      lessonNumber: 1,
      status: 'test',
      testCustomerName,
      referredBy: referredBy || undefined,
    });

    await lesson.save();

    const populated = await LessonRecord.findById(lesson._id)
      .populate('coach', 'employeeId firstNameTh lastNameTh nickname position')
      .populate('referredBy', 'firstNameTh lastNameTh nickname');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/student-courses - ดูรายการคอร์สลูกค้าทั้งหมด
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.branch) filter.branch = { $in: [req.query.branch] };
    if (req.query.status) filter.status = req.query.status;

    const courses = await StudentCourse.find(filter)
      .populate('branch', 'name code')
      .sort('-createdAt');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/student-courses/:id - ดูรายละเอียดคอร์ส + lesson records
router.get('/:id', async (req, res) => {
  try {
    const course = await StudentCourse.findById(req.params.id)
      .populate('branch', 'name code');
    if (!course) return res.status(404).json({ error: 'ไม่พบข้อมูลคอร์ส' });

    const lessons = await LessonRecord.find({ studentCourse: course._id })
      .populate('coach', 'employeeId firstNameTh lastNameTh nickname position')
      .sort('lessonNumber');

    res.json({ course, lessons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/student-courses/:id/history - ดูประวัติการเรียนทั้งหมดของคอร์ส
router.get('/:id/history', async (req, res) => {
  try {
    const course = await StudentCourse.findById(req.params.id)
      .populate('branch', 'name');
    if (!course) return res.status(404).json({ error: 'ไม่พบข้อมูลคอร์ส' });

    const lessons = await LessonRecord.find({ studentCourse: course._id })
      .populate('coach', 'firstNameTh lastNameTh nickname')
      .sort('lessonNumber');

    res.json({ course, lessons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/student-courses - เพิ่มคอร์สลูกค้าใหม่
router.post('/', async (req, res) => {
  try {
    const course = new StudentCourse(req.body);
    await course.save();
    const populated = await StudentCourse.findById(course._id).populate('branch', 'name code');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/student-courses/:id - แก้ไขคอร์ส
router.put('/:id', async (req, res) => {
  try {
    const course = await StudentCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'ไม่พบข้อมูลคอร์ส' });

    Object.assign(course, req.body);
    await course.save(); // triggers pre-save hook to recalculate
    const populated = await StudentCourse.findById(course._id).populate('branch', 'name code');
    res.json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/student-courses/:id - ลบคอร์ส
router.delete('/:id', async (req, res) => {
  try {
    await LessonRecord.deleteMany({ studentCourse: req.params.id });
    await StudentCourse.findByIdAndDelete(req.params.id);
    res.json({ message: 'ลบคอร์สเรียบร้อย' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Lesson Records =====

// POST /api/student-courses/:id/lessons - เพิ่มบันทึกการเรียน
router.post('/:id/lessons', async (req, res) => {
  try {
    const course = await StudentCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'ไม่พบข้อมูลคอร์ส' });

    // หาครั้งล่าสุดที่เรียนไปแล้วเพื่อบวกเข้าไป
    const latestLesson = await LessonRecord.findOne({ studentCourse: course._id }).sort('-lessonNumber');
    const nextLessonNumber = latestLesson ? latestLesson.lessonNumber + 1 : 1;

    // สถานะตอนสร้างใหม่ให้เป็นรอดำเนินการ (ใช้ completed แทนชั่วคราวสำหรับระบบที่มีจำกัด หรือ active)
    // ถ้ารอจัดการจริงๆ ใน Schema มีแค่ ['completed', 'no_show', 'cancelled'] 
    // เราเลยเพิ่มสถานะ active (รอดำเนินการ) เข้าไปให้รองรับก่อนในระดับโค้ดหรือใช้ค่า default
    let status = req.body.status || 'completed';
    // แต่ถ้า Model มีแค่ 3 ตัวแปร ก็เซฟเป็น cancelled ไว้ก่อน หรือแก้ model
    // อัปเดต: ให้ backend map คำว่า active เป็นค่า default ไปก่อนเพื่อกัน error หรือจะแก้ DB ก็ได้
    
    const lesson = new LessonRecord({
      studentCourse: course._id,
      lessonNumber: nextLessonNumber,
      ...req.body,
    });
    
    // Default commissionRate and company from StudentCourse if not provided
    if (lesson.commissionRate == null) {
      lesson.commissionRate = course.commissionRate;
    }
    if (!lesson.company && course.company) {
      lesson.company = course.company;
    }
    // Default branch from course if not provided
    if (!lesson.branch && course.branch && course.branch.length > 0) {
      lesson.branch = course.branch[0]; // use first branch as default
    }
    
    // Validate status
    if(!['completed', 'no_show', 'cancelled', 'active', 'test'].includes(lesson.status)) {
       lesson.status = 'active';
    }

    await lesson.save();

    // Update lessonsCompleted count
    const completedCount = await LessonRecord.countDocuments({
      studentCourse: course._id,
      status: 'completed',
    });
    course.lessonsCompleted = completedCount;
    if (completedCount >= course.totalLessons) {
      course.status = 'completed';
    }
    await course.save();

    const populated = await LessonRecord.findById(lesson._id)
      .populate('coach', 'employeeId firstNameTh lastNameTh nickname position');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/student-courses/:courseId/lessons/:lessonId - แก้ไขบันทึกการเรียน
router.put('/:courseId/lessons/:lessonId', async (req, res) => {
  try {
    const lesson = await LessonRecord.findByIdAndUpdate(
      req.params.lessonId,
      req.body,
      { new: true, runValidators: true }
    ).populate('coach', 'employeeId firstNameTh lastNameTh nickname position');

    if (!lesson) return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการเรียน' });

    // Update lessonsCompleted count
    const course = await StudentCourse.findById(req.params.courseId);
    if (course) {
      const completedCount = await LessonRecord.countDocuments({
        studentCourse: course._id,
        status: 'completed',
      });
      course.lessonsCompleted = completedCount;
      course.status = completedCount >= course.totalLessons ? 'completed' : 'active';
      await course.save();
    }

    res.json(lesson);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/student-courses/:courseId/lessons/:lessonId - ลบบันทึกการเรียน
router.delete('/:courseId/lessons/:lessonId', async (req, res) => {
  try {
    await LessonRecord.findByIdAndDelete(req.params.lessonId);

    // Update lessonsCompleted count
    const course = await StudentCourse.findById(req.params.courseId);
    if (course) {
      const completedCount = await LessonRecord.countDocuments({
        studentCourse: course._id,
        status: 'completed',
      });
      course.lessonsCompleted = completedCount;
      course.status = completedCount >= course.totalLessons ? 'completed' : 'active';
      await course.save();
    }

    res.json({ message: 'ลบเรียบร้อย' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Commission Summary for Payroll =====

// GET /api/student-courses/commission/summary?period=2026-02
router.get('/commission/summary', async (req, res) => {
  try {
    const { period } = req.query; // e.g. "2026-02"
    if (!period) return res.status(400).json({ error: 'กรุณาระบุงวด (period)' });

    const [year, month] = period.split('-');
    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);

    // Find all completed lessons in this period
    const lessons = await LessonRecord.find({
      lessonDate: { $gte: startDate, $lte: endDate },
      status: 'completed',
    }).populate({
      path: 'studentCourse',
      select: 'commissionPerLesson perLessonRate commissionRate studentName company',
    }).populate('coach', 'employeeId firstNameTh lastNameTh');

    // Group by coach
    const coachCommission = {};
    for (const lesson of lessons) {
      if (!lesson.coach || !lesson.studentCourse) continue;
      const coachId = lesson.coach._id.toString();
      if (!coachCommission[coachId]) {
        coachCommission[coachId] = {
          coach: lesson.coach,
          totalLessons: 0,
          totalCommission: 0,
          details: [],
        };
      }
      
      // Use lesson-level commissionRate if available, otherwise fall back to course
      const lessonRate = lesson.commissionRate != null ? lesson.commissionRate : lesson.studentCourse.commissionRate;
      const perLessonRate = lesson.studentCourse.perLessonRate || 0;
      const commissionAmount = Math.round((perLessonRate * lessonRate / 100) * 100) / 100;
      const lessonCompany = lesson.company || lesson.studentCourse.company || '';
      
      coachCommission[coachId].totalLessons += 1;
      coachCommission[coachId].totalCommission += commissionAmount;
      coachCommission[coachId].details.push({
        studentName: lesson.studentCourse.studentName,
        lessonNumber: lesson.lessonNumber,
        commissionPerLesson: commissionAmount,
        commissionRate: lessonRate,
        company: lessonCompany,
        date: lesson.lessonDate,
      });
    }

    // Round totals
    for (const key of Object.keys(coachCommission)) {
      coachCommission[key].totalCommission = Math.round(coachCommission[key].totalCommission * 100) / 100;
    }

    res.json(coachCommission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
