const mongoose = require('mongoose');

const payrollRecordSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  period: { type: String, required: true },          // e.g. "2024-02"
  periodLabel: { type: String, required: true },      // e.g. "กุมภาพันธ์ 2024"
  company: { type: String, enum: ['บริษัทพัฒนา', 'บริษัทTotal'], required: true },

  // รายได้
  baseSalary: { type: Number, default: 0 },
  livingAllowance: { type: Number, default: 0 },
  positionAllowance: { type: Number, default: 0 },
  professionalAllowance: { type: Number, default: 0 },
  otAmount: { type: Number, default: 0 },
  commissionAmount: { type: Number, default: 0 },    // ค่าคอมมิชชั่น (คำนวณจาก lessons)
  salesBonus: { type: Number, default: 0 },           // sale พิเศษ (HR กรอก)
  totalIncome: { type: Number, default: 0 },

  // รายการหัก (คำนวณอัตโนมัติ สำหรับ fulltime)
  withholdingTax: { type: Number, default: 0 },       // ภวด.1
  socialSecurity: { type: Number, default: 0 },       // ประกันสังคม
  otherDeductions: { type: Number, default: 0 },      // HR กรอกเอง

  // part-time specific
  parttimeWithholding: { type: Number, default: 0 },  // หักณที่จ่าย 3%

  totalDeductions: { type: Number, default: 0 },
  netPay: { type: Number, default: 0 },

  // metadata
  employmentType: { type: String, enum: ['fulltime', 'parttime'], default: 'fulltime' },
  status: { type: String, enum: ['draft', 'calculated', 'approved', 'paid'], default: 'draft' },
  calculatedAt: { type: Date },
}, { timestamps: true });

// Compound index: one record per employee per period per company
payrollRecordSchema.index({ employee: 1, period: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('PayrollRecord', payrollRecordSchema);
