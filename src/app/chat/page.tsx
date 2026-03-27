import Link from "next/link";
import { Apple, Leaf } from "lucide-react";

export default function ChatLandingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] gap-8 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">ClearBite Q&A</h1>
        <p className="text-muted-foreground max-w-md">
          캐나다 규제 상담 시스템 — 질문 영역을 선택하세요
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl w-full">
        <Link
          href="/chat/food"
          className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-muted hover:border-primary hover:bg-primary/5 transition-all group"
        >
          <Apple className="size-10 text-orange-500 group-hover:scale-110 transition-transform" />
          <span className="text-xl font-semibold">Food</span>
          <span className="text-sm text-muted-foreground text-center">
            식품 규제 (SFCA/SFCR, CFIA)
          </span>
        </Link>

        <Link
          href="/chat/nhp"
          className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-muted hover:border-green-500 hover:bg-green-500/5 transition-all group"
        >
          <Leaf className="size-10 text-green-500 group-hover:scale-110 transition-transform" />
          <span className="text-xl font-semibold">NHP</span>
          <span className="text-sm text-muted-foreground text-center">
            천연건강제품 규제 (NHPR, NNHPD)
          </span>
        </Link>
      </div>
    </div>
  );
}
