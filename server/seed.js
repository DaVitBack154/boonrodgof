/**
 * Seed Script - ข้อมูลพนักงานและผู้ใช้ จากตาราง Excel 23 คน
 *
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Branch = require('./models/Branch');
const Employee = require('./models/Employee');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/b-are-payroll';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Branch.deleteMany({});
    await Employee.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing branches, employees, and users');

    // Create branches
    const branches = await Branch.insertMany([
      { name: 'สนามไดร์ฟ รัชดา-วิภาวดี', code: 'ratchada', type: 'branch', address: 'กรุงเทพฯ' },
      { name: 'สนามไดร์ฟ 42 ทีออฟสุขุมวิท', code: 'teeoff', type: 'branch', address: 'กรุงเทพฯ' },
      { name: 'สนามไดร์ฟ เบอดี้ไฟว์ สุวรรณภูมิ', code: 'suwannaphum', type: 'branch', address: 'กรุงเทพฯ' },
      { name: 'สนามไดร์ฟ SG Par3 ศรีนครินทร์', code: 'srinakarin', type: 'branch', address: 'กรุงเทพฯ' },
    ]);
    console.log(`✅ Created ${branches.length} branches`);

    const branchMap = {
      'ratchada': branches.find(b => b.code === 'ratchada')._id,
      'teeoff': branches.find(b => b.code === 'teeoff')._id,
      'suwannaphum': branches.find(b => b.code === 'suwannaphum')._id,
      'srinakarin': branches.find(b => b.code === 'srinakarin')._id,
    };

    const getBranchIds = (branchStr) => {
      const ids = [];
      if (branchStr.includes('รัชดาวิภาวดี')) ids.push(branchMap.ratchada);
      if (branchStr.includes('42 Teeoff')) ids.push(branchMap.teeoff);
      if (branchStr.includes('เบอร์ดี้ 5')) ids.push(branchMap.suwannaphum);
      if (branchStr.includes('Sg par3')) ids.push(branchMap.srinakarin);
      return ids;
    };

    const parseCompanies = (companyStr) => {
      if (companyStr === 'กรรมการบริษัท') {
        return [
          { company: 'บุญรอดกอล์ฟพัฒนา', employmentType: 'fulltime' },
          { company: 'บุญรอดกอล์ฟโทเทิล', employmentType: 'fulltime' },
        ];
      }
      const parts = companyStr.split(',').map(s => s.trim());
      if (parts.length === 2) {
        return [
          { company: 'บุญรอดกอล์ฟพัฒนา', employmentType: parts[0].includes('พาร์ทไทม์') ? 'parttime' : 'fulltime' },
          { company: 'บุญรอดกอล์ฟโทเทิล', employmentType: parts[1].includes('พาร์ทไทม์') ? 'parttime' : 'fulltime' },
        ];
      }
      // single company
      return [
        { company: 'บุญรอดกอล์ฟพัฒนา', employmentType: parts[0].includes('พาร์ทไทม์') ? 'parttime' : 'fulltime' },
      ];
    };

    const excelData = [
      { no: 1, name: 'สุริยา บุญรอด', nick: 'โปรโอ๊ต', email: 'suriyaboonrod11@gmail.com', branch: 'สาขารัชดาวิภาวดี , สาขา Sg par3 , สาขา 42 Teeoff', company: 'กรรมการบริษัท', phone: '082-8419743', role: 'coach' },
      { no: 2, name: 'อติรุจ ภาสะวนิจ', nick: 'โปรเต๋า', email: 'tao_rare_522@hotmail.com', branch: 'สาขารัชดาวิภาวดี', company: 'บุญรอดกอล์ฟพ้อยท์ (ประจำ), บุญรอดกอล์ฟพ้อยท์ (พาร์ทไทม์)', phone: '063-4102410', role: 'coach' },
      { no: 3, name: 'วีรภัทร ภาสะวนิจ', nick: 'โปรตาม', email: 'veerapatbhasa@gmail.com', branch: 'สาขารัชดาวิภาวดี', company: 'บุญรอดกอล์ฟพ้อยท์ (ประจำ), บุญรอดกอล์ฟพ้อยท์ (พาร์ทไทม์)', phone: '065-7039671', role: 'coach' },
      { no: 4, name: 'ธัชกร อุทธิเสน', nick: 'โปรทอง', email: 'Changmaster999@gmail.com', branch: 'สาขารัชดาวิภาวดี', company: 'บุญรอดกอล์ฟพ้อยท์ (พาร์ทไทม์), บุญรอดกอล์ฟพ้อยท์ (พาร์ทไทม์)', phone: '095-7748145', role: 'coach' },
      { no: 5, name: 'วีรภัทร รักอยู่', nick: 'โปรวี', email: 'tottorisand@gmail.com', branch: 'สาขารัชดาวิภาวดี', company: 'บุญรอดกอล์ฟพ้อยท์ (พาร์ทไทม์), บุญรอดกอล์ฟพ้อยท์ (พาร์ทไทม์)', phone: '', role: 'coach' },
      { no: 6, name: 'ธวัชชัย การถัก', nick: 'โค้ชต้น', email: 'tawatchaikanthak50@gmail.com', branch: 'สาขารัชดาวิภาวดี', company: 'บุญรอดกอล์ฟพ้อยท์ (ประจำ)', phone: '063-9470279', role: 'coach' },
      { no: 7, name: 'กันตพล องคเจตน์พณิชย์ศิริ', nick: 'โปรนิว', email: 'kantapon741852@gmail.com', branch: 'สาขารัชดาวิภาวดี', company: 'บุญรอดกอล์ฟพ้อยท์ (ประจำ)', phone: '086-4261493', role: 'coach' },
      { no: 8, name: 'ร็อกกี้ ณ ระนอง', nick: 'โปรพกี้', email: 'rockynaranong@gmail.com', branch: 'สาขารัชดาวิภาวดี , สาขา Sg par3', company: 'บุญรอดกอล์ฟพ้อยท์ (ประจำ)', phone: '064-5241254', role: 'coach' },
      { no: 9, name: 'อัครวินท์ ราชเมืองแก้ว', nick: 'โปรวิน', email: 'Akkaravinek@gmail.com', branch: 'สาขารัชดาวิภาวดี , สาขา 42 Teeoff', company: 'บุญรอดกอล์ฟพ้อยท์ (ประจำ)', phone: '086-3549390', role: 'coach' },
      { no: 10, name: 'พลสัณห์ สุขพันธ์พาส', nick: 'โปรบอล', email: 'Stga2ballz@gmail.com', branch: 'สาขาเบอร์ดี้ 5', company: 'บุญรอดกอล์ฟพ้อยท์ (ประจำ)', phone: '090-2820522', role: 'coach' },
      { no: 11, name: 'นายวัลลภ บูชชุม', nick: 'โปรวัลลภ', email: 'wallop.h28@gmail.com', branch: 'สาขาเบอร์ดี้ 5', company: 'บุญรอดกอล์ฟพ้อยท์ (ประจำ)', phone: '081-9264289', role: 'coach' },
      { no: 12, name: 'กวินท์ กิติชัยชาญ', nick: 'โปรมิ้ง', email: 'kavinkittichaichan99@gmail.com', branch: 'สาขาเบอร์ดี้ 5', company: 'บุญรอดกอล์ฟพ้อยท์ (ประจำ)', phone: '095-8312221', role: 'coach' },
      { no: 13, name: 'มธุสร รอดเกตุ', nick: 'โปรเฟีส', email: 'mathusorn12082547@gmail.com', branch: 'สาขา Sg par3', company: 'บุญรอดกอล์ฟพ้อยท์ (ประจำ)', phone: '080-4421057', role: 'coach' },
      { no: 14, name: 'คุรุชล ศกุลดี', nick: 'โปรป๊บ', email: 'Peat-31450@hotmail.com', branch: 'สาขา Sg par3 , สาขา 42 Teeoff', company: 'บุญรอดกอล์ฟพ้อยท์ (พาร์ทไทม์), บุญรอดกอล์ฟพ้อยท์ (พาร์ทไทม์)', phone: '096-8300094', role: 'coach' },
      { no: 15, name: 'กาญจน์ธิติ บิลลอบ', nick: 'โปรปั๊บ', email: 'Kannibi1428@gmail.com', branch: 'สาขา 42 Teeoff', company: 'บุญรอดกอล์ฟพ้อยท์ (พาร์ทไทม์), บุญรอดกอล์ฟพ้อยท์ (พาร์ทไทม์)', phone: '094-9292429', role: 'coach' },
      { no: 16, name: 'ศิริชัย พุ่มโกสุม', nick: 'โปรแทงค์', email: 'sirachatt@gmail.com', branch: 'สาขา 42 Teeoff', company: 'บุญรอดกอล์ฟพ้อยท์ (พาร์ทไทม์)', phone: '081-6843346', role: 'coach' },
      { no: 17, name: 'ชินานาง ชะรุมรัมย์', nick: 'คุณแอ้', email: 'b.bluebeen@gmail.com', branch: 'สาขารัชดาวิภาวดี', company: 'กรรมการบริษัท', phone: '085-3565755', role: 'admin' },
      { no: 18, name: 'ธนะชาติ กุลวิจิตร', nick: 'แอดมินแบงค์', email: 'thanachat1223@gmail.com', branch: 'สาขารัชดาวิภาวดี', company: 'บุญรอดกอล์ฟพ้อยท์ (ประจำ)', phone: '096-7766813', role: 'admin' },
      { no: 19, name: 'พิชยากรณ์ ภูมิประพันธ์', nick: 'แอดมินแพร', email: 'Thepear.25@gmail.com', branch: 'สาขาเบอร์ดี้ 5', company: 'บุญรอดกอล์ฟพ้อยท์ (ประจำ)', phone: '095-4936329', role: 'admin' },
      { no: 20, name: 'นวมินทร์ จันทร์ทรัพย์', nick: 'กราฟิกน้องคอม', email: 'Diskfear00789@gmail.com', branch: 'สาขารัชดาวิภาวดี', company: 'บุญรอดกอล์ฟพ้อยท์ (ประจำ)', phone: '061-1471858', role: 'admin' },
      { no: 21, name: 'นายพงศกร บูรณอุดมดล', nick: 'โปรปั๊ก', email: 'pskplug@gmail.com', branch: 'สาขา Sg par3', company: 'บุญรอดกอล์ฟพ้อยท์ (พาร์ทไทม์)', phone: '', role: 'coach' },
      { no: 22, name: 'กฤตพัฒน์ ทวีนพโชติ', nick: 'โปรพีท', email: 'Krittapat.f.work@gmail.com', branch: 'สาขา 42 Teeoff', company: 'บุญรอดกอล์ฟพ้อยท์ (พาร์ทไทม์)', phone: '091-9659239', role: 'coach' },
      { no: 23, name: 'ปรีชา ธีระรัฐโชติ', nick: 'โปรเมย์', email: 'Imeygin28@gmail.com', branch: 'สาขา 42 Teeoff', company: 'บุญรอดกอล์ฟพ้อยท์ (พาร์ทไทม์)', phone: '062-4789636', role: 'coach' },
    ];

    for (const data of excelData) {
      const parts = data.name.trim().split(' ');
      const firstNameTh = parts[0];
      const lastNameTh = parts.slice(1).join(' ') || '-';
      
      const companies = parseCompanies(data.company);
      const branchIds = getBranchIds(data.branch);
      // employmentType ใช้จาก company แรก (backward compat)
      const empType = companies[0].employmentType;

      let department = 'ผู้ฝึกสอน';
      let position = 'Coach';
      
      if (data.role === 'admin') {
         department = 'แอดมิน / พนักงานประจำ';
         position = data.nick;
      }

      const employeeId = `EMP-${String(data.no).padStart(3, '0')}`;

      // Insert Employee
      const emp = new Employee({
        employeeId,
        prefix: data.name.startsWith('นาย') ? 'นาย' : (data.name.startsWith('นาง') ? 'นาง' : ''),
        firstNameTh: firstNameTh.replace(/^(นาย|นางสาว|นาง)/, ''),
        lastNameTh,
        nickname: data.nick,
        email: data.email,
        phone: data.phone,
        branch: branchIds,
        companies,
        department,
        position,
        employmentType: empType,
        startDate: '2023-01-01',
        status: 'active',
      });
      await emp.save();

      // Insert User
      // Everyone uses password '123456'
      await User.create({
        email: data.email,
        password: '123456',
        role: data.role,
        employee: emp._id
      });
    }

    console.log(`✅ Created ${excelData.length} employees and users from Excel`);

  } catch (err) {
    console.error('❌ Error during seeding:', err);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Seed complete! Database disconnected.');
  }
}

seed();
