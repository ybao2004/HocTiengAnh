
export interface QuestionContent {
  prompt: string;
  content: string;
}

export interface SolutionContent {
  english: string;
  vietnamese: string;
}

export interface Question {
  questionNumber: number;
  english: QuestionContent;
  vietnamese: QuestionContent;
  solution: SolutionContent;
}

export interface TestResult {
  title: string;
  timeAllotted: string;
  questions: Question[];
}
