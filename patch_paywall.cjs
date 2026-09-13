const fs = require('fs');
let code = fs.readFileSync('src/components/PremiumPaywall.tsx', 'utf8');

const regex = /const handleSubscribe = \(\) => \{[\s\S]*?\};/;
const newRegex = `
  const { user } = useAuth();
  const handleSubscribe = () => {
    onClose();
    if (!user) {
      window.dispatchEvent(new CustomEvent('NAVIGATE_TO', { detail: 'profile' }));
      return;
    }
    window.dispatchEvent(new CustomEvent('NAVIGATE_TO', { detail: 'home' }));
    setTimeout(() => {
      document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 250);
  };`;

code = code.replace(regex, newRegex);
code = code.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\nimport { useAuth } from '../lib/AuthContext';");
code = code.replace("Assinar Plano Premium", "{!user ? 'Criar Conta Grátis' : 'Assinar Plano Premium'}");

fs.writeFileSync('src/components/PremiumPaywall.tsx', code);
