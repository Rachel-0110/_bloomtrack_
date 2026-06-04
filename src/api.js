/**
 * api.js — Centralised API layer for BloomTrack frontend.
 *
 * All HTTP calls to the FastAPI backend go through here.
 * Includes field-mapping helpers so the rest of the app
 * continues using camelCase while the backend expects snake_case.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

// ── Field mapping helpers ───────────────────────────────────────────────────

/**
 * Convert a camelCase stock object to snake_case for the backend.
 */
export function stockToBackend(frontendItem) {
  return {
    flower_name: frontendItem.flowerName,
    quantity: frontendItem.quantity,
    unit: frontendItem.unit,
    arrival_date: frontendItem.arrivalDate,      // already "YYYY-MM-DD"
    colour: frontendItem.colour,
    cost_per_unit: frontendItem.costPerUnit ?? 0,
    status: frontendItem.status ?? "available",
    shop_code: frontendItem.shopCode,
  };
}

/**
 * Convert a snake_case stock row from the backend to camelCase for the frontend.
 */
export function stockFromBackend(backendItem) {
  return {
    id: backendItem.id,                          // UUID string
    flowerName: backendItem.flower_name,
    quantity: backendItem.quantity,
    unit: backendItem.unit,
    arrivalDate: backendItem.arrival_date,
    colour: backendItem.colour,
    costPerUnit: backendItem.cost_per_unit,
    status: backendItem.status,
    shopCode: backendItem.shop_code,
    createdAt: backendItem.created_at,
  };
}

/**
 * Convert frontend waste form data to backend format.
 */
export function wasteToBackend(frontendEntry) {
  return {
    stock_id: frontendEntry.stockId,
    flower_name: frontendEntry.flowerName,
    quantity_wasted: frontendEntry.quantityWasted,
    reason: frontendEntry.reason,
    estimated_loss: frontendEntry.estimatedLoss ?? 0,
    shop_code: frontendEntry.shopCode,
  };
}

/**
 * Convert a snake_case waste row from the backend to camelCase.
 */
export function wasteFromBackend(backendItem) {
  return {
    id: backendItem.id,
    stockId: backendItem.stock_id,
    flowerName: backendItem.flower_name,
    quantityWasted: backendItem.quantity_wasted,
    reason: backendItem.reason,
    estimatedLoss: backendItem.estimated_loss,
    shopCode: backendItem.shop_code,
    createdAt: backendItem.created_at,
  };
}

// ── Generic fetch wrapper ───────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let detail = `API error: ${res.status}`;
    try {
      const body = await res.json();
      if (body.detail) detail = body.detail;
    } catch { /* ignore parse error */ }
    throw new Error(detail);
  }

  return res.json();
}

// ── Stock API ───────────────────────────────────────────────────────────────

export async function fetchStock(shopCode) {
  const data = await apiFetch(`/stock?shop_code=${encodeURIComponent(shopCode)}`);
  return data.map(stockFromBackend);
}

export async function createStock(item) {
  const payload = stockToBackend(item);
  const data = await apiFetch("/stock", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return stockFromBackend(data);
}

export async function updateStock(id, updates) {
  // Convert only the provided fields
  const backendUpdates = {};
  if (updates.flowerName !== undefined) backendUpdates.flower_name = updates.flowerName;
  if (updates.quantity !== undefined) backendUpdates.quantity = updates.quantity;
  if (updates.unit !== undefined) backendUpdates.unit = updates.unit;
  if (updates.arrivalDate !== undefined) backendUpdates.arrival_date = updates.arrivalDate;
  if (updates.colour !== undefined) backendUpdates.colour = updates.colour;
  if (updates.costPerUnit !== undefined) backendUpdates.cost_per_unit = updates.costPerUnit;
  if (updates.status !== undefined) backendUpdates.status = updates.status;
  if (updates.shopCode !== undefined) backendUpdates.shop_code = updates.shopCode;

  const data = await apiFetch(`/stock/${id}`, {
    method: "PUT",
    body: JSON.stringify(backendUpdates),
  });
  return stockFromBackend(data);
}

export async function deleteStock(id) {
  await apiFetch(`/stock/${id}`, { method: "DELETE" });
}

// ── Waste API ───────────────────────────────────────────────────────────────

export async function createWaste(entry) {
  const payload = wasteToBackend(entry);
  const data = await apiFetch("/waste", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return wasteFromBackend(data);
}

export async function fetchWaste(shopCode) {
  const data = await apiFetch(`/waste?shop_code=${encodeURIComponent(shopCode)}`);
  return data.map(wasteFromBackend);
}

// ── Health ──────────────────────────────────────────────────────────────────

export async function checkHealth() {
  try {
    const data = await apiFetch("/health");
    return data.status === "ok";
  } catch {
    return false;
  }
}

// ── Shop API ────────────────────────────────────────────────────────────────

export async function registerShop(data) {
  const url = `${API_BASE_URL}/shops`;
  const payload = JSON.stringify({
    shop_name: data.shopName,
    owner_name: data.ownerName,
    email: data.email,
  });
  console.log("[registerShop] POST", url, payload);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  });

  if (!res.ok) {
    let detail = `API error: ${res.status}`;
    try {
      const body = await res.json();
      if (body.detail) detail = body.detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }

  return res.json();
}

export async function verifyShop(email) {
  const url = `${API_BASE_URL}/shops/verify?email=${encodeURIComponent(email)}`;
  console.log("[verifyShop] GET", url);

  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    let detail = `API error: ${res.status}`;
    try {
      const body = await res.json();
      if (body.detail) detail = body.detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }

  return res.json();
}

export async function verifyAccessCode(accessCode) {
  return apiFetch(`/shops/verify-by-code?access_code=${encodeURIComponent(accessCode)}`);
}
