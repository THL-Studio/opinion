
import { getNews, type NewsArticle } from '@/services/news';
import { NewsArticleCard } from '@/components/news-article-card';
import { parse, compareDesc } from 'date-fns';
import { Separator } from '@/components/ui/separator'; // Import Separator

// Helper function to parse date strings robustly
const parseDateString = (dateString: string | undefined): Date | null => {
  if (!dateString) return null;
  try {
    // Try M/d/yyyy format first
    let parsed = parse(dateString, 'M/d/yyyy', new Date());
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    // Try yyyy-MM-dd format next
    parsed = parse(dateString, 'yyyy-MM-dd', new Date());
     if (!isNaN(parsed.getTime())) {
      return parsed;
    }
     // Try ISO format (e.g., 2025-05-04 20:50:13) - common in feeds
    parsed = new Date(dateString);
     if (!isNaN(parsed.getTime())) {
       return parsed;
     }

    console.warn(`Could not parse date for sorting: ${dateString}`);
    return null; // Return null if parsing fails for all formats
  } catch (e) {
    console.error(`Error parsing date: ${dateString}`, e);
    return null;
  }
};


export default async function Home() {
  // Fetch all news articles
  const allArticles = await getNews();

  // Add parsedDate and sort articles by date, newest first
  const sortedArticles = allArticles
    .map(article => ({
      ...article,
      parsedDate: parseDateString(article.date)
    }))
    .filter(article => article.parsedDate !== null) // Ensure we only sort valid dates
    .sort((a, b) => compareDesc(a.parsedDate!, b.parsedDate!)); // Use compareDesc from date-fns

  // Get the 4 newest articles for the top section
  const newestArticles = sortedArticles.slice(0, 4);
  const mainArticle = newestArticles.length > 0 ? newestArticles[0] : null;
  const sideArticles = newestArticles.length > 1 ? newestArticles.slice(1) : [];

  // Get the remaining articles for the grid section
  const remainingArticles = sortedArticles.slice(4);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <header className="mb-8 text-center">
        {/* Opinion Text removed */}
        {/* Source and Time moved */}
      </header>

      {/* Wrap sections to potentially apply container-level scroll effects if needed */}
      <div className="space-y-12"> {/* Added a container div */}
        {/* Top Section: 1 large, 3 small */}
        {newestArticles.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> {/* Main 2-column grid */}
            {/* Left Column (Large Article) */}
            <div className="lg:col-span-1">
              {mainArticle && <NewsArticleCard article={mainArticle} size="large" />}
            </div>

            {/* Right Column (Smaller Articles) */}
            <div className="lg:col-span-1 flex flex-col gap-6"> {/* Use flex-col and gap */}
              {sideArticles.map((article, index) => (
                <NewsArticleCard key={article.url || `side-${index}`} article={article} size="small" />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-muted-foreground">No news articles found or failed to load news.</p>
          </div>
        )}

        {/* Separator before the remaining articles grid */}
        {remainingArticles.length > 0 && <Separator className="my-12" />}

        {/* Bottom Section: Remaining articles in columns */}
        {remainingArticles.length > 0 && (
           // Changed md:grid-cols-2 to sm:grid-cols-2
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 relative">
              {/* Vertical Separators - visible on large screens */}
              <div className="absolute top-0 bottom-0 left-1/3 -translate-x-1/2 w-px bg-border hidden lg:block" aria-hidden="true"></div>
              <div className="absolute top-0 bottom-0 left-2/3 -translate-x-1/2 w-px bg-border hidden lg:block" aria-hidden="true"></div>

              {/* Render remaining articles */}
              {remainingArticles.map((article, index) => (
              <NewsArticleCard key={article.url || `rem-${index}`} article={article} size="default" />
              ))}
          </div>
        )}
      </div> {/* End of container div */}
    </div>
  );
}
