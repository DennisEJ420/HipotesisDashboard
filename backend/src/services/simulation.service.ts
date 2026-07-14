function randomVariation(base: number, variation: number): number {
  const random = Math.random() * variation * 2 - variation;

  return Math.round(base + random);
}


export function generateApiAResponse(): number {
  return randomVariation(200, 20);
}


export function generateApiBResponse(): number {
  return randomVariation(260, 25);
}