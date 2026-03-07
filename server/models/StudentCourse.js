const mongoose = require('mongoose');

const studentCourseSchema = new mongoose.Schema({
  // ข้อมูลลูกค้า
  studentName: { type: String, required: true },
  branch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
  notes: { type: String, default: '' },
  company: { type: String, enum: ['บริษัทพัฒนา', 'บริษัทTotal', ''], default: '' },

  // ข้อมูลคอร์ส
  packagePrice: { type: Number, required: true },       // ราคาเรียน (e.g. 30,000)
  totalLessons: { type: Number, required: true },        // จำนวนครั้งที่ซื้อ (e.g. 25)
  commissionRate: { type: Number, required: true },      // 40, 45, 50, 55, 60, 70

  // คำนวณอัตโนมัติ (pre-save hook)
  priceAfterDeduct: { type: Number, default: 0 },       // packagePrice × 0.93
  perLessonRate: { type: Number, default: 0 },           // priceAfterDeduct ÷ totalLessons
  commissionPerLesson: { type: Number, default: 0 },     // perLessonRate × commissionRate%

  // สถานะ
  lessonsCompleted: { type: Number, default: 0 },        // จำนวนครั้งที่เรียนแล้ว
  status: { type: String, enum: ['active', 'completed', 'cancelled', 'expired'], default: 'active' },
  startDate: { type: Date, default: Date.now },
}, { timestamps: true });

// Auto-calculate fields before saving
studentCourseSchema.pre('save', function() {
  this.priceAfterDeduct = Math.round(this.packagePrice * 0.93 * 100) / 100;
  this.perLessonRate = Math.round((this.priceAfterDeduct / this.totalLessons) * 100) / 100;
  this.commissionPerLesson = Math.round((this.perLessonRate * this.commissionRate / 100) * 100) / 100;
});

// Virtual: remaining lessons
studentCourseSchema.virtual('lessonsRemaining').get(function() {
  return Math.max(0, this.totalLessons - this.lessonsCompleted);
});

studentCourseSchema.set('toJSON', { virtuals: true });
studentCourseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('StudentCourse', studentCourseSchema);
