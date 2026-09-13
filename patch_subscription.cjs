const fs = require('fs');
let code = fs.readFileSync('src/lib/useSubscription.ts', 'utf8');

// Replace the limit block
const oldLogic = `  // Auto-renew daily limit locally for display/guards without triggering infinite write loops
  const todayStr = getBrazilTodayStr();
  const isDateMismatched = profile && profile.lastQuestionResetDate !== todayStr;
  
  const FREE_QUESTIONS_LIMIT = 15;
  const FREE_FLASHCARDS_LIMIT = 3;

  let currentDailyQuestions = profile?.dailyQuestionsCount || 0;
  if (isDateMismatched) {
    currentDailyQuestions = 0;
  }
  let currentFlashcards = profile?.aiFlashcardsUsedCount || 0;

  const canAnswerQuestion = isPremium ? true : currentDailyQuestions < FREE_QUESTIONS_LIMIT;
  const canCreateFlashcard = isPremium ? true : currentFlashcards < FREE_FLASHCARDS_LIMIT;
  const dailyQuestionsLeft = isPremium ? Infinity : Math.max(0, FREE_QUESTIONS_LIMIT - currentDailyQuestions);
  const flashcardsLeft = isPremium ? Infinity : Math.max(0, FREE_FLASHCARDS_LIMIT - currentFlashcards);`;

const newLogic = `  const FREE_QUESTIONS_LIMIT = 15;
  const FREE_FLASHCARDS_LIMIT = 15;
  const ANONYMOUS_LIMIT = 3;

  let currentQuestions = profile?.dailyQuestionsCount || 0;
  let currentFlashcards = profile?.aiFlashcardsUsedCount || 0;

  // Handle anonymous users
  let anonymousQuestions = 0;
  if (!user) {
    try {
      anonymousQuestions = parseInt(localStorage.getItem('apses_anon_questions') || '0', 10);
    } catch (e) {}
  }

  const canAnswerQuestion = user ? (isPremium ? true : currentQuestions < FREE_QUESTIONS_LIMIT) : (anonymousQuestions < ANONYMOUS_LIMIT);
  const canCreateFlashcard = user ? (isPremium ? true : currentFlashcards < FREE_FLASHCARDS_LIMIT) : false; // no flashcards for anon
  const dailyQuestionsLeft = user ? (isPremium ? Infinity : Math.max(0, FREE_QUESTIONS_LIMIT - currentQuestions)) : Math.max(0, ANONYMOUS_LIMIT - anonymousQuestions);
  const flashcardsLeft = user ? (isPremium ? Infinity : Math.max(0, FREE_FLASHCARDS_LIMIT - currentFlashcards)) : 0;`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/lib/useSubscription.ts', code);
