/**
 * Genera un número pseudoaleatorio siguiendo una Distribución Normal (Campana de Gauss)
 * utilizando la transformación matemática de Box-Muller.
 * 
 * @param mean Media aritmética (el centro de la campana)
 * @param stdDev Desviación estándar (qué tan dispersos están los datos)
 */
function randomNormal(mean: number, stdDev: number): number {
  let u = 0;
  let v = 0;
  
  // Evitamos el 0 exacto para que el cálculo del logaritmo natural no falle
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  
  // Transformación estándar de Box-Muller
  const z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  
  return Math.round(z0 * stdDev + mean);
}

/**
 * Genera latencias para la API A.
 * Rango aproximado: ~180ms a ~210ms
 * 
 * @param mean Por defecto 195 (Mantiene su centro original)
 * @param stdDev Subida a 5.0 para ensanchar la campana y facilitar el solape
 */
export function generateApiAResponse(mean: number = 195, stdDev: number = 5.0): number {
  return randomNormal(mean, stdDev);
}

/**
 * Genera latencias para la API B.
 * Rango aproximado: ~185ms a ~215ms
 * 
 * @param mean Bajada a 200 (A solo 5ms de diferencia de la API A)
 * @param stdDev Subida a 5.0 para que las dos distribuciones se mezclen por completo
 */
export function generateApiBResponse(mean: number = 200, stdDev: number = 5.0): number {
  return randomNormal(mean, stdDev);
}