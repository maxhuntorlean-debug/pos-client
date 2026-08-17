const API = "https://pos-api.lateshoy.workers.dev";


// ======================================================
// BASE REQUEST
// ======================================================

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {}),
    },
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
        data: data.user ?? data.data ?? data,
      };
    }

    return {
      success: false,
      error: {
        message:
          typeof data.error === "string"
            ? data.error
            : data.error?.message ||
              data.message ||
              `Ошибка API (${response.status})`,
      },
    };
  }

  return {
    success: false,
    error: {
      message: response.ok
        ? "Пустой ответ API"
        : `Ошибка API (${response.status})`,
    },
  };
}


// ======================================================
// AUTH
// ======================================================

export function authLogin(username, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
  });
}

export function authMe() {
  return request("/api/auth/me");
}

export function authLogout() {
  return request("/api/auth/logout", {
    method: "POST",
  });
}


// ======================================================
// PRODUCTS
// ======================================================

export function getProductByBarcode(barcode) {
  return request(
    `/api/products/${encodeURIComponent(barcode)}`
  );
}


// ======================================================
// SALES
// ======================================================

export function createSale(sale) {
  return request("/api/sales", {
    method: "POST",
    body: JSON.stringify(sale),
  });
}


// ======================================================
// SALES JOURNAL
// ======================================================

export function getSalesJournal(from, to) {
  return request(
    `/api/sales/journal?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
  );
}


// ======================================================
// SALES REPORT
// ======================================================

export function getSalesReport(from, to) {
  return request(
    `/api/sales/report?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
  );
}

// ======================================================
// SALE DOCUMENT
// ======================================================

export function getSale(id) {
  return request(
    `/api/sales/${encodeURIComponent(id)}`
  );
}

export function updateSale(id, items) {
  return request(
    `/api/sales/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        items,
      }),
    }
  );
}

export function createProduct(product) {
  return request("/api/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

export function getEvents(from, to) {
  return request(
    `/api/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
  );
}

// ======================================================
// CASH
// ======================================================

export function getCashDocuments(cashType) {
  return request(
    `/api/cash/${encodeURIComponent(cashType)}`
  );
}


export function createCashDocument(
  cashType,
  date = null
) {
  return request(
    `/api/cash/${encodeURIComponent(cashType)}`,
    {
      method: "POST",

      ...(date
        ? {
            body: JSON.stringify({
              date,
            }),
          }
        : {}),
    }
  );
}


export function getCashDocument(
  cashType,
  documentId
) {
  return request(
    `/api/cash/${encodeURIComponent(cashType)}/${encodeURIComponent(documentId)}`
  );
}

// ======================================================
// CASH OPERATIONS
// ======================================================

export function addCashOperation(
  cashType,
  documentId,
  operation
) {
  return request(
    `/api/cash/${encodeURIComponent(cashType)}/${encodeURIComponent(documentId)}/operations`,
    {
      method: "POST",

      body: JSON.stringify({
        sign: operation.sign,
        operation_type: operation.operation_type,
        amount: operation.amount,
        comment: operation.comment || "",
      }),
    }
  );
}


export function updateCashOperation(
  cashType,
  documentId,
  operationId,
  operation
) {
  return request(
    `/api/cash/${encodeURIComponent(cashType)}/${encodeURIComponent(documentId)}/operations/${encodeURIComponent(operationId)}`,
    {
      method: "PUT",

      body: JSON.stringify({
        sign: operation.sign,
        operation_type: operation.operation_type,
        amount: operation.amount,
        comment: operation.comment || "",
      }),
    }
  );
}


export function deleteCashOperation(
  cashType,
  documentId,
  operationId
) {
  return request(
    `/api/cash/${encodeURIComponent(cashType)}/${encodeURIComponent(documentId)}/operations/${encodeURIComponent(operationId)}`,
    {
      method: "DELETE",
    }
  );
}