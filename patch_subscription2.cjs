const fs = require('fs');
let code = fs.readFileSync('src/lib/useSubscription.ts', 'utf8');

const regex = /let anonymousQuestions = 0;[\s\S]*?const flashcardsLeft = user \? \(isPremium \? Infinity : Math.max\(0, FREE_FLASHCARDS_LIMIT - currentFlashcards\)\) : 0;/;
const newCode = `let anonymousQuestions = 0;
  let anonymousFlashcards = 0;
  if (!user) {
    try {
      anonymousQuestions = parseInt(localStorage.getItem('apses_anon_questions') || '0', 10);
      anonymousFlashcards = parseInt(localStorage.getItem('apses_anon_flashcards') || '0', 10);
    } catch (e) {}
  }

  const canAnswerQuestion = user ? (isPremium ? true : currentQuestions < FREE_QUESTIONS_LIMIT) : (anonymousQuestions < ANONYMOUS_LIMIT);
  const canCreateFlashcard = user ? (isPremium ? true : currentFlashcards < FREE_FLASHCARDS_LIMIT) : (anonymousFlashcards < ANONYMOUS_LIMIT);
  const dailyQuestionsLeft = user ? (isPremium ? Infinity : Math.max(0, FREE_QUESTIONS_LIMIT - currentQuestions)) : Math.max(0, ANONYMOUS_LIMIT - anonymousQuestions);
  const flashcardsLeft = user ? (isPremium ? Infinity : Math.max(0, FREE_FLASHCARDS_LIMIT - currentFlashcards)) : Math.max(0, ANONYMOUS_LIMIT - anonymousFlashcards);`;

code = code.replace(regex, newCode);
fs.writeFileSync('src/lib/useSubscription.ts', code);
