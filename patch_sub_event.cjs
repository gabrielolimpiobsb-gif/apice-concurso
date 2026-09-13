const fs = require('fs');
let code = fs.readFileSync('src/lib/useSubscription.ts', 'utf8');

const oldLogic = `  const [loading, setLoading] = useState<boolean>(() => {
    if (!user) return false;`;

const newLogic = `  const [anonTick, setAnonTick] = useState(0);
  useEffect(() => {
    const handleAnon = () => setAnonTick(t => t + 1);
    window.addEventListener('apses:anon-updated', handleAnon);
    return () => window.removeEventListener('apses:anon-updated', handleAnon);
  }, []);

  const [loading, setLoading] = useState<boolean>(() => {
    if (!user) return false;`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/lib/useSubscription.ts', code);
