const fs = require('fs');

const file = 'server/adminRoutes.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /usersSnap\.forEach\(doc => \{[\s\S]*?const potentialEarnings = activeSubscribers \* 15\.49;/m,
  `
      const historyMap = {};
      const getDayKey = (d) => {
        try {
          return d.toISOString().split('T')[0];
        } catch(e) { return new Date().toISOString().split('T')[0]; }
      };

      usersSnap.forEach(doc => {
        const data = doc.data();
        
        // Verifica se a assinatura foi validada pela Stripe
        const isStripeValidated = !!(data.stripeSubscriptionId || data.stripeCustomerId || data.subscription === 'active');
        
        if (data.planStatus === 'premium' && isStripeValidated) {
           activeSubscribers++;
        }
        
        if (data.createdAt) {
          const createdAt = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          if (createdAt >= startOfMonth) {
            newUsersThisMonth++;
          }
          
          const key = getDayKey(createdAt);
          if (!historyMap[key]) historyMap[key] = { date: key, newUsers: 0, newSubs: 0, flashcardsAmount: 0 };
          historyMap[key].newUsers++;
          if (data.planStatus === 'premium' && isStripeValidated) {
             historyMap[key].newSubs++;
          }
        }
      });

      const monthlyRevenue = activeSubscribers * 15.49;
      const potentialEarnings = activeSubscribers * 15.49;`
);

code = code.replace(
  /purchasesSnap\.forEach\(pDoc => \{[\s\S]*?\}\);/m,
  `purchasesSnap.forEach(pDoc => {
        const pData = pDoc.data();
        if (pData.status === 'approved' || pData.paymentStatus === 'paid') {
          flashcardSalesCount++;
          flashcardRevenue += Number(pData.amount || 0);
          
          const d = pData.timestamp ? new Date(pData.timestamp) : (pData.createdAt ? new Date(pData.createdAt) : null);
          if (d) {
             const key = getDayKey(d);
             if (!historyMap[key]) historyMap[key] = { date: key, newUsers: 0, newSubs: 0, flashcardsAmount: 0 };
             historyMap[key].flashcardsAmount += Number(pData.amount || 0);
          }
        }
      });
      
      const history = Object.values(historyMap).sort((a, b) => b.date.localeCompare(a.date));
`
);

code = code.replace(
  /flashcardRevenue\n      \}\);/m,
  `flashcardRevenue,
        history
      });`
);

fs.writeFileSync(file, code);
console.log("Updated adminRoutes.ts");
