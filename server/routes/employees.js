const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const User = require('../models/User');

// GET /api/employees/coaches - ดึงรายชื่อโค้ช (ที่มี Role เป็น coach ใน User)
router.get('/coaches', async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 0; // 0 means no limit
    
    // ค้นหา User ที่เป็น coach
    const coachUsers = await User.find({ role: 'coach' })
      .populate({
        path: 'employee',
        populate: { path: 'branch', select: 'name code type' }
      });
      
    // ดึงเฉพาะคนที่มี employee data
    let coaches = coachUsers
      .filter(u => u.employee)
      .map(u => ({
        ...u.employee.toObject(),
        role: u.role // เผื่อเอาไปใช้หน้า frontend
      }));
      
    // Apply filters from query if needed (e.g., branch)
    if (req.query.branch) {
      coaches = coaches.filter(c => {
        if (!c.branch) return false;
        const branchIds = Array.isArray(c.branch) 
          ? c.branch.map(b => b._id.toString()) 
          : [c.branch._id.toString()];
        return branchIds.includes(req.query.branch);
      });
    }
    if (req.query.status) {
      coaches = coaches.filter(c => c.status === req.query.status);
    }
    
    // Sort and limit
    coaches.sort((a, b) => a.employeeId.localeCompare(b.employeeId));
    if (limit > 0) {
        coaches = coaches.slice(skip, skip + limit);
    }
    
    res.json(coaches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/employees - ดึงรายชื่อพนักงาน (พร้อม filter)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    
    if (req.query.branch) filter.branch = { $in: [req.query.branch] };
    if (req.query.employmentType) filter.employmentType = req.query.employmentType;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.status) filter.status = req.query.status;

    const employees = await Employee.find(filter)
      .populate('branch', 'name code type')
      .sort('employeeId');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/employees/:id - ดูรายละเอียดพนักงาน
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('branch', 'name code type');
    if (!employee) return res.status(404).json({ error: 'ไม่พบข้อมูลพนักงาน' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/employees - เพิ่มพนักงานใหม่
router.post('/', async (req, res) => {
  try {
    // Auto-generate employeeId
    const last = await Employee.findOne().sort('-employeeId');
    let nextNum = 1;
    if (last && last.employeeId) {
      const num = parseInt(last.employeeId.replace('EMP-', ''));
      nextNum = num + 1;
    }
    req.body.employeeId = `EMP-${String(nextNum).padStart(3, '0')}`;

    const employee = new Employee(req.body);
    await employee.save();
    
    const populated = await Employee.findById(employee._id).populate('branch', 'name code type');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/employees/:id - แก้ไขข้อมูลพนักงาน
router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('branch', 'name code type');
    
    if (!employee) return res.status(404).json({ error: 'ไม่พบข้อมูลพนักงาน' });
    res.json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/employees/:id - ลบพนักงาน
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: 'ไม่พบข้อมูลพนักงาน' });
    res.json({ message: 'ลบพนักงานเรียบร้อย' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
