import { describe, expect, it } from 'vitest';
import { detectarMarca } from '@/lib/tarjeta-store';

describe('detectarMarca', () => {
  it('detects visa by first digit 4', () => {
    expect(detectarMarca('4')).toBe('visa');
    expect(detectarMarca('4242 4242 4242 4242')).toBe('visa');
  });

  it('detects mastercard by first digit 5', () => {
    expect(detectarMarca('5')).toBe('mastercard');
    expect(detectarMarca('51')).toBe('mastercard');
  });

  it('detects mastercard by first digit 2', () => {
    expect(detectarMarca('2')).toBe('mastercard');
    expect(detectarMarca('2221')).toBe('mastercard');
  });

  it('detects amex by first digit 3', () => {
    expect(detectarMarca('3')).toBe('amex');
    expect(detectarMarca('34')).toBe('amex');
    expect(detectarMarca('37')).toBe('amex');
  });

  it('returns otro for unsupported prefixes', () => {
    expect(detectarMarca('6')).toBe('otro');
    expect(detectarMarca('7')).toBe('otro');
  });
});
