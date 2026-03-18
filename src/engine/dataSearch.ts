import type { DataSourceRow, DataSourceSuggestion } from '../types/requirement';

export function searchDataSources(
  dataSources: DataSourceRow[],
  keywords: string[]
): DataSourceSuggestion[] {
  if (dataSources.length === 0 || keywords.length === 0) return [];

  const suggestions: DataSourceSuggestion[] = [];
  const seen = new Set<string>();

  for (const row of dataSources) {
    const rowText = Object.values(row).join(' ').toLowerCase();

    for (const keyword of keywords) {
      const kw = keyword.toLowerCase();
      if (rowText.includes(kw)) {
        // Try to identify table name and column name from the row
        const tableName = row['テーブル名'] || row['table_name'] || row['table'] || Object.values(row)[0] || '';
        const columnName = row['カラム名'] || row['column_name'] || row['column'] || Object.values(row)[1] || '';
        const description = row['説明'] || row['description'] || row['備考'] || Object.values(row)[2] || '';

        const key = `${tableName}.${columnName}`;
        if (seen.has(key)) continue;
        seen.add(key);

        suggestions.push({
          tableName,
          columnName,
          description,
          matchReason: `「${keyword}」に関連するデータ`,
        });
      }
    }
  }

  return suggestions.slice(0, 10);
}
