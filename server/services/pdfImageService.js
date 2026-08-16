import { pdf } from "pdf-to-img";

/**
 * Convert PDF pages into images
 *
 * @param {Buffer} buffer
 * @returns {Promise<Buffer[]>}
 */
export const convertPDFToImages = async (buffer) => {

    if (!buffer || !Buffer.isBuffer(buffer)) {
        throw new Error("Invalid PDF buffer");
    }

    if (buffer.length === 0) {
        throw new Error("PDF file is empty");
    }

    const images = [];

    try {

        console.log("🖼️ Converting PDF pages to images...");

        const document = await pdf(buffer, {
            scale: 2,
        });

        let pageNumber = 1;

        for await (const image of document) {

            console.log(
                `📄 Converting page ${pageNumber}...`
            );

            images.push(image);

            pageNumber++;
        }

        console.log(
            `✅ PDF converted successfully: ${images.length} pages`
        );

        return images;

    } catch (error) {

        console.error(
            "❌ PDF TO IMAGE ERROR:",
            error
        );

        throw new Error(
            `Failed to convert PDF pages to images: ${error.message}`
        );
    }
};