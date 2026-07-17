function randomVariation(base: number, variation: number): number {
  const random = Math.random() * variation * 2 - variation;
  return Math.round(base + random);
}

// Generadores que aceptan parámetros dinámicos con valores por defecto
export function generateApiAResponse(mean: number = 200, variation: number = 15): number {
  return randomVariation(mean, variation);
}

export function generateApiBResponse(mean: number = 225, variation: number = 15): number {
  return randomVariation(mean, variation);
}