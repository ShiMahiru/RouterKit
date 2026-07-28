

export function markdownToPlainText(value: string): string {
	return value
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/<[^>]+>/g, ' ')
		.replace(/[-#>*_~|[\]()]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function countWordsFromText(text: string): number {
	const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
	const englishWords = text.match(/[a-zA-Z]+/g) || [];
	return chineseChars.length + englishWords.length;
}

export function countPostWords(title: string, description: string, rawContent: string): number {
	const text = `${title} ${description} ${rawContent}`;
	return countWordsFromText(markdownToPlainText(text));
}
