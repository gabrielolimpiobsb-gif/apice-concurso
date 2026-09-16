const fs = require('fs');
let code = fs.readFileSync('src/components/FlashcardsScreen.tsx', 'utf8');

const regex = /(useEffect\(\(\) => \{\s*\/\/ When active tab changes[\s\S]*?\}, \[activeTab\]\);)/;

const newHook = `
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStarted) return;
      
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
      if (showAddModal || showEditModal || showDeleteConfirm || showPurchaseConfirm) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsFlipped(prev => !prev);
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSkip();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          handleShuffle();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, showAddModal, showEditModal, showDeleteConfirm, showPurchaseConfirm, currentIndex, deck.length]);
`;

if(regex.test(code)) {
    code = code.replace(regex, `$1\n${newHook}`);
    fs.writeFileSync('src/components/FlashcardsScreen.tsx', code);
    console.log("Patched successfully");
} else {
    console.log("Regex didn't match");
}
