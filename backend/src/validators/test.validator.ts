import { z } from 'zod';

/**
 * Question schema for internal quiz
 */
export const questionSchema = z.object({
  id: z.string().optional(), // Auto-generated if not provided
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER']),
  question: z.string().min(5, 'Question must be at least 5 characters'),
  points: z.number().int().min(1).default(1),
  
  // For MULTIPLE_CHOICE
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.number(), z.boolean()]).optional(),
  
  // For TRUE_FALSE
  // correctAnswer should be boolean
  
  // For SHORT_ANSWER
  // correctAnswer should be string (case-insensitive match)
  acceptableAnswers: z.array(z.string()).optional(), // Multiple acceptable answers
});

export type Question = z.infer<typeof questionSchema>;

/**
 * Create test schema (supports both external link and internal quiz)
 */
export const createTestSchema = z.discriminatedUnion('type', [
  // External link test
  z.object({
    type: z.literal('EXTERNAL_LINK'),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    instructions: z.string().optional(),
    externalUrl: z.string().url('Must be a valid URL'),
    duration: z.number().int().min(1).optional(), // Optional duration hint
    passingScore: z.number().int().min(0).max(100).optional(), // Optional passing percentage
  }),
  
  // Internal quiz
  z.object({
    type: z.literal('INTERNAL_QUIZ'),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    instructions: z.string().optional(),
    duration: z.number().int().min(1), // Required for quiz
    passingScore: z.number().int().min(0).max(100), // Required passing percentage
    questions: z.array(questionSchema).min(1, 'At least one question is required'),
  }),
]);

export type CreateTestInput = z.infer<typeof createTestSchema>;

/**
 * Invite applicant to test
 */
export const inviteToTestSchema = z.object({
  testId: z.string().uuid(),
  message: z.string().optional(),
});

export type InviteToTestInput = z.infer<typeof inviteToTestSchema>;

/**
 * Submit internal quiz answers
 */
export const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.union([z.string(), z.number(), z.boolean()]),
    })
  ).min(1, 'At least one answer is required'),
});

export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;

/**
 * Mark external test as complete
 */
export const markExternalCompleteSchema = z.object({
  notes: z.string().optional(),
});

export type MarkExternalCompleteInput = z.infer<typeof markExternalCompleteSchema>;

/**
 * Get test attempts query
 */
export const testAttemptsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type TestAttemptsQuery = z.infer<typeof testAttemptsQuerySchema>;

/**
 * Calculate quiz score
 */
export function calculateQuizScore(
  questions: Question[],
  answers: Array<{ questionId: string; answer: any }>
): { score: number; totalScore: number; isPassed: boolean; passingScore: number } {
  let score = 0;
  let totalScore = 0;

  const answerMap = new Map(answers.map((a) => [a.questionId, a.answer]));

  questions.forEach((q) => {
    totalScore += q.points;
    const userAnswer = answerMap.get(q.id!);

    if (userAnswer === undefined) {
      return; // No answer provided
    }

    let isCorrect = false;

    switch (q.type) {
      case 'MULTIPLE_CHOICE':
        isCorrect = String(userAnswer).toLowerCase() === String(q.correctAnswer).toLowerCase();
        break;

      case 'TRUE_FALSE':
        isCorrect = Boolean(userAnswer) === Boolean(q.correctAnswer);
        break;

      case 'SHORT_ANSWER':
        const userAnswerStr = String(userAnswer).toLowerCase().trim();
        if (q.acceptableAnswers && q.acceptableAnswers.length > 0) {
          isCorrect = q.acceptableAnswers.some(
            (acceptable) => acceptable.toLowerCase().trim() === userAnswerStr
          );
        } else {
          isCorrect = userAnswerStr === String(q.correctAnswer).toLowerCase().trim();
        }
        break;
    }

    if (isCorrect) {
      score += q.points;
    }
  });

  // Calculate percentage
  const percentage = totalScore > 0 ? (score / totalScore) * 100 : 0;
  
  return {
    score,
    totalScore,
    isPassed: false, // Will be set based on passingScore
    passingScore: 0, // Will be set from test
  };
}

