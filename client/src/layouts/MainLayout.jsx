import { Box, Flex } from "@chakra-ui/react";
import { Drawer as AntDrawer } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";

const MainLayout = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <Flex h="100vh" bg="gray.50" overflow="hidden">
      {/* Desktop Sidebar */}
      <Box display={{ base: "none", md: "block" }}>
        <Sidebar />
      </Box>

      {/* Mobile Drawer Sidebar - Ant Design */}
      <AntDrawer
        placement="left"
        onClose={onClose}
        open={isOpen}
        width={260}
        styles={{
          body: {
            padding: 0,
            background: "#021841", // brand.900 equivalent
          },
          header: {
            display: "none",
          },
        }}
        closable={false}
      >
        <Sidebar onClose={onClose} />
      </AntDrawer>

      {/* Main Content Area - Takes remaining width */}
      <Flex flex="1" direction="column" overflow="hidden" minW="0">
        <Topbar onOpenSidebar={onOpen} />

        {/* Scrollable Content */}
        <Box
          flex="1"
          p={{ base: "4", md: "6", lg: "8" }}
          overflowY="auto"
          overflowX="hidden"
          w="100%"
        >
          <Box w="100%" maxW="1440px" mx="auto">
            <Outlet />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default MainLayout;
