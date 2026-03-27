"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  Camera,
  Sparkles,
  FileEdit,
  CheckCircle2,
} from "lucide-react";
import { StepAcquisition } from "./steps/step-acquisition";
import { StepUpload } from "./steps/step-upload";
import { StepAnalysis } from "./steps/step-analysis";
import { StepForm } from "./steps/step-form";
import { StepSave } from "./steps/step-save";
import type { WatchSuggestions } from "@/domain/ports/i-image-analyzer";

export type WatchFormData = {
  brand: string;
  model: string;
  reference: string;
  dial_color: string;
  case_material: string;
  case_diameter_mm: string;
  movement: string;
  year_of_production: string;
  condition: string;
  accessories: string;
  description: string;
  asking_price: string;
  notes: string;
};

export type AcquisitionData = {
  type: "direct_purchase" | "trade";
  purchase_cost: string;
  supplier_name: string;
  acquired_at: string;
};

const STEPS = [
  { id: 1, label: "Aquisição", icon: ShoppingCart },
  { id: 2, label: "Foto", icon: Camera },
  { id: 3, label: "Análise IA", icon: Sparkles },
  { id: 4, label: "Dados", icon: FileEdit },
  { id: 5, label: "Salvar", icon: CheckCircle2 },
] as const;

const EMPTY_FORM: WatchFormData = {
  brand: "",
  model: "",
  reference: "",
  dial_color: "",
  case_material: "",
  case_diameter_mm: "",
  movement: "",
  year_of_production: "",
  condition: "",
  accessories: "",
  description: "",
  asking_price: "",
  notes: "",
};

const EMPTY_ACQUISITION: AcquisitionData = {
  type: "direct_purchase",
  purchase_cost: "",
  supplier_name: "",
  acquired_at: new Date().toISOString().split("T")[0],
};

export function WatchWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [acquisitionData, setAcquisitionData] =
    useState<AcquisitionData>(EMPTY_ACQUISITION);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<WatchSuggestions | null>(null);
  const [formData, setFormData] = useState<WatchFormData>(EMPTY_FORM);

  function handleAcquisitionComplete(data: AcquisitionData) {
    setAcquisitionData(data);
    setCurrentStep(2);
  }

  function handleImageSelected(
    preview: string,
    base64: string,
    mimeType: string,
  ) {
    setImagePreview(preview);
    setImageBase64(base64);
    setImageMimeType(mimeType);
    setCurrentStep(3);
  }

  function handleAnalysisComplete(result: WatchSuggestions) {
    setSuggestions(result);
    setFormData({
      brand: result.brand ?? "",
      model: result.model ?? "",
      reference: result.reference ?? "",
      dial_color: result.dial_color ?? "",
      case_material: result.case_material ?? "",
      case_diameter_mm: result.case_diameter_mm?.toString() ?? "",
      movement: result.movement ?? "",
      year_of_production: result.year_of_production?.toString() ?? "",
      condition: result.condition ?? "",
      accessories: result.accessories ?? "",
      description: result.description ?? "",
      asking_price: "",
      notes: "",
    });
    setCurrentStep(4);
  }

  function handleSkipAnalysis() {
    setCurrentStep(4);
  }

  function handleFormComplete(data: WatchFormData) {
    setFormData(data);
    setCurrentStep(5);
  }

  function handleReset() {
    setCurrentStep(1);
    setAcquisitionData(EMPTY_ACQUISITION);
    setImagePreview(null);
    setImageBase64(null);
    setImageMimeType(null);
    setSuggestions(null);
    setFormData(EMPTY_FORM);
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <button
              onClick={() => {
                if (step.id < currentStep) setCurrentStep(step.id);
              }}
              disabled={step.id > currentStep}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                currentStep === step.id &&
                  "bg-chronos-gold/10 text-chronos-gold",
                step.id < currentStep &&
                  "text-chronos-success cursor-pointer hover:bg-chronos-success/5",
                step.id > currentStep &&
                  "text-chronos-text-subtle cursor-not-allowed",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                  currentStep === step.id &&
                    "bg-chronos-gold/20 text-chronos-gold",
                  step.id < currentStep &&
                    "bg-chronos-success/20 text-chronos-success",
                  step.id > currentStep &&
                    "bg-chronos-surface-hover text-chronos-text-subtle",
                )}
              >
                {step.id < currentStep ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </div>
              <span className="hidden md:inline">{step.label}</span>
            </button>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-1 h-px flex-1 transition-colors",
                  step.id < currentStep
                    ? "bg-chronos-success/30"
                    : "bg-chronos-border",
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[500px]">
        {currentStep === 1 && (
          <StepAcquisition
            data={acquisitionData}
            onComplete={handleAcquisitionComplete}
          />
        )}
        {currentStep === 2 && (
          <StepUpload
            imagePreview={imagePreview}
            onImageSelected={handleImageSelected}
          />
        )}
        {currentStep === 3 && (
          <StepAnalysis
            imageBase64={imageBase64!}
            imageMimeType={imageMimeType!}
            imagePreview={imagePreview!}
            onAnalysisComplete={handleAnalysisComplete}
            onSkip={handleSkipAnalysis}
          />
        )}
        {currentStep === 4 && (
          <StepForm
            formData={formData}
            suggestions={suggestions}
            onComplete={handleFormComplete}
            onBack={() => setCurrentStep(3)}
          />
        )}
        {currentStep === 5 && (
          <StepSave
            formData={formData}
            acquisitionData={acquisitionData}
            imagePreview={imagePreview}
            imageBase64={imageBase64}
            imageMimeType={imageMimeType}
            aiSuggestions={suggestions}
            onEdit={() => setCurrentStep(4)}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
