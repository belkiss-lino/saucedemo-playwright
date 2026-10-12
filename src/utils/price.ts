export function parsePrice(text: string): number {
  const match = text.match(/\$(\d+(?:\.\d+)?)/);
  if (!match) {
    throw new Error(`Não foi possível encontrar um preço em: "${text}"`);
  }
  return Number(match[1]);
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
