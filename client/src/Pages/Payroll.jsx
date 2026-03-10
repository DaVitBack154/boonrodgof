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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
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
import Spinload from "../Components/spinload";
import "dayjs/locale/th";

dayjs.locale("th");

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
  company,
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

  const filteredDetails = useMemo(() => {
    if (!company || company === "หลายบริษัท") return details;
    return details.filter((item) => item.studentCourse?.company === company);
  }, [details, company]);

  const totalComAll = details.reduce((sum, item) => {
    const lessonRate =
      item.commissionRate != null
        ? item.commissionRate
        : item.studentCourse?.commissionRate || 0;
    const perLessonRate = item.studentCourse?.perLessonRate || 0;
    return sum + Math.round(((perLessonRate * lessonRate) / 100) * 100) / 100;
  }, 0);

  const totalComCompany = filteredDetails.reduce((sum, item) => {
    const lessonRate =
      item.commissionRate != null
        ? item.commissionRate
        : item.studentCourse?.commissionRate || 0;
    const perLessonRate = item.studentCourse?.perLessonRate || 0;
    return sum + Math.round(((perLessonRate * lessonRate) / 100) * 100) / 100;
  }, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
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
          ) : filteredDetails.length === 0 ? (
            <Center py="10">
              <Text color="gray.500">ไม่มีข้อมูลการสอนในงวดนี้</Text>
            </Center>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>วันที่/เวลา</Th>
                    <Th>ลูกค้า</Th>
                    <Th>ครั้งที่</Th>
                    <Th isNumeric>RATE (%)</Th>
                    <Th>สาขา</Th>
                    <Th>บริษัท</Th>
                    <Th isNumeric>ค่าคอม/ครั้ง</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {details.map((item) => {
                    const lessonRate =
                      item.commissionRate != null
                        ? item.commissionRate
                        : item.studentCourse?.commissionRate || 0;
                    const perLessonRate =
                      item.studentCourse?.perLessonRate || 0;
                    const comPerLesson =
                      Math.round(((perLessonRate * lessonRate) / 100) * 100) /
                      100;
                    const isCurrentCompany =
                      company &&
                      company !== "หลายบริษัท" &&
                      item.studentCourse?.company === company;

                    return (
                      <Tr
                        key={item._id}
                        _hover={{ bg: "gray.50" }}
                        bg={isCurrentCompany ? "green.50" : "transparent"}
                        borderLeft={isCurrentCompany ? "4px solid" : "none"}
                        borderLeftColor="green.400"
                      >
                        <Td>
                          {dayjs(item.lessonDate).format("DD MMM YYYY HH:mm")}
                        </Td>
                        <Td>{item.studentCourse?.studentName || "-"}</Td>
                        <Td>
                          {item.lessonNumber}/{item.studentCourse?.totalLessons}
                        </Td>
                        <Td isNumeric>{lessonRate}%</Td>
                        <Td fontSize="xs">{item.branch?.name || "-"}</Td>
                        <Td fontSize="xs">
                          {item.studentCourse?.company || "-"}
                        </Td>
                        <Td isNumeric fontWeight="bold" color="green.600">
                          {fmt(comPerLesson)}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
                <Tfoot bg="gray.50">
                  <Tr>
                    <Td colSpan={7} px="0" pt="4">
                      <Flex
                        bg="white"
                        p="4"
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="gray.100"
                        justify="space-between"
                        shadow="sm"
                      >
                        <HStack spacing="8">
                          {company && company !== "หลายบริษัท" && (
                            <Box>
                              <Text fontSize="xs" color="gray.500">
                                ยอดบริษัทนี้ ({company})
                              </Text>
                              <Text
                                fontSize="md"
                                fontWeight="bold"
                                color="green.600"
                              >
                                ฿{fmt(totalComCompany)}
                              </Text>
                            </Box>
                          )}
                          <Box>
                            <Text fontSize="xs" color="gray.500">
                              {company && company !== "หลายบริษัท"
                                ? "ยอดบริษัทอื่นๆ"
                                : "ยอดรวมทุกบริษัท"}
                            </Text>
                            <Text
                              fontSize="md"
                              fontWeight="bold"
                              color={
                                company && company !== "หลายบริษัท"
                                  ? "gray.600"
                                  : "brand.700"
                              }
                            >
                              ฿
                              {fmt(
                                totalComAll -
                                  (company && company !== "หลายบริษัท"
                                    ? totalComCompany
                                    : 0),
                              )}
                            </Text>
                          </Box>
                        </HStack>
                        <Box
                          textAlign="right"
                          borderLeft="1px solid"
                          borderColor="gray.100"
                          pl="8"
                        >
                          <Text
                            fontSize="xs"
                            color="gray.500"
                            fontWeight="bold"
                          >
                            รวมทั้งหมด
                          </Text>
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="brand.700"
                          >
                            ฿{fmt(totalComAll)}
                          </Text>
                        </Box>
                      </Flex>
                    </Td>
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
              {/* <Divider borderColor="gray.200" /> */}
              {/* <DetailRow
                label="ค่าตำแหน่ง"
                value={fmt(record.positionAllowance)}
              /> */}
              {/* <Divider borderColor="gray.200" /> */}
              {/* <DetailRow
                label="ค่าครองชีพ"
                value={fmt(record.livingAllowance)}
              /> */}
              {/* <Divider borderColor="gray.200" /> */}
              {/* <DetailRow
                label="ค่าวิชาชีพ"
                value={fmt(record.professionalAllowance)}
              /> */}
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
              {record.referralBonus > 0 && (
                <>
                  <Divider borderColor="gray.200" />
                  <DetailRow
                    label={`ค่าแนะนำลูกค้า (${record.referralCount || 0} คน)`}
                    value={fmt(record.referralBonus)}
                    color="green.600"
                  />
                </>
              )}
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
  const [selectedCompanyForCom, setSelectedCompanyForCom] = useState("");
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("บุญรอดกอล์ฟพัฒนา");
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [editingDeductions, setEditingDeductions] = useState({});
  const [editingSales, setEditingSales] = useState({});
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
    setIsSpinning(true);
    try {
      // หน่วงเวลา 2 วินาทีเพื่อให้เห็น Loading Spinner
      await new Promise((resolve) => setTimeout(resolve, 2000));

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
    setIsSpinning(false);
  };

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    onOpen();
  };

  const handleViewCommission = (record) => {
    if (record.commissionAmount > 0) {
      setSelectedCoachForCom(record.employee);
      setSelectedCompanyForCom(record.company);
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

  const handleSalesChange = (recordId, value) => {
    setEditingSales((prev) => ({ ...prev, [recordId]: value }));
  };

  const handleSaveSales = async (recordId) => {
    const value = parseFloat(editingSales[recordId]) || 0;
    try {
      const updated = await updateSalesBonus(recordId, value);
      setRecords((prev) => prev.map((r) => (r._id === recordId ? updated : r)));
      setEditingSales((prev) => {
        const copy = { ...prev };
        delete copy[recordId];
        return copy;
      });
      toast({
        title: "บันทึก SALE เรียบร้อย",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      toast({ title: "บันทึกไม่สำเร็จ", status: "error", duration: 2000 });
    }
  };

  const tabRecords = useMemo(() => {
    if (companyFilter) {
      return records.filter((r) => r.company === companyFilter);
    }
    // หากเป็น "ยอดรวมทั้งหมด" (companyFilter === "") ให้ group โดย employee
    const grouped = records.reduce((acc, r) => {
      const empId = r.employee?._id;
      if (!empId) return acc;
      if (!acc[empId]) {
        acc[empId] = {
          ...r,
          company: "หลายบริษัท", // ระบุว่ารวมมา
          records: [r],
        };
      } else {
        // บวกยอดเพิ่ม
        acc[empId].baseSalary =
          (acc[empId].baseSalary || 0) + (r.baseSalary || 0);
        acc[empId].commissionAmount =
          (acc[empId].commissionAmount || 0) + (r.commissionAmount || 0);
        acc[empId].salesBonus =
          (acc[empId].salesBonus || 0) + (r.salesBonus || 0);
        acc[empId].totalIncome =
          (acc[empId].totalIncome || 0) + (r.totalIncome || 0);
        acc[empId].withholdingTax =
          (acc[empId].withholdingTax || 0) + (r.withholdingTax || 0);
        acc[empId].socialSecurity =
          (acc[empId].socialSecurity || 0) + (r.socialSecurity || 0);
        acc[empId].otherDeductions =
          (acc[empId].otherDeductions || 0) + (r.otherDeductions || 0);
        acc[empId].parttimeWithholding =
          (acc[empId].parttimeWithholding || 0) + (r.parttimeWithholding || 0);
        acc[empId].totalDeductions =
          (acc[empId].totalDeductions || 0) + (r.totalDeductions || 0);
        acc[empId].netPay = (acc[empId].netPay || 0) + (r.netPay || 0);
        acc[empId].records.push(r);
      }
      return acc;
    }, {});
    return Object.values(grouped);
  }, [records, companyFilter]);

  const totals = tabRecords.reduce(
    (acc, r) => ({
      totalIncome: acc.totalIncome + (r.totalIncome || 0),
      totalDeductions: acc.totalDeductions + (r.totalDeductions || 0),
      netPay: acc.netPay + (r.netPay || 0),
    }),
    { totalIncome: 0, totalDeductions: 0, netPay: 0 },
  );

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return tabRecords;
    const lower = searchTerm.toLowerCase();
    return tabRecords.filter((r) => {
      const emp = r.employee;
      if (!emp) return false;
      return (
        emp.firstNameTh?.toLowerCase().includes(lower) ||
        emp.lastNameTh?.toLowerCase().includes(lower) ||
        emp.nickname?.toLowerCase().includes(lower) ||
        emp.employeeId?.toLowerCase().includes(lower)
      );
    });
  }, [tabRecords, searchTerm]);

  // Period label showing 26-25 range
  const periodLabel = useMemo(() => {
    if (!period) return "";
    const [y, m] = period.split("-");
    const prevMonth = parseInt(m) - 1 === 0 ? 12 : parseInt(m) - 1;
    const prevYear = parseInt(m) - 1 === 0 ? parseInt(y) - 1 : parseInt(y);
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
    return `26 ${THAI_MONTHS[prevMonth - 1]} ${prevYear} - 25 ${THAI_MONTHS[parseInt(m) - 1]} ${y}`;
  }, [period]);

  // Export CSV
  const exportToCSV = () => {
    if (!filteredRecords || filteredRecords.length === 0) {
      toast({
        title: "ไม่มีข้อมูลสำหรับ Export",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    // CSV Header
    let csvContent = "\uFEFF"; // BOM for UTF-8
    csvContent +=
      "พนักงาน,ประเภท,บริษัท,เงินเดือน,ค่าคอม,SALE,รวมรายได้,ภงด.1,สปส.,หักอื่นๆ,รวมหัก,ยอดสุทธิ\n";

    // Rows
    filteredRecords.forEach((r) => {
      const empName = r.employee
        ? `${r.employee.firstNameTh} ${r.employee.lastNameTh} ${r.employee.nickname ? `(${r.employee.nickname})` : ""}`
        : "ไม่ทราบชื่อ";
      const empType = r.employmentType === "fulltime" ? "ประจำ" : "Part-time";
      const company = r.company || "-";
      const baseSalary = r.baseSalary || 0;
      const commission = r.commissionAmount || 0;
      const salesBonus = r.salesBonus || 0;
      const totalIncome = r.totalIncome || 0;

      const tax =
        r.employmentType === "fulltime"
          ? r.withholdingTax || 0
          : r.parttimeWithholding || 0;
      const sso = r.employmentType === "fulltime" ? r.socialSecurity || 0 : 0;
      const otherDeduct = r.otherDeductions || 0;
      const totalDeduct = r.totalDeductions || 0;
      const netPay = r.netPay || 0;

      const row = [
        `"${empName}"`,
        `"${empType}"`,
        `"${company}"`,
        baseSalary,
        commission,
        salesBonus,
        totalIncome,
        tax,
        sso,
        otherDeduct,
        totalDeduct,
        netPay,
      ];
      csvContent += row.join(",") + "\n";
    });

    // Totals Row
    let totalBase = 0,
      totalCom = 0,
      totalSale = 0,
      sumIncome = 0;
    let totalTax = 0,
      totalSso = 0,
      totalOtherDeduct = 0,
      sumDeduct = 0,
      sumNet = 0;

    filteredRecords.forEach((r) => {
      totalBase += r.baseSalary || 0;
      totalCom += r.commissionAmount || 0;
      totalSale += r.salesBonus || 0;
      sumIncome += r.totalIncome || 0;
      totalTax +=
        r.employmentType === "fulltime"
          ? r.withholdingTax || 0
          : r.parttimeWithholding || 0;
      totalSso += r.employmentType === "fulltime" ? r.socialSecurity || 0 : 0;
      totalOtherDeduct += r.otherDeductions || 0;
      sumDeduct += r.totalDeductions || 0;
      sumNet += r.netPay || 0;
    });

    const totalRow = [
      `"ยอดรวมทั้งหมด"`,
      `""`,
      `""`,
      totalBase,
      totalCom,
      totalSale,
      sumIncome,
      totalTax,
      totalSso,
      totalOtherDeduct,
      sumDeduct,
      sumNet,
    ];
    csvContent += totalRow.join(",") + "\n";

    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    // Determine the active tab name from the companyFilter (empty means "All")
    const tabName = companyFilter === "" ? "รวมทั้งหมด" : companyFilter;
    link.setAttribute("download", `payroll_${period}_${tabName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate month options (last 12 months)
  const monthOptions = [];
  const MONTHS_LABEL = [
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
    const label = `${MONTHS_LABEL[d.getMonth()]} ${d.getFullYear()}`;
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
            bg={"#021841"}
            color="white"
            leftIcon={<Calculator size="16" />}
            _hover={{ bg: "#021841" }}
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
      {/* Company Tabs and Enclosed Content */}
      <Tabs
        index={
          companyFilter === "บุญรอดกอล์ฟพัฒนา"
            ? 0
            : companyFilter === "บุญรอดกอล์ฟโทเทิล"
              ? 1
              : 2
        }
        onChange={(index) => {
          const companies = ["บุญรอดกอล์ฟพัฒนา", "บุญรอดกอล์ฟโทเทิล", ""];
          setCompanyFilter(companies[index]);
        }}
        variant="enclosed"
        colorScheme="brand"
      >
        <TabList mb="-1px" borderBottomColor="gray.200">
          <Tab
            bg="gray.50"
            color="gray.500"
            _selected={{
              color: "brand.700",
              bg: "white",
              borderTop: "3px solid",
              borderTopColor: "brand.600",
              borderBottomColor: "white",
              fontWeight: "bold",
            }}
            fontWeight="semibold"
            px="8"
            py="3"
            borderTopRadius="xl"
          >
            บุญรอดกอล์ฟพัฒนา
          </Tab>
          <Tab
            bg="gray.50"
            color="gray.500"
            _selected={{
              color: "brand.700",
              bg: "white",
              borderTop: "3px solid",
              borderTopColor: "brand.600",
              borderBottomColor: "white",
              fontWeight: "bold",
            }}
            fontWeight="semibold"
            px="8"
            py="3"
            borderTopRadius="xl"
            ml="1"
          >
            บุญรอดกอล์ฟโทเทิล
          </Tab>
          <Tab
            bg="gray.50"
            color="gray.500"
            _selected={{
              color: "brand.700",
              bg: "white",
              borderTop: "3px solid",
              borderTopColor: "brand.600",
              borderBottomColor: "white",
              fontWeight: "bold",
            }}
            fontWeight="semibold"
            px="8"
            py="3"
            borderTopRadius="xl"
            ml="1"
          >
            ยอดรวมทั้งหมด
          </Tab>
        </TabList>
        <Box
          bg="white"
          borderWidth="1px"
          borderColor="gray.200"
          borderBottomRadius="xl"
          borderTopRightRadius="xl"
          p={{ base: 4, md: 6 }}
          boxShadow="sm"
        >
          {/* Filters Inside Tabs */}
          <Box mb="8">
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
                      ? `แสดง ${filteredRecords.length} รายการ | ประจำ ${filteredRecords.filter((r) => r.employmentType === "fulltime").length} | Part-time ${filteredRecords.filter((r) => r.employmentType === "parttime").length}`
                      : "ยังไม่มีข้อมูลงวดนี้"}
                  </Text>
                  <Text fontSize="xs" color="blue.500" fontWeight="semibold">
                    รอบบิล: {periodLabel}
                  </Text>
                </Box>
              </Flex>
              <Flex gap="3" w={{ base: "100%", md: "auto" }}>
                <InputGroup size="sm" w={{ base: "100%", md: "250px" }}>
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
                <Button
                  size="sm"
                  leftIcon={<Download size={16} />}
                  colorScheme="green"
                  variant="outline"
                  onClick={exportToCSV}
                  isDisabled={filteredRecords.length === 0}
                >
                  Export CSV
                </Button>
              </Flex>
            </Flex>
          </Box>

          {/* Summary Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing="6" mb="8">
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
              <Center py="16">
                <Spinner size="xl" color="brand.500" />
              </Center>
            ) : records.length === 0 ? (
              <Center py="20" flexDirection="column">
                <Text color="gray.400" mb="4">
                  ยังไม่มีข้อมูลเงินเดือนงวดนี้
                </Text>
                <Button
                  bg={"#021841"}
                  color="white"
                  leftIcon={<Calculator size="16" />}
                  _hover={{ bg: "#021841" }}
                  borderRadius="lg"
                  size="sm"
                  onClick={handleCalculate}
                  isLoading={calculating}
                >
                  ประมวลผลเงินเดือน
                </Button>
              </Center>
            ) : (
              <Box
                overflowX="auto"
                overflowY="auto"
                maxH="70vh"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.100"
              >
                <Table variant="simple" size="sm">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th
                        color="gray.500"
                        fontSize="xs"
                        fontWeight="bold"
                        position="sticky"
                        top={0}
                        left={0}
                        bg="gray.50"
                        zIndex={3}
                        boxShadow="sm"
                        minW="160px"
                      >
                        พนักงาน
                      </Th>
                      <Th
                        color="gray.500"
                        fontSize="xs"
                        fontWeight="bold"
                        position="sticky"
                        top={0}
                        bg="gray.50"
                        zIndex={2}
                        boxShadow="sm"
                      >
                        ประเภท
                      </Th>
                      <Th
                        py="4"
                        color="gray.500"
                        fontSize="xs"
                        fontWeight="bold"
                        position="sticky"
                        top={0}
                        bg="gray.50"
                        zIndex={2}
                        boxShadow="sm"
                      >
                        บริษัท
                      </Th>
                      <Th
                        color="gray.500"
                        fontSize="xs"
                        fontWeight="bold"
                        isNumeric
                        position="sticky"
                        top={0}
                        bg="gray.50"
                        zIndex={2}
                        boxShadow="sm"
                      >
                        เงินเดือน
                      </Th>
                      <Th
                        color="#216e4e"
                        fontSize="xs"
                        fontWeight="bold"
                        isNumeric
                        position="sticky"
                        top={0}
                        bg="gray.50"
                        zIndex={2}
                        boxShadow="sm"
                      >
                        ค่าคอม
                      </Th>
                      <Th
                        color="#216e4e"
                        fontSize="xs"
                        fontWeight="bold"
                        isNumeric
                        position="sticky"
                        top={0}
                        bg="gray.50"
                        zIndex={2}
                        boxShadow="sm"
                      >
                        Sale
                      </Th>
                      <Th
                        color="#216e4e"
                        fontSize="xs"
                        fontWeight="bold"
                        isNumeric
                        position="sticky"
                        top={0}
                        bg="gray.50"
                        zIndex={2}
                        boxShadow="sm"
                      >
                        รวมรายได้
                      </Th>
                      <Th
                        color="#ae332d"
                        fontSize="xs"
                        fontWeight="bold"
                        isNumeric
                        position="sticky"
                        top={0}
                        bg="gray.50"
                        zIndex={2}
                        boxShadow="sm"
                      >
                        ภวด.1
                      </Th>
                      <Th
                        color="#ae332d"
                        fontSize="xs"
                        fontWeight="bold"
                        isNumeric
                        position="sticky"
                        top={0}
                        bg="gray.50"
                        zIndex={2}
                        boxShadow="sm"
                      >
                        สปส.
                      </Th>
                      <Th
                        color="#ae332d"
                        fontSize="xs"
                        fontWeight="bold"
                        isNumeric
                        position="sticky"
                        top={0}
                        bg="gray.50"
                        zIndex={2}
                        boxShadow="sm"
                      >
                        <Tooltip label="HR กรอกเอง (เฉพาะประจำ)">
                          หักอื่นๆ
                        </Tooltip>
                      </Th>
                      <Th
                        color="#ae332d"
                        fontSize="xs"
                        fontWeight="bold"
                        isNumeric
                        position="sticky"
                        top={0}
                        bg="gray.50"
                        zIndex={2}
                        boxShadow="sm"
                      >
                        รวมหัก
                      </Th>
                      <Th
                        color="gray.500"
                        fontSize="xs"
                        fontWeight="bold"
                        isNumeric
                        position="sticky"
                        top={0}
                        bg="gray.50"
                        zIndex={2}
                        boxShadow="sm"
                      >
                        ยอดสุทธิ
                      </Th>
                      <Th
                        w="50px"
                        position="sticky"
                        top={0}
                        bg="gray.50"
                        zIndex={2}
                        boxShadow="sm"
                      ></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredRecords.map((record) => {
                      const emp = record.employee;
                      if (!emp) return null;
                      const isParttime = record.employmentType === "parttime";
                      const isEditingThisDeduction =
                        editingDeductions[record._id] !== undefined;
                      const isEditingThisSales =
                        editingSales[record._id] !== undefined;

                      return (
                        <Tr
                          key={record._id}
                          bg="white"
                          _hover={{ bg: "gray.50" }}
                          transition="background 0.15s"
                        >
                          <Td
                            cursor="pointer"
                            onClick={() => handleViewDetail(record)}
                            position="sticky"
                            left={0}
                            bg="inherit"
                            zIndex={1}
                            minW="160px"
                          >
                            <Flex align="center">
                              <Box>
                                <Text
                                  fontWeight="bold"
                                  color="gray.800"
                                  fontSize="sm"
                                >
                                  {emp.firstNameTh} {emp.lastNameTh}
                                </Text>
                                <Text fontSize="sm" color="gray.400">
                                  {emp.nickname
                                    ? `(${emp.nickname})`
                                    : emp.employeeId}
                                </Text>
                              </Box>
                            </Flex>
                          </Td>
                          <Td py="4">
                            <Text px="2" fontSize="xs" fontWeight="bold">
                              {isParttime ? "Part-time" : "ประจำ"}
                            </Text>
                          </Td>
                          <Td py="4">
                            <Badge
                              bg="#2f5855"
                              color="white"
                              variant="subtle"
                              borderRadius="full"
                              px="2"
                              fontSize="xx-small"
                            >
                              {record.company || "-"}
                            </Badge>
                          </Td>
                          <Td
                            py="4"
                            isNumeric
                            fontSize="sm"
                            color="gray.700"
                            fontWeight="medium"
                            whiteSpace="nowrap"
                          >
                            {fmt(record.baseSalary)}
                          </Td>
                          <Td
                            py="4"
                            isNumeric
                            fontSize="sm"
                            color={
                              record.commissionAmount > 0
                                ? "#216e4e"
                                : "gray.300"
                            }
                            fontWeight={
                              record.commissionAmount > 0 ? "bold" : "normal"
                            }
                            cursor={
                              record.commissionAmount > 0
                                ? "pointer"
                                : "default"
                            }
                            onClick={() => handleViewCommission(record)}
                            _hover={
                              record.commissionAmount > 0
                                ? {
                                    textDecoration: "underline",
                                    color: "#185038",
                                  }
                                : {}
                            }
                            whiteSpace="nowrap"
                          >
                            {record.commissionAmount > 0
                              ? fmt(record.commissionAmount)
                              : "-"}
                          </Td>
                          {/* SALE (editable for fulltime only, similar to otherDeductions) */}
                          <Td py="4" isNumeric>
                            {isParttime ? (
                              <Text fontSize="sm" color="gray.300">
                                -
                              </Text>
                            ) : isEditingThisSales ? (
                              <HStack spacing="1" justify="flex-end">
                                <Input
                                  size="xs"
                                  w="80px"
                                  type="number"
                                  textAlign="right"
                                  borderRadius="md"
                                  value={editingSales[record._id]}
                                  onChange={(e) =>
                                    handleSalesChange(
                                      record._id,
                                      e.target.value,
                                    )
                                  }
                                  autoFocus
                                />
                                <Button
                                  size="xs"
                                  colorScheme="teal"
                                  onClick={() => handleSaveSales(record._id)}
                                >
                                  <Save size="12" />
                                </Button>
                              </HStack>
                            ) : (
                              <Text
                                fontSize="sm"
                                color={
                                  record.salesBonus > 0 ? "#216e4e" : "gray.400"
                                }
                                fontWeight={
                                  record.salesBonus > 0 ? "bold" : "normal"
                                }
                                cursor="pointer"
                                _hover={{
                                  color: "#185038",
                                  textDecoration: "underline",
                                }}
                                onClick={() =>
                                  handleSalesChange(
                                    record._id,
                                    String(record.salesBonus || 0),
                                  )
                                }
                                title="คลิกเพื่อแก้ไข"
                              >
                                {record.salesBonus > 0
                                  ? fmt(record.salesBonus)
                                  : "คลิกกรอก"}
                              </Text>
                            )}
                          </Td>
                          <Td
                            py="4"
                            isNumeric
                            fontWeight="bold"
                            color="#216e4e"
                            fontSize="sm"
                            whiteSpace="nowrap"
                          >
                            {fmt(record.totalIncome)}
                          </Td>

                          {/* ภวด.1 */}
                          <Td
                            py="4"
                            isNumeric
                            fontSize="sm"
                            color={isParttime ? "gray.300" : "#ae332d"}
                            whiteSpace="nowrap"
                          >
                            {isParttime ? "-" : fmt(record.withholdingTax)}
                          </Td>

                          {/* ประกันสังคม */}
                          <Td
                            py="4"
                            isNumeric
                            fontSize="sm"
                            color={isParttime ? "gray.300" : "#ae332d"}
                            whiteSpace="nowrap"
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
                            ) : isEditingThisDeduction ? (
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
                                  onClick={() =>
                                    handleSaveDeduction(record._id)
                                  }
                                >
                                  <Save size="12" />
                                </Button>
                              </HStack>
                            ) : (
                              <Text
                                fontSize="sm"
                                color={
                                  record.otherDeductions > 0
                                    ? "#ae332d"
                                    : "gray.400"
                                }
                                cursor="pointer"
                                _hover={{
                                  color: "#8c2924",
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
                            color="#ae332d"
                            fontSize="sm"
                            whiteSpace="nowrap"
                          >
                            - {fmt(record.totalDeductions)}
                          </Td>
                          <Td
                            py="4"
                            isNumeric
                            fontWeight="bold"
                            color="#021841"
                            fontSize="sm"
                            whiteSpace="nowrap"
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
                        colSpan={4}
                        py="4"
                        fontSize="sm"
                        fontWeight="bold"
                        color="gray.700"
                        position="sticky"
                        left={0}
                        bg="gray.50"
                        zIndex={1}
                        minW="180px"
                      >
                        รวมทั้งหมด ({filteredRecords.length} รายการ)
                      </Th>
                      <Th
                        py="4"
                        isNumeric
                        fontWeight="bold"
                        color="#216e4e"
                        fontSize="sm"
                      >
                        {fmt(totals.totalIncome)}
                      </Th>
                      <Th colSpan={3}></Th>
                      <Th
                        py="4"
                        isNumeric
                        fontWeight="bold"
                        color="#ae332d"
                        fontSize="sm"
                        whiteSpace="nowrap"
                      >
                        - {fmt(totals.totalDeductions)}
                      </Th>
                      <Th
                        py="4"
                        isNumeric
                        fontWeight="bold"
                        color="#021841"
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
        </Box>{" "}
        {/* Close Tab Content Wrapper Box */}
      </Tabs>{" "}
      {/* Close Tabs */}
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
        company={selectedCompanyForCom}
      />
      {isSpinning && <Spinload />}
    </Box>
  );
};

export default Payroll;
