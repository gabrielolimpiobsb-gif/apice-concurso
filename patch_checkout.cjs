const fs = require('fs');
let code = fs.readFileSync('src/components/FlashcardsScreen.tsx', 'utf8');

const regex = /const handleStripeCheckout = async \([\s\S]*?try \{[\s\S]*?const user = auth\.currentUser;/;
const replacement = `const handleStripeCheckout = async (packId: string, packTitle: string, packPrice: number, priceId?: string, paymentLink?: string) => {
    try {
      setIsProcessing(true);
      const auth = (await import('../lib/firebase')).auth;
      const user = auth.currentUser;

      if (!user) {
         sessionStorage.setItem('redirectAfterLogin', JSON.stringify({ tab: activeTab === 'loja' ? 'packs-store' : 'flashcards', params: { viewingPack: packId } }));
         if (onNavigate) onNavigate('profile');
         setIsProcessing(false);
         return;
      }`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/FlashcardsScreen.tsx', code);
    console.log("Patched checkout successfully");
} else {
    console.log("Regex checkout didn't match");
}
