import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { VideoUploader } from "@/components/upload/VideoUploader";
import { ProcessingState } from "@/components/results/ProcessingState";
import { ResultsSection } from "@/components/results/ResultsSection";
import { Footer } from "@/components/layout/Footer";

type AppState = "idle" | "processing" | "complete";

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "processing" | "complete";
}

const initialProcessingSteps: ProcessingStep[] = [
  {
    id: "extract",
    title: "Extracting Audio",
    description: "Separating audio track from video file",
    status: "pending",
  },
  {
    id: "transcribe",
    title: "Transcribing Speech",
    description: "Converting speech to text using AI",
    status: "pending",
  },
  {
    id: "summarize",
    title: "Generating Notes",
    description: "Creating structured summaries and key points",
    status: "pending",
  },
  {
    id: "voice",
    title: "Creating Voice Notes",
    description: "Converting notes to natural speech audio",
    status: "pending",
  },
  {
    id: "quiz",
    title: "Building Quiz",
    description: "Generating questions based on lecture content",
    status: "pending",
  },
];

const Index = () => {
  const [appState, setAppState] = useState<AppState>("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<ProcessingStep[]>(initialProcessingSteps);

  const handleUploadComplete = () => {
    setAppState("processing");
    setCurrentStep(0);
    setSteps(initialProcessingSteps.map((s) => ({ ...s, status: "pending" })));

    // Simulate processing steps
    simulateProcessing();
  };

  const simulateProcessing = () => {
    let step = 0;

    const processStep = () => {
      if (step >= initialProcessingSteps.length) {
        setAppState("complete");
        return;
      }

      setSteps((prev) =>
        prev.map((s, i) => ({
          ...s,
          status: i < step ? "complete" : i === step ? "processing" : "pending",
        }))
      );
      setCurrentStep(step);

      const delay = 1500 + Math.random() * 1500;
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((s, i) => ({
            ...s,
            status: i <= step ? "complete" : i === step + 1 ? "processing" : "pending",
          }))
        );
        step++;
        processStep();
      }, delay);
    };

    processStep();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {appState === "idle" && (
        <>
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <VideoUploader onUploadComplete={handleUploadComplete} isProcessing={false} />
        </>
      )}

      {appState === "processing" && (
        <div className="pt-16">
          <ProcessingState steps={steps} currentStep={currentStep} />
        </div>
      )}

      {appState === "complete" && (
        <div className="pt-16">
          <ResultsSection />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Index;
