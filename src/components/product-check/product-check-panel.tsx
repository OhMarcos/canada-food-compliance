"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { ProductInfoCard } from "./product-info-card";
import { ComplianceReportCard } from "./compliance-report-card";
import { ActionChecklist } from "./action-checklist";
import { Upload, X, Camera, Clock, RotateCcw, Square } from "lucide-react";
import type { ProductCheckResult } from "@/types/product-check";

type PanelState = "upload" | "processing" | "results" | "error";

interface ImageFile {
  readonly file: File;
  readonly preview: string;
  readonly data: string;
  readonly mimeType: string;
}

const PROCESSING_STEPS_EN = [
  "Analyzing label images...",
  "Extracting product information...",
  "Searching Canadian regulations...",
  "Generating compliance report...",
] as const;

const PROCESSING_STEPS_KO = [
  "라벨 이미지 분석 중...",
  "제품 정보 추출 중...",
  "캐나다 규제 검색 중...",
  "컴플라이언스 리포트 생성 중...",
] as const;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function ProductCheckPanel() {
  const { language, t } = useLanguage();
  const [state, setState] = useState<PanelState>("upload");
  const [images, setImages] = useState<readonly ImageFile[]>([]);
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState<ProductCheckResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { toasts, removeToast, error: showError } = useToast();
  const { checkAuthError, authDialog } = useAuthGuard();
  const abortControllerRef = useRef<AbortController | null>(null);

  const processingSteps = language === "en" ? PROCESSING_STEPS_EN : PROCESSING_STEPS_KO;

  const fileToBase64 = useCallback((file: File): Promise<ImageFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64Data = dataUrl.split(",")[1];
        resolve({
          file,
          preview: dataUrl,
          data: base64Data,
          mimeType: file.type,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          showError(t(
            `Unsupported format: ${file.type}. Use JPEG, PNG, or WebP.`,
            `지원하지 않는 형식: ${file.type}. JPEG, PNG, WebP를 사용하세요.`,
          ));
          return;
        }
        if (file.size > MAX_SIZE) {
          showError(t(
            `File too large: ${file.name}. Maximum 10MB.`,
            `파일이 너무 큽니다: ${file.name}. 최대 10MB.`,
          ));
          return;
        }
      }

      const totalImages = images.length + fileArray.length;
      if (totalImages > 2) {
        showError(t(
          "Maximum 2 images allowed (front + back label).",
          "최대 2장까지 업로드 가능합니다 (앞면 + 뒷면 라벨).",
        ));
        return;
      }

      const newImages = await Promise.all(fileArray.map(fileToBase64));
      setImages((prev) => [...prev, ...newImages]);
    },
    [images.length, fileToBase64, showError, t],
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const handleCancel = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setState("upload");
    setProcessingStep(0);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (images.length === 0) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState("processing");
    setProcessingStep(0);

    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => Math.min(prev + 1, processingSteps.length - 1));
    }, 4000);

    try {
      const response = await fetch("/api/product-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: images.map((img) => ({
            data: img.data,
            mimeType: img.mimeType,
          })),
          language,
        }),
        signal: controller.signal,
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const authError = checkAuthError(response);
        if (authError) throw new Error(authError);
        if (response.status === 429) {
          throw new Error(t(
            "Too many requests. Please wait and try again.",
            "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
          ));
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? t(
          `Server error (${response.status})`,
          `서버 오류 (${response.status})`,
        ));
      }

      const data = await response.json();
      setResult(data);
      setState("results");
    } catch (err) {
      clearInterval(stepInterval);
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      const message = err instanceof Error ? err.message : t(
        "An unexpected error occurred.",
        "예상치 못한 오류가 발생했습니다.",
      );
      setErrorMessage(message);
      setState("error");
    } finally {
      abortControllerRef.current = null;
    }
  }, [images, language, t, processingSteps.length]);

  const handleReset = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setImages([]);
    setResult(null);
    setErrorMessage("");
    setProcessingStep(0);
    setState("upload");
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {t("Product Label Check", "제품 라벨 분석")}
        </h1>
        <p className="text-muted-foreground">
          {t(
            "Upload product label photos to check Canadian import compliance.",
            "제품 라벨 사진을 업로드하면 캐나다 수입 컴플라이언스를 확인합니다.",
          )}
        </p>
      </div>

      {/* Upload State */}
      {state === "upload" && (
        <div className="space-y-4">
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ACCEPTED_TYPES.join(",");
              input.multiple = true;
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) handleFiles(files);
              };
              input.click();
            }}
          >
            <Upload className="size-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">
              {t("Drop label images here or click to upload", "라벨 이미지를 드래그하거나 클릭하여 업로드")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t(
                "Upload front and back labels (JPEG, PNG, WebP — max 10MB each)",
                "앞면/뒷면 라벨을 업로드하세요 (JPEG, PNG, WebP — 각 최대 10MB)",
              )}
            </p>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {images.map((img, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden border">
                  <img
                    src={img.preview}
                    alt={t(`Label ${i + 1}`, `라벨 ${i + 1}`)}
                    className="w-full h-48 object-contain bg-muted/20"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(i);
                    }}
                    className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-background"
                    aria-label={t("Remove image", "이미지 삭제")}
                  >
                    <X className="size-4" />
                  </button>
                  <Badge className="absolute bottom-2 left-2 text-xs" variant="secondary">
                    {i === 0 ? t("Front", "앞면") : t("Back", "뒷면")}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <Button onClick={handleSubmit} disabled={images.length === 0} size="lg" className="w-full">
            <Camera className="size-5 mr-2" />
            {t(`Analyze Product (${images.length}/2 images)`, `제품 분석 (${images.length}/2 이미지)`)}
          </Button>
        </div>
      )}

      {/* Processing State */}
      {state === "processing" && (
        <Card>
          <CardContent className="py-12">
            <div className="space-y-4 max-w-sm mx-auto">
              {processingSteps.map((step, i) => {
                const isActive = i === processingStep;
                const isDone = i < processingStep;
                return (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    {isDone ? (
                      <span className="text-green-600">&#10003;</span>
                    ) : isActive ? (
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    ) : (
                      <span className="text-muted-foreground opacity-40">&#9679;</span>
                    )}
                    <span
                      className={
                        isDone
                          ? "text-muted-foreground line-through"
                          : isActive
                            ? "text-foreground font-medium"
                            : "text-muted-foreground opacity-40"
                      }
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground text-center pt-4">
                {t("This may take 15-30 seconds...", "15-30초 정도 소요됩니다...")}
              </p>
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <Square className="size-3 mr-1" />
                  {t("Cancel", "취소")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results State */}
      {state === "results" && result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" />
              {t(
                `Completed in ${(result.processing_time_ms / 1000).toFixed(1)}s`,
                `${(result.processing_time_ms / 1000).toFixed(1)}초 소요`,
              )}
            </span>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="size-3 mr-1" />
              {t("Check Another Product", "다른 제품 확인")}
            </Button>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {images.map((img, i) => (
                <div key={i} className="rounded-lg overflow-hidden border">
                  <img
                    src={img.preview}
                    alt={t(`Label ${i + 1}`, `라벨 ${i + 1}`)}
                    className="w-full h-32 object-contain bg-muted/20"
                  />
                </div>
              ))}
            </div>
          )}

          <ProductInfoCard info={result.extracted_info} />
          <ComplianceReportCard report={result.compliance_report} />
          <ActionChecklist report={result.compliance_report} regulationRefs={result.regulation_references} />
        </div>
      )}

      {/* Error State */}
      {state === "error" && (
        <Card className="border-red-200">
          <CardContent className="py-8 text-center space-y-3">
            <p className="text-red-600 font-medium">{errorMessage}</p>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="size-4 mr-2" />
              {t("Try Again", "다시 시도")}
            </Button>
          </CardContent>
        </Card>
      )}

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      {authDialog}
    </div>
  );
}
