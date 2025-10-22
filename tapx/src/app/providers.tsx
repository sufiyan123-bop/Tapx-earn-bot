"use client";

import React from "react";
import { TelegramProvider } from "@/providers/TelegramProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "react-hot-toast";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <TelegramProvider>
      <AuthProvider>
        {children}
        <Toaster position="top-center" />
      </AuthProvider>
    </TelegramProvider>
  );
}
