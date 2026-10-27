// Helpers for the resized camera-trap image endpoint
// (app/api/cameratrap/image/[mediaID]/route.js).
//
// Originals on S3 are ~3.5 MB 16 MP JPEGs. The identify page renders them in a
// box that is at most ~1200 CSS px wide, so we serve a server-resized copy and
// let the browser pick a candidate from `srcSet` based on its own DPR/layout.
// Keep the candidate list short: every distinct (mediaID, w) pair is a separate
// CDN cache entry and a separate first-hit resize.

export const IMAGE_WIDTHS = [1200, 2000];
export const DEFAULT_IMAGE_WIDTH = 2000;

// Mantine's `md` breakpoint is 62em; below it the image column spans the full
// viewport, above it the image column is 8/12 of the grid.
export const IMAGE_SIZES = "(max-width: 62em) 100vw, 66vw";

export function resizedImageUrl(mediaID, width = DEFAULT_IMAGE_WIDTH) {
  return `/api/cameratrap/image/${encodeURIComponent(mediaID)}?w=${width}`;
}

export function resizedImageSrcSet(mediaID) {
  return IMAGE_WIDTHS.map((w) => `${resizedImageUrl(mediaID, w)} ${w}w`).join(
    ", ",
  );
}

/**
 * Warm the browser cache for an image the user is likely to see next. Uses an
 * off-DOM <img> with the same srcSet/sizes as the real one, so the browser's
 * candidate selection (and therefore the cache key) matches exactly.
 * Falls back to the original URL if the resized endpoint fails.
 */
export function warmImageCache(image) {
  if (typeof window === "undefined" || !image) return;
  const img = new window.Image();
  if (image.mediaID) {
    img.onerror = () => {
      if (image.publicURL) {
        const fallback = new window.Image();
        fallback.src = image.publicURL;
      }
    };
    img.sizes = IMAGE_SIZES;
    img.srcset = resizedImageSrcSet(image.mediaID);
    img.src = resizedImageUrl(image.mediaID);
  } else if (image.publicURL) {
    img.src = image.publicURL;
  }
  // decode() kicks off decoding so the swap is paint-ready; ignore failures.
  if (typeof img.decode === "function") img.decode().catch(() => {});
}
