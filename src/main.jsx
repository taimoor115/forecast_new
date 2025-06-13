import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Toaster } from "sonner";
import "./assets/css/inter.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./assets/css/style.css";
import { AuthProvider } from "./context/auth";
import { ModalProvider } from "./context/modal";
import { QueryParamsProvider } from "./components/context/params";
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ModalProvider>
          <Toaster duration={2000} position="top-right" />
          <QueryParamsProvider>
            <App />
          </QueryParamsProvider>
        </ModalProvider>
      </AuthProvider>
    </QueryClientProvider>
);
