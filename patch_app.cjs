const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const \[inviteInfo, setInviteInfo\] = useState<string \| null>\(null\);/;
const replacement = `const [inviteInfo, setInviteInfo] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const redirectInfo = sessionStorage.getItem('redirectAfterLogin');
      if (redirectInfo) {
        try {
          const { tab, params } = JSON.parse(redirectInfo);
          sessionStorage.removeItem('redirectAfterLogin');
          if (tab) {
             setTimeout(() => {
               handleNavigate(tab, params);
             }, 100);
          }
        } catch(e) {}
      }
    }
  }, [user]);`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched App successfully");
} else {
    console.log("Regex App didn't match");
}
