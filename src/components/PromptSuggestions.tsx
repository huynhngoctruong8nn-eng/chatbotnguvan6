import React from 'react';
import { Sparkles, HelpCircle, ShieldAlert } from 'lucide-react';

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    {
      label: 'Bài học đường đời Dế Mèn',
      question: 'Bài học đường đời đầu tiên mà Dế Mèn rút ra sau cái chết của Dế Choắt là gì (SGK trang 18)?',
      badge: 'Bài 1',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      label: 'Từ láy & Tiếng Việt Bài 1',
      question: 'Tìm từ láy mô phỏng âm thanh và nêu tác dụng của từ láy phanh phách, ngoàm ngoạp (Trang 20)?',
      badge: 'Tiếng Việt',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      label: '5 lần quẹt diêm của em bé',
      question: 'Nêu các lần quẹt diêm và mộng tưởng tương ứng của cô bé bán diêm trong Bài 3 (Trang 66)?',
      badge: 'Bài 3',
      badgeColor: 'bg-sky-100 text-sky-800',
    },
    {
      label: 'Ý nghĩa Gióng bay về trời',
      question: 'Chỉ ra ý nghĩa của chi tiết tráng sĩ Thánh Gióng cởi giáp sắt bỏ lại và bay lên trời (SGK trang 9)?',
      badge: 'Bài 6',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      label: 'Đề kiểm tra Cuối Học kì I',
      question: 'Cho em xin Đề kiểm tra cuối học kì I môn Ngữ văn 6 (Đọc hiểu Dế Mèn) kèm đáp án và thang điểm chi tiết?',
      badge: 'Đề thi Kì I',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      label: 'Hai loại khác biệt (Bài 8)',
      question: 'Phân biệt sự khác biệt vô nghĩa và sự khác biệt có ý nghĩa trong văn bản của Giong-mi Mun (Trang 90)?',
      badge: 'Bài 8',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      label: 'Đề kiểm tra Học kì II',
      question: 'Cho em xin Đề kiểm tra tổng hợp học kì II (Rác thải nhựa đại dương) kèm đáp án và thang điểm chi tiết?',
      badge: 'Đề thi Kì II',
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
      label: 'Thử hỏi câu ngoài tài liệu',
      question: 'Hãy phân tích tác phẩm Truyện Kiều của Nguyễn Du?',
      badge: 'Kiểm tra bảo thủ',
      badgeColor: 'bg-slate-200 text-slate-700',
      isWarningTest: true,
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto my-4 px-2">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-amber-200/80 shadow-xs text-xs font-semibold text-slate-800 mb-2.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Gợi ý câu hỏi ôn tập nhanh:</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestions.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(item.question)}
            className="text-left p-3 rounded-2xl bg-white/95 backdrop-blur-md hover:bg-white border border-amber-100/90 hover:border-amber-300 transition-all shadow-sm hover:shadow-md group flex items-start justify-between gap-2"
          >
            <div className="space-y-1 min-w-0">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor}`}>
                {item.badge}
              </span>
              <p className="text-xs font-medium text-slate-800 group-hover:text-indigo-900 leading-snug line-clamp-2">
                {item.question}
              </p>
            </div>
            {item.isWarningTest ? (
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-1" />
            ) : (
              <HelpCircle className="w-3.5 h-3.5 text-amber-500 group-hover:text-indigo-600 shrink-0 mt-1" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
