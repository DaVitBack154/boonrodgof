import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Divider,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { Printer, Download, ChevronLeft, ChevronRight } from "lucide-react";

const PayslipDetail = () => (
  <Box
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
    <Box bg="brand.900" p="6" color="white" textAlign="center">
      <Text fontSize="xl" fontWeight="bold" letterSpacing="wide">
        BOONROD GOLF TOTAL CO., LTD.
      </Text>
      <Text fontSize="sm" color="whiteAlpha.700" mt="1">
        บริษัท บุญรอด กอล์ฟ โททอล จำกัด
      </Text>
      <Divider my="3" borderColor="whiteAlpha.300" />
      <Text fontSize="lg" fontWeight="bold" color="accent.400">
        ใบจ่ายเงินเดือน (PAYSLIP)
      </Text>
      <Text fontSize="sm" color="whiteAlpha.700">
        ประจำเดือน กุมภาพันธ์ 2024
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
            EMP-001
          </Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="gray.500" fontWeight="semibold">
            ชื่อ-สกุล
          </Text>
          <Text fontSize="sm" fontWeight="bold" color="gray.800">
            นาย สมชาย ใจดี
          </Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="gray.500" fontWeight="semibold">
            ตำแหน่ง
          </Text>
          <Text fontSize="sm" fontWeight="bold" color="gray.800">
            Head Coach
          </Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="gray.500" fontWeight="semibold">
            แผนก
          </Text>
          <Text fontSize="sm" fontWeight="bold" color="gray.800">
            ผู้ฝึกสอน
          </Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="gray.500" fontWeight="semibold">
            สาขา
          </Text>
          <Text fontSize="sm" fontWeight="bold" color="gray.800">
            สนามไดร์ฟรัชดา-วิภาวดี
          </Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="gray.500" fontWeight="semibold">
            วันที่จ่าย
          </Text>
          <Text fontSize="sm" fontWeight="bold" color="gray.800">
            29/02/2024
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
          textTransform="uppercase"
          letterSpacing="wide"
        >
          รายได้ (Income)
        </Text>
        <Table variant="simple" size="sm">
          <Tbody>
            <Tr>
              <Td fontSize="sm" color="gray.700" border="none" py="2">
                เงินเดือนฐาน
              </Td>
              <Td
                isNumeric
                fontSize="sm"
                fontWeight="medium"
                border="none"
                py="2"
              >
                30,000.00
              </Td>
            </Tr>
            <Tr>
              <Td fontSize="sm" color="gray.700" border="none" py="2">
                ค่าตำแหน่ง
              </Td>
              <Td
                isNumeric
                fontSize="sm"
                fontWeight="medium"
                border="none"
                py="2"
              >
                3,000.00
              </Td>
            </Tr>
            <Tr>
              <Td fontSize="sm" color="gray.700" border="none" py="2">
                ค่าครองชีพ
              </Td>
              <Td
                isNumeric
                fontSize="sm"
                fontWeight="medium"
                border="none"
                py="2"
              >
                2,000.00
              </Td>
            </Tr>
            <Tr>
              <Td fontSize="sm" color="gray.700" border="none" py="2">
                ค่าวิชาชีพ
              </Td>
              <Td
                isNumeric
                fontSize="sm"
                fontWeight="medium"
                border="none"
                py="2"
              >
                5,000.00
              </Td>
            </Tr>
            <Tr>
              <Td fontSize="sm" color="gray.700" border="none" py="2">
                OT ปกติ (5 ชม. x 187.50)
              </Td>
              <Td
                isNumeric
                fontSize="sm"
                fontWeight="medium"
                border="none"
                py="2"
              >
                937.50
              </Td>
            </Tr>
            <Tr>
              <Td fontSize="sm" color="gray.700" border="none" py="2">
                OT วันหยุด (4 ชม. x 375.00)
              </Td>
              <Td
                isNumeric
                fontSize="sm"
                fontWeight="medium"
                border="none"
                py="2"
              >
                1,500.00
              </Td>
            </Tr>
          </Tbody>
        </Table>
        <Divider my="2" />
        <Flex justify="space-between" px="4" py="2">
          <Text fontSize="sm" fontWeight="bold" color="green.700">
            รวมรายได้
          </Text>
          <Text fontSize="sm" fontWeight="bold" color="green.700">
            42,437.50
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
          textTransform="uppercase"
          letterSpacing="wide"
        >
          รายการหัก (Deductions)
        </Text>
        <Table variant="simple" size="sm">
          <Tbody>
            <Tr>
              <Td fontSize="sm" color="gray.700" border="none" py="2">
                ภาษีเงินได้ (Tax)
              </Td>
              <Td
                isNumeric
                fontSize="sm"
                fontWeight="medium"
                border="none"
                py="2"
              >
                1,200.00
              </Td>
            </Tr>
            <Tr>
              <Td fontSize="sm" color="gray.700" border="none" py="2">
                ประกันสังคม (SSC)
              </Td>
              <Td
                isNumeric
                fontSize="sm"
                fontWeight="medium"
                border="none"
                py="2"
              >
                750.00
              </Td>
            </Tr>
            <Tr>
              <Td fontSize="sm" color="gray.700" border="none" py="2">
                กองทุนสำรองเลี้ยงชีพ (PVD 3%)
              </Td>
              <Td
                isNumeric
                fontSize="sm"
                fontWeight="medium"
                border="none"
                py="2"
              >
                1,200.00
              </Td>
            </Tr>
            <Tr>
              <Td fontSize="sm" color="gray.700" border="none" py="2">
                หักสาย
              </Td>
              <Td
                isNumeric
                fontSize="sm"
                fontWeight="medium"
                border="none"
                py="2"
              >
                0.00
              </Td>
            </Tr>
            <Tr>
              <Td fontSize="sm" color="gray.700" border="none" py="2">
                เงินกู้ / อื่นๆ
              </Td>
              <Td
                isNumeric
                fontSize="sm"
                fontWeight="medium"
                border="none"
                py="2"
              >
                0.00
              </Td>
            </Tr>
          </Tbody>
        </Table>
        <Divider my="2" />
        <Flex justify="space-between" px="4" py="2">
          <Text fontSize="sm" fontWeight="bold" color="red.600">
            รวมรายการหัก
          </Text>
          <Text fontSize="sm" fontWeight="bold" color="red.600">
            3,150.00
          </Text>
        </Flex>
      </Box>
    </Flex>

    {/* Net Pay */}
    <Box bg="brand.50" p="6" borderTopWidth="1px" borderColor="gray.200">
      <Flex justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="bold" color="brand.900">
          ยอดสุทธิ (Net Pay)
        </Text>
        <Text fontSize="3xl" fontWeight="bold" color="brand.700">
          ฿39,287.50
        </Text>
      </Flex>
      <Text fontSize="xs" color="gray.500" mt="1">
        โอนเข้าบัญชี: ธ.กสิกรไทย xxx-x-xx456-x
      </Text>
    </Box>
  </Box>
);

const Payslip = () => {
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
            ดูและพิมพ์ใบจ่ายเงินเดือนรายบุคคล
          </Text>
        </Box>
        <HStack spacing="3">
          <Button
            variant="outline"
            leftIcon={<Download size="16" />}
            borderRadius="lg"
            size="sm"
            borderColor="gray.200"
          >
            ดาวน์โหลด PDF
          </Button>
          <Button
            variant="outline"
            leftIcon={<Printer size="16" />}
            borderRadius="lg"
            size="sm"
            borderColor="gray.200"
          >
            พิมพ์
          </Button>
        </HStack>
      </Flex>

      {/* Filters */}
      <Flex gap="4" mb="6" flexWrap="wrap">
        <Select
          maxW="250px"
          bg="white"
          borderRadius="lg"
          defaultValue="EMP-001"
          size="sm"
          boxShadow="sm"
        >
          <option value="EMP-001">EMP-001 สมชาย ใจดี</option>
          <option value="EMP-012">EMP-012 วิภาวี รักงาน</option>
          <option value="EMP-018">EMP-018 นพพล มุ่งมั่น</option>
          <option value="EMP-025">EMP-025 อาทิตย์ สว่าง</option>
        </Select>
        <Select
          maxW="220px"
          bg="white"
          borderRadius="lg"
          defaultValue="02-2024"
          size="sm"
          boxShadow="sm"
        >
          <option value="02-2024">กุมภาพันธ์ 2024</option>
          <option value="01-2024">มกราคม 2024</option>
          <option value="12-2023">ธันวาคม 2023</option>
        </Select>
      </Flex>

      <PayslipDetail />
    </Box>
  );
};

export default Payslip;
