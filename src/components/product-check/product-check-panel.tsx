"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { ProductInfoCard } from "./product-info-card";
import { ComplianceReportCard } from "./compliance-report-card";
import { ActionChecklist } from "./action-checklist";
import { Upload, X, Camera, Clock, RotateCcw } from "lucide-react";
import type { ProductCheckResult } from "@/types/product-check";

type PanelState = "upload" | "processing" | "results" | "error";

interface ImageFile {
  readonly file: File;
  readonly preview: string;
  readonly data: string;
  readonly mimeType: string;
}

const PROCESSING_STEPS = [
  "Analyzing label images...",
  "Extracting product information...",
  "Searching Canadian regulations...",
  "Generating compliance report...",
] as const;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function ProductCheckPanel() {
  const [state, setState] = useState<PanelState>("upload");
  const [images, setImages] = useState<readonly ImageFile[]>([]);
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState<ProductCheckResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { toasts, removeToast, error: showError } = useToast();

  const fileToBase64 = useCallback((file: File): Promise<ImageFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        // Extract base64 data (remove data:image/...;base64, prefix)
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
          showError(`Unsupported format: ${file.type}. Use JPEG, PNG, or WebP.`);
          return;
        }
        if (file.size > MAX_SIZE) {
          showError(`File too large: ${file.name}. Maximum 10MB.`);
          return;
        }
      }

      const totalImages = images.length + fileArray.length;
      if (totalImages > 2) {
        showError("Maximum 2 images allowed (front + back label).");
        return;
      }

      const newImages = await Promise.all(fileArray.map(fileToBase64));
      setImages((prev) => [...prev, ...newImages]);
    },
    [images.length, fileToBase64, showError],
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

  const handleSubmit = useCallback(async () => {
    if (images.length === 0) return;

    setState("processing");
    setProcessingStep(0);

    // Simulate step progress
    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => Math.min(prev + 1, PROCESSING_STEPS.length - 1));
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
          language: "en",
        }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Too many requests. Please wait and try again.");
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? `Server error (${response.status})`);
      }

      const data = await response.json();
      setResult(data);
      setState("results");
    } catch (err) {
      clearInterval(stepInterval);
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(message);
      setState("error");
    }
  }, [images]);

  const handleReset = useCallback(() => {
    setImages([]);
    setResult(null);
    setErrorMessage("");
    setProcessingStep(0);
    setState("upload");
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Product Label Check</h1>
        <p className="text-muted-foreground">
          Upload product label photos to check Canadian import compliance.
        </p>
      </div>

      {/* Upload State */}
      {state === "upload" && (
        <div className="space-y-4">
          {/* Drop Zone */}
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
            <p className="font-medium">Drop label images here or click to upload</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload front and back labels (JPEG, PNG, WebP — max 10MB each)
            </p>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {images.map((img, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden border">
                  <img
                    src={img.preview}
                    alt={`Label ${i + 1}`}
                    className="w-full h-48 object-contain bg-muted/20"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(i);
                    }}
                    className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-background"
                  >
                    <X className="size-4" />
                  </button>
                  <Badge className="absolute bottom-2 left-2 text-xs" variant="secondary">
                    {i === 0 ? "Front" : "Back"}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={images.length === 0}
            size="lg"
            className="w-full"
          >
            <Camera className="size-5 mr-2" />
            Analyze Product ({images.length}/2 images)
          </Button>
        </div>
      )}

      {/* Processing State */}
      {state === "processing" && (
        <Card>
          <CardContent className="py-12">
            <div className="space-y-4 max-w-sm mx-auto">
              {PROCESSING_STEPS.map((step, i) => {
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
                This may take 15-30 seconds...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results State */}
      {state === "results" && result && (
        <div className="space-y-4">
          {/* Processing Time */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" />
              Completed in {(result.processing_time_ms / 1000).toFixed(1)}s
            </span>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="size-3 mr-1" />
              Check Another Product
            </Button>
          </div>

          {/* Uploaded Images */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {images.map((img, i) => (
                <div key={i} className="rounded-lg overflow-hidden border">
                  <img
                    src={img.preview}
                    alt={`Label ${i + 1}`}
                    className="w-full h-32 object-contain bg-muted/20"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Extracted Info */}
          <ProductInfoCard info={result.extracted_info} />

          {/* Compliance Report */}
          <ComplianceReportCard report={result.compliance_report} />

          {/* Action Items */}
          <ActionChecklist
            report={result.compliance_report}
            regulationRefs={result.regulation_references}
          />
        </div>
      )}

      {/* Error State */}
      {state === "error" && (
        <Card className="border-red-200">
          <CardContent className="py-8 text-center space-y-3">
            <p className="text-red-600 font-medium">{errorMessage}</p>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="size-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
