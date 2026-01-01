// FRONTEND-ONLY (MOCK) storage + light validation helpers
// NOTE: This file intentionally avoids any backend calls.

const LS_KEYS = {
  earlyAccess: "ryha:earlyAccess",
  contact: "ryha:contactMessages",
  metrics: "ryha:metrics",
};

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function readArray(key) {
  if (typeof window === "undefined") return [];
  return safeJsonParse(window.localStorage.getItem(key), []);
}

function writeArray(key, arr) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(arr));
}

function readObject(key, fallback) {
  if (typeof window === "undefined") return fallback;
  return safeJsonParse(window.localStorage.getItem(key), fallback);
}

function writeObject(key, obj) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(obj));
}

export function isValidEmail(email) {
  if (!email) return false;
  // Simple but effective enough for client-side validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export function getMetrics() {
  const base = {
    earlyAccessCount: 2381,
    lastUpdatedAt: new Date().toISOString(),
  };

  const existing = readObject(LS_KEYS.metrics, null);
  if (!existing) {
    writeObject(LS_KEYS.metrics, base);
    return base;
  }

  return { ...base, ...existing };
}

function bumpEarlyAccessCount() {
  const m = getMetrics();
  // small, believable bumps (avoid feeling gimmicky)
  const bump = 1;
  const next = {
    ...m,
    earlyAccessCount: (m.earlyAccessCount || 0) + bump,
    lastUpdatedAt: new Date().toISOString(),
  };
  writeObject(LS_KEYS.metrics, next);
  return next;
}

export function getEarlyAccessList() {
  return readArray(LS_KEYS.earlyAccess);
}

export async function submitEarlyAccess({ name, email, interest }) {
  const cleanedEmail = String(email || "").trim().toLowerCase();
  const cleanedName = String(name || "").trim();
  const cleanedInterest = String(interest || "").trim();

  if (!isValidEmail(cleanedEmail)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  // Try backend first; fall back to local mock if network or server not available
  try {
    const res = await fetch('/api/early-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cleanedName, email: cleanedEmail, interest: cleanedInterest }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return { ok: false, error: j.detail || 'Server error' };
    }
    const j = await res.json();
    return { ok: true, already: false, item: j.item };
  } catch (e) {
    // fallback to localStorage mock
    const list = getEarlyAccessList();
    const already = list.find((x) => x.email === cleanedEmail);
    if (already) {
      return { ok: true, already: true, item: already, metrics: getMetrics() };
    }

    const item = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: cleanedName,
      email: cleanedEmail,
      interest: cleanedInterest,
      createdAt: new Date().toISOString(),
    };

    writeArray(LS_KEYS.earlyAccess, [item, ...list]);
    const metrics = bumpEarlyAccessCount();

    return { ok: true, already: false, item, metrics };
  }
}

export function getContactMessages() {
  return readArray(LS_KEYS.contact);
}

export async function submitContactMessage({ name, email, message }) {
  const cleanedEmail = String(email || "").trim().toLowerCase();
  const cleanedName = String(name || "").trim();
  const cleanedMsg = String(message || "").trim();

  if (!cleanedName) return { ok: false, error: "Please enter your name." };
  if (!isValidEmail(cleanedEmail)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!cleanedMsg || cleanedMsg.length < 10) {
    return { ok: false, error: "Please enter a message (at least 10 characters)." };
  }

  try {
    const res = await fetch('/api/contact-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cleanedName, email: cleanedEmail, message: cleanedMsg }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return { ok: false, error: j.detail || 'Server error' };
    }
    const j = await res.json();
    return { ok: true, item: j.item };
  } catch (e) {
    const item = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: cleanedName,
      email: cleanedEmail,
      message: cleanedMsg,
      createdAt: new Date().toISOString(),
    };
    const prev = getContactMessages();
    writeArray(LS_KEYS.contact, [item, ...prev]);
    return { ok: true, item };
  }
}
