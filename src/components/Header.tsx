import React from 'react';
import { BookOpen, GraduationCap, FileText, RotateCcw, Sparkles, BookMarked, FileDown } from 'lucide-react';
import { DocumentInfo } from '../types.ts';

interface HeaderProps {
  documentInfo: DocumentInfo | null;
  onOpenCurriculum: () => void;
  onOpenDocModal: () => void;
  onClearChat: () => void;
  onExportAllWord?: () => void;
  onOpenPhotoModal?: () => void;
  hasMessages: boolean;
  avatarVersion?: number;
}

export const Header: React.FC<HeaderProps> = ({
  documentInfo,
  onOpenCurriculum,
  onOpenDocModal,
  onClearChat,
  onExportAllWord,
  onOpenPhotoModal,
  hasMessages,
  avatarVersion = Date.now(),
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Logo & App Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenPhotoModal}
            title="Bấm để xem ảnh gốc Cô Minh Ngọc"
            className="relative w-11 h-11 rounded-2xl shrink-0 ring-2 ring-amber-400/90 shadow-sm overflow-hidden bg-amber-100 hover:ring-amber-500 hover:scale-105 transition-all cursor-pointer group"
          >
            <img
              src={`/images/co_ngoc_avatar.jpg?v=${avatarVersion}`}
              alt="Ảnh đại diện Cô Minh Ngọc AI"
              className="w-full h-full object-cover object-top transition-transform group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <span
              className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full ring-1 ring-emerald-600/30"
              title="Cô Minh Ngọc đang trực tuyến"
            />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-800 text-base sm:text-lg leading-tight">
                ChatBot Môn Ngữ Văn 6
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Cô Minh Ngọc AI
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>Cô giáo ảo hỗ trợ giải đáp câu hỏi, bài tập & đề thi SGK Bài 1 – 10</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Document Status Pill */}
          <button
            onClick={onOpenDocModal}
            title="Quản lý và xem tài liệu ngữ liệu TL NGU VAN 6.docx"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="max-w-[120px] sm:max-w-[180px] truncate">
              {documentInfo?.filename || 'TL NGU VAN 6.docx'}
            </span>
            {documentInfo?.isCustom && (
              <span className="bg-amber-600 text-white text-[10px] px-1 rounded-sm font-semibold">Tự nạp</span>
            )}
          </button>

          {/* Curriculum Index Button */}
          <button
            onClick={onOpenCurriculum}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition-colors"
          >
            <BookMarked className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="hidden sm:inline">Mục lục 10 Bài</span>
            <span className="sm:hidden">Bài học</span>
          </button>

          {/* Export Full Session to Word */}
          {hasMessages && onExportAllWord && (
            <button
              onClick={onExportAllWord}
              title="Xuất toàn bộ buổi học ra file Word (.docx)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Xuất Word (.docx)</span>
            </button>
          )}

          {/* Clear Chat */}
          {hasMessages && (
            <button
              onClick={onClearChat}
              title="Làm mới cuộc trò chuyện"
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
