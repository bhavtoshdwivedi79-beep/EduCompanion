import fs from "fs";
import { extractPDFText, renderPDFPages } from "../services/pdfService.js";
import { analyzeStudentResult } from "../services/geminiService.js";

export const analyzeResult = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a result file."
            });
        }

        const file = req.file;

        console.log("📊 Result analysis started");
        console.log(`📄 File: ${file.originalname}`);
        console.log(`📦 Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`📝 Type: ${file.mimetype}`);

        let resultText = "";
        let resultImage = null;

        // ==========================================
        // PDF
        // ==========================================

        if (file.mimetype === "application/pdf") {

            const extracted = await extractPDFText(file.buffer);

            resultText = extracted.pdfText;

            console.log(`📄 PDF pages: ${extracted.pages}`);
            console.log(`📝 Extracted characters: ${resultText.length}`);

            // If PDF contains little/no readable text,
            // render its pages as images for AI vision analysis.
            if (!resultText || resultText.length < 50) {

                console.log(
                    "🖼️ Very little PDF text found. Rendering PDF pages..."
                );

                const pageImages = await renderPDFPages(file.buffer);

                if (!pageImages || pageImages.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Could not read the uploaded PDF."
                    });
                }

                // For now analyze the first page.
                // We can improve multi-page handling later.
                resultImage = pageImages[0];

                console.log("✅ PDF first page prepared for AI vision");
            }
        }

        // ==========================================
        // IMAGE
        // ==========================================

        else if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png"
        ) {
            resultImage = file.buffer;

            console.log("🖼️ Result image prepared for AI vision");
        }

        // ==========================================
        // UNSUPPORTED FILE
        // ==========================================

        else {
            return res.status(400).json({
                success: false,
                message: "Unsupported file type. Please upload PDF, JPG, or PNG."
            });
        }

        // ==========================================
        // AI ANALYSIS
        // ==========================================

        const aiResponse = await analyzeStudentResult(
            resultText,
            resultImage,
            file.mimetype
        );

        console.log("🤖 AI result analysis completed");

        // ==========================================
        // PARSE AI RESPONSE
        // ==========================================

        let analysis;

        try {
            analysis =
                typeof aiResponse === "string"
                    ? JSON.parse(aiResponse)
                    : aiResponse;
        } catch (parseError) {
            console.error(
                "❌ Failed to parse AI result:",
                parseError.message
            );

            return res.status(500).json({
                success: false,
                message: "AI returned an invalid result format."
            });
        }

        // ==========================================
        // BASIC VALIDATION
        // ==========================================

        if (!analysis || typeof analysis !== "object") {
            return res.status(500).json({
                success: false,
                message: "Invalid analysis received from AI."
            });
        }

        if (!Array.isArray(analysis.subjects)) {
            analysis.subjects = [];
        }

        if (!Array.isArray(analysis.strongSubjects)) {
            analysis.strongSubjects = [];
        }

        if (!Array.isArray(analysis.improvementSubjects)) {
            analysis.improvementSubjects = [];
        }

        if (!Array.isArray(analysis.weakSubjects)) {
            analysis.weakSubjects = [];
        }

        // ==========================================
        // FINAL RESPONSE
        // ==========================================

        return res.status(200).json({
            success: true,
            message: "Result analyzed successfully.",
            data: analysis
        });

    } catch (error) {

        console.error(
            "❌ RESULT ANALYSIS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to analyze result.",
            error: error.message
        });
    }
};