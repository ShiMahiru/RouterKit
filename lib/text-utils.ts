/**
 * 纯文本处理工具函数。
 * 无 Node.js 依赖，可被客户端代码和构建脚本同时导入。
 */

/** 将 markdown 文本转为纯文本（去除代码块、图片、链接、HTML 标签等标记语法） */
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

/** 从纯文本中统计字数（中文按字符计，英文按单词计） */
function countWordsFromText(text: string): number {
	const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
	const englishWords = text.match(/[a-zA-Z]+/g) || [];
	return chineseChars.length + englishWords.length;
}

/** 统计文章字数：组合标题、描述、正文后转为纯文本再计数 */
export function countPostWords(title: string, description: string, rawContent: string): number {
	const text = `${title} ${description} ${rawContent}`;
	return countWordsFromText(markdownToPlainText(text));
}