import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground text-lg">
        Page not found / 페이지를 찾을 수 없습니다
      </p>
      <Link
        href="/"
        className="text-primary hover:text-primary/80 mt-2 underline underline-offset-4"
      >
        Go home / 홈으로 이동
      </Link>
    </div>
  );
}
