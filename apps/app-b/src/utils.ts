/**
 * Utility functions (UNTESTED file - to achieve 50% coverage)
 */

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

export function isEven(num: number): boolean {
  return num % 2 === 0;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}