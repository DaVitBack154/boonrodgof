import {
  Box,
  Flex,
  Text,
  VStack,
  Icon,
  Link as ChakraLink,
  Divider,
} from "@chakra-ui/react";
import {
  NavLink as RouterLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarClock,
  Calendar,
  Settings,
  FileText,
  Clock,
  Calculator,
  BookOpen,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { MdOutlineBarChart } from "react-icons/md";
import { RiMoneyDollarCircleLine } from "react-icons/ri";

const NavItem = ({ icon, children, to, onClose }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <ChakraLink
      as={RouterLink}
      to={to}
      w="100%"
      style={{ textDecoration: "none" }}
      onClick={onClose}
    >
      <Flex
        align="center"
        py="3"
        pl="6"
        pr="4"
        mr="4"
        borderRightRadius="full"
        borderLeft="4px solid"
        borderColor={isActive ? "red.500" : "transparent"}
        role="group"
        cursor="pointer"
        bg={isActive ? "whiteAlpha.200" : "transparent"}
        color={isActive ? "white" : "gray.400"}
        _hover={{
          bg: "whiteAlpha.200",
          color: "white",
        }}
        transition="all 0.2s"
      >
        <Icon
          as={icon}
          mr="4"
          fontSize="20"
          color={isActive ? "white" : "gray.400"}
          _groupHover={{ color: "white" }}
        />
        <Text fontSize="sm" fontWeight={isActive ? "600" : "500"}>
          {children}
        </Text>
      </Flex>
    </ChakraLink>
  );
};

const SectionLabel = ({ children }) => (
  <Text
    fontSize="xs"
    fontWeight="bold"
    color="gray.500"
    textTransform="uppercase"
    letterSpacing="wider"
    px="8"
    mt="6"
    mb="2"
  >
    {children}
  </Text>
);

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
    if (onClose) onClose();
  };

  return (
    <Flex
      direction="column"
      w="260px"
      minW="260px"
      flexShrink={0}
      bg="brand.900"
      color="white"
      h="full"
      boxShadow="xl"
      // Removed display={{ base: "none", md: "block" }} so it renders in drawer
      zIndex="10"
      overflowY="auto"
    >
      <Flex
        direction="column"
        alignItems="flex-start"
        py="6"
        px="6"
        borderBottom="1px solid"
        borderColor="whiteAlpha.400"
      >
        <Text
          fontSize="lg"
          fontWeight="bold"
          color="accent.400"
          letterSpacing="widest"
        >
          BOONROD GOLF
        </Text>
      </Flex>

      <VStack spacing="1" align="stretch">
        <SectionLabel>หน้าหลัก</SectionLabel>
        <NavItem icon={Calendar} to="/schedule" onClose={onClose}>
          DashBoard
        </NavItem>
        <NavItem
          icon={MdOutlineBarChart}
          to="/daily-customers"
          onClose={onClose}
        >
          Report
        </NavItem>
        <NavItem
          icon={RiMoneyDollarCircleLine}
          to="/monthly-commission"
          onClose={onClose}
        >
          Commission
        </NavItem>
        {JSON.parse(localStorage.getItem("user") || "{}").role === "admin" && (
          <>
            <SectionLabel>ระบบบุคลากร</SectionLabel>
            <NavItem icon={Users} to="/employees" onClose={onClose}>
              ทะเบียนพนักงาน
            </NavItem>
            <NavItem icon={BookOpen} to="/student-courses" onClose={onClose}>
              คอร์สลูกค้า / คอมมิชชั่น
            </NavItem>
            <SectionLabel>ระบบเงินเดือน</SectionLabel>
            <NavItem icon={Calculator} to="/payroll" onClose={onClose}>
              คำนวณเงินเดือน
            </NavItem>
            <NavItem icon={CreditCard} to="/payslip" onClose={onClose}>
              ใบจ่ายเงินเดือน
            </NavItem>
          </>
        )}
      </VStack>

      <Box mt="auto" w="full" pt="4" pb="2">
        <Divider borderColor="whiteAlpha.400" />
        <Box px="2" pt="2" w="full">
          <Box
            bg="whiteAlpha.200"
            borderRadius="2xl"
            p="3"
            cursor="pointer"
            role="group"
            _hover={{
              bg: "whiteAlpha.200",
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            transition="all 0.2s"
            onClick={handleLogout}
          >
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="md" fontWeight="bold" color="white">
                  ออกจากระบบ
                </Text>
              </Box>
              <Flex
                w="40px"
                h="40px"
                borderRadius="full"
                bg="whiteAlpha.200"
                align="center"
                justify="center"
                color="red.400"
                _groupHover={{
                  bg: "red.500",
                  color: "white",
                  transform: "scale(1.1)",
                }}
                transition="all 0.2s"
              >
                <Icon as={LogOut} boxSize={5} ml="1" />
              </Flex>
            </Flex>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default Sidebar;
