/**
 * Represents a news article.
 */
export interface NewsArticle {
  /**
   * The title of the news article.
   */
  title: string;
  /**
   * A brief summary or description of the news article.
   */
  summary: string;
  /**
   * The URL to the full news article.
   */
  url: string;
  /**
   * The source or publisher of the news article.
   */
  source: string;
  /**
   * The category of the news article (e.g., World, Business, Technology).
   * Note: This might not be directly available from the CSV.
   */
  category: string; // Keep for potential future use, but may be empty from CSV
  /**
   * URL to the article thumbnail image.
   */
  imageUrl: string;
  /**
   * The publication date of the article, if available.
   */
  date?: string;
}

// Function to parse simple CSV text
function parseCSV(csvText: string): string[][] {
  const lines = csvText.trim().split('\n');
  return lines.map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++; // Skip the second quote
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add the last value
    return values;
  });
}


/**
 * Asynchronously retrieves a list of news articles from a Google Sheet CSV.
 *
 * @param _category The category parameter is currently ignored as data comes from CSV without explicit categories.
 * @returns A promise that resolves to an array of NewsArticle objects.
 */
export async function getNews(_category?: string): Promise<NewsArticle[]> {
  // Google Sheet CSV export URL
  const csvUrl = 'https://docs.google.com/spreadsheets/d/1Zdv2-P8VGEdgS65mHksjFpPjxWMvqm0SK1E-ZK9xGW4/export?format=csv&gid=0';

  try {
    const response = await fetch(csvUrl, { cache: 'no-store' }); // Fetch fresh data
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const csvText = await response.text();
    const rows = parseCSV(csvText);

    // Assume the first row is headers, skip it
    const dataRows = rows.slice(1);

    const articles: NewsArticle[] = dataRows.reduce<NewsArticle[]>(
      (acc, row, index) => {
        // Check if essential fields have content
        if (row[0] && row[4]) {
          acc.push({
            title: row[0] || "No Title",
            date: row[1] || undefined, // Column B: Date
            imageUrl: row[2] || "", // Column C: Image URL
            summary: row[3] || "No Summary", // Column D: Article Summary/Content
            url: row[4] || "#", // Column E: Article URL
            source: row[5] || "Unknown Source", // Column F: Source
            category: "General", // Assign a default category
          });
        } else {
          console.warn(`Skipping row ${index + 2} due to missing title or URL.`);
        }
        return acc;
      },
      []
    );

    return articles;

  } catch (error) {
    console.error("Error fetching or parsing news data:", error);
    return []; // Return an empty array in case of error
  }
}
