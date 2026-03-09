/**
 * Payroll Calculator Utility
 * 
 * กฎการคำนวณ:
 * - พนักงานประจำ (fulltime): หัก ภวด.1 + ประกันสังคม + หักอื่นๆ
 * - Part-time: หักณที่จ่าย 3% เท่านั้น (ไม่หัก ภวด.1, ประกันสังคม, หักอื่นๆ)
 * 
 * รายได้รวม = เงินเดือน + เบี้ยเลี้ยง + ค่าคอม + Sale Bonus
 */

const SOCIAL_SECURITY_RATE = 0.05;  // 5%
const SOCIAL_SECURITY_CAP = 750;     // cap 750 บาท/เดือน
const PARTTIME_WITHHOLDING_RATE = 0.03; // 3%

/**
 * คำนวณภาษีหัก ณ ที่จ่าย (ภวด.1) แบบประมาณ
 * ใช้ Progressive Tax Rate ของประเทศไทย คำนวณแบบรายเดือน
 */
function calculateWithholdingTax(annualIncome) {
  // ลดหย่อนส่วนตัว 60,000 + ค่าใช้จ่าย 100,000
  const taxableIncome = Math.max(0, annualIncome - 160000);
  
  let tax = 0;
  
  if (taxableIncome <= 150000) {
    tax = 0; // ยกเว้น
  } else if (taxableIncome <= 300000) {
    tax = (taxableIncome - 150000) * 0.05;
  } else if (taxableIncome <= 500000) {
    tax = 7500 + (taxableIncome - 300000) * 0.10;
  } else if (taxableIncome <= 750000) {
    tax = 27500 + (taxableIncome - 500000) * 0.15;
  } else if (taxableIncome <= 1000000) {
    tax = 65000 + (taxableIncome - 750000) * 0.20;
  } else if (taxableIncome <= 2000000) {
    tax = 115000 + (taxableIncome - 1000000) * 0.25;
  } else if (taxableIncome <= 5000000) {
    tax = 365000 + (taxableIncome - 2000000) * 0.30;
  } else {
    tax = 1265000 + (taxableIncome - 5000000) * 0.35;
  }

  // หารเป็นรายเดือน
  return Math.round((tax / 12) * 100) / 100;
}

/**
 * คำนวณประกันสังคม (หัก 5%) แบบปรับฐานตามปีปฏิทิน
 * ปัจจุบัน: ฐานสูงสุด 15,000 (แม็กซ์ 750)
 * 2569-2571 (2026-2028): ฐานสูงสุด 17,500 (แม็กซ์ 875)
 * 2572-2574 (2029-2031): ฐานสูงสุด 20,000 (แม็กซ์ 1000)
 * 2575 เป็นต้นไป (2032+): ฐานสูงสุด 23,000 (แม็กซ์ 1150)
 * 
 * @param {number} baseSalary - เงินเดือนฐาน
 * @param {string} period - งวดเงินเดือน 'YYYY-MM'
 */
function calculateSocialSecurity(baseSalary, period) {
  const [yearStr] = period ? period.split('-') : [new Date().getFullYear().toString()];
  const year = parseInt(yearStr);
  
  let maxSalaryBase = 15000; // ค่าเริ่มต้นก่อนปี 2026

  if (year >= 2032) {
    maxSalaryBase = 23000;
  } else if (year >= 2029) {
    maxSalaryBase = 20000;
  } else if (year >= 2026) {
    maxSalaryBase = 17500;
  }

  const cappedSalary = Math.min(baseSalary, maxSalaryBase);
  return Math.round(cappedSalary * SOCIAL_SECURITY_RATE * 100) / 100;
}

/**
 * คำนวณเงินเดือนสำหรับพนักงาน 1 คน
 * @param {Object} employee - ข้อมูลพนักงาน
 * @param {number} existingOtherDeductions - หักอื่นๆ (HR กรอก)
 * @param {number} commissionAmount - ค่าคอมมิชชั่น (คำนวณจาก lessons)
 * @param {number} salesBonus - sale พิเศษ (HR กรอก)
 * @param {number} referralBonus - ค่าแนะนำลูกค้า Test (100 บาท/คน)
 * @param {string} period - งวดเงินเดือน 'YYYY-MM' (สำหรับเช็คฐานประกันสังคมตามปี)
 */
function calculatePayroll(employee, existingOtherDeductions = 0, commissionAmount = 0, salesBonus = 0, referralBonus = 0, period = null) {
  const baseSalary = employee.baseSalary || 0;
  const livingAllowance = employee.livingAllowance || 0;
  const positionAllowance = employee.positionAllowance || 0;
  const professionalAllowance = employee.professionalAllowance || 0;
  
  // รวมรายได้ = เงินเดือน + เบี้ยเลี้ยง + ค่าคอม + Sale + ค่าแนะนำ
  const totalIncome = baseSalary + livingAllowance + positionAllowance + professionalAllowance + commissionAmount + salesBonus + referralBonus;
  
  let withholdingTax = 0;
  let socialSecurity = 0;
  let otherDeductions = existingOtherDeductions;
  let parttimeWithholding = 0;
  let totalDeductions = 0;

  if (employee.employmentType === 'parttime') {
    // Part-time: หักณที่จ่าย 3% เท่านั้น
    parttimeWithholding = Math.round(totalIncome * PARTTIME_WITHHOLDING_RATE * 100) / 100;
    totalDeductions = parttimeWithholding;
  } else {
    // Fulltime: หัก ภวด.1 + ประกันสังคม + หักอื่นๆ
    // ภวด.1 คิดจากยอดรวมทั้งหมด (salary + com + sale)
    const annualIncome = totalIncome * 12;
    withholdingTax = calculateWithholdingTax(annualIncome);
    
    if (employee.socialSecurityEnabled) {
      socialSecurity = calculateSocialSecurity(baseSalary, period);
    }
    
    totalDeductions = withholdingTax + socialSecurity + otherDeductions;
  }

  const netPay = Math.round((totalIncome - totalDeductions) * 100) / 100;

  return {
    baseSalary,
    livingAllowance,
    positionAllowance,
    professionalAllowance,
    otAmount: 0,
    commissionAmount,
    salesBonus,
    referralBonus,
    totalIncome,
    withholdingTax,
    socialSecurity,
    otherDeductions,
    parttimeWithholding,
    totalDeductions,
    netPay,
    employmentType: employee.employmentType,
  };
}

module.exports = {
  calculatePayroll,
  calculateWithholdingTax,
  calculateSocialSecurity,
};
