import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "roi_calc_pdfs";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface PdfUploadResult {
  storagePath: string;
  signedUrl: string;
}

/**
 * Upload a PDF buffer to the private roi_calc_pdfs bucket under the
 * given key and return a 30-day signed URL pointing at it. Used to
 * embed a stable link in the Smartlead follow-up email without
 * publishing the bucket. Service-role only.
 */
export async function uploadPdfAndSign(
  key: string,
  pdf: Buffer
): Promise<PdfUploadResult> {
  const supabase = createAdminClient();
  const storagePath = `${key}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, pdf, {
      contentType: "application/pdf",
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`PDF upload failed: ${uploadError.message}`);
  }

  const { data, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (signError || !data?.signedUrl) {
    throw new Error(`Signed URL generation failed: ${signError?.message ?? "no url returned"}`);
  }

  return { storagePath, signedUrl: data.signedUrl };
}
