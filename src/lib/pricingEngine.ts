/**
 * Pricing Engine — ÚNICA fuente de verdad para el precio de huacales.
 *
 * REGLAS CRÍTICAS:
 *  - Este es el ÚNICO lugar donde se calcula el precio de un huacal.
 *  - El resultado (`finalPrice`) es INMUTABLE una vez agregado al carrito.
 *  - Prohibido recalcular en carrito, checkout o cualquier método de pago.
 *  - Stripe / PayPal / Venmo / Zelle reciben EXACTAMENTE `finalPrice` en USD.
 *    Para cents: `Math.round(finalPrice * 100)`.
 */

// Costos fijos (USD)
export const PLYWOOD_SHEET_AREA_IN2 = 48 * 96; // 4608 in² por plancha 48×96
export const PLYWOOD_SHEET_COST = 40;           // $ por plancha 48×96
export const LABOR_COST = 25;                   // mano de obra (fijo)
export const CLAMPS_COST = 10;                  // presillas
export const GLUE_COST = 10;                    // cola
export const FOAM_PIECE_COST = 17;              // costo por pieza de foam
export const FOAM_PIECES = 2;                   // piezas de foam (fijo)
export const DELIVERY_COST = 49.20;             // delivery
export const MARKUP = 3;                        // multiplicador final ×3

export interface CrateDimensions {
  length: number; // in
  width: number;  // in
  height: number; // in
}

export interface CratePriceBreakdown {
  usedAreaIn2: number;
  woodCost: number;
  laborHours: number;
  laborCost: number;
  clampsCost: number;
  glueCost: number;
  foamPieces: number;
  foamCost: number;
  deliveryCost: number;
  subtotal: number;
  finalPrice: number; // INMUTABLE — usar tal cual
}

/**
 * Calcula el precio de UN huacal. Ejecutar UNA sola vez (al agregar al
 * carrito). El `finalPrice` resultante NO debe recalcularse jamás.
 */
export function computeCratePrice(dims: CrateDimensions): CratePriceBreakdown {
  const { length, width, height } = dims;

  if (length <= 0 || width <= 0 || height <= 0) {
    return {
      usedAreaIn2: 0,
      woodCost: 0,
      laborHours: 0,
      laborCost: 0,
      clampsCost: 0,
      glueCost: 0,
      foamPieces: 0,
      foamCost: 0,
      deliveryCost: 0,
      subtotal: 0,
      finalPrice: 0,
    };
  }

  // 🪵 MADERA REAL — base + 4 lados, proporcional a una plancha 48x96
  const baseArea = length * width;
  const sideArea = 2 * (length * height + width * height);
  const totalArea = baseArea + sideArea;
  const weightedArea = baseArea * 1.0 + sideArea * 0.6;
  const woodCost = (weightedArea / PLYWOOD_SHEET_AREA_IN2) * PLYWOOD_SHEET_COST;

  // 🧽 FOAM — fijo en 2 piezas
  const foamPieces = FOAM_PIECES;
  const foam = foamPieces * FOAM_PIECE_COST;

  // 👷 LABOR — escala con altura
  const laborHours = 1 + height * 0.03;
  const labor = laborHours * LABOR_COST;

  // ➕ SUBTOTAL
  const subtotal =
    labor + CLAMPS_COST + GLUE_COST + foam + woodCost + DELIVERY_COST;

  // 📦 MARGEN ×3
  const finalPrice = Math.round(subtotal * MARKUP);

  return {
    usedAreaIn2: totalArea,
    woodCost,
    laborHours,
    laborCost: labor,
    clampsCost: CLAMPS_COST,
    glueCost: GLUE_COST,
    foamPieces,
    foamCost: foam,
    deliveryCost: DELIVERY_COST,
    subtotal,
    finalPrice,
  };
}

/**
 * Convierte un `finalPrice` USD a cents para procesadores de pago.
 * Única conversión permitida en toda la app.
 */
export function toCents(finalPrice: number): number {
  return Math.round(finalPrice * 100);
}
