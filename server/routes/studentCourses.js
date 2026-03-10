const express = require('express');
const router = express.Router();
const StudentCourse = require('../models/StudentCourse');
const LessonRecord = require('../models/LessonRecord');
const Employee = require('../models/Employee');
const mongoose = require('mongoose');

// Helper to update lessonsCompleted and status of a course
async function updateCourseProgress(courseId) {
  if (courseId === 'standalone') return;
  
  const StudentCourse = mongoose.model('StudentCourse');
  const LessonRecord = mongoose.model('LessonRecord');
  
  const course = await StudentCourse.findById(courseId);
  if (!course) return;

  const count = await LessonRecord.countDocuments({
    studentCourse: course._id,
    status: { $in: ['completed', 'legacy', 'no_show'] }
  });

  course.lessonsCompleted = count;
  if (count >= course.totalLessons) {
    course.status = 'completed';
  } else if (course.status === 'completed' && count < course.totalLessons) {
    course.status = 'active';
  }
  
  await course.save();
  return course;
}
router.post('/test-lesson', async (req, res) => {
  try {
    const { testCustomerName, coach, lessonDate, referredBy, company, branch } = req.body;
    if (!testCustomerName || !coach || !lessonDate || !company || !branch) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ (ชื่อลูกค้า, โค้ช, วันที่, บริษัท, สาขา)' });
    }

    // ตรวจสอบว่าโค้ชมีสอนเวลานี้หรือยัง (ห้ามจองทับ)
    const existingLesson = await LessonRecord.findOne({
      coach: coach,
      lessonDate: new Date(lessonDate),
      status: { $ne: 'cancelled' }
    }).populate('coach', 'firstNameTh');

    if (existingLesson) {
      const coachName = existingLesson.coach ? existingLesson.coach.firstNameTh : 'โค้ช';
      return res.status(400).json({ 
        error: `ไม่สามารถจองได้ ${coachName} มีคลาสสอนในเวลานี้แล้ว` 
      });
    }

    const lesson = new LessonRecord({
      coach,
      lessonDate,
      lessonNumber: 1,
      status: 'test',
      testCustomerName,
      referredBy: referredBy || undefined,
      company,
      branch
    });

    await lesson.save();

    const populated = await LessonRecord.findById(lesson._id)
      .populate('coach', 'employeeId firstNameTh lastNameTh nickname position')
      .populate('referredBy', 'firstNameTh lastNameTh nickname')
      .populate('branch', 'name');
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
    
    // Add legacyCount to each course
    const coursesWithLegacy = await Promise.all(courses.map(async (c) => {
      const legacyCount = await LessonRecord.countDocuments({
        studentCourse: c._id,
        status: 'legacy'
      });
      return { ...c.toObject(), legacyCount };
    }));

    res.json(coursesWithLegacy);
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

    const legacyCount = await LessonRecord.countDocuments({
      studentCourse: course._id,
      status: 'legacy'
    });

    res.json({ course: { ...course.toObject(), legacyCount }, lessons });
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
    const { legacyLessons, ...courseData } = req.body;
    const course = new StudentCourse(courseData);
    
    // ถ้ามีการระบุว่าเรียนมาแล้วกี่ครั้ง
    const legacyCount = parseInt(legacyLessons, 10);
    if (!isNaN(legacyCount) && legacyCount > 0) {
      course.lessonsCompleted = Math.min(legacyCount, course.totalLessons);
    }
    
    await course.save();

    // สร้างบันทึกจำลองสำหรับ legacy lessons
    if (!isNaN(legacyCount) && legacyCount > 0) {
      const dummyRecords = [];
      const len = Math.min(legacyCount, course.totalLessons);
      for (let i = 1; i <= len; i++) {
        dummyRecords.push({
          studentCourse: course._id,
          lessonNumber: i,
          lessonDate: course.startDate || Date.now(),
          status: 'legacy',
          notes: 'ข้อมูลยกมาจากระบบเก่า',
          company: course.company,
          // ไม่มี coach และไม่มี commission
        });
      }
      await LessonRecord.insertMany(dummyRecords);
    }

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

    const { legacyLessons, ...updateData } = req.body;
    Object.assign(course, updateData);
    await course.save(); // triggers pre-save hook to recalculate
    
    // Manage legacy records if legacyLessons is provided
    if (legacyLessons !== undefined) {
      const targetLegacyCount = parseInt(legacyLessons, 10) || 0;
      const currentLegacyCount = await LessonRecord.countDocuments({
        studentCourse: course._id,
        status: 'legacy'
      });

      if (targetLegacyCount > currentLegacyCount) {
        // Add more legacy records
        const toAdd = [];
        for (let i = currentLegacyCount + 1; i <= targetLegacyCount; i++) {
          toAdd.push({
            studentCourse: course._id,
            lessonNumber: i, // This might clash if they have regular lessons, 
                            // but usually legacy are the first ones. 
                            // In a real scenario we'd need smarter lessonNumbering.
                            // For now, follow the simple incremental logic.
            lessonDate: course.startDate || Date.now(),
            status: 'legacy',
            notes: 'เพิ่มย้อนหลังจากการแก้ไขคอร์ส',
            company: course.company,
          });
        }
        if (toAdd.length > 0) await LessonRecord.insertMany(toAdd);
      } else if (targetLegacyCount < currentLegacyCount) {
        // Remove surplus legacy records (remove the latest ones)
        const legacyRecords = await LessonRecord.find({
          studentCourse: course._id,
          status: 'legacy'
        }).sort('-lessonNumber').limit(currentLegacyCount - targetLegacyCount);
        
        const idsToDelete = legacyRecords.map(r => r._id);
        if (idsToDelete.length > 0) {
          await LessonRecord.deleteMany({ _id: { $in: idsToDelete } });
        }
      }
    }

    // Recalculate progress
    await updateCourseProgress(course._id);
    
    const populated = await StudentCourse.findById(course._id).populate('branch', 'name code');
    // Add legacyCount to response
    const finalLegacyCount = await LessonRecord.countDocuments({
      studentCourse: course._id,
      status: 'legacy'
    });
    res.json({ ...populated.toObject(), legacyCount: finalLegacyCount });
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

    // ตรวจสอบว่าโค้ชมีสอนเวลานี้หรือยัง (ข้ามการเช็คสำหรับสอนกลุ่ม)
    const reqLessonDate = new Date(req.body.lessonDate);
    const reqCoach = req.body.coach;
    const isGroupLesson = req.body.isGroupLesson === true;
    
    if (reqCoach && reqLessonDate && !isGroupLesson) {
      const existingLesson = await LessonRecord.findOne({
        coach: reqCoach,
        lessonDate: reqLessonDate,
        status: { $ne: 'cancelled' }
      }).populate('coach', 'firstNameTh');

      if (existingLesson) {
        const coachName = existingLesson.coach ? existingLesson.coach.firstNameTh : 'โค้ช';
        return res.status(400).json({ 
          error: `ไม่สามารถจองได้ ${coachName} มีคลาสสอนในเวลานี้แล้ว` 
        });
      }
    }

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
    await updateCourseProgress(course._id);

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
    // ดึงข้อมูล lesson เดิมมาเทียบก่อน
    const originalLesson = await LessonRecord.findById(req.params.lessonId);
    if (!originalLesson) return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการเรียน' });

    const reqLessonDate = req.body.lessonDate ? new Date(req.body.lessonDate) : null;
    const reqCoach = req.body.coach;
    const newStatus = req.body.status;

    // เช็คว่าโค้ชหรือเวลาถูกเปลี่ยนจริงๆ หรือไม่
    const coachChanged = reqCoach && reqCoach !== originalLesson.coach?.toString();
    const timeChanged = reqLessonDate && reqLessonDate.getTime() !== new Date(originalLesson.lessonDate).getTime();

    // ตรวจสอบซ้ำเฉพาะเมื่อมีการเปลี่ยนโค้ชหรือเวลา
    if ((coachChanged || timeChanged) && newStatus !== 'cancelled') {
      const checkCoach = reqCoach || originalLesson.coach;
      const checkDate = reqLessonDate || originalLesson.lessonDate;

      const existingLesson = await LessonRecord.findOne({
        _id: { $ne: req.params.lessonId },
        coach: checkCoach,
        lessonDate: checkDate,
        status: { $ne: 'cancelled' }
      }).populate('coach', 'firstNameTh');

      if (existingLesson) {
        const coachName = existingLesson.coach ? existingLesson.coach.firstNameTh : 'โค้ช';
        return res.status(400).json({ 
          error: `ไม่สามารถเปลี่ยนเวลา/โค้ชได้ ${coachName} มีคลาสสอนในเวลานี้แล้ว` 
        });
      }
    }

    const lesson = await LessonRecord.findByIdAndUpdate(
      req.params.lessonId,
      req.body,
      { new: true, runValidators: true }
    ).populate('coach', 'employeeId firstNameTh lastNameTh nickname position');

    if (!lesson) return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการเรียน' });

    // Update lessonsCompleted count if not a standalone test lesson
    if (req.params.courseId !== 'standalone') {
      await updateCourseProgress(req.params.courseId);
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

    // Update lessonsCompleted count if not a standalone test lesson
    if (req.params.courseId !== 'standalone') {
      await updateCourseProgress(req.params.courseId);
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
