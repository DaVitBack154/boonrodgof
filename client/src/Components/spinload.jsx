import { Box, Flex } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

// กำหนด keyframes สำหรับการหมุน
const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Spinload = () => {
  return (
    <Flex
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      height="100vh"
      alignItems="center"
      justifyContent="center"
      bg="rgba(0, 0, 0, 0.5)" // พื้นหลังโปร่งแสง สามารถปรับเปลี่ยนได้
      zIndex="9999" // เพื่อให้ Spinner อยู่เหนือองค์ประกอบอื่นๆ
    >
      <Box
        position="relative"
        width="56px"
        height="56px"
        display="grid"
        animation={`${spin} 4s linear infinite`}
      >
        {/* ::before pseudo-element */}
        <Box
          as="span"
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          border="10px solid"
          borderRadius="50%"
          borderColor="#113882ff #12439fff transparent transparent"
          mixBlendMode="darken"
          animation={`${spin} 1s linear infinite`}
        />

        {/* ::after pseudo-element */}
        <Box
          as="span"
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          border="9px solid"
          borderRadius="50%"
          borderColor="transparent transparent #dbdcef #dbdcef"
          mixBlendMode="darken"
          animation={`${spin} 1s linear infinite reverse`}
        />
      </Box>
    </Flex>
  );
};

export default Spinload;
