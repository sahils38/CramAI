import { Box, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-md">
            <Box className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">CramAI</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            Features
          </a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            How it Works
          </a>
          <a href="#upload" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            Get Started
          </a>
        </nav>

        <Button variant="hero" size="sm" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Try Free
        </Button>
      </div>
    </header>
  );
};
