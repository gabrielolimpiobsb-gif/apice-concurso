const fs = require('fs');
let code = fs.readFileSync('src/components/QuestionsScreen.tsx', 'utf8');

const oldCheck = `    if (!canAnswerQuestion) {
      setPaywallType({ title: "Limite de Questões Gratuitas Atingido", feature: "Questões Comentadas" });
      setShowPaywall(true);
      return;
    }`;

const newCheck = `    if (!canAnswerQuestion) {
      if (!user) {
        setPaywallType({ title: "Crie sua conta para continuar", feature: "Mais 15 questões gratuitas!" });
        setShowPaywall(true);
      } else {
        setPaywallType({ title: "Limite de Questões Gratuitas Atingido", feature: "Questões Comentadas" });
        setShowPaywall(true);
      }
      return;
    }`;

code = code.replace(oldCheck, newCheck);
fs.writeFileSync('src/components/QuestionsScreen.tsx', code);
