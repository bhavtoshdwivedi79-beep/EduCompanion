import { PDFParse } from "pdf-parse";

/**
 * Extract readable text from a PDF buffer
 *
 * @param {Buffer} buffer
 * @returns {Promise<{pdfText: string, pages: number}>}
 */
export const extractPDFText = async (buffer) => {

    if (!buffer || !Buffer.isBuffer(buffer)) {
        throw new Error("Invalid PDF buffer");
    }

    if (buffer.length === 0) {
        throw new Error("PDF file is empty");
    }

    let parser;

    try {

        console.log("📖 Starting PDF text extraction...");
        console.log(
            `📦 PDF buffer size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`
        );

        parser = new PDFParse({
            data: buffer,
        });

        const result = await parser.getText();

        const pdfText =
            result?.text?.trim() || "";

        const pages =
            result?.total ||
            result?.numpages ||
            0;

        console.log(
            `✅ PDF extraction completed`
        );

        console.log(
            `📄 Pages: ${pages}`
        );

        console.log(
            `📝 Extracted characters: ${pdfText.length}`
        );

        return {
            pdfText,
            pages,
        };

    } catch (error) {

        console.error(
            "❌ PDF TEXT EXTRACTION ERROR:",
            error
        );

        throw new Error(
            `Failed to read PDF: ${error.message}`
        );

    } finally {

        // Release parser resources
        if (parser) {

            try {

                await parser.destroy();

            } catch (destroyError) {

                console.error(
                    "⚠️ PDF parser cleanup failed:",
                    destroyError.message
                );

            }

        }

    }

};