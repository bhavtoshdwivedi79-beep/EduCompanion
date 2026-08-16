import { PDFParse } from "pdf-parse";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "canvas";

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

        console.log("✅ PDF extraction completed");

        console.log(`📄 Pages: ${pages}`);

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


/**
 * =========================================================
 * RENDER PDF PAGES AS IMAGES
 * =========================================================
 *
 * Used for scanned/image-only PDFs.
 *
 * PDF
 * ↓
 * Individual pages
 * ↓
 * PNG images
 *
 * @param {Buffer} buffer
 * @returns {Promise<Array<Buffer>>}
 */
export const renderPDFPages = async (buffer) => {

    if (!buffer || !Buffer.isBuffer(buffer)) {
        throw new Error("Invalid PDF buffer");
    }

    console.log("🖼️ Starting PDF page rendering...");

    const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
    });

    const pdfDocument = await loadingTask.promise;

    const totalPages = pdfDocument.numPages;

    console.log(
        `📄 PDF contains ${totalPages} pages`
    );

    const pageImages = [];

    for (
        let pageNumber = 1;
        pageNumber <= totalPages;
        pageNumber++
    ) {

        console.log(
            `🖼️ Rendering page ${pageNumber}/${totalPages}...`
        );

        const page =
            await pdfDocument.getPage(pageNumber);

        /*
         * Scale controls image quality.
         *
         * 1.5 gives a good balance between:
         * quality + memory usage
         */
        const scale = 1.5;

        const viewport =
            page.getViewport({
                scale,
            });

        const canvas =
            createCanvas(
                Math.ceil(viewport.width),
                Math.ceil(viewport.height)
            );

        const context =
            canvas.getContext("2d");

        await page.render({
            canvasContext: context,
            viewport,
        }).promise;

        const imageBuffer =
            canvas.toBuffer("image/png");

        pageImages.push(imageBuffer);

        console.log(
            `✅ Page ${pageNumber} rendered`
        );
    }

    console.log(
        `✅ PDF rendering completed: ${pageImages.length} images`
    );

    return pageImages;
};