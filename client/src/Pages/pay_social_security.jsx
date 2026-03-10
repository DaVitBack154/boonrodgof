import {
  Box,
  Flex,
  Heading,
  Text,
  Select,
  Tabs,
  TabList,
  Tab,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { Download, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getPayroll } from '../services/api';

const COMPANY_OPTIONS = ['บุญรอดกอล์ฟพัฒนา', 'บุญรอดกอล์ฟโทเทิล', ''];
const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

const formatMoney = (value) =>
  (value || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const buildMonthOptions = () => {
  const options = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${THAI_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    options.push({ value, label });
  }
  return options;
};

const PaySocialSecurity = () => {
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('บุญรอดกอล์ฟพัฒนา');
  const monthOptions = useMemo(() => buildMonthOptions(), []);

  useEffect(() => {
    const fetchPayroll = async () => {
      setLoading(true);
      try {
        const data = await getPayroll(period);
        setRecords(Array.isArray(data) ? data : []);
      } catch {
        setRecords([]);
      }
      setLoading(false);
    };
    fetchPayroll();
  }, [period]);

  const tabRecords = useMemo(() => {
    if (companyFilter) {
      return records
        .filter((record) => record.company === companyFilter)
        .sort((a, b) =>
          (a.employee?.employeeId || '').localeCompare(
            b.employee?.employeeId || '',
          ),
        );
    }
    const groupedByEmployee = records.reduce((acc, record) => {
      const empId = record.employee?._id;
      if (!empId) return acc;
      if (!acc[empId]) {
        acc[empId] = {
          _id: empId,
          employee: record.employee,
          socialSecurity: Number(record.socialSecurity) || 0,
          companies: [record.company],
        };
      } else {
        acc[empId].socialSecurity += Number(record.socialSecurity) || 0;
        acc[empId].companies.push(record.company);
      }
      return acc;
    }, {});
    return Object.values(groupedByEmployee).sort((a, b) =>
      (a.employee?.employeeId || '').localeCompare(
        b.employee?.employeeId || '',
      ),
    );
  }, [records, companyFilter]);

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return tabRecords;
    const keyword = searchTerm.toLowerCase();
    return tabRecords.filter((record) => {
      const employee = record.employee || {};
      const name =
        `${employee.firstNameTh || ''} ${employee.lastNameTh || ''}`.toLowerCase();
      return (
        name.includes(keyword) ||
        (employee.nickname || '').toLowerCase().includes(keyword) ||
        (employee.employeeId || '').toLowerCase().includes(keyword) ||
        (employee.idCard || '').toLowerCase().includes(keyword)
      );
    });
  }, [tabRecords, searchTerm]);

  const summary = useMemo(() => {
    const totalSocialSecurity = tabRecords.reduce(
      (sum, record) => sum + (Number(record.socialSecurity) || 0),
      0,
    );
    const employeeCount = tabRecords.length;
    const avgDeduction =
      employeeCount > 0 ? totalSocialSecurity / employeeCount : 0;
    return { totalSocialSecurity, employeeCount, avgDeduction };
  }, [tabRecords]);

  const exportCsv = () => {
    if (filteredRecords.length === 0) return;
    let content = '\uFEFF';
    content +=
      'ลำดับ,รหัสพนักงาน,ชื่อ-นามสกุล,เลขบัตรประชาชน,บริษัท,หักประกันสังคม\n';
    filteredRecords.forEach((record, index) => {
      const employee = record.employee || {};
      const fullName =
        `${employee.firstNameTh || ''} ${employee.lastNameTh || ''}`.trim();
      const companyLabel =
        companyFilter === ''
          ? [...new Set(record.companies || [])].join(' / ')
          : record.company || companyFilter;
      const row = [
        index + 1,
        `"${employee.employeeId || '-'}"`,
        `"${fullName || '-'}"`,
        `"${employee.idCard || '-'}"`,
        `"${companyLabel || '-'}"`,
        Number(record.socialSecurity) || 0,
      ];
      content += row.join(',') + '\n';
    });
    content += `รวม,,,,,${summary.totalSocialSecurity}\n`;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const tabName = companyFilter === '' ? 'รวมทั้งหมด' : companyFilter;
    link.setAttribute(
      'download',
      `pay_social_security_${period}_${tabName}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Flex
        justify="space-between"
        align="flex-start"
        mb="6"
        gap="4"
        flexWrap="wrap"
      >
        <Box>
          <Heading size="lg" color="gray.800" mb="1" fontWeight="bold">
            รายการหักประกันสังคมประจำเดือน
          </Heading>
          <Text color="gray.500" fontSize="sm">
            สรุปจำนวนพนักงาน ยอดหักรายบุคคล และยอดรวม แยกตามบริษัท
          </Text>
        </Box>
      </Flex>

      <Tabs
        index={
          companyFilter === 'บุญรอดกอล์ฟพัฒนา'
            ? 0
            : companyFilter === 'บุญรอดกอล์ฟโทเทิล'
              ? 1
              : 2
        }
        onChange={(index) => setCompanyFilter(COMPANY_OPTIONS[index])}
        variant="enclosed"
        colorScheme="brand"
      >
        <TabList mb="-1px" borderBottomColor="gray.200">
          <Tab
            bg="gray.50"
            color="gray.500"
            _selected={{
              color: 'brand.700',
              bg: 'white',
              borderTop: '3px solid',
              borderTopColor: 'brand.600',
              borderBottomColor: 'white',
              fontWeight: 'bold',
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
              color: 'brand.700',
              bg: 'white',
              borderTop: '3px solid',
              borderTopColor: 'brand.600',
              borderBottomColor: 'white',
              fontWeight: 'bold',
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
              color: 'brand.700',
              bg: 'white',
              borderTop: '3px solid',
              borderTopColor: 'brand.600',
              borderBottomColor: 'white',
              fontWeight: 'bold',
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
          <Flex gap="3" mb="6" flexWrap="wrap" align="end">
            <Box minW={{ base: '100%', md: '220px' }}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" mb="1">
                งวดเดือน
              </Text>
              <Select
                bg="gray.50"
                border="none"
                borderRadius="lg"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </Select>
            </Box>
            <Box flex="1" minW={{ base: '100%', md: '280px' }}>
              <InputGroup>
                <InputLeftElement>
                  <Search size={14} color="gray" />
                </InputLeftElement>
                <Input
                  placeholder="ค้นหาชื่อ, รหัสพนักงาน, เลขบัตรประชาชน..."
                  bg="gray.50"
                  border="none"
                  borderRadius="lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Box>
            <Button
              leftIcon={<Download size={16} />}
              colorScheme="green"
              variant="outline"
              onClick={exportCsv}
              isDisabled={filteredRecords.length === 0}
            >
              Export CSV
            </Button>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4" mb="6">
            <Box
              p="5"
              borderWidth="1px"
              borderColor="gray.100"
              borderLeft="4px solid"
              borderLeftColor="blue.400"
              borderRadius="xl"
              bg="white"
            >
              <Stat>
                <StatLabel fontSize="sm" color="gray.500">
                  จำนวนพนักงานทั้งหมด
                </StatLabel>
                <StatNumber color="blue.600">
                  {summary.employeeCount} ราย
                </StatNumber>
              </Stat>
            </Box>
            <Box
              p="5"
              borderWidth="1px"
              borderColor="gray.100"
              borderLeft="4px solid"
              borderLeftColor="purple.400"
              borderRadius="xl"
              bg="white"
            >
              <Stat>
                <StatLabel fontSize="sm" color="gray.500">
                  หักเฉลี่ยต่อราย
                </StatLabel>
                <StatNumber color="purple.600">
                  ฿{formatMoney(summary.avgDeduction)}
                </StatNumber>
              </Stat>
            </Box>
            <Box
              p="5"
              borderWidth="1px"
              borderColor="gray.100"
              borderLeft="4px solid"
              borderLeftColor="green.400"
              borderRadius="xl"
              bg="white"
            >
              <Stat>
                <StatLabel fontSize="sm" color="gray.500">
                  ยอดรวมประกันสังคม
                </StatLabel>
                <StatNumber color="green.600">
                  ฿{formatMoney(summary.totalSocialSecurity)}
                </StatNumber>
              </Stat>
            </Box>
          </SimpleGrid>

          {loading ? (
            <Center py="10">
              <Spinner color="brand.500" />
            </Center>
          ) : (
            <Box
              borderWidth="1px"
              borderColor="gray.100"
              borderRadius="xl"
              overflowX="auto"
            >
              <Table size="sm" variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th w="70px">ลำดับ</Th>
                    <Th>ชื่อ-นามสกุล</Th>
                    <Th>เลขบัตรประชาชน</Th>
                    <Th>บริษัท</Th>
                    <Th isNumeric>หักประกันสังคม</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredRecords.length === 0 ? (
                    <Tr>
                      <Td colSpan={5}>
                        <Center py="8">
                          <Text color="gray.500">ไม่พบข้อมูลในงวดนี้</Text>
                        </Center>
                      </Td>
                    </Tr>
                  ) : (
                    filteredRecords.map((record, index) => {
                      const employee = record.employee || {};
                      const fullName =
                        `${employee.firstNameTh || ''} ${employee.lastNameTh || ''}`.trim() ||
                        '-';
                      const socialSecurity = Number(record.socialSecurity) || 0;
                      const companyLabel =
                        companyFilter === ''
                          ? [...new Set(record.companies || [])].join(' / ')
                          : record.company || companyFilter;
                      return (
                        <Tr
                          key={record._id || `${employee._id}-${index}`}
                          _hover={{ bg: 'gray.50' }}
                        >
                          <Td>{index + 1}</Td>
                          <Td>
                            <Text fontWeight="semibold" color="gray.800">
                              {fullName}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {employee.employeeId || '-'}
                            </Text>
                          </Td>
                          <Td>{employee.idCard || '-'}</Td>
                          <Td>
                            <Badge
                              colorScheme={
                                companyLabel.includes('โทเทิล')
                                  ? 'teal'
                                  : 'blue'
                              }
                              borderRadius="full"
                              px="2"
                            >
                              {companyLabel || '-'}
                            </Badge>
                          </Td>
                          <Td
                            isNumeric
                            fontWeight="bold"
                            color={
                              socialSecurity > 0 ? 'green.600' : 'gray.500'
                            }
                          >
                            {socialSecurity > 0
                              ? formatMoney(socialSecurity)
                              : '0.00'}
                          </Td>
                        </Tr>
                      );
                    })
                  )}
                </Tbody>
                <Tfoot>
                  <Tr bg="yellow.50">
                    <Td colSpan={4} fontWeight="bold">
                      รวม
                    </Td>
                    <Td isNumeric fontWeight="bold" color="green.700">
                      {formatMoney(summary.totalSocialSecurity)}
                    </Td>
                  </Tr>
                </Tfoot>
              </Table>
            </Box>
          )}
        </Box>
      </Tabs>
    </Box>
  );
};

export default PaySocialSecurity;
