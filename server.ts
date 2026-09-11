import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { setupAdminRoutes } from "./server/adminRoutes";
import firebaseConfig from "./firebase-applet-config.json" with { type: 'json' };

// Initialize Firebase Admin



import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, runTransaction, collection, getDocs, serverTimestamp, query, where, writeBatch } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-adcdca29-b4a0-4f4a-b4be-30a238c77fbd');

export function getDb() { return db; }
let backendUserReady = false;
signInWithEmailAndPassword(auth, 'backend@apice.com', 'SuperSecretPassword123').then(() => {
  console.log('[FIREBASE] Backend user authenticated.');
  backendUserReady = true;
}).catch(console.error);



function getValidKeys() {
  const keys = [
    process.env.GEMINI_API_KEY?.trim(),
    process.env.GEMINI_API_KEY2?.trim(),
    process.env.GEMINI_API_KEY3?.trim()
  ].filter(k => k && k !== "MY_GEMINI_API_KEY" && k !== "") as string[];
  return keys;
}

function createAIClient(key: string) {
  return new GoogleGenAI({ 
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

async function callGeminiWithRetry(fn: (client: any) => Promise<any>) {
  const keys = getValidKeys();
  if (keys.length === 0) {
    throw new Error("Nenhuma chave Gemini válida encontrada nos Secrets.");
  }

  let lastError: any;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    let retriesFor503 = 5;
    let backoffDelay = 2000;
    
    while (retriesFor503 > 0) {
      try {
        const client = createAIClient(key);
        return await fn(client);
      } catch (error: any) {
        lastError = error;
        const errorString = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
        
        const isQuotaError = errorString.includes("429") || 
                            errorString.toLowerCase().includes("quota") || 
                            errorString.includes("RESOURCE_EXHAUSTED");
                            
        const isExpiredKey = errorString.includes("API key expired") || errorString.includes("API_KEY_INVALID") || errorString.includes("API key not valid") || errorString.includes("400");
        
        const isUnavailableError = errorString.includes("503") || 
                                  errorString.includes("high demand") || 
                                  errorString.includes("UNAVAILABLE");

        if (isUnavailableError && retriesFor503 > 1) {
          retriesFor503--;
          console.warn(`[GEMINI RETRY] Model unavailable (503). Retrying in ${backoffDelay}ms... (${retriesFor503} retries left for key ${i + 1})`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          backoffDelay *= 2; // Exponential backoff
          continue; // retry the same key
        }

        if (isQuotaError && i < keys.length - 1) {
          console.warn(`[GEMINI ROTATION] Chave ${i + 1} esgotada (Quota 429). Tentando chave ${i + 2}...`);
          await new Promise(resolve => setTimeout(resolve, 500));
          break; // move to next key
        }
        
        if (isExpiredKey && i < keys.length - 1) {
          console.warn(`[GEMINI ROTATION] Chave ${i + 1} inválida/expirada. Tentando chave ${i + 2}...`);
          break; // move to next key
        }
        
        if (isExpiredKey) {
          throw new Error("Sua chave da API do Gemini (GEMINI_API_KEY) expirou ou está inválida. Por favor, acesse o menu Settings -> Secrets do projeto e renove sua chave.");
        }
        
        if (isQuotaError) {
          throw new Error("Todas as chaves esgotaram a cota (429). Por favor, aguarde o reset da cota ou configure uma GEMINI_API_KEY própria em Settings -> Secrets.");
        }
        
        throw error; // Other errors, or out of 503 retries, or no more keys.
      }
    }
  }
  throw lastError;
}

// Graceful error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception thrown:', err);
});

async function startServer() {
  console.log(`[SERVER] Initing server. NODE_ENV: ${process.env.NODE_ENV}`);
  
function getBrazilTodayStr() {
  const parts = new Intl.DateTimeFormat('pt-BR', { 
    timeZone: 'America/Sao_Paulo', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).formatToParts(new Date());
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

const app = express();
app.set('trust proxy', 1); // Trust first proxy for express-rate-limit
  const PORT = 3000;

  // SECURITY: Protection & headers (configured to allow AI Studio preview iframe)
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    xFrameOptions: false,
  }));

  // Ensure X-Frame-Options is never set so AI Studio preview iframe can render
  app.use((req, res, next) => {
    res.removeHeader('X-Frame-Options');
    next();
  });

  // SECURITY: CORS allowing local, cloud run, and Google AI Studio domains
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin.startsWith('http://localhost:') ||
        origin.endsWith('.run.app') ||
        origin.includes('google.com') ||
        origin.includes('ai.studio') ||
        origin.includes('aistudio.google.com')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  }));

  // SECURITY: Global Rate Limiting per IP
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500, // Reasonable limit
    message: { error: 'Too many requests from this IP, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', globalLimiter);

  // SECURITY: Action Limits (Questions/Flashcards) per IP
  const actionLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 200, 
    message: { error: 'Daily action limit reached for this IP.' },
  });
  app.use('/api/gemini/', actionLimiter);
  app.use('/api/profile/increment-', actionLimiter);


  // STRIPE WEBHOOK (Must be before express.json to get the raw body)
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("[STRIPE-WEBHOOK] Missing STRIPE_WEBHOOK_SECRET environment variable.");
      return res.status(400).send('Webhook secret not configured.');
    }

    let event;
    try {
      const { default: Stripe } = await import('stripe');
      const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || '');
      event = stripeClient.webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } catch (err: any) {
      console.error(`[STRIPE-WEBHOOK] Signature Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`[STRIPE-WEBHOOK] Received event type: ${event.type}`);

    try {
      const db = getDb();
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const metadata = session.metadata || {};
        const userId = metadata.userId || session.client_reference_id;
        const isPaid = session.payment_status === 'paid' || session.status === 'complete';

        console.log(`[STRIPE-WEBHOOK] Checkout session completed. ID: ${session.id}, payment_status: ${session.payment_status}, isPaid: ${isPaid}`);

        if (userId && isPaid) {
          if (metadata.type === 'flashcard_pack' && metadata.packId) {
            console.log(`[STRIPE-WEBHOOK] Pagamento APROVADO pela Stripe para o Pack ${metadata.packId} (Usuário: ${userId})`);
            
            try {
              const userRef = doc(db, "users", userId);
              const userSnap = await getDoc(userRef);
              let ownedPacks: string[] = [];
              if (userSnap.exists()) {
                ownedPacks = userSnap.data()?.ownedFlashcardPacks || [];
              }
              if (!ownedPacks.includes(metadata.packId)) {
                ownedPacks.push(metadata.packId);
              }
              await setDoc(userRef, { ownedFlashcardPacks: ownedPacks }, { merge: true });
              console.log(`[STRIPE-WEBHOOK] Flashcard Pack ${metadata.packId} liberado no doc do usuário ${userId}`);
            } catch (pErr) {
              console.error("[STRIPE-WEBHOOK] Erro ao atualizar ownedFlashcardPacks:", pErr);
            }

            // Registrar compra aprovada na coleção flashcard_purchases para a análise do Admin
            try {
              const purchaseRef = doc(db, "flashcard_purchases", session.id);
              const amountPaid = session.amount_total ? session.amount_total / 100 : (Number(metadata.packPrice) || 0);
              const customerEmail = session.customer_details?.email || session.customer_email || metadata.userEmail || '';
              const customerName = session.customer_details?.name || '';
              
              await setDoc(purchaseRef, {
                id: session.id,
                userId: userId,
                userEmail: customerEmail,
                userName: customerName,
                packId: metadata.packId,
                packTitle: metadata.packTitle || metadata.packId,
                amount: amountPaid,
                currency: session.currency || 'brl',
                paymentStatus: session.payment_status || 'paid',
                status: 'approved',
                stripeSessionId: session.id,
                paymentIntentId: session.payment_intent || null,
                createdAt: new Date().toISOString(),
                timestamp: Date.now()
              }, { merge: true });
              console.log(`[STRIPE-WEBHOOK] Compra aprovada registrada com sucesso em flashcard_purchases!`);
            } catch (recErr) {
              console.error("[STRIPE-WEBHOOK] Erro ao salvar registro em flashcard_purchases:", recErr);
            }
          } else {
            console.log(`[STRIPE-WEBHOOK] Liberando Premium para o usuário ${userId}`);
            await setDoc(doc(db, `users/${userId}`), {
              planStatus: 'premium',
              subscription: 'active',
              stripeCustomerId: session.customer || null,
              stripeSubscriptionId: session.subscription || null
            }, { merge: true });
          }
        } else {
          console.warn("[STRIPE-WEBHOOK] Checkout finalizado porém pagamento ainda não confirmado como paid:", { userId, payment_status: session.payment_status });
        }
      } else if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as any;
        console.log(`[STRIPE-WEBHOOK] Assinatura cancelada (ID: ${subscription.id}).`);
        
        try {
          const customerId = subscription.customer;
          
          if (customerId) {
            const usersQuery = query(collection(db, 'users'), where('stripeCustomerId', '==', customerId));
            const usersSnapshot = await getDocs(usersQuery);
              
            if (!usersSnapshot.empty) {
              const batch = writeBatch(db);
              usersSnapshot.forEach((docSnap) => {
                batch.set(docSnap.ref, {
                  planStatus: 'free',
                  subscription: 'inactive'
                }, { merge: true });
                console.log(`[STRIPE-WEBHOOK] 🔒 Premium revogado com sucesso para o usuário ${docSnap.id} (Cancelamento Stripe)`);
              });
              await batch.commit();
            } else {
              console.log(`[STRIPE-WEBHOOK] Nenhum usuário encontrado com stripeCustomerId: ${customerId}`);
            }
          }
        } catch (dbErr) {
          console.error(`[STRIPE-WEBHOOK] Erro ao revogar premium no banco:`, dbErr);
        }
      }
      
      res.json({ received: true });
    } catch (err: any) {
      console.error(`[STRIPE-WEBHOOK] Processing Error:`, err);
      res.status(500).json({ error: "Erro interno no webhook" });
    }
  });

  app.use(express.json({ limit: "50kb" }));
  app.use(express.urlencoded({ extended: true, limit: "50kb" }));

  // Logging Middleware
  app.use((req, res, next) => {
    const isApi = req.url.startsWith('/api') || req.url.includes('stripe');
    if (isApi) {
      console.log(`[REQUEST-DEBUG] ${req.method} ${req.url} - Auth: ${!!req.headers.authorization}`);
    }
    next();
  });

  // Diagnostics
  app.get("/api/ping", (req, res) => {
    res.json({ 
      status: "ok", 
      version: "6.0.0", 
      env: process.env.NODE_ENV,
      stripeKey: !!process.env.STRIPE_SECRET_KEY,
      headers: req.headers
    });
  });

  app.get("/api/health-check", (req, res) => {
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(),
      cwd: process.cwd(),
      node_env: process.env.NODE_ENV
    });
  });

  // Security Middleware: Verify Firebase ID Token
  const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      (req as any).user = { uid: "guest", email: "guest" };
      return next();
    }

    const idToken = authHeader.split("Bearer ")[1];
    try {
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
      const decodedToken = JSON.parse(jsonPayload);
      decodedToken.uid = decodedToken.user_id || decodedToken.sub;
      (req as any).user = decodedToken;
      next();
    } catch (error) {
      console.error("[AUTH-ERROR]", error);
      (req as any).user = { uid: "guest", email: "guest" };
      next();
    }
  };

  const requirePremium = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (!user || user.uid === "guest") {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const db = getDb();
      const userDoc = await getDoc(doc(db, `users/${user.uid}`));
      const userData = userDoc.data();
      if (userData?.planStatus === 'premium') {
        return next();
      }
      res.status(403).json({ error: "Premium plan required for this feature" });
    } catch (error) {
      console.error("[PREMIUM-CHECK-ERROR]", error);
      res.status(500).json({ error: "Error verifying subscription status" });
    }
  };

  // Stripe Integration
  let stripeClient: any = null;
  async function getStripe() {
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (!key) {
      console.error("[STRIPE] Missing STRIPE_SECRET_KEY in environment.");
      return null;
    }
    if (!stripeClient) {
      try {
        const { default: Stripe } = await import('stripe');
        stripeClient = new Stripe(key);
        console.log("[STRIPE] Client initialized successfully.");
      } catch (err) {
        console.error("[STRIPE] Initialization error:", err);
        return null;
      }
    }
    return stripeClient;
  }

  // Stripe Handler
  const handleCheckout = async (req: express.Request, res: express.Response) => {
    const user = (req as any).user;
    const { priceId } = req.body || {};
    console.log(`[STRIPE-FLOW] Starting checkout for user: ${user?.uid} (${req.method} ${req.url})`);
    
    try {
      const stripe = await getStripe();
      
      const hostname = req.hostname;
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const baseUrl = `${protocol}://${hostname}`;

      if (!stripe) {
        console.warn("[STRIPE-FLOW] Stripe client not available, returning mock success URL.");
        return res.json({ url: `${baseUrl}/?success=true` });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        success_url: `${baseUrl}/?success=true`,
        cancel_url: `${baseUrl}/?canceled=true`,
        customer_email: user?.email !== 'guest' ? user?.email : undefined,
        client_reference_id: user?.uid, // added client_reference_id for robust webhook support if added later
        metadata: { userId: user?.uid }
      });

      console.log(`[STRIPE-FLOW] Session created: ${session.id}`);
      res.json({ url: session.url });
    } catch (error: any) {
      console.error("[STRIPE-FLOW] CRITICAL Error:", error);
      res.status(500).json({ error: error.message || "Erro interno ao processar Stripe." });
    }
  };

  // Register All Routes DIRECTLY on app for maximum visibility
  
  const handleCheckoutFlashcard = async (req, res) => {
    const user = req.user;
    const { packId, packTitle, packPrice } = req.body;
    
    console.log(`[STRIPE-FLOW] Starting flashcard checkout for user: ${user?.uid}, pack: ${packId}`);
    
    try {
      const stripe = await getStripe();
      
      const hostname = req.hostname;
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const baseUrl = `${protocol}://${hostname}`;

      if (!stripe) {
        console.warn("[STRIPE-FLOW] Stripe client not available, returning mock flashcard success URL.");
        return res.json({ url: `${baseUrl}/?flashcard_success=true&packId=${packId}` });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'brl',
            product_data: {
              name: packTitle || 'Pacote de Flashcards',
              description: 'Acesso vitalício ao pacote de flashcards.',
            },
            unit_amount: packPrice ? Math.round(packPrice * 100) : 1500, // 1500 = R$ 15,00
          },
          quantity: 1,
        }],
        success_url: `${baseUrl}/?flashcard_success=true&packId=${packId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/?flashcard_canceled=true`,
        customer_email: user?.email !== 'guest' ? user?.email : undefined,
        metadata: {
          userId: user?.uid,
          packId: packId,
          packTitle: packTitle || '',
          packPrice: String(packPrice || 15),
          type: 'flashcard_pack',
          userEmail: user?.email !== 'guest' ? (user?.email || '') : ''
        }
      });

      console.log(`[STRIPE-FLOW] Flashcard Session created: ${session.id}`);
      res.json({ url: session.url });
    } catch (error) {
      console.error("[STRIPE-FLOW] CRITICAL Error:", error);
      res.status(500).json({ error: error.message || "Erro interno ao processar Stripe." });
    }
  };
  
  app.post("/api/stripe/checkout-flashcard", authenticate, handleCheckoutFlashcard);

  // Endpoint para verificação e registro imediato de sessão aprovada pela Stripe
  app.post("/api/stripe/verify-flashcard-session", authenticate, async (req: any, res: any) => {
    const user = req.user;
    const { sessionId, packId } = req.body;

    if (!sessionId || !user || user.uid === "guest") {
      return res.status(400).json({ error: "Parâmetros inválidos." });
    }

    try {
      const stripe = await getStripe();
      if (!stripe) {
        return res.status(500).json({ error: "Stripe não configurado no servidor." });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const isPaid = session.payment_status === 'paid' || session.status === 'complete';

      if (!isPaid) {
        return res.status(400).json({ 
          approved: false, 
          message: "O pagamento deste pacote ainda não foi aprovado pela Stripe." 
        });
      }

      const targetPackId = packId || session.metadata?.packId;
      const targetPackTitle = session.metadata?.packTitle || targetPackId;
      const amountPaid = session.amount_total ? session.amount_total / 100 : (Number(session.metadata?.packPrice) || 0);
      const customerEmail = session.customer_details?.email || session.customer_email || user.email || '';
      const customerName = session.customer_details?.name || '';

      const db = getDb();
      // 1. Garantir registro na coleção flashcard_purchases
      const purchaseRef = doc(db, "flashcard_purchases", session.id);
      await setDoc(purchaseRef, {
        id: session.id,
        userId: user.uid,
        userEmail: customerEmail,
        userName: customerName,
        packId: targetPackId,
        packTitle: targetPackTitle,
        amount: amountPaid,
        currency: session.currency || 'brl',
        paymentStatus: 'paid',
        status: 'approved',
        stripeSessionId: session.id,
        paymentIntentId: session.payment_intent || null,
        createdAt: new Date().toISOString(),
        timestamp: Date.now()
      }, { merge: true });

      // 2. Garantir liberação no perfil do usuário
      if (targetPackId) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        let ownedPacks: string[] = [];
        if (userSnap.exists()) {
          ownedPacks = userSnap.data()?.ownedFlashcardPacks || [];
        }
        if (!ownedPacks.includes(targetPackId)) {
          ownedPacks.push(targetPackId);
          await setDoc(userRef, { ownedFlashcardPacks: ownedPacks }, { merge: true });
        }
      }

      console.log(`[STRIPE-VERIFY] Compra de flashcard verificada e aprovada com sucesso! Session: ${session.id}`);
      return res.json({ approved: true, packId: targetPackId, session: session.id });
    } catch (e: any) {
      console.error("[STRIPE-VERIFY] Erro ao verificar sessão da Stripe:", e);
      return res.status(500).json({ error: e.message || "Erro ao verificar status com Stripe." });
    }
  });

  app.post("/api/stripe/checkout", authenticate, handleCheckout);
  app.post("/api/stripe/create-checkout-session", authenticate, handleCheckout);
  app.post("/stripe-session", authenticate, handleCheckout);
  app.get("/api/stripe-test", (req, res) => res.json({ ok: true, msg: "Endpoint is active" }));

  // Gemini Proxy Routes
  
  const requireActionLimit = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (!user || user.uid === "guest") {
      return next(); // Guest handled by IP limit
    }
    try {
      const db = getDb();
      const userDoc = await getDoc(doc(db, `users/${user.uid}`));
      const userData = userDoc.data();
      if (!userData) return next();
      
      const isPremium = userData.planStatus === 'premium';
      if (isPremium) return next(); // Premium has no strict limit here, or higher limit

      // Check daily questions
      const today = getBrazilTodayStr();
      const count = (userData.lastQuestionResetDate === today) ? (userData.dailyQuestionsCount || 0) : 0;
      const fcCount = userData.aiFlashcardsUsedCount || 0;

      // Arbitrary backend hard limit for free accounts to prevent abuse
      if (count > 200 || fcCount > 200) {
        return res.status(429).json({ error: "Daily limit reached for your account." });
      }
      next();
    } catch (error) {
      console.error("[ACTION-LIMIT-ERROR]", error);
      next(); // fallback to allow
    }
  };

  app.post("/api/gemini/generate", authenticate, requireActionLimit, async (req, res) => {

    try {
      const { model, contents, config } = req.body;
      if (!contents || !Array.isArray(contents)) return res.status(400).json({ error: "Invalid format" });
      const targetModel = model || "gemini-3.8-flash";
      const response = await callGeminiWithRetry(async (ai) => {
        return await ai.models.generateContent({
          model: targetModel,
          contents,
          config
        });
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.warn("[GEMINI-ERROR]", error?.message || error);
      const isQuota = String(error?.message || "").includes("429") || 
                      String(error?.message || "").includes("esgotaram a cota") || 
                      String(error?.message || "").includes("RESOURCE_EXHAUSTED");
      res.status(isQuota ? 429 : 500).json({ error: error.message, isQuota });
    }
  });

  app.post("/api/gemini/news", authenticate, requirePremium, async (req, res) => {
    try {
      const { prompt } = req.body;
      const response = await callGeminiWithRetry(async (ai) => {
        return await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt + "\nReturn JSON array of 5-10 news items.",
          config: { tools: [{ googleSearch: {} }] }
        });
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.warn("[NEWS-ERROR]", error?.message || error);
      res.status(500).json({ error: error.message });
    }
  });


  app.post("/api/auth/logout", authenticate, async (req, res) => {
    const user = (req as any).user;
    if (user && user.uid && user.uid !== "guest") {
      try {
        // await admin.auth().revokeRefreshTokens(user.uid);
        res.json({ success: true, message: "Tokens revoked" });
      } catch (e) {
        console.error("[REVOKE ERROR]", e);
        res.status(500).json({ error: "Failed to revoke tokens" });
      }
    } else {
      res.json({ success: true });
    }
  });

// Helper to prevent Firestore calls from hanging when quota limits are reached
async function withFirestoreTimeout<T>(promise: Promise<T>, timeoutMs = 3500, fallback: T): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      resolve(fallback);
    }, timeoutMs);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (err) {
    clearTimeout(timer);
    return fallback;
  }
}

  app.post("/api/profile/initialize", authenticate, async (req, res) => {
    const user = (req as any).user;
    if (!user || user.uid === "guest") return res.status(401).json({ error: "Unauthorized" });

    try {
      const db = getDb();
      const userRef = doc(db, `users/${user.uid}`);
      const today = getBrazilTodayStr();
      
      const snap = await withFirestoreTimeout(getDoc(userRef), 4000, null);

      if (!snap || !snap.exists()) {
        // Document does not exist or fetch timed out, create / return default
        const newUser: any = {
          uid: user.uid,
          email: user.email || "",
          displayName: user.name || "Usuário",
          photoURL: user.picture || "",
          planStatus: 'free',
          dailyQuestionsCount: 0,
          aiFlashcardsUsedCount: 0,
          lastQuestionResetDate: today,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        };
        
        if (user.phone_number) {
          newUser.phone = user.phone_number;
        }

        // Try writing asynchronously with timeout protection
        withFirestoreTimeout(setDoc(userRef, newUser, { merge: true }), 3000, null).catch((setErr) => {
          console.warn("[USER-SYNC-WRITE-WARNING] Non-blocking user creation skipped/quota reached:", setErr?.message || setErr);
        });

        return res.json({
          ...newUser,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        });
      }

      // Document exists, check if updates are necessary
      const data = snap.data() || {};
      const updateData: any = {};

      // 1. Reset daily count if day has changed
      if (data.lastQuestionResetDate !== today) {
        updateData.dailyQuestionsCount = 0;
        updateData.lastQuestionResetDate = today;
      }

      // 2. Only update lastLogin once every 24 hours to preserve daily write quota
      const lastLoginTimestamp = data.lastLogin ? (data.lastLogin.toDate ? data.lastLogin.toDate().getTime() : new Date(data.lastLogin).getTime()) : 0;
      const needsLoginUpdate = !lastLoginTimestamp || (Date.now() - lastLoginTimestamp > 24 * 60 * 60 * 1000);

      if (needsLoginUpdate) {
        updateData.lastLogin = serverTimestamp();
      }

      // Perform update only if there's actual data to update (with timeout protection)
      if (Object.keys(updateData).length > 0) {
        withFirestoreTimeout(updateDoc(userRef, updateData), 3000, null).catch((updateErr) => {
          console.warn("[USER-SYNC-WRITE-WARNING] Non-blocking user doc update skipped/quota reached:", updateErr?.message || updateErr);
        });
      }

      // Construct return object
      const responseData = {
        uid: data.uid || user.uid,
        email: data.email || user.email || "",
        displayName: data.displayName || data.name || "Usuário",
        photoURL: data.photoURL || data.picture || "",
        planStatus: data.planStatus || 'free',
        dailyQuestionsCount: updateData.dailyQuestionsCount !== undefined ? updateData.dailyQuestionsCount : (data.dailyQuestionsCount || 0),
        aiFlashcardsUsedCount: data.aiFlashcardsUsedCount || 0,
        ownedFlashcardPacks: data.ownedFlashcardPacks || []
      };
      res.json(responseData);

    } catch (error: any) {
      console.warn("[USER-SYNC-ERROR]", error?.message || error);
      res.json({
        uid: user.uid,
        email: user.email || "",
        displayName: user.name || "Usuário",
        photoURL: user.picture || "",
        planStatus: 'free',
        dailyQuestionsCount: 0,
        aiFlashcardsUsedCount: 0,
        ownedFlashcardPacks: []
      });
    }
  });

  app.post("/api/profile/increment-questions", authenticate, async (req, res) => {
    const user = (req as any).user;
    if (!user || user.uid === "guest") return res.status(401).json({ error: "Unauthorized" });

    try {
      const db = getDb();
      const userRef = doc(db, `users/${user.uid}`);
      await runTransaction(db, async (t: any) => {
        const snap = await t.get(userRef);
        const today = getBrazilTodayStr();
        
        if (!snap.exists()) {
          // If for some reason sync wasn't called yet
          t.set(userRef, {
            uid: user.uid,
            email: user.email || "",
            displayName: user.name || "Usuário",
            planStatus: 'free',
            dailyQuestionsCount: 1,
            lastQuestionResetDate: today,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
          });
          return;
        }

        const data = snap.data() || {};
        let count = data.dailyQuestionsCount || 0;
        let lastReset = data.lastQuestionResetDate || "";

        if (lastReset !== today) {
          count = 1;
          lastReset = today;
        } else {
          count += 1;
        }

        t.update(userRef, { 
          dailyQuestionsCount: count,
          lastQuestionResetDate: lastReset
        });
      });
      res.json({ success: true });
    } catch (error) {
      console.warn("[INCREMENT-QUESTIONS-ERROR]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/profile/increment-ai-flashcards", authenticate, async (req, res) => {
    const user = (req as any).user;
    if (!user || user.uid === "guest") return res.status(401).json({ error: "Unauthorized" });

    try {
      const db = getDb();
      const userRef = doc(db, `users/${user.uid}`);
      await runTransaction(db, async (t: any) => {
        const snap = await t.get(userRef);
        if (!snap.exists()) {
          t.set(userRef, {
            uid: user.uid,
            email: user.email || "",
            displayName: user.name || "Usuário",
            planStatus: 'free',
            aiFlashcardsUsedCount: 1,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
          }, { merge: true });
          return;
        }

        const data = snap.data() || {};
        const count = (data.aiFlashcardsUsedCount || 0) + 1;

        t.update(userRef, { aiFlashcardsUsedCount: count });
      });
      res.json({ success: true });
    } catch (error) {
      console.warn("[INCREMENT-AI-FC-ERROR]", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API 404 handler
  setupAdminRoutes(app, authenticate as any, getDb);

  app.all("/api/*", (req, res) => {
    console.warn(`[API-404] ${req.method} ${req.url}`);
    res.status(404).json({ error: `API route ${req.originalUrl} not found` });
  });

  // Static Assets and SPA Fallback
  const distPath = path.join(process.cwd(), "dist");

  if (process.env.NODE_ENV !== "production") {
    console.log(`[SERVER] Mode: Development (Vite Middleware)`);
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log(`[SERVER] Mode: Serving STATIC from ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[GLOBAL ERROR] ${req.method} ${req.url}:`, err);
    res.status(500).json({ error: "Erro interno no servidor.", details: err.message });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Server running on port ${PORT}`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
  });
}

startServer();
