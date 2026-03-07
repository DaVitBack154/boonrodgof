import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Text,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Heading,
  Progress,
  Divider,
} from "@chakra-ui/react";
import {
  Users,
  DollarSign,
  CalendarCheck,
  TrendingUp,
  Clock,
  UserMinus,
  AlertTriangle,
} from "lucide-react";

const StatCard = ({
  title,
  stat,
  helpText,
  type,
  colorTheme = "blue",
  icon,
}) => (
  <Box
    p="5"
    bg="white"
    borderRadius="2xl"
    boxShadow="sm"
    borderWidth="1px"
    borderColor="gray.100"
    transition="all 0.2s"
    _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
  >
    <Flex justifyContent="space-between" alignItems="flex-start">
      <Stat>
        <StatLabel fontSize="xs" color="gray.500" fontWeight="semibold">
          {title}
        </StatLabel>
        <StatNumber fontSize="2xl" fontWeight="bold" color="gray.800" mt="1">
          {stat}
        </StatNumber>
        {helpText && (
          <StatHelpText
            mt="2"
            fontSize="xs"
            fontWeight="medium"
            mb="0"
            color="gray.500"
          >
            <StatArrow type={type} />
            {helpText}
          </StatHelpText>
        )}
      </Stat>
      <Flex
        bg={`${colorTheme}.50`}
        p="3"
        borderRadius="xl"
        alignItems="center"
        justifyContent="center"
        h="12"
        w="12"
      >
        <Icon as={icon} size="20px" color={`${colorTheme}.500`} />
      </Flex>
    </Flex>
  </Box>
);

const Dashboard = () => {
  return (
    <Box>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb="8"
        flexWrap="wrap"
        gap="4"
      >
        <Box>
          <Heading size="lg" color="gray.800" mb="1" fontWeight="bold">
            Dashboard
          </Heading>
          <Text color="gray.500" fontSize="sm">
            ภาพรวมระบบบุคลากรและเงินเดือน BOONROD GOLF TOTAL
          </Text>
        </Box>
        <Badge
          bg="brand.50"
          color="brand.700"
          px="4"
          py="2"
          borderRadius="full"
          fontSize="sm"
          fontWeight="semibold"
        >
          เดือน กุมภาพันธ์ 2024
        </Badge>
      </Flex>

      {/* Stats */}
      <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} spacing="4" mb="8">
        <StatCard
          title="พนักงานทั้งหมด"
          stat="48"
          helpText="+2 จากเดือนก่อน"
          type="increase"
          colorTheme="blue"
          icon={Users}
        />
        <StatCard
          title="มาทำงานวันนี้"
          stat="43"
          helpText="89.6%"
          type="increase"
          colorTheme="green"
          icon={CalendarCheck}
        />
        <StatCard title="ลางาน" stat="3" colorTheme="orange" icon={UserMinus} />
        <StatCard
          title="มาสาย"
          stat="2"
          colorTheme="red"
          icon={AlertTriangle}
        />
        <StatCard
          title="ชั่วโมง OT รวม"
          stat="128"
          helpText="+15% จากเดือนก่อน"
          type="increase"
          colorTheme="purple"
          icon={Clock}
        />
        <StatCard
          title="ยอดเงินเดือนรวม"
          stat="฿1.24M"
          helpText="+5%"
          type="increase"
          colorTheme="cyan"
          icon={DollarSign}
        />
      </SimpleGrid>

      {/* Two columns: Recent Payroll + Leave Summary */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="6">
        {/* Recent Payroll */}
        <Box
          p="5"
          bg="white"
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
        >
          <Text fontSize="md" fontWeight="bold" color="gray.800" mb="4">
            รายการเงินเดือนล่าสุด
          </Text>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th py="3" color="gray.500" fontSize="xs">
                    ชื่อ
                  </Th>
                  <Th py="3" color="gray.500" fontSize="xs">
                    แผนก
                  </Th>
                  <Th py="3" color="gray.500" fontSize="xs" isNumeric>
                    ยอดสุทธิ
                  </Th>
                  <Th py="3" color="gray.500" fontSize="xs" textAlign="center">
                    สถานะ
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {[
                  {
                    name: "สมชาย ใจดี",
                    dept: "ผู้ฝึกสอน",
                    net: "฿39,287",
                    status: "โอนแล้ว",
                  },
                  {
                    name: "วิภาวี รักงาน",
                    dept: "ธุรการ",
                    net: "฿16,595",
                    status: "โอนแล้ว",
                  },
                  {
                    name: "นพพล มุ่งมั่น",
                    dept: "การตลาด",
                    net: "฿23,002",
                    status: "รอตรวจสอบ",
                  },
                  {
                    name: "อาทิตย์ สว่าง",
                    dept: "ผู้ช่วย",
                    net: "฿17,612",
                    status: "โอนแล้ว",
                  },
                ].map((r, i) => (
                  <Tr key={i} _hover={{ bg: "gray.50" }}>
                    <Td
                      py="3"
                      fontWeight="semibold"
                      color="gray.800"
                      fontSize="sm"
                    >
                      {r.name}
                    </Td>
                    <Td py="3" color="gray.600" fontSize="sm">
                      {r.dept}
                    </Td>
                    <Td py="3" isNumeric fontWeight="medium" fontSize="sm">
                      {r.net}
                    </Td>
                    <Td py="3" textAlign="center">
                      <Badge
                        colorScheme={
                          r.status === "โอนแล้ว" ? "green" : "yellow"
                        }
                        variant="subtle"
                        borderRadius="full"
                        px="2"
                        fontSize="xs"
                      >
                        {r.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Leave Summary */}
        <Box
          p="5"
          bg="white"
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
        >
          <Text fontSize="md" fontWeight="bold" color="gray.800" mb="4">
            สรุปการลาประจำเดือน
          </Text>
          {[
            { type: "ลาป่วย", count: 5, color: "red" },
            { type: "ลาพักร้อน", count: 8, color: "blue" },
            { type: "ลากิจ", count: 2, color: "orange" },
          ].map((l, i) => (
            <Box key={i} mb="4">
              <Flex justify="space-between" mb="1">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  {l.type}
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="gray.800">
                  {l.count} วัน
                </Text>
              </Flex>
              <Progress
                value={l.count * 5}
                size="sm"
                colorScheme={l.color}
                borderRadius="full"
                bg="gray.100"
              />
            </Box>
          ))}

          <Divider my="4" />

          <Text fontSize="sm" fontWeight="bold" color="gray.700" mb="3">
            รอการอนุมัติ
          </Text>
          {[{ name: "วิภาวี รักงาน", type: "ลากิจ", days: "1 วัน" }].map(
            (r, i) => (
              <Flex
                key={i}
                justify="space-between"
                align="center"
                p="3"
                bg="yellow.50"
                borderRadius="lg"
                mb="2"
              >
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                    {r.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {r.type} - {r.days}
                  </Text>
                </Box>
                <Badge
                  colorScheme="yellow"
                  variant="subtle"
                  borderRadius="full"
                  px="2"
                  fontSize="xs"
                >
                  รออนุมัติ
                </Badge>
              </Flex>
            ),
          )}
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;
