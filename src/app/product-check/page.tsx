import { Suspense } from "react";
import { ProductCheckPanel } from "@/components/product-check/product-check-panel";

export default function ProductCheckPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <ProductCheckPanel />
    </Suspense>
  );
}
