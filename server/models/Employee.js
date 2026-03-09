const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  
  // ข้อมูลส่วนตัว
  prefix: { type: String, default: 'นาย' },
  firstNameTh: { type: String, required: true },
  lastNameTh: { type: String, required: true },
  firstNameEn: { type: String, default: '' },
  lastNameEn: { type: String, default: '' },
  nickname: { type: String, default: '' },
  idCard: { type: String, default: '' },
  birthDate: { type: Date },
  gender: { type: String, enum: ['male', 'female'], default: 'male' },
  maritalStatus: { type: String, enum: ['single', 'married'], default: 'single' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },

  // ข้อมูลการทำงาน
  branch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
  companies: [{
    company: { type: String, enum: ['บุญรอดกอล์ฟพัฒนา', 'บุญรอดกอล์ฟโทเทิล'] },
    employmentType: { type: String, enum: ['fulltime', 'parttime'], default: 'fulltime' }
  }],
  department: { type: String, required: true },
  position: { type: String, required: true },
  level: { type: String, enum: ['junior', 'senior', 'manager'], default: 'junior' },
  employmentType: { type: String, enum: ['fulltime', 'parttime'], default: 'fulltime' },
  salaryType: { type: String, enum: ['monthly', 'daily'], default: 'monthly' },
  startDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'probation', 'resigned'], default: 'active' },
  shift: { type: String, default: 'normal' },

  // ข้อมูลเงินเดือน
  baseSalary: { type: Number, default: 0 },
  livingAllowance: { type: Number, default: 0 },
  positionAllowance: { type: Number, default: 0 },
  professionalAllowance: { type: Number, default: 0 },
  otRate: { type: Number, default: 0 },
  socialSecurityEnabled: { type: Boolean, default: true },
  taxMethod: { type: String, enum: ['progressive', 'flat'], default: 'progressive' },
  pvdPercent: { type: Number, default: 0 },

  // บัญชีธนาคาร
  bankName: { type: String, default: '' },
  bankAccount: { type: String, default: '' },
  bankAccountName: { type: String, default: '' },
}, { timestamps: true });

// Virtual: full name
employeeSchema.virtual('fullNameTh').get(function() {
  return `${this.firstNameTh} ${this.lastNameTh}`;
});

employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Employee', employeeSchema);
