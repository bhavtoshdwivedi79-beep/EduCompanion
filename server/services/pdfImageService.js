import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execFileAsync = promisify(execFile);

const MAGICK_PATH =
    "C:\\Program Files\\ImageMagick-7.1.2-Q16-HDRI\\magick.exe";

/**
 * Convert PDF pages into compressed JPEG image buffers
 *
 * Uses:
 * ImageMagick + Ghostscript
 *
 * PDF -> JPEG
 *
 * JPEG is used instead of PNG because scanned PDF pages
 * can become very large when stored as PNG.
 *
 * @param {Buffer} buffer
 * @param {number} totalPages
 * @returns {Promise<Buffer[]>}
 */

export const convertPDFToImages = async (
    buffer,
    totalPages
) => {

    // =====================================================
    // VALIDATE PDF BUFFER
    // =====================================================

    if (
        !buffer ||
        !Buffer.isBuffer(buffer)
    ) {

        throw new Error(
            "Invalid PDF buffer"
        );

    }


    if (buffer.length === 0) {

        throw new Error(
            "PDF file is empty"
        );

    }


    if (
        !totalPages ||
        !Number.isInteger(totalPages) ||
        totalPages < 1
    ) {

        throw new Error(
            "Invalid PDF page count"
        );

    }


    console.log(
        `🖼️ Converting ${totalPages} PDF pages to compressed JPEG images...`
    );


    // =====================================================
    // CREATE TEMP DIRECTORY
    // =====================================================

    const tempDir =
        await fs.mkdtemp(
            path.join(
                os.tmpdir(),
                "educompanion-pdf-"
            )
        );


    const pdfPath =
        path.join(
            tempDir,
            "input.pdf"
        );


    const outputPattern =
        path.join(
            tempDir,
            "page-%03d.jpg"
        );


    try {

        // =================================================
        // SAVE PDF TEMPORARILY
        // =================================================

        await fs.writeFile(
            pdfPath,
            buffer
        );


        console.log(
            `📦 Temporary PDF created: ${pdfPath}`
        );


        console.log(
            `📦 PDF buffer size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`
        );


        // =================================================
        // PDF → JPEG
        // =================================================

        console.log(
            "🔄 Running ImageMagick PDF → JPEG conversion..."
        );


        await execFileAsync(
            MAGICK_PATH,
            [

                // -----------------------------------------
                // Resolution
                // -----------------------------------------

                "-density",
                "120",


                // -----------------------------------------
                // Input PDF
                // -----------------------------------------

                pdfPath,


                // -----------------------------------------
                // Color handling
                // -----------------------------------------

                "-colorspace",
                "sRGB",

                "-background",
                "white",

                "-alpha",
                "remove",

                "-alpha",
                "off",


                // -----------------------------------------
                // Resize large pages
                // -----------------------------------------

                "-resize",
                "512x512>",


                // -----------------------------------------
                // Remove unnecessary metadata
                // -----------------------------------------

                "-strip",


                // -----------------------------------------
                // JPEG quality
                // -----------------------------------------

                "-quality",
                "55",


                // -----------------------------------------
                // Output
                // -----------------------------------------

                outputPattern

            ],
            {
                windowsHide: true,

                maxBuffer:
                    1024 * 1024 * 10

            }
        );


        console.log(
            "✅ ImageMagick conversion completed"
        );


        // =================================================
        // FIND GENERATED JPEG FILES
        // =================================================

        const files =
            await fs.readdir(
                tempDir
            );


        const imageFiles =
            files

                .filter(
                    file =>
                        /^page-\d+\.jpg$/i.test(
                            file
                        )
                )

                .sort();


        console.log(
            `🖼️ Generated ${imageFiles.length}/${totalPages} JPEG files`
        );


        if (
            imageFiles.length === 0
        ) {

            throw new Error(
                "ImageMagick did not generate any JPEG images"
            );

        }


        // =================================================
        // READ JPEG FILES
        // =================================================

        const images = [];


        for (
            let index = 0;
            index < imageFiles.length;
            index++
        ) {

            const imageFile =
                imageFiles[index];


            const imagePath =
                path.join(
                    tempDir,
                    imageFile
                );


            const imageBuffer =
                await fs.readFile(
                    imagePath
                );


            console.log(
                `📄 Page ${index + 1}/${imageFiles.length}: ${(imageBuffer.length / 1024).toFixed(2)} KB`
            );


            if (
                !imageBuffer ||
                !Buffer.isBuffer(imageBuffer) ||
                imageBuffer.length === 0
            ) {

                console.warn(
                    `⚠️ Page ${index + 1} generated an empty image`
                );

                continue;

            }


            images.push(
                imageBuffer
            );

        }


        // =================================================
        // FINAL VALIDATION
        // =================================================

        if (
            images.length === 0
        ) {

            throw new Error(
                "No valid PDF page images were generated"
            );

        }


        console.log(
            `✅ PDF conversion completed: ${images.length}/${totalPages} pages`
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

    } finally {

        // =================================================
        // CLEAN TEMP FILES
        // =================================================

        try {

            await fs.rm(
                tempDir,
                {
                    recursive: true,
                    force: true
                }
            );


            console.log(
                "🧹 Temporary PDF files cleaned"
            );


        } catch (cleanupError) {

            console.warn(
                "⚠️ Could not clean temporary files:",
                cleanupError.message
            );

        }

    }

};