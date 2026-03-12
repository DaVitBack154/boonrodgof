import {
  Box,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Avatar,
  SimpleGrid,
  Select,
  Spinner,
  Center,
  Input,
  Button,
  VStack,
  useToast,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  IconButton,
} from '@chakra-ui/react';
import { Modal, Form, Select as AntSelect, DatePicker, message } from 'antd';
import Spinload from '../Components/spinload';
import dayjs from 'dayjs';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import {
  getSchedule,
  getDailySchedule,
  getStudentCourses,
  addLesson,
  updateLesson,
  createStudentCourse,
  createTestLesson,
  getEmployees,
  getCoaches,
  getBranches,
} from '../services/api';
import { IoIosAddCircle } from 'react-icons/io';
import { IoMdPie } from 'react-icons/io';

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

const THAI_DAYS = [
  'อาทิตย์',
  'จันทร์',
  'อังคาร',
  'พุธ',
  'พฤหัสบดี',
  'ศุกร์',
  'เสาร์',
];
const SHORT_DAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

// สี background สำหรับแต่ละโค้ช (วนรอบ)
const COACH_COLORS = [
  { bg: '#FFF3E0', border: '#FF9800', text: '#E65100' },
  { bg: '#E8F5E9', border: '#4CAF50', text: '#1B5E20' },
  { bg: '#E3F2FD', border: '#2196F3', text: '#0D47A1' },
  { bg: '#FCE4EC', border: '#E91E63', text: '#880E4F' },
  { bg: '#F3E5F5', border: '#9C27B0', text: '#4A148C' },
  { bg: '#FFF8E1', border: '#FFC107', text: '#F57F17' },
  { bg: '#E0F7FA', border: '#00BCD4', text: '#006064' },
  { bg: '#EFEBE9', border: '#795548', text: '#3E2723' },
];

const STATUS_COLORS = {
  active: { bg: 'orange.50', color: 'orange.600', label: 'รอคอนเฟิร์ม' },
  booked: { bg: 'blue.50', color: 'blue.600', label: 'จองคลาส' },
  completed: { bg: 'green.50', color: 'green.700', label: 'มาเรียนแล้ว' },
  no_show: { bg: 'red.50', color: 'red.600', label: 'ไม่มาเรียน (หักชั่วโมง)' },
  cancelled: { bg: 'gray.100', color: 'gray.500', label: 'ยกเลิกคลาส' },
  test: { bg: 'purple.50', color: 'purple.600', label: 'ทดลองเรียน' },
};

// Helper: format date as YYYY-MM-DD
const fmtDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

// Helper: format date as Thai
const fmtThaiDate = (d) => {
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const Schedule = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(fmtDate(today));
  const [viewMode, setViewMode] = useState('daily'); // "daily" | "monthly"
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const dateObj = new Date(selectedDate + 'T00:00:00');
  const monthStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

  const fetcher = async ([_, vMode, sDate, sBranch]) => {
    if (vMode === 'daily') {
      return await getDailySchedule(sDate, sBranch || undefined);
    } else {
      const d = new Date(sDate + 'T00:00:00');
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return await getSchedule(mStr, sBranch || undefined);
    }
  };

  const {
    data: scheduleData,
    mutate: mutateSchedule,
    isLoading: loading,
  } = useSWR(
    ['schedule', viewMode, selectedDate, selectedBranch],
    fetcher,
    { refreshInterval: 5000 }, // Polling every 5 seconds for real-time updates
  );

  const dailyData =
    viewMode === 'daily'
      ? scheduleData || { lessons: [], coaches: [] }
      : { lessons: [], coaches: [] };
  const monthlyData =
    viewMode === 'monthly'
      ? scheduleData || { lessons: [], summary: { coachStats: [] } }
      : { lessons: [], summary: { coachStats: [] } };

  const fetchData = () => {
    mutateSchedule();
  };

  // Add Lesson Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerType, setCustomerType] = useState(null); // null | "test" | "existing" | "new"
  const [activeCourses, setActiveCourses] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [coachesList, setCoachesList] = useState([]);
  const [form] = Form.useForm();

  // Edit Lesson Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editForm] = Form.useForm();

  const toast = useToast();

  const loadActiveCourses = async () => {
    try {
      const params = { status: 'active' };
      if (selectedBranch) params.branch = selectedBranch;
      const courses = await getStudentCourses(params);
      setActiveCourses(courses || []);
    } catch (error) {
      console.error('Failed to load active courses', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const emps = await getEmployees();
      setAllEmployees(emps || []);
      const coaches = await getCoaches();
      setCoachesList(coaches || []);
    } catch (error) {
      console.error('Failed to load employees/coaches', error);
    }
  };

  const openAddModal = () => {
    setCustomerType(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'active',
      branchId: selectedBranch || undefined,
    });
    loadActiveCourses();
    loadEmployees();
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (values) => {
    setIsSaving(true);
    try {
      // UX Delay 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // === Test Mode: สร้าง test lesson โดยไม่ต้องมี course ===
      if (customerType === 'test') {
        const formattedDate = values.date.format('YYYY-MM-DD');
        const lessonDate = new Date(`${formattedDate}T${values.time}:00`);

        const payload = {
          testCustomerName: values.testCustomerName,
          coach: values.coachId,
          lessonDate,
          referredBy: values.referredBy || undefined,
          branch: values.branchId || selectedBranch || undefined,
          company: values.company || '',
        };

        await createTestLesson(payload);
        toast({
          title: 'บันทึกลูกค้าทดลองสำเร็จ',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setIsAddModalOpen(false);
        form.resetFields();
        fetchData();
        return;
      }

      // === Existing or New Customer ===
      const formattedDate = values.date.format('YYYY-MM-DD');
      const lessonDate = new Date(`${formattedDate}T${values.time}:00`);

      const payload = {
        lessonDate,
        coach: values.coachId,
        status: values.status || 'active',
        branch: values.branchId || selectedBranch || undefined,
      };

      if (customerType === 'existing') {
        // Multi-select: สร้าง lesson ให้แต่ละคนที่เลือก
        const courseIds = Array.isArray(values.courseIds)
          ? values.courseIds
          : [values.courseIds];

        // Add per-lesson override if provided
        if (values.lessonCommissionRate != null) {
          payload.commissionRate = values.lessonCommissionRate;
        }
        if (values.lessonCompany) {
          payload.company = values.lessonCompany;
        }

        // ถ้าเลือกลูกค้าหลายคน = สอนกลุ่ม → ข้ามการเช็คเวลาซ้ำ
        if (courseIds.length > 1) {
          payload.isGroupLesson = true;
        }

        for (const cid of courseIds) {
          await addLesson(cid, payload);
        }
      } else if (customerType === 'new') {
        const newCourseData = {
          studentName: values.newStudentName,
          packagePrice: values.packagePrice || 0,
          totalLessons: values.totalLessons || 1,
          commissionRate: values.commissionRate || 40,
          company: values.company || '',
        };
        const targetBranch = values.branchId || selectedBranch;
        if (targetBranch) newCourseData.branch = [targetBranch];
        const res = await createStudentCourse(newCourseData);
        const courseId = res.course ? res.course._id : res._id;
        await addLesson(courseId, payload);
      }

      toast({
        title: 'เพิ่มนัดหมายสำเร็จ',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsAddModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (err) {
      console.error(err);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: err.response?.data?.error || err.message,
        status: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (lesson, sc) => {
    setEditingLesson({ lesson, sc });
    loadEmployees();
    editForm.setFieldsValue({
      status: lesson.status,
      coachId: lesson.coach?._id,
      date: dayjs(lesson.lessonDate),
      time: dayjs(lesson.lessonDate).format('HH:00'),
      branchId: lesson.branch?._id || lesson.branch,
      commissionRate: lesson.commissionRate || sc?.commissionRate || undefined,
      company: lesson.company || sc?.company || undefined,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (values) => {
    setIsSaving(true);
    try {
      // UX Delay 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const formattedDate = values.date.format('YYYY-MM-DD');
      const lessonDate = new Date(`${formattedDate}T${values.time}:00`);

      const payload = {
        status: values.status,
        coach: values.coachId,
        lessonDate: lessonDate,
      };

      if (values.branchId) payload.branch = values.branchId;
      if (values.commissionRate) payload.commissionRate = values.commissionRate;
      if (values.company) payload.company = values.company;

      await updateLesson(
        editingLesson.sc?._id || 'standalone',
        editingLesson.lesson._id,
        payload,
      );
      toast({
        title: 'อัปเดตข้อมูลสำเร็จ',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      setIsEditModalOpen(false);
      setEditingLesson(null);
      fetchData();
    } catch (err) {
      console.error(err);
      toast({
        title: 'อัปเดตไม่สำเร็จ',
        description: err.response?.data?.error || err.message,
        status: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (courseId, lessonId, newStatus) => {
    try {
      await updateLesson(courseId, lessonId, { status: newStatus });
      toast({
        title: 'อัปเดตสถานะสำเร็จ',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      fetchData();
    } catch (err) {
      console.error(err);
      toast({
        title: 'อัปเดตสถานะไม่สำเร็จ',
        description: err.message,
        status: 'error',
      });
    }
  };

  // Load branches on mount
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const data = await getBranches();
        setBranches(data || []);
      } catch (err) {
        console.error('Failed to load branches', err);
      }
    };
    loadBranches();
  }, []);

  // Date navigation
  const goToday = () => setSelectedDate(fmtDate(new Date()));
  const goPrev = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    if (viewMode === 'monthly') {
      d.setDate(1);
      d.setMonth(d.getMonth() - 1);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setSelectedDate(fmtDate(d));
  };
  const goNext = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    if (viewMode === 'monthly') {
      d.setDate(1);
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setSelectedDate(fmtDate(d));
  };

  // Build grid data: time × coach
  const { grid, coaches } = useMemo(() => {
    let coaches = [...(dailyData.coaches || [])];

    // Sort so logged-in user is first
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.employeeId) {
          const loggedInIdx = coaches.findIndex(
            (c) => c.employeeId === user.employeeId,
          );
          if (loggedInIdx > 0) {
            const [loggedInCoach] = coaches.splice(loggedInIdx, 1);
            coaches.unshift(loggedInCoach);
          }
        }
      } catch (e) {
        console.error('Failed to parse user data for sorting', e);
      }
    }

    const grid = {};

    // Initialize empty grid
    TIME_SLOTS.forEach((time) => {
      grid[time] = {};
      coaches.forEach((c) => {
        grid[time][c._id] = [];
      });
    });

    // Fill grid with lessons
    (dailyData.lessons || []).forEach((lesson) => {
      if (!lesson.coach) return;
      const d = new Date(lesson.lessonDate);
      const h = String(d.getHours()).padStart(2, '0');
      const timeKey = `${h}:00`;
      const coachId = lesson.coach._id;

      if (grid[timeKey] && grid[timeKey][coachId] !== undefined) {
        grid[timeKey][coachId].push(lesson);
      }
    });

    return { grid, coaches };
  }, [dailyData]);

  // Coach color map
  const coachColorMap = useMemo(() => {
    const map = {};
    coaches.forEach((c, i) => {
      map[c._id] = COACH_COLORS[i % COACH_COLORS.length];
    });
    return map;
  }, [coaches]);

  // Monthly calendar data
  const calendarDays = useMemo(() => {
    if (viewMode !== 'monthly') return [];
    const [y, m] = monthStr.split('-').map(Number);
    const firstDay = new Date(y, m - 1, 1);
    const lastDay = new Date(y, m, 0);
    const daysInMonth = lastDay.getDate();
    const startDow = firstDay.getDay();

    const days = [];
    // Pad start
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [monthStr, viewMode]);

  // Count lessons by day for monthly view
  const lessonsByDay = useMemo(() => {
    const map = {};
    (monthlyData.lessons || []).forEach((l) => {
      const d = new Date(l.lessonDate).getDate();
      if (!map[d]) map[d] = [];
      map[d].push(l);
    });
    return map;
  }, [monthlyData]);

  const dayOfWeek = dateObj.getDay();
  const thaiDay = THAI_DAYS[dayOfWeek];

  return (
    <Box>
      {/* Header */}
      <Flex
        bg="white"
        p="4"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        mb="4"
        justify="space-between"
        align="center"
        flexWrap="wrap"
        gap="4"
      >
        <Flex align="center" gap="4">
          {/* Title Area */}
          <Flex align="center">
            <Box
              bg={'#03337D'}
              color="white"
              p={2.5}
              borderRadius="xl"
              shadow="sm"
            >
              <IoMdPie size={20} />
            </Box>
            <Box ml={3}>
              <Heading size="md" color="#021841" fontWeight="bold">
                ตารางการสอนของโค้ช
              </Heading>

              {viewMode === 'daily' && (
                <Flex
                  mt="2"
                  gap={{ base: '2', md: '4' }}
                  fontSize="xs"
                  color="gray.500"
                  flexWrap="wrap"
                >
                  <Flex align="center" gap="1">
                    <Box w="10px" h="10px" borderRadius="full" bg="#ED8936" />
                    <Text>รอคอนเฟิร์ม</Text>
                  </Flex>
                  <Flex align="center" gap="1">
                    <Box w="10px" h="10px" borderRadius="full" bg="#3182CE" />
                    <Text>จองคลาส</Text>
                  </Flex>
                  <Flex align="center" gap="1">
                    <CheckCircle size="14" color="#38A169" />
                    <Text>มาเรียนแล้ว</Text>
                  </Flex>
                  <Flex align="center" gap="1">
                    <XCircle size="14" color="#E53E3E" />
                    <Text>ไม่มาเรียน</Text>
                  </Flex>
                  <Flex align="center" gap="1">
                    <AlertCircle size="14" color="#A0AEC0" />
                    <Text>ยกเลิก</Text>
                  </Flex>
                </Flex>
              )}
            </Box>
          </Flex>

          {/* Legend */}
        </Flex>

        <Flex align="center" gap="3">
          {JSON.parse(localStorage.getItem('user') || '{}').role ===
            'admin' && (
            <Button
              size="md"
              bg={'#03337D'}
              _hover={{ bg: '#021841' }}
              color={'#FFF'}
              leftIcon={<IoIosAddCircle size="20" />}
              onClick={openAddModal}
              borderRadius="lg"
              px="5"
            >
              เพิ่มนัดหมาย
            </Button>
          )}

          <Flex
            bg="gray.50"
            p="1"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Button
              size="sm"
              bg={viewMode === 'daily' ? 'white' : 'transparent'}
              color={viewMode === 'daily' ? '#03337D' : 'gray.500'}
              boxShadow={viewMode === 'daily' ? 'sm' : 'none'}
              onClick={() => setViewMode('daily')}
              borderRadius="lg"
              px="4"
              _hover={{ bg: viewMode === 'daily' ? 'white' : 'gray.100' }}
            >
              รายวัน
            </Button>
            <Button
              size="sm"
              bg={viewMode === 'monthly' ? 'white' : 'transparent'}
              color={viewMode === 'monthly' ? '#03337D' : 'gray.500'}
              boxShadow={viewMode === 'monthly' ? 'sm' : 'none'}
              onClick={() => setViewMode('monthly')}
              borderRadius="lg"
              px="4"
              _hover={{ bg: viewMode === 'monthly' ? 'white' : 'gray.100' }}
            >
              รายเดือน
            </Button>
          </Flex>
        </Flex>
      </Flex>

      {/* Header Controls */}
      <Box
        bg="white"
        p="4"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        mb="4"
      >
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', lg: 'center' }}
          direction={{ base: 'column', lg: 'row' }}
          gap="4"
        >
          {/* Left: Date Navigation */}
          <Flex align="center" gap="3" flexWrap="wrap">
            <IconButton
              icon={<ChevronLeft size="18" />}
              size="sm"
              variant="outline"
              borderRadius="lg"
              onClick={goPrev}
              aria-label="วันก่อน"
            />
            <IconButton
              icon={<ChevronRight size="18" />}
              size="sm"
              variant="outline"
              borderRadius="lg"
              onClick={goNext}
              aria-label="วันถัดไป"
            />
            <Button
              size="sm"
              variant="outline"
              borderRadius="lg"
              onClick={goToday}
            >
              วันนี้
            </Button>
            <DatePicker
              picker={viewMode === 'daily' ? 'date' : 'month'}
              value={dayjs(viewMode === 'daily' ? selectedDate : monthStr)}
              format={viewMode === 'daily' ? 'DD/MM/YYYY' : 'MM/YYYY'}
              allowClear={false}
              inputReadOnly
              onChange={(value) => {
                if (!value) return;
                if (viewMode === 'daily') {
                  setSelectedDate(value.format('YYYY-MM-DD'));
                } else {
                  setSelectedDate(`${value.format('YYYY-MM')}-01`);
                }
              }}
              style={{ width: 230 }}
              size="middle"
            />
            <Box>
              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                {viewMode === 'daily'
                  ? `วัน${thaiDay}ที่ ${fmtThaiDate(dateObj)}`
                  : `${THAI_MONTHS[dateObj.getMonth()]} ${dateObj.getFullYear()}`}
              </Text>
            </Box>

            {viewMode === 'daily' && (
              <Badge
                bg={'#021841'}
                color={'white'}
                fontSize="xs"
                borderRadius="full"
                px="3"
                py="1"
              >
                {(dailyData.lessons || []).filter((l) => l.status !== 'legacy')
                  .length || 0}{' '}
                รายการ
              </Badge>
            )}
          </Flex>

          {/* Right: Branch Selector */}
          <Flex align="center" gap="3" w={{ base: '100%', lg: 'auto' }}>
            <Text
              fontWeight="bold"
              fontSize="sm"
              color="gray.600"
              whiteSpace="nowrap"
            >
              สาขา
            </Text>
            <Select
              size="sm"
              borderRadius="lg"
              maxW={{ base: '100%', lg: '250px' }}
              flex="1"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              bg="gray.50"
            >
              <option value="">-- ทุกสาขา --</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </Select>
            {selectedBranch && (
              <Badge
                colorScheme="teal"
                borderRadius="full"
                px="3"
                py="1"
                fontSize="xs"
                display={{ base: 'none', md: 'inline-block' }}
              >
                {branches.find((b) => b._id === selectedBranch)?.name}
              </Badge>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* ===== DAILY VIEW (Excel-like) ===== */}
      {viewMode === 'daily' && (
        <Box
          bg="white"
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
          overflow="hidden"
          mb={8}
        >
          {loading ? (
            <Center py="20">
              <Spinner size="xl" color="brand.500" />
            </Center>
          ) : coaches.length === 0 ? (
            <Center py="20" flexDirection="column">
              <Calendar size="48" color="#CBD5E0" />
              <Text color="gray.400" mt="4">
                ไม่พบข้อมูลโค้ช
              </Text>
            </Center>
          ) : (
            <Box
              overflowX="auto"
              overflowY="auto"
              maxH={{ base: '70vh', lg: 'calc(100vh - 260px)' }}
              css={{
                '&::-webkit-scrollbar': {
                  height: '8px',
                  width: '8px',
                },
                '@media (max-width: 768px)': {
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                },
                '&::-webkit-scrollbar-track': { bg: 'transparent' },
                '&::-webkit-scrollbar-thumb': {
                  bg: 'gray.300',
                  borderRadius: 'full',
                },
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <Table
                variant="unstyled"
                size="sm"
                sx={{
                  'td, th': { border: '1px solid', borderColor: 'gray.200' },
                  th: { position: 'sticky', top: 0, zIndex: 2, bg: 'gray.50' },
                }}
              >
                <Thead>
                  <Tr>
                    <Th
                      py="3"
                      px="3"
                      color="gray.700"
                      fontSize="xs"
                      fontWeight="bold"
                      textAlign="center"
                      minW={{ base: '75px', md: '80px' }}
                      w={{ base: '75px', md: '80px' }}
                      bg="gray.100"
                      position="sticky"
                      left={0}
                      zIndex={3}
                      boxShadow="1px 0 0 0 var(--chakra-colors-gray-200)"
                      whiteSpace="nowrap"
                      userSelect="none"
                    >
                      เวลา
                    </Th>
                    {coaches.map((coach, idx) => (
                      <Th
                        key={coach._id}
                        py="3"
                        px="2"
                        color="gray.800"
                        fontSize="xs"
                        fontWeight="bold"
                        textAlign="center"
                        minW={{ base: '90px', md: '130px' }}
                        w={{ base: '90px', md: '130px' }}
                        bg={idx % 2 === 0 ? 'gray.50' : 'white'}
                      >
                        <VStack spacing="0">
                          <Text>{coach.nickname || coach.firstNameTh}</Text>
                          {/* <Text
                            fontSize="10px"
                            opacity={0.8}
                            fontWeight="normal"
                          >
                            {Array.isArray(coach.branch)
                              ? coach.branch
                                  .map((b) => b?.name)
                                  .filter(Boolean)
                                  .join(", ")
                              : coach.branch?.name || ""}
                          </Text> */}
                          <Text
                            fontSize="9px"
                            opacity={0.6}
                            fontWeight="normal"
                          >
                            {coach.department === 'ผู้ฝึกสอน'
                              ? 'Coach'
                              : 'Coach'}
                          </Text>
                        </VStack>
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {TIME_SLOTS.map((time, timeIdx) => {
                    return (
                      <Tr
                        key={time}
                        bg={timeIdx % 2 === 0 ? 'white' : 'gray.50'}
                      >
                        <Td
                          py="2"
                          px="3"
                          fontWeight="bold"
                          fontSize="sm"
                          textAlign="center"
                          color={'gray.600'}
                          bg={timeIdx % 2 === 0 ? 'gray.50' : 'gray.100'}
                          position="sticky"
                          left={0}
                          zIndex={1}
                          minW={{ base: '75px', md: '80px' }}
                          w={{ base: '75px', md: '80px' }}
                          boxShadow="1px 0 0 0 var(--chakra-colors-gray-200)"
                          whiteSpace="nowrap"
                        >
                          {time}
                        </Td>
                        {coaches.map((coach) => {
                          const cellLessons = grid[time]?.[coach._id] || [];
                          const colors = coachColorMap[coach._id];

                          if (cellLessons.length === 0) {
                            return (
                              <Td
                                key={coach._id}
                                py="1"
                                px="1"
                                minH="45px"
                                h="45px"
                              />
                            );
                          }

                          return (
                            <Td
                              key={coach._id}
                              py="1"
                              px="1"
                              bg="white"
                              borderLeft={`3px solid ${colors.border}`}
                              minH="45px"
                            >
                              {cellLessons.map((lesson, lIdx) => {
                                const sc = lesson.studentCourse;
                                const statusInfo =
                                  STATUS_COLORS[lesson.status] ||
                                  STATUS_COLORS.completed;
                                return (
                                  <Box
                                    key={lesson._id || lIdx}
                                    p="1.5"
                                    borderRadius="md"
                                    bg={statusInfo.bg}
                                    cursor="pointer"
                                    onClick={() => openEditModal(lesson, sc)}
                                    mb={
                                      lIdx < cellLessons.length - 1 ? '1' : '0'
                                    }
                                    _hover={{
                                      opacity: 0.8,
                                      transform: 'scale(1.02)',
                                      boxShadow: 'sm',
                                    }}
                                    transition="all 0.15s"
                                  >
                                    <Text
                                      fontSize="xs"
                                      fontWeight="bold"
                                      color={
                                        lesson.status === 'test'
                                          ? 'purple.700'
                                          : statusInfo.color
                                      }
                                      lineHeight="1.2"
                                      noOfLines={1}
                                    >
                                      {lesson.status === 'test'
                                        ? lesson.testCustomerName || 'Test'
                                        : sc?.studentName || 'N/A'}
                                    </Text>
                                    {lesson.status === 'test' && (
                                      <Badge
                                        colorScheme="purple"
                                        fontSize="8px"
                                        borderRadius="full"
                                        px="1.5"
                                        py="0"
                                        mt="0.5"
                                      >
                                        TEST
                                      </Badge>
                                    )}
                                    <Flex align="center" gap="1" mt="0.5">
                                      {lesson.status !== 'test' && (
                                        <Text fontSize="10px" color="gray.500">
                                          {lesson.lessonNumber}/
                                          {sc?.totalLessons || '-'}
                                        </Text>
                                      )}
                                      {lesson.status === 'completed' ? (
                                        <CheckCircle
                                          size="12"
                                          color="#38A169"
                                        />
                                      ) : lesson.status === 'no_show' ? (
                                        <XCircle size="12" color="#E53E3E" />
                                      ) : lesson.status ===
                                        'test' ? null : lesson.status ===
                                        'booked' ? (
                                        <Clock size="12" color="#3182CE" />
                                      ) : lesson.status === 'cancelled' ? (
                                        <AlertCircle
                                          size="12"
                                          color="#A0AEC0"
                                        />
                                      ) : (
                                        <AlertCircle
                                          size="14"
                                          color="#ED8936"
                                        />
                                      )}
                                    </Flex>
                                  </Box>
                                );
                              })}
                            </Td>
                          );
                        })}
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      )}

      {/* ===== MONTHLY VIEW (Calendar) ===== */}
      {viewMode === 'monthly' && (
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing="6">
          {/* Calendar Grid */}
          <Box gridColumn={{ lg: 'span 2' }}>
            <Box
              bg="white"
              p={{ base: '2', md: '5' }}
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <Heading size="md" mb="4" color="gray.800">
                📅 ปฏิทินเดือน {THAI_MONTHS[dateObj.getMonth()]}{' '}
                {dateObj.getFullYear()}
              </Heading>

              {loading ? (
                <Center py="20">
                  <Spinner size="xl" color="brand.500" />
                </Center>
              ) : (
                <>
                  {/* Day Headers */}
                  <SimpleGrid columns={7} spacing="1" mb="2">
                    {SHORT_DAYS.map((d, i) => (
                      <Box
                        key={d}
                        textAlign="center"
                        py="2"
                        fontSize="xs"
                        fontWeight="bold"
                        color={
                          i === 0
                            ? 'red.500'
                            : i === 6
                              ? 'purple.500'
                              : 'gray.500'
                        }
                      >
                        {d}
                      </Box>
                    ))}
                  </SimpleGrid>

                  {/* Calendar Cells */}
                  <SimpleGrid columns={7} spacing="1">
                    {calendarDays.map((day, idx) => {
                      if (day === null) return <Box key={`empty-${idx}`} />;

                      const dayLessons = lessonsByDay[day] || [];
                      const isToday =
                        day === today.getDate() &&
                        dateObj.getMonth() === today.getMonth() &&
                        dateObj.getFullYear() === today.getFullYear();

                      return (
                        <Box
                          key={day}
                          p={{ base: '1', md: '2' }}
                          borderRadius="lg"
                          bg={isToday ? 'blue.50' : 'gray.50'}
                          borderWidth={isToday ? '2px' : '1px'}
                          borderColor={isToday ? 'blue.400' : 'gray.100'}
                          minH={{ base: '50px', md: '65px' }}
                          cursor="pointer"
                          _hover={{ bg: 'blue.50', borderColor: 'blue.300' }}
                          transition="all 0.15s"
                          onClick={() => {
                            const clickDate = fmtDate(
                              new Date(
                                dateObj.getFullYear(),
                                dateObj.getMonth(),
                                day,
                              ),
                            );
                            setSelectedDate(clickDate);
                            setViewMode('daily');
                          }}
                        >
                          <Text
                            fontSize="sm"
                            fontWeight={isToday ? 'bold' : 'medium'}
                            color={isToday ? 'blue.600' : 'gray.700'}
                          >
                            {day}
                          </Text>
                          {dayLessons.filter((l) => l.status !== 'legacy')
                            .length > 0 && (
                            <Badge
                              bg={'#021841'}
                              color={'white'}
                              variant="subtle"
                              fontSize={{ base: '9px', md: '10px' }}
                              borderRadius="full"
                              mt="1"
                              px={{ base: '1', md: '2' }}
                              width="fit-content"
                              maxW="100%"
                              overflow="hidden"
                              textOverflow="ellipsis"
                            >
                              {
                                dayLessons.filter((l) => l.status !== 'legacy')
                                  .length
                              }
                              <Text
                                as="span"
                                display={{ base: 'none', md: 'inline' }}
                                ml={0.5}
                              >
                                รายการ
                              </Text>
                            </Badge>
                          )}
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                </>
              )}
            </Box>
          </Box>

          {/* Right Column: Coach Summary */}
          <Box>
            <Box
              bg="white"
              p="5"
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <Flex align="center" gap="2" mb="4">
                <Heading size="sm" color="gray.800">
                  TOTAL LESSON
                </Heading>
                <Badge
                  bg={'#021841'}
                  color="white"
                  borderRadius="full"
                  px="2"
                  ml={2}
                  fontSize="xs"
                >
                  {(scheduleData?.lessons || []).filter(
                    (l) => l.status !== 'legacy',
                  ).length || 0}
                </Badge>
              </Flex>

              {loading ? (
                <Center py="10">
                  <Spinner size="md" color="brand.500" />
                </Center>
              ) : monthlyData.summary?.coachStats?.length === 0 ? (
                <Text fontSize="sm" color="gray.400" textAlign="center" py="4">
                  ยังไม่มีข้อมูล
                </Text>
              ) : (
                <VStack spacing="3" align="stretch">
                  {(monthlyData.summary?.coachStats || []).map((stat, idx) => (
                    <Box
                      key={stat.coach._id}
                      p="3"
                      bg="gray.50"
                      borderRadius="lg"
                      borderLeft="3px solid"
                      borderLeftColor={idx === 0 ? '#021841' : '#021841'}
                    >
                      <Flex justify="space-between" align="center">
                        <Flex align="center" gap="2">
                          <Avatar
                            size="xs"
                            name={`${stat.coach.firstNameTh} ${stat.coach.lastNameTh}`}
                            bg={idx === 0 ? '#021841' : '#021841'}
                            color={idx === 0 ? 'white' : 'white'}
                          />
                          <Box>
                            <Text
                              fontSize="sm"
                              fontWeight="bold"
                              color="gray.800"
                            >
                              {stat.coach.firstNameTh}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              {stat.coach.nickname || ''}
                            </Text>
                          </Box>
                        </Flex>
                        <Box textAlign="right">
                          <Text
                            fontSize="lg"
                            fontWeight="black"
                            color="brand.600"
                          >
                            {stat.total}
                          </Text>
                          <Text fontSize="9px" color="gray.400">
                            ครั้ง
                          </Text>
                        </Box>
                      </Flex>
                      <HStack mt="2" spacing="2">
                        <Badge
                          colorScheme="green"
                          variant="outline"
                          display="flex"
                          alignItems="center"
                          gap="1"
                          fontSize="10px"
                        >
                          <CheckCircle size="10" /> {stat.completed}
                        </Badge>
                        {stat.no_show > 0 && (
                          <Badge
                            colorScheme="red"
                            variant="outline"
                            display="flex"
                            alignItems="center"
                            gap="1"
                            fontSize="10px"
                          >
                            <XCircle size="10" /> {stat.no_show}
                          </Badge>
                        )}
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          </Box>
        </SimpleGrid>
      )}

      {/* Add Lesson Modal */}
      <Modal
        title="เพิ่มนัดหมายเรียน"
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="บันทึก"
        okButtonProps={{
          style: { backgroundColor: '#021841', borderColor: '#021841' },
        }}
        cancelText="ยกเลิก"
        width={800}
        destroyOnClose
        footer={customerType ? undefined : null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddSubmit}
          style={{ marginTop: 20 }}
        >
          {/* Dropdown เลือกประเภทลูกค้า */}
          <Form.Item label="ประเภทลูกค้า" style={{ marginBottom: 16 }}>
            <AntSelect
              value={customerType}
              onChange={(val) => {
                setCustomerType(val);
                form.resetFields();
                form.setFieldsValue({
                  branchId: selectedBranch || undefined,
                  status: 'active',
                });
              }}
              placeholder="-- เลือกประเภทลูกค้า --"
              options={[
                { label: 'ลูกค้าทดลองเรียน', value: 'test' },
                { label: 'ลูกค้าสมัครเรียนแล้ว', value: 'existing' },
                // { label: "🆕 ลูกค้าใหม่", value: "new" },
              ]}
            />
          </Form.Item>

          {/* ===== Form: ลูกค้าทดลองเรียน ===== */}
          {customerType === 'test' && (
            <>
              <Form.Item
                name="testCustomerName"
                label="ชื่อลูกค้าทดลอง"
                rules={[{ required: true, message: 'กรุณากรอกชื่อลูกค้า' }]}
              >
                <Input placeholder="กรอกชื่อลูกค้าที่มาทดลอง..." />
              </Form.Item>

              <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
                <Form.Item
                  name="referredBy"
                  label="พนักงานผู้แนะนำ"
                  style={{ flex: 1 }}
                >
                  <AntSelect
                    showSearch
                    allowClear
                    placeholder="เลือกพนักงานที่แนะนำลูกค้ามา..."
                    options={allEmployees.map((e) => ({
                      label: `${e.firstNameTh} ${e.lastNameTh} (${e.nickname || e.position || ''})`,
                      value: e._id,
                    }))}
                    filterOption={(input, option) =>
                      (option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Form.Item
                  name="company"
                  label="บริษัท (บังคับเลือก)"
                  style={{ flex: 1 }}
                  rules={[{ required: true, message: 'กรุณาเลือกบริษัท' }]}
                >
                  <AntSelect
                    placeholder="-- เลือกบริษัท --"
                    options={[
                      { label: 'บุญรอดกอล์ฟพัฒนา', value: 'บุญรอดกอล์ฟพัฒนา' },
                      {
                        label: 'บุญรอดกอล์ฟโทเทิล',
                        value: 'บุญรอดกอล์ฟโทเทิล',
                      },
                    ]}
                  />
                </Form.Item>
              </Flex>
            </>
          )}

          {/* ===== Form: ลูกค้าสมัครเรียนแล้ว ===== */}
          {customerType === 'existing' && (
            <>
              <Form.Item
                name="courseIds"
                label="ลูกค้า (เลือกได้หลายคน)"
                rules={[{ required: true, message: 'กรุณาเลือกลูกค้า' }]}
              >
                <AntSelect
                  mode="multiple"
                  showSearch
                  placeholder="พิมชื่อเพื่อค้นหาลูกค้า..."
                  options={activeCourses.map((c) => {
                    const branchNames = Array.isArray(c.branch)
                      ? c.branch
                          .map((b) => b?.name)
                          .filter(Boolean)
                          .join(', ')
                      : c.branch?.name || '';
                    return {
                      label: `${c.studentName}`,
                      value: c._id,
                      desc: `เหลือ ${Math.max(0, c.totalLessons - c.lessonsCompleted)}/${c.totalLessons} ครั้ง | คอม ${c.commissionRate}% | ${c.company || branchNames || '-'}`,
                    };
                  })}
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  optionRender={(option) => (
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.800">
                        {option.label}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {option.data.desc}
                      </Text>
                    </Box>
                  )}
                  onChange={(selectedIds) => {
                    if (selectedIds.length === 1) {
                      const course = activeCourses.find(
                        (c) => c._id === selectedIds[0],
                      );
                      if (course) {
                        const courseBranch = Array.isArray(course.branch)
                          ? course.branch[0]?._id || course.branch[0]
                          : course.branch?._id || course.branch;
                        form.setFieldsValue({
                          lessonCommissionRate: course.commissionRate,
                          lessonCompany: course.company || undefined,
                          branchId: courseBranch || undefined,
                        });
                      }
                    } else {
                      form.setFieldsValue({
                        lessonCommissionRate: undefined,
                        lessonCompany: undefined,
                      });
                    }
                  }}
                />
              </Form.Item>

              <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
                <Form.Item
                  name="lessonCommissionRate"
                  label="Commission Rate (ครั้งนี้)"
                  style={{ flex: 1 }}
                >
                  <AntSelect
                    allowClear
                    placeholder="ใช้ค่าตั้งต้นจากคอร์ส"
                    options={[
                      { label: '40%', value: 40 },
                      { label: '45%', value: 45 },
                      { label: '50%', value: 50 },
                      { label: '55%', value: 55 },
                      { label: '60%', value: 60 },
                      { label: '70%', value: 70 },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  name="lessonCompany"
                  label="บริษัท (ครั้งนี้)"
                  style={{ flex: 1 }}
                >
                  <AntSelect
                    allowClear
                    placeholder="ใช้ค่าตั้งต้นจากคอร์ส"
                    options={[
                      { label: 'บุญรอดกอล์ฟพัฒนา', value: 'บุญรอดกอล์ฟพัฒนา' },
                      {
                        label: 'บุญรอดกอล์ฟโทเทิล',
                        value: 'บุญรอดกอล์ฟโทเทิล',
                      },
                    ]}
                  />
                </Form.Item>
              </Flex>
            </>
          )}

          {/* ===== Form: ลูกค้าใหม่ ===== */}
          {customerType === 'new' && (
            <>
              <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
                <Form.Item
                  name="newStudentName"
                  label="ชื่อลูกค้า"
                  rules={[{ required: true, message: 'กรุณากรอกชื่อลูกค้า' }]}
                  style={{ flex: 1 }}
                >
                  <Input placeholder="เช่น นายเอ" />
                </Form.Item>
              </Flex>

              <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
                <Form.Item
                  name="packagePrice"
                  label="ราคาคอร์ส (บาท)"
                  rules={[{ required: true, message: 'กรุณากรอกราคา' }]}
                  style={{ flex: 1 }}
                >
                  <Input type="number" placeholder="30000" />
                </Form.Item>
                <Form.Item
                  name="totalLessons"
                  label="จำนวนครั้ง"
                  rules={[{ required: true, message: 'กรุณากรอกจำนวน' }]}
                  style={{ flex: 1 }}
                >
                  <Input type="number" placeholder="25" />
                </Form.Item>
              </Flex>

              <Form.Item
                name="commissionRate"
                label="Commission Rate"
                initialValue={40}
              >
                <AntSelect
                  options={[
                    { label: '40%', value: 40 },
                    { label: '45%', value: 45 },
                    { label: '50%', value: 50 },
                    { label: '55%', value: 55 },
                    { label: '60%', value: 60 },
                    { label: '70%', value: 70 },
                  ]}
                />
              </Form.Item>
            </>
          )}

          {/* ===== Common fields (show only when type is selected) ===== */}
          {customerType && (
            <>
              <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
                <Form.Item
                  name="branchId"
                  label="สาขา"
                  rules={[{ required: true, message: 'กรุณาเลือกสาขา' }]}
                  initialValue={selectedBranch || undefined}
                  style={{ flex: 1 }}
                >
                  <AntSelect
                    options={branches.map((b) => ({
                      label: b.name,
                      value: b._id,
                    }))}
                    placeholder="เลือกสาขา"
                    onChange={(val) => {
                      const selectedBr = branches.find((b) => b._id === val);
                      const branchCode = selectedBr?.code || '';
                      if (branchCode === 'teeoff') {
                        form.setFieldsValue({ company: 'บุญรอดกอล์ฟพัฒนา' });
                      } else if (
                        branchCode === 'srinakarin' ||
                        branchCode === 'suwannaphum'
                      ) {
                        form.setFieldsValue({ company: 'บุญรอดกอล์ฟโทเทิล' });
                      } else if (branchCode === 'ratchada') {
                        form.setFieldsValue({ company: undefined });
                      } else {
                        form.setFieldsValue({ company: undefined });
                      }
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="coachId"
                  label="โค้ชผู้สอน"
                  rules={[{ required: true, message: 'กรุณาเลือกโค้ช' }]}
                  style={{ flex: 1 }}
                >
                  <AntSelect
                    placeholder="เลือกโค้ช"
                    options={coachesList.map((c) => ({
                      label: `${c.firstNameTh} (${c.nickname || ''})`,
                      value: c._id,
                    }))}
                  />
                </Form.Item>
              </Flex>

              {customerType === 'new' && (
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, cur) => prev.branchId !== cur.branchId}
                >
                  {() => {
                    const branchId = form.getFieldValue('branchId');
                    const selectedBr = branches.find((b) => b._id === branchId);
                    const branchCode = selectedBr?.code || '';
                    const isRatchada = branchCode === 'ratchada';
                    const autoCompany = form.getFieldValue('company');
                    const showField = branchId && (isRatchada || autoCompany);

                    if (!showField) return null;

                    return (
                      <Form.Item name="company" label="บริษัท">
                        {isRatchada ? (
                          <AntSelect
                            placeholder="-- เลือกบริษัท --"
                            options={[
                              {
                                label: 'บุญรอดกอล์ฟพัฒนา',
                                value: 'บุญรอดกอล์ฟพัฒนา',
                              },
                              {
                                label: 'บุญรอดกอล์ฟโทเทิล',
                                value: 'บุญรอดกอล์ฟโทเทิล',
                              },
                            ]}
                          />
                        ) : (
                          <Input readOnly value={autoCompany} />
                        )}
                      </Form.Item>
                    );
                  }}
                </Form.Item>
              )}

              {customerType !== 'test' && (
                <Form.Item
                  name="status"
                  label="สถานะเริ่มต้น"
                  initialValue="active"
                >
                  <AntSelect
                    options={[
                      { label: 'รอคอนเฟิร์ม', value: 'active' },
                      { label: 'จองคลาส', value: 'booked' },
                      { label: 'มาเรียนแล้ว', value: 'completed' },
                      { label: 'ไม่มาเรียน (หักชั่วโมง)', value: 'no_show' },
                      { label: 'ยกเลิกคลาส', value: 'cancelled' },
                    ]}
                  />
                </Form.Item>
              )}

              <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
                <Form.Item
                  name="date"
                  label="วันที่เรียน"
                  rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}
                  style={{ flex: 1 }}
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>

                <Form.Item
                  name="time"
                  label="เวลา (น.)"
                  rules={[{ required: true, message: 'กรุณาเลือกเวลา' }]}
                  style={{ flex: 1 }}
                >
                  <AntSelect
                    placeholder="เลือกเวลา"
                    options={TIME_SLOTS.map((t) => ({ label: t, value: t }))}
                  />
                </Form.Item>
              </Flex>
            </>
          )}
        </Form>
      </Modal>

      {/* Edit Lesson Modal */}
      <Modal
        title="✏️ รายละเอียดการสอน"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingLesson(null);
        }}
        footer={
          JSON.parse(localStorage.getItem('user') || '{}').role === 'admin'
            ? undefined
            : [
                <Button key="close" onClick={() => setIsEditModalOpen(false)}>
                  ปิด
                </Button>,
              ]
        }
        onOk={() => editForm.submit()}
        okText="บันทึก"
        okButtonProps={{
          style: { backgroundColor: '#021841', borderColor: '#021841' },
        }}
        cancelText="ยกเลิก"
        destroyOnClose
      >
        {editingLesson?.lesson?.status !== 'test' && (
          <Box mb="4" p="3" bg="blue.50" borderRadius="md">
            <Text fontWeight="bold" color="blue.700">
              {editingLesson?.sc?.studentName}
            </Text>
            <Text fontSize="sm" color="blue.600">
              ครั้งที่ {editingLesson?.lesson?.lessonNumber} /{' '}
              {editingLesson?.sc?.totalLessons}
            </Text>
          </Box>
        )}
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          style={{ marginTop: 20 }}
        >
          <Form.Item name="status" label="สถานะ">
            <AntSelect
              disabled={
                JSON.parse(localStorage.getItem('user') || '{}').role !==
                'admin'
              }
              options={[
                { label: 'รอคอนเฟิร์ม', value: 'active' },
                { label: 'จองคลาส', value: 'booked' },
                { label: 'มาเรียนแล้ว', value: 'completed' },
                { label: 'ไม่มาเรียน (หักชั่วโมง)', value: 'no_show' },
                { label: 'ยกเลิกคลาส', value: 'cancelled' },
                { label: 'ทดลองเรียน (Test)', value: 'test' },
              ]}
            />
          </Form.Item>

          <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
            <Form.Item
              name="coachId"
              label="เปลี่ยนโค้ชผู้สอน"
              rules={[{ required: true, message: 'กรุณาเลือกโค้ช' }]}
              style={{ flex: 1 }}
            >
              <AntSelect
                placeholder="เลือกโค้ช"
                disabled={
                  JSON.parse(localStorage.getItem('user') || '{}').role !==
                  'admin'
                }
                options={coachesList.map((c) => ({
                  label: `${c.firstNameTh} (${c.nickname || ''})`,
                  value: c._id,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="branchId"
              label="สาขา"
              rules={[{ required: true, message: 'กรุณาเลือกสาขา' }]}
              style={{ flex: 1 }}
            >
              <AntSelect
                disabled={
                  JSON.parse(localStorage.getItem('user') || '{}').role !==
                  'admin'
                }
                options={branches.map((b) => ({
                  label: b.name,
                  value: b._id,
                }))}
                placeholder="เลือกสาขา"
              />
            </Form.Item>
          </Flex>

          <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
            {/* <Form.Item
              name="commissionRate"
              label="Commission Rate (ครั้งนี้)"
              style={{ flex: 1 }}
            >
              <AntSelect
                allowClear
                placeholder="-- เลือกเรท --"
                disabled={
                  JSON.parse(localStorage.getItem("user") || "{}").role !==
                  "admin"
                }
                options={[
                  { label: "40%", value: 40 },
                  { label: "45%", value: 45 },
                  { label: "50%", value: 50 },
                  { label: "55%", value: 55 },
                  { label: "60%", value: 60 },
                  { label: "70%", value: 70 },
                ]}
              />
            </Form.Item> */}
            <Form.Item
              name="company"
              label="บริษัท (ครั้งนี้)"
              style={{ flex: 1 }}
            >
              <AntSelect
                allowClear
                placeholder="-- เลือกบริษัท --"
                disabled={
                  JSON.parse(localStorage.getItem('user') || '{}').role !==
                  'admin'
                }
                options={[
                  { label: 'บุญรอดกอล์ฟพัฒนา', value: 'บุญรอดกอล์ฟพัฒนา' },
                  { label: 'บุญรอดกอล์ฟโทเทิล', value: 'บุญรอดกอล์ฟโทเทิล' },
                ]}
              />
            </Form.Item>
          </Flex>

          <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
            <Form.Item
              name="date"
              label="วันที่เรียน"
              rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}
              style={{ flex: 1 }}
            >
              <DatePicker
                disabled={
                  JSON.parse(localStorage.getItem('user') || '{}').role !==
                  'admin'
                }
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Form.Item>

            <Form.Item
              name="time"
              label="เวลา (น.)"
              rules={[{ required: true, message: 'กรุณาเลือกเวลา' }]}
              style={{ flex: 1 }}
            >
              <AntSelect
                placeholder="เลือกเวลา"
                disabled={
                  JSON.parse(localStorage.getItem('user') || '{}').role !==
                  'admin'
                }
                options={TIME_SLOTS.map((t) => ({ label: t, value: t }))}
              />
            </Form.Item>
          </Flex>
        </Form>
      </Modal>
      {isSaving && <Spinload />}
    </Box>
  );
};

export default Schedule;
