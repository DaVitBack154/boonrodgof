import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Avatar,
  Center,
  Spinner,
  Select,
  Badge,
} from "@chakra-ui/react";
import { Table, Modal, Empty, ConfigProvider, Button } from "antd";
import { useState, useEffect } from "react";
import { getCommissionSummary, getCommissionDetails } from "../services/api";
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

const MonthlyCommission = () => {
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [data, setData] = useState({ coaches: [], summary: {} });
  const [loading, setLoading] = useState(false);

  // Detail modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [details, setDetails] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Uncounted (after 25th) modal - Admin only
  const [isUncountedOpen, setIsUncountedOpen] = useState(false);
  const [uncountedDetails, setUncountedDetails] = useState([]);
  const [uncountedLoading, setUncountedLoading] = useState(false);

  // Auth User
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const fetchData = async () => {
    setLoading(true);
    try {
      const coachId = isAdmin ? undefined : user._id;
      const res = await getCommissionSummary(period, coachId);
      setData(res);
    } catch (err) {
      console.error(err);
      setData({ coaches: [], summary: {} });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const handleCoachClick = async (coachItem) => {
    setSelectedCoach(coachItem.coach);
    setIsModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await getCommissionDetails(coachItem.coach._id, period);
      setDetails(res);
    } catch (err) {
      console.error(err);
      setDetails([]);
    }
    setDetailLoading(false);
  };

  // Month options (last 12 months)
  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${THAI_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    monthOptions.push({ value: val, label });
  }

  const totalCom = details.reduce((sum, item) => {
    const lessonRate =
      item.commissionRate != null
        ? item.commissionRate
        : item.studentCourse?.commissionRate || 0;
    const perLessonRate = item.studentCourse?.perLessonRate || 0;
    return sum + Math.round(((perLessonRate * lessonRate) / 100) * 100) / 100;
  }, 0);

  // Period label showing 25-25 range
  const periodLabel = (() => {
    const [y, m] = period.split("-");
    const prevMonth = parseInt(m) - 1 === 0 ? 12 : parseInt(m) - 1;
    const prevYear = parseInt(m) - 1 === 0 ? parseInt(y) - 1 : parseInt(y);
    return `25 ${THAI_MONTHS[prevMonth - 1].slice(0, 3)} ${prevYear} - 25 ${THAI_MONTHS[parseInt(m) - 1].slice(0, 3)} ${y}`;
  })();

  // Fetch uncounted lessons (after 25th of current month)
  const fetchUncounted = async () => {
    setUncountedLoading(true);
    try {
      const [y, m] = period.split("-");
      // After 25th of current month to end of month
      const afterDate = new Date(y, parseInt(m) - 1, 25);
      afterDate.setHours(23, 59, 59, 999);
      const endOfMonth = new Date(y, parseInt(m), 0, 23, 59, 59, 999);

      // Use commission-details with a special uncounted period
      // We'll use a custom API call
      const res = await getCommissionSummary(`${y}-${m}-uncounted`);
      setUncountedDetails(res.coaches || []);
    } catch (err) {
      console.error(err);
      setUncountedDetails([]);
    }
    setUncountedLoading(false);
  };

  // ===== Ant Design Table Columns =====
  const mainColumns = [
    {
      title: "โค้ช",
      dataIndex: "coach",
      key: "coach",
      render: (coach) => (
        <Flex align="center" gap="3">
          <Avatar
            size="sm"
            name={`${coach.firstNameTh} ${coach.lastNameTh}`}
            bg="#021841"
            color="white"
          />
          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.800">
              {coach.firstNameTh} {coach.lastNameTh}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {coach.nickname ? `(${coach.nickname})` : ""}
            </Text>
          </Box>
        </Flex>
      ),
    },
    {
      title: "ตำแหน่ง",
      dataIndex: ["coach", "position"],
      key: "position",
      render: (position, record) => (
        <Badge
          bg={"#021841"}
          color={"white"}
          variant="subtle"
          borderRadius="full"
          px="2"
          fontSize="xs"
        >
          {position}
        </Badge>
      ),
    },
    {
      title: "สาขา",
      dataIndex: "coach",
      key: "branch",
      width: 400,
      render: (coach) => (
        <Text fontSize="sm" color="gray.600">
          {Array.isArray(coach.branch)
            ? coach.branch
                .map((b) => b?.name)
                .filter(Boolean)
                .join(", ")
            : coach.branch?.name || "-"}
        </Text>
      ),
    },
    {
      title: "สอน (ครั้ง)",
      dataIndex: "lessonsCount",
      key: "lessonsCount",
      align: "right",
      render: (val) => (
        <Text fontWeight="semibold" color="gray.700">
          {val}
        </Text>
      ),
    },
    {
      title: "ค่าคอมรวม (฿)",
      dataIndex: "totalCommission",
      key: "totalCommission",
      align: "right",
      render: (val) => (
        <Text
          fontWeight="bold"
          fontSize="md"
          color={val > 0 ? "green.600" : "gray.400"}
        >
          {fmt(val)}
        </Text>
      ),
    },
  ];

  // ===== Detail Columns - Different for Coach vs Admin =====
  const coachDetailColumns = [
    {
      title: "วันที่/เวลา",
      dataIndex: "lessonDate",
      key: "lessonDate",
      width: 160,
      render: (val) => dayjs(val).format("DD MMM YYYY HH:mm"),
    },
    {
      title: "ลูกค้า",
      dataIndex: ["studentCourse", "studentName"],
      key: "studentName",
      render: (val) => val || "-",
    },
    {
      title: "Rate (%)",
      key: "commissionRate",
      align: "center",
      width: 100,
      render: (_, record) => {
        const rate =
          record.commissionRate != null
            ? record.commissionRate
            : record.studentCourse?.commissionRate || "-";
        return `${rate}%`;
      },
    },
    {
      title: "ค่าคอม/ครั้ง",
      key: "commissionAmount",
      align: "right",
      render: (_, record) => {
        const lessonRate =
          record.commissionRate != null
            ? record.commissionRate
            : record.studentCourse?.commissionRate || 0;
        const perLessonRate = record.studentCourse?.perLessonRate || 0;
        const amount =
          Math.round(((perLessonRate * lessonRate) / 100) * 100) / 100;
        return (
          <Text fontWeight="bold" color="green.600">
            {fmt(amount)}
          </Text>
        );
      },
    },
  ];

  const adminDetailColumns = [
    {
      title: "วันที่/เวลา",
      dataIndex: "lessonDate",
      key: "lessonDate",
      width: 160,
      render: (val) => dayjs(val).format("DD MMM YYYY HH:mm"),
    },
    {
      title: "ลูกค้า",
      dataIndex: ["studentCourse", "studentName"],
      key: "studentName",
      render: (val) => val || "-",
    },
    {
      title: "ครั้งที่",
      key: "lessonProgress",
      align: "center",
      width: 80,
      render: (_, record) => {
        const total = record.studentCourse?.totalLessons || "?";
        return `${record.lessonNumber}/${total}`;
      },
    },
    {
      title: "Rate (%)",
      key: "commissionRate",
      align: "center",
      width: 100,
      render: (_, record) => {
        const rate =
          record.commissionRate != null
            ? record.commissionRate
            : record.studentCourse?.commissionRate || "-";
        return `${rate}%`;
      },
    },
    {
      title: "สาขา",
      key: "branch",
      width: 120,
      render: (_, record) => record.branch?.name || "-",
    },
    {
      title: "บริษัท",
      key: "company",
      width: 120,
      render: (_, record) =>
        record.company || record.studentCourse?.company || "-",
    },
    {
      title: "ค่าคอม/ครั้ง",
      key: "commissionAmount",
      align: "right",
      render: (_, record) => {
        const lessonRate =
          record.commissionRate != null
            ? record.commissionRate
            : record.studentCourse?.commissionRate || 0;
        const perLessonRate = record.studentCourse?.perLessonRate || 0;
        const amount =
          Math.round(((perLessonRate * lessonRate) / 100) * 100) / 100;
        return (
          <Text fontWeight="bold" color="green.600">
            {fmt(amount)}
          </Text>
        );
      },
    },
  ];

  const detailColumns = isAdmin ? adminDetailColumns : coachDetailColumns;

  return (
    <Box>
      {/* Header */}
      {/* <Flex
        justifyContent="space-between"
        alignItems="flex-start"
        mb="8"
        flexWrap="wrap"
        gap="4"
      >
        <Box>
          <Heading size="lg" color="gray.800" mb="1" fontWeight="bold">
            💰 ค่าคอมรายเดือน
          </Heading>
          <Text color="gray.500" fontSize="sm">
            สรุปค่าคอมมิชชั่นของโค้ชแต่ละคน คลิกที่โค้ชเพื่อดูรายละเอียด
          </Text>
        </Box>
      </Flex> */}

      {/* Filter */}
      <Box
        bg="white"
        p="5"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        mb="6"
        display="flex"
        justifyContent="space-between"
      >
        <Flex>
          <Box>
            <Heading size="lg" color="gray.800" mb="1" fontWeight="bold">
              💰 ค่าคอมรายเดือน
            </Heading>
            <Text color="gray.500" fontSize="sm">
              สรุปค่าคอมมิชชั่นของโค้ชแต่ละคน คลิกที่โค้ชเพื่อดูรายละเอียด
            </Text>
          </Box>
        </Flex>
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
              งวดเดือน
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
              {data.summary.totalCoaches
                ? `โค้ชทั้งหมด ${data.summary.totalCoaches} คน | สอน ${data.summary.totalLessons} ครั้ง`
                : "ยังไม่มีข้อมูล"}
            </Text>
            <Text fontSize="xs" color="blue.500" fontWeight="semibold">
              รอบบิล: {periodLabel}
            </Text>
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
              รวมค่าคอมทั้งหมด
            </StatLabel>
            <StatNumber fontSize="2xl" color="green.600" fontWeight="bold">
              ฿{fmt(data.summary.grandTotal)}
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
          borderLeftColor="blue.400"
        >
          <Stat>
            <StatLabel fontSize="xs" color="gray.500" fontWeight="semibold">
              จำนวนโค้ช
            </StatLabel>
            <StatNumber fontSize="2xl" color="blue.600" fontWeight="bold">
              {data.summary.totalCoaches || 0} คน
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
          borderLeftColor="purple.400"
        >
          <Stat>
            <StatLabel fontSize="xs" color="gray.500" fontWeight="semibold">
              จำนวนครั้งที่สอน (completed)
            </StatLabel>
            <StatNumber fontSize="2xl" color="purple.600" fontWeight="bold">
              {data.summary.totalLessons || 0} ครั้ง
            </StatNumber>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* Coach List - Ant Design Table */}
      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        overflow="hidden"
      >
        <ConfigProvider
          theme={{
            components: {
              Table: {
                headerBg: "#f8fafc",
                headerColor: "#475569",
                headerBorderRadius: 0,
                rowHoverBg: "#f1f5f9",
                padding: 16,
                paddingContentVertical: 12,
                borderColor: "#f1f5f9",
              },
            },
          }}
        >
          <Table
            columns={mainColumns}
            dataSource={data.coaches}
            rowKey={(record) => record.coach._id}
            loading={loading}
            locale={{
              emptyText: <Empty description="ไม่มีข้อมูลโค้ชในเดือนนี้" />,
            }}
            pagination={false}
            onRow={(record) => ({
              onClick: () => handleCoachClick(record),
              style: { cursor: "pointer" },
            })}
            summary={() =>
              data.coaches.length > 0 ? (
                <Table.Summary fixed>
                  <Table.Summary.Row style={{ backgroundColor: "#f0fdf4" }}>
                    <Table.Summary.Cell index={0} colSpan={3} align="right">
                      <Text fontWeight="bold" color="gray.700">
                        รวมทั้งหมด
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                      <Text fontWeight="bold" color="gray.700">
                        {data.summary.totalLessons}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="right">
                      <Text fontWeight="bold" color="green.700" fontSize="md">
                        {fmt(data.summary.grandTotal)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              ) : null
            }
            bordered
            size="small"
          />
        </ConfigProvider>
      </Box>

      {/* Commission Detail Modal - Ant Design */}
      <Modal
        title={
          <Box>
            <Text fontWeight="bold" color="gray.800">
              รายละเอียดค่าคอมมิชชั่น
            </Text>
            <Text fontSize="sm" color="gray.500" fontWeight="normal">
              โค้ช: {selectedCoach?.firstNameTh} {selectedCoach?.lastNameTh} (
              {selectedCoach?.nickname || ""})
            </Text>
          </Box>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={900}
      >
        <ConfigProvider
          theme={{
            components: {
              Table: {
                headerBg: "#f8fafc",
                headerColor: "#475569",
                headerBorderRadius: 0,
                rowHoverBg: "#f1f5f9",
                padding: 12,
                paddingContentVertical: 10,
                borderColor: "#f1f5f9",
              },
            },
          }}
        >
          <Table
            columns={detailColumns}
            dataSource={details}
            rowKey={(record) => record._id}
            loading={detailLoading}
            locale={{
              emptyText: <Empty description="ไม่มีข้อมูลการสอนในงวดนี้" />,
            }}
            pagination={false}
            size="small"
            summary={() =>
              details.length > 0 ? (
                <Table.Summary fixed>
                  <Table.Summary.Row style={{ backgroundColor: "#f0fdf4" }}>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={isAdmin ? 6 : 3}
                      align="right"
                    >
                      <Text fontWeight="bold" color="gray.700">
                        รวมค่าคอมมิชชั่น
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="right">
                      <Text fontWeight="bold" color="green.700" fontSize="md">
                        {fmt(totalCom)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              ) : null
            }
          />
        </ConfigProvider>
      </Modal>

      {/* Uncounted Lessons Modal - Admin Only */}
      {isAdmin && (
        <>
          <Box mt="4" textAlign="right">
            <Button
              type="default"
              onClick={() => {
                setIsUncountedOpen(true);
                fetchUncounted();
              }}
            >
              📅 รายการรอบถัดไป (หลังวันที่ 25)
            </Button>
          </Box>
          <Modal
            title={
              <Box>
                <Text fontWeight="bold" color="gray.800">
                  รายการรอบถัดไป (นอกรอบบิล)
                </Text>
                <Text fontSize="sm" color="gray.500" fontWeight="normal">
                  รายการสอนหลังวันที่ 25 ที่ยังไม่ได้นับรวมในรอบบิลนี้
                  (จะไปคิดเดือนถัดไป)
                </Text>
              </Box>
            }
            open={isUncountedOpen}
            onCancel={() => setIsUncountedOpen(false)}
            footer={null}
            width={800}
          >
            <ConfigProvider
              theme={{
                components: {
                  Table: {
                    headerBg: "#fef9c3",
                    headerColor: "#854d0e",
                    headerBorderRadius: 0,
                    rowHoverBg: "#fefce8",
                    padding: 12,
                    paddingContentVertical: 10,
                    borderColor: "#fef08a",
                  },
                },
              }}
            >
              <Table
                columns={[
                  {
                    title: "โค้ช",
                    key: "coach",
                    render: (_, record) =>
                      `${record.coach?.firstNameTh || ""} ${record.coach?.lastNameTh || ""}`,
                  },
                  {
                    title: "สอน (ครั้ง)",
                    dataIndex: "lessonsCount",
                    key: "lessonsCount",
                    align: "right",
                  },
                  {
                    title: "ค่าคอมรวม (ฎ)",
                    dataIndex: "totalCommission",
                    key: "totalCommission",
                    align: "right",
                    render: (val) => (
                      <Text fontWeight="bold" color="orange.600">
                        {fmt(val)}
                      </Text>
                    ),
                  },
                ]}
                dataSource={uncountedDetails}
                rowKey={(record) => record.coach?._id}
                loading={uncountedLoading}
                locale={{
                  emptyText: <Empty description="ไม่มีรายการนอกรอบบิล" />,
                }}
                pagination={false}
                size="small"
              />
            </ConfigProvider>
          </Modal>
        </>
      )}

      <style>{`
        .ant-table-thead > tr > th {
          font-weight: 700 !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .ant-table-tbody > tr > td {
          font-size: 13px;
          border-bottom: 1px solid #f1f5f9 !important;
        }
      `}</style>
    </Box>
  );
};

export default MonthlyCommission;
