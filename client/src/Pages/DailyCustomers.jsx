import {
  Box,
  Flex,
  Heading,
  Text,
  Center,
  Spinner as ChakraSpinner,
  Avatar,
  Badge,
} from "@chakra-ui/react";
import {
  Table,
  Tag,
  Input,
  DatePicker,
  Modal,
  Timeline,
  Empty,
  Typography,
  Dropdown,
  message,
  Segmented,
  ConfigProvider,
  Button,
} from "antd";
import {
  Calendar,
  Search,
  Clock,
  User,
  UserCheck,
  MoreVertical,
  Edit,
  Download,
} from "lucide-react";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import {
  getDailySchedule,
  getSchedule,
  getScheduleRange,
  getStudentCourseHistory,
  updateLesson,
} from "../services/api";
import { FaUser } from "react-icons/fa";

const { Title, Text: AntText } = Typography;

// ตั้งค่า locale ภาษาไทยให้ dayjs
dayjs.locale("th");

const STATUS_COLORS = {
  active: "#eab308", // Yellow/Orange
  completed: "#22c55e", // Green
  no_show: "#ef4444", // Red
  cancelled: "#94a3b8", // Gray
  test: "#3b82f6", // Blue (จองคลาส)
};

const STATUS_LABELS = {
  active: "รอคอนเฟิร์ม",
  completed: "มาเรียนแล้ว",
  no_show: "ไม่มาเรียน (หักชั่วโมง)",
  cancelled: "ยกเลิกคลาส",
  test: "ทดลองเรียน",
};

const getLessonCustomerName = (lesson) =>
  lesson.studentCourse?.studentName ||
  lesson.testCustomerName ||
  (lesson.status === "test" ? "Test Customer" : "N/A");

const isStandaloneLesson = (lesson) => !lesson.studentCourse;

const getLessonCountLabel = (lesson) => {
  if (lesson.studentCourse?.totalLessons) {
    return `${lesson.lessonNumber} / ${lesson.studentCourse.totalLessons}`;
  }

  return `${lesson.lessonNumber || 1}`;
};

const StatusBadge = ({ status }) => {
  const color = STATUS_COLORS[status] || "#94a3b8";
  const label = STATUS_LABELS[status] || status;

  return (
    <Flex align="center" gap="2">
      <Box w="8px" h="8px" borderRadius="full" bg={color} flexShrink={0} />
      <Text fontSize="13px" color="gray.600" whiteSpace="nowrap">
        {label}
      </Text>
    </Flex>
  );
};

const DailyCustomers = () => {
  const [viewMode, setViewMode] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseHistory, setCourseHistory] = useState([]);

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportRange, setExportRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [isExporting, setIsExporting] = useState(false);

  const fetchData = async (date, mode = viewMode) => {
    setLoading(true);
    try {
      let res;
      if (mode === "daily") {
        res = await getDailySchedule(date.format("YYYY-MM-DD"));
      } else if (mode === "monthly") {
        res = await getSchedule(date.format("YYYY-MM"));
      }

      // แปลงข้อมูลให้เข้ากับ AntD Table
      const formattedData = (res.lessons || []).map((lesson) => ({
        key: lesson._id,
        lesson: lesson,
        date: dayjs(lesson.lessonDate).format("DD MMM YYYY"),
        time: dayjs(lesson.lessonDate).format("HH:mm"),
        customerName: getLessonCustomerName(lesson),
        coachName: lesson.coach
          ? `${lesson.coach.firstNameTh} (${lesson.coach.nickname || ""})`
          : "N/A",
        lessonNumber: lesson.lessonNumber,
        totalLessons: lesson.studentCourse?.totalLessons || null,
        lessonCountLabel: getLessonCountLabel(lesson),
        isStandaloneLesson: isStandaloneLesson(lesson),
        status: lesson.status,
        courseId: lesson.studentCourse?._id,
      }));

      setData(formattedData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(selectedDate, viewMode);
  }, [selectedDate, viewMode]);

  const handleRowClick = async (record) => {
    if (!record.courseId) return;
    setIsModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await getStudentCourseHistory(record.courseId);
      setSelectedCourse(res.course);
      setCourseHistory(res.lessons || []);
    } catch (err) {
      console.error(err);
    }
    setHistoryLoading(false);
  };

  // กรองข้อมูล และ เรียงลำดับตามวันที่ล่าสุดอยู่บนสุด
  const filteredData = data
    .filter(
      (item) =>
        item.status !== "legacy" &&
        (item.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
          item.coachName.toLowerCase().includes(searchText.toLowerCase())),
    )
    .sort(
      (a, b) =>
        dayjs(b.lesson.lessonDate).unix() - dayjs(a.lesson.lessonDate).unix(),
    );

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await getScheduleRange(
        exportRange[0].format("YYYY-MM-DD"),
        exportRange[1].format("YYYY-MM-DD"),
      );

      const lessons = res.lessons || [];
      if (lessons.length === 0) {
        message.warning("ไม่มีข้อมูลนัดเรียนในช่วงวันที่เลือก");
        setIsExporting(false);
        return;
      }

      let csvContent = "\uFEFF";
      csvContent +=
        "วันที่,เวลา,ลูกค้า (ผู้เรียน),โค้ชผู้สอน,ครั้งที่เรียน,สถานะ\n";

      lessons.forEach((lesson) => {
        let rowData = [];
        rowData.push(`"${dayjs(lesson.lessonDate).format("DD MMM YYYY")}"`);
        rowData.push(`"${dayjs(lesson.lessonDate).format("HH:mm")} น."`);

        const custName = getLessonCustomerName(lesson);
        rowData.push(`"${custName}"`);

        const coachName = lesson.coach
          ? `${lesson.coach.firstNameTh} (${lesson.coach.nickname || ""})`
          : "N/A";
        rowData.push(`"${coachName}"`);

        const lessonNum = getLessonCountLabel(lesson);
        rowData.push(`"ครั้งที่ ${lessonNum}"`);

        const statusText = STATUS_LABELS[lesson.status] || lesson.status;
        rowData.push(`"${statusText}"`);

        csvContent += rowData.join(",") + "\n";
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      const fileName = `Report_Export_${exportRange[0].format("YYYYMMDD")}_to_${exportRange[1].format("YYYYMMDD")}.csv`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExportModalOpen(false);
      message.success("ส่งออกข้อมูลสำเร็จ");
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลเพื่อส่งออก");
    }
    setIsExporting(false);
  };

  const handleStatusChange = async (record, newStatus, e) => {
    if (e) e.domEvent.stopPropagation();
    try {
      setLoading(true);
      await updateLesson(record.courseId, record.key, { status: newStatus });
      message.success(`อัปเดตสถานะเป็น "${STATUS_LABELS[newStatus]}" สำเร็จ`);
      fetchData(selectedDate, viewMode); // refresh data
    } catch (err) {
      console.error(err);
      message.error("อัปเดตสถานะไม่สำเร็จ");
      setLoading(false);
    }
  };

  const getStatusMenu = (record) => {
    const items = [
      { key: "active", label: "รอคอนเฟิร์ม" },
      { key: "test", label: "ทดลองเรียน" },
      { key: "completed", label: "มาเรียนแล้ว" },
      { key: "no_show", label: "ไม่มาเรียน (หักชั่วโมง)" },
      { key: "cancelled", label: "ยกเลิกคลาส" },
    ];
    return {
      items,
      onClick: (e) => handleStatusChange(record, e.key, e),
    };
  };

  const columns = [
    ...(viewMode === "monthly"
      ? [
          {
            title: "วันที่",
            dataIndex: "date",
            key: "date",
            width: 110,
            render: (text) => (
              <Flex align="center" gap="2">
                <Calendar size="14" />
                <Text fontSize="13px">{text}</Text>
              </Flex>
            ),
          },
        ]
      : []),
    {
      title: "เวลา",
      dataIndex: "time",
      key: "time",
      width: 100,
      render: (text) => (
        <Flex align="center" gap="2" noWrap>
          <Clock size="13" />
          <Text fontSize="13px">{text} น.</Text>
        </Flex>
      ),
    },
    {
      title: "ชื่อลูกค้า",
      dataIndex: "customerName",
      key: "customerName",
      width: 150,
      render: (text) => (
        <Flex align="center" gap="2">
          <Text fontSize="13px">{text}</Text>
        </Flex>
      ),
    },
    {
      title: "โค้ชผู้สอน",
      dataIndex: "coachName",
      key: "coachName",
      width: 140,
      render: (text) => (
        <Flex align="center" gap="2">
          <Text fontSize="13px">{text}</Text>
        </Flex>
      ),
    },
    {
      title: "ครั้งที่เรียน",
      key: "lessonNumber",
      width: 100,
      render: (_, record) => {
        if (record.isStandaloneLesson) {
          return (
            <Text color="gray.600" fontSize="13px">
              ครั้งที่ {record.lessonCountLabel}
            </Text>
          );
        }
        return (
          <Text color="gray.600" fontSize="13px">
            ครั้งที่ {record.lessonNumber}{" "}
            <Text as="span" color="gray.400">
              / {record.totalLessons}
            </Text>
          </Text>
        );
      },
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => <StatusBadge status={status} />,
    },
    // {
    //   title: "จัดการ",
    //   key: "action",
    //   width: 100,
    //   render: (_, record) => (
    //     <Dropdown menu={getStatusMenu(record)} trigger={["click"]}>
    //       <Box
    //         as="button"
    //         onClick={(e) => e.stopPropagation()}
    //         p="2"
    //         borderRadius="md"
    //         _hover={{ bg: "gray.100" }}
    //       >
    //         <Flex align="center" gap="1" color="blue.500" fontSize="sm">
    //           <Edit size="14" />
    //           <Text>อัปเดต</Text>
    //         </Flex>
    //       </Box>
    //     </Dropdown>
    //   ),
    // },
  ];

  return (
    <Box>
      {/* Header */}
      {/* <Flex
        justify="space-between"
        align="center"
        mb="6"
        flexWrap="wrap"
        gap="4"
      >
        <Box>
          <Heading size="lg" color="gray.800" mb="1">
            👥 Daily Customer
          </Heading>
          <Text color="gray.500" fontSize="sm">
            รายชื่อลูกค้าที่เข้าเรียนในแต่ละวัน
            คลิกที่ชื่อเพื่อดูประวัติการเรียนแบบละเอียด
          </Text>
        </Box>
      </Flex> */}

      {/* Toolbar */}
      <Box
        bg="white"
        p="4"
        borderRadius="xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        mb="5"
      >
        <Flex gap="4" flexWrap="wrap" align="flex-end">
          <Box flex="1" minW="200px">
            <Text
              fontSize="xs"
              fontWeight="bold"
              color="gray.500"
              mb="1"
              textTransform="uppercase"
            >
              ค้นหาลูกค้า / โค้ช
            </Text>
            <Input
              placeholder="พิมพ์ชื่อเพื่อค้นหา..."
              prefix={<Search size={16} color="#CBD5E0" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
            />
          </Box>
          <Box>
            <Text
              fontSize="xs"
              fontWeight="bold"
              color="gray.500"
              mb="1"
              textTransform="uppercase"
            >
              มุมมอง
            </Text>
            <Segmented
              options={[
                { label: "รายวัน", value: "daily" },
                { label: "รายเดือน", value: "monthly" },
              ]}
              value={viewMode}
              onChange={(val) => setViewMode(val)}
              size="large"
            />
          </Box>
          <Box>
            <Text
              fontSize="xs"
              fontWeight="bold"
              color="gray.500"
              mb="1"
              textTransform="uppercase"
            >
              {viewMode === "daily" ? "เลือกวันที่" : "เลือกเดือน"}
            </Text>
            <DatePicker
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              format={viewMode === "daily" ? "DD MMMM YYYY" : "MMMM YYYY"}
              picker={viewMode === "daily" ? "date" : "month"}
              size="large"
              allowClear={false}
              style={{ width: "250px" }}
            />
          </Box>
          <Box>
            <Button
              type="primary"
              icon={<Download size={18} />}
              size="large"
              onClick={() => setIsExportModalOpen(true)}
              style={{
                backgroundColor: "#021841",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Export CSV
            </Button>
          </Box>
        </Flex>
      </Box>

      {/* Main Table */}
      <Box
        bg="white"
        borderRadius="xl"
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
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            pagination={{
              pageSize: 20,
              showSizeChanger: false,
              className: "custom-pagination",
            }}
            rowClassName={() =>
              "cursor-pointer hover:bg-blue-50 transition-colors"
            }
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
            locale={{
              emptyText: <Empty description="ไม่พบลูกค้านัดเรียนในวันนี้" />,
            }}
            bordered
            size="small"
            scroll={{ x: "max-content" }}
          />
        </ConfigProvider>
      </Box>

      {/* History Modal */}
      <Modal
        title={null}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        {historyLoading ? (
          <Center py="20">
            <ChakraSpinner size="xl" color="blue.500" />
          </Center>
        ) : selectedCourse ? (
          <Box pt="4">
            <Flex
              align="center"
              gap="3"
              mb="6"
              pb="4"
              borderBottom="1px solid"
              borderColor="gray.100"
            >
              <Box p="3" bg="blue.50" borderRadius="full" color="blue.500">
                <FaUser size="24" />
              </Box>
              <Box>
                <Title level={4} style={{ margin: 0 }}>
                  {selectedCourse.studentName}
                </Title>
                <AntText type="secondary">
                  คอร์ส {selectedCourse.totalLessons} ครั้ง (เรียนไปแล้ว{" "}
                  {selectedCourse.lessonsCompleted} ครั้ง)
                </AntText>
              </Box>
            </Flex>

            <Box maxH="65vh" overflowY="auto" className="custom-scrollbar">
              <Table
                dataSource={[...courseHistory].sort(
                  (a, b) => (b.lessonNumber || 0) - (a.lessonNumber || 0),
                )}
                pagination={false}
                scroll={{ x: "max-content" }}
                columns={[
                  {
                    title: "ครั้งที่",
                    dataIndex: "lessonNumber",
                    key: "lessonNumber",
                    width: 70,
                    render: (num) => (
                      <Text fontWeight="bold" color="blue.500" fontSize="13px">
                        #{num}
                      </Text>
                    ),
                  },
                  {
                    title: "วันที่เรียน",
                    dataIndex: "lessonDate",
                    key: "lessonDate",
                    width: 160,
                    render: (date) => (
                      <Flex align="center" gap="2" color="gray.600">
                        <Clock size="14" />
                        <Text fontSize="13px">
                          {dayjs(date).format("DD/MM/YY HH:mm")}
                        </Text>
                      </Flex>
                    ),
                  },
                  {
                    title: "เทรนเนอร์",
                    dataIndex: "coach",
                    key: "coach",
                    width: 130,
                    render: (coach) => (
                      <Flex align="center" gap="2">
                        {coach ? (
                          <Box>
                            <Text fontSize="13px" fontWeight="medium">
                              {coach.firstNameTh}
                            </Text>
                            <Text fontSize="11px" color="gray.400">
                              ({coach.nickname || "โปร"})
                            </Text>
                          </Box>
                        ) : (
                          <Text color="gray.400">-</Text>
                        )}
                      </Flex>
                    ),
                  },
                  {
                    title: "สถานะ",
                    dataIndex: "status",
                    key: "status",
                    width: 130,
                    render: (status) => {
                      const colors = {
                        completed: { bg: "green.50", text: "green.600" },
                        active: { bg: "orange.50", text: "orange.600" },
                        no_show: { bg: "red.50", text: "red.600" },
                      };
                      const style = colors[status] || {
                        bg: "gray.50",
                        text: "gray.600",
                      };
                      return (
                        <Badge
                          px="3"
                          py="1"
                          borderRadius="full"
                          bg={style.bg}
                          color={style.text}
                          fontSize="11px"
                          variant="subtle"
                          textTransform="none"
                        >
                          {STATUS_LABELS[status] || "ข้อมูลก่อนเข้าระบบ"}
                        </Badge>
                      );
                    },
                  },
                ]}
              />
              {courseHistory.length === 0 && (
                <Empty description="ไม่มีประวัติการเรียน" />
              )}
            </Box>
          </Box>
        ) : null}
      </Modal>

      {/* Export CSV Range Selection Modal */}
      <Modal
        title={
          <Flex align="center" gap="2">
            <Download size="18" className="text-emerald-500" />
            <Text>ส่งออกข้อมูลรายงาน CSV</Text>
          </Flex>
        }
        open={isExportModalOpen}
        onCancel={() => !isExporting && setIsExportModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsExportModalOpen(false)}
            disabled={isExporting}
          >
            ยกเลิก
          </Button>,
          <Button
            key="export"
            type="primary"
            style={{ backgroundColor: "#021841" }}
            onClick={handleExport}
            loading={isExporting}
          >
            ส่งออกไฟล์ CSV
          </Button>,
        ]}
      >
        <Box py="6">
          <Text mb="2" fontWeight="medium">
            กรุณาเลือกช่วงวันที่ต้องการส่งออก:
          </Text>
          <DatePicker.RangePicker
            value={exportRange}
            onChange={(dates) => dates && setExportRange(dates)}
            format="DD MMMM YYYY"
            size="large"
            style={{ width: "100%" }}
            allowClear={false}
          />
        </Box>
      </Modal>

      <style>{`
        .cursor-pointer { cursor: pointer; }
        .hover\\:bg-blue-50:hover > td { background-color: #f8fafc !important; }
        .transition-colors { transition: all 0.2s ease; }
        
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a0aec0; }
        
     
        .ant-table-wrapper .ant-table-tbody > tr > td {
          font-size: 13px;
        }
        .ant-table-wrapper .ant-table-thead > tr > th {
          font-size: 13px;
          letter-spacing: 0.5px;
        }
        .ant-table-wrapper .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
        
        /* Custom Pagination */
        .custom-pagination {
          padding: 16px !important;
          margin: 0 !important;
          border-top: 1px solid #f1f5f9;
          justify-content: flex-end;
        }
      `}</style>
    </Box>
  );
};

export default DailyCustomers;
