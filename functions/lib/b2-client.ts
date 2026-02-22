// Backblaze B2 upload helper using S3-compatible API
// Uses aws4fetch for request signing in Cloudflare Workers (no Node.js SDK needed)
import { AwsClient } from 'aws4fetch';

/**
 * Create an S3 client for B2. We DON'T cache it because Cloudflare Workers
 * may reuse the global between requests with different env values.
 */
function getS3Client(keyId: string, appKey: string, endpoint: string): AwsClient {
    // Extract region from endpoint (e.g., "s3.us-east-005.backblazeb2.com" → "us-east-005")
    const regionMatch = endpoint.match(/s3\.([^.]+)\.backblazeb2\.com/);
    const region = regionMatch ? regionMatch[1] : 'us-east-005';

    return new AwsClient({
        accessKeyId: keyId,
        secretAccessKey: appKey,
        region: region,
        service: 's3',
    });
}

/**
 * Upload a file buffer to Backblaze B2 via S3-compatible API.
 * Returns the permanent public URL for the uploaded file.
 */
export async function uploadToB2(
    env: {
        B2_KEY_ID: string;
        B2_APP_KEY: string;
        B2_BUCKET_NAME: string;
        B2_ENDPOINT: string;
    },
    fileBuffer: ArrayBuffer,
    fileName: string,
    contentType: string
): Promise<string> {
    const client = getS3Client(env.B2_KEY_ID, env.B2_APP_KEY, env.B2_ENDPOINT);
    const bucketName = env.B2_BUCKET_NAME;
    const endpoint = env.B2_ENDPOINT;

    // S3-compatible PUT URL: https://{bucket}.{endpoint}/{key}
    const url = `https://${bucketName}.${endpoint}/${fileName}`;

    console.log('[B2] Uploading to:', url, 'size:', fileBuffer.byteLength, 'type:', contentType);

    const response = await client.fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': contentType,
        },
        body: fileBuffer,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[B2] Upload failed:', response.status, errorText);
        throw new Error(`B2 upload failed (${response.status}): ${errorText}`);
    }

    console.log('[B2] Upload success!');

    // Public URL for B2 public buckets uses the "friendly" format:
    // https://f{cluster}.backblazeb2.com/file/{bucket}/{key}
    // But the S3-compatible URL also works for public buckets:
    const publicUrl = `https://${bucketName}.${endpoint}/${fileName}`;

    return publicUrl;
}

/**
 * Download a file from a URL and upload it to B2.
 * Returns the permanent B2 public URL.
 */
export async function downloadAndUploadToB2(
    env: {
        B2_KEY_ID: string;
        B2_APP_KEY: string;
        B2_BUCKET_NAME: string;
        B2_ENDPOINT: string;
    },
    sourceUrl: string,
    fileName: string,
    contentType?: string
): Promise<string> {
    console.log('[B2] Downloading from source:', sourceUrl);

    // Download from source (e.g., CivitAI blobUrl or Atlas Cloud temp URL)
    const downloadResponse = await fetch(sourceUrl);
    if (!downloadResponse.ok) {
        console.error('[B2] Download failed:', downloadResponse.status);
        throw new Error(`Failed to download from source: ${downloadResponse.status}`);
    }

    const buffer = await downloadResponse.arrayBuffer();
    console.log('[B2] Downloaded', buffer.byteLength, 'bytes');

    const resolvedContentType = contentType || downloadResponse.headers.get('content-type') || 'image/png';

    return uploadToB2(env, buffer, fileName, resolvedContentType);
}
