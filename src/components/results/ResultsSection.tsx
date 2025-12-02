import { NotesDisplay } from "./NotesDisplay";
import { VoiceNotesPlayer } from "./VoiceNotesPlayer";
import { QuizInterface } from "./QuizInterface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Headphones, Brain } from "lucide-react";

// Mock data for demonstration
const mockNotes = {
  title: "Introduction to Machine Learning",
  summary:
    "This lecture covers the fundamental concepts of machine learning, including supervised and unsupervised learning, common algorithms, and practical applications in modern technology.",
  sections: [
    {
      heading: "What is Machine Learning?",
      content: [
        "Machine learning is a subset of artificial intelligence that enables computers to learn from data",
        "Unlike traditional programming, ML systems improve their performance through experience",
        "The field has grown significantly due to increases in computing power and data availability",
      ],
    },
    {
      heading: "Types of Machine Learning",
      content: [
        "Supervised Learning: Learning from labeled examples (classification, regression)",
        "Unsupervised Learning: Finding patterns in unlabeled data (clustering, dimensionality reduction)",
        "Reinforcement Learning: Learning through trial and error with rewards",
      ],
    },
    {
      heading: "Popular Algorithms",
      content: [
        "Linear Regression: Predicting continuous values",
        "Decision Trees: Making decisions based on feature splits",
        "Neural Networks: Complex pattern recognition inspired by the brain",
        "Support Vector Machines: Finding optimal decision boundaries",
      ],
    },
    {
      heading: "Real-World Applications",
      content: [
        "Image recognition and computer vision",
        "Natural language processing and chatbots",
        "Recommendation systems (Netflix, Spotify)",
        "Autonomous vehicles and robotics",
      ],
    },
  ],
  keyPoints: [
    "Machine learning enables computers to learn patterns from data without explicit programming",
    "The three main types are supervised, unsupervised, and reinforcement learning",
    "Choice of algorithm depends on the problem type and data characteristics",
    "ML is transforming industries from healthcare to entertainment",
  ],
};

const mockQuestions = [
  {
    id: 1,
    question: "What is the main difference between traditional programming and machine learning?",
    options: [
      "Machine learning uses more memory",
      "ML systems improve through experience rather than explicit rules",
      "Traditional programming is faster",
      "There is no difference",
    ],
    correctAnswer: 1,
    explanation:
      "Machine learning systems learn from data and improve their performance over time, while traditional programs follow explicitly coded rules.",
  },
  {
    id: 2,
    question: "Which type of machine learning uses labeled data for training?",
    options: [
      "Unsupervised Learning",
      "Reinforcement Learning",
      "Supervised Learning",
      "Deep Learning",
    ],
    correctAnswer: 2,
    explanation:
      "Supervised learning uses labeled examples where the correct output is known, allowing the model to learn the mapping from inputs to outputs.",
  },
  {
    id: 3,
    question: "What is a common application of clustering in machine learning?",
    options: [
      "Predicting house prices",
      "Customer segmentation",
      "Playing chess",
      "Translating languages",
    ],
    correctAnswer: 1,
    explanation:
      "Clustering, an unsupervised learning technique, is commonly used for customer segmentation to group similar customers together.",
  },
  {
    id: 4,
    question: "Which algorithm is inspired by the structure of the human brain?",
    options: [
      "Linear Regression",
      "Decision Trees",
      "Neural Networks",
      "K-Means",
    ],
    correctAnswer: 2,
    explanation:
      "Neural networks are inspired by biological neural networks in the brain, using interconnected nodes (neurons) to process information.",
  },
  {
    id: 5,
    question: "What type of learning does a recommendation system like Netflix primarily use?",
    options: [
      "Reinforcement Learning only",
      "Supervised and Collaborative Filtering",
      "Only Unsupervised Learning",
      "Rule-based systems",
    ],
    correctAnswer: 1,
    explanation:
      "Recommendation systems typically combine supervised learning with collaborative filtering to predict user preferences based on past behavior and similar users.",
  },
];

export const ResultsSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Your Study <span className="text-gradient">Materials</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore your AI-generated notes, listen to voice summaries, and test your knowledge.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="notes" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 h-14">
              <TabsTrigger value="notes" className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Text Notes</span>
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2 text-base">
                <Headphones className="w-4 h-4" />
                <span className="hidden sm:inline">Voice Notes</span>
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-2 text-base">
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">Quiz</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="animate-fade-in">
              <NotesDisplay notes={mockNotes} />
            </TabsContent>

            <TabsContent value="voice" className="animate-fade-in">
              <VoiceNotesPlayer duration={210} />
            </TabsContent>

            <TabsContent value="quiz" className="animate-fade-in">
              <QuizInterface questions={mockQuestions} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};
