"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import NfcTapSimulatorModal from "@/components/nfc/NfcTapSimulatorModal";
import { SessionUser } from "@/lib/types";

interface DashboardClientShellProps {
  user: SessionUser;
  children: React.ReactNode;
}

export default function DashboardClientShell({
  user,
  children,
}: DashboardClientShellProps) {
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          user={user}
          onOpenNfcSimulator={() => setIsSimulatorOpen(true)}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <NfcTapSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </div>
  );
}

