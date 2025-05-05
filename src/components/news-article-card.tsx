
'use client';

import type { NewsArticle } from '@/services/news';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react'; // Import useRef
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';

interface NewsArticleCardProps {
  article: NewsArticle;
  size?: 'large' | 'small' | 'default'; // Add 'default' size
}

// Helper function to format date if available
const formatDate = (dateString: string | undefined): string | null => {
  if (!dateString) return null;
  try {
    // Attempt to parse the date string robustly
     let parsedDate: Date | null = null;

     // Try M/d/yyyy format first
     const parsedMdy = parse(dateString, 'M/d/yyyy', new Date());
     if (!isNaN(parsedMdy.getTime())) {
       parsedDate = parsedMdy;
     } else {
       // Try yyyy-MM-dd format next
       const parsedYmd = parse(dateString, 'yyyy-MM-dd', new Date());
       if (!isNaN(parsedYmd.getTime())) {
         parsedDate = parsedYmd;
       } else {
          // Try ISO format (e.g., 2025-05-04 20:50:13) - common in feeds
         const parsedIso = new Date(dateString);
         if (!isNaN(parsedIso.getTime())) {
            parsedDate = parsedIso;
         }
       }
     }

    if (parsedDate) {
        return format(parsedDate, 'd MMM yyyy'); // Format as '4 May 2025'
    }

    console.warn(`Could not format date: ${dateString}`);
    return dateString; // Return original string if parsing fails

  } catch (e) {
    console.error(`Error formatting date: ${dateString}`, e);
    return dateString; // Return original string in case of error
  }
};

// Get image dimensions based on size
const getImageDimensions = (size: 'large' | 'small' | 'default') => {
  switch (size) {
    case 'large': return { width: 800, height: 500 };
    case 'small': return { width: 400, height: 250 };
    case 'default':
    default: return { width: 600, height: 400 }; // Default for the grid
  }
};

// Helper function to get favicon URL
const getFaviconUrl = (url: string): string | null => {
    if (!url) return null;
    try {
        const hostname = new URL(url).hostname;
        // Use Google's favicon service for better reliability
        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    } catch (e) {
        console.error('Error parsing URL for favicon:', url, e);
        return null;
    }
}

export function NewsArticleCard({ article, size = 'default' }: NewsArticleCardProps) {
  const { width: imgWidth, height: imgHeight } = getImageDimensions(size);
  const [imageUrl, setImageUrl] = useState(article.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(article.title)}/${imgWidth}/${imgHeight}`);
  const [imageError, setImageError] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [faviconError, setFaviconError] = useState(false);
  const formattedDate = formatDate(article.date);

  // State and Ref for scroll animation
  const cardRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Intersection Observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update state when element comes into view
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target); // Stop observing once in view
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    // Cleanup observer on component unmount
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount


  // Update image URL and favicon URL if article changes
  useEffect(() => {
    const { width, height } = getImageDimensions(size);
    setImageUrl(article.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(article.title)}/${width}/${height}`);
    setImageError(false); // Reset error state on article change

    const newFaviconUrl = getFaviconUrl(article.url);
    setFaviconUrl(newFaviconUrl);
    setFaviconError(false); // Reset favicon error state

  }, [article.imageUrl, article.title, article.url, size]);

  const handleImageError = () => {
    if (!imageError) {
       const { width, height } = getImageDimensions(size);
       setImageUrl(`https://picsum.photos/seed/${encodeURIComponent(article.title)}/${width}/${height}`);
       setImageError(true);
    }
  };

  const handleFaviconError = () => {
    setFaviconError(true);
  }

  const isLarge = size === 'large';
  const isSmall = size === 'small';
  const isDefault = size === 'default'; // For grid

  // Determine sizes prop for Next Image based on component size prop
  let sizes: string;
  if (size === "large") {
    // Large image: full width below 1024px, 800px above
    sizes = "(max-width: 1024px) 100vw, 800px";
  }
  else if (size === "small") {
    // Small image: full width below 1024px, ~1/3 width above
     sizes = "(max-width: 1024px) 100vw, calc(33.33vw - 2rem)"; // Adjust calc based on grid gap
  }
  else { // default size
    // Default image: full width below 640px (sm), half width up to 1024px (lg), third width above
     sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, calc(33.33vw - 2rem)"; // Adjust calc based on grid gap
  }


  // Conditional classes for layout and text size
  const cardClasses = cn(
    'flex overflow-hidden transition-shadow duration-300 ease-in-out shadow-none border-none rounded-none bg-transparent',
    // Scroll animation classes
    'opacity-0 translate-y-4 transition-all duration-700 ease-out', // Initial state
    isInView && 'opacity-100 translate-y-0', // Visible state
    isLarge ? 'flex-col h-full' :
    isSmall ? 'flex-row h-full' :
    'flex-col h-full' // Default layout for grid
  );

  const imageContainerClasses = cn(
    'relative flex-shrink-0 overflow-hidden rounded-md group', // Added overflow-hidden and group
    isLarge ? 'h-80 w-full' : // Larger height for large card
    isSmall ? 'h-32 w-1/3' : // Adjust ratio for small card if needed
    'h-48 w-full' // Default image size for grid
  );

  const contentContainerClasses = cn(
    'flex flex-col flex-grow justify-between',
     isLarge ? 'pt-4' : // Padding for large card content
     isSmall ? 'pl-4' : // Only left padding for small card
     'pt-4' // Default content padding for grid
  );

   const titleClasses = cn(
     'font-semibold leading-tight mb-2',
     isLarge ? 'text-2xl line-clamp-2' : // 2 lines for large
     isSmall ? 'text-lg line-clamp-2' : // 2 lines for small
     'text-xl line-clamp-3' // Default title size for grid (3 lines)
   );

   const descriptionClasses = cn(
     'text-sm text-muted-foreground',
     isLarge ? 'line-clamp-2' : // 2 lines for large
     isSmall ? 'line-clamp-2' : // 2 lines for small
     'line-clamp-4' // Default description lines for grid (4 lines)
   );


  return (
    <Card ref={cardRef} className={cardClasses}> {/* Add ref here */}
       {/* Image container */}
      <div className={imageContainerClasses}>
         {/* Ensure parent is relative for absolute positioning */}
        <Image
          src={imageUrl}
          alt={article.title}
          fill
          style={{ objectFit: 'cover' }}
          className="transition-transform duration-300 ease-in-out group-hover:scale-105" // Added hover effect classes
          data-ai-hint="news article opinion piece"
          onError={handleImageError}
          sizes={sizes} // Use calculated sizes
          unoptimized={imageError} // Avoid optimizing fallback images
          priority={isLarge} // Prioritize loading the large image
        />
         {/* Favicon Overlay */}
         {faviconUrl && !faviconError && (
             <div className="absolute bottom-2 left-2 bg-white rounded-full p-1 shadow transition-opacity duration-300 group-hover:opacity-80">
                 <Image
                     src={faviconUrl}
                     alt={`${article.source || 'Source'} favicon`}
                     width={16} // Adjust size as needed (e.g., 16x16 or 20x20)
                     height={16}
                     onError={handleFaviconError}
                     unoptimized // Favicons might not need optimization
                 />
             </div>
         )}
      </div>

      {/* Content container */}
      <div className={contentContainerClasses}>
        <div> {/* Top part of content: Meta (Date, Source), Title, Summary */}
            {/* Meta information row */}
            <div className="flex justify-start items-center mb-1"> {/* Changed justify-end to justify-start */}
              <div className="text-xs text-muted-foreground">
                {formattedDate && <span>{formattedDate}</span>}
                {formattedDate && article.source && <span className="mx-1">|</span>}
                {article.source && <span>{article.source}</span>}
              </div>
            </div>

            <CardTitle className={titleClasses}>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                {article.title}
                </a>
            </CardTitle>
            <CardDescription className={descriptionClasses}>
                {article.summary}
            </CardDescription>
        </div>
      </div>
    </Card>
  );
}
