import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#e3f2fd",
      100: "#bbdefb",
      200: "#90caf9",
      300: "#64b5f6",
      400: "#42a5f5",
      500: "#2196f3",
      600: "#1e88e5",
      700: "#1976d2", // BRG Blue
      800: "#1565c0",
      900: "#021841", // Deep BRG Blue
    },
    accent: {
      100: "#fff9c4",
      400: "#ffd54f", // BRG Gold/Yellow
      500: "#ffc107",
      600: "#ffb300",
    },
  },
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
});

export default theme;
