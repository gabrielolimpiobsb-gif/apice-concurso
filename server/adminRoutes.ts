
import { doc, getDoc, collection, getDocs, updateDoc, setDoc, deleteDoc, query, where, limit } from 'firebase/firestore';
import express from 'express';
import { AVAILABLE_PACKS } from '../src/data/flashcardPacks';
export function setupAdminRoutes(app: express.Application, authenticate: express.RequestHandler, getDb: () => any) {
  const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (!user || user.uid === "guest") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const db = getDb();
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        return res.status(403).json({ error: "Forbidden - User not found" });
      }

      const userData = userDoc.data();
      const role = userData?.role || '';
      
      if (!['master', 'admin', 'suporte', 'editor'].includes(role)) {
        return res.status(403).json({ error: "Forbidden - Insufficient permissions" });
      }

      (req as any).adminRole = role;
      next();
    } catch (e) {
      console.error("[REQUIRE-ADMIN-ERROR]", e);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  const adminRouter = express.Router();
  adminRouter.use(authenticate);
  adminRouter.use(requireAdmin);

  // 1. Dashboard Stats
  adminRouter.get('/stats', async (req, res) => {
    try {
      const db = getDb();
      
      const usersSnap = await getDocs(collection(db, "users"));
      const totalUsers = usersSnap.size;
      
      let activeSubscribers = 0;
      let expiredSubscribers = 0;
      let newUsersThisMonth = 0;
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      
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
          if (!historyMap[key]) historyMap[key] = { date: key, newUsers: 0, newSubs: 0, flashcardsAmount: 0, userDetails: [], purchaseDetails: [] };
          historyMap[key].newUsers++;
          const isPremium = data.planStatus === 'premium' && isStripeValidated;
          if (isPremium) {
             historyMap[key].newSubs++;
          }
          historyMap[key].userDetails.push({
            name: data.displayName || 'Sem Nome',
            email: data.email || 'Sem E-mail',
            isPremium
          });
        }
      });

      const monthlyRevenue = activeSubscribers * 15.49;
      const potentialEarnings = activeSubscribers * 15.49;

      // Buscar resumo de compras de flashcards aprovadas pela Stripe
      let flashcardRevenue = 0;
      let flashcardSalesCount = 0;
      const purchasesSnap = await getDocs(collection(db, "flashcard_purchases"));
      purchasesSnap.forEach(pDoc => {
        const pData = pDoc.data();
        if (pData.status === 'approved' || pData.paymentStatus === 'paid') {
          flashcardSalesCount++;
          flashcardRevenue += Number(pData.amount || 0);
          
          const d = pData.timestamp ? new Date(pData.timestamp) : (pData.createdAt ? new Date(pData.createdAt) : null);
          if (d) {
             const key = getDayKey(d);
             if (!historyMap[key]) historyMap[key] = { date: key, newUsers: 0, newSubs: 0, flashcardsAmount: 0, userDetails: [], purchaseDetails: [] };
             historyMap[key].flashcardsAmount += Number(pData.amount || 0);
             historyMap[key].purchaseDetails.push({
               packTitle: pData.packTitle || 'Pacote de Flashcards',
               amount: Number(pData.amount || 0),
               userName: pData.userName || pData.userEmail || 'Usuário'
             });
          }
        }
      });
      
      const history = Object.values(historyMap).sort((a: any, b: any) => b.date.localeCompare(a.date));


      res.json({
        totalUsers,
        activeSubscribers,
        expiredSubscribers,
        newUsersThisMonth,
        monthlyRevenue,
        potentialEarnings,
        flashcardSalesCount,
        flashcardRevenue,
        history
      });
    } catch (error) {
      console.error("[ADMIN-STATS-ERROR]", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 1.1 Análise Completa de Vendas de Flashcards (Aprovadas pela Stripe)
  adminRouter.get('/flashcard-stats', async (req, res) => {
    try {
      const db = getDb();
      const purchasesSnap = await getDocs(collection(db, "flashcard_purchases"));
      
      let totalApprovedSales = 0;
      let totalRevenue = 0;
      const salesByPack = new Map<string, { count: number; revenue: number; title: string }>();
      const salesByDate = new Map<string, { date: string; count: number; revenue: number }>();
      const recentPurchases: any[] = [];

      purchasesSnap.forEach(docSnap => {
        const data = docSnap.data();
        // O sistema calcula SOMENTE compras aprovadas pela Stripe
        const isApproved = data.status === 'approved' || data.paymentStatus === 'paid';
        if (!isApproved) return;

        const amount = Number(data.amount || 0);
        totalApprovedSales++;
        totalRevenue += amount;

        const packId = data.packId || 'unknown';
        const packTitle = data.packTitle || packId;
        const currentPack = salesByPack.get(packId) || { count: 0, revenue: 0, title: packTitle };
        currentPack.count += 1;
        currentPack.revenue += amount;
        salesByPack.set(packId, currentPack);

        // Agrupamento por dia (para gráfico histórico)
        let dateStr = 'Recente';
        if (data.createdAt) {
          try {
            const d = new Date(data.createdAt);
            dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          } catch(e) {}
        }
        const currentDay = salesByDate.get(dateStr) || { date: dateStr, count: 0, revenue: 0 };
        currentDay.count += 1;
        currentDay.revenue += amount;
        salesByDate.set(dateStr, currentDay);

        recentPurchases.push({
          id: docSnap.id,
          userId: data.userId || 'N/A',
          userEmail: data.userEmail || 'Não informado',
          userName: data.userName || 'Cliente',
          packId: data.packId,
          packTitle: data.packTitle || data.packId,
          amount: amount,
          currency: data.currency || 'BRL',
          paymentStatus: data.paymentStatus || 'paid',
          status: 'approved',
          stripeSessionId: data.stripeSessionId || docSnap.id,
          createdAt: data.createdAt || new Date().toISOString(),
          timestamp: data.timestamp || 0,
          isTestSimulation: !!data.isTestSimulation
        });
      });

      // Ordenar compras recentes das mais novas para as mais antigas
      recentPurchases.sort((a, b) => {
        const timeA = a.timestamp || new Date(a.createdAt).getTime() || 0;
        const timeB = b.timestamp || new Date(b.createdAt).getTime() || 0;
        return timeB - timeA;
      });

      // Construir ranking de todos os pacotes conhecidos
      const packsBreakdown = AVAILABLE_PACKS.map(pack => {
        const packStats = salesByPack.get(pack.id) || { count: 0, revenue: 0, title: pack.title };
        const percentage = totalApprovedSales > 0 ? (packStats.count / totalApprovedSales) * 100 : 0;
        return {
          packId: pack.id,
          title: pack.title,
          price: pack.price,
          coverColor: pack.coverColor,
          cardsCount: pack.cardsCount,
          salesCount: packStats.count,
          revenue: packStats.revenue,
          percentage: Number(percentage.toFixed(1))
        };
      });

      // Se houver vendas de algum pacote não cadastrado na lista atual, adicioná-lo
      salesByPack.forEach((val, key) => {
        if (!AVAILABLE_PACKS.some(p => p.id === key)) {
          const percentage = totalApprovedSales > 0 ? (val.count / totalApprovedSales) * 100 : 0;
          packsBreakdown.push({
            packId: key,
            title: val.title,
            price: val.count > 0 ? val.revenue / val.count : 0,
            coverColor: 'from-gray-600 to-gray-800',
            cardsCount: 0,
            salesCount: val.count,
            revenue: val.revenue,
            percentage: Number(percentage.toFixed(1))
          });
        }
      });

      // Ordenação decrescente de vendas (o mais vendido primeiro!)
      packsBreakdown.sort((a, b) => {
        if (b.salesCount !== a.salesCount) {
          return b.salesCount - a.salesCount;
        }
        return b.revenue - a.revenue;
      });

      // Identificar o pacote campeão (o mais comprado)
      const topPack = packsBreakdown.length > 0 && packsBreakdown[0].salesCount > 0 
        ? packsBreakdown[0] 
        : null;

      const averageTicket = totalApprovedSales > 0 ? totalRevenue / totalApprovedSales : 0;

      // Formatar timeline de vendas para gráficos
      const salesTimeline = Array.from(salesByDate.values());

      res.json({
        totalApprovedSales,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        averageTicket: Number(averageTicket.toFixed(2)),
        topPack,
        packsBreakdown,
        recentPurchases,
        salesTimeline
      });
    } catch (e: any) {
      console.error("[ADMIN-FLASHCARD-STATS-ERROR]", e);
      res.status(500).json({ error: "Erro ao gerar estatísticas de flashcards: " + e.message });
    }
  });

  // Simulação de compra aprovada (útil para o administrador validar na interface)
  adminRouter.post('/flashcard-purchases/simulate-test', async (req, res) => {
    try {
      const { packId, userEmail, userName } = req.body;
      const targetPack = AVAILABLE_PACKS.find(p => p.id === packId) || AVAILABLE_PACKS[0];

      const testId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const db = getDb();
      
      const newPurchase = {
        id: testId,
        userId: 'test_admin_user',
        userEmail: userEmail || 'teste.aprovado@stripe.com',
        userName: userName || 'Aluno Teste',
        packId: targetPack.id,
        packTitle: targetPack.title,
        amount: targetPack.price,
        currency: 'brl',
        paymentStatus: 'paid',
        status: 'approved',
        stripeSessionId: testId,
        paymentIntentId: `pi_test_${Date.now()}`,
        createdAt: new Date().toISOString(),
        timestamp: Date.now(),
        isTestSimulation: true
      };

      await setDoc(doc(db, "flashcard_purchases", testId), newPurchase);
      res.json({ success: true, purchase: newPurchase });
    } catch(e: any) {
      console.error("[ADMIN-SIMULATE-PURCHASE-ERROR]", e);
      res.status(500).json({ error: e.message || "Erro ao simular compra." });
    }
  });

  // Excluir registro de compra de teste
  adminRouter.delete('/flashcard-purchases/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const db = getDb();
      await deleteDoc(doc(db, "flashcard_purchases", id));
      res.json({ success: true });
    } catch(e: any) {
      res.status(500).json({ error: e.message || "Erro ao remover compra." });
    }
  });

  // 2. List Users
  adminRouter.get('/users', async (req, res) => {
    try {
      const db = getDb();
      
      const usersSnap = await getDocs(query(collection(db, "users"), limit(500)));
      const users = [];

      usersSnap.docs.forEach(doc => {
        const uid = doc.id;
        const data = doc.data();

        let createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null);

        users.push({
          uid: uid,
          name: data.displayName || 'Sem nome',
          email: data.email || '',
          phone: data.phone || '',
          planStatus: data.planStatus || 'free',
          createdAt: createdAt,
          role: data.role || 'user',
          stripeCustomerId: data.stripeCustomerId || null,
          stripeSubscriptionId: data.stripeSubscriptionId || null
        });
      });

      users.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      res.json(users);
    } catch(e) {
      console.error(e);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 3. List Subscriptions
  adminRouter.get('/subscriptions', async (req, res) => {
    try {
      const db = getDb();
      const usersSnap = await getDocs(query(collection(db, "users"), where("planStatus", "==", "premium")));
      const subs = usersSnap.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          name: data.displayName || 'Sem nome',
          email: data.email || '',
          planStatus: data.planStatus || 'free',
          stripeCustomerId: data.stripeCustomerId || null,
          stripeSubscriptionId: data.stripeSubscriptionId || null,
        };
      });
      res.json(subs);
    } catch(e) {
      console.error(e);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 4. Update User Role
  adminRouter.post('/users/:uid/role', async (req, res) => {
    const role = (req as any).adminRole;
    if (role !== 'master') {
      return res.status(403).json({ error: "Apenas masters podem alterar permissões." });
    }
    const { uid } = req.params;
    const { newRole } = req.body;
    try {
      const db = getDb();
      await updateDoc(doc(db, "users", uid), { role: newRole });
      res.json({ success: true });
    } catch(e) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  
  adminRouter.post('/users/:uid/premium', async (req, res) => {
    try {
      console.log("[ADMIN] Activating premium for user:", req.params.uid);
      const db = getDb();
      await setDoc(doc(db, "users", req.params.uid), { 
        planStatus: 'premium',
        subscription: 'active',
        accountType: 'premium'
      }, { merge: true });
      console.log("[ADMIN] Successfully set premium for:", req.params.uid);
      res.json({ success: true });
    } catch(e) {
      console.error("[ADMIN] Error making premium:", e);
      res.status(500).json({ error: "Internal Server Error", details: String(e) });
    }
  });

  adminRouter.post('/users/:uid/remove-premium', async (req, res) => {
    try {
      console.log("[ADMIN] Removing premium for user:", req.params.uid);
      const db = getDb();
      await setDoc(doc(db, "users", req.params.uid), { 
        planStatus: 'free',
        subscription: 'inactive',
        accountType: 'free'
      }, { merge: true });
      console.log("[ADMIN] Successfully removed premium for:", req.params.uid);
      res.json({ success: true });
    } catch(e) {
      console.error("[ADMIN] Error removing premium:", e);
      res.status(500).json({ error: "Internal Server Error", details: String(e) });
    }
  });

  app.use('/api/admin', adminRouter);

}
