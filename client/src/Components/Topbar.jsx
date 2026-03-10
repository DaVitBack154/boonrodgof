import { Flex, Text, Box, Badge } from "@chakra-ui/react";
import { Button, Dropdown, Avatar as AntAvatar } from "antd";
import {
  Bell,
  Menu as MenuIcon,
  LogOut,
  User as UserIcon,
  ChevronDown,
} from "lucide-react";
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
        <Button
          className="mobile-hamburger"
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            width: 40,
            height: 40,
            border: "none",
            background: "transparent",
            boxShadow: "none",
            marginRight: 8,
          }}
          icon={<MenuIcon size="24" />}
          onClick={onOpenSidebar}
        />
        <Text
          fontSize="xl"
          fontWeight="bold"
          color="gray.800"
          className="mobile-logo"
          style={{ display: "none" }}
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

        <Dropdown
          menu={{
            items: [
              {
                key: "user-info",
                label: (
                  <Box py="1">
                    <Text fontSize="sm" fontWeight="bold">
                      {displayName}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {displayRole}
                    </Text>
                  </Box>
                ),
                style: { display: window.innerWidth < 768 ? "block" : "none" },
              },
              {
                type: "divider",
                style: { display: window.innerWidth < 768 ? "block" : "none" },
              },
              {
                key: "logout",
                label: "ออกจากระบบ",
                danger: true,
                icon: <LogOut size={16} />,
                onClick: handleLogout,
              },
            ],
          }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Flex align="center" cursor="pointer">
            <AntAvatar
              size={40}
              style={{
                backgroundColor: "#03337D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              B
            </AntAvatar>
            <Box ml="3" className="desktop-user-info" textAlign="left">
              <Text fontSize="sm" fontWeight="bold" color="gray.700">
                {displayName}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {user?.email || ""}
              </Text>
            </Box>
            <Box ml="2" color="gray.500" display="flex" alignItems="center">
              <ChevronDown size={16} />
            </Box>
          </Flex>
        </Dropdown>
      </Flex>

      <style>{`
        @media (max-width: 767px) {
          .mobile-hamburger { display: flex !important; }
          .mobile-logo { display: block !important; }
          .desktop-user-info { display: none !important; }
        }
        @media (min-width: 768px) {
          .desktop-user-info { display: block !important; }
        }
      `}</style>
    </Flex>
  );
};

export default Topbar;
