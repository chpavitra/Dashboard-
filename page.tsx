"use client";

import { useState, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { BinCard } from "@/components/dashboard/bin-card";
import { GPSTracker } from "@/components/dashboard/gps-tracker";
import { MQTTMonitor } from "@/components/dashboard/mqtt-monitor";
import { SprayMonitor } from "@/components/dashboard/spray-monitor";
import { AnalyticsPanel } from "@/components/dashboard/analytics-panel";
import { ActivityLog } from "@/components/dashboard/activity-log";
import { AIStatusCard } from "@/components/dashboard/ai-status-card";
import { AlertModal } from "@/components/dashboard/alert-modal";
import { AlertBanner } from "@/components/dashboard/alert-banner";

interface Alert {
  id: string;
  binType: string;
  level: number;
  timestamp: Date;
}

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeModal, setActiveModal] = useState<Alert | null>(null);

  const handleBinAlert = useCallback((binType: string, level: number) => {
    const newAlert: Alert = {
      id: `${binType}-${Date.now()}`,
      binType,
      level,
      timestamp: new Date(),
    };
    
    setAlerts((prev) => {
      // Check if alert for this bin type already exists
      const exists = prev.some((a) => a.binType === binType);
      if (exists) return prev;
      return [...prev, newAlert];
    });
    
    setActiveModal(newAlert);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const acknowledgeAlert = useCallback(() => {
    if (activeModal) {
      dismissAlert(activeModal.id);
      setActiveModal(null);
    }
  }, [activeModal, dismissAlert]);

  return (
    <div className="min-h-screen bg-background">
      {/* Emergency Alert Banner */}
      <AlertBanner alerts={alerts} onDismiss={dismissAlert} />

      {/* Alert Modal */}
      {activeModal && (
        <AlertModal
          alert={activeModal}
          onClose={() => setActiveModal(null)}
          onAcknowledge={acknowledgeAlert}
        />
      )}

      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <main className="p-4 lg:p-6 max-w-[1800px] mx-auto">
        {/* Smart Bins Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Smart Bin Monitoring
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <BinCard type="wet" initialLevel={45} onAlert={handleBinAlert} />
            <BinCard type="dry" initialLevel={72} onAlert={handleBinAlert} />
            <BinCard type="metal" initialLevel={38} onAlert={handleBinAlert} />
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - GPS & MQTT */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <GPSTracker />
              <MQTTMonitor />
            </div>
            
            {/* Analytics */}
            <AnalyticsPanel />
          </div>

          {/* Right Column - AI & Spray */}
          <div className="space-y-6">
            <AIStatusCard />
            <SprayMonitor />
          </div>
        </div>

        {/* Activity Log - Full Width */}
        <section className="mb-6">
          <ActivityLog />
        </section>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            AI Smart Waste Segregation System • Powered by Raspberry Pi & IoT
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time monitoring dashboard for smart campus waste management
          </p>
        </footer>
      </main>
    </div>
  );
}
