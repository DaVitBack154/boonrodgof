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
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  Progress,
} from "@chakra-ui/react";
import { Plus, CheckCircle, XCircle, Clock } from "lucide-react";

const Leave = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const leaveBalances = [
    { type: "ลาป่วย", total: 30, used: 3, color: "red" },
    { type: "ลากิจ", total: 5, used: 1, color: "orange" },
    { type: "ลาพักร้อน", total: 10, used: 4, color: "blue" },
    { type: "ลาคลอด", total: 90, used: 0, color: "pink" },
  ];

  const requests = [
    {
      id: "LV-001",
      emp: "สมชาย ใจดี",
      type: "ลาป่วย",
      from: "07/02/2024",
      to: "07/02/2024",
      days: 1,
      reason: "ไม่สบาย เป็นไข้",
      status: "อนุมัติ",
      approver: "ผจก.สาขา",
    },
    {
      id: "LV-002",
      emp: "นพพล มุ่งมั่น",
      type: "ลาพักร้อน",
      from: "15/02/2024",
      to: "16/02/2024",
      days: 2,
      reason: "ธุระส่วนตัว",
      status: "อนุมัติ",
      approver: "ผจก.สาขา",
    },
    {
      id: "LV-003",
      emp: "วิภาวี รักงาน",
      type: "ลากิจ",
      from: "20/02/2024",
      to: "20/02/2024",
      days: 1,
      reason: "พาบุตรไปพบแพทย์",
      status: "รออนุมัติ",
      approver: "-",
    },
    {
      id: "LV-004",
      emp: "อาทิตย์ สว่าง",
      type: "ลาพักร้อน",
      from: "25/02/2024",
      to: "28/02/2024",
      days: 4,
      reason: "ท่องเที่ยว",
      status: "ไม่อนุมัติ",
      approver: "ผจก.สาขา",
    },
  ];

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
            ระบบลางาน
          </Heading>
          <Text color="gray.500" fontSize="sm">
            ขอลางาน ตรวจสอบสิทธิ์วันลา และอนุมัติการลา
          </Text>
        </Box>
        <Button
          leftIcon={<Plus size="18" />}
          bg="brand.600"
          color="white"
          _hover={{ bg: "brand.700" }}
          borderRadius="lg"
          px="6"
          boxShadow="sm"
          onClick={onOpen}
        >
          ขอลางาน
        </Button>
      </Flex>

      {/* Leave Balances */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing="4" mb="8">
        {leaveBalances.map((lb, i) => (
          <Box
            key={i}
            p="5"
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
          >
            <Text fontSize="sm" fontWeight="bold" color="gray.700" mb="3">
              {lb.type}
            </Text>
            <Flex justify="space-between" align="baseline" mb="2">
              <Text fontSize="2xl" fontWeight="bold" color={`${lb.color}.500`}>
                {lb.total - lb.used}
              </Text>
              <Text fontSize="xs" color="gray.500">
                คงเหลือ / {lb.total} วัน
              </Text>
            </Flex>
            <Progress
              value={(lb.used / lb.total) * 100}
              size="sm"
              colorScheme={lb.color}
              borderRadius="full"
              bg="gray.100"
            />
            <Text fontSize="xs" color="gray.400" mt="1">
              ใช้ไป {lb.used} วัน
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* Leave Requests Table */}
      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        overflow="hidden"
      >
        <Box p="4" borderBottomWidth="1px" borderColor="gray.100" bg="gray.50">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap="3">
            <Text fontWeight="bold" color="gray.700" fontSize="sm">
              รายการขอลางาน
            </Text>
            <HStack>
              <Select
                size="sm"
                bg="white"
                borderRadius="lg"
                maxW="180px"
                defaultValue="all"
              >
                <option value="all">ทุกสถานะ</option>
                <option>รออนุมัติ</option>
                <option>อนุมัติ</option>
                <option>ไม่อนุมัติ</option>
              </Select>
              <Select
                size="sm"
                bg="white"
                borderRadius="lg"
                maxW="160px"
                defaultValue="all"
              >
                <option value="all">ทุกประเภท</option>
                <option>ลาป่วย</option>
                <option>ลากิจ</option>
                <option>ลาพักร้อน</option>
              </Select>
            </HStack>
          </Flex>
        </Box>
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th py="3" color="gray.500" fontSize="xs">
                  เลขที่
                </Th>
                <Th py="3" color="gray.500" fontSize="xs">
                  พนักงาน
                </Th>
                <Th py="3" color="gray.500" fontSize="xs">
                  ประเภทลา
                </Th>
                <Th py="3" color="gray.500" fontSize="xs">
                  วันที่เริ่ม
                </Th>
                <Th py="3" color="gray.500" fontSize="xs">
                  วันที่สิ้นสุด
                </Th>
                <Th py="3" color="gray.500" fontSize="xs" textAlign="center">
                  จำนวนวัน
                </Th>
                <Th py="3" color="gray.500" fontSize="xs">
                  เหตุผล
                </Th>
                <Th py="3" color="gray.500" fontSize="xs">
                  ผู้อนุมัติ
                </Th>
                <Th py="3" color="gray.500" fontSize="xs" textAlign="center">
                  สถานะ
                </Th>
                <Th py="3" color="gray.500" fontSize="xs" textAlign="center">
                  จัดการ
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {requests.map((r, i) => (
                <Tr
                  key={i}
                  _hover={{ bg: "gray.50" }}
                  transition="background 0.15s"
                >
                  <Td py="3" fontWeight="medium" color="gray.500" fontSize="sm">
                    {r.id}
                  </Td>
                  <Td
                    py="3"
                    fontWeight="semibold"
                    color="gray.800"
                    fontSize="sm"
                  >
                    {r.emp}
                  </Td>
                  <Td py="3">
                    <Badge
                      colorScheme={
                        r.type === "ลาป่วย"
                          ? "red"
                          : r.type === "ลากิจ"
                            ? "orange"
                            : "blue"
                      }
                      variant="subtle"
                      borderRadius="full"
                      px="2"
                      fontSize="xs"
                    >
                      {r.type}
                    </Badge>
                  </Td>
                  <Td py="3" color="gray.600" fontSize="sm">
                    {r.from}
                  </Td>
                  <Td py="3" color="gray.600" fontSize="sm">
                    {r.to}
                  </Td>
                  <Td
                    py="3"
                    textAlign="center"
                    fontWeight="bold"
                    color="gray.700"
                    fontSize="sm"
                  >
                    {r.days}
                  </Td>
                  <Td
                    py="3"
                    color="gray.600"
                    fontSize="sm"
                    maxW="200px"
                    isTruncated
                  >
                    {r.reason}
                  </Td>
                  <Td py="3" color="gray.600" fontSize="sm">
                    {r.approver}
                  </Td>
                  <Td py="3" textAlign="center">
                    <Badge
                      colorScheme={
                        r.status === "อนุมัติ"
                          ? "green"
                          : r.status === "รออนุมัติ"
                            ? "yellow"
                            : "red"
                      }
                      variant="subtle"
                      borderRadius="full"
                      px="2"
                      fontSize="xs"
                    >
                      {r.status}
                    </Badge>
                  </Td>
                  <Td py="3">
                    <HStack justify="center" spacing="1">
                      {r.status === "รออนุมัติ" && (
                        <>
                          <Button
                            size="xs"
                            colorScheme="green"
                            variant="ghost"
                            borderRadius="md"
                          >
                            อนุมัติ
                          </Button>
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            borderRadius="md"
                          >
                            ปฏิเสธ
                          </Button>
                        </>
                      )}
                      {r.status !== "รออนุมัติ" && (
                        <Text fontSize="xs" color="gray.400">
                          -
                        </Text>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Leave Request Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader fontWeight="bold">ขอลางาน</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={2} spacing="4">
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                  ประเภทการลา
                </FormLabel>
                <Select bg="gray.50" border="none" borderRadius="lg">
                  <option>ลาป่วย</option>
                  <option>ลากิจ</option>
                  <option>ลาพักร้อน</option>
                  <option>ลาคลอด</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                  พนักงาน
                </FormLabel>
                <Select bg="gray.50" border="none" borderRadius="lg">
                  <option>EMP-001 สมชาย ใจดี</option>
                  <option>EMP-012 วิภาวี รักงาน</option>
                  <option>EMP-018 นพพล มุ่งมั่น</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                  วันที่เริ่มลา
                </FormLabel>
                <Input
                  type="date"
                  bg="gray.50"
                  border="none"
                  borderRadius="lg"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                  วันที่สิ้นสุด
                </FormLabel>
                <Input
                  type="date"
                  bg="gray.50"
                  border="none"
                  borderRadius="lg"
                />
              </FormControl>
            </SimpleGrid>
            <FormControl mt="4">
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                เหตุผลการลา
              </FormLabel>
              <Textarea
                bg="gray.50"
                border="none"
                borderRadius="lg"
                placeholder="ระบุเหตุผล..."
                rows="3"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter gap="3">
            <Button variant="outline" onClick={onClose} borderRadius="lg">
              ยกเลิก
            </Button>
            <Button
              bg="brand.600"
              color="white"
              _hover={{ bg: "brand.700" }}
              borderRadius="lg"
              px="8"
            >
              ส่งคำขอ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Leave;
