// This utility parses shortcodes from a string and replaces them with HTML.

/**
 * Parses [carousel src="url1,url2,..."] shortcode.
 * @param content The string content to parse.
 * @returns HTML string with shortcodes replaced.
 */
function parseCarouselShortcode(content: string): string {
    const carouselRegex = /\[carousel\s+src="([^"]+)"\]/g;
    
    return content.replace(carouselRegex, (match, srcAttribute) => {
        const imageUrls = srcAttribute.split(',').map((url: string) => url.trim());
        
        if (imageUrls.length === 0) {
            return '';
        }

        const imagesHtml = imageUrls.map(url => 
            `<img src="${url}" alt="Carousel image" loading="lazy">`
        ).join('');

        return `
            <div class="carousel-container">
                <div class="carousel-wrapper">
                    ${imagesHtml}
                </div>
            </div>
        `;
    });
}

/**
 * Main parser function. It runs all individual shortcode parsers.
 * @param content The raw string content from the editor.
 * @returns The processed HTML string.
 */
export function parseShortcodes(content: string): string {
    let processedContent = content;
    
    processedContent = parseCarouselShortcode(processedContent);
    // Future shortcodes can be added here, e.g.:
    // processedContent = parseButtonShortcode(processedContent);

    return processedContent;
}
