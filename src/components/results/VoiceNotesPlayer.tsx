import { useState, useRef, useEffect } from "react";
import { Headphones, Play, Pause, SkipBack, SkipForward, Volume2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface VoiceNotesPlayerProps {
  audioUrl?: string;
  duration?: number;
}

export const VoiceNotesPlayer = ({ audioUrl, duration = 180 }: VoiceNotesPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate audio playback
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const handleSkipBack = () => {
    setCurrentTime(Math.max(0, currentTime - 10));
  };

  const handleSkipForward = () => {
    setCurrentTime(Math.min(duration, currentTime + 10));
  };

  const handleDownload = () => {
    toast.success("Voice notes downloaded!");
  };

  // Generate waveform bars
  const waveformBars = Array.from({ length: 50 }, () => Math.random() * 100);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-gradient-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-purple-500" />
            </div>
            <CardTitle>Voice Notes</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4" />
            Download MP3
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Waveform visualization */}
        <div className="h-20 flex items-center gap-0.5 mb-6 px-2">
          {waveformBars.map((height, index) => {
            const isActive = (index / waveformBars.length) * duration <= currentTime;
            return (
              <div
                key={index}
                className="flex-1 rounded-full transition-all duration-150"
                style={{
                  height: `${Math.max(20, height)}%`,
                  backgroundColor: isActive
                    ? "hsl(var(--accent))"
                    : "hsl(var(--muted))",
                }}
              />
            );
          })}
        </div>

        {/* Progress slider */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleSkipBack}>
            <SkipBack className="w-5 h-5" />
          </Button>
          
          <Button
            variant="hero"
            size="icon"
            className="w-14 h-14 rounded-full"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </Button>
          
          <Button variant="ghost" size="icon" onClick={handleSkipForward}>
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Volume control */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={(v) => setVolume(v[0])}
            className="w-32"
          />
          <span className="text-xs text-muted-foreground w-8">{volume}%</span>
        </div>
      </CardContent>
    </Card>
  );
};
