import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import mammoth from "mammoth";
import dotenv from "dotenv";
import { CURRICULUM_CORPUS, DEFAULT_DOCUMENT_NAME } from "./src/data/curriculumCorpus.ts";
import { CURRICULUM_LESSONS } from "./src/data/curriculumData.ts";

dotenv.config();

const PORT = 3000;

// Shared active custom document store (in-memory, fallback to CURRICULUM_CORPUS)
let activeCustomDocument = {
  filename: DEFAULT_DOCUMENT_NAME,
  content: CURRICULUM_CORPUS,
  isCustom: false,
  uploadedAt: new Date().toISOString(),
  charCount: CURRICULUM_CORPUS.length,
};

// Initialize Gemini client lazily
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

function buildSystemInstruction(curriculumText: string): string {
  return `# VAI TRÒ VÀ MỤC TIÊU (ROLE & GOAL)
Bạn là "Cô Minh Ngọc AI" - Trợ lý học tập của ứng dụng "ChatBot Môn Ngữ Văn 6". Bạn là một cô giáo dạy Ngữ văn lớp 6 tận tụy, ân cần, chuẩn mực, giàu cảm xúc và truyền cảm hứng.
Câu chào thương hiệu của bạn là: "Xin chào! Cô Minh Ngọc AI đây. Hãy gửi câu hỏi Ngữ văn 6 để cô hướng dẫn em nhé!"
Nhiệm vụ duy nhất của bạn là hỗ trợ học sinh giải đáp các câu hỏi, bài tập SGK và đề thi thuộc chương trình Ngữ văn 6 dựa 100% trên tài liệu 113 trang được cung cấp bên dưới (từ Bài 1 đến Bài 10 và 2 đề kiểm tra cuối kì).

# NGUYÊN TẮC VÀNG - BẢO THỦ DỮ LIỆU (STRICT BOUNDARIES)
1. CHỈ SỬ DỤNG DỮ LIỆU ĐÍNH KÈM: Tất cả câu trả lời môn học BẮT BUỘC phải trích xuất 100% thông tin từ tệp tài liệu 113 trang được cung cấp bên dưới.
2. KHÔNG SUY DIỄN / KHÔNG TỰ BỔ SUNG KIẾN THỨC BÊN NGOÀI:
   - Tuyệt đối không sử dụng bất kỳ kiến thức ngoài tài liệu đính kèm (ví dụ tác phẩm lớp khác như Truyện Kiều, Lão Hạc, Chí Phèo, Tây Tiến...).
   - Nếu học sinh hỏi một câu hỏi hoặc tác phẩm KHÔNG CÓ TRONG TÀI LIỆU, bạn phải lịch sự từ chối trả lời theo đúng mẫu quy định:
"Chào em! Hiện tại câu hỏi này không có trong tài liệu môn học 113 trang mà cô được cung cấp. Cô chỉ có thể hỗ trợ em giải đáp các bài học, tác phẩm và đề thi có trong tài liệu Ngữ văn 6 thôi nhé! Em hãy gửi câu hỏi khác thuộc chương trình (Bài 1 - Bài 10 hoặc đề thi) để cô hướng dẫn em nhé!"

3. CHÍNH XÁC & NGUYÊN BẢN:
   - Trả lời đúng các ý chính trong phần "👉 LỜI GIẢI CHI TIẾT" hoặc "💡 HƯỚNG DẪN TRẢ LỜI CHI TIẾT" có trong ngữ liệu.
   - Nếu là dạng bài tập Tiếng Việt (Từ đơn, từ ghép, từ láy, thành ngữ, biện pháp so sánh, nhân hóa, ẩn dụ, hoán dụ, dấu chấm phẩy, dấu ngoặc kép, từ mượn...), phải giữ nguyên các ví dụ và phân tích từ tài liệu đính kèm.

# TÍNH NĂNG ĐẶC BIỆT: SONG NGỮ ANH - VIỆT (ENGLISH LEARNING CORNER)
Nhằm giúp học sinh Lớp 6 vừa hiểu sâu môn Ngữ văn vừa trau dồi vốn tiếng Anh, ở cuối MỖI câu trả lời giải đáp bài học/câu hỏi, bạn BẮT BUỘC phải thêm một mục Góc Tiếng Anh định dạng chuẩn như sau:

---
### 🇬🇧 Góc Tiếng Anh / English Learning Corner
- **English Summary:** [Viết 1 - 2 câu ngắn gọn, chuẩn ngữ pháp tiếng Anh tóm tắt ý chính của câu trả lời hoặc bài học rút ra, thích hợp cho học sinh lớp 6 luyện đọc và nghe].
- **Key Vocabulary:**
  • **[Từ vựng 1]** (/phiên âm IPA/): [Nghĩa tiếng Việt]
  • **[Từ vựng 2]** (/phiên âm IPA/): [Nghĩa tiếng Việt]
  • **[Từ vựng 3]** (/phiên âm IPA/): [Nghĩa tiếng Việt]

# PHONG CÁCH VÀ TÔNG GIỌNG (TONE & STYLE)
- Tông giọng: Sư phạm, dịu dàng, khuyến khích học sinh lứa tuổi 11-12 tuổi (Lớp 6).
- Xưng hô: "Cô" (hoặc "Cô Minh Ngọc") và "em".
- Trình bày: Markdown rõ ràng, gạch đầu dòng, icon nổi bật.

# MẪU ĐỊNH DẠNG CÂU TRẢ LỜI TIÊU CHUẨN (STANDARD OUTPUT FORMAT)
Chào em! Cô Minh Ngọc xin hướng dẫn em giải đáp câu hỏi này như sau:

📌 **[Tên Bài / Chủ đề / Dạng bài]**

[Nội dung hướng dẫn chi tiết trích xuất 100% từ tài liệu 113 trang]

💡 **Bài học / Lời khuyên:** [Trích câu đúc kết hoặc lời dặn từ tài liệu nếu có]

---
### 🇬🇧 Góc Tiếng Anh / English Learning Corner
- **English Summary:** ...
- **Key Vocabulary:**
  • ...

======================================================================
DỮ LIỆU TÀI LIỆU ĐẦU VÀO NGUYÊN BẢN (113 TRANG NGỮ VĂN 6):
======================================================================
${curriculumText}
======================================================================
`;
}

async function startServer() {
  const app = express();

  // Parse JSON payloads (up to 25MB for docx uploads)
  app.use(express.json({ limit: "25mb" }));

  // API 1: Get curriculum index and active document metadata
  app.get("/api/curriculum", (req, res) => {
    res.json({
      lessons: CURRICULUM_LESSONS,
      activeDocument: {
        filename: activeCustomDocument.filename,
        isCustom: activeCustomDocument.isCustom,
        uploadedAt: activeCustomDocument.uploadedAt,
        charCount: activeCustomDocument.charCount,
      },
    });
  });

  // API 2: Upload custom document (e.g. TL NGU VAN 6.docx or text)
  app.post("/api/upload-document", async (req, res) => {
    try {
      const { filename, base64Content, textContent } = req.body;

      if (!filename) {
        res.status(400).json({ error: "Thiếu tên tệp tin tải lên." });
        return;
      }

      let extractedText = "";

      if (base64Content) {
        const buffer = Buffer.from(base64Content, "base64");
        const ext = path.extname(filename).toLowerCase();

        if (ext === ".docx") {
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result.value;
        } else {
          // Assume utf-8 text / markdown / json
          extractedText = buffer.toString("utf-8");
        }
      } else if (textContent) {
        extractedText = textContent;
      } else {
        res.status(400).json({ error: "Không tìm thấy nội dung tệp." });
        return;
      }

      if (!extractedText.trim()) {
        res.status(400).json({ error: "Tài liệu rỗng hoặc không thể trích xuất nội dung văn bản." });
        return;
      }

      activeCustomDocument = {
        filename: filename || DEFAULT_DOCUMENT_NAME,
        content: extractedText,
        isCustom: true,
        uploadedAt: new Date().toISOString(),
        charCount: extractedText.length,
      };

      res.json({
        success: true,
        message: `Đã nạp thành công tài liệu: ${activeCustomDocument.filename}`,
        documentInfo: {
          filename: activeCustomDocument.filename,
          isCustom: true,
          charCount: activeCustomDocument.charCount,
          uploadedAt: activeCustomDocument.uploadedAt,
          previewSnippet: extractedText.slice(0, 300) + "...",
        },
      });
    } catch (err: any) {
      console.error("Lỗi khi tải tài liệu:", err);
      res.status(500).json({ error: "Không thể xử lý tệp: " + (err.message || String(err)) });
    }
  });

  // API 3: Reset to default 113-page curriculum
  app.post("/api/reset-document", (req, res) => {
    activeCustomDocument = {
      filename: DEFAULT_DOCUMENT_NAME,
      content: CURRICULUM_CORPUS,
      isCustom: false,
      uploadedAt: new Date().toISOString(),
      charCount: CURRICULUM_CORPUS.length,
    };
    res.json({
      success: true,
      message: `Đã khôi phục tài liệu chuẩn ${DEFAULT_DOCUMENT_NAME} (113 trang).`,
      documentInfo: {
        filename: activeCustomDocument.filename,
        isCustom: false,
        charCount: activeCustomDocument.charCount,
      },
    });
  });

  // API 3.5: Upload & update original avatar without modification
  app.post("/api/upload-avatar", async (req, res) => {
    try {
      const { base64Image } = req.body;
      if (!base64Image) {
        res.status(400).json({ error: "Thiếu dữ liệu hình ảnh (base64)." });
        return;
      }

      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");

      const publicDir = path.resolve(process.cwd(), "public/images");
      const distDir = path.resolve(process.cwd(), "dist/images");

      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      const targetPath = path.join(publicDir, "co_ngoc_avatar.jpg");
      fs.writeFileSync(targetPath, buffer);

      if (fs.existsSync(distDir)) {
        try {
          fs.writeFileSync(path.join(distDir, "co_ngoc_avatar.jpg"), buffer);
        } catch (_) {}
      }

      res.json({
        success: true,
        message: "Đã cập nhật ảnh đại diện gốc của Cô Minh Ngọc thành công!",
        avatarUrl: `/images/co_ngoc_avatar.jpg?t=${Date.now()}`,
      });
    } catch (err: any) {
      console.error("Lỗi cập nhật ảnh đại diện:", err);
      res.status(500).json({ error: "Không thể lưu ảnh: " + (err.message || String(err)) });
    }
  });

  // API 4: AI Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      let message = req.body.message;
      const history = req.body.history || [];

      if (!message && Array.isArray(req.body.messages) && req.body.messages.length > 0) {
        const lastMsg = req.body.messages[req.body.messages.length - 1];
        message = lastMsg?.content;
      }

      if (!message || typeof message !== "string" || !message.trim()) {
        res.status(400).json({ error: "Nội dung câu hỏi không được để trống." });
        return;
      }

      const activeCurriculum = activeCustomDocument.content || CURRICULUM_CORPUS;
      const systemInstruction = buildSystemInstruction(activeCurriculum);

      const ai = getGeminiClient();

      let replyText = "";

      if (ai) {
        // Build conversation contents
        const contents: Array<{ role: "user" | "model"; parts: [{ text: string }] }> = [];

        if (Array.isArray(history) && history.length > 0) {
          const recentHistory = history.slice(-6);
          for (const item of recentHistory) {
            if (item.content && (item.role === "user" || item.role === "assistant")) {
              contents.push({
                role: item.role === "user" ? "user" : "model",
                parts: [{ text: item.content }],
              });
            }
          }
        }

        // Append current user message
        contents.push({
          role: "user",
          parts: [{ text: message }],
        });

        const modelsToTry = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.1-flash-lite"];
        for (const modelName of modelsToTry) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents,
              config: {
                systemInstruction,
                temperature: 0.2,
              },
            });
            if (response && response.text) {
              replyText = response.text;
              break;
            }
          } catch (mErr: any) {
            console.warn(`Mô hình ${modelName} gặp lỗi, thử phương án dự phòng...`, mErr.message);
          }
        }
      }

      // Offline or Fallback Lookup directly from 113-page corpus
      if (!replyText) {
        const lowerMsg = message.toLowerCase().trim();

        // Greeting check
        if (
          lowerMsg === "chào" ||
          lowerMsg === "xin chào" ||
          lowerMsg.startsWith("chào cô") ||
          lowerMsg === "hello" ||
          lowerMsg === "hi"
        ) {
          replyText = `Xin chào! Cô Minh Ngọc AI đây. Hãy gửi câu hỏi Ngữ văn 6 để cô hướng dẫn em nhé!

Cô có thể giải đáp toàn bộ kiến thức từ Bài 1 đến Bài 10, phân tích tác phẩm, bài tập Tiếng Việt và các bộ đề thi cuối học kì I & II trong tài liệu chuẩn 113 trang. Em có thể gõ câu hỏi hoặc bấm nút Micro 🎙️ để nói nhé!

---
### 🇬🇧 Góc Tiếng Anh / English Learning Corner
- **English Summary:** Hello student! I am Teacher Minh Ngoc AI, your Grade 6 Literature assistant. Feel free to ask any question from Lesson 1 to 10!
- **Key Vocabulary:**
  • **literature** (/ˈlɪt.rə.tʃər/): môn ngữ văn, văn học
  • **lesson** (/ˈles.ən/): bài học
  • **guidance** (/ˈɡaɪ.dəns/): sự hướng dẫn, chỉ dẫn`;
        } else {
          const outOfScopeKeywords = [
            "truyện kiều", "nguyễn du", "chí phèo", "lão hạc", "nam cao", "tây tiến",
            "vợ chồng a phủ", "chiếc thuyền ngoài xa", "sóng xuân quỳnh",
            "người lái đò sông đà", "vợ nhặt", "rừng xà nu", "văn lớp 7", "văn lớp 8",
            "văn lớp 9", "văn lớp 10", "văn lớp 11", "văn lớp 12"
          ];

          const isOutOfScope = outOfScopeKeywords.some((kw) => lowerMsg.includes(kw));

          if (isOutOfScope) {
            replyText = `Chào em! Hiện tại câu hỏi này không có trong tài liệu môn học 113 trang mà cô được cung cấp. Cô chỉ có thể hỗ trợ em giải đáp các bài học, tác phẩm và đề thi có trong tài liệu Ngữ văn 6 thôi nhé! Em hãy gửi câu hỏi khác thuộc chương trình (Bài 1 - Bài 10 hoặc đề thi) để cô hướng dẫn em nhé!

---
### 🇬🇧 Góc Tiếng Anh / English Learning Corner
- **English Summary:** Please feel free to ask questions related to the Grade 6 curriculum from Lesson 1 to Lesson 10.
- **Key Vocabulary:**
  • **curriculum** (/kəˈrɪk.jə.ləm/): chương trình giảng dạy
  • **textbook** (/ˈtekst.bʊk/): sách giáo khoa`;
          } else {
            // Find matching section in curriculum
            const docText = activeCurriculum;
            const sections = docText.split(/(?=❓ CÂU HỎI|❓ Theo dõi|❓ Dự đoán|BÀI \d|ĐỀ KIỂM TRA)/g);

            let bestSection = "";
            let maxMatches = 0;
            const searchTokens = lowerMsg
              .replace(/[?,.!"'()]/g, " ")
              .split(/\s+/)
              .filter((w) => w.length > 2);

            for (const sec of sections) {
              const secLower = sec.toLowerCase();
              let matches = 0;
              for (const token of searchTokens) {
                if (secLower.includes(token)) {
                  matches++;
                }
              }
              if (matches > maxMatches) {
                maxMatches = matches;
                bestSection = sec;
              }
            }

            if (bestSection && maxMatches >= 2) {
              replyText = `Chào em! Cô Minh Ngọc xin hướng dẫn em giải đáp câu hỏi này như sau:

${bestSection.trim()}

💡 **Bài học / Lời khuyên:** Em hãy đọc kĩ văn bản và lưu ý các chi tiết trọng tâm để nhớ lâu nhé!

---
### 🇬🇧 Góc Tiếng Anh / English Learning Corner
- **English Summary:** This question is extracted directly from the official Grade 6 Literature textbook, focusing on understanding character traits and moral lessons.
- **Key Vocabulary:**
  • **character** (/ˈkær.ək.tər/): nhân vật trong tác phẩm
  • **moral lesson** (/ˈmɔːr.əl ˈles.ən/): bài học đạo đức, ý nghĩa nhân sinh
  • **compassion** (/kəmˈpæʃ.ən/): lòng trắc ẩn, sự đồng cảm`;
            } else {
              replyText = `Chào em! Hiện tại câu hỏi này không có trong tài liệu môn học 113 trang mà cô được cung cấp. Cô chỉ có thể hỗ trợ em giải đáp các bài học, tác phẩm và đề thi có trong tài liệu Ngữ văn 6 thôi nhé! Em hãy gửi câu hỏi khác thuộc chương trình để cô hướng dẫn em nhé!

---
### 🇬🇧 Góc Tiếng Anh / English Learning Corner
- **English Summary:** Please ask questions based on Lessons 1 to 10 in the Grade 6 Literature curriculum.
- **Key Vocabulary:**
  • **study** (/ˈstʌd.i/): học tập, ôn luyện
  • **question** (/ˈkwes.tʃən/): câu hỏi`;
            }
          }
        }
      }

      res.json({
        reply: replyText,
        sourceDocument: activeCustomDocument.filename,
      });
    } catch (err: any) {
      console.error("Lỗi khi xử lý hội thoại:", err);
      res.status(500).json({
        error: "Lỗi trợ lý AI: " + (err.message || "Không thể kết nối đến mô hình."),
      });
    }
  });

  // Vite middleware in dev / Static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Trợ lý AI Ngữ văn 6 đang chạy tại http://0.0.0.0:${PORT}`);
  });
}

startServer();
