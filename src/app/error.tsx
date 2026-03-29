"use client";

export default function ErrorPage({
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">Error</h1>
      <p className="text-muted-foreground text-lg">
        Something went wrong / 오류가 발생했습니다
      </p>
      <button
        onClick={reset}
        className="text-primary hover:text-primary/80 mt-2 cursor-pointer underline underline-offset-4"
      >
        Try again / 다시 시도
      </button>
    </div>
  );
}
