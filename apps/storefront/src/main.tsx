import React from "react";
import ReactDOM from "react-dom/client";
import AppProvider from "./AppProvider.tsx";
import { ChakraProvider } from "@chakra-ui/react";
import acceleratorTheme from "./theme/theme.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={acceleratorTheme}>
      <AppProvider />
    </ChakraProvider>
  </React.StrictMode>
);
