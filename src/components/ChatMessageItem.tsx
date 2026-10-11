import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  FileDown,
  Sparkles,
  Headphones,
  RotateCcw,
  Languages,
  User,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { ChatMessage } from '../types.ts';
import { exportAnswerToDocx } from '../utils/exportWord.ts';

interface ChatMessageItemProps {
  message: ChatMessage;
  userQuestion?: string;
  onOpenPhotoModal?: () => void;
  avatarVersion?: number;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  userQuestion,
  onOpenPhotoModal,
  avatarVersion = Date.now(),
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeakingVi, setIsSpeakingVi] = useState(false);
  const [isSpeakingEn, setIsSpeakingEn] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.9);
  const [isExporting, setIsExporting] = useState(false);

  const isAssistant = message.role === 'assistant';

  // Extract English text section for dedicated pronunciation
  const extractEnglishSection = (text: string) => {
    const match = text.match(/###\s*🇬🇧\s*Góc Tiếng Anh[\s\S]*/i);
    if (match) {
      return match[0]
        .replace(/###\s*🇬🇧\s*Góc Tiếng Anh[^\n]*/i, '')
        .replace(/\*\*English Summary:\*\*/i, 'Summary:')
        .replace(/\*\*Key Vocabulary:\*\*/i, 'Key Vocabulary:')
        .replace(/[#*`_~>-]/g, ' ')
        .replace(/•/g, ', ')
        .trim();
    }
    // Fallback: check if text has any English lines
    return '';
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Không thể sao chép văn bản:', err);
    }
  };

  // Play Vietnamese voice (Cô Minh Ngọc)
  const handleSpeakVietnamese = () => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt chưa hỗ trợ bộ phát âm SpeechSynthesis.');
      return;
    }

    if (isSpeakingVi) {
      window.speechSynthesis.cancel();
      setIsSpeakingVi(false);
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeakingEn(false);

    // Filter out english block for vietnamese voice
    const viText = message.content
      .split(/###\s*🇬🇧\s*Góc Tiếng Anh/i)[0]
      .replace(/[#*`_~>-]/g, ' ')
      .replace(/👉|💡|📌|❓/g, '');

    const utterance = new SpeechSynthesisUtterance(viText);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeakingVi(false);
    utterance.onerror = () => setIsSpeakingVi(false);

    setIsSpeakingVi(true);
    window.speechSynthesis.speak(utterance);
  };

  // Play English voice (British / American accent for students)
  const handleSpeakEnglish = () => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt chưa hỗ trợ bộ phát âm SpeechSynthesis.');
      return;
    }

    if (isSpeakingEn) {
      window.speechSynthesis.cancel();
      setIsSpeakingEn(false);
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeakingVi(false);

    let enText = extractEnglishSection(message.content);
    if (!enText) {
      enText =
        'Hello student! This is Teacher Minh Ngoc AI. Literature Grade 6 assistant. Practice English listening and vocabulary every day!';
    }

    const utterance = new SpeechSynthesisUtterance(enText);
    utterance.lang = 'en-US';
    utterance.rate = speechRate;

    // Try finding natural English voice if available in browser
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(
      (v) => (v.lang.startsWith('en') || v.lang.startsWith('en-US') || v.lang.startsWith('en-GB')) && !v.name.includes('Google')
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (enVoice) {
      utterance.voice = enVoice;
    }

    utterance.onend = () => setIsSpeakingEn(false);
    utterance.onerror = () => setIsSpeakingEn(false);

    setIsSpeakingEn(true);
    window.speechSynthesis.speak(utterance);
  };

  // Export answer to Word .docx
  const handleExportWord = async () => {
    try {
      setIsExporting(true);
      const question = userQuestion || 'Câu hỏi môn Ngữ văn 6';
      await exportAnswerToDocx(question, message.content, message.lessonTag);
    } catch (err) {
      console.error('Lỗi xuất file Word:', err);
      alert('Không thể xuất file Word. Vui lòng thử lại!');
    } finally {
      setIsExporting(false);
    }
  };

  const hasEnglishBlock = message.content.includes('Góc Tiếng Anh') || message.content.includes('English Learning Corner');

  return (
    <div
      className={`flex items-start gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-200 ${
        isAssistant ? 'justify-start' : 'justify-end'
      }`}
    >
      {/* Avatar for Assistant */}
      {isAssistant && (
        <button
          type="button"
          onClick={onOpenPhotoModal}
          title="Bấm để xem ảnh gốc Cô Minh Ngọc"
          className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 shadow-sm ring-2 ring-amber-300/80 bg-amber-100 mt-1 hover:ring-amber-500 hover:scale-105 transition-all cursor-pointer group"
        >
          <img
            src={`/images/co_ngoc_avatar.jpg?v=${avatarVersion}`}
            alt="Cô Minh Ngọc AI"
            className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform"
            referrerPolicy="no-referrer"
          />
        </button>
      )}

      {/* Message Bubble */}
      <div
        className={`max-w-[92%] sm:max-w-[85%] rounded-3xl p-4 sm:p-5 shadow-md text-sm leading-relaxed ${
          isAssistant
            ? 'bg-white/95 backdrop-blur-md border border-amber-200/80 text-slate-800 ring-1 ring-black/5'
            : 'bg-indigo-600/95 backdrop-blur-sm text-white rounded-br-xs shadow-indigo-900/20'
        }`}
      >
        {/* Assistant Header & Actions Toolbar */}
        {isAssistant && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-2.5 mb-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-amber-900 flex items-center gap-1">
                <span>Cô Minh Ngọc AI</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              </span>
              <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md border border-amber-200">
                Chuẩn 113 trang
              </span>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center flex-wrap gap-1.5">
              {/* English Voice button */}
              <button
                onClick={handleSpeakEnglish}
                title={isSpeakingEn ? 'Dừng đọc tiếng Anh' : '🔊 Nghe phát âm tiếng Anh (English Voice)'}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                  isSpeakingEn
                    ? 'bg-indigo-600 text-white animate-pulse shadow-xs'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{isSpeakingEn ? 'Đang đọc EN' : 'Giọng tiếng Anh'}</span>
              </button>

              {/* Vietnamese Voice button */}
              <button
                onClick={handleSpeakVietnamese}
                title={isSpeakingVi ? 'Dừng đọc tiếng Việt' : '🔊 Nghe Cô Ngọc đọc (Tiếng Việt)'}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                  isSpeakingVi
                    ? 'bg-amber-600 text-white animate-pulse shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80'
                }`}
              >
                {isSpeakingVi ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isSpeakingVi ? 'Dừng đọc' : 'Đọc VN'}</span>
              </button>

              {/* Export Word Button */}
              <button
                onClick={handleExportWord}
                disabled={isExporting}
                title="📄 Xuất đáp án câu hỏi ra file Word (.docx)"
                className="px-2 py-1 rounded-lg text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-colors flex items-center gap-1 shadow-2xs"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold">{isExporting ? 'Đang xuất...' : 'Xuất Word'}</span>
              </button>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                title="Sao chép câu trả lời"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Message Content */}
        {isAssistant ? (
          <div className="space-y-2">
            <div className="markdown-body text-slate-800 break-words prose prose-sm prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-headings:mt-3 prose-headings:mb-1.5 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-strong:text-amber-900">
              <Markdown>{message.content}</Markdown>
            </div>

            {/* Bilingual English Learning Banner if present */}
            {hasEnglishBlock && (
              <div className="mt-4 pt-3 border-t border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-indigo-50/70 p-3 rounded-2xl border border-indigo-200/60 shadow-2xs">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🇬🇧</span>
                    <span className="text-xs font-bold text-indigo-900">
                      Luyện Nghe & Đọc Tiếng Anh (English Practice)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Speed Selector */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-600">
                      <span>Tốc độ:</span>
                      <button
                        onClick={() => setSpeechRate(0.8)}
                        className={`px-1.5 py-0.5 rounded ${speechRate === 0.8 ? 'bg-indigo-600 text-white font-bold' : 'bg-white text-slate-700 border'}`}
                      >
                        0.8x
                      </button>
                      <button
                        onClick={() => setSpeechRate(1.0)}
                        className={`px-1.5 py-0.5 rounded ${speechRate === 1.0 ? 'bg-indigo-600 text-white font-bold' : 'bg-white text-slate-700 border'}`}
                      >
                        1.0x
                      </button>
                    </div>

                    <button
                      onClick={handleSpeakEnglish}
                      className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>{isSpeakingEn ? 'Dừng đọc EN' : 'Phát âm tiếng Anh'}</span>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-indigo-700/90 leading-relaxed">
                  💡 <em>Lắng nghe phát âm chuẩn bản xứ của phần tóm tắt và từ vựng trên để nâng cao kỹ năng nghe và vốn từ tiếng Anh nhé!</em>
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}

        {/* Footer timestamp & docx badge */}
        <div
          className={`flex items-center justify-between text-[10px] mt-2.5 pt-1.5 border-t ${
            isAssistant ? 'border-slate-100 text-slate-400' : 'border-indigo-500/40 text-indigo-200'
          }`}
        >
          <span>
            {isAssistant ? (
              <span className="flex items-center gap-1 text-slate-500">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Trích xuất chuẩn 100% ngữ liệu môn học</span>
              </span>
            ) : (
              <span>Học sinh gửi câu hỏi</span>
            )}
          </span>
          <span>
            {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Avatar for User */}
      {!isAssistant && (
        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-1 border border-indigo-200 shadow-2xs">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
