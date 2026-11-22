import { describe, expect, it } from 'vitest';
import { barPercent, displayCode, formatDuration, shortDate, splitDuration, weekdayOf } from './format';

const t = (key, v = {}) => `${key}:${JSON.stringify(v)}`;

describe('family format', () => {
  it('splits and formats durations in whole minutes', () => {
    expect(splitDuration(5 * 3600 + 25 * 60 + 59)).toEqual({ h: 5, m: 25 });
    expect(formatDuration(t, 3700)).toBe('duration.hm:{"h":1,"m":1}');
    expect(formatDuration(t, 600)).toBe('duration.m:{"m":10}');
    expect(formatDuration(t, 59)).toBe('duration.zero:{}');
    expect(formatDuration(t, null)).toBe('duration.zero:{}');
  });

  it('reads weekdays and short dates without a timezone shift', () => {
    expect(weekdayOf('2026-10-18')).toBe(0);
    expect(weekdayOf('2026-10-24')).toBe(6);
    expect(shortDate('2026-10-05')).toBe('5/10');
  });

  it('shows the link code in two groups and scales bars', () => {
    expect(displayCode('ABCD2345')).toBe('ABCD-2345');
    expect(barPercent(0, 100)).toBe(0);
    expect(barPercent(1, 1000)).toBe(2);
    expect(barPercent(50, 100)).toBe(50);
  });
});
