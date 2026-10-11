import React, { useState, useRef } from 'react';
import { X, FileText, Upload, RefreshCw, ShieldCheck, CheckCircle2, AlertCircle, FileCode } from 'lucide-react';
import { DocumentInfo } from '../types.ts';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentInfo: DocumentInfo | null;
  onDocumentUpdated: (doc: DocumentInfo) => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  documentInfo,
  onDocumentUpdated,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsUploading(true);

    try {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const base64String = (reader.result as string).split(',')[1];
          const response = await fetch('/api/upload-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              base64Content: base64String,
            }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Lỗi tải tệp lên server.');
          }

          setSuccessMsg(`Đã nạp thành công: ${data.documentInfo.filename} (${data.documentInfo.charCount.toLocaleString()} ký tự). Trợ lý AI sẽ dùng ngữ liệu này!`);
          onDocumentUpdated({
            filename: data.documentInfo.filename,
            title: data.documentInfo.filename,
            totalLessons: 10,
            isCustom: true,
            uploadedAt: data.documentInfo.uploadedAt,
            charCount: data.documentInfo.charCount,
          });
        } catch (err: any) {
          setErrorMsg(err.message || 'Không thể xử lý tệp tin.');
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setErrorMsg('Không thể đọc tệp từ thiết bị.');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi tải tệp.');
      setIsUploading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleResetDefault = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsUploading(true);

    try {
      const response = await fetch('/api/reset-document', {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Không thể khôi phục tài liệu gốc.');
      }
      setSuccessMsg('Đã khôi phục tài liệu chuẩn TL NGU VAN 6.docx (Bài 1 đến Bài 10).');
      onDocumentUpdated({
        filename: data.documentInfo.filename,
        title: 'Tài liệu chuẩn Ngữ văn 6',
        totalLessons: 10,
        isCustom: false,
        charCount: data.documentInfo.charCount,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khôi phục.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Tài liệu Ngữ liệu: 113 Trang Chuẩn (Bài 1 - Bài 10)
              </h2>
              <p className="text-xs text-slate-500">
                Nguồn kiến thức duy nhất để Cô Minh Ngọc AI trích xuất và giải đáp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Active Document Status */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">
                    {documentInfo?.filename || 'TL NGU VAN 6.docx'}
                  </span>
                  {documentInfo?.isCustom ? (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-600 text-white">
                      Tệp tùy chỉnh
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      Mặc định hệ thống
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Dung lượng ngữ liệu: {documentInfo?.charCount.toLocaleString() || '15,000+'} ký tự • Bao quát Bài 1 đến Bài 10, Tiếng Việt và Bộ Đề kiểm tra.
                </p>
              </div>
            </div>
            {documentInfo?.isCustom && (
              <button
                onClick={handleResetDefault}
                disabled={isUploading}
                title="Khôi phục tệp TL NGU VAN 6.docx mặc định"
                className="text-xs font-medium text-amber-800 hover:text-amber-900 underline flex items-center gap-1 shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                Đặt lại gốc
              </button>
            )}
          </div>

          {/* Golden Rules Summary */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-900 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-blue-950">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Nguyên tắc vàng bảo thủ dữ liệu:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>Chỉ trích xuất 100% nội dung từ tài liệu môn học này.</li>
              <li>Tuyệt đối không suy diễn, không tự bổ sung kiến thức ngoài tài liệu.</li>
              <li>Nếu câu hỏi nằm ngoài tài liệu, trợ lý sẽ lịch sự từ chối theo mẫu chuẩn quy định.</li>
            </ul>
          </div>

          {/* Upload New Document Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Nạp tệp tài liệu mới (định dạng .docx hoặc .txt):
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50/30 rounded-xl p-6 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.txt,.md"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <p className="font-medium text-slate-700 text-sm">
                Kéo thả tệp <code className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded">TL NGU VAN 6.docx</code> vào đây
              </p>
              <p className="text-xs text-slate-400 mt-1">hoặc nhấn để chọn tệp từ máy tính</p>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
