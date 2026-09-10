import express from 'express';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export function setupAdminRoutes(app: express.Application, authenticate: express.RequestHandler, getDb: () => any) {
  const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (!user || user.uid === "guest") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const db = getDb();
      const userDoc = await db.collection("users").doc(user.uid).get();
      if (!userDoc.exists) {
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
      
      const usersSnap = await db.collection('users').get();
      const totalUsers = usersSnap.size;
      
      let activeSubscribers = 0;
      let expiredSubscribers = 0;
      let newUsersThisMonth = 0;
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      usersSnap.forEach(doc => {
        const data = doc.data();
        if (data.planStatus === 'premium') {
           activeSubscribers++;
        }
        if (data.createdAt) {
          const createdAt = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          if (createdAt >= startOfMonth) {
            newUsersThisMonth++;
          }
        }
      });

      const monthlyRevenue = activeSubscribers * 15.49;
      const potentialEarnings = activeSubscribers * 15.49;

      res.json({
        totalUsers,
        activeSubscribers,
        expiredSubscribers,
        newUsersThisMonth,
        monthlyRevenue,
        potentialEarnings
      });
    } catch (error) {
      console.error("[ADMIN-STATS-ERROR]", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 2. List Users
  adminRouter.get('/users', async (req, res) => {
    try {
      const db = getDb();
      
      let authUsers = [];
      try {
        const listUsersResult = await getAuth().listUsers(1000);
        authUsers = listUsersResult.users;
      } catch (authErr) {
        console.error("Error fetching auth users:", authErr);
      }
      
      const authUsersMap = {};
      authUsers.forEach(u => {
        authUsersMap[u.uid] = {
           email: u.email,
           name: u.displayName,
           phone: u.phoneNumber,
           createdAt: new Date(u.metadata.creationTime)
        };
      });

      const usersSnap = await db.collection('users').limit(500).get();
      const firestoreUsersMap = {};
      usersSnap.docs.forEach(doc => {
        firestoreUsersMap[doc.id] = doc.data();
      });

      const allUserIds = new Set([...authUsers.map(u => u.uid), ...Object.keys(firestoreUsersMap)]);
      const users = [];

      allUserIds.forEach(uid => {
        const authInfo = authUsersMap[uid] || {};
        const data = firestoreUsersMap[uid] || {};

        let createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null);
        if (!createdAt && authInfo.createdAt) {
          createdAt = authInfo.createdAt;
        }

        users.push({
          uid: uid,
          name: data.displayName || authInfo.name || 'Sem nome',
          email: data.email || authInfo.email || '',
          phone: data.phone || authInfo.phone || '',
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
      const usersSnap = await db.collection('users').where('planStatus', '==', 'premium').get();
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
      await db.collection('users').doc(uid).update({ role: newRole });
      res.json({ success: true });
    } catch(e) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  
  adminRouter.post('/users/:uid/premium', async (req, res) => {
    try {
      console.log("[ADMIN] Activating premium for user:", req.params.uid);
      const db = getDb();
      await db.collection('users').doc(req.params.uid).set({ 
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
      await db.collection('users').doc(req.params.uid).set({ 
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
