import React, { useRef, useState } from 'react';
import { X, Download, Upload, ZoomIn, CheckCircle2, AlertCircle, Sparkles, User, RefreshCw } from 'lucide-react';

interface PhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarVersion?: number;
  onAvatarUpdated?: () => void;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  isOpen,
  onClose,
  avatarVersion = Date.now(),
  onAvatarUpdated,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const imageUrl = `/images/co_ngoc_avatar.jpg?v=${avatarVersion}`;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const res = await fetch('/api/upload-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Image: base64Data, filename: file.name }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Không thể lưu ảnh đại diện.');
        }

        setStatusMessage({
          text: 'Đã cập nhật ảnh gốc thành công! Ảnh giữ nguyên bản 100% không chỉnh sửa.',
          type: 'success',
        });
        if (onAvatarUpdated) {
          onAvatarUpdated();
        }
      };

      reader.onerror = () => {
        throw new Error('Lỗi khi đọc tệp ảnh từ máy tính.');
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Lỗi tải ảnh:', err);
      setStatusMessage({
        text: err.message || 'Lỗi khi tải ảnh lên.',
        type: 'error',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-amber-200/90 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Ảnh gốc Cô Minh Ngọc ChatBot</h3>
              <p className="text-xs text-amber-100">Giữ nguyên ảnh gốc không chỉnh sửa hay cắt xén</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Portrait Container - Keep Original Aspect Ratio without Crop */}
          <div className="relative mx-auto max-w-sm rounded-2xl sm:rounded-3xl overflow-hidden ring-4 ring-amber-300/80 shadow-2xl bg-slate-100 flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Ảnh gốc Cô Minh Ngọc"
              className="w-full h-auto max-h-[58vh] object-contain block select-none"
              referrerPolicy="no-referrer"
            />
            {/* Live Status Tag */}
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 border border-white/20 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cô Minh Ngọc AI</span>
            </div>
          </div>

          {/* Description and Info */}
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3.5 text-xs text-slate-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Chân dung Cô giáo Minh Ngọc – Trợ lý Ngữ văn 6</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              Hình ảnh gốc chân dung tà áo dài tím truyền thống kết hợp nơ xanh navy thanh lịch. Ảnh được giữ nguyên 100% đường nét, tỷ lệ và màu sắc tự nhiên theo đúng tệp đính kèm của bạn.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <a
                href={imageUrl}
                download="anh_Co_Minh_Ngoc.jpg"
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Tải ảnh về máy</span>
              </a>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {isUploading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{isUploading ? 'Đang cập nhật...' : 'Cập nhật lại từ máy tính'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
