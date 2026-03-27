"use client";

import { useCallback, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, ImageIcon, Sparkles, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/compress-image";
import { toast } from "sonner";

type StepUploadProps = {
  imagePreview: string | null;
  onImageSelected: (preview: string, base64: string, mimeType: string) => void;
};

export function StepUpload({
  imagePreview,
  onImageSelected,
}: StepUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;

      setCompressing(true);
      try {
        const { base64, preview, mimeType } = await compressImage(file);
        onImageSelected(preview, base64, mimeType);
      } catch {
        toast.error("Erro ao processar imagem", {
          description: "Tente outra foto.",
        });
      } finally {
        setCompressing(false);
      }
    },
    [onImageSelected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <Card className="border-chronos-border bg-chronos-surface-raised">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-chronos-text mb-2">
            Fotografe o Relógio
          </h2>
          <p className="text-sm text-chronos-text-muted">
            Tire uma foto ou selecione uma imagem do relógio. A IA vai
            identificar automaticamente marca, modelo e características.
          </p>
        </div>

        {compressing ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-chronos-gold animate-spin mb-4" />
            <p className="text-sm text-chronos-text-muted">
              Processando imagem...
            </p>
          </div>
        ) : imagePreview ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <img
                src={imagePreview}
                alt="Preview do relógio"
                className="max-h-[400px] rounded-xl border border-chronos-border object-contain"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
              >
                <span className="text-white font-medium flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Trocar foto
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-chronos-border hover:border-chronos-gold/50 bg-chronos-surface/50 hover:bg-chronos-gold/5 px-6 py-20 cursor-pointer transition-all group"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-chronos-gold/10 group-hover:bg-chronos-gold/20 transition-colors mb-6">
              <ImageIcon className="h-10 w-10 text-chronos-gold" />
            </div>

            <p className="text-base font-semibold text-chronos-text mb-2">
              Arraste uma foto aqui
            </p>
            <p className="text-sm text-chronos-text-muted mb-6">
              ou clique para selecionar do dispositivo
            </p>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-chronos-border text-chronos-text hover:bg-chronos-surface-hover"
              >
                <Upload className="mr-2 h-4 w-4" />
                Selecionar Arquivo
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-chronos-border text-chronos-text hover:bg-chronos-surface-hover"
                onClick={(e) => {
                  e.stopPropagation();
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.capture = "environment";
                  input.onchange = (ev) => {
                    const file = (ev.target as HTMLInputElement).files?.[0];
                    if (file) handleFile(file);
                  };
                  input.click();
                }}
              >
                <Camera className="mr-2 h-4 w-4" />
                Usar Câmera
              </Button>
            </div>

            <p className="text-xs text-chronos-text-subtle mt-4">
              JPG, PNG ou WebP — a imagem será otimizada automaticamente
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </CardContent>
    </Card>
  );
}
