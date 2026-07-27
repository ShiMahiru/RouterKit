/**
 * Format a date string as YYYY-MM-DD.
 * Returns the original string if parsing fails.
 */
export function formatDate(dateString: string): string {
	const d = new Date(dateString);
	if (isNaN(d.getTime())) return dateString;
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}
