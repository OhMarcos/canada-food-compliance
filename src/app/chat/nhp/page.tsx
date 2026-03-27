import { Suspense } from "react";
import { ChatPanel } from "@/components/chat/chat-panel";

export default function NhpChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <ChatPanel domain="nhp" />
    </Suspense>
  );
}
