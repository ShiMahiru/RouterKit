import { describe, it, expect } from 'vitest';
import { formatDate } from './date';

describe('formatDate', () => {
	it('formats ISO date string to YYYY-MM-DD', () => {
		expect(formatDate('2026-05-06')).toBe('2026-05-06');
	});

	it('formats full ISO datetime string', () => {
		expect(formatDate('2026-01-15T10:30:00Z')).toBe('2026-01-15');
	});

	it('pads single-digit month and day', () => {
		expect(formatDate('2026-03-05')).toBe('2026-03-05');
	});

	it('returns original string for invalid date', () => {
		expect(formatDate('not-a-date')).toBe('not-a-date');
	});

	it('returns original string for empty string', () => {
		expect(formatDate('')).toBe('');
	});
});