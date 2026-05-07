/**
 * Pricing Engine — ÚNICA fuente de verdad para el precio de huacales.
 *
 * REGLAS CRÍTICAS:
 *  - Este es el ÚNICO lugar donde se calcula el precio de un huacal.
 *  - El resultado (`finalPrice`) es INMUTABLE una vez agregado al carrito.
 *  - Prohibido recalcular en carrito, checkout o cualquier método de pago.
 *  - Prohibidas conversiones de moneda, exchange rates o multiplicadores
 *    globales fuera de este archivo.
 *  - Stripe / PayPal / Venmo / Zelle reciben EXACTAMENTE `finalPrice` en USD.
 *    Para cents: `Math.round(finalPrice * 100)`.
 */

// Costos fijos (USD)
export const PLYWOOD_SHEET_AREA_IN2 = 48 * 96; // 4608 in² por plancha 48×96
export const PLYWOOD_SHEET_COST = 40;          // $40 por plancha
export const LABOR_COST = 25;                  // mano de obra
export const STAPLES_COST = 10;                // presillas
export const GLUE_COST = 10;                   // cola
export const FOAM_PIECE_COST = 17;              // costo por pieza de foam
export const FOAM_COVERAGE_PER_PIECE = 1000;    // in³ cubiertos por pieza
export const MARKUP = 3;                       // multiplicador final ×3

export interface CrateDimensions {
  length: number; // in
  width: number;  // in
  height: number; // in
}

export interface CratePriceBreakdown {
  surfaceIn2: number;
  plywoodCost: number;
  laborCost: number;
  staplesCost: number;
  glueCost: number;
  foamCost: number;
  subtotal: number;
  finalPrice: number; // INMUTABLE — usar tal cual
}

/**
 * Calcula el precio de UN huacal. Ejecutar UNA sola vez (al agregar al
 * carrito). El `finalPrice` resultante NO debe recalcularse jamás.
 */
export function computeCratePrice(dims: CrateDimensions): CratePriceBreakdown {
  const { length: L, width: W, height: H } = dims;

  if (L <= 0 || W <= 0 || H <= 0) {
    return {
      surfaceIn2: 0,
      plywoodCost: 0,
      laborCost: 0,
      staplesCost: 0,
      glueCost: 0,
      foamCost: 0,
      subtotal: 0,
      finalPrice: 0,
    };
  }

  // Área total (6 caras)
  const surfaceIn2 = 2 * (L * W + L * H + W * H);
  // Costo proporcional de madera según área usada de la plancha
  const plywoodCost = (surfaceIn2 / PLYWOOD_SHEET_AREA_IN2) * PLYWOOD_SHEET_COST;
  const volume = L * W * H;
  const foamPieces = Math.ceil(volume / FOAM_COVERAGE_PER_PIECE);
  const foamCost = foamPieces * FOAM_PIECE_COST;
  const subtotal = plywoodCost + LABOR_COST + STAPLES_COST + GLUE_COST + foamCost;
  const finalPrice = subtotal * MARKUP;

  return {
    surfaceIn2,
    plywoodCost,
    laborCost: LABOR_COST,
    staplesCost: STAPLES_COST,
    glueCost: GLUE_COST,
    foamCost,
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
