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
export const WOOD_WASTE_FACTOR = 1.15;          // 15% desperdicio
export const LABOR_COST = 25;                   // mano de obra
export const CLAMPS_COST = 10;                  // presillas
export const GLUE_COST = 10;                    // cola
export const FOAM_PIECE_COST = 17;              // costo por pieza de foam
export const FOAM_COVERAGE_PER_PIECE = 1000;    // in³ cubiertos por pieza
// 🚚 DELIVERY DINÁMICO: (ancho × largo × 0.13) + (alto × 13.75)
export const DELIVERY_AREA_RATE = 0.13;         // $/in² (ancho × largo)
export const DELIVERY_HEIGHT_RATE = 13.75;      // $/in (alto)
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

  // 🪵 MADERA — área usada proporcional a una plancha 48x96
  const usedArea = length * width;
  const woodCost =
    ((usedArea / PLYWOOD_SHEET_AREA_IN2) * PLYWOOD_SHEET_COST) * WOOD_WASTE_FACTOR;

  // 🧽 FOAM AUTOMÁTICO — por dimensiones máximas
  let foamPieces = 1;
  if (length > 30 || width > 30) foamPieces = 2;
  if (length > 60 || width > 60) foamPieces = 3;
  const foam = foamPieces * FOAM_PIECE_COST;

  // 👷 LABOR AUTOMÁTICO — por dimensiones
  let laborHours = 1;
  if (length > 48 || width > 50 || height > 12) laborHours = 2;
  if (length > 70 || width > 70) laborHours = 3;
  const labor = laborHours * LABOR_COST;

  // ➕ SUBTOTAL
  const subtotal =
    labor + CLAMPS_COST + GLUE_COST + foam + woodCost + DELIVERY_COST;

  // 📦 MARGEN ×3
  const finalPrice = Math.round(subtotal * MARKUP);

  return {
    usedAreaIn2: usedArea,
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
