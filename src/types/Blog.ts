export interface Blog {
  id: string;
  favicon: string;
  title: string;
}

export function shortenBlogName(name: string): string {
  return name
    .replace(/\s*기술\s*블로그$/i, '')
    .replace(/\s*테크\s*블로그$/i, '')
    .replace(/\s*Tech\s*Blog$/i, '')
    .trim();
}
