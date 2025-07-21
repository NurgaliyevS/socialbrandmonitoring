import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/contexts/DashboardContext';
import { useRouter } from 'next/navigation';

const UpgradeModal: React.FC = () => {

  const router = useRouter();

  const { showUpgradeModal } = useDashboard();

  const onUpgrade = () => {
    router.push('/#pricing');
  }
  
  
  return (
    <Dialog open={showUpgradeModal}>
      <DialogContent hideCloseIcon>
        <DialogHeader>
          <DialogTitle>Upgrade Required</DialogTitle>
          <DialogDescription>
            To activate the main features (adding keywords, getting mentions), please upgrade your plan. Free users can onboard and save their data, but only paid users get full access.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Button onClick={onUpgrade}>
            Upgrade Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UpgradeModal; 