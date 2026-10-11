import React, { useState } from 'react';
import { X, BookOpen, ChevronRight, HelpCircle, FileText, CheckCircle } from 'lucide-react';
import { LessonTopic } from '../types.ts';
import { CURRICULUM_LESSONS } from '../data/curriculumData.ts';

interface CurriculumDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (question: string) => void;
}

export const CurriculumDrawer: React.FC<CurriculumDrawerProps> = ({
  isOpen,
  onClose,
  onSelectQuestion,
}) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string>('bai-1');

  if (!isOpen) return null;

  const currentLesson = CURRICULUM_LESSONS.find((l) => l.id === selectedLessonId) || CURRICULUM_LESSONS[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Mục lục Ngữ văn 6 (Bài 1 - Bài 10)
              </h2>
              <p className="text-xs text-slate-500">
                Toàn bộ bài học, ngữ liệu và câu hỏi mẫu trong tài liệu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Lessons List Column */}
          <div className="w-5/12 sm:w-1/2 border-r border-slate-200 overflow-y-auto p-2 space-y-1 bg-slate-50/50">
            {CURRICULUM_LESSONS.map((lesson) => {
              const isSelected = lesson.id === selectedLessonId;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLessonId(lesson.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-start justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-medium shadow-xs ring-1 ring-indigo-500'
                      : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {lesson.id.startsWith('de-thi') ? '📝 ' + lesson.title : `Bài ${lesson.lessonNumber}`}
                    </p>
                    <p className={`text-[11px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {lesson.title.replace(/^Bài \d+:\s*/, '')}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                      isSelected ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Lesson Details & Sample Questions Column */}
          <div className="w-7/12 sm:w-1/2 overflow-y-auto p-4 space-y-4 text-xs">
            <div>
              <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold mb-1 text-[11px]">
                {currentLesson.title}
              </span>
              <h3 className="text-sm font-bold text-slate-800">{currentLesson.theme}</h3>
            </div>

            {/* Texts */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-700 block">📖 Văn bản đọc:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                {currentLesson.texts.map((t, idx) => (
                  <li key={idx} className="truncate">{t}</li>
                ))}
              </ul>
            </div>

            {/* Grammar / Language Practice */}
            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1 text-emerald-950">
              <span className="font-semibold text-emerald-900 block">✍️ Thực hành Tiếng Việt:</span>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                {currentLesson.grammar.map((g, idx) => (
                  <li key={idx}>{g}</li>
                ))}
              </ul>
            </div>

            {/* Sample Questions to Click */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>Câu hỏi mẫu học sinh hay hỏi:</span>
              </div>
              <div className="space-y-1.5">
                {currentLesson.sampleQuestions.map((sq, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectQuestion(sq.question);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-900 transition-colors group flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5 group-hover:scale-125 transition-transform" />
                    <span className="leading-snug text-xs">{sq.question}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
