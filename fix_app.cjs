const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove the wrong useEffect
const removeRegex = /useEffect\(\(\) => \{\s*if \(user\) \{\s*const redirectInfo = sessionStorage\.getItem\('redirectAfterLogin'\);[\s\S]*?\}, \[user\]\);\s*/;
code = code.replace(removeRegex, "");

// 2. Add it right after handleTabChange
const insertRegex = /(const handleTabChange = \(newTab: NavTab \| 'back', params\?: any\) => \{[\s\S]*?setActiveTab\(newTab as NavTab\);\s*\};)/;
const replacement = `$1

  useEffect(() => {
    if (user) {
      const redirectInfo = sessionStorage.getItem('redirectAfterLogin');
      if (redirectInfo) {
        try {
          const { tab, params } = JSON.parse(redirectInfo);
          sessionStorage.removeItem('redirectAfterLogin');
          if (tab) {
             setTimeout(() => {
               handleTabChange(tab, params);
             }, 100);
          }
        } catch(e) {}
      }
    }
  }, [user]);`;

if (insertRegex.test(code)) {
    code = code.replace(insertRegex, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed App successfully");
} else {
    console.log("Regex App didn't match");
}
