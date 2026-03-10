import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Select,
  Button,
  Table,
  Tbody,
  Tr,
  Td,
  Divider,
  HStack,
  Badge,
  Center,
  Spinner,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { Printer, Download, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { getMyPayslip } from "../services/api";
import html2pdf from "html2pdf.js";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

const fmt = (n) =>
  (n || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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

const COMPANY_LABELS = {
  บุญรอดกอล์ฟพัฒนา: {
    nameTh: "บริษัท บุญรอด กอล์ฟ พัฒนา จำกัด",
    nameEn: "BOONROD GOLF PATTANA CO., LTD.",
  },
  บุญรอดกอล์ฟโทเทิล: {
    nameTh: "บริษัท บุญรอด กอล์ฟ โททอล จำกัด",
    nameEn: "BOONROD GOLF TOTAL CO., LTD.",
  },
};

const PayslipDetail = ({ record, employee }) => {
  if (!record) return null;

  const companyInfo = COMPANY_LABELS[record.company] || {
    nameTh: record.company,
    nameEn: record.company,
  };

  const branchNames = Array.isArray(employee?.branch)
    ? employee.branch
        .map((b) => b?.name)
        .filter(Boolean)
        .join(", ")
    : employee?.branch?.name || "-";

  const isParttime = record.employmentType === "parttime";

  return (
    <Box
      id="payslip-container"
      bg="white"
      borderRadius="2xl"
      boxShadow="sm"
      borderWidth="1px"
      borderColor="gray.100"
      overflow="hidden"
      maxW="800px"
      mx="auto"
    >
      {/* Header */}
      <Box
        className="pdf-no-break"
        bg="brand.900"
        p="6"
        color="white"
        textAlign="center"
      >
        <Text fontSize="xl" fontWeight="bold" letterSpacing="wide">
          {companyInfo.nameEn}
        </Text>
        <Text fontSize="sm" color="whiteAlpha.700" mt="1">
          {companyInfo.nameTh}
        </Text>
        <Divider my="3" borderColor="whiteAlpha.300" />
        <Text fontSize="lg" fontWeight="bold" color="accent.400">
          ใบจ่ายเงินเดือน (PAYSLIP)
        </Text>
        <Text fontSize="sm" color="whiteAlpha.700">
          ประจำเดือน {record.periodLabel}
        </Text>
      </Box>

      {/* Employee Info */}
      <Box p="6" bg="gray.50" borderBottomWidth="1px" borderColor="gray.100">
        <SimpleGrid columns={{ base: 2, md: 3 }} spacing="4">
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight="semibold">
              รหัสพนักงาน
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="gray.800">
              {employee?.employeeId || "-"}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight="semibold">
              ชื่อ-สกุล
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="gray.800">
              {employee?.prefix} {employee?.firstNameTh} {employee?.lastNameTh}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight="semibold">
              ตำแหน่ง
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="gray.800">
              {employee?.position || "-"}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight="semibold">
              แผนก
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="gray.800">
              {employee?.department || "-"}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight="semibold">
              สาขา
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="gray.800">
              {branchNames}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight="semibold">
              ประเภท
            </Text>
            <Text fontWeight={"bold"} fontSize="xs">
              {isParttime ? "Part-time" : "ประจำ"}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight="semibold">
              ธนาคาร
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="gray.800">
              {employee?.bankName || "-"}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight="semibold">
              เลขบัญชี
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="gray.800">
              {employee?.bankAccount || "-"}
            </Text>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Income & Deductions Side by Side */}
      <Flex p="6" direction={{ base: "column", md: "row" }} gap="6">
        {/* Income */}
        <Box flex="1">
          <Text
            fontSize="sm"
            fontWeight="bold"
            color="green.700"
            mb="3"
            ml={4}
            textTransform="uppercase"
            letterSpacing="wide"
          >
            รายได้ (Income)
          </Text>
          <Table variant="simple" size="sm">
            <Tbody>
              {record.baseSalary > 0 && (
                <Tr>
                  <Td fontSize="sm" color="gray.700" border="none" py="2">
                    เงินเดือนฐาน (Base Salary)
                  </Td>
                  <Td
                    isNumeric
                    fontSize="sm"
                    fontWeight="medium"
                    border="none"
                    py="2"
                  >
                    {fmt(record.baseSalary)}
                  </Td>
                </Tr>
              )}
              {record.commissionAmount > 0 && (
                <Tr>
                  <Td fontSize="sm" color="gray.700" border="none" py="2">
                    ค่าคอมมิชชั่น
                  </Td>
                  <Td
                    isNumeric
                    fontSize="sm"
                    fontWeight="medium"
                    border="none"
                    py="2"
                  >
                    {fmt(record.commissionAmount)}
                  </Td>
                </Tr>
              )}
              {record.salesBonus > 0 && (
                <Tr>
                  <Td fontSize="sm" color="gray.700" border="none" py="2">
                    Sale Bonus
                  </Td>
                  <Td
                    isNumeric
                    fontSize="sm"
                    fontWeight="medium"
                    border="none"
                    py="2"
                  >
                    {fmt(record.salesBonus)}
                  </Td>
                </Tr>
              )}
              {record.referralBonus > 0 && (
                <Tr>
                  <Td fontSize="sm" color="gray.700" border="none" py="2">
                    ค่าแนะนำลูกค้า ({record.referralCount} คน x 100)
                  </Td>
                  <Td
                    isNumeric
                    fontSize="sm"
                    fontWeight="medium"
                    border="none"
                    py="2"
                  >
                    {fmt(record.referralBonus)}
                  </Td>
                </Tr>
              )}
              {record.otAmount > 0 && (
                <Tr>
                  <Td fontSize="sm" color="gray.700" border="none" py="2">
                    OT
                  </Td>
                  <Td
                    isNumeric
                    fontSize="sm"
                    fontWeight="medium"
                    border="none"
                    py="2"
                  >
                    {fmt(record.otAmount)}
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
          <Divider my="2" />
          <Flex justify="space-between" px="4" py="2">
            <Text fontSize="sm" fontWeight="bold" color="green.700">
              รวมรายได้
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="green.700">
              {fmt(record.totalIncome)}
            </Text>
          </Flex>
        </Box>

        {/* Deductions */}
        <Box flex="1">
          <Text
            fontSize="sm"
            fontWeight="bold"
            color="red.600"
            mb="3"
            ml={4}
            textTransform="uppercase"
            letterSpacing="wide"
          >
            รายการหัก (Deductions)
          </Text>
          <Table variant="simple" size="sm">
            <Tbody>
              {isParttime ? (
                <Tr>
                  <Td fontSize="sm" color="gray.700" border="none" py="2">
                    หักณที่จ่าย (3%)
                  </Td>
                  <Td
                    isNumeric
                    fontSize="sm"
                    fontWeight="medium"
                    border="none"
                    py="2"
                  >
                    {fmt(record.parttimeWithholding)}
                  </Td>
                </Tr>
              ) : (
                <>
                  <Tr>
                    <Td fontSize="sm" color="gray.700" border="none" py="2">
                      ภาษีหัก ณ ที่จ่าย (ภวด.1)
                    </Td>
                    <Td
                      isNumeric
                      fontSize="sm"
                      fontWeight="medium"
                      border="none"
                      py="2"
                    >
                      {fmt(record.withholdingTax)}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td fontSize="sm" color="gray.700" border="none" py="2">
                      ประกันสังคม (สปส.)
                    </Td>
                    <Td
                      isNumeric
                      fontSize="sm"
                      fontWeight="medium"
                      border="none"
                      py="2"
                    >
                      {fmt(record.socialSecurity)}
                    </Td>
                  </Tr>
                  {record.otherDeductions > 0 && (
                    <Tr>
                      <Td fontSize="sm" color="gray.700" border="none" py="2">
                        หักอื่นๆ (HR กรอก)
                      </Td>
                      <Td
                        isNumeric
                        fontSize="sm"
                        fontWeight="medium"
                        border="none"
                        py="2"
                      >
                        {fmt(record.otherDeductions)}
                      </Td>
                    </Tr>
                  )}
                </>
              )}
            </Tbody>
          </Table>
          <Divider my="2" />
          <Flex justify="space-between" px="4" py="2">
            <Text fontSize="sm" fontWeight="bold" color="red.600">
              รวมรายการหัก
            </Text>
            <Text
              className="pdf-amount"
              fontSize="sm"
              fontWeight="bold"
              color="red.600"
            >
              - {fmt(record.totalDeductions)}
            </Text>
          </Flex>
        </Box>
      </Flex>

      {/* Net Pay */}
      <Box
        className="pdf-no-break"
        bg="brand.50"
        p="4"
        borderTopWidth="1px"
        borderColor="gray.200"
      >
        <Flex justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="bold" color="brand.900">
            ยอดสุทธิ (Net Pay)
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="brand.700">
            ฿{fmt(record.netPay)}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};

const Payslip = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [records, setRecords] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // Month options (last 12 months)
  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${THAI_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    monthOptions.push({ value: val, label });
  }

  const fetchPayslip = async () => {
    if (!user._id) return;
    setLoading(true);
    try {
      const res = await getMyPayslip(user._id, period);
      setRecords(res.records || []);
      setEmployee(res.employee || null);
      // Auto-select first company
      if (res.records && res.records.length > 0) {
        setSelectedCompany(res.records[0].company);
      } else {
        setSelectedCompany("");
      }
    } catch (err) {
      console.error(err);
      setRecords([]);
      setEmployee(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayslip();
  }, [period]);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (!employee || !employee.idCard) {
      setPinError("ไม่พบข้อมูลเลขบัตรประชาชนในระบบ โปรดติดต่อแอดมิน");
      return;
    }

    // Check if the input exactly matches the employee's ID card
    if (pinInput?.trim() === employee.idCard?.trim()) {
      setIsUnlocked(true);
      setPinError("");
    } else {
      setPinError("เลขบัตรประชาชนไม่ถูกต้อง");
    }
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById("payslip-container");
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `Payslip_${user.firstNameTh}_${period}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  const selectedRecord = records.find((r) => r.company === selectedCompany);

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
            ใบจ่ายเงินเดือน (e-Payslip)
          </Heading>
          <Text color="gray.500" fontSize="sm">
            ดูใบจ่ายเงินเดือนรายบุคคล
          </Text>
        </Box>
        {isUnlocked && (
          <HStack spacing="3">
            <Button
              bg={"#021841"}
              color={"white"}
              leftIcon={<Download size="16" />}
              borderRadius="lg"
              size="sm"
              borderColor="gray.200"
              onClick={handleDownloadPdf}
            >
              Dowload PDF
            </Button>
          </HStack>
        )}
      </Flex>

      {/* Filters */}
      <Flex gap="4" mb="6" flexWrap="wrap" alignItems="flex-end">
        <Box>
          <Text fontSize="xs" fontWeight="bold" color="gray.500" mb="1">
            เดือน
          </Text>
          <Select
            maxW="250px"
            bg="white"
            borderRadius="lg"
            size="sm"
            boxShadow="sm"
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

        {/* Company selector - show only if > 1 record */}
        {records.length > 1 && (
          <Box>
            <Text fontSize="xs" fontWeight="bold" color="gray.500" mb="1">
              บริษัท
            </Text>
            <Select
              maxW="300px"
              bg="white"
              borderRadius="lg"
              size="sm"
              boxShadow="sm"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              {records.map((r) => (
                <option key={r.company} value={r.company}>
                  {COMPANY_LABELS[r.company]?.nameTh || r.company}
                </option>
              ))}
            </Select>
          </Box>
        )}
      </Flex>

      {loading ? (
        <Center py="20">
          <Spinner size="xl" color="blue.500" />
        </Center>
      ) : records.length === 0 ? (
        <Center py="20">
          <Box textAlign="center">
            <Text fontSize="lg" color="gray.400" mb="2">
              ไม่พบข้อมูลใบจ่ายเงินเดือน
            </Text>
            <Text fontSize="sm" color="gray.400">
              อาจยังไม่ได้คำนวณเงินเดือนสำหรับงวดนี้
            </Text>
          </Box>
        </Center>
      ) : !isUnlocked ? (
        <Center py="20">
          <Box
            bg="white"
            p="8"
            borderRadius="2xl"
            boxShadow="md"
            borderWidth="1px"
            borderColor="gray.100"
            maxW="400px"
            w="100%"
            textAlign="center"
          >
            <Heading size="md" mb="2" color="gray.800">
              ยืนยันตัวตน 🔒
            </Heading>
            <Text fontSize="sm" color="gray.500" mb="6">
              กรุณากรอกเลขบัตรประชาชน 13 หลัก
            </Text>
            <form onSubmit={handleUnlock}>
              <InputGroup mb="4">
                <Input
                  type={showPin ? "text" : "password"}
                  placeholder="เลขบัตรประชาชน 13 หลัก"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  maxLength={13}
                  textAlign="center"
                  letterSpacing="widest"
                  pr="3rem"
                />
                <InputRightElement width="3rem">
                  <IconButton
                    h="1.75rem"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPin(!showPin)}
                    icon={showPin ? <EyeOff size="16" /> : <Eye size="16" />}
                    aria-label="Toggle visibly"
                  />
                </InputRightElement>
              </InputGroup>
              {pinError && (
                <Text color="red.500" fontSize="sm" mb="4">
                  {pinError}
                </Text>
              )}
              <Button type="submit" bg={"#021841"} color={"white"} width="100%">
                ดูสลิปเงินเดือน
              </Button>
            </form>
          </Box>
        </Center>
      ) : (
        <PayslipDetail record={selectedRecord} employee={employee} />
      )}
    </Box>
  );
};

export default Payslip;
