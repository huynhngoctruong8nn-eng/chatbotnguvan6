import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header.tsx';
import { ChatMessageItem } from './components/ChatMessageItem.tsx';
import { ChatInput } from './components/ChatInput.tsx';
import { PromptSuggestions } from './components/PromptSuggestions.tsx';
import { CurriculumDrawer } from './components/CurriculumDrawer.tsx';
import { DocumentModal } from './components/DocumentModal.tsx';
import { PhotoViewerModal } from './components/PhotoViewerModal.tsx';
import { ChatMessage, DocumentInfo } from './types.ts';
import { GraduationCap, Sparkles, BookOpen, AlertCircle, FileText, Headphones, Mic, FileDown, ZoomIn } from 'lucide-react';
import { exportFullChatToDocx } from './utils/exportWord.ts';

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  content: `Xin chào! Cô Minh Ngọc AI đây. Hãy gửi câu hỏi Ngữ văn 6 để cô hướng dẫn em nhé! 🌸

Cô là trợ lý của **ChatBot Môn Ngữ Văn 6**, luôn sẵn sàng hỗ trợ em giải đáp mọi câu hỏi đọc hiểu SGK, bài tập Tiếng Việt và các đề thi chuẩn bám sát nguồn tài liệu **113 trang** (từ **Bài 1 đến Bài 10** cùng đề thi học kì I & II).

✨ **Các tính năng mới nổi bật:**
- 🎙️ **Nhập câu hỏi bằng giọng nói:** Bấm nút Micro để nói câu hỏi, cô sẽ tự động nhận diện và nhập văn bản.
- 🇬🇧 **Học thêm tiếng Anh (Song ngữ Anh - Việt):** Mỗi câu trả lời đều có tóm tắt tiếng Anh & từ vựng trọng tâm kèm nút **nghe phát âm tiếng Anh chuẩn bản xứ**.
- 📄 **Xuất file Word (.docx):** Bấm nút **"Xuất Word"** ở mỗi câu trả lời để tải ngay tài liệu về máy in hoặc ôn thi!

Em hãy bấm nút Micro để nói, chọn câu hỏi gợi ý bên dưới hoặc gửi câu hỏi để cô hướng dẫn em nhé!

---
### 🇬🇧 Góc Tiếng Anh / English Learning Corner
- **English Summary:** Welcome to Grade 6 Literature Assistant! Ask questions using voice or text, explore bilingual English summaries, and export answers to Word documents.
- **Key Vocabulary:**
  • **literature** (/ˈlɪt.rə.tʃər/): môn ngữ văn, tác phẩm văn học
  • **voice input** (/vɔɪs ˈɪn.pʊt/): nhập liệu bằng giọng nói
  • **vocabulary** (/vəˈkæb.jə.ler.i/): từ vựng`,
  timestamp: Date.now(),
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState<number>(Date.now());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial curriculum and active document info
  useEffect(() => {
    fetch('/api/curriculum')
      .then((res) => res.json())
      .then((data) => {
        if (data.activeDocument) {
          setDocumentInfo({
            filename: data.activeDocument.filename,
            title: data.activeDocument.filename,
            totalLessons: 10,
            isCustom: data.activeDocument.isCustom,
            uploadedAt: data.activeDocument.uploadedAt,
            charCount: data.activeDocument.charCount,
          });
        }
      })
      .catch((err) => {
        console.error('Không thể tải thông tin giáo trình:', err);
      });
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (userText: string) => {
    setErrorMessage(null);

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send conversation with history to API
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Đã có lỗi xảy ra khi kết nối tới Trợ lý AI.');
      }

      const assistantMessage: ChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: data.reply || 'Thầy/Cô đã nhận được câu hỏi.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Không thể kết nối đến Trợ lý AI.');

      const errorReply: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: `Chào em! Thầy/Cô xin lỗi vì vừa gặp sự cố kết nối: ${
          err.message || 'Không thể xử lý yêu cầu'
        }. Em vui lòng kiểm tra lại kết nối mạng hoặc khóa API nhé!`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAllWord = async () => {
    try {
      await exportFullChatToDocx(messages);
    } catch (err) {
      console.error('Lỗi xuất file Word:', err);
      alert('Không thể xuất file Word. Vui lòng thử lại!');
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Em có chắc chắn muốn làm mới lại cuộc trò chuyện không?')) {
      setMessages([INITIAL_WELCOME_MESSAGE]);
      setErrorMessage(null);
    }
  };

  return (
    <div className="relative flex flex-col h-screen overflow-hidden font-sans text-slate-900 bg-slate-950">
      {/* Chatbot Background: background Ai ngu van 6 */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-opacity duration-700"
        style={{
          backgroundImage: `url('/images/background_ai_ngu_van_6.jpg')`,
        }}
      >
        {/* Soft overlay to ensure pristine contrast and readability for chat bubbles */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/45 to-slate-950/70 backdrop-blur-[0.5px]" />
      </div>

      {/* Top Header */}
      <div className="relative z-20">
        <Header
          documentInfo={documentInfo}
          onOpenCurriculum={() => setIsCurriculumOpen(true)}
          onOpenDocModal={() => setIsDocModalOpen(true)}
          onClearChat={handleClearChat}
          onExportAllWord={handleExportAllWord}
          onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
          avatarVersion={avatarVersion}
          hasMessages={messages.length > 1}
        />
      </div>

      {/* Main Chat Scroll Container */}
      <main className="relative z-10 flex-1 overflow-y-auto px-3 sm:px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-5">
          {/* Welcome Card & Context Banner */}
          {messages.length <= 1 && (
            <div className="rounded-3xl bg-white/92 backdrop-blur-md p-6 sm:p-7 border border-amber-200/80 shadow-xl text-center space-y-4 mb-4">
              {/* Portrait Showcase - Giữ nguyên ảnh gốc Cô Minh Ngọc */}
              <div className="flex flex-col items-center">
                <div
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="relative w-40 sm:w-48 aspect-[3/4] rounded-3xl overflow-hidden ring-4 ring-amber-400/90 shadow-2xl bg-amber-50 group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-amber-500/25"
                  title="Bấm để xem ảnh gốc đầy đủ Cô Minh Ngọc"
                >
                  <img
                    src={`/images/co_ngoc_avatar.jpg?v=${avatarVersion}`}
                    alt="Ảnh gốc Cô Minh Ngọc"
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Status Tag */}
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1.5 border border-white/20 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Trực tuyến</span>
                  </div>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold gap-1 p-2">
                    <ZoomIn className="w-5 h-5 text-amber-300" />
                    <span>Xem ảnh gốc đầy đủ</span>
                  </div>
                  {/* Bottom Title Bar on Photo */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/85 via-slate-900/60 to-transparent p-2.5 text-center text-white">
                    <div className="text-xs font-bold leading-tight drop-shadow-xs">Cô Minh Ngọc AI</div>
                    <div className="text-[10px] text-amber-200 drop-shadow-xs">Trợ lý Ngữ văn 6</div>
                  </div>
                </div>

                {/* Photo Actions */}
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-300/80 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-sm"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-amber-600" />
                    <span>Xem ảnh gốc Cô Minh Ngọc</span>
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  ChatBot Môn Ngữ Văn 6 – Cô Minh Ngọc AI
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 max-w-lg mx-auto mt-1.5 leading-relaxed">
                  Xin chào các em học sinh! Cô là <strong>Minh Ngọc AI</strong>. Toàn bộ câu trả lời đều bám sát 100% <strong>tài liệu chuẩn 113 trang</strong> (Bài 1 – Bài 10 và đề thi học kì I & II).
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 max-w-2xl mx-auto text-left text-xs">
                <div className="p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2">
                  <Mic className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 block">Nhập giọng nói</span>
                    <span className="text-[11px] text-amber-800">Nói câu hỏi trực tiếp qua Micro tiếng Việt</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-start gap-2">
                  <Headphones className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-900 block">Song ngữ & Giọng đọc EN</span>
                    <span className="text-[11px] text-indigo-800">Học từ vựng & nghe phát âm tiếng Anh chuẩn</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-2">
                  <FileDown className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-900 block">Xuất file Word (.docx)</span>
                    <span className="text-[11px] text-emerald-800">Tải đáp án về máy lưu trữ hoặc in ôn tập</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  onClick={() => setIsCurriculumOpen(true)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mục lục 10 Bài học & Đề thi</span>
                </button>
                <button
                  onClick={() => setIsDocModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-700" />
                  <span>Tài liệu: {documentInfo?.filename || '113 Trang Chuẩn'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Messages Thread */}
          {messages.map((message, index) => {
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const userQuestion =
              message.role === 'assistant' && prevMsg?.role === 'user' ? prevMsg.content : undefined;
            return (
              <ChatMessageItem
                key={message.id}
                message={message}
                userQuestion={userQuestion}
                onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
                avatarVersion={avatarVersion}
              />
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 w-full justify-start animate-in fade-in duration-150">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 shadow-xs ring-2 ring-amber-300 bg-amber-100 mt-0.5">
                <img
                  src={`/images/co_ngoc_avatar.jpg?v=${avatarVersion}`}
                  alt="Cô Minh Ngọc AI"
                  className="w-full h-full object-cover object-top animate-pulse"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="bg-white/95 backdrop-blur-md border border-amber-200/80 rounded-2xl p-4 shadow-md text-sm text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-600 ml-1 font-medium">
                  Cô Minh Ngọc đang tra cứu tài liệu 113 trang để hướng dẫn em...
                </span>
              </div>
            </div>
          )}

          {/* Error Banner if any */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Prompt Suggestions (shown when only initial message exists) */}
          {messages.length === 1 && (
            <PromptSuggestions onSelectPrompt={handleSendMessage} />
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Bottom Chat Input */}
      <div className="relative z-20">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onOpenFileModal={() => setIsDocModalOpen(true)}
        />
      </div>

      {/* Curriculum / Syllabus Drawer */}
      <CurriculumDrawer
        isOpen={isCurriculumOpen}
        onClose={() => setIsCurriculumOpen(false)}
        onSelectQuestion={(q) => handleSendMessage(q)}
      />

      {/* Document Manager Modal */}
      <DocumentModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        documentInfo={documentInfo}
        onDocumentUpdated={(newDoc) => setDocumentInfo(newDoc)}
      />

      {/* Photo Viewer Modal - Giữ nguyên ảnh gốc Cô Minh Ngọc */}
      <PhotoViewerModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        avatarVersion={avatarVersion}
        onAvatarUpdated={() => setAvatarVersion(Date.now())}
      />
    </div>
  );
}
