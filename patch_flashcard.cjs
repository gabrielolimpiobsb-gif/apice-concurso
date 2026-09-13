const fs = require('fs');
let code = fs.readFileSync('src/components/QuestionsScreen.tsx', 'utf8');

const regex = /if \(\!isPremium && \!canCreateFlashcard\) \{[\s\S]*?return;\s*\}/g;
const newCode = `if (!canCreateFlashcard) {
                                          if (!user) {
                                              setPaywallType({ title: "Crie sua conta para continuar", feature: "Mais 15 flashcards gratuitos!" });
                                          } else {
                                              setPaywallType({ title: "Limite de Flashcards Atingido", feature: "Flashcards" });
                                          }
                                          setShowPaywall(true);
                                          return;
                                      }`;

code = code.replace(regex, newCode);
fs.writeFileSync('src/components/QuestionsScreen.tsx', code);
