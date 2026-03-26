import { Suspense } from "react";
import { QADashboard } from "@/components/qa/qa-dashboard";

export default function QAPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <QADashboard />
    </Suspense>
  );
}
