import { get, set, keys, del } from "idb-keyval";
import { auth } from "../lib/firebase";

export interface PDFDocument {
  id: string;
  name: string;
  text: string;
  uploadedAt: number;
}

const getPrefix = () => `pdf_${auth.currentUser?.uid || "guest"}_`;

export const dbService = {
  async savePDF(doc: PDFDocument) {
    await set(`${getPrefix()}${doc.id}`, doc);
  },
  async getAllPDFs(): Promise<PDFDocument[]> {
    const allKeys = await keys();
    const pdfKeys = allKeys.filter(
      (k) => typeof k === "string" && k.startsWith(getPrefix()),
    );
    const pdfs: PDFDocument[] = [];
    for (const key of pdfKeys) {
      const doc = await get<PDFDocument>(key as string);
      if (doc) pdfs.push(doc);
    }
    return pdfs.sort((a, b) => b.uploadedAt - a.uploadedAt);
  },
  async deletePDF(id: string) {
    await del(`${getPrefix()}${id}`);
  },
  async getCombinedPDFText(): Promise<string> {
    const pdfs = await this.getAllPDFs();
    return pdfs
      .map((p) => `--- Material: ${p.name} ---\n${p.text}`)
      .join("\n\n");
  },
};
