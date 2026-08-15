const API = "https://pos-api.lateshoy.workers.dev";

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (data && typeof data === "object") {
    if (data.ok === true || data.success === true) {
      return {
        success: true,
        data: data.user ?? data.data ?? data
      };
    }

    return {
      success: false,
      error: {
        message: typeof data.error === "string"
          ? data.error
          : data.error?.message || data.message || `Ошибка API (${response.status})`
      }
    };
  }

  return {
    success: false,
    error: { message: response.ok ? "Пустой ответ API" : `Ошибка API (${response.status})` }
  };
}

export function authLogin(username, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
}

export function authMe() {
  return request("/api/auth/me");
}

export function authLogout() {
  return request("/api/auth/logout", { method: "POST" });
}

export function getProductByBarcode(barcode) {
  return request(`/api/products/${encodeURIComponent(barcode)}`);
}

export function createSale(sale) {
  return request("/api/sales", {
    method: "POST",
    body: JSON.stringify(sale)
  });
}
