import {
  Box,
  Flex,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Select,
  Avatar,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  IconButton,
  InputGroup,
  InputLeftElement,
  Divider,
  Textarea,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Spinner,
  Center,
  Checkbox,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  FileDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {
  getEmployees,
  getBranches,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../services/api";

// ===== Employee Detail/Edit Form (Tab View) =====
const EmployeeDetailView = ({ employee, branches, onBack, onSave, isNew }) => {
  const [form, setForm] = useState(
    employee || {
      prefix: "นาย",
      firstNameTh: "",
      lastNameTh: "",
      firstNameEn: "",
      lastNameEn: "",
      nickname: "",
      idCard: "",
      birthDate: "",
      gender: "male",
      maritalStatus: "single",
      phone: "",
      email: "",
      address: "",
      branch: [],
      department: "",
      position: "",
      level: "junior",
      employmentType: "fulltime",
      salaryType: "monthly",
      startDate: "",
      status: "active",
      shift: "normal",
      baseSalary: 0,
      livingAllowance: 0,
      positionAllowance: 0,
      professionalAllowance: 0,
      otRate: 0,
      socialSecurityEnabled: true,
      taxMethod: "progressive",
      pvdPercent: 0,
      bankName: "",
      bankAccount: "",
      bankAccountName: "",
    },
  );
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      !form.firstNameTh ||
      !form.lastNameTh ||
      !form.branch ||
      (Array.isArray(form.branch) && form.branch.length === 0) ||
      !form.department ||
      !form.position ||
      !form.startDate
    ) {
      toast({
        title: "กรุณากรอกข้อมูลที่จำเป็น",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    setSaving(true);
    try {
      const data = { ...form };
      // Handle branch - send Array of ObjectIds
      if (Array.isArray(data.branch)) {
        data.branch = data.branch.map((b) =>
          typeof b === "object" && b._id ? b._id : b,
        );
      }
      await onSave(data);
      toast({
        title: isNew ? "เพิ่มพนักงานเรียบร้อย" : "บันทึกเรียบร้อย",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: err.response?.data?.error || err.message,
        status: "error",
        duration: 3000,
      });
    }
    setSaving(false);
  };

  // Extract branch IDs from form.branch (which is now an array)
  const branchIds = Array.isArray(form.branch)
    ? form.branch.map((b) => (typeof b === "object" && b._id ? b._id : b))
    : [];

  const handleBranchToggle = (branchId) => {
    setForm((prev) => {
      const currentIds = Array.isArray(prev.branch)
        ? prev.branch.map((b) => (typeof b === "object" && b._id ? b._id : b))
        : [];
      const newBranch = currentIds.includes(branchId)
        ? currentIds.filter((id) => id !== branchId)
        : [...currentIds, branchId];
      return { ...prev, branch: newBranch };
    });
  };

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
        กลับไปรายชื่อ
      </Button>
      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        overflow="hidden"
      >
        {/* Header */}
        <Flex bg="brand.900" p="6" align="center" gap="6">
          <Avatar size="xl" name={`${form.firstNameTh} ${form.lastNameTh}`} />
          <Box color="white">
            <Heading size="md">
              {isNew
                ? "เพิ่มพนักงานใหม่"
                : `${form.firstNameTh} ${form.lastNameTh}`}
            </Heading>
            {!isNew && (
              <Text fontSize="sm" color="whiteAlpha.700" mt="1">
                รหัสพนักงาน: {form.employeeId} | {form.position}
              </Text>
            )}
            <HStack mt="2" spacing="2">
              <Badge
                colorScheme={
                  form.employmentType === "parttime" ? "purple" : "blue"
                }
                variant="solid"
                borderRadius="full"
                px="3"
              >
                {form.employmentType === "parttime" ? "Part-time" : "ประจำ"}
              </Badge>
              <Badge
                colorScheme={
                  form.status === "active"
                    ? "green"
                    : form.status === "probation"
                      ? "yellow"
                      : "red"
                }
                variant="solid"
                borderRadius="full"
                px="3"
              >
                {form.status === "active"
                  ? "Active"
                  : form.status === "probation"
                    ? "ทดลองงาน"
                    : "ลาออก"}
              </Badge>
            </HStack>
          </Box>
        </Flex>

        {/* Tabs */}
        <Tabs variant="line" colorScheme="blue" p="6">
          <TabList>
            <Tab fontWeight="semibold" fontSize="sm">
              ข้อมูลส่วนตัว
            </Tab>
            <Tab fontWeight="semibold" fontSize="sm">
              ข้อมูลการทำงาน
            </Tab>
            <Tab fontWeight="semibold" fontSize="sm">
              เงินเดือน/ค่าตอบแทน
            </Tab>
            <Tab fontWeight="semibold" fontSize="sm">
              บัญชีธนาคาร
            </Tab>
          </TabList>

          <TabPanels>
            {/* ข้อมูลส่วนตัว */}
            <TabPanel px="0" pt="6">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="5">
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    คำนำหน้า
                  </FormLabel>
                  <Select
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.prefix}
                    onChange={(e) => handleChange("prefix", e.target.value)}
                  >
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    ชื่อ (ภาษาไทย)
                  </FormLabel>
                  <Input
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.firstNameTh}
                    onChange={(e) =>
                      handleChange("firstNameTh", e.target.value)
                    }
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    นามสกุล (ภาษาไทย)
                  </FormLabel>
                  <Input
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.lastNameTh}
                    onChange={(e) => handleChange("lastNameTh", e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    ชื่อ (English)
                  </FormLabel>
                  <Input
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.firstNameEn}
                    onChange={(e) =>
                      handleChange("firstNameEn", e.target.value)
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    นามสกุล (English)
                  </FormLabel>
                  <Input
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.lastNameEn}
                    onChange={(e) => handleChange("lastNameEn", e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    ชื่อเล่น
                  </FormLabel>
                  <Input
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.nickname}
                    onChange={(e) => handleChange("nickname", e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    เลขบัตรประชาชน
                  </FormLabel>
                  <Input
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.idCard}
                    onChange={(e) => handleChange("idCard", e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    วันเกิด
                  </FormLabel>
                  <Input
                    bg="gray.50"
                    border="none"
                    type="date"
                    borderRadius="lg"
                    value={
                      form.birthDate ? form.birthDate.substring(0, 10) : ""
                    }
                    onChange={(e) => handleChange("birthDate", e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    เพศ
                  </FormLabel>
                  <Select
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                  >
                    <option value="male">ชาย</option>
                    <option value="female">หญิง</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    สถานะสมรส
                  </FormLabel>
                  <Select
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.maritalStatus}
                    onChange={(e) =>
                      handleChange("maritalStatus", e.target.value)
                    }
                  >
                    <option value="single">โสด</option>
                    <option value="married">สมรส</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    เบอร์โทรศัพท์
                  </FormLabel>
                  <Input
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    อีเมล
                  </FormLabel>
                  <Input
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </FormControl>
              </SimpleGrid>
              <FormControl mt="5">
                <FormLabel fontSize="sm" color="gray.600" fontWeight="semibold">
                  ที่อยู่
                </FormLabel>
                <Textarea
                  bg="gray.50"
                  border="none"
                  borderRadius="lg"
                  rows="2"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </FormControl>
            </TabPanel>

            {/* ข้อมูลการทำงาน */}
            <TabPanel px="0" pt="6">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="5">
                {!isNew && (
                  <FormControl>
                    <FormLabel
                      fontSize="sm"
                      color="gray.600"
                      fontWeight="semibold"
                    >
                      รหัสพนักงาน
                    </FormLabel>
                    <Input
                      bg="gray.50"
                      border="none"
                      isReadOnly
                      borderRadius="lg"
                      value={form.employeeId || ""}
                    />
                  </FormControl>
                )}
                <FormControl isRequired>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    วันที่เริ่มงาน
                  </FormLabel>
                  <Input
                    bg="gray.50"
                    border="none"
                    type="date"
                    borderRadius="lg"
                    value={
                      form.startDate ? form.startDate.substring(0, 10) : ""
                    }
                    onChange={(e) => handleChange("startDate", e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    สถานะพนักงาน
                  </FormLabel>
                  <Select
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="active">ทำงานอยู่ (Active)</option>
                    <option value="probation">ทดลองงาน (Probation)</option>
                    <option value="resigned">ลาออก (Resigned)</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    ตำแหน่ง
                  </FormLabel>
                  <Input
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    placeholder="เช่น ผู้ฝึกสอน, ธุรการ"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    ตำแหน่ง
                  </FormLabel>
                  <Input
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.position}
                    onChange={(e) => handleChange("position", e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    ระดับพนักงาน
                  </FormLabel>
                  <Select
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.level}
                    onChange={(e) => handleChange("level", e.target.value)}
                  >
                    <option value="junior">พนักงาน (Junior)</option>
                    <option value="senior">อาวุโส (Senior)</option>
                    <option value="manager">ผู้จัดการ (Manager)</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    สาขา (เลือกได้หลายสาขา)
                  </FormLabel>
                  <Box bg="gray.50" borderRadius="lg" p="3" minH="42px">
                    <Wrap spacing="2">
                      {branches.map((b) => (
                        <WrapItem key={b._id}>
                          <Checkbox
                            isChecked={branchIds.includes(b._id)}
                            onChange={() => handleBranchToggle(b._id)}
                            colorScheme="blue"
                            size="sm"
                          >
                            <Text fontSize="sm">
                              {b.type === "headquarters" ? "🏢 " : "📍 "}
                              {b.name}
                            </Text>
                          </Checkbox>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    ประเภทพนักงาน
                  </FormLabel>
                  <Select
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.employmentType}
                    onChange={(e) =>
                      handleChange("employmentType", e.target.value)
                    }
                  >
                    <option value="fulltime">ประจำ (Full-time)</option>
                    <option value="parttime">พาร์ทไทม์ (Part-time)</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    ลักษณะเงินเดือน
                  </FormLabel>
                  <Select
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.salaryType}
                    onChange={(e) => handleChange("salaryType", e.target.value)}
                  >
                    <option value="monthly">รายเดือน</option>
                    <option value="daily">รายวัน</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </TabPanel>

            {/* เงินเดือน/ค่าตอบแทน */}
            <TabPanel px="0" pt="6">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="5">
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    เงินเดือนฐาน (Base Salary)
                  </FormLabel>
                  <Input
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    type="number"
                    value={form.baseSalary}
                    onChange={(e) =>
                      handleChange("baseSalary", Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    ค่าครองชีพ
                  </FormLabel>
                  <Input
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    type="number"
                    value={form.livingAllowance}
                    onChange={(e) =>
                      handleChange("livingAllowance", Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    ค่าตำแหน่ง
                  </FormLabel>
                  <Input
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    type="number"
                    value={form.positionAllowance}
                    onChange={(e) =>
                      handleChange("positionAllowance", Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    ค่าวิชาชีพ
                  </FormLabel>
                  <Input
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    type="number"
                    value={form.professionalAllowance}
                    onChange={(e) =>
                      handleChange(
                        "professionalAllowance",
                        Number(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    หักประกันสังคม
                  </FormLabel>
                  <Select
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.socialSecurityEnabled ? "yes" : "no"}
                    onChange={(e) =>
                      handleChange(
                        "socialSecurityEnabled",
                        e.target.value === "yes",
                      )
                    }
                  >
                    <option value="yes">หัก สปส. ตามอัตรา</option>
                    <option value="no">ไม่หัก สปส.</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    ภาษีเงินได้ (Tax)
                  </FormLabel>
                  <Select
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.taxMethod}
                    onChange={(e) => handleChange("taxMethod", e.target.value)}
                  >
                    <option value="progressive">คำนวณตามขั้นบันได</option>
                    <option value="flat">อัตราคงที่</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              {form.employmentType === "parttime" && (
                <Box
                  mt="4"
                  p="4"
                  bg="purple.50"
                  borderRadius="xl"
                  borderLeft="4px solid"
                  borderLeftColor="purple.400"
                >
                  <Text fontSize="sm" color="purple.700" fontWeight="bold">
                    ⚠️ พนักงาน Part-time: หักณที่จ่าย 3% เท่านั้น (ไม่หัก ภวด.1,
                    ประกันสังคม, หักอื่นๆ)
                  </Text>
                </Box>
              )}
            </TabPanel>

            {/* บัญชีธนาคาร */}
            <TabPanel px="0" pt="6">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="5">
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    ธนาคาร
                  </FormLabel>
                  <Select
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.bankName}
                    onChange={(e) => handleChange("bankName", e.target.value)}
                  >
                    <option value="">-- เลือกธนาคาร --</option>
                    <option value="ธนาคารกสิกรไทย">ธนาคารกสิกรไทย</option>
                    <option value="ธนาคารไทยพาณิชย์">ธนาคารไทยพาณิชย์</option>
                    <option value="ธนาคารกรุงเทพ">ธนาคารกรุงเทพ</option>
                    <option value="ธนาคารกรุงไทย">ธนาคารกรุงไทย</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    เลขที่บัญชี
                  </FormLabel>
                  <Input
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.bankAccount}
                    onChange={(e) =>
                      handleChange("bankAccount", e.target.value)
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    color="gray.600"
                    fontWeight="semibold"
                  >
                    ชื่อบัญชี
                  </FormLabel>
                  <Input
                    bg="gray.50"
                    border="none"
                    borderRadius="lg"
                    value={form.bankAccountName}
                    onChange={(e) =>
                      handleChange("bankAccountName", e.target.value)
                    }
                  />
                </FormControl>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Flex p="6" pt="0" justify="flex-end" gap="3">
          <Button variant="outline" borderRadius="lg" onClick={onBack}>
            ยกเลิก
          </Button>
          <Button
            bg="#021841"
            color="white"
            _hover={{ bg: "#021841" }}
            borderRadius="lg"
            px="8"
            onClick={handleSubmit}
            isLoading={saving}
          >
            {isNew ? "เพิ่มพนักงาน" : "บันทึก"}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

// ===== Employee List =====
const Employees = () => {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBranch, setFilterBranch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [companyFilter, setCompanyFilter] = useState("บริษัทพัฒนา");
  const [searchText, setSearchText] = useState("");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterBranch) params.branch = filterBranch;
      if (filterType) params.employmentType = filterType;

      const [emps, brs] = await Promise.all([
        getEmployees(params),
        getBranches(),
      ]);
      setEmployees(emps);
      setBranches(brs);
    } catch (err) {
      toast({
        title: "โหลดข้อมูลล้มเหลว",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filterBranch, filterType]);

  const handleView = (emp) => {
    setSelectedEmployee(emp);
    setIsNew(false);
    setShowDetail(true);
  };

  const handleAdd = () => {
    setSelectedEmployee(null);
    setIsNew(true);
    setShowDetail(true);
  };

  const handleSave = async (data) => {
    if (isNew) {
      await createEmployee(data);
    } else {
      await updateEmployee(selectedEmployee._id, data);
    }
    setShowDetail(false);
    fetchData();
  };

  const handleDeleteConfirm = (emp) => {
    setDeleteTarget(emp);
    onOpen();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEmployee(deleteTarget._id);
      toast({ title: "ลบพนักงานเรียบร้อย", status: "success", duration: 2000 });
      onClose();
      fetchData();
    } catch (err) {
      toast({
        title: "ลบไม่สำเร็จ",
        description: err.response?.data?.error || err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  if (showDetail) {
    return (
      <EmployeeDetailView
        employee={selectedEmployee}
        branches={branches}
        onBack={() => {
          setShowDetail(false);
          fetchData();
        }}
        onSave={handleSave}
        isNew={isNew}
      />
    );
  }

  // Filter employees by company tab
  const companyFiltered = useMemo(() => {
    if (!companyFilter) return employees;
    return employees.filter((e) =>
      e.companies?.some((c) => c.company === companyFilter),
    );
  }, [employees, companyFilter]);

  // Filter employees by search text
  const filtered = companyFiltered.filter((e) => {
    if (!searchText) return true;
    const s = searchText.toLowerCase();
    return (
      e.firstNameTh?.toLowerCase().includes(s) ||
      e.lastNameTh?.toLowerCase().includes(s) ||
      e.employeeId?.toLowerCase().includes(s) ||
      e.nickname?.toLowerCase().includes(s) ||
      e.position?.toLowerCase().includes(s)
    );
  });

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
            ทะเบียนพนักงาน
          </Heading>
          <Text color="gray.500" fontSize="sm">
            จัดการข้อมูลพนักงาน ประวัติส่วนตัว ตำแหน่ง และเงินเดือน
          </Text>
        </Box>
        <Button
          leftIcon={<Plus size="18" />}
          bg="#021841"
          color="white"
          _hover={{ bg: "brand.700" }}
          borderRadius="lg"
          px="6"
          boxShadow="sm"
          onClick={handleAdd}
        >
          เพิ่มพนักงานใหม่
        </Button>
      </Flex>

      {/* Company Tabs */}
      <Tabs
        index={
          companyFilter === "บริษัทพัฒนา"
            ? 0
            : companyFilter === "บริษัทTotal"
              ? 1
              : 2
        }
        onChange={(index) => {
          const companies = ["บริษัทพัฒนา", "บริษัทTotal", ""];
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
          {/* Filters */}
          <Flex gap="4" flexWrap="wrap" alignItems="flex-end" mb="6">
            <Box flex="1" minW="200px">
              <InputGroup size="sm">
                <InputLeftElement>
                  <Search size="14" color="gray" />
                </InputLeftElement>
                <Input
                  placeholder="ค้นหาชื่อ, รหัส, ตำแหน่ง..."
                  bg="gray.50"
                  border="none"
                  borderRadius="lg"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </InputGroup>
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" mb="1">
                สาขา
              </Text>
              <Select
                bg="gray.50"
                border="none"
                size="sm"
                borderRadius="lg"
                w="200px"
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
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" mb="1">
                ประเภท
              </Text>
              <Select
                bg="gray.50"
                border="none"
                size="sm"
                borderRadius="lg"
                w="160px"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">ทั้งหมด</option>
                <option value="fulltime">ประจำ</option>
                <option value="parttime">Part-time</option>
              </Select>
            </Box>
          </Flex>

          {/* Summary Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing="4" mb="6">
            <Box
              p="4"
              bg="brand.50"
              borderRadius="xl"
              textAlign="center"
              border="1px solid"
              borderColor="brand.100"
            >
              <Text fontSize="2xl" fontWeight="bold" color="brand.600">
                {companyFiltered.length}
              </Text>
              <Text fontSize="xs" color="gray.500">
                พนักงานทั้งหมด
              </Text>
            </Box>
            <Box
              p="4"
              bg="blue.50"
              borderRadius="xl"
              textAlign="center"
              border="1px solid"
              borderColor="blue.100"
            >
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {
                  companyFiltered.filter((e) => e.employmentType === "fulltime")
                    .length
                }
              </Text>
              <Text fontSize="xs" color="gray.500">
                ประจำ
              </Text>
            </Box>
            <Box
              p="4"
              bg="purple.50"
              borderRadius="xl"
              textAlign="center"
              border="1px solid"
              borderColor="purple.100"
            >
              <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                {
                  companyFiltered.filter((e) => e.employmentType === "parttime")
                    .length
                }
              </Text>
              <Text fontSize="xs" color="gray.500">
                Part-time
              </Text>
            </Box>
            <Box
              p="4"
              bg="green.50"
              borderRadius="xl"
              textAlign="center"
              border="1px solid"
              borderColor="green.100"
            >
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {companyFiltered.filter((e) => e.status === "active").length}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Active
              </Text>
            </Box>
          </SimpleGrid>

          {/* Table */}
          <Box
            borderRadius="xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor="gray.100"
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
                      <Th color="gray.500" fontSize="xs" fontWeight="bold">
                        พนักงาน
                      </Th>
                      <Th color="gray.500" fontSize="xs" fontWeight="bold">
                        ตำแหน่ง
                      </Th>
                      <Th color="gray.500" fontSize="xs" fontWeight="bold">
                        สาขา
                      </Th>
                      <Th color="gray.500" fontSize="xs" fontWeight="bold">
                        ประเภท
                      </Th>
                      <Th
                        color="gray.500"
                        fontSize="xs"
                        fontWeight="bold"
                        isNumeric
                        w="100px"
                      >
                        เงินเดือน
                      </Th>
                      <Th
                        color="gray.500"
                        fontSize="xs"
                        fontWeight="bold"
                        textAlign="center"
                      >
                        สถานะ
                      </Th>
                      <Th w="100px"></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filtered.map((emp) => (
                      <Tr
                        key={emp._id}
                        _hover={{ bg: "blue.50", cursor: "pointer" }}
                        transition="background 0.15s"
                      >
                        <Td py="4" onClick={() => handleView(emp)}>
                          <Flex align="center">
                            <Avatar
                              size="sm"
                              name={`${emp.firstNameTh} ${emp.lastNameTh}`}
                              mr="3"
                              bg="#021841"
                              color="white"
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
                                {emp.employeeId}
                              </Text>
                            </Box>
                          </Flex>
                        </Td>
                        <Td py="4" onClick={() => handleView(emp)}>
                          <Text fontSize="sm" color="gray.700">
                            {emp.department}
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            {emp.position}
                          </Text>
                        </Td>
                        <Td
                          py="4"
                          fontSize="sm"
                          color="gray.600"
                          onClick={() => handleView(emp)}
                        >
                          {Array.isArray(emp.branch)
                            ? emp.branch
                                .map((b) => b?.name)
                                .filter(Boolean)
                                .join(", ")
                            : emp.branch?.name || "-"}
                        </Td>
                        <Td py="4" onClick={() => handleView(emp)}>
                          <Badge
                            colorScheme={
                              emp.employmentType === "parttime"
                                ? "#2f5855"
                                : "#2f5855"
                            }
                            variant="subtle"
                            borderRadius="full"
                            px="2"
                            fontSize="xs"
                          >
                            {emp.employmentType === "parttime"
                              ? "Part-time"
                              : "ประจำ"}
                          </Badge>
                        </Td>
                        <Td
                          py="4"
                          isNumeric
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.700"
                          onClick={() => handleView(emp)}
                        >
                          {emp.baseSalary?.toLocaleString("th-TH")}
                        </Td>
                        <Td
                          py="4"
                          textAlign="center"
                          onClick={() => handleView(emp)}
                        >
                          <Badge
                            colorScheme={
                              emp.status === "active"
                                ? "#2f5855"
                                : emp.status === "probation"
                                  ? "yellow"
                                  : "red"
                            }
                            variant="subtle"
                            borderRadius="full"
                            px="2"
                            fontSize="xs"
                          >
                            {emp.status === "active"
                              ? "Active"
                              : emp.status === "probation"
                                ? "ทดลองงาน"
                                : "ลาออก"}
                          </Badge>
                        </Td>
                        <Td py="4">
                          <HStack spacing="1">
                            <IconButton
                              icon={<Eye size="14" />}
                              size="xs"
                              variant="ghost"
                              color="#FFF"
                              onClick={() => handleView(emp)}
                              aria-label="ดูรายละเอียด"
                              bg={"#021841"}
                            />
                            <IconButton
                              icon={<Trash2 size="14" />}
                              size="xs"
                              variant="ghost"
                              color="#FFF"
                              onClick={() => handleDeleteConfirm(emp)}
                              aria-label="ลบ"
                              bg={"red"}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                {filtered.length === 0 && (
                  <Center py="10">
                    <Text color="gray.400">ไม่พบข้อมูลพนักงาน</Text>
                  </Center>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>ยืนยันการลบ</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              คุณต้องการลบพนักงาน{" "}
              <b>
                {deleteTarget?.firstNameTh} {deleteTarget?.lastNameTh}
              </b>{" "}
              ({deleteTarget?.employeeId}) ใช่หรือไม่?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr="3" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              ลบ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Employees;
