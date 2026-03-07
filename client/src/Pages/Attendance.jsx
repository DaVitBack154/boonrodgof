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
  Select,
  Button,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Icon,
} from "@chakra-ui/react";
import {
  Download,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

const Attendance = () => {
  // Mock daily attendance data for February
  const days = [
    {
      date: "01/02/2024",
      day: "พฤ",
      in: "07:55",
      out: "17:05",
      hrs: "8:00",
      ot: "0:00",
      status: "ปกติ",
    },
    {
      date: "02/02/2024",
      day: "ศ",
      in: "08:10",
      out: "17:00",
      hrs: "8:00",
      ot: "0:00",
      status: "สาย",
    },
    {
      date: "03/02/2024",
      day: "ส",
      in: "-",
      out: "-",
      hrs: "-",
      ot: "-",
      status: "วันหยุด",
    },
    {
      date: "04/02/2024",
      day: "อา",
      in: "-",
      out: "-",
      hrs: "-",
      ot: "-",
      status: "วันหยุด",
    },
    {
      date: "05/02/2024",
      day: "จ",
      in: "07:50",
      out: "19:30",
      hrs: "8:00",
      ot: "2:30",
      status: "OT",
    },
    {
      date: "06/02/2024",
      day: "อ",
      in: "07:58",
      out: "17:02",
      hrs: "8:00",
      ot: "0:00",
      status: "ปกติ",
    },
    {
      date: "07/02/2024",
      day: "พ",
      in: "-",
      out: "-",
      hrs: "-",
      ot: "-",
      status: "ลาป่วย",
    },
    {
      date: "08/02/2024",
      day: "พฤ",
      in: "08:00",
      out: "17:00",
      hrs: "8:00",
      ot: "0:00",
      status: "ปกติ",
    },
    {
      date: "09/02/2024",
      day: "ศ",
      in: "07:45",
      out: "20:00",
      hrs: "8:00",
      ot: "3:00",
      status: "OT",
    },
    {
      date: "10/02/2024",
      day: "ส",
      in: "08:00",
      out: "12:00",
      hrs: "4:00",
      ot: "4:00",
      status: "OT (วันหยุด)",
    },
    {
      date: "11/02/2024",
      day: "อา",
      in: "-",
      out: "-",
      hrs: "-",
      ot: "-",
      status: "วันหยุด",
    },
    {
      date: "12/02/2024",
      day: "จ",
      in: "07:55",
      out: "17:05",
      hrs: "8:00",
      ot: "0:00",
      status: "ปกติ",
    },
    {
      date: "13/02/2024",
      day: "อ",
      in: "08:30",
      out: "17:00",
      hrs: "7:30",
      ot: "0:00",
      status: "สาย",
    },
    {
      date: "14/02/2024",
      day: "พ",
      in: "07:50",
      out: "17:10",
      hrs: "8:00",
      ot: "0:00",
      status: "ปกติ",
    },
    {
      date: "15/02/2024",
      day: "พฤ",
      in: "-",
      out: "-",
      hrs: "-",
      ot: "-",
      status: "ลาพักร้อน",
    },
  ];

  const getStatusColor = (status) => {
    if (status === "ปกติ") return "green";
    if (status === "สาย") return "red";
    if (status === "OT" || status === "OT (วันหยุด)") return "purple";
    if (status.startsWith("ลา")) return "orange";
    if (status === "วันหยุด") return "gray";
    return "gray";
  };

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
            เวลาปฏิบัติงาน
          </Heading>
          <Text color="gray.500" fontSize="sm">
            บันทึกเวลาเข้า-ออกงาน และสรุปชั่วโมงทำงาน / ล่วงเวลา
          </Text>
        </Box>
        <Button
          leftIcon={<Download size="18" />}
          variant="outline"
          borderRadius="lg"
          borderColor="gray.200"
        >
          ส่งออก Excel
        </Button>
      </Flex>

      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 2, md: 4, lg: 5 }} spacing="4" mb="6">
        <Box
          p="4"
          bg="white"
          borderRadius="xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
        >
          <Stat>
            <StatLabel fontSize="xs" color="gray.500" fontWeight="semibold">
              วันทำงาน
            </StatLabel>
            <StatNumber fontSize="2xl" color="gray.800">
              20 วัน
            </StatNumber>
          </Stat>
        </Box>
        <Box
          p="4"
          bg="white"
          borderRadius="xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
        >
          <Stat>
            <StatLabel fontSize="xs" color="gray.500" fontWeight="semibold">
              มาทำงาน
            </StatLabel>
            <StatNumber fontSize="2xl" color="green.500">
              18 วัน
            </StatNumber>
          </Stat>
        </Box>
        <Box
          p="4"
          bg="white"
          borderRadius="xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
        >
          <Stat>
            <StatLabel fontSize="xs" color="gray.500" fontWeight="semibold">
              สาย
            </StatLabel>
            <StatNumber fontSize="2xl" color="red.500">
              2 ครั้ง
            </StatNumber>
          </Stat>
        </Box>
        <Box
          p="4"
          bg="white"
          borderRadius="xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
        >
          <Stat>
            <StatLabel fontSize="xs" color="gray.500" fontWeight="semibold">
              ลางาน
            </StatLabel>
            <StatNumber fontSize="2xl" color="orange.500">
              2 วัน
            </StatNumber>
          </Stat>
        </Box>
        <Box
          p="4"
          bg="white"
          borderRadius="xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
        >
          <Stat>
            <StatLabel fontSize="xs" color="gray.500" fontWeight="semibold">
              รวม OT
            </StatLabel>
            <StatNumber fontSize="2xl" color="purple.500">
              9.5 ชม.
            </StatNumber>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* Filters */}
      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        overflow="hidden"
      >
        <Flex
          p="4"
          gap="4"
          flexWrap="wrap"
          borderBottomWidth="1px"
          borderColor="gray.100"
          bg="gray.50"
        >
          <Select
            maxW="200px"
            bg="white"
            borderRadius="lg"
            defaultValue="02-2024"
            size="sm"
          >
            <option value="03-2024">มีนาคม 2024</option>
            <option value="02-2024">กุมภาพันธ์ 2024</option>
            <option value="01-2024">มกราคม 2024</option>
          </Select>
          <Select
            maxW="250px"
            bg="white"
            borderRadius="lg"
            defaultValue="EMP-001"
            size="sm"
          >
            <option value="all">-- ทุกคน --</option>
            <option value="EMP-001">EMP-001 สมชาย ใจดี</option>
            <option value="EMP-012">EMP-012 วิภาวี รักงาน</option>
            <option value="EMP-018">EMP-018 นพพล มุ่งมั่น</option>
          </Select>
          <Select
            maxW="200px"
            bg="white"
            borderRadius="lg"
            defaultValue=""
            size="sm"
          >
            <option value="">ทุกสถานะ</option>
            <option value="normal">ปกติ</option>
            <option value="late">สาย</option>
            <option value="ot">OT</option>
            <option value="leave">ลางาน</option>
            <option value="absent">ขาด</option>
          </Select>
        </Flex>

        {/* Attendance Grid */}
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th py="3" color="gray.500" fontSize="xs">
                  วันที่
                </Th>
                <Th py="3" color="gray.500" fontSize="xs">
                  วัน
                </Th>
                <Th py="3" color="gray.500" fontSize="xs">
                  กะ
                </Th>
                <Th py="3" color="gray.500" fontSize="xs" textAlign="center">
                  เวลาเข้า
                </Th>
                <Th py="3" color="gray.500" fontSize="xs" textAlign="center">
                  เวลาออก
                </Th>
                <Th py="3" color="gray.500" fontSize="xs" textAlign="center">
                  ชม.ทำงาน
                </Th>
                <Th py="3" color="gray.500" fontSize="xs" textAlign="center">
                  OT (ชม.)
                </Th>
                <Th py="3" color="gray.500" fontSize="xs" textAlign="center">
                  สาย (นาที)
                </Th>
                <Th py="3" color="gray.500" fontSize="xs" textAlign="center">
                  กลับก่อน
                </Th>
                <Th py="3" color="gray.500" fontSize="xs">
                  สถานะ
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {days.map((d, i) => {
                const isWeekend = d.status === "วันหยุด";
                const isLeave = d.status.startsWith("ลา");
                return (
                  <Tr
                    key={i}
                    bg={isWeekend ? "gray.50" : "white"}
                    _hover={{ bg: isWeekend ? "gray.100" : "blue.50" }}
                    transition="background 0.15s"
                  >
                    <Td
                      py="3"
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.700"
                    >
                      {d.date}
                    </Td>
                    <Td
                      py="3"
                      fontSize="sm"
                      color={isWeekend ? "red.400" : "gray.600"}
                    >
                      {d.day}
                    </Td>
                    <Td py="3" fontSize="sm" color="gray.500">
                      08:00-17:00
                    </Td>
                    <Td
                      py="3"
                      fontSize="sm"
                      textAlign="center"
                      fontWeight="medium"
                      color={
                        d.in === "-"
                          ? "gray.300"
                          : d.status === "สาย"
                            ? "red.500"
                            : "green.600"
                      }
                    >
                      {d.in}
                    </Td>
                    <Td
                      py="3"
                      fontSize="sm"
                      textAlign="center"
                      fontWeight="medium"
                      color={d.out === "-" ? "gray.300" : "gray.700"}
                    >
                      {d.out}
                    </Td>
                    <Td
                      py="3"
                      fontSize="sm"
                      textAlign="center"
                      color="gray.700"
                    >
                      {d.hrs}
                    </Td>
                    <Td
                      py="3"
                      fontSize="sm"
                      textAlign="center"
                      fontWeight="bold"
                      color={
                        d.ot !== "0:00" && d.ot !== "-"
                          ? "purple.600"
                          : "gray.300"
                      }
                    >
                      {d.ot}
                    </Td>
                    <Td
                      py="3"
                      fontSize="sm"
                      textAlign="center"
                      color={d.status === "สาย" ? "red.500" : "gray.300"}
                    >
                      {d.status === "สาย" ? "10 นาที" : "-"}
                    </Td>
                    <Td
                      py="3"
                      fontSize="sm"
                      textAlign="center"
                      color="gray.300"
                    >
                      -
                    </Td>
                    <Td py="3">
                      <Badge
                        colorScheme={getStatusColor(d.status)}
                        variant="subtle"
                        borderRadius="full"
                        px="2"
                        fontSize="xs"
                        fontWeight="medium"
                      >
                        {d.status}
                      </Badge>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>

        {/* OT Summary */}
        <Box p="5" borderTopWidth="1px" borderColor="gray.100" bg="gray.50">
          <Text fontWeight="bold" color="gray.700" fontSize="sm" mb="3">
            สรุป OT ประจำเดือน
          </Text>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing="4">
            <Box>
              <Text fontSize="xs" color="gray.500">
                OT x1.0 (วันปกติ)
              </Text>
              <Text fontSize="md" fontWeight="bold" color="gray.800">
                2.5 ชม.
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500">
                OT x1.5 (วันปกติ เกิน)
              </Text>
              <Text fontSize="md" fontWeight="bold" color="gray.800">
                3.0 ชม.
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500">
                OT x2.0 (วันหยุด)
              </Text>
              <Text fontSize="md" fontWeight="bold" color="gray.800">
                4.0 ชม.
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500">
                OT x3.0 (วันหยุดนักขัตฤกษ์)
              </Text>
              <Text fontSize="md" fontWeight="bold" color="gray.800">
                0.0 ชม.
              </Text>
            </Box>
          </SimpleGrid>
        </Box>
      </Box>
    </Box>
  );
};

export default Attendance;
