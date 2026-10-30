/**
 * Bumped every time public/Mert_Ceren_CV.pdf and its .jpg previews are
 * replaced. It rides along as a query string on the CV links in the contact
 * modal, which is what actually gets a returning visitor the new file.
 *
 * Needed because Cloudflare rewrites Cache-Control on this host. The origin
 * sends `max-age=0, must-revalidate` — verified straight off
 * yeniportfo.vercel.app — and Cloudflare hands the browser `max-age=5356800`,
 * 62 days, regardless. Until that is changed in the Cloudflare dashboard,
 * anyone who opened the CV once would keep getting that copy. A different URL
 * sidesteps the browser cache whatever the header says.
 *
 * The PDF keeps a stable path and takes the version as `?v=`, so a link
 * someone saved still resolves. The preview image takes it in the filename
 * instead: next/image rejects a local src with a query string unless
 * `images.localPatterns` allowlists that exact search, and turning that
 * allowlist on would mean every other image on the site depends on a config
 * entry nobody will remember to keep. So rename the file to match whenever
 * this changes:
 *
 *   public/Mert_Ceren_CV-<cvVersion>-p1.jpg
 *   public/Mert_Ceren_CV-<cvVersion>-p2.jpg
 *
 * Nothing links to the preview from outside, so a changing name costs
 * nothing there.
 */
export const cvVersion = "2026-10-30";
