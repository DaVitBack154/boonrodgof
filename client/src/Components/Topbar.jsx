import {
  Flex,
  Text,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  Badge,
  MenuDivider,
} from "@chakra-ui/react";
import { Bell, Menu as MenuIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Topbar = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const displayName = user
    ? `${user.firstNameTh || ""} ${user.lastNameTh || ""}`.trim() ||
      user.email ||
      "ผู้ใช้งาน"
    : "กำลังโหลด...";

  let displayRole = "พนักงาน";
  if (user?.role === "admin") displayRole = "ผู้ดูแลระบบ";
  else if (user?.role === "coach") displayRole = "โค้ช";

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      w="full"
      px="8"
      bg="#FFF"
      borderBottomWidth="1px"
      borderColor="gray.200"
      h="20"
      boxShadow="sm"
    >
      <Flex align="center">
        <IconButton
          display={{ base: "flex", md: "none" }}
          aria-label="Open menu"
          icon={<MenuIcon size="24" />}
          onClick={onOpenSidebar}
          variant="ghost"
          mr="2"
        />
        <Text
          fontSize="xl"
          fontWeight="bold"
          color="gray.800"
          display={{ base: "block", md: "none" }}
        >
          BOONROD GOLF
        </Text>
      </Flex>

      <Flex align="center">
        {/* <Box position="relative" mr="4">
          <IconButton
            aria-label="Notifications"
            icon={<Bell size="20" />}
            variant="ghost"
            color="gray.600"
            _hover={{ bg: "gray.100" }}
            rounded="full"
          />
          <Badge
            position="absolute"
            top="2"
            right="2"
            bg="red.500"
            color="white"
            borderRadius="full"
            w="2.5"
            h="2.5"
            border="2px solid white"
          />
        </Box> */}

        <Menu>
          <MenuButton>
            <Flex align="center" cursor="pointer">
              <Avatar size="md" name={"B"} bg="#03337D" color="white" />
              <Box
                ml="3"
                display={{ base: "none", md: "block" }}
                textAlign="left"
              >
                <Text fontSize="sm" fontWeight="bold" color="gray.700">
                  {displayName}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {/* {user?.firstNameTh
                    ? `${user.firstNameTh} ${user.lastNameTh}`
                    : user?.email || ""} */}
                  {user?.email || ""}
                </Text>
              </Box>
            </Flex>
          </MenuButton>
          <MenuList>
            <Box px="3" py="2" display={{ base: "block", md: "none" }}>
              <Text fontSize="sm" fontWeight="bold">
                {displayName}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {displayRole}
              </Text>
            </Box>
            <MenuDivider display={{ base: "block", md: "none" }} />
            <MenuItem onClick={handleLogout} color="red.500">
              ออกจากระบบ
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};

export default Topbar;
