import { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  VStack,
  useToast,
  Center,
  Checkbox,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Spinload from "../Components/spinload";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const isRemembered = localStorage.getItem("rememberMe");
    if (isRemembered === "true" || isRemembered === null) {
      const savedEmail = localStorage.getItem("rememberedEmail");
      const savedPassword = localStorage.getItem("rememberedPassword");
      if (savedEmail) setEmail(savedEmail);
      if (savedPassword) setPassword(savedPassword);
      setRememberMe(true);
    } else if (isRemembered === "false") {
      setRememberMe(false);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "กรุณากรอกอีเมลและรหัสผ่าน",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });

      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.setItem("rememberMe", "false");
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        status: "success",
        duration: 2000,
        position: "top",
        isClosable: true,
      });

      setShowSplash(true);

      // 3-second delay before redirecting
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || "เข้าสู่ระบบไม่สำเร็จ";
      toast({
        title: "Error",
        description: errorMsg,
        status: "error",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      {showSplash && <Spinload />}
      <Center h="100vh" bg="gray.100">
        <Box
          w="full"
          maxW="md"
          bg="white"
          p={8}
          boxShadow="xl"
          borderRadius="2xl"
        >
          <VStack spacing={6} align="stretch">
            <Center flexDirection="column">
              <Heading size="lg" mb={2} color="#021841">
                BOONROD GOLF
              </Heading>
              <Text color="gray.500" fontSize="sm">
                เข้าสู่ระบบเพื่อจัดการข้อมูล
              </Text>
            </Center>

            <form onSubmit={handleLogin}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>EMAIL</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    bg="gray.50"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>PASSWORD</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    bg="gray.50"
                  />
                </FormControl>

                <Checkbox
                  w="full"
                  isChecked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  colorScheme="brand"
                  size="md"
                >
                  จดจำรหัสผ่าน
                </Checkbox>

                <Button
                  type="submit"
                  bg={"#021841"}
                  color={"#FFF"}
                  _hover={{ bg: "#021841" }}
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                  mt={2}
                >
                  เข้าสู่ระบบ
                </Button>
              </VStack>
            </form>
          </VStack>
        </Box>
      </Center>
    </>
  );
};

export default Login;
