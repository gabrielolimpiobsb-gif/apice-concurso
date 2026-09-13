const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /case 'seo-questions': \{[\s\S]*?<\/SeoQuestionsPage>\s*\);\s*\}/g;
const newCode = `case 'seo-questions': {
        const { slug } = navHistory[navHistory.length - 1].params || { slug: '' };
        return (
          <SeoQuestionsPage
            slug={slug}
            onStartSolving={(filters, filteredQs) => {
               setSessionFilterConfig(filters);
               setSessionQuestions(filteredQs);
               setActiveSession(null);
               handleTabChange('questions');
            }}
          />
        );
      }`;

code = code.replace(regex, newCode);
fs.writeFileSync('src/App.tsx', code);
