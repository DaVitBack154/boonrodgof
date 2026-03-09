const mongoose = require('mongoose');

const lessonRecordSchema = new mongoose.Schema({
  studentCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentCourse' },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, // Not required for legacy
  lessonNumber: { type: Number, required: true },        // ครั้งที่ (1, 2, 3, ...)
  lessonDate: { type: Date, required: true },
  status: { type: String, enum: ['completed', 'no_show', 'cancelled', 'active', 'test', 'booked', 'legacy'], default: 'active' },
  notes: { type: String, default: '' },
  // Per-lesson commission override (default from StudentCourse, admin can change)
  commissionRate: { type: Number },                        // e.g. 40, 45, 50, 55, 60, 70
  company: { type: String, default: '' },                  // บุญรอดกอล์ฟพัฒนา / บุญรอดกอล์ฟโทเทิล
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }, // สาขาที่สอนครั้งนี้
  // สำหรับลูกค้าทดลองเรียน (Test)
  testCustomerName: { type: String, default: '' },       // ชื่อลูกค้าที่มาทดลอง
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, // พนักงานผู้แนะนำ
}, { timestamps: true });

module.exports = mongoose.model('LessonRecord', lessonRecordSchema);
