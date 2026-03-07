const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
    }

    // Find User by email and populate employee data
    const user = await User.findOne({ email }).populate({
      path: 'employee',
      populate: { path: 'branch', select: 'name code' }
    });

    if (!user) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // Compare plain text password (for this phase)
    if (user.password !== password) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // Structure response for frontend compatibility
    // We send back user._id, role, and the merged employee payload 
    const payload = {
      _id: user.employee ? user.employee._id : user._id, 
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    if (user.employee) {
      payload.employeeId = user.employee.employeeId;
      payload.firstNameTh = user.employee.firstNameTh;
      payload.lastNameTh = user.employee.lastNameTh;
      payload.department = user.employee.department;
      payload.position = user.employee.position;
      payload.branch = user.employee.branch;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'Boonrod',
      { expiresIn: '30d' }
    );

    res.json({
      message: 'ล็อกอินสำเร็จ',
      user: payload,
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบเซิร์ฟเวอร์' });
  }
});

module.exports = router;
