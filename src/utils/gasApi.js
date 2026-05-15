const TOKEN_STORAGE_KEY = "grosirkit_gas_token";
const DEFAULT_TIMEOUT_MS = 10000;

function getBaseUrl() {
  return (import.meta.env.VITE_GAS_BASE_URL || "").trim();
}

export function saveGasToken(token) {
  if (!token) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return;
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getGasToken() {
  const localToken = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (localToken) {
    return localToken;
  }

  return (import.meta.env.VITE_GAS_TOKEN || "").trim();
}

function withTimeout(signal, timeoutMs = DEFAULT_TIMEOUT_MS) {
  if (signal) {
    return signal;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  };
}

function buildHeaders() {
  const token = getGasToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      status: "error",
      message: "Response bukan JSON valid.",
      raw: text,
    };
  }
}

function resolveUrl(action, params = {}) {
  const baseUrl = getBaseUrl();

  if (!baseUrl) {
    throw new Error("VITE_GAS_BASE_URL belum diatur.");
  }

  const url = new URL(baseUrl);
  url.searchParams.set("action", action);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function request(url, options = {}) {
  const timeoutSignal = withTimeout(options.signal, options.timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: timeoutSignal.signal || timeoutSignal,
      headers: {
        ...buildHeaders(),
        ...(options.headers || {}),
      },
    });

    const payload = await parseResponse(response);

    if (!response.ok || payload.status === "error") {
      throw new Error(payload.message || `Request gagal (${response.status}).`);
    }

    return payload;
  } finally {
    if (typeof timeoutSignal.cleanup === "function") {
      timeoutSignal.cleanup();
    }
  }
}

export async function gasGet(action, params = {}, options = {}) {
  const url = resolveUrl(action, params);

  return request(url, {
    method: "GET",
    ...options,
  });
}

export async function gasPost(action, data = {}, options = {}) {
  const baseUrl = getBaseUrl();

  if (!baseUrl) {
    throw new Error("VITE_GAS_BASE_URL belum diatur.");
  }

  const payload = {
    action,
    ...data,
  };

  return request(baseUrl, {
    method: "POST",
    body: JSON.stringify(payload),
    ...options,
  });
}
