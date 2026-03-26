import { create } from 'zustand';
import { QuizQuestion } from '../types';

interface EducationState {
  questions: QuizQuestion[];
  currentIdx: number;
  answers: Record<string, number>;
  score: number;
  quizComplete: boolean;
  setQuestions: (questions: QuizQuestion[]) => void;
  setAnswer: (questionId: string, answerIdx: number) => void;
  nextQuestion: () => void;
  completeQuiz: (score: number) => void;
  resetQuiz: () => void;
}

export const useEducationStore = create<EducationState>((set) => ({
  questions: [],
  currentIdx: 0,
  answers: {},
  score: 0,
  quizComplete: false,
  setQuestions: (questions) => set({ questions, currentIdx: 0, answers: {}, score: 0, quizComplete: false }),
  setAnswer: (questionId, answerIdx) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: answerIdx } })),
  nextQuestion: () =>
    set((state) => ({ currentIdx: Math.min(state.currentIdx + 1, state.questions.length - 1) })),
  completeQuiz: (score) => set({ quizComplete: true, score }),
  resetQuiz: () => set({ questions: [], currentIdx: 0, answers: {}, score: 0, quizComplete: false }),
}));
