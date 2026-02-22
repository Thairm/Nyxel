// Backblaze B2 upload helper using S3-compatible API
// Uses aws4fetch for request signing in Cloudflare Workers (no Node.js SDK needed)
import { AwsClient } from 'aws4fetch';

let s3Client: AwsClient | null = null;

function getS3Client(keyId: string, appKey: string): AwsClient {
    if (!s3Client) {
        s3Client = new AwsClient({
            accessKeyId: keyId,
            secretAccessKey: appKey,
        });
    }
    return s3Client;
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
    const client = getS3Client(env.B2_KEY_ID, env.B2_APP_KEY);
    const bucketName = env.B2_BUCKET_NAME;
    const endpoint = env.B2_ENDPOINT;

    // S3-compatible PUT URL: https://{bucket}.{endpoint}/{key}
    const url = `https://${bucketName}.${endpoint}/${fileName}`;

    const response = await client.fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': contentType,
            'Content-Length': String(fileBuffer.byteLength),
        },
        body: fileBuffer,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`B2 upload failed (${response.status}): ${errorText}`);
    }

    // Public URL format for B2 public buckets
    // https://f{cluster}.backblazeb2.com/file/{bucket}/{key}
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
    // Download from source (e.g., Atlas Cloud temp URL)
    const downloadResponse = await fetch(sourceUrl);
    if (!downloadResponse.ok) {
        throw new Error(`Failed to download from source: ${downloadResponse.status}`);
    }

    const buffer = await downloadResponse.arrayBuffer();
    const resolvedContentType = contentType || downloadResponse.headers.get('content-type') || 'image/png';

    return uploadToB2(env, buffer, fileName, resolvedContentType);
}
