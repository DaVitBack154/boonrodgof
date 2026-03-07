const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');

// GET /api/branches - ดึงรายชื่อสาขาทั้งหมด
router.get('/', async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true });
    
    const sortOrder = [
      'สนามไดร์ฟ รัชดา-วิภาวดี',
      'สนามไดร์ฟ 42 ทีออฟสุขุมวิท',
      'สนามไดร์ฟ เบอดี้ไฟว์ สุวรรณภูมิ',
      'สนามไดร์ฟ SG Par3 ศรีนครินทร์'
    ];

    branches.sort((a, b) => {
      let indexA = sortOrder.indexOf(a.name);
      let indexB = sortOrder.indexOf(b.name);
      // Give those not in sortOrder a high index so they go to the bottom
      if(indexA === -1) indexA = 999;
      if(indexB === -1) indexB = 999;
      
      return indexA - indexB;
    });

    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/branches - เพิ่มสาขาใหม่
router.post('/', async (req, res) => {
  try {
    const branch = new Branch(req.body);
    await branch.save();
    res.status(201).json(branch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
