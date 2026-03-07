import {
  Box,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  Button,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Avatar,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Divider,
  Input,
  useToast,
  Spinner,
  Center,
  InputGroup,
  InputLeftAddon,
  Tooltip,
} from "@chakra-ui/react";
import {
  Calculator,
  Download,
  FileText,
  Printer,
  Eye,
  ChevronRight,
  Save,
  Search,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {
  getPayroll,
  calculatePayroll,
  updateDeductions,
  updateSalesBonus,
  getBranches,
  getCommissionDetails,
} from "../services/api";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

const fmt = (n) =>
  (n || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// ===== Detail Row =====
const DetailRow = ({ label, value, color = "gray.700", bold = false }) => (
  <Flex justify="space-between" align="center" py="2.5" px="1">
    <Text fontSize="sm" color="gray.600">
      {label}
    </Text>
    <Text fontSize="sm" fontWeight={bold ? "bold" : "semibold"} color={color}>
      {value}
    </Text>
  </Flex>
);

// ===== Commission Detail Modal =====
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

const CommissionDetailModal = ({
  isOpen,
  onClose,
  coachId,
  coachName,
  period,
}) => {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && coachId && period) {
      setLoading(true);
      getCommissionDetails(coachId, period)
        .then((data) => setDetails(data))
        .catch((err) =>
          console.error("Error fetching commission details:", err),
        )
        .finally(() => setLoading(false));
    } else {
      setDetails([]);
    }
  }, [isOpen, coachId, period]);

  const totalCom = details.reduce((sum, item) => {
    return sum + (item.studentCourse?.commissionPerLesson || 0);
  }, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalOverlay />
      <ModalContent borderRadius="2xl">
        <ModalHeader
          borderBottomWidth="1px"
          borderColor="gray.100"
          bg="gray.50"
          borderTopRadius="2xl"
        >
          <Text fontWeight="bold" color="gray.800">
            รายละเอียดค่าคอมมิชชั่น
          </Text>
          <Text fontSize="sm" color="gray.500" fontWeight="normal">
            โค้ช: {coachName}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p="6">
          {loading ? (
            <Center py="10">
              <Spinner color="brand.500" />
            </Center>
          ) : details.length === 0 ? (
            <Center py="10">
              <Text color="gray.500">ไม่มีข้อมูลการสอนในงวดนี้</Text>
            </Center>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>วันที่สอน</Th>
                    <Th>ลูกค้า</Th>
                    <Th isNumeric>ราคาคอร์ส</Th>
                    <Th isNumeric>จำนวนครั้ง</Th>
                    <Th isNumeric>ค่าคอม/ครั้ง</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {details.map((item, idx) => (
                    <Tr key={item._id} _hover={{ bg: "gray.50" }}>
                      <Td>{dayjs(item.lessonDate).format("DD MMM YYYY")}</Td>
                      <Td>{item.studentCourse?.studentName || "-"}</Td>
                      <Td isNumeric>{fmt(item.studentCourse?.packagePrice)}</Td>
                      <Td isNumeric>{item.studentCourse?.totalLessons}</Td>
                      <Td isNumeric fontWeight="bold" color="green.600">
                        {fmt(item.studentCourse?.commissionPerLesson)}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
                <Tfoot bg="green.50">
                  <Tr>
                    <Th colSpan={4} textAlign="right" py="3">
                      รวมค่าคอมมิชชั่น
                    </Th>
                    <Th
                      isNumeric
                      py="3"
                      color="green.700"
                      fontWeight="bold"
                      fontSize="md"
                    >
                      {fmt(totalCom)}
                    </Th>
                  </Tr>
                </Tfoot>
              </Table>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// ===== Detail Drawer =====
const PayrollDetailDrawer = ({ record, isOpen, onClose }) => {
  if (!record || !record.employee) return null;
  const emp = record.employee;
  const isParttime = record.employmentType === "parttime";

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" pb="4">
          <Flex align="center" gap="4">
            <Avatar
              size="lg"
              name={`${emp.firstNameTh} ${emp.lastNameTh}`}
              bg="brand.100"
              color="brand.700"
            />
            <Box>
              <Text fontWeight="bold" fontSize="lg" color="gray.800">
                {emp.firstNameTh} {emp.lastNameTh}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {emp.employeeId} · {emp.position} · {emp.department}
              </Text>
              <HStack mt="1" spacing="2">
                <Badge
                  colorScheme={isParttime ? "purple" : "blue"}
                  variant="subtle"
                  borderRadius="full"
                  px="2"
                  fontSize="xs"
                >
                  {isParttime ? "Part-time" : "ประจำ"}
                </Badge>
                <Badge
                  colorScheme={
                    record.status === "calculated"
                      ? "green"
                      : record.status === "approved"
                        ? "blue"
                        : record.status === "paid"
                          ? "purple"
                          : "gray"
                  }
                  variant="subtle"
                  borderRadius="full"
                  px="2"
                  fontSize="xs"
                >
                  {record.status === "calculated"
                    ? "คำนวณแล้ว"
                    : record.status === "approved"
                      ? "อนุมัติ"
                      : record.status === "paid"
                        ? "จ่ายแล้ว"
                        : "ร่าง"}
                </Badge>
              </HStack>
            </Box>
          </Flex>
        </DrawerHeader>

        <DrawerBody py="6">
          {/* รายได้ */}
          <Box mb="6">
            <Text
              fontWeight="bold"
              fontSize="sm"
              color="green.700"
              mb="2"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              💰 รายได้ (Income)
            </Text>
            <Box bg="gray.50" borderRadius="xl" p="4">
              <DetailRow
                label="เงินเดือนฐาน (Base Salary)"
                value={fmt(record.baseSalary)}
              />
              <Divider borderColor="gray.200" />
              <DetailRow
                label="ค่าตำแหน่ง"
                value={fmt(record.positionAllowance)}
              />
              <Divider borderColor="gray.200" />
              <DetailRow
                label="ค่าครองชีพ"
                value={fmt(record.livingAllowance)}
              />
              <Divider borderColor="gray.200" />
              <DetailRow
                label="ค่าวิชาชีพ"
                value={fmt(record.professionalAllowance)}
              />
              <Divider borderColor="gray.200" />
              <DetailRow
                label="ค่าคอมมิชชั่น"
                value={fmt(record.commissionAmount)}
                color={record.commissionAmount > 0 ? "green.600" : "gray.400"}
              />
              <Divider borderColor="gray.200" />
              <DetailRow
                label="Sale Bonus"
                value={fmt(record.salesBonus)}
                color={record.salesBonus > 0 ? "green.600" : "gray.400"}
              />
            </Box>
            <Flex
              justify="space-between"
              px="5"
              py="3"
              bg="green.50"
              borderRadius="lg"
              mt="2"
            >
              <Text fontWeight="bold" fontSize="sm" color="green.700">
                รวมรายได้
              </Text>
              <Text fontWeight="bold" fontSize="sm" color="green.700">
                {fmt(record.totalIncome)}
              </Text>
            </Flex>
          </Box>

          {/* รายการหัก */}
          <Box mb="6">
            <Text
              fontWeight="bold"
              fontSize="sm"
              color="red.600"
              mb="2"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              📋 รายการหัก (Deductions)
            </Text>
            <Box bg="gray.50" borderRadius="xl" p="4">
              {isParttime ? (
                <>
                  <DetailRow
                    label="หักณที่จ่าย (3%)"
                    value={fmt(record.parttimeWithholding)}
                    color="red.500"
                  />
                  <Box mt="2" p="3" bg="purple.50" borderRadius="lg">
                    <Text fontSize="xs" color="purple.600" fontWeight="medium">
                      ⚠️ Part-time: หักณที่จ่าย 3% เท่านั้น ไม่หัก ภวด.1,
                      ประกันสังคม
                    </Text>
                  </Box>
                </>
              ) : (
                <>
                  <DetailRow
                    label="ภาษีหัก ณ ที่จ่าย (ภวด.1)"
                    value={fmt(record.withholdingTax)}
                    color={record.withholdingTax > 0 ? "red.500" : "gray.400"}
                  />
                  <Divider borderColor="gray.200" />
                  <DetailRow
                    label="ประกันสังคม (สปส.)"
                    value={fmt(record.socialSecurity)}
                    color="red.500"
                  />
                  <Divider borderColor="gray.200" />
                  <DetailRow
                    label="หักอื่นๆ (HR กรอก)"
                    value={fmt(record.otherDeductions)}
                    color={record.otherDeductions > 0 ? "red.500" : "gray.400"}
                  />
                </>
              )}
            </Box>
            <Flex
              justify="space-between"
              px="5"
              py="3"
              bg="red.50"
              borderRadius="lg"
              mt="2"
            >
              <Text fontWeight="bold" fontSize="sm" color="red.600">
                รวมรายการหัก
              </Text>
              <Text fontWeight="bold" fontSize="sm" color="red.600">
                - {fmt(record.totalDeductions)}
              </Text>
            </Flex>
          </Box>

          {/* ยอดสุทธิ */}
          <Box
            bg="brand.50"
            p="5"
            borderRadius="xl"
            border="2px solid"
            borderColor="brand.200"
          >
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="bold" color="brand.900" fontSize="md">
                  ยอดสุทธิ (Net Pay)
                </Text>
                <Text fontSize="xs" color="gray.500">
                  งวด {record.periodLabel}
                </Text>
              </Box>
              <Text fontWeight="bold" color="brand.700" fontSize="2xl">
                ฿{fmt(record.netPay)}
              </Text>
            </Flex>
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

// ===== Main Payroll Page =====
const Payroll = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isComOpen,
    onOpen: onComOpen,
    onClose: onComClose,
  } = useDisclosure();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedCoachForCom, setSelectedCoachForCom] = useState(null);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [editingDeductions, setEditingDeductions] = useState({});
  const toast = useToast();

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const data = await getPayroll(period);
      setRecords(data);
    } catch (err) {
      // If no records found, just set empty
      setRecords([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayroll();
  }, [period]);

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const result = await calculatePayroll(period);
      setRecords(result.records);
      toast({
        title: "ประมวลผลเรียบร้อย",
        description: result.message,
        status: "success",
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "ประมวลผลล้มเหลว",
        description: err.response?.data?.error || err.message,
        status: "error",
        duration: 3000,
      });
    }
    setCalculating(false);
  };

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    onOpen();
  };

  const handleViewCommission = (record) => {
    if (record.commissionAmount > 0) {
      setSelectedCoachForCom(record.employee);
      onComOpen();
    }
  };

  const handleDeductionChange = (recordId, value) => {
    setEditingDeductions((prev) => ({ ...prev, [recordId]: value }));
  };

  const handleSaveDeduction = async (recordId) => {
    const value = parseFloat(editingDeductions[recordId]) || 0;
    try {
      const updated = await updateDeductions(recordId, value);
      setRecords((prev) => prev.map((r) => (r._id === recordId ? updated : r)));
      setEditingDeductions((prev) => {
        const copy = { ...prev };
        delete copy[recordId];
        return copy;
      });
      toast({
        title: "บันทึกหักอื่นๆ เรียบร้อย",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      toast({ title: "บันทึกไม่สำเร็จ", status: "error", duration: 2000 });
    }
  };

  const totals = records.reduce(
    (acc, r) => ({
      totalIncome: acc.totalIncome + (r.totalIncome || 0),
      totalDeductions: acc.totalDeductions + (r.totalDeductions || 0),
      netPay: acc.netPay + (r.netPay || 0),
    }),
    { totalIncome: 0, totalDeductions: 0, netPay: 0 },
  );

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    const lower = searchTerm.toLowerCase();
    return records.filter((r) => {
      const emp = r.employee;
      if (!emp) return false;
      return (
        emp.firstNameTh?.toLowerCase().includes(lower) ||
        emp.lastNameTh?.toLowerCase().includes(lower) ||
        emp.nickname?.toLowerCase().includes(lower) ||
        emp.employeeId?.toLowerCase().includes(lower)
      );
    });
  }, [records, searchTerm]);

  // Generate month options (last 12 months)
  const monthOptions = [];
  const THAI_MONTHS = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${THAI_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    monthOptions.push({ value: val, label });
  }

  return (
    <Box>
      <Flex
        justifyContent="space-between"
        alignItems="flex-start"
        mb="8"
        flexWrap="wrap"
        gap="4"
      >
        <Box>
          <Heading size="lg" color="gray.800" mb="1" fontWeight="bold">
            คำนวณเงินเดือน
          </Heading>
          <Text color="gray.500" fontSize="sm">
            ประมวลผลรายได้ รายการหัก ภวด.1 ประกันสังคม หักอื่นๆ
          </Text>
        </Box>
        <HStack spacing="3" flexWrap="wrap">
          <Button
            bg="brand.600"
            color="white"
            leftIcon={<Calculator size="16" />}
            _hover={{ bg: "brand.700" }}
            borderRadius="lg"
            size="sm"
            px="5"
            onClick={handleCalculate}
            isLoading={calculating}
            loadingText="กำลังคำนวณ..."
          >
            ประมวลผลเงินเดือน
          </Button>
        </HStack>
      </Flex>

      {/* Filters */}
      <Box
        bg="white"
        p="5"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        mb="6"
      >
        <Flex
          gap="4"
          flexWrap="wrap"
          alignItems="flex-end"
          justify="space-between"
        >
          <Flex gap="4" flexWrap="wrap" alignItems="flex-end">
            <Box>
              <Text
                fontSize="xs"
                fontWeight="bold"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wide"
                mb="2"
              >
                งวดเงินเดือน
              </Text>
              <Select
                bg="gray.50"
                border="none"
                borderRadius="lg"
                w="220px"
                size="sm"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.400">
                {records.length > 0
                  ? `แสดง ${filteredRecords.length} คน | ประจำ ${filteredRecords.filter((r) => r.employmentType === "fulltime").length} | Part-time ${filteredRecords.filter((r) => r.employmentType === "parttime").length}`
                  : "ยังไม่มีข้อมูลงวดนี้ กดปุ่ม 'ประมวลผลเงินเดือน' เพื่อคำนวณ"}
              </Text>
            </Box>
          </Flex>
          <Box w={{ base: "100%", md: "300px" }}>
            <InputGroup size="sm">
              <InputLeftAddon bg="gray.50" border="none">
                <Search size="14" />
              </InputLeftAddon>
              <Input
                placeholder="ค้นหาชื่อ, นามสกุล, ชื่อเล่น..."
                bg="gray.50"
                border="none"
                borderRadius="lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                _focus={{
                  bg: "white",
                  borderWidth: "1px",
                  borderColor: "brand.300",
                }}
              />
            </InputGroup>
          </Box>
        </Flex>
      </Box>

      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="5" mb="8">
        <Box
          p="6"
          bg="white"
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
          borderLeft="4px solid"
          borderLeftColor="green.400"
        >
          <Stat>
            <StatLabel fontSize="xs" color="gray.500" fontWeight="semibold">
              รวมรายได้ทั้งหมด
            </StatLabel>
            <StatNumber fontSize="2xl" color="gray.800" fontWeight="bold">
              ฿{fmt(totals.totalIncome)}
            </StatNumber>
          </Stat>
        </Box>
        <Box
          p="6"
          bg="white"
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
          borderLeft="4px solid"
          borderLeftColor="red.400"
        >
          <Stat>
            <StatLabel fontSize="xs" color="gray.500" fontWeight="semibold">
              รวมรายการหัก
            </StatLabel>
            <StatNumber fontSize="2xl" color="red.500" fontWeight="bold">
              - ฿{fmt(totals.totalDeductions)}
            </StatNumber>
          </Stat>
        </Box>
        <Box
          p="6"
          bg="white"
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
          borderLeft="4px solid"
          borderLeftColor="brand.500"
        >
          <Stat>
            <StatLabel fontSize="xs" color="gray.500" fontWeight="semibold">
              รวมยอดสุทธิจ่าย
            </StatLabel>
            <StatNumber fontSize="2xl" color="brand.700" fontWeight="bold">
              ฿{fmt(totals.netPay)}
            </StatNumber>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* Payroll Table */}
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
        ) : records.length === 0 ? (
          <Center py="20" flexDirection="column">
            <Text color="gray.400" mb="4">
              ยังไม่มีข้อมูลเงินเดือนงวดนี้
            </Text>
            <Button
              bg="brand.600"
              color="white"
              leftIcon={<Calculator size="16" />}
              _hover={{ bg: "brand.700" }}
              borderRadius="lg"
              size="sm"
              onClick={handleCalculate}
              isLoading={calculating}
            >
              ประมวลผลเงินเดือน
            </Button>
          </Center>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="md">
              <Thead bg="gray.50">
                <Tr>
                  <Th py="4" color="gray.500" fontSize="xs" fontWeight="bold">
                    พนักงาน
                  </Th>
                  <Th py="4" color="gray.500" fontSize="xs" fontWeight="bold">
                    ประเภท
                  </Th>
                  <Th
                    py="4"
                    color="gray.500"
                    fontSize="xs"
                    fontWeight="bold"
                    isNumeric
                  >
                    เงินเดือน
                  </Th>
                  <Th
                    py="4"
                    fontSize="xs"
                    fontWeight="bold"
                    isNumeric
                    color="green.600"
                  >
                    ค่าคอม
                  </Th>
                  <Th
                    py="4"
                    fontSize="xs"
                    fontWeight="bold"
                    isNumeric
                    color="teal.600"
                  >
                    Sale
                  </Th>
                  <Th
                    py="4"
                    color="gray.500"
                    fontSize="xs"
                    fontWeight="bold"
                    isNumeric
                  >
                    รวมรายได้
                  </Th>
                  <Th
                    py="4"
                    fontSize="xs"
                    fontWeight="bold"
                    isNumeric
                    color="orange.600"
                  >
                    ภวด.1
                  </Th>
                  <Th
                    py="4"
                    fontSize="xs"
                    fontWeight="bold"
                    isNumeric
                    color="blue.600"
                  >
                    สปส.
                  </Th>
                  <Th
                    py="4"
                    fontSize="xs"
                    fontWeight="bold"
                    isNumeric
                    color="red.600"
                  >
                    <Tooltip label="HR กรอกเอง (เฉพาะประจำ)">หักอื่นๆ</Tooltip>
                  </Th>
                  <Th
                    py="4"
                    fontSize="xs"
                    fontWeight="bold"
                    isNumeric
                    color="red.600"
                  >
                    รวมหัก
                  </Th>
                  <Th
                    py="4"
                    fontSize="xs"
                    fontWeight="bold"
                    isNumeric
                    color="brand.700"
                  >
                    ยอดสุทธิ
                  </Th>
                  <Th py="4" w="50px"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredRecords.map((record) => {
                  const emp = record.employee;
                  if (!emp) return null;
                  const isParttime = record.employmentType === "parttime";
                  const isEditingThis =
                    editingDeductions[record._id] !== undefined;

                  return (
                    <Tr
                      key={record._id}
                      _hover={{ bg: "blue.50" }}
                      transition="background 0.15s"
                      bg={isParttime ? "purple.50" : undefined}
                    >
                      <Td
                        py="4"
                        cursor="pointer"
                        onClick={() => handleViewDetail(record)}
                      >
                        <Flex align="center">
                          <Avatar
                            size="sm"
                            name={`${emp.firstNameTh} ${emp.lastNameTh}`}
                            mr="3"
                            bg="brand.100"
                            color="brand.700"
                          />
                          <Box>
                            <Text
                              fontWeight="bold"
                              color="gray.800"
                              fontSize="sm"
                            >
                              {emp.firstNameTh} {emp.lastNameTh}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              {emp.nickname
                                ? `(${emp.nickname})`
                                : emp.employeeId}{" "}
                              · {emp.department}
                            </Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td py="4">
                        <Badge
                          colorScheme={isParttime ? "purple" : "blue"}
                          variant="subtle"
                          borderRadius="full"
                          px="2"
                          fontSize="xs"
                        >
                          {isParttime ? "Part-time" : "ประจำ"}
                        </Badge>
                      </Td>
                      <Td
                        py="4"
                        isNumeric
                        fontSize="sm"
                        color="gray.700"
                        fontWeight="medium"
                      >
                        {fmt(record.baseSalary)}
                      </Td>
                      <Td
                        py="4"
                        isNumeric
                        fontSize="sm"
                        color={
                          record.commissionAmount > 0 ? "green.600" : "gray.300"
                        }
                        fontWeight={
                          record.commissionAmount > 0 ? "bold" : "normal"
                        }
                        cursor={
                          record.commissionAmount > 0 ? "pointer" : "default"
                        }
                        onClick={() => handleViewCommission(record)}
                        _hover={
                          record.commissionAmount > 0
                            ? {
                                textDecoration: "underline",
                                color: "green.700",
                              }
                            : {}
                        }
                      >
                        {record.commissionAmount > 0
                          ? fmt(record.commissionAmount)
                          : "-"}
                      </Td>
                      <Td
                        py="4"
                        isNumeric
                        fontSize="sm"
                        color={record.salesBonus > 0 ? "teal.600" : "gray.300"}
                        fontWeight={record.salesBonus > 0 ? "bold" : "normal"}
                      >
                        {record.salesBonus > 0 ? fmt(record.salesBonus) : "-"}
                      </Td>
                      <Td
                        py="4"
                        isNumeric
                        fontWeight="bold"
                        color="green.600"
                        fontSize="sm"
                      >
                        {fmt(record.totalIncome)}
                      </Td>

                      {/* ภวด.1 */}
                      <Td
                        py="4"
                        isNumeric
                        fontSize="sm"
                        color={isParttime ? "gray.300" : "orange.600"}
                      >
                        {isParttime ? "-" : fmt(record.withholdingTax)}
                      </Td>

                      {/* ประกันสังคม */}
                      <Td
                        py="4"
                        isNumeric
                        fontSize="sm"
                        color={isParttime ? "gray.300" : "blue.600"}
                      >
                        {isParttime ? "-" : fmt(record.socialSecurity)}
                      </Td>

                      {/* หักอื่นๆ (editable for fulltime only) */}
                      <Td py="4" isNumeric>
                        {isParttime ? (
                          <Tooltip label="Part-time หัก 3% ณ ที่จ่าย">
                            <Text
                              fontSize="sm"
                              color="purple.600"
                              fontWeight="bold"
                            >
                              {fmt(record.parttimeWithholding)}
                              <Text
                                as="span"
                                fontSize="xx-small"
                                ml="1"
                                color="purple.400"
                              >
                                (3%)
                              </Text>
                            </Text>
                          </Tooltip>
                        ) : isEditingThis ? (
                          <HStack spacing="1" justify="flex-end">
                            <Input
                              size="xs"
                              w="80px"
                              type="number"
                              textAlign="right"
                              borderRadius="md"
                              value={editingDeductions[record._id]}
                              onChange={(e) =>
                                handleDeductionChange(
                                  record._id,
                                  e.target.value,
                                )
                              }
                              autoFocus
                            />
                            <Button
                              size="xs"
                              colorScheme="green"
                              onClick={() => handleSaveDeduction(record._id)}
                            >
                              <Save size="12" />
                            </Button>
                          </HStack>
                        ) : (
                          <Text
                            fontSize="sm"
                            color={
                              record.otherDeductions > 0
                                ? "red.500"
                                : "gray.400"
                            }
                            cursor="pointer"
                            _hover={{
                              color: "brand.600",
                              textDecoration: "underline",
                            }}
                            onClick={() =>
                              handleDeductionChange(
                                record._id,
                                String(record.otherDeductions || 0),
                              )
                            }
                            title="คลิกเพื่อแก้ไข"
                          >
                            {record.otherDeductions > 0
                              ? fmt(record.otherDeductions)
                              : "คลิกกรอก"}
                          </Text>
                        )}
                      </Td>

                      <Td
                        py="4"
                        isNumeric
                        fontWeight="bold"
                        color="red.500"
                        fontSize="sm"
                      >
                        - {fmt(record.totalDeductions)}
                      </Td>
                      <Td
                        py="4"
                        isNumeric
                        fontWeight="bold"
                        color="brand.700"
                        fontSize="sm"
                      >
                        {fmt(record.netPay)}
                      </Td>
                      <Td py="4">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => handleViewDetail(record)}
                        >
                          <Eye size="14" />
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
              <Tfoot bg="gray.50">
                <Tr>
                  <Th
                    colSpan={3}
                    py="4"
                    fontSize="sm"
                    fontWeight="bold"
                    color="gray.700"
                  >
                    รวมทั้งหมด ({records.length} คน)
                  </Th>
                  <Th
                    py="4"
                    isNumeric
                    fontWeight="bold"
                    color="green.700"
                    fontSize="sm"
                  >
                    {fmt(totals.totalIncome)}
                  </Th>
                  <Th colSpan={3}></Th>
                  <Th
                    py="4"
                    isNumeric
                    fontWeight="bold"
                    color="red.600"
                    fontSize="sm"
                  >
                    - {fmt(totals.totalDeductions)}
                  </Th>
                  <Th
                    py="4"
                    isNumeric
                    fontWeight="bold"
                    color="brand.700"
                    fontSize="sm"
                  >
                    ฿{fmt(totals.netPay)}
                  </Th>
                  <Th></Th>
                </Tr>
              </Tfoot>
            </Table>
          </Box>
        )}
      </Box>

      {/* Detail Drawer */}
      <PayrollDetailDrawer
        record={selectedRecord}
        isOpen={isOpen}
        onClose={onClose}
      />

      {/* Commission Detail Modal */}
      <CommissionDetailModal
        isOpen={isComOpen}
        onClose={onComClose}
        coachId={selectedCoachForCom?._id}
        coachName={
          selectedCoachForCom
            ? `${selectedCoachForCom.firstNameTh} ${selectedCoachForCom.lastNameTh} ${selectedCoachForCom.nickname ? `(${selectedCoachForCom.nickname})` : ""}`
            : ""
        }
        period={period}
      />
    </Box>
  );
};

export default Payroll;
