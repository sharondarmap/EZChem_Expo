import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

/**
 * Buka PDF yang berasal dari require("...pdf") (asset bundler).
 * Akan membuka via share/open-with (PDF viewer).
 */
export async function openPdf(pdfAsset: number) {
  const asset = Asset.fromModule(pdfAsset);
  await asset.downloadAsync();

  if (!asset.localUri) throw new Error("PDF asset localUri tidak ditemukan");

  // Jika fitur share tersedia, ini cara paling gampang untuk "Open in..."
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(asset.localUri);
    return;
  }

  // Fallback: copy ke documentDirectory (minimal tidak crash)
  const filename = asset.name ? `${asset.name}.pdf` : "module.pdf";
  const dest = FileSystem.documentDirectory + filename;
  await FileSystem.copyAsync({ from: asset.localUri, to: dest });
}
