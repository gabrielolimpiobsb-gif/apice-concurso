import express from 'express';
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

export interface RecordConversionOptions {
  affiliateId?: string;
  affiliateCode?: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  plan: string;
  amount: number;
  stripeSessionId?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  status?: string;
}

export async function recordAffiliateSubscription(
  db: any, 
  options: RecordConversionOptions
): Promise<{ success: boolean; commission: number; affiliateId: string | null }> {
  try {
    let affiliateId = options.affiliateId;
    let affiliateCode = options.affiliateCode;

    // 1. If affiliateId not provided, check user's document
    if (!affiliateId && options.userId) {
      try {
        const userDoc = await getDoc(doc(db, "users", options.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          affiliateId = userData.affiliateId;
          affiliateCode = userData.affiliateCode || affiliateCode;
        }
      } catch (err) {
        console.warn("[AFFILIATE-CONVERSION] Could not fetch user doc:", err);
      }
    }

    if (!affiliateId) {
      return { success: false, commission: 0, affiliateId: null };
    }

    // 2. Fetch affiliate details
    const affRef = doc(db, "affiliates", affiliateId);
    const affSnap = await getDoc(affRef);
    if (!affSnap.exists()) {
      console.warn(`[AFFILIATE-CONVERSION] Affiliate ${affiliateId} not found`);
      return { success: false, commission: 0, affiliateId: null };
    }

    const affData = affSnap.data() as any;
    affiliateCode = affiliateCode || affData.code;
    const commissionRate = typeof affData.commissionRate === 'number' ? affData.commissionRate : 30;
    const commission = Math.round((options.amount * (commissionRate / 100)) * 100) / 100;

    // 3. Deduplication check: Has this stripeSessionId or subscription already been credited?
    const subDocId = options.stripeSessionId || options.stripeSubscriptionId || `sub_${Date.now()}_${options.userId}`;
    const subRef = doc(db, "affiliate_subscriptions", subDocId);
    const existingSub = await getDoc(subRef);
    
    if (existingSub.exists() && existingSub.data()?.status === 'paid') {
      console.log(`[AFFILIATE-CONVERSION] Subscription ${subDocId} already processed.`);
      return { success: true, commission, affiliateId };
    }

    const nowIso = new Date().toISOString();

    // 4. Save Affiliate Subscription Record
    await setDoc(subRef, {
      id: subDocId,
      affiliateId,
      affiliateCode,
      userId: options.userId,
      userEmail: options.userEmail || '',
      userName: options.userName || '',
      plan: options.plan || 'premium',
      amount: options.amount,
      commission,
      currency: 'BRL',
      stripeCustomerId: options.stripeCustomerId || null,
      stripeSubscriptionId: options.stripeSubscriptionId || null,
      stripeSessionId: options.stripeSessionId || null,
      status: options.status || 'paid',
      createdAt: nowIso,
      updatedAt: nowIso
    }, { merge: true });

    // 5. Log event in affiliate_events
    const eventRef = doc(collection(db, "affiliate_events"));
    await setDoc(eventRef, {
      id: eventRef.id,
      affiliateId,
      affiliateCode,
      visitorId: '',
      userId: options.userId,
      eventType: 'subscription_created',
      eventDate: nowIso,
      metadata: {
        plan: options.plan,
        amount: options.amount,
        commission,
        stripeSessionId: options.stripeSessionId,
        userEmail: options.userEmail
      },
      createdAt: nowIso,
      timestamp: Date.now()
    });

    // 6. Update affiliate aggregate metrics
    const currentMetrics = affData.metrics || {};
    const newMetrics = {
      ...currentMetrics,
      subscriptions: (currentMetrics.subscriptions || 0) + 1,
      totalRevenue: Math.round(((currentMetrics.totalRevenue || 0) + options.amount) * 100) / 100,
      totalCommission: Math.round(((currentMetrics.totalCommission || 0) + commission) * 100) / 100
    };

    await updateDoc(affRef, {
      metrics: newMetrics,
      updatedAt: nowIso
    });

    console.log(`[AFFILIATE-CONVERSION] Successfully attributed R$ ${options.amount} to affiliate ${affData.name} (${affiliateCode}). Commission: R$ ${commission}`);
    return { success: true, commission, affiliateId };
  } catch (err) {
    console.error("[AFFILIATE-CONVERSION-ERROR]", err);
    return { success: false, commission: 0, affiliateId: null };
  }
}

export function setupAffiliateRoutes(
  app: express.Application, 
  authenticate: express.RequestHandler, 
  getDb: () => any
) {
  const router = express.Router();

  // Helper to fetch global config
  async function getAffiliateConfig(db: any) {
    try {
      const snap = await getDoc(doc(db, "affiliate_config", "settings"));
      if (snap.exists()) {
        return snap.data();
      }
    } catch (e) {}
    return {
      attributionWindowDays: 90,
      attributionModel: 'first_touch',
      defaultCommissionRate: 30
    };
  }

  // ==========================================
  // PUBLIC TRACKING ENDPOINTS
  // ==========================================

  // 1. Track Visit / Click
  router.post('/track-visit', async (req, res) => {
    try {
      const {
        code,
        visitorId,
        landingPage,
        referrer,
        device,
        browser,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm
      } = req.body;

      if (!code || !visitorId) {
        return res.status(400).json({ error: 'Código e visitorId são obrigatórios' });
      }

      const db = getDb();
      const cleanCode = String(code).trim().toUpperCase();

      // Find affiliate by code
      const affQuery = query(collection(db, "affiliates"), where("code", "==", cleanCode), limit(1));
      const affSnap = await getDocs(affQuery);

      if (affSnap.empty) {
        // Try case-insensitive / lowercase search
        const affLowerQuery = query(collection(db, "affiliates"), where("code", "==", String(code).trim().toLowerCase()), limit(1));
        const affLowerSnap = await getDocs(affLowerQuery);
        if (affLowerSnap.empty) {
          return res.status(404).json({ error: 'Afiliado não encontrado' });
        }
      }

      const targetDoc = affSnap.empty ? (await getDocs(query(collection(db, "affiliates"), where("code", "==", String(code).trim().toLowerCase()), limit(1)))).docs[0] : affSnap.docs[0];
      const affData = targetDoc.data();
      const affiliateId = targetDoc.id;

      if (affData.status !== 'active') {
        return res.status(400).json({ error: 'Afiliado inativo no momento' });
      }

      const config = await getAffiliateConfig(db);
      const windowDays = Number(config.attributionWindowDays) || 90;
      const model = config.attributionModel || 'first_touch';

      const now = new Date();
      const nowIso = now.toISOString();
      let expiresAt: string | null = null;
      if (windowDays > 0) {
        const expDate = new Date(now.getTime() + windowDays * 24 * 60 * 60 * 1000);
        expiresAt = expDate.toISOString();
      }

      // Check existing attribution for this visitorId
      const attrDocRef = doc(db, "affiliate_attributions", visitorId);
      const attrSnap = await getDoc(attrDocRef);

      let attributionToSave: any;
      let isNewVisitor = false;

      if (attrSnap.exists()) {
        const existingAttr = attrSnap.data();
        const isExpired = existingAttr.attributionExpiresAt && new Date(existingAttr.attributionExpiresAt).getTime() < now.getTime();

        if (model === 'first_touch' && !isExpired && existingAttr.affiliateId !== affiliateId) {
          // First touch protection: Keep existing active attribution!
          return res.json({
            success: true,
            message: 'First-touch preservado',
            affiliate: {
              id: existingAttr.affiliateId,
              code: existingAttr.affiliateCode,
              name: existingAttr.affiliateName || ''
            },
            attribution: existingAttr,
            attributionWindowDays: windowDays
          });
        }

        // Update existing attribution
        attributionToSave = {
          ...existingAttr,
          affiliateId,
          affiliateCode: cleanCode,
          affiliateName: affData.name,
          lastVisitAt: nowIso,
          attributionExpiresAt: expiresAt,
          device: device || existingAttr.device,
          browser: browser || existingAttr.browser,
          landingPage: landingPage || existingAttr.landingPage,
          referrer: referrer || existingAttr.referrer,
          utmSource: utmSource || existingAttr.utmSource || null,
          utmMedium: utmMedium || existingAttr.utmMedium || null,
          utmCampaign: utmCampaign || existingAttr.utmCampaign || null,
          utmContent: utmContent || existingAttr.utmContent || null,
          utmTerm: utmTerm || existingAttr.utmTerm || null,
          updatedAt: nowIso
        };
      } else {
        // New visitor
        isNewVisitor = true;
        attributionToSave = {
          id: visitorId,
          affiliateId,
          affiliateCode: cleanCode,
          affiliateName: affData.name,
          visitorId,
          userId: null,
          firstVisitAt: nowIso,
          lastVisitAt: nowIso,
          attributionExpiresAt: expiresAt,
          device: device || 'desktop',
          browser: browser || 'unknown',
          landingPage: landingPage || '/',
          referrer: referrer || '',
          utmSource: utmSource || null,
          utmMedium: utmMedium || null,
          utmCampaign: utmCampaign || null,
          utmContent: utmContent || null,
          utmTerm: utmTerm || null,
          status: 'active',
          createdAt: nowIso,
          updatedAt: nowIso
        };
      }

      // Save attribution document
      await setDoc(attrDocRef, attributionToSave, { merge: true });

      // Log event
      const eventRef = doc(collection(db, "affiliate_events"));
      await setDoc(eventRef, {
        id: eventRef.id,
        affiliateId,
        affiliateCode: cleanCode,
        visitorId,
        userId: null,
        eventType: 'visit',
        eventDate: nowIso,
        metadata: {
          landingPage,
          referrer,
          device,
          browser,
          utmSource,
          utmMedium,
          utmCampaign,
          utmContent,
          utmTerm
        },
        createdAt: nowIso,
        timestamp: Date.now()
      });

      // Update metrics on affiliate
      const currentMetrics = affData.metrics || {};
      const newMetrics = {
        ...currentMetrics,
        visits: (currentMetrics.visits || 0) + 1,
        uniqueVisitors: (currentMetrics.uniqueVisitors || 0) + (isNewVisitor ? 1 : 0)
      };

      await updateDoc(targetDoc.ref, {
        metrics: newMetrics,
        updatedAt: nowIso
      });

      return res.json({
        success: true,
        affiliate: {
          id: affiliateId,
          code: cleanCode,
          name: affData.name
        },
        attribution: attributionToSave,
        attributionWindowDays: windowDays
      });
    } catch (err: any) {
      console.error("[AFFILIATE-TRACK-VISIT-ERROR]", err);
      res.status(500).json({ error: err.message || 'Erro ao registrar acesso' });
    }
  });

  // 2. Track Signup
  router.post('/track-signup', async (req, res) => {
    try {
      const { userId, email, name, visitorId, affiliateId, affiliateCode } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório' });
      }

      const db = getDb();
      let targetAffiliateId = affiliateId;
      let targetAffiliateCode = affiliateCode;

      // Check attribution document by visitorId if affiliateId not supplied
      if ((!targetAffiliateId || !targetAffiliateCode) && visitorId) {
        const attrSnap = await getDoc(doc(db, "affiliate_attributions", visitorId));
        if (attrSnap.exists()) {
          const attrData = attrSnap.data();
          targetAffiliateId = attrData.affiliateId;
          targetAffiliateCode = attrData.affiliateCode;
        }
      }

      if (!targetAffiliateId) {
        return res.json({ success: false, message: 'Nenhum afiliado atribuído' });
      }

      // Check affiliate doc
      const affRef = doc(db, "affiliates", targetAffiliateId);
      const affSnap = await getDoc(affRef);
      if (!affSnap.exists()) {
        return res.status(404).json({ error: 'Afiliado não encontrado' });
      }
      const affData = affSnap.data();

      // Deduplication: Has signup already been registered for this userId?
      const existingUserQuery = query(
        collection(db, "affiliate_events"), 
        where("userId", "==", userId), 
        where("eventType", "==", "signup"),
        limit(1)
      );
      const existingSnap = await getDocs(existingUserQuery);
      if (!existingSnap.empty) {
        return res.json({ success: true, message: 'Cadastro já atribuído anteriormente' });
      }

      const nowIso = new Date().toISOString();

      // 1. Update user document
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, {
        affiliateId: targetAffiliateId,
        affiliateCode: targetAffiliateCode,
        affiliateAttributedAt: nowIso
      }, { merge: true });

      // 2. Update attribution if exists
      if (visitorId) {
        const attrRef = doc(db, "affiliate_attributions", visitorId);
        await setDoc(attrRef, {
          userId,
          status: 'converted',
          updatedAt: nowIso
        }, { merge: true });
      }

      // 3. Log event
      const eventRef = doc(collection(db, "affiliate_events"));
      await setDoc(eventRef, {
        id: eventRef.id,
        affiliateId: targetAffiliateId,
        affiliateCode: targetAffiliateCode,
        visitorId: visitorId || '',
        userId,
        eventType: 'signup',
        eventDate: nowIso,
        metadata: {
          email,
          name
        },
        createdAt: nowIso,
        timestamp: Date.now()
      });

      // 4. Increment signups on affiliate
      const currentMetrics = affData.metrics || {};
      await updateDoc(affRef, {
        'metrics.signups': (currentMetrics.signups || 0) + 1,
        updatedAt: nowIso
      });

      return res.json({
        success: true,
        attribution: {
          affiliateId: targetAffiliateId,
          affiliateCode: targetAffiliateCode,
          userId
        }
      });
    } catch (err: any) {
      console.error("[AFFILIATE-TRACK-SIGNUP-ERROR]", err);
      res.status(500).json({ error: err.message || 'Erro ao registrar cadastro' });
    }
  });

  // 3. Track Login
  router.post('/track-login', async (req, res) => {
    try {
      const { userId, visitorId } = req.body;
      if (!userId) return res.status(400).json({ error: 'userId obrigatório' });

      const db = getDb();
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) return res.json({ success: false });

      const userData = userDoc.data();
      const affiliateId = userData.affiliateId;
      if (!affiliateId) return res.json({ success: false });

      // Deduplicate: Don't spam logins if already logged in the last 24h
      const todayIso = new Date().toISOString().split('T')[0];
      const recentLoginQuery = query(
        collection(db, "affiliate_events"),
        where("userId", "==", userId),
        where("eventType", "==", "login"),
        limit(5)
      );
      const recentLogins = await getDocs(recentLoginQuery);
      const alreadyLoggedToday = recentLogins.docs.some(d => d.data().eventDate?.startsWith(todayIso));

      if (!alreadyLoggedToday) {
        const nowIso = new Date().toISOString();
        const eventRef = doc(collection(db, "affiliate_events"));
        await setDoc(eventRef, {
          id: eventRef.id,
          affiliateId,
          affiliateCode: userData.affiliateCode || '',
          visitorId: visitorId || '',
          userId,
          eventType: 'login',
          eventDate: nowIso,
          metadata: { email: userData.email },
          createdAt: nowIso,
          timestamp: Date.now()
        });

        const affRef = doc(db, "affiliates", affiliateId);
        const affSnap = await getDoc(affRef);
        if (affSnap.exists()) {
          const m = affSnap.data().metrics || {};
          await updateDoc(affRef, {
            'metrics.logins': (m.logins || 0) + 1,
            updatedAt: nowIso
          });
        }
      }

      res.json({ success: true });
    } catch (e) {
      res.json({ success: false });
    }
  });

  // 4. Track Checkout Started
  router.post('/track-checkout', async (req, res) => {
    try {
      const { userId, visitorId, plan } = req.body;
      const db = getDb();

      let affiliateId: string | null = null;
      let affiliateCode: string | null = null;

      if (userId) {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          affiliateId = userDoc.data().affiliateId || null;
          affiliateCode = userDoc.data().affiliateCode || null;
        }
      }

      if (!affiliateId && visitorId) {
        const attrDoc = await getDoc(doc(db, "affiliate_attributions", visitorId));
        if (attrDoc.exists()) {
          affiliateId = attrDoc.data().affiliateId || null;
          affiliateCode = attrDoc.data().affiliateCode || null;
        }
      }

      if (affiliateId) {
        const nowIso = new Date().toISOString();
        const eventRef = doc(collection(db, "affiliate_events"));
        await setDoc(eventRef, {
          id: eventRef.id,
          affiliateId,
          affiliateCode: affiliateCode || '',
          visitorId: visitorId || '',
          userId: userId || null,
          eventType: 'checkout_started',
          eventDate: nowIso,
          metadata: { plan: plan || 'mensal' },
          createdAt: nowIso,
          timestamp: Date.now()
        });

        const affRef = doc(db, "affiliates", affiliateId);
        const affSnap = await getDoc(affRef);
        if (affSnap.exists()) {
          const m = affSnap.data().metrics || {};
          await updateDoc(affRef, {
            'metrics.checkoutsStarted': (m.checkoutsStarted || 0) + 1,
            updatedAt: nowIso
          });
        }
      }

      res.json({ success: true });
    } catch (e) {
      res.json({ success: false });
    }
  });

  app.use('/api/affiliates', router);

  // ==========================================
  // AFFILIATE SELF-SERVICE PORTAL ENDPOINTS
  // (Protected strictly by verified email of active validated affiliate)
  // ==========================================

  // Helper to resolve user email, role, name, uid and Firestore user data robustly
  async function getAuthenticatedUserEmailAndRole(user: any, db: any): Promise<{ 
    email: string; 
    role: string; 
    name: string; 
    uid: string;
    userData: any | null;
  }> {
    let email = (user?.email && user.email !== 'guest' ? user.email : '').toLowerCase().trim();
    let role = user?.role || '';
    let name = user?.name || user?.displayName || '';
    const uid = user?.uid && user.uid !== 'guest' ? user.uid : '';
    let userData: any = null;

    if (uid) {
      try {
        const uDoc = await getDoc(doc(db, "users", uid));
        if (uDoc.exists()) {
          userData = uDoc.data();
          if (!email && userData?.email) {
            email = String(userData.email).toLowerCase().trim();
          }
          if (!role && userData?.role) {
            role = userData.role;
          }
          if (!name && (userData?.displayName || userData?.name)) {
            name = userData.displayName || userData.name;
          }
        }
      } catch (e) {
        console.warn("[AFFILIATE-RESOLVE-USER-ERROR]", e);
      }
    }
    return { email, role, name, uid, userData };
  }

  // Centralized, ultra-resilient affiliate document finder
  async function resolveAffiliateDoc(db: any, params: {
    uid: string;
    email: string;
    role: string;
    name: string;
    userData: any;
  }): Promise<{ affDoc: any; affData: any; isActive: boolean } | null> {
    const { uid, email, role, name, userData } = params;
    const cleanEmail = (email || '').toLowerCase().trim();
    const isAdminOrMaster = role === 'master' || role === 'admin' || cleanEmail === 'arthurolimpio787@gmail.com';
    const isUserMarkedAffiliate = userData?.isAffiliate === true;
    const userAffCode = (userData?.affiliateCode || '').trim().toUpperCase();
    const userAffId = (userData?.affiliateId || '').trim();

    let targetDoc: any = null;

    // 1. Direct check by affiliateId from user doc
    if (userAffId) {
      try {
        const snap = await getDoc(doc(db, "affiliates", userAffId));
        if (snap.exists()) {
          targetDoc = snap;
        }
      } catch (e) {}
    }

    // 2. Direct check by uid as affiliate doc id
    if (!targetDoc && uid) {
      try {
        const snap = await getDoc(doc(db, "affiliates", uid));
        if (snap.exists()) {
          targetDoc = snap;
        }
      } catch (e) {}
    }

    // 3. Query by exact email in affiliates
    if (!targetDoc && cleanEmail) {
      try {
        const q = query(
          collection(db, "affiliates"), 
          where("email", "==", cleanEmail), 
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          targetDoc = snap.docs[0];
        }
      } catch (e) {}
    }

    // 4. Query by userId or uid field
    if (!targetDoc && uid) {
      try {
        const qUid = query(
          collection(db, "affiliates"),
          where("userId", "==", uid),
          limit(1)
        );
        const snapUid = await getDocs(qUid);
        if (!snapUid.empty) {
          targetDoc = snapUid.docs[0];
        } else {
          const qUid2 = query(
            collection(db, "affiliates"),
            where("uid", "==", uid),
            limit(1)
          );
          const snapUid2 = await getDocs(qUid2);
          if (!snapUid2.empty) {
            targetDoc = snapUid2.docs[0];
          }
        }
      } catch (e) {}
    }

    // 5. Query by code from user doc
    if (!targetDoc && userAffCode) {
      try {
        const qCode = query(
          collection(db, "affiliates"),
          where("code", "==", userAffCode),
          limit(1)
        );
        const snapCode = await getDocs(qCode);
        if (!snapCode.empty) {
          targetDoc = snapCode.docs[0];
        }
      } catch (e) {}
    }

    // 6. Comprehensive Case-Insensitive & Whitespace-Resilient Scan
    if (!targetDoc && (cleanEmail || uid || userAffCode)) {
      try {
        const allAffsSnap = await getDocs(collection(db, "affiliates"));
        for (const docSnap of allAffsSnap.docs) {
          const data = docSnap.data();
          const docEmail = String(data.email || '').toLowerCase().trim();
          const docCode = String(data.code || '').toUpperCase().trim();
          const docUid = data.userId || data.uid;

          if (
            (cleanEmail && docEmail === cleanEmail) ||
            (uid && docUid === uid) ||
            (docSnap.id === uid) ||
            (userAffCode && docCode === userAffCode)
          ) {
            targetDoc = docSnap;
            break;
          }
        }
      } catch (e) {
        console.warn("[AFFILIATE-SCAN-ERROR]", e);
      }
    }

    // 7. Auto-provisioning / repair for Admins, Masters, or Users explicitly marked as isAffiliate: true
    if (!targetDoc && (isAdminOrMaster || isUserMarkedAffiliate)) {
      try {
        let code = userAffCode;
        if (!code) {
          const rawPrefix = (name || 'APICE').split(' ')[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
          const prefix = rawPrefix.length >= 3 ? rawPrefix.substring(0, 5) : 'APICE';
          code = `${prefix}${Math.floor(100 + Math.random() * 900)}`;
        }

        const affRef = doc(collection(db, "affiliates"));
        const nowIso = new Date().toISOString();
        const autoAff = {
          id: affRef.id,
          userId: uid || null,
          name: name || (cleanEmail ? cleanEmail.split('@')[0] : "Afiliado Parceiro"),
          email: cleanEmail || '',
          code: code,
          commissionRate: userData?.commissionRate || 30,
          status: "active",
          pixKey: "",
          pixType: "email",
          metrics: {
            visits: 0,
            uniqueVisitors: 0,
            signups: 0,
            logins: 0,
            checkoutsStarted: 0,
            subscriptions: 0,
            totalRevenue: 0,
            totalCommission: 0
          },
          createdAt: nowIso,
          updatedAt: nowIso
        };
        await setDoc(affRef, autoAff);
        if (uid) {
          await setDoc(doc(db, "users", uid), {
            isAffiliate: true,
            affiliateCode: code,
            affiliateId: affRef.id
          }, { merge: true });
        }
        return {
          affDoc: { id: affRef.id, ref: affRef, data: () => autoAff },
          affData: autoAff,
          isActive: true
        };
      } catch (e) {
        console.error("[AUTO-PROVISION-ERROR]", e);
      }
    }

    if (!targetDoc) {
      return null;
    }

    const affData = targetDoc.data();
    const rawStatus = String(affData.status || '').toLowerCase().trim();
    const isExplicitlyBlocked = rawStatus === 'blocked' || 
                                rawStatus === 'bloqueado' || 
                                rawStatus === 'inactive' || 
                                rawStatus === 'inativo' || 
                                rawStatus === 'rejected' || 
                                rawStatus === 'rejeitado' ||
                                affData.status === false;

    const isActive = !isExplicitlyBlocked || 
                     rawStatus === 'active' || 
                     rawStatus === 'approved' || 
                     rawStatus === 'ativo' || 
                     rawStatus === 'ativado' || 
                     affData.status === true || 
                     affData.isAffiliate === true || 
                     isUserMarkedAffiliate || 
                     isAdminOrMaster;

    return { affDoc: targetDoc, affData, isActive };
  }

  const portalRouter = express.Router();
  portalRouter.use(authenticate);

  // 1. Check status: does current user email belong to an active affiliate validated by admin?
  portalRouter.get('/status', async (req, res) => {
    try {
      const user = (req as any).user;
      const db = getDb();
      const userProfile = await getAuthenticatedUserEmailAndRole(user, db);

      if (!userProfile.email && !userProfile.uid) {
        return res.json({ isAffiliate: false });
      }

      const resolved = await resolveAffiliateDoc(db, userProfile);
      if (!resolved) {
        return res.json({ isAffiliate: false });
      }

      const { affDoc, affData, isActive } = resolved;

      if (!isActive) {
        return res.json({ isAffiliate: false, status: affData.status, reason: 'unvalidated' });
      }

      return res.json({
        isAffiliate: true,
        affiliateId: affDoc.id,
        code: affData.code,
        name: affData.name,
        commissionRate: affData.commissionRate || 30
      });
    } catch (err) {
      console.error("[AFFILIATE-PORTAL-STATUS-ERROR]", err);
      return res.json({ isAffiliate: false });
    }
  });

  // 2. Fetch authenticated affiliate's personal metrics, exclusive link, referrals, and commissions
  portalRouter.get('/me', async (req, res) => {
    try {
      const user = (req as any).user;
      const db = getDb();
      const userProfile = await getAuthenticatedUserEmailAndRole(user, db);

      if (!userProfile.email && !userProfile.uid) {
        return res.status(401).json({ error: "Não autorizado. Por favor faça login." });
      }

      const resolved = await resolveAffiliateDoc(db, userProfile);
      if (!resolved) {
        return res.status(403).json({ error: "Acesso restrito. Este usuário não possui cadastro de afiliado ativo." });
      }

      const { affDoc, affData, isActive } = resolved;

      if (!isActive) {
        return res.status(403).json({ error: "Acesso de afiliado pendente de validação pelo administrador." });
      }

      const affiliateId = affDoc.id;
      const affiliateCode = affData.code;

      // 1. Fetch sales / subscriptions credited to this affiliate (by ID and by Code)
      const subsMap = new Map<string, any>();
      try {
        const subsSnap1 = await getDocs(query(
          collection(db, "affiliate_subscriptions"),
          where("affiliateId", "==", affiliateId)
        ));
        subsSnap1.forEach(d => subsMap.set(d.id, d.data()));

        if (affiliateCode) {
          const subsSnap2 = await getDocs(query(
            collection(db, "affiliate_subscriptions"),
            where("affiliateCode", "==", affiliateCode)
          ));
          subsSnap2.forEach(d => subsMap.set(d.id, d.data()));
        }
      } catch (subErr) {
        console.warn("[PORTAL-ME] Error fetching subscriptions:", subErr);
      }

      const subscriptions = Array.from(subsMap.values());
      // Sort subscriptions by date desc
      subscriptions.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      // 2. Fetch users registered by this affiliate (by ID and by Code)
      const usersMap = new Map<string, any>();
      try {
        const usersSnap1 = await getDocs(query(
          collection(db, "users"),
          where("affiliateId", "==", affiliateId)
        ));
        usersSnap1.forEach(d => usersMap.set(d.id, { id: d.id, ...d.data() }));

        if (affiliateCode) {
          const usersSnap2 = await getDocs(query(
            collection(db, "users"),
            where("affiliateCode", "==", affiliateCode)
          ));
          usersSnap2.forEach(d => usersMap.set(d.id, { id: d.id, ...d.data() }));
        }
      } catch (uErr) {
        console.warn("[PORTAL-ME] Error fetching users:", uErr);
      }

      const attributedUsers: any[] = [];
      usersMap.forEach((u, docId) => {
        attributedUsers.push({
          uid: docId,
          name: u.displayName || u.name || 'Aluno Indicado',
          email: u.email ? u.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '', // privacy safe
          planStatus: u.planStatus || 'free',
          hasActiveSubscription: u.planStatus === 'premium',
          createdAt: u.createdAt || null
        });
      });

      // Sort users by date desc
      attributedUsers.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      // 3. Compute real-time verified stats
      let totalCommission = 0;
      let totalRevenue = 0;
      subscriptions.forEach(s => {
        totalCommission += (Number(s.commission) || 0);
        totalRevenue += (Number(s.amount) || 0);
      });

      const metrics = {
        visits: affData.metrics?.visits || 0,
        uniqueVisitors: affData.metrics?.uniqueVisitors || affData.metrics?.visits || 0,
        signups: Math.max(attributedUsers.length, affData.metrics?.signups || 0),
        subscriptions: subscriptions.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100
      };

      return res.json({
        affiliate: {
          id: affDoc.id,
          name: affData.name || userProfile.name || (userProfile.email ? userProfile.email.split('@')[0] : 'Afiliado Parceiro'),
          email: affData.email || userProfile.email || '',
          code: affData.code || userProfile.userData?.affiliateCode || 'APICE',
          commissionRate: Number(affData.commissionRate) || 30,
          status: affData.status || 'active',
          pixKey: affData.pixKey || '',
          pixType: affData.pixType || 'cpf',
          createdAt: affData.createdAt || new Date().toISOString()
        },
        metrics,
        subscriptions,
        attributedUsers
      });
    } catch (err: any) {
      console.error("[AFFILIATE-PORTAL-ME-ERROR]", err);
      return res.status(500).json({ error: "Erro interno ao carregar dados do afiliado" });
    }
  });

  // 3. Update PIX payment info
  portalRouter.post('/pix', async (req, res) => {
    try {
      const user = (req as any).user;
      const db = getDb();
      const userProfile = await getAuthenticatedUserEmailAndRole(user, db);

      if (!userProfile.email && !userProfile.uid) {
        return res.status(401).json({ error: "Não autorizado" });
      }

      const resolved = await resolveAffiliateDoc(db, userProfile);
      if (!resolved || !resolved.affDoc) {
        return res.status(403).json({ error: "Afiliado não encontrado" });
      }

      const { affDoc } = resolved;
      const { pixKey, pixType } = req.body;

      const docRef = affDoc.ref || doc(db, "affiliates", affDoc.id);
      await updateDoc(docRef, {
        pixKey: String(pixKey || '').trim(),
        pixType: String(pixType || 'cpf').trim(),
        updatedAt: new Date().toISOString()
      });

      return res.json({ success: true, pixKey, pixType });
    } catch (err: any) {
      console.error("[AFFILIATE-PORTAL-PIX-ERROR]", err);
      return res.status(500).json({ error: "Erro ao salvar chave PIX" });
    }
  });

  app.use('/api/affiliate-portal', portalRouter);

  // ==========================================
  // ADMIN AFFILIATE MANAGEMENT ENDPOINTS
  // (Protected by requireAdmin middleware)
  // ==========================================

  const adminAffRouter = express.Router();
  adminAffRouter.use(authenticate);

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

  adminAffRouter.use(requireAdmin);

  // 1. Dashboard Aggregate Stats
  adminAffRouter.get('/stats', async (req, res) => {
    try {
      const db = getDb();
      const affSnap = await getDocs(collection(db, "affiliates"));
      
      let totalAffiliates = affSnap.size;
      let activeAffiliates = 0;
      let totalVisits = 0;
      let totalUniqueVisitors = 0;
      let totalSignups = 0;
      let totalLogins = 0;
      let totalCheckoutsStarted = 0;
      let totalSubscriptions = 0;
      let totalRevenue = 0;
      let totalCommission = 0;

      affSnap.forEach(d => {
        const a = d.data();
        if (a.status === 'active') activeAffiliates++;
        const m = a.metrics || {};
        totalVisits += (m.visits || 0);
        totalUniqueVisitors += (m.uniqueVisitors || 0);
        totalSignups += (m.signups || 0);
        totalLogins += (m.logins || 0);
        totalCheckoutsStarted += (m.checkoutsStarted || 0);
        totalSubscriptions += (m.subscriptions || 0);
        totalRevenue += (m.totalRevenue || 0);
        totalCommission += (m.totalCommission || 0);
      });

      const conversionRateSignup = totalUniqueVisitors > 0 
        ? Math.round((totalSignups / totalUniqueVisitors) * 10000) / 100 
        : (totalVisits > 0 ? Math.round((totalSignups / totalVisits) * 10000) / 100 : 0);

      const conversionRateSubscription = totalSignups > 0 
        ? Math.round((totalSubscriptions / totalSignups) * 10000) / 100 
        : 0;

      const globalConversionRate = totalUniqueVisitors > 0 
        ? Math.round((totalSubscriptions / totalUniqueVisitors) * 10000) / 100 
        : 0;

      // Recent events
      const recentEventsQuery = query(
        collection(db, "affiliate_events"), 
        orderBy("timestamp", "desc"), 
        limit(20)
      );
      let recentEvents: any[] = [];
      try {
        const eventsSnap = await getDocs(recentEventsQuery);
        recentEvents = eventsSnap.docs.map(doc => doc.data());
      } catch (e) {
        console.warn("[ADMIN-AFFILIATE] Could not fetch recent events by timestamp index:", e);
      }

      res.json({
        totalAffiliates,
        activeAffiliates,
        totalVisits,
        totalUniqueVisitors,
        totalSignups,
        totalLogins,
        totalCheckoutsStarted,
        totalSubscriptions,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
        conversionRateSignup,
        conversionRateSubscription,
        globalConversionRate,
        recentEvents
      });
    } catch (err: any) {
      console.error("[ADMIN-AFFILIATES-STATS-ERROR]", err);
      res.status(500).json({ error: err.message || 'Erro ao carregar estatísticas' });
    }
  });

  // 2. List All Affiliates
  adminAffRouter.get('/list', async (req, res) => {
    try {
      const db = getDb();
      const snap = await getDocs(collection(db, "affiliates"));
      const affiliates = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Sort by total revenue desc by default
      affiliates.sort((a: any, b: any) => {
        const revA = a.metrics?.totalRevenue || 0;
        const revB = b.metrics?.totalRevenue || 0;
        return revB - revA;
      });

      res.json(affiliates);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Create New Affiliate
  adminAffRouter.post('/create', async (req, res) => {
    try {
      const { name, email, code, commissionRate, status } = req.body;
      if (!name || !email || !code) {
        return res.status(400).json({ error: 'Nome, e-mail e código são obrigatórios' });
      }

      const db = getDb();
      const cleanCode = String(code).trim().toUpperCase();

      // Check unique code
      const existingQuery = query(collection(db, "affiliates"), where("code", "==", cleanCode), limit(1));
      const existingSnap = await getDocs(existingQuery);
      if (!existingSnap.empty) {
        return res.status(400).json({ error: `O código de afiliado "${cleanCode}" já está em uso por outro parceiro.` });
      }

      const affRef = doc(collection(db, "affiliates"));
      const nowIso = new Date().toISOString();

      const newAffiliate = {
        id: affRef.id,
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        code: cleanCode,
        status: status === 'inactive' ? 'inactive' : 'active',
        commissionRate: typeof commissionRate === 'number' ? commissionRate : 30,
        createdAt: nowIso,
        updatedAt: nowIso,
        metrics: {
          visits: 0,
          uniqueVisitors: 0,
          signups: 0,
          logins: 0,
          checkoutsStarted: 0,
          subscriptions: 0,
          totalRevenue: 0,
          totalCommission: 0
        }
      };

      await setDoc(affRef, newAffiliate);
      res.json({ success: true, affiliate: newAffiliate });
    } catch (err: any) {
      console.error("[AFFILIATE-CREATE-ERROR]", err);
      res.status(500).json({ error: err.message || 'Erro ao criar afiliado' });
    }
  });

  // Ativar painel de afiliado diretamente por e-mail ou conta de usuário
  adminAffRouter.post('/activate-by-email', async (req, res) => {
    try {
      const { email, name, code, commissionRate, status } = req.body;
      const cleanEmail = String(email || '').trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return res.status(400).json({ error: 'E-mail válido é obrigatório' });
      }

      const db = getDb();
      const nowIso = new Date().toISOString();

      // 1. Procurar conta na coleção users
      const uQuery = query(collection(db, "users"), where("email", "==", cleanEmail), limit(1));
      const uSnap = await getDocs(uQuery);
      const userDoc = !uSnap.empty ? uSnap.docs[0] : null;
      const userData = userDoc ? userDoc.data() : null;
      const finalName = String(name || userData?.displayName || userData?.name || cleanEmail.split('@')[0]).trim();

      // 2. Verificar se já existe registro de afiliado com esse e-mail
      const affQuery = query(collection(db, "affiliates"), where("email", "==", cleanEmail), limit(1));
      const affSnap = await getDocs(affQuery);

      if (!affSnap.empty) {
        // Já existe: atualizar e ativar
        const targetDoc = affSnap.docs[0];
        const currentData = targetDoc.data();
        const targetStatus = status || 'active';

        const updates: any = {
          status: targetStatus,
          name: finalName,
          updatedAt: nowIso
        };

        if (typeof commissionRate === 'number') {
          updates.commissionRate = commissionRate;
        }

        if (code) {
          const cleanCode = String(code).trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
          if (cleanCode && cleanCode !== currentData.code) {
            // Verificar unicidade
            const codeCheck = await getDocs(query(collection(db, "affiliates"), where("code", "==", cleanCode), limit(1)));
            if (!codeCheck.empty && codeCheck.docs[0].id !== targetDoc.id) {
              return res.status(400).json({ error: `O código "${cleanCode}" já está em uso por outro afiliado.` });
            }
            updates.code = cleanCode;
          }
        }

        await updateDoc(doc(db, "affiliates", targetDoc.id), updates);
        const updatedAff = { ...currentData, ...updates, id: targetDoc.id };

        // Sincronizar status no usuário
        if (userDoc) {
          await setDoc(doc(db, "users", userDoc.id), {
            isAffiliate: targetStatus === 'active',
            affiliateCode: updatedAff.code
          }, { merge: true });
        }

        return res.json({
          success: true,
          isNew: false,
          affiliate: updatedAff,
          message: targetStatus === 'active' 
            ? `Painel de afiliado ativado com sucesso para ${cleanEmail}!` 
            : `Painel de afiliado desativado para ${cleanEmail}.`
        });
      }

      // 3. Não existe: Criar novo registro de afiliado
      let cleanCode = code ? String(code).trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '') : '';
      if (!cleanCode) {
        const rawPrefix = finalName.split(' ')[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
        const prefix = rawPrefix.length >= 3 ? rawPrefix.substring(0, 5) : 'APICE';
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        cleanCode = `${prefix}${randomSuffix}`;
      }

      // Verificar unicidade do código
      const codeCheck = await getDocs(query(collection(db, "affiliates"), where("code", "==", cleanCode), limit(1)));
      if (!codeCheck.empty) {
        cleanCode = `${cleanCode}${Math.floor(10 + Math.random() * 90)}`;
      }

      const affRef = doc(collection(db, "affiliates"));
      const newAffiliate = {
        id: affRef.id,
        name: finalName,
        email: cleanEmail,
        code: cleanCode,
        status: status || 'active',
        commissionRate: typeof commissionRate === 'number' ? commissionRate : 30,
        pixKey: '',
        pixType: 'email',
        metrics: {
          visits: 0,
          uniqueVisitors: 0,
          signups: 0,
          logins: 0,
          checkoutsStarted: 0,
          subscriptions: 0,
          totalRevenue: 0,
          totalCommission: 0
        },
        createdAt: nowIso,
        updatedAt: nowIso
      };

      await setDoc(affRef, newAffiliate);

      // Sincronizar com documento do usuário se existir
      if (userDoc) {
        await setDoc(doc(db, "users", userDoc.id), {
          isAffiliate: true,
          affiliateCode: cleanCode
        }, { merge: true });
      }

      res.json({
        success: true,
        isNew: true,
        affiliate: newAffiliate,
        message: `Painel de afiliado ativado com sucesso para ${cleanEmail}! Código: ${cleanCode}`
      });
    } catch (err: any) {
      console.error("[AFFILIATE-ACTIVATE-BY-EMAIL-ERROR]", err);
      res.status(500).json({ error: err.message || 'Erro ao ativar afiliado por e-mail' });
    }
  });

  // Busca rápida de usuários para ativação de afiliado
  adminAffRouter.get('/search-users', async (req, res) => {
    try {
      const q = String(req.query.q || '').trim().toLowerCase();
      const db = getDb();

      const [usersSnap, affSnap] = await Promise.all([
        getDocs(query(collection(db, "users"), limit(300))),
        getDocs(collection(db, "affiliates"))
      ]);

      const affMap = new Map<string, any>();
      affSnap.docs.forEach(d => {
        const data = d.data();
        if (data.email) affMap.set(data.email.toLowerCase().trim(), { id: d.id, ...data });
      });

      const results: any[] = [];
      usersSnap.docs.forEach(doc => {
        const u = doc.data();
        const email = (u.email || '').toLowerCase().trim();
        const name = u.displayName || u.name || '';
        
        if (!q || email.includes(q) || name.toLowerCase().includes(q)) {
          const aff = affMap.get(email);
          results.push({
            uid: doc.id,
            name: name || 'Sem nome',
            email,
            planStatus: u.planStatus || 'free',
            isAffiliate: aff ? aff.status === 'active' : false,
            affiliateStatus: aff ? aff.status : 'unregistered',
            affiliateCode: aff?.code || null,
            affiliateId: aff?.id || null,
            commissionRate: aff?.commissionRate || 30
          });
        }
      });

      res.json(results.slice(0, 30));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 4. Update Affiliate
  adminAffRouter.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, code, commissionRate, status } = req.body;

      const db = getDb();
      const affRef = doc(db, "affiliates", id);
      const affSnap = await getDoc(affRef);
      if (!affSnap.exists()) {
        return res.status(404).json({ error: 'Afiliado não encontrado' });
      }

      const updates: any = { updatedAt: new Date().toISOString() };
      if (name) updates.name = String(name).trim();
      if (email) updates.email = String(email).trim().toLowerCase();
      if (status) updates.status = status;
      if (typeof commissionRate === 'number') updates.commissionRate = commissionRate;

      if (code) {
        const cleanCode = String(code).trim().toUpperCase();
        // Check uniqueness if changing code
        const codeQuery = query(collection(db, "affiliates"), where("code", "==", cleanCode), limit(1));
        const codeSnap = await getDocs(codeQuery);
        if (!codeSnap.empty && codeSnap.docs[0].id !== id) {
          return res.status(400).json({ error: `O código "${cleanCode}" já está em uso.` });
        }
        updates.code = cleanCode;
      }

      await updateDoc(affRef, updates);
      res.json({ success: true, message: 'Afiliado atualizado com sucesso' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Toggle Status
  adminAffRouter.post('/:id/toggle-status', async (req, res) => {
    try {
      const { id } = req.params;
      const db = getDb();
      const affRef = doc(db, "affiliates", id);
      const snap = await getDoc(affRef);
      if (!snap.exists()) {
        return res.status(404).json({ error: 'Afiliado não encontrado' });
      }

      const current = snap.data().status;
      const newStatus = current === 'active' ? 'inactive' : 'active';
      await updateDoc(affRef, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      res.json({ success: true, status: newStatus });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Get Single Affiliate Details
  adminAffRouter.get('/:id/details', async (req, res) => {
    try {
      const { id } = req.params;
      const db = getDb();
      const affSnap = await getDoc(doc(db, "affiliates", id));
      if (!affSnap.exists()) {
        return res.status(404).json({ error: 'Afiliado não encontrado' });
      }

      const affiliate = { id: affSnap.id, ...affSnap.data() } as any;

      // 1. Get attributed users from users collection
      const usersQuery = query(collection(db, "users"), where("affiliateId", "==", id), limit(100));
      const usersSnap = await getDocs(usersQuery);
      const attributedUsers = usersSnap.docs.map(d => {
        const u = d.data();
        return {
          uid: d.id,
          name: u.displayName || u.name || 'Sem nome',
          email: u.email || '',
          phone: u.phone || '',
          createdAt: u.createdAt?.toDate ? u.createdAt.toDate().toISOString() : (u.createdAt || ''),
          lastLogin: u.lastLogin?.toDate ? u.lastLogin.toDate().toISOString() : (u.lastLogin || ''),
          planStatus: u.planStatus || 'free',
          hasActiveSubscription: u.planStatus === 'premium' && !!(u.stripeSubscriptionId || u.subscription === 'active'),
          stripeCustomerId: u.stripeCustomerId || '',
          affiliateAttributedAt: u.affiliateAttributedAt || ''
        };
      });

      // 2. Get subscriptions linked to this affiliate
      const subsQuery = query(collection(db, "affiliate_subscriptions"), where("affiliateId", "==", id), limit(100));
      const subsSnap = await getDocs(subsQuery);
      const subscriptions = subsSnap.docs.map(d => d.data());

      // 3. Get recent events for this affiliate
      const eventsQuery = query(collection(db, "affiliate_events"), where("affiliateId", "==", id), limit(100));
      const eventsSnap = await getDocs(eventsQuery);
      const events = eventsSnap.docs.map(d => d.data());
      events.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));

      // 4. Calculate UTM analytics breakdown
      const utmSources: Record<string, number> = {};
      const utmCampaigns: Record<string, number> = {};
      events.forEach((ev: any) => {
        if (ev.eventType === 'visit' && ev.metadata) {
          const src = ev.metadata.utmSource || '(direto/orgânico)';
          const camp = ev.metadata.utmCampaign || '(nenhuma)';
          utmSources[src] = (utmSources[src] || 0) + 1;
          utmCampaigns[camp] = (utmCampaigns[camp] || 0) + 1;
        }
      });

      res.json({
        affiliate,
        attributedUsers,
        subscriptions,
        events: events.slice(0, 50),
        analytics: {
          utmSources,
          utmCampaigns
        }
      });
    } catch (err: any) {
      console.error("[ADMIN-AFFILIATE-DETAILS-ERROR]", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Get All Attributed Users (Global)
  adminAffRouter.get('/all-users', async (req, res) => {
    try {
      const db = getDb();
      // Fetch users that have affiliateId
      const usersQuery = query(collection(db, "users"), where("affiliateId", "!=", null), limit(250));
      const usersSnap = await getDocs(usersQuery);
      
      const users = usersSnap.docs.map(d => {
        const u = d.data();
        return {
          uid: d.id,
          name: u.displayName || u.name || 'Sem nome',
          email: u.email || '',
          affiliateId: u.affiliateId,
          affiliateCode: u.affiliateCode,
          createdAt: u.createdAt?.toDate ? u.createdAt.toDate().toISOString() : (u.createdAt || ''),
          lastLogin: u.lastLogin?.toDate ? u.lastLogin.toDate().toISOString() : (u.lastLogin || ''),
          planStatus: u.planStatus || 'free',
          hasActiveSubscription: u.planStatus === 'premium' && !!(u.stripeSubscriptionId || u.subscription === 'active'),
          affiliateAttributedAt: u.affiliateAttributedAt || ''
        };
      });

      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Get All Subscriptions (Global)
  adminAffRouter.get('/all-subscriptions', async (req, res) => {
    try {
      const db = getDb();
      const subsSnap = await getDocs(collection(db, "affiliate_subscriptions"));
      const subscriptions = subsSnap.docs.map(d => d.data());
      subscriptions.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      res.json(subscriptions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. Get / Set Attribution Config
  adminAffRouter.get('/config', async (req, res) => {
    try {
      const db = getDb();
      const config = await getAffiliateConfig(db);
      res.json(config);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  adminAffRouter.post('/config', async (req, res) => {
    try {
      const { attributionWindowDays, attributionModel, defaultCommissionRate } = req.body;
      const db = getDb();
      const nowIso = new Date().toISOString();

      const newConfig = {
        attributionWindowDays: typeof attributionWindowDays === 'number' ? attributionWindowDays : 90,
        attributionModel: attributionModel === 'last_touch' ? 'last_touch' : 'first_touch',
        defaultCommissionRate: typeof defaultCommissionRate === 'number' ? defaultCommissionRate : 30,
        updatedAt: nowIso
      };

      await setDoc(doc(db, "affiliate_config", "settings"), newConfig, { merge: true });
      res.json({ success: true, config: newConfig });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10. Simulate Sale (for Admin testing and verification)
  adminAffRouter.post('/simulate-sale', async (req, res) => {
    try {
      const { affiliateId, plan, amount, userEmail, userName } = req.body;
      if (!affiliateId) return res.status(400).json({ error: 'affiliateId é obrigatório' });

      const db = getDb();
      const simUserId = `sim_user_${Date.now().toString(36)}`;
      const simSessionId = `cs_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const targetAmount = typeof amount === 'number' ? amount : (plan === 'anual' ? 149.00 : 17.99);

      // Call recordAffiliateSubscription
      const result = await recordAffiliateSubscription(db, {
        affiliateId,
        userId: simUserId,
        userEmail: userEmail || `teste_${Date.now()}@exemplo.com`,
        userName: userName || 'Usuário Teste Simulação',
        plan: plan || 'mensal',
        amount: targetAmount,
        stripeSessionId: simSessionId,
        status: 'paid'
      });

      res.json({
        success: result.success,
        simulatedSessionId: simSessionId,
        amount: targetAmount,
        commission: result.commission,
        affiliateId: result.affiliateId
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.use('/api/admin/affiliates', adminAffRouter);
}
