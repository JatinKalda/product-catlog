import { encodeCursor, decodeCursor, validateLimit, buildCursorWhereClause } from '../src/utils/cursor';

describe('encodeCursor / decodeCursor', () => {
  const payload = { updatedAt: '2024-05-01T12:00:00.000Z', id: 42 };

  it('round-trips correctly', () => {
    const cursor  = encodeCursor(payload);
    const decoded = decodeCursor(cursor);
    expect(decoded.id).toBe(42);
    expect(decoded.updatedAt).toBe(payload.updatedAt);
  });

  it('produces a string with no spaces or slashes', () => {
    const cursor = encodeCursor(payload);
    expect(cursor).toMatch(/^[A-Za-z0-9+/=]+$/);
  });

  it('throws on garbage input', () => {
    expect(() => decodeCursor('!!!not-base64!!!')).toThrow('Invalid cursor format');
  });

  it('throws on valid base64 but missing fields', () => {
    const bad = Buffer.from('{"foo":"bar"}').toString('base64');
    expect(() => decodeCursor(bad)).toThrow('Invalid cursor format');
  });
});

describe('validateLimit', () => {
  it('returns 20 by default', () => expect(validateLimit()).toBe(20));
  it('clamps to 100',        () => expect(validateLimit(9999)).toBe(100));
  it('clamps minimum to 1',  () => expect(validateLimit(0)).toBe(20));
  it('accepts valid value',  () => expect(validateLimit(50)).toBe(50));
  it('parses string input',  () => expect(validateLimit('30')).toBe(30));
  it('handles NaN safely',   () => expect(validateLimit('abc')).toBe(20));
});

describe('buildCursorWhereClause', () => {
  it('returns an OR clause with two branches', () => {
    const clause = buildCursorWhereClause({ updatedAt: '2024-05-01T00:00:00Z', id: 10 });
    expect(clause).toHaveProperty('OR');
    expect(clause.OR).toHaveLength(2);
  });

  it('first branch uses lt on updatedAt', () => {
    const clause = buildCursorWhereClause({ updatedAt: '2024-05-01T00:00:00Z', id: 10 });
    expect(clause.OR[0]).toEqual({ updatedAt: { lt: new Date('2024-05-01T00:00:00Z') } });
  });

  it('second branch ties on updatedAt and uses lt on id', () => {
    const clause = buildCursorWhereClause({ updatedAt: '2024-05-01T00:00:00Z', id: 10 });
    expect(clause.OR[1].AND).toBeDefined();
  });
});
