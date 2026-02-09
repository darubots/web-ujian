// Export utilities for CSV/Excel

/**
 * Convert array of objects to CSV string
 */
export function toCSV<T extends Record<string, unknown>>(data: T[], headers?: string[]): string {
    if (data.length === 0) return '';

    const keys = headers || Object.keys(data[0]);
    const headerRow = keys.join(',');

    const rows = data.map(item =>
        keys.map(key => {
            const rawValue = item[key];
            if (rawValue === null || rawValue === undefined) return '';

            let strValue = String(rawValue);
            if (typeof rawValue === 'string') {
                // Escape quotes and wrap in quotes if contains comma
                strValue = rawValue.replace(/"/g, '""');
                if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
                    strValue = `"${strValue}"`;
                }
            }
            return strValue;
        }).join(',')
    );

    return [headerRow, ...rows].join('\n');
}

/**
 * Download a string as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export data as CSV file
 */
export function exportToCSV<T extends Record<string, unknown>>(
    data: T[],
    filename: string,
    headers?: string[]
) {
    const csv = toCSV(data, headers);
    downloadFile(csv, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

/**
 * Parse CSV string to array of objects
 */
export function parseCSV(csv: string): Record<string, string>[] {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    const result: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || '';
        });
        result.push(row);
    }

    return result;
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}
