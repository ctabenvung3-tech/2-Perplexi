export enum QuestionType {
  SHORT_ANSWER = 'SHORT_ANSWER',
  PARAGRAPH = 'PARAGRAPH',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  CHECKBOXES = 'CHECKBOXES',
  DROPDOWN = 'DROPDOWN',
  DYNAMIC_TABLE = 'DYNAMIC_TABLE',
}

export interface Question {
  id: string;
  title: string;
  description?: string;
  questionType: QuestionType;
  options: string[];
  columns?: string[];
  isRequired: boolean;
}

export interface Survey {
  title: string;
  description: string;
  questions: Question[];
}

export type SurveyResponseValue = string | string[] | Record<string, string>[];

export interface SurveyResponse {
  [questionId: string]: SurveyResponseValue;
}
