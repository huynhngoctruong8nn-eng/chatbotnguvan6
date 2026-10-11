import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Loader2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Unlock,
} from 'lucide-react';
import { MicPermissionModal } from './MicPermissionModal.tsx';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onOpenFileModal: () => void;
  inputPlaceholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onOpenFileModal,
  inputPlaceholder = 'Nhập hoặc nói câu hỏi Ngữ văn 6 (ví dụ: Bài học đường đời đầu tiên là gì?)...',
}) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [listeningDuration, setListeningDuration] = useState(0);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Initialize Speech Recognition
  const initRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalChunk += item[0].transcript;
          } else {
            interimChunk += item[0].transcript;
          }
        }

        const toAdd = (finalChunk || interimChunk).trim();
        if (toAdd) {
          setText((prev) => {
            const trimmedPrev = prev.trim();
            if (!trimmedPrev) return toAdd;
            // Prevent exact duplicate immediate appending
            if (trimmedPrev.endsWith(toAdd)) return prev;
            return `${trimmedPrev} ${toAdd}`;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        clearInterval(timerRef.current);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechError(
            'Quyền truy cập micro bị từ chối. Vui lòng cho phép quyền micro trên trình duyệt để nói câu hỏi.'
          );
          setIsPermissionModalOpen(true);
        } else if (event.error === 'audio-capture') {
          setSpeechError(
            'Không tìm thấy thiết bị micro nào được kết nối với máy tính/điện thoại của em.'
          );
        } else if (event.error === 'no-speech') {
          // Silent timeout
        } else {
          setSpeechError(`Lỗi nhận diện giọng nói: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        clearInterval(timerRef.current);
      };

      return recognition;
    } catch (err) {
      console.warn('Không thể khởi tạo Web Speech API:', err);
      return null;
    }
  };

  useEffect(() => {
    recognitionRef.current = initRecognition();

    return () => {
      clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }

    if (!recognitionRef.current) {
      setSpeechError(
        'Trình duyệt này chưa hỗ trợ nhận diện giọng nói tiếng Việt (Web Speech API). Hãy dùng Google Chrome hoặc Microsoft Edge!'
      );
      return;
    }

    try {
      setListeningDuration(0);
      recognitionRef.current.start();
      setIsListening(true);
      timerRef.current = setInterval(() => {
        setListeningDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Lỗi khởi động nhận diện giọng nói:', err);
      setIsListening(false);
      clearInterval(timerRef.current);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
    clearInterval(timerRef.current);
  };

  const toggleListening = async () => {
    setSpeechError(null);

    // If currently listening, stop it
    if (isListening) {
      stopListening();
      return;
    }

    // Check if Web Speech API is supported
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError(
        'Trình duyệt chưa hỗ trợ Web Speech API nhận diện giọng nói tiếng Việt. Hãy dùng Chrome hoặc Edge mới nhất!'
      );
      return;
    }

    // Proactively check browser permissions API if available
    if (navigator.permissions && (navigator.permissions as any).query) {
      try {
        const permissionStatus = await (navigator.permissions as any).query({ name: 'microphone' });
        if (permissionStatus.state === 'denied') {
          setSpeechError(
            'Quyền truy cập micro bị từ chối. Vui lòng cho phép quyền micro trên trình duyệt để nói câu hỏi.'
          );
          setIsPermissionModalOpen(true);
          return;
        }
      } catch (_) {
        // Ignore if query not supported for 'microphone'
      }
    }

    // Request audio stream via getUserMedia on user gesture
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediate cleanup of tracks once permission is verified
        stream.getTracks().forEach((track) => track.stop());
        startListening();
      } catch (err: any) {
        console.warn('getUserMedia error:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setSpeechError(
            'Quyền truy cập micro bị từ chối. Vui lòng cho phép quyền micro trên trình duyệt để nói câu hỏi.'
          );
          setIsPermissionModalOpen(true);
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setSpeechError('Không tìm thấy thiết bị micro nào được cắm vào máy tính.');
        } else {
          // If getUserMedia fails for other reasons, try startListening directly
          startListening();
        }
      }
    } else {
      startListening();
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    if (isListening) {
      stopListening();
    }

    onSendMessage(trimmed);
    setText('');
    setSpeechError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto px-4 py-3 bg-white/95 backdrop-blur-md border-t border-amber-200/60 shadow-lg">
        {/* Listening Banner */}
        {isListening && (
          <div className="mb-2 p-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <span className="font-semibold">
                🎙️ Cô Minh Ngọc đang lắng nghe em nói ({listeningDuration}s)...
              </span>
              <span className="hidden sm:inline text-rose-100 text-[11px]">
                (Nói câu hỏi Ngữ văn 6, chữ sẽ xuất hiện ngay trong ô nhập)
              </span>
            </div>
            <button
              type="button"
              onClick={stopListening}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium text-[11px] transition-colors cursor-pointer"
            >
              Dừng nói
            </button>
          </div>
        )}

        {/* Speech Error Banner with Quick Fix Actions */}
        {speechError && (
          <div className="mb-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs shadow-xs animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold">{speechError}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsPermissionModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Xem hướng dẫn mở khóa Micro 🔒</span>
                </button>
                <button
                  type="button"
                  onClick={toggleListening}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                  title="Thử lại quyền micro"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Thử lại</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechError(null)}
                  className="text-[11px] text-rose-500 hover:text-rose-700 font-medium px-1"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Input Box */}
        <div className="relative flex items-end gap-2 bg-slate-50 border border-amber-200/80 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100 rounded-2xl p-2 transition-all shadow-xs">
          {/* Attachment / Docx Button */}
          <button
            type="button"
            onClick={onOpenFileModal}
            title="Nạp hoặc quản lý tệp tài liệu Ngữ văn 6"
            className="p-2 text-slate-400 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? '🎙️ Đang nghe em nói, hãy đặt câu hỏi...' : inputPlaceholder}
            disabled={isLoading}
            rows={1}
            className="flex-1 max-h-32 min-h-[24px] resize-none bg-transparent py-1 px-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden leading-relaxed"
          />

          {/* Speech Dictation Button (Microphone) */}
          <button
            type="button"
            onClick={toggleListening}
            title={
              isListening
                ? 'Dừng thu âm giọng nói'
                : '🎙️ Nhấn để nói câu hỏi bằng giọng nói (Tiếng Việt)'
            }
            className={`p-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md ring-2 ring-rose-200'
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/70'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span className="text-[11px] font-bold hidden sm:inline">Đang nghe</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-amber-600" />
                <span className="text-[11px] font-semibold text-amber-800 hidden md:inline">Giọng nói</span>
              </>
            )}
          </button>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || isLoading}
            title="Gửi câu hỏi cho Cô Minh Ngọc AI"
            className={`p-2 rounded-xl transition-all shrink-0 cursor-pointer ${
              text.trim() && !isLoading
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-sm scale-100 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Sub-label & Quick Guide Trigger */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-2 mt-1.5">
          <span className="truncate flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
            <span>Hỏi đáp chuẩn 113 trang SGK Bài 1 – 10 • Có giọng nói tiếng Anh & Xuất Word</span>
          </span>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsPermissionModalOpen(true)}
              className="text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Hướng dẫn cấp quyền Micro</span>
            </button>
            <span className="hidden sm:inline text-slate-400">• Enter để gửi</span>
          </div>
        </div>
      </div>

      {/* Microphone Permission Guide Modal */}
      <MicPermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onPermissionGranted={() => {
          setSpeechError(null);
          startListening();
        }}
      />
    </>
  );
};
