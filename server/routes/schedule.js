const express = require('express');
const router = express.Router();
const LessonRecord = require('../models/LessonRecord');
const StudentCourse = require('../models/StudentCourse');

// GET /api/schedule?month=2026-02
router.get('/', async (req, res) => {
  try {
    const { month, branch } = req.query; // format: YYYY-MM
    if (!month) return res.status(400).json({ error: 'กรุณาระบุเดือน (YYYY-MM)' });

    const [yyyy, mm] = month.split('-');
    const startDate = new Date(yyyy, parseInt(mm) - 1, 1);
    const endDate = new Date(yyyy, parseInt(mm), 0, 23, 59, 59);

    // ถ้าเลือกสาขา ให้กรองโค้ชตามสาขาก่อน
    const Employee = require('../models/Employee');
    let coachFilter = {};
    if (branch) {
      const branchCoaches = await Employee.find({
        branch: { $in: [branch] },
        department: { $in: ['ผู้ฝึกสอน', 'ผู้ช่วยฝึกสอน'] },
        status: 'active',
      }).select('_id');
      const coachIds = branchCoaches.map(c => c._id);
      coachFilter = { coach: { $in: coachIds } };
    }

    // ดึงข้อมูล lesson ทั้งหมดในเดือน
    const lessons = await LessonRecord.find({
      lessonDate: { $gte: startDate, $lte: endDate },
      ...coachFilter,
    })
      .populate('coach', 'employeeId firstNameTh lastNameTh nickname')
      .populate('referredBy', 'firstNameTh lastNameTh nickname')
      .populate({
        path: 'studentCourse',
        select: 'studentName totalLessons packagePrice branch',
        populate: { path: 'branch', select: 'name' }
      })
      .sort('lessonDate');

    // สรุปยอดแยกตามโค้ช
    const coachStats = {};
    let totalLessons = 0;
    
    for (const lesson of lessons) {
      // ข้ามถ้าไม่มีโค้ช
      if (!lesson.coach) continue;
      
      const coachId = lesson.coach._id.toString();
      if (!coachStats[coachId]) {
        coachStats[coachId] = {
          coach: lesson.coach,
          completed: 0,
          no_show: 0,
          cancelled: 0,
          total: 0
        };
      }
      
      coachStats[coachId][lesson.status] += 1;
      coachStats[coachId].total += 1;
      
      if (lesson.status === 'completed') {
        totalLessons += 1;
      }
    }

    res.json({
      lessons,
      summary: {
        totalCompleted: totalLessons,
        totalScheduled: lessons.length,
        coachStats: Object.values(coachStats).sort((a,b) => b.total - a.total)
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/schedule/daily?date=2026-03-05
router.get('/daily', async (req, res) => {
  try {
    const { date, branch } = req.query; // format: YYYY-MM-DD
    if (!date) return res.status(400).json({ error: 'กรุณาระบุวันที่ (YYYY-MM-DD)' });

    const dayStart = new Date(date + 'T00:00:00');
    const dayEnd = new Date(date + 'T23:59:59');

    // Get coaches (filter by branch if specified)
    const Employee = require('../models/Employee');
    const coachFilter = {
      department: { $in: ['ผู้ฝึกสอน', 'ผู้ช่วยฝึกสอน'] },
      status: 'active',
    };
    if (branch) coachFilter.branch = { $in: [branch] };

    const allCoaches = await Employee.find(coachFilter)
      .select('employeeId firstNameTh lastNameTh nickname department branch')
      .populate('branch', 'name');

    // Filter lessons by these coaches
    const coachIds = allCoaches.map(c => c._id);
    const lessons = await LessonRecord.find({
      lessonDate: { $gte: dayStart, $lte: dayEnd },
      coach: { $in: coachIds },
    })
      .populate('coach', 'employeeId firstNameTh lastNameTh nickname department')
      .populate('referredBy', 'firstNameTh lastNameTh nickname')
      .populate({
        path: 'studentCourse',
        select: 'studentName totalLessons lessonsCompleted packagePrice branch',
        populate: { path: 'branch', select: 'name' }
      })
      .sort('lessonDate');

    res.json({ lessons, coaches: allCoaches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/schedule/range?startDate=2026-02-25&endDate=2026-03-25
router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate, branch } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ error: 'กรุณาระบุวันที่เริ่มต้นและสิ้นสุด' });

    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');

    const Employee = require('../models/Employee');
    const coachFilter = {
      department: { $in: ['ผู้ฝึกสอน', 'ผู้ช่วยฝึกสอน'] },
      status: 'active',
    };
    if (branch) coachFilter.branch = { $in: [branch] };

    const allCoaches = await Employee.find(coachFilter)
      .select('employeeId firstNameTh lastNameTh nickname department branch')
      .populate('branch', 'name');

    const coachIds = allCoaches.map(c => c._id);
    const lessons = await LessonRecord.find({
      lessonDate: { $gte: start, $lte: end },
      coach: { $in: coachIds },
    })
      .populate('coach', 'employeeId firstNameTh lastNameTh nickname department')
      .populate('referredBy', 'firstNameTh lastNameTh nickname')
      .populate({
        path: 'studentCourse',
        select: 'studentName totalLessons lessonsCompleted packagePrice branch',
        populate: { path: 'branch', select: 'name' }
      })
      .sort('lessonDate');

    res.json({ lessons, coaches: allCoaches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/schedule/coaches - get unique coaches
router.get('/coaches', async (req, res) => {
  try {
    const Employee = require('../models/Employee');
    const coaches = await Employee.find({
      department: { $in: ['ผู้ฝึกสอน', 'ผู้ช่วยฝึกสอน'] },
      status: 'active',
    }).select('employeeId firstNameTh lastNameTh nickname department');
    res.json(coaches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
