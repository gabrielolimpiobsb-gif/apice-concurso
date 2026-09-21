import { AffiliateAttribution } from '../types/affiliate';

const VISITOR_COOKIE_KEY = 'apice_visitor_id';
const ATTR_STORAGE_KEY = 'apice_aff_attribution';
const ATTR_COOKIE_KEY = 'apice_aff_attr';

function getCookie(name: string): string | null {
  try {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
  } catch (e) {
    return null;
  }
}

function setCookie(name: string, value: string, days = 90): void {
  try {
    if (typeof document === 'undefined') return;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = '; expires=' + date.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    console.warn('[AFFILIATE] Cookie set error:', e);
  }
}

export function detectDevice(): string {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

export function detectBrowser(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
  return 'Browser';
}

export const affiliateClientService = {
  getOrCreateVisitorId: (): string => {
    try {
      let vid = getCookie(VISITOR_COOKIE_KEY) || localStorage.getItem(VISITOR_COOKIE_KEY);
      if (!vid) {
        vid = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem(VISITOR_COOKIE_KEY, vid);
        setCookie(VISITOR_COOKIE_KEY, vid, 365);
      } else {
        // Keep both in sync
        setCookie(VISITOR_COOKIE_KEY, vid, 365);
        localStorage.setItem(VISITOR_COOKIE_KEY, vid);
      }
      return vid;
    } catch (e) {
      return 'v_temp_' + Date.now();
    }
  },

  parseAffiliateCodeFromPath: (pathname: string): string | null => {
    if (!pathname) return null;
    const clean = pathname.trim();
    
    // Pattern 1: /afiliado/363663 or /afiliado/joao-silva
    const matchSlash = clean.match(/^\/afiliado\/([a-zA-Z0-9_-]+)/i);
    if (matchSlash && matchSlash[1]) {
      return matchSlash[1].trim();
    }

    // Pattern 2: /afiliado363663
    const matchDirect = clean.match(/^\/afiliado([a-zA-Z0-9_-]+)/i);
    if (matchDirect && matchDirect[1]) {
      return matchDirect[1].trim();
    }

    return null;
  },

  extractUtmParams: (): {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
  } => {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    const utms: Record<string, string> = {};
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    
    keys.forEach(k => {
      const val = params.get(k);
      if (val) {
        const camelKey = k.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()) as any;
        utms[camelKey] = val.trim();
      }
    });

    return utms;
  },

  getActiveAttribution: (): Partial<AffiliateAttribution> | null => {
    try {
      let raw = getCookie(ATTR_COOKIE_KEY);
      if (!raw) {
        raw = localStorage.getItem(ATTR_STORAGE_KEY);
      }
      if (!raw) return null;

      const data = JSON.parse(raw);
      if (data && data.affiliateId) {
        // Check expiration if configured
        if (data.attributionExpiresAt) {
          const expTime = new Date(data.attributionExpiresAt).getTime();
          if (Date.now() > expTime) {
            affiliateClientService.clearAttribution();
            return null;
          }
        }
        return data;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  saveAttributionLocally: (attr: Partial<AffiliateAttribution>, days = 90): void => {
    try {
      const json = JSON.stringify(attr);
      localStorage.setItem(ATTR_STORAGE_KEY, json);
      setCookie(ATTR_COOKIE_KEY, json, days > 0 ? days : 365);
      window.dispatchEvent(new CustomEvent('apice:affiliate-assigned', { detail: attr }));
    } catch (e) {
      console.warn('[AFFILIATE] Local save failed:', e);
    }
  },

  clearAttribution: (): void => {
    try {
      localStorage.removeItem(ATTR_STORAGE_KEY);
      setCookie(ATTR_COOKIE_KEY, '', -1);
    } catch (e) {}
  },

  trackVisit: async (code: string): Promise<{ success: boolean; affiliate?: any; message?: string }> => {
    try {
      const visitorId = affiliateClientService.getOrCreateVisitorId();
      const utms = affiliateClientService.extractUtmParams();
      const payload = {
        code: code.trim(),
        visitorId,
        landingPage: window.location.pathname + window.location.search,
        referrer: document.referrer || '',
        device: detectDevice(),
        browser: detectBrowser(),
        ...utms
      };

      const res = await fetch('/api/affiliates/track-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success && data.attribution) {
        affiliateClientService.saveAttributionLocally(
          data.attribution, 
          data.attributionWindowDays || 90
        );
        return { success: true, affiliate: data.affiliate };
      } else {
        return { success: false, message: data.error || 'Afiliado não encontrado ou inativo' };
      }
    } catch (err: any) {
      console.error('[AFFILIATE] Track visit error:', err);
      return { success: false, message: err.message };
    }
  },

  trackSignup: async (userId: string, email: string, name: string): Promise<boolean> => {
    try {
      const visitorId = affiliateClientService.getOrCreateVisitorId();
      const currentAttr = affiliateClientService.getActiveAttribution();

      const payload = {
        userId,
        email,
        name,
        visitorId,
        affiliateId: currentAttr?.affiliateId,
        affiliateCode: currentAttr?.affiliateCode
      };

      const res = await fetch('/api/affiliates/track-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.attribution) {
          affiliateClientService.saveAttributionLocally(data.attribution);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.warn('[AFFILIATE] Track signup error:', e);
      return false;
    }
  },

  trackLogin: async (userId: string): Promise<void> => {
    try {
      const visitorId = affiliateClientService.getOrCreateVisitorId();
      const currentAttr = affiliateClientService.getActiveAttribution();

      fetch('/api/affiliates/track-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          visitorId,
          affiliateId: currentAttr?.affiliateId
        })
      }).catch(() => {});
    } catch (e) {}
  },

  trackCheckoutStarted: async (userId?: string, plan?: string): Promise<void> => {
    try {
      const visitorId = affiliateClientService.getOrCreateVisitorId();
      const currentAttr = affiliateClientService.getActiveAttribution();

      fetch('/api/affiliates/track-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          visitorId,
          plan: plan || 'mensal',
          affiliateId: currentAttr?.affiliateId
        })
      }).catch(() => {});
    } catch (e) {}
  },

  // Affiliate Self-Service Portal APIs
  checkPortalStatus: async (token: string): Promise<{ isAffiliate: boolean; code?: string; name?: string; status?: string }> => {
    try {
      const res = await fetch('/api/affiliate-portal/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        return await res.json();
      }
      return { isAffiliate: false };
    } catch (e) {
      return { isAffiliate: false };
    }
  },

  getPortalData: async (token: string): Promise<any> => {
    const res = await fetch('/api/affiliate-portal/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      let errorMsg = '';
      try {
        const err = await res.json();
        errorMsg = err.error || err.message || '';
      } catch (e) {}
      throw new Error(errorMsg || (res.status === 403 
        ? 'Acesso restrito. Seu e-mail não possui cadastro de afiliado ativo.'
        : `Falha ao carregar painel do afiliado (${res.status})`));
    }
    return await res.json();
  },

  updatePix: async (token: string, pixKey: string, pixType: string): Promise<any> => {
    const res = await fetch('/api/affiliate-portal/pix', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ pixKey, pixType })
    });
    if (!res.ok) {
      let errorMsg = '';
      try {
        const err = await res.json();
        errorMsg = err.error || err.message || '';
      } catch (e) {}
      throw new Error(errorMsg || 'Erro ao salvar chave PIX');
    }
    return await res.json();
  },

  // Métodos Administrativos: Ativação de Afiliado por E-mail / Conta
  adminActivateByEmail: async (
    token: string, 
    data: { email: string; name?: string; code?: string; commissionRate?: number; status?: 'active' | 'inactive' }
  ): Promise<any> => {
    const res = await fetch('/api/admin/affiliates/activate-by-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Falha ao ativar afiliado por e-mail');
    }
    return result;
  },

  adminSearchUsers: async (token: string, query: string): Promise<any[]> => {
    const res = await fetch(`/api/admin/affiliates/search-users?q=${encodeURIComponent(query)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      return [];
    }
    return await res.json();
  },

  adminToggleUserAffiliate: async (
    token: string, 
    uid: string, 
    options?: { customCode?: string; commissionRate?: number }
  ): Promise<any> => {
    const res = await fetch(`/api/admin/users/${uid}/toggle-affiliate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(options || {})
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Falha ao alterar status de afiliado do usuário');
    }
    return result;
  }
};
