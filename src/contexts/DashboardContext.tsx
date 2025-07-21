"use client";
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { settingsService } from '@/lib/settings-service';
import { Brand } from '@/components/settings/types';

interface DashboardContextType {
  brands: Brand[];
  loading: boolean;
  error: string | null;
  refreshBrands: () => Promise<void>;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (open: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider = ({ children }: DashboardProviderProps) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const loadBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedBrands = await settingsService.getBrands();
      setBrands(fetchedBrands);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brands');
      console.error('Error loading brands:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const refreshBrands = async () => {
    await loadBrands();
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const value: DashboardContextType = {
    brands,
    loading,
    error,
    refreshBrands,
    showUpgradeModal,
    setShowUpgradeModal
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}; 