const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const PayrollRecord = require('../models/PayrollRecord');
const LessonRecord = require('../models/LessonRecord');
const { calculatePayroll } = require('../utils/payrollCalculator');

// Thai month names for labels
const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

/**
 * คำนวณค่าคอมมิชชั่นของโค้ชแต่ละคน ตามงวดเดือน แยกตามบริษัท
 */
async function getCoachCommission(coachId, period, company) {
  const [year, month] = period.split('-');

  // start = 26th of previous month
  const startDate = new Date(year, parseInt(month) - 2, 26);
  startDate.setHours(0, 0, 0, 0);

  // end = 25th of current month
  const endDate = new Date(year, parseInt(month) - 1, 25);
  endDate.setHours(23, 59, 59, 999);

  const lessons = await LessonRecord.find({
    coach: coachId,
    lessonDate: { $gte: startDate, $lte: endDate },
    status: { $in: ['completed', 'no_show'] },
  }).populate(
    'studentCourse',
    'commissionPerLesson perLessonRate commissionRate studentName company',
  );

  let total = 0;
  for (const lesson of lessons) {
    if (lesson.studentCourse) {
      // กรอง commission เฉพาะบริษัทที่ระบุ
      const courseCompany = lesson.studentCourse.company || '';
      if (company && courseCompany !== company) continue;

      const lessonRate =
        lesson.commissionRate != null
          ? lesson.commissionRate
          : lesson.studentCourse.commissionRate || 0;
      const perLessonRate = lesson.studentCourse.perLessonRate || 0;
      total += Math.round(((perLessonRate * lessonRate) / 100) * 100) / 100;
    }
  }
  return Math.round(total * 100) / 100;
}

// GET /api/payroll?period=2024-02 - ดึง payroll records ตามงวด
router.get('/', async (req, res) => {
  try {
    const { period } = req.query;
    if (!period)
      return res.status(400).json({ error: 'กรุณาระบุงวดเงินเดือน (period)' });

    const records = await PayrollRecord.find({ period })
      .populate({
        path: 'employee',
        populate: { path: 'branch', select: 'name code type' },
      })
      .sort('employee.employeeId');

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payroll/calculate - คำนวณเงินเดือนทั้งงวด (รวมค่าคอม แยกตามบริษัท)
router.post('/calculate', async (req, res) => {
  try {
    const { period } = req.body;
    if (!period)
      return res.status(400).json({ error: 'กรุณาระบุงวดเงินเดือน (period)' });

    const [year, month] = period.split('-');
    const monthIndex = parseInt(month) - 1;
    const periodLabel = `${THAI_MONTHS[monthIndex]} ${year}`;

    const employees = await Employee.find({
      status: { $in: ['active', 'probation'] },
    });

    const results = [];

    for (const emp of employees) {
      // กำหนดรายชื่อบริษัทที่พนักงานอยู่
      const companyList =
        emp.companies && emp.companies.length > 0
          ? emp.companies
          : [
              {
                company: 'บุญรอดกอล์ฟพัฒนา',
                employmentType: emp.employmentType || 'fulltime',
              },
            ];

      const fulltimeCompanies = companyList
        .filter((item) => (item.employmentType || 'fulltime') === 'fulltime')
        .map((item) => item.company);
      const preferredPayrollCompany = emp.payrollCompany;
      const salaryCompany = fulltimeCompanies.includes(preferredPayrollCompany)
        ? preferredPayrollCompany
        : fulltimeCompanies[0] || companyList[0]?.company;

      for (const companyInfo of companyList) {
        const companyName = companyInfo.company;
        const compEmpType = companyInfo.employmentType || 'fulltime';

        let existing = await PayrollRecord.findOne({
          employee: emp._id,
          period,
          company: companyName,
        });
        const existingOtherDeductions = existing ? existing.otherDeductions : 0;
        const existingSalesBonus = existing ? existing.salesBonus : 0;

        // คำนวณค่าคอมจาก lesson records เฉพาะบริษัทนี้
        const commissionAmount = await getCoachCommission(
          emp._id,
          period,
          companyName,
        );

        const shouldPayBase = companyName === salaryCompany;
        const hasCompanyBaseSalary =
          companyInfo.baseSalary !== undefined &&
          companyInfo.baseSalary !== null;
        const companyBaseSalary = Number(companyInfo.baseSalary) || 0;

        // คำนวณค่าแนะนำลูกค้า Test (100 บาท/คน) - เฉพาะบริษัทแรก
        let referralBonus = 0;
        let referralCount = 0;
        if (shouldPayBase) {
          const [yr, mn] = period.split('-');
          const refStart = new Date(yr, parseInt(mn) - 2, 26);
          refStart.setHours(0, 0, 0, 0);
          const refEnd = new Date(yr, parseInt(mn) - 1, 25);
          refEnd.setHours(23, 59, 59, 999);

          referralCount = await LessonRecord.countDocuments({
            referredBy: emp._id,
            status: { $in: ['completed', 'test'] },
            lessonDate: { $gte: refStart, $lte: refEnd },
          });
          referralBonus = referralCount * 100;
        }

        // สร้าง employee object จำลองเพื่อส่งเข้า calculator
        const empForCalc = {
          ...emp.toObject(),
          employmentType: compEmpType,
          // ถ้าไม่จ่าย baseSalary จากบริษัทนี้ ให้ set = 0
          baseSalary: hasCompanyBaseSalary
            ? companyBaseSalary
            : shouldPayBase
              ? emp.baseSalary
              : 0,
          livingAllowance: shouldPayBase ? emp.livingAllowance : 0,
          positionAllowance: shouldPayBase ? emp.positionAllowance : 0,
          professionalAllowance: shouldPayBase ? emp.professionalAllowance : 0,
        };

        // คำนวณ payroll (รวมค่าคอม + sale + ค่าแนะนำ)
        const calc = calculatePayroll(
          empForCalc,
          existingOtherDeductions,
          commissionAmount,
          existingSalesBonus,
          referralBonus,
          period,
        );

        if (existing) {
          Object.assign(existing, calc, {
            period,
            periodLabel,
            company: companyName,
            referralCount,
            status: 'calculated',
            calculatedAt: new Date(),
          });
          await existing.save();
          results.push(existing);
        } else {
          const record = new PayrollRecord({
            employee: emp._id,
            period,
            periodLabel,
            company: companyName,
            referralCount,
            ...calc,
            status: 'calculated',
            calculatedAt: new Date(),
          });
          await record.save();
          results.push(record);
        }
      }
    }

    const populated = await PayrollRecord.find({ period }).populate({
      path: 'employee',
      populate: { path: 'branch', select: 'name code type' },
    });

    res.json({
      message: `คำนวณเงินเดือนงวด ${periodLabel} เรียบร้อย (${results.length} รายการ)`,
      records: populated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/payroll/:id/deductions - HR กรอกหักอื่นๆ
router.put('/:id/deductions', async (req, res) => {
  try {
    const { otherDeductions } = req.body;
    const record = await PayrollRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'ไม่พบข้อมูล payroll' });

    record.otherDeductions = otherDeductions || 0;

    const employee = await Employee.findById(record.employee);
    // Recalculate everything to update net pay accurately (and also SSO cap if year matters)
    const calc = calculatePayroll(
      employee,
      record.otherDeductions,
      record.commissionAmount,
      record.salesBonus || 0,
      record.referralBonus || 0,
      record.period,
    );
    Object.assign(record, calc);
    record.calculatedAt = new Date();
    await record.save();

    const populated = await PayrollRecord.findById(record._id).populate({
      path: 'employee',
      populate: { path: 'branch', select: 'name code type' },
    });

    res.json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/payroll/:id/sales-bonus - HR กรอก Sale Bonus
router.put('/:id/sales-bonus', async (req, res) => {
  try {
    const { salesBonus } = req.body;
    const record = await PayrollRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'ไม่พบข้อมูล payroll' });

    const employee = await Employee.findById(record.employee);
    if (!employee) return res.status(404).json({ error: 'ไม่พบข้อมูลพนักงาน' });

    // Recalculate with updated sales bonus (preserve existing referralBonus and period)
    const calc = calculatePayroll(
      employee,
      record.otherDeductions,
      record.commissionAmount,
      salesBonus || 0,
      record.referralBonus || 0,
      record.period,
    );
    Object.assign(record, calc);
    record.calculatedAt = new Date();
    await record.save();

    const populated = await PayrollRecord.findById(record._id).populate({
      path: 'employee',
      populate: { path: 'branch', select: 'name code type' },
    });

    res.json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/payroll/commission-summary - สรุปค่าคอมโค้ชทุกคน
router.get('/commission-summary', async (req, res) => {
  try {
    const { period } = req.query;
    if (!period)
      return res.status(400).json({ error: 'กรุณาระบุ period (YYYY-MM)' });

    let startDate, endDate;
    const isUncounted = period.endsWith('-uncounted');
    const basePeriod = isUncounted ? period.replace('-uncounted', '') : period;
    const [year, month] = basePeriod.split('-');

    if (isUncounted) {
      // After 25th of current month to end of month
      startDate = new Date(year, parseInt(month) - 1, 26);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(year, parseInt(month), 0); // last day of month
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Normal: 26th of previous month to 25th of current month
      startDate = new Date(year, parseInt(month) - 2, 26);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(year, parseInt(month) - 1, 25);
      endDate.setHours(23, 59, 59, 999);
    }

    // ดึงโค้ชทั้งหมด (หรือเฉพาะ coachId ที่ส่งมา) จาก User model
    const { coachId } = req.query;
    const User = require('../models/User');
    const coachUsers = await User.find({ role: 'coach' }).populate({
      path: 'employee',
      populate: { path: 'branch', select: 'name code' },
    });

    let coaches = coachUsers
      .filter(u => u.employee && ['active', 'probation'].includes(u.employee.status))
      .map(u => u.employee);

    if (coachId) {
      coaches = coaches.filter(c => c._id.toString() === coachId);
    }

    const result = [];

    for (const coach of coaches) {
      const lessons = await LessonRecord.find({
        coach: coach._id,
        lessonDate: { $gte: startDate, $lte: endDate },
        status: { $in: ['completed', 'no_show'] },
      })
        .populate(
          'studentCourse',
          'commissionPerLesson perLessonRate commissionRate studentName company totalLessons',
        )
        .populate('branch', 'name code');

      let totalCommission = 0;
      for (const lesson of lessons) {
        if (lesson.studentCourse) {
          const lessonRate =
            lesson.commissionRate != null
              ? lesson.commissionRate
              : lesson.studentCourse.commissionRate || 0;
          const perLessonRate = lesson.studentCourse.perLessonRate || 0;
          totalCommission +=
            Math.round(((perLessonRate * lessonRate) / 100) * 100) / 100;
        }
      }

      result.push({
        coach,
        lessonsCount: lessons.length,
        totalCommission: Math.round(totalCommission * 100) / 100,
      });
    }

    // เรียงตามค่าคอมมากไปน้อย
    result.sort((a, b) => b.totalCommission - a.totalCommission);

    const grandTotal = result.reduce((sum, r) => sum + r.totalCommission, 0);
    const totalLessons = result.reduce((sum, r) => sum + r.lessonsCount, 0);

    res.json({
      coaches: result,
      summary: {
        totalCoaches: result.length,
        totalLessons,
        grandTotal: Math.round(grandTotal * 100) / 100,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payroll/commission-details - ดึงรายละเอียดค่าคอมโค้ช
router.get('/commission-details', async (req, res) => {
  try {
    const { coachId, period } = req.query;
    if (!coachId || !period) {
      return res.status(400).json({ error: 'กรุณาระบุ coachId และ period' });
    }

    const [year, month] = period.split('-');
    const startDate = new Date(year, parseInt(month) - 2, 26);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(year, parseInt(month) - 1, 25);
    endDate.setHours(23, 59, 59, 999);

    const lessons = await LessonRecord.find({
      coach: coachId,
      lessonDate: { $gte: startDate, $lte: endDate },
      status: { $in: ['completed', 'no_show'] },
    })
      .populate({
        path: 'studentCourse',
        select:
          'studentName packagePrice totalLessons commissionPerLesson commissionRate perLessonRate company',
      })
      .populate('branch', 'name code')
      .sort('lessonDate');

    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payroll/periods
router.get('/periods', async (req, res) => {
  try {
    const periods = await PayrollRecord.distinct('period');
    const periodList = periods
      .map((p) => {
        const [year, month] = p.split('-');
        const monthIndex = parseInt(month) - 1;
        return {
          value: p,
          label: `${THAI_MONTHS[monthIndex]} ${year}`,
        };
      })
      .sort((a, b) => b.value.localeCompare(a.value));

    res.json(periodList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET /api/payroll/my-payslip?employeeId=xxx&period=YYYY-MM - ดึง payslip ของพนักงาน
router.get('/my-payslip', async (req, res) => {
  try {
    const { employeeId, period } = req.query;
    if (!employeeId || !period) {
      return res.status(400).json({ error: 'กรุณาระบุ employeeId และ period' });
    }

    const records = await PayrollRecord.find({
      employee: employeeId,
      period,
    }).populate({
      path: 'employee',
      populate: { path: 'branch', select: 'name code type' },
    });

    const employee = await Employee.findById(employeeId).populate(
      'branch',
      'name code type',
    );

    res.json({ records, employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
