import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { VideoUploader } from "@/components/upload/VideoUploader";
import { ProcessingState } from "@/components/results/ProcessingState";
import { ResultsSection } from "@/components/results/ResultsSection";
import { Footer } from "@/components/layout/Footer";
import { api, NoteSection, QuizQuestion } from "@/lib/api";
import { toast } from "sonner";

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

// Map backend status to step index
const statusToStepIndex: Record<string, number> = {
  pending: -1,
  extracting_audio: 0,
  transcribing: 1,
  generating_notes: 2,
  creating_voice: 3,
  building_quiz: 4,
  completed: 5,
  failed: -1,
};

interface Results {
  notes: NoteSection[];
  quiz: QuizQuestion[];
  audioUrl: string;
}

const Index = () => {
  const [appState, setAppState] = useState<AppState>("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<ProcessingStep[]>(initialProcessingSteps);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const handleUploadComplete = (newTaskId: string) => {
    setTaskId(newTaskId);
    setAppState("processing");
    setCurrentStep(0);
    setSteps(initialProcessingSteps.map((s) => ({ ...s, status: "pending" })));

    // Start polling for status
    startPolling(newTaskId);
  };

  const startPolling = (taskIdToCheck: string) => {
    // Clear any existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    const pollStatus = async () => {
      try {
        const status = await api.getStatus(taskIdToCheck);

        const stepIndex = statusToStepIndex[status.status] ?? -1;

        // Update steps based on current status
        setSteps((prev) =>
          prev.map((s, i) => ({
            ...s,
            status: i < stepIndex ? "complete" : i === stepIndex ? "processing" : "pending",
          }))
        );
        setCurrentStep(Math.max(0, stepIndex));

        // Check if completed
        if (status.status === "completed") {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }

          // Mark all steps as complete
          setSteps((prev) => prev.map((s) => ({ ...s, status: "complete" })));

          // Fetch results
          const resultsData = await api.getResults(taskIdToCheck);
          setResults({
            notes: resultsData.notes,
            quiz: resultsData.quiz,
            audioUrl: api.getAudioUrl(taskIdToCheck),
          });

          setAppState("complete");
          toast.success("Your study materials are ready!");
        }

        // Check if failed
        if (status.status === "failed") {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          toast.error("Processing failed. Please try again.");
          setAppState("idle");
          setSteps(initialProcessingSteps.map((s) => ({ ...s, status: "pending" })));
        }
      } catch (error) {
        console.error("Polling error:", error);
        // Don't show error toast for every poll failure - server might be busy processing
      }
    };

    // Initial poll
    pollStatus();

    // Poll every 2 seconds
    pollingRef.current = setInterval(pollStatus, 2000);
  };

  const handleStartOver = () => {
    // Cleanup old task
    if (taskId) {
      api.deleteTask(taskId).catch(console.error);
    }

    setAppState("idle");
    setTaskId(null);
    setResults(null);
    setSteps(initialProcessingSteps.map((s) => ({ ...s, status: "pending" })));
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

      {appState === "complete" && results && (
        <div className="pt-16">
          <ResultsSection
            notes={results.notes}
            quiz={results.quiz}
            audioUrl={results.audioUrl}
            onStartOver={handleStartOver}
          />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Index;
