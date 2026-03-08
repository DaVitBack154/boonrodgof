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
  Button,
  HStack,
  Avatar,
  SimpleGrid,
  Select,
  Input,
  useToast,
  Spinner,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Divider,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import {
  Plus,
  ChevronLeft,
  Eye,
  Trash2,
  Calendar,
  User,
  BookOpen,
  Save,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  getStudentCourses,
  getStudentCourse,
  createStudentCourse,
  updateStudentCourse,
  deleteStudentCourse,
  addLesson,
  deleteLesson,
  getEmployees,
  getBranches,
} from "../services/api";

const fmt = (n) =>
  (n || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const COMMISSION_RATES = [40, 45, 50, 55, 60, 70];

// ===== Course Detail View =====
const CourseDetailView = ({ courseId, onBack }) => {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newLesson, setNewLesson] = useState({
    coach: "",
    lessonDate: "",
    lessonNumber: 1,
    status: "completed",
  });
  const toast = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseData, empData] = await Promise.all([
        getStudentCourse(courseId),
        getEmployees(),
      ]);
      setCourse(courseData.course);
      setLessons(courseData.lessons);
      setCoaches(empData.filter((e) => e.status === "active"));
      // Set next lesson number
      const maxLesson =
        courseData.lessons.length > 0
          ? Math.max(...courseData.lessons.map((l) => l.lessonNumber))
          : 0;
      setNewLesson((prev) => ({ ...prev, lessonNumber: maxLesson + 1 }));
    } catch (err) {
      toast({ title: "โหลดข้อมูลล้มเหลว", status: "error", duration: 2000 });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const handleAddLesson = async () => {
    if (!newLesson.coach || !newLesson.lessonDate) {
      toast({
        title: "กรุณาเลือกเทรนเนอร์และวันที่",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    try {
      await addLesson(courseId, newLesson);
      toast({
        title: "เพิ่มบันทึกการเรียนเรียบร้อย",
        status: "success",
        duration: 2000,
      });
      onClose();
      fetchData();
    } catch (err) {
      toast({
        title: "เพิ่มไม่สำเร็จ",
        description: err.response?.data?.error || err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      await deleteLesson(courseId, lessonId);
      toast({ title: "ลบเรียบร้อย", status: "success", duration: 1500 });
      fetchData();
    } catch (err) {
      toast({ title: "ลบไม่สำเร็จ", status: "error", duration: 2000 });
    }
  };

  if (loading)
    return (
      <Center py="20">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  if (!course) return null;

  const progressPercent = Math.round(
    (course.lessonsCompleted / course.totalLessons) * 100,
  );

  return (
    <Box>
      <Button
        variant="ghost"
        mb="4"
        onClick={onBack}
        leftIcon={<ChevronLeft size="16" />}
        bg={"#021841"}
        _hover={{ bg: "#021841" }}
        color="#FFF"
      >
        กลับไปรายการคอร์ส
      </Button>

      {/* Course Header */}
      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        mb="6"
        overflow="hidden"
      >
        <Box bg="brand.900" p="6" color="white">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
            <Box>
              <Heading size="md">{course.studentName}</Heading>
              <Text fontSize="sm" color="whiteAlpha.700" mt="1">
                ราคาคอร์ส: ฿{fmt(course.packagePrice)} | {course.totalLessons}{" "}
                ครั้ง | Commission {course.commissionRate}%
              </Text>
            </Box>
            <Badge
              colorScheme={
                course.status === "active"
                  ? "green"
                  : course.status === "completed"
                    ? "blue"
                    : "red"
              }
              variant="solid"
              borderRadius="full"
              px="4"
              py="1"
              fontSize="sm"
            >
              {course.status === "active"
                ? "กำลังเรียน"
                : course.status === "completed"
                  ? "เรียนครบ"
                  : "หมดอายุ"}
            </Badge>
          </Flex>
        </Box>

        <SimpleGrid columns={{ base: 2, md: 5 }} spacing="4" p="6">
          <Box textAlign="center" p="3" bg="blue.50" borderRadius="xl">
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              {course.totalLessons}
            </Text>
            <Text fontSize="xs" color="gray.500">
              จำนวนครั้งที่ซื้อ
            </Text>
          </Box>
          <Box textAlign="center" p="3" bg="green.50" borderRadius="xl">
            <Text fontSize="2xl" fontWeight="bold" color="green.600">
              {course.lessonsCompleted}
            </Text>
            <Text fontSize="xs" color="gray.500">
              เรียนแล้ว
            </Text>
          </Box>
          <Box textAlign="center" p="3" bg="orange.50" borderRadius="xl">
            <Text fontSize="2xl" fontWeight="bold" color="orange.500">
              {course.lessonsRemaining}
            </Text>
            <Text fontSize="xs" color="gray.500">
              คงเหลือ
            </Text>
          </Box>
          <Box textAlign="center" p="3" bg="purple.50" borderRadius="xl">
            <Text fontSize="2xl" fontWeight="bold" color="purple.600">
              ฿{fmt(course.perLessonRate)}
            </Text>
            <Text fontSize="xs" color="gray.500">
              ราคา/ครั้ง
            </Text>
          </Box>
          <Box textAlign="center" p="3" bg="brand.50" borderRadius="xl">
            <Text fontSize="2xl" fontWeight="bold" color="brand.700">
              ฿{fmt(course.commissionPerLesson)}
            </Text>
            <Text fontSize="xs" color="gray.500">
              คอม/ครั้ง ({course.commissionRate}%)
            </Text>
          </Box>
        </SimpleGrid>

        {/* Progress Bar */}
        <Box px="6" pb="6">
          <Flex justify="space-between" mb="1">
            <Text fontSize="xs" color="gray.500">
              ความคืบหน้า
            </Text>
            <Text fontSize="xs" color="gray.500">
              {progressPercent}%
            </Text>
          </Flex>
          <Box bg="gray.100" borderRadius="full" h="8px" overflow="hidden">
            <Box
              bg={progressPercent >= 100 ? "green.400" : "brand.500"}
              h="full"
              w={`${Math.min(100, progressPercent)}%`}
              borderRadius="full"
              transition="width 0.5s"
            />
          </Box>
        </Box>
      </Box>

      {/* Lesson Records */}
      <Flex justify="space-between" align="center" mb="4">
        <Heading size="sm" color="gray.700">
          📋 บันทึกการเรียน
        </Heading>
        <Button
          size="sm"
          bg={"#021841"}
          color="white"
          _hover={{ bg: "#021841" }}
          borderRadius="lg"
          leftIcon={<Plus size="14" />}
          onClick={onOpen}
        >
          เพิ่มบันทึกเรียน
        </Button>
      </Flex>

      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        overflow="hidden"
      >
        {lessons.length === 0 ? (
          <Center py="10">
            <Text color="gray.400">ยังไม่มีบันทึกการเรียน</Text>
          </Center>
        ) : (
          <Table variant="simple" size="md">
            <Thead bg="gray.50">
              <Tr>
                <Th
                  py="3"
                  fontSize="xs"
                  fontWeight="bold"
                  color="gray.500"
                  w="80px"
                >
                  ครั้งที่
                </Th>
                <Th py="3" fontSize="xs" fontWeight="bold" color="gray.500">
                  วันที่เรียน
                </Th>
                <Th py="3" fontSize="xs" fontWeight="bold" color="gray.500">
                  เทรนเนอร์
                </Th>
                <Th
                  py="3"
                  fontSize="xs"
                  fontWeight="bold"
                  color="gray.500"
                  isNumeric
                >
                  คอมมิชชั่น
                </Th>
                <Th
                  py="3"
                  fontSize="xs"
                  fontWeight="bold"
                  color="gray.500"
                  textAlign="center"
                >
                  สถานะ
                </Th>
                <Th py="3" w="50px"></Th>
              </Tr>
            </Thead>
            <Tbody>
              {lessons.map((lesson) => (
                <Tr key={lesson._id} _hover={{ bg: "blue.50" }}>
                  <Td py="3" fontWeight="bold" color="brand.600" fontSize="sm">
                    #{lesson.lessonNumber}
                  </Td>
                  <Td py="3" fontSize="sm" color="gray.700">
                    <Flex align="center" gap="2">
                      <Calendar size="14" color="#718096" />
                      {new Date(lesson.lessonDate).toLocaleDateString("th-TH", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      <Text color="gray.400" fontSize="xs">
                        {new Date(lesson.lessonDate).toLocaleTimeString(
                          "th-TH",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </Text>
                    </Flex>
                  </Td>
                  <Td py="3">
                    <Flex align="center" gap="2">
                      <Avatar
                        size="xs"
                        name={
                          lesson.coach
                            ? `${lesson.coach.firstNameTh} ${lesson.coach.lastNameTh}`
                            : ""
                        }
                        bg="brand.100"
                        color="brand.700"
                      />
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.800"
                        >
                          {lesson.coach?.firstNameTh} {lesson.coach?.lastNameTh}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {lesson.coach?.nickname &&
                            `(${lesson.coach.nickname})`}
                        </Text>
                      </Box>
                    </Flex>
                  </Td>
                  <Td
                    py="3"
                    isNumeric
                    fontWeight="bold"
                    color="green.600"
                    fontSize="sm"
                  >
                    ฿{fmt(course.commissionPerLesson)}
                  </Td>
                  <Td py="3" textAlign="center">
                    <Badge
                      colorScheme={
                        lesson.status === "completed"
                          ? "green"
                          : lesson.status === "no_show"
                            ? "red"
                            : "gray"
                      }
                      variant="subtle"
                      borderRadius="full"
                      px="2"
                      fontSize="xs"
                    >
                      {lesson.status === "completed"
                        ? "เรียนแล้ว"
                        : lesson.status === "no_show"
                          ? "ไม่มา"
                          : "ยกเลิก"}
                    </Badge>
                  </Td>
                  <Td py="3">
                    <IconButton
                      icon={<Trash2 size="12" />}
                      size="xs"
                      variant="ghost"
                      color="red.400"
                      onClick={() => handleDeleteLesson(lesson._id)}
                      aria-label="ลบ"
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Add Lesson Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>เพิ่มบันทึกการเรียน</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="6">
            <SimpleGrid columns={2} spacing="4" mb="4">
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                  ครั้งที่
                </FormLabel>
                <Input
                  type="number"
                  bg="gray.50"
                  border="none"
                  borderRadius="lg"
                  value={newLesson.lessonNumber}
                  onChange={(e) =>
                    setNewLesson((p) => ({
                      ...p,
                      lessonNumber: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                  สถานะ
                </FormLabel>
                <Select
                  bg="gray.50"
                  border="none"
                  borderRadius="lg"
                  value={newLesson.status}
                  onChange={(e) =>
                    setNewLesson((p) => ({ ...p, status: e.target.value }))
                  }
                >
                  <option value="completed">เรียนแล้ว</option>
                  <option value="no_show">ไม่มา</option>
                  <option value="cancelled">ยกเลิก</option>
                </Select>
              </FormControl>
            </SimpleGrid>
            <FormControl mb="4">
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                วันที่เรียน
              </FormLabel>
              <Input
                type="datetime-local"
                bg="gray.50"
                border="none"
                borderRadius="lg"
                value={newLesson.lessonDate}
                onChange={(e) =>
                  setNewLesson((p) => ({ ...p, lessonDate: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                เทรนเนอร์
              </FormLabel>
              <Select
                bg="gray.50"
                border="none"
                borderRadius="lg"
                value={newLesson.coach}
                onChange={(e) =>
                  setNewLesson((p) => ({ ...p, coach: e.target.value }))
                }
              >
                <option value="">-- เลือกเทรนเนอร์ --</option>
                {coaches.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.firstNameTh} {c.lastNameTh} ({c.nickname || c.position})
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr="3" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button
              bg={"#021841"}
              color="white"
              _hover={{ bg: "#021841" }}
              onClick={handleAddLesson}
            >
              เพิ่ม
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// ===== Main Student Courses Page =====
const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [filterBranch, setFilterBranch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newCourse, setNewCourse] = useState({
    studentName: "",
    packagePrice: "",
    totalLessons: "",
    commissionRate: 40,
    branch: "",
    company: "",
  });
  const toast = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterBranch) params.branch = filterBranch;
      const [coursesData, branchesData] = await Promise.all([
        getStudentCourses(params),
        getBranches(),
      ]);
      setCourses(coursesData);
      setBranches(branchesData);
    } catch (err) {
      toast({ title: "โหลดข้อมูลล้มเหลว", status: "error", duration: 2000 });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filterBranch]);

  const handleAddCourse = async () => {
    if (
      !newCourse.studentName ||
      !newCourse.packagePrice ||
      !newCourse.totalLessons
    ) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    try {
      await createStudentCourse({
        ...newCourse,
        packagePrice: Number(newCourse.packagePrice),
        totalLessons: Number(newCourse.totalLessons),
      });
      toast({
        title: "เพิ่มคอร์สเรียบร้อย",
        status: "success",
        duration: 2000,
      });
      onClose();
      setNewCourse({
        studentName: "",
        packagePrice: "",
        totalLessons: "",
        commissionRate: 40,
        branch: "",
        company: "",
      });
      fetchData();
    } catch (err) {
      toast({
        title: "เพิ่มไม่สำเร็จ",
        description: err.response?.data?.error || err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteStudentCourse(id);
      toast({ title: "ลบเรียบร้อย", status: "success", duration: 1500 });
      fetchData();
    } catch (err) {
      toast({ title: "ลบไม่สำเร็จ", status: "error", duration: 2000 });
    }
  };

  if (selectedCourseId) {
    return (
      <CourseDetailView
        courseId={selectedCourseId}
        onBack={() => {
          setSelectedCourseId(null);
          fetchData();
        }}
      />
    );
  }

  return (
    <Box>
      <Flex
        justifyContent="space-between"
        alignItems="flex-start"
        mb="6"
        flexWrap="wrap"
        gap="4"
      >
        <Box>
          <Heading size="lg" color="gray.800" mb="1" fontWeight="bold">
            คอร์สลูกค้า / คอมมิชชั่น
          </Heading>
          <Text color="gray.500" fontSize="sm">
            จัดการคอร์สเรียนลูกค้า บันทึกการเรียน คำนวณค่าคอมมิชชั่นเทรนเนอร์
          </Text>
        </Box>
        <Button
          leftIcon={<Plus size="18" />}
          bg="#021841"
          color="white"
          _hover={{ bg: "#021841" }}
          borderRadius="lg"
          px="6"
          boxShadow="sm"
          onClick={onOpen}
        >
          เพิ่มคอร์สใหม่
        </Button>
      </Flex>

      {/* Filter */}
      <Box
        bg="white"
        p="4"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        mb="6"
      >
        <Flex gap="4" flexWrap="wrap" alignItems="flex-end">
          <Box>
            <Text fontSize="xs" fontWeight="bold" color="gray.500" mb="1">
              สาขา
            </Text>
            <Select
              bg="gray.50"
              border="none"
              size="sm"
              borderRadius="lg"
              w="220px"
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
            >
              <option value="">ทุกสาขา</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </Box>
          <Text fontSize="sm" color="gray.400">
            {courses.length} คอร์ส | Active{" "}
            {courses.filter((c) => c.status === "active").length}
          </Text>
        </Flex>
      </Box>

      {/* Course Table (Excel-style) */}
      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        overflow="hidden"
      >
        {loading ? (
          <Center py="20">
            <Spinner size="xl" color="brand.500" />
          </Center>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="md">
              <Thead bg="gray.50">
                <Tr>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" w="50px">
                    No.
                  </Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold">
                    Name
                  </Th>
                  <Th
                    color="gray.500"
                    fontSize="xs"
                    fontWeight="bold"
                    isNumeric
                  >
                    Price
                  </Th>
                  <Th
                    color="gray.500"
                    fontSize="xs"
                    fontWeight="bold"
                    isNumeric
                  >
                    จำนวนครั้ง
                  </Th>
                  <Th
                    color="gray.500"
                    fontSize="xs"
                    fontWeight="bold"
                    isNumeric
                  >
                    Vat 7%
                  </Th>
                  <Th
                    color="gray.500"
                    fontSize="xs"
                    fontWeight="bold"
                    isNumeric
                  >
                    Price/Course
                  </Th>
                  <Th
                    fontSize="xs"
                    fontWeight="bold"
                    isNumeric
                    color="brand.600"
                  >
                    Commission
                  </Th>
                  <Th
                    fontSize="xs"
                    fontWeight="bold"
                    isNumeric
                    color="green.600"
                  >
                    Com/Course
                  </Th>
                  <Th
                    fontSize="xs"
                    fontWeight="bold"
                    isNumeric
                    color="blue.600"
                  >
                    จำนวนเรียน
                  </Th>
                  <Th fontSize="xs" fontWeight="bold" textAlign="center">
                    สถานะ
                  </Th>
                  <Th w="80px"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {courses.map((c, i) => (
                  <Tr
                    key={c._id}
                    _hover={{ bg: "blue.50", cursor: "pointer" }}
                    transition="background 0.15s"
                    bg={
                      c.status === "completed"
                        ? "green.50"
                        : c.status === "expired" || c.status === "cancelled"
                          ? "red.50"
                          : undefined
                    }
                  >
                    <Td
                      fontSize="sm"
                      color="gray.500"
                      fontWeight="bold"
                      onClick={() => setSelectedCourseId(c._id)}
                    >
                      {i + 1}
                    </Td>
                    <Td py="3" onClick={() => setSelectedCourseId(c._id)}>
                      <Text fontWeight="bold" fontSize="sm" color="gray.800">
                        {c.studentName}
                      </Text>
                    </Td>
                    <Td
                      py="3"
                      isNumeric
                      fontSize="sm"
                      color="gray.700"
                      onClick={() => setSelectedCourseId(c._id)}
                    >
                      {fmt(c.packagePrice)}
                    </Td>
                    <Td
                      py="3"
                      isNumeric
                      fontSize="sm"
                      color="gray.700"
                      fontWeight="medium"
                      onClick={() => setSelectedCourseId(c._id)}
                    >
                      {c.totalLessons}
                    </Td>
                    <Td
                      py="3"
                      isNumeric
                      fontSize="sm"
                      color="gray.600"
                      onClick={() => setSelectedCourseId(c._id)}
                    >
                      {fmt(c.priceAfterDeduct)}
                    </Td>
                    <Td
                      py="3"
                      isNumeric
                      fontSize="sm"
                      color="purple.600"
                      fontWeight="bold"
                      onClick={() => setSelectedCourseId(c._id)}
                    >
                      {fmt(c.perLessonRate)}
                    </Td>
                    <Td
                      py="3"
                      isNumeric
                      onClick={() => setSelectedCourseId(c._id)}
                    >
                      <Badge
                        colorScheme="brand"
                        variant="subtle"
                        borderRadius="full"
                        px="2"
                        fontSize="xs"
                      >
                        {c.commissionRate}%
                      </Badge>
                    </Td>
                    <Td
                      py="3"
                      isNumeric
                      fontWeight="bold"
                      color="green.600"
                      fontSize="sm"
                      onClick={() => setSelectedCourseId(c._id)}
                    >
                      {fmt(c.commissionPerLesson)}
                    </Td>
                    <Td
                      py="3"
                      isNumeric
                      onClick={() => setSelectedCourseId(c._id)}
                    >
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={
                          c.lessonsCompleted >= c.totalLessons
                            ? "green.600"
                            : "blue.600"
                        }
                      >
                        {c.lessonsCompleted}/{c.totalLessons}
                      </Text>
                    </Td>
                    <Td
                      py="3"
                      textAlign="center"
                      onClick={() => setSelectedCourseId(c._id)}
                    >
                      <Badge
                        colorScheme={
                          c.status === "active"
                            ? "#2f5855"
                            : c.status === "completed"
                              ? "#2f5855"
                              : "#2f5855"
                        }
                        variant="subtle"
                        borderRadius="full"
                        px="2"
                        fontSize="xs"
                      >
                        {c.status === "active"
                          ? "Active"
                          : c.status === "completed"
                            ? "เรียนครบ"
                            : "หมดอายุ"}
                      </Badge>
                    </Td>
                    <Td py="3">
                      <HStack spacing="1">
                        <IconButton
                          icon={<Eye size="14" />}
                          size="xs"
                          variant="ghost"
                          color="#FFF"
                          onClick={() => setSelectedCourseId(c._id)}
                          aria-label="ดู"
                          bg={"#021841"}
                        />
                        <IconButton
                          icon={<Trash2 size="14" />}
                          size="xs"
                          variant="ghost"
                          color="#FFF"
                          onClick={() => handleDelete(c._id)}
                          aria-label="ลบ"
                          bg={"red"}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {courses.length === 0 && (
              <Center py="10">
                <Text color="gray.400">ยังไม่มีคอร์ส</Text>
              </Center>
            )}
          </Box>
        )}
      </Box>

      {/* Add Course Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>เพิ่มคอร์สลูกค้าใหม่</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="6">
            <SimpleGrid columns={2} spacing="4">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                  ชื่อลูกค้า
                </FormLabel>
                <Input
                  bg="gray.50"
                  border="none"
                  borderRadius="lg"
                  value={newCourse.studentName}
                  onChange={(e) =>
                    setNewCourse((p) => ({ ...p, studentName: e.target.value }))
                  }
                  placeholder="เช่น นายเอ"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                  สาขา
                </FormLabel>
                <Select
                  bg="gray.50"
                  border="none"
                  borderRadius="lg"
                  value={newCourse.branch}
                  onChange={(e) => {
                    const branchId = e.target.value;
                    const selectedBranch = branches.find(
                      (b) => b._id === branchId,
                    );
                    const branchCode = selectedBranch?.code || "";

                    let autoCompany = "";
                    if (branchCode === "teeoff") {
                      autoCompany = "บริษัทพัฒนา";
                    } else if (
                      branchCode === "srinakarin" ||
                      branchCode === "suwannaphum"
                    ) {
                      autoCompany = "บริษัทTotal";
                    } else if (branchCode === "ratchada") {
                      autoCompany = ""; // let user choose
                    }

                    setNewCourse((p) => ({
                      ...p,
                      branch: branchId,
                      company: autoCompany,
                    }));
                  }}
                >
                  <option value="">-- เลือกสาขา --</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              {(() => {
                const selectedBranch = branches.find(
                  (b) => b._id === newCourse.branch,
                );
                const branchCode = selectedBranch?.code || "";
                const showCompanySelect = branchCode === "ratchada";
                const autoCompanyLabel = newCourse.company;

                if (showCompanySelect) {
                  return (
                    <FormControl>
                      <FormLabel
                        fontSize="sm"
                        fontWeight="semibold"
                        color="gray.600"
                      >
                        บริษัท
                      </FormLabel>
                      <Select
                        bg="gray.50"
                        border="none"
                        borderRadius="lg"
                        value={newCourse.company}
                        onChange={(e) =>
                          setNewCourse((p) => ({
                            ...p,
                            company: e.target.value,
                          }))
                        }
                      >
                        <option value="">-- เลือกบริษัท --</option>
                        <option value="บริษัทพัฒนา">บริษัทพัฒนา</option>
                        <option value="บริษัทTotal">บริษัทTotal</option>
                      </Select>
                    </FormControl>
                  );
                } else if (autoCompanyLabel) {
                  return (
                    <FormControl>
                      <FormLabel
                        fontSize="sm"
                        fontWeight="semibold"
                        color="gray.600"
                      >
                        บริษัท
                      </FormLabel>
                      <Input
                        bg="gray.100"
                        border="none"
                        borderRadius="lg"
                        value={autoCompanyLabel}
                        isReadOnly
                      />
                    </FormControl>
                  );
                }
                return null;
              })()}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                  ราคาคอร์ส (บาท)
                </FormLabel>
                <Input
                  bg="gray.50"
                  border="none"
                  borderRadius="lg"
                  type="number"
                  value={newCourse.packagePrice}
                  onChange={(e) =>
                    setNewCourse((p) => ({
                      ...p,
                      packagePrice: e.target.value,
                    }))
                  }
                  placeholder="30000"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                  จำนวนครั้ง
                </FormLabel>
                <Input
                  bg="gray.50"
                  border="none"
                  borderRadius="lg"
                  type="number"
                  value={newCourse.totalLessons}
                  onChange={(e) =>
                    setNewCourse((p) => ({
                      ...p,
                      totalLessons: e.target.value,
                    }))
                  }
                  placeholder="25"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                  Commission Rate
                </FormLabel>
                <Select
                  bg="gray.50"
                  border="none"
                  borderRadius="lg"
                  value={newCourse.commissionRate}
                  onChange={(e) =>
                    setNewCourse((p) => ({
                      ...p,
                      commissionRate: Number(e.target.value),
                    }))
                  }
                >
                  {COMMISSION_RATES.map((r) => (
                    <option key={r} value={r}>
                      {r}%
                    </option>
                  ))}
                </Select>
              </FormControl>
            </SimpleGrid>

            {/* Preview */}
            {newCourse.packagePrice && newCourse.totalLessons && (
              <Box
                mt="4"
                p="4"
                bg="brand.50"
                borderRadius="xl"
                borderLeft="4px solid"
                borderLeftColor="brand.400"
              >
                <Text fontSize="sm" fontWeight="bold" color="brand.700" mb="2">
                  ตัวอย่างการคำนวณ:
                </Text>
                <SimpleGrid
                  columns={3}
                  spacing="2"
                  fontSize="xs"
                  color="gray.600"
                >
                  <Text>
                    หัก 7%: <b>฿{fmt(Number(newCourse.packagePrice) * 0.93)}</b>
                  </Text>
                  <Text>
                    ราคา/ครั้ง:{" "}
                    <b>
                      ฿
                      {fmt(
                        (Number(newCourse.packagePrice) * 0.93) /
                          Number(newCourse.totalLessons),
                      )}
                    </b>
                  </Text>
                  <Text>
                    คอม/ครั้ง:{" "}
                    <b>
                      ฿
                      {fmt(
                        (((Number(newCourse.packagePrice) * 0.93) /
                          Number(newCourse.totalLessons)) *
                          newCourse.commissionRate) /
                          100,
                      )}
                    </b>
                  </Text>
                </SimpleGrid>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr="3" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button
              bg="#021841"
              color="white"
              _hover={{ bg: "#021841" }}
              onClick={handleAddCourse}
            >
              เพิ่มคอร์ส
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default StudentCourses;
