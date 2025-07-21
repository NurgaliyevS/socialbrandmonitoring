"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import UpgradeModal from "./onboarding/UpgradeModal";
import { useDashboard } from "@/contexts/DashboardContext";

interface PaidRouteProps {
  children: React.ReactNode;
}

export default function PaidRoute({ children }: PaidRouteProps) {
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);
  const { setShowUpgradeModal } = useDashboard();

  const getOnboardingStatus = async () => {
    const response = await fetch("/api/auth/onboarding-status");
    const data = await response.json();
    return data;
  };

  useEffect(() => {
    getOnboardingStatus().then((data) => {
      setOnboardingStatus(data);
    });
  }, []);

  const shouldShowUpgrade =
    onboardingStatus?.plan === "free" && onboardingStatus?.onboardingComplete;

  useEffect(() => {
    if (shouldShowUpgrade) {
      setShowUpgradeModal(true);
    }
    if (!shouldShowUpgrade) {
      setShowUpgradeModal(false);
    }
  }, [shouldShowUpgrade, setShowUpgradeModal]);

  return (
    <>
      {children}
      <UpgradeModal />
    </>
  );
}
