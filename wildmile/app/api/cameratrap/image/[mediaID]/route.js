import sharp from "sharp";
import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";

// Serves a resized JPEG for a camera-trap image.
//
// Why: originals are ~3.5 MB 16 MP JPEGs served straight from S3 with no
// Cache-Control header. The identify page shows them in a ~1200 px box, so
// 85-95% of those bytes are wasted on every image a volunteer looks at.
//
// Cacheability: `mediaID` is the MD5 of the original file, so (mediaID, w)
// fully determines the output and the response can be cached forever by the
// browser and by Vercel's CDN (`s-maxage`). The first request for a given
// (mediaID, w) pays one S3 fetch + one resize (~0.3-0.6 s); every request after
// that is served from cache. To keep that cache effective the URL is strictly
// canonical: `w` is required and must be one of ALLOWED_WIDTHS, and no other
// query parameters are accepted (the CDN keys on the full URL).

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ALLOWED_WIDTHS = new Set([800, 1200, 2000]);
const JPEG_QUALITY = 80;
// mediaID is an MD5 hex string today; allow a little slack for other hashes.
const MEDIA_ID_RE = /^[A-Za-z0-9_-]{8,128}$/;
const CACHE_CONTROL = "public, max-age=31536000, s-maxage=31536000, immutable";
// Originals are ~3.5 MB / 16 MP; anything far beyond that is not a trap photo.
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const MAX_SOURCE_PIXELS = 60_000_000;

/**
 * Only proxy images that live in our own S3 bucket. `publicURL` comes from the
 * database (written by the ingest job), but a stored URL pointing anywhere else
 * would turn this route into an open fetch proxy, so check it anyway.
 */
function isAllowedSource(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (url.username || url.password) return false;

  const host = url.hostname.toLowerCase();
  if (!host.endsWith(".amazonaws.com")) return false;

  const bucket = process.env.AWS_BUCKET_NAME;
  if (!bucket) {
    // No bucket configured: accept any S3 host (still restricted to S3).
    return host === "s3.amazonaws.com" || host.includes(".s3.") || host.startsWith("s3.");
  }

  // Virtual-hosted style: <bucket>.s3.amazonaws.com or <bucket>.s3.<region>.amazonaws.com
  if (host === `${bucket}.s3.amazonaws.com`) return true;
  if (host.startsWith(`${bucket}.s3.`)) return true;
  // Path style: s3.amazonaws.com/<bucket>/… or s3.<region>.amazonaws.com/<bucket>/…
  if (
    (host === "s3.amazonaws.com" || host.startsWith("s3.")) &&
    url.pathname.startsWith(`/${bucket}/`)
  ) {
    return true;
  }
  return false;
}

/**
 * Returns the requested width, or null if the query string is not canonical
 * (missing/invalid `w`, or any other parameter present).
 */
function parseCanonicalWidth(searchParams) {
  const keys = [...searchParams.keys()];
  if (keys.length !== 1 || keys[0] !== "w") return null;
  const raw = searchParams.get("w");
  if (!/^\d{3,4}$/.test(raw || "")) return null;
  const w = Number.parseInt(raw, 10);
  return ALLOWED_WIDTHS.has(w) ? w : null;
}

export async function GET(request, context) {
  const { mediaID } = await context.params;
  if (!MEDIA_ID_RE.test(mediaID || "")) {
    return NextResponse.json({ message: "Invalid media id" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const width = parseCanonicalWidth(searchParams);
  if (width === null) {
    return NextResponse.json(
      {
        message: `Query must be exactly ?w=<width> with width in ${[...ALLOWED_WIDTHS].join(", ")}`,
      },
      { status: 400 },
    );
  }

  // Output is fully determined by (mediaID, width, quality); the ETag can be
  // computed without touching S3, so conditional requests are nearly free.
  const etag = `"${mediaID}-w${width}-q${JPEG_QUALITY}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, {
      status: 304,
      headers: { ETag: etag, "Cache-Control": CACHE_CONTROL },
    });
  }

  try {
    await dbConnect();
    const media = await CameratrapMedia.findOne(
      { mediaID },
      { publicURL: 1 },
    ).lean();

    if (!media?.publicURL) {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }
    if (!isAllowedSource(media.publicURL)) {
      return NextResponse.json(
        { message: "Image source not supported" },
        { status: 422 },
      );
    }

    const upstream = await fetch(media.publicURL, { cache: "no-store" });
    if (!upstream.ok) {
      return NextResponse.json(
        { message: "Failed to fetch original image" },
        { status: 502 },
      );
    }
    const declaredLength = Number.parseInt(
      upstream.headers.get("content-length") || "0",
      10,
    );
    if (declaredLength > MAX_SOURCE_BYTES) {
      return NextResponse.json(
        { message: "Original image too large to resize" },
        { status: 413 },
      );
    }
    const input = Buffer.from(await upstream.arrayBuffer());
    if (input.length > MAX_SOURCE_BYTES) {
      return NextResponse.json(
        { message: "Original image too large to resize" },
        { status: 413 },
      );
    }

    const output = await sharp(input, {
      failOn: "none",
      limitInputPixels: MAX_SOURCE_PIXELS,
    })
      .rotate() // honour EXIF orientation, matching how browsers display the original
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();

    return new Response(output, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(output.length),
        "Cache-Control": CACHE_CONTROL,
        ETag: etag,
      },
    });
  } catch (error) {
    console.error("Error resizing camera trap image:", error);
    return NextResponse.json(
      { message: "Error resizing image" },
      { status: 500 },
    );
  }
}
