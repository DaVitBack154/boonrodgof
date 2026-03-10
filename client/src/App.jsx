import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./Pages/Dashboard";
import Employees from "./Pages/Employees";
import Attendance from "./Pages/Attendance";
import Payroll from "./Pages/Payroll";
import Leave from "./Pages/Leave";
import Schedule from "./Pages/Schedule";
import DailyCustomers from "./Pages/DailyCustomers";
import MonthlyCommission from "./Pages/MonthlyCommission";
import Payslip from "./Pages/Payslip";
import StudentCourses from "./Pages/StudentCourses";
import Login from "./Pages/Login";
import PaySocialSecurity from "./Pages/pay_social_security";
import { Box, Heading, Text } from "@chakra-ui/react";

const Placeholder = ({ title }) => (
  <Box p="8" textAlign="center" mt="20">
    <Heading color="gray.300" size="2xl" mb="4">
      {title}
    </Heading>
    <Text color="gray.500">หน้าต่างนี้กำลังอยู่ในระหว่างการพัฒนา</Text>
  </Box>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/schedule" replace />} />
        <Route path="daily-customers" element={<DailyCustomers />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="leave" element={<Leave />} />
        <Route path="monthly-commission" element={<MonthlyCommission />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="pay-social-security" element={<PaySocialSecurity />} />
        <Route path="payslip" element={<Payslip />} />
        <Route path="student-courses" element={<StudentCourses />} />
        <Route path="settings" element={<Placeholder title="ตั้งค่าระบบ" />} />
      </Route>
    </Routes>
  );
}

export default App;
