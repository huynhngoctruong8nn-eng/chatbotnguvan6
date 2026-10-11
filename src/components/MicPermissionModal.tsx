import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  AlertTriangle,
  CheckCircle2,
  X,
  ExternalLink,
  RefreshCw,
  Sliders,
  Volume2,
  HelpCircle,
  Laptop,
  Smartphone,
  Globe,
  Compass,
} from 'lucide-react';

interface MicPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted?: () => void;
}

type BrowserTab = 'chrome' | 'edge' | 'coccoc' | 'safari' | 'mobile' | 'system';

export const MicPermissionModal: React.FC<MicPermissionModalProps> = ({
  isOpen,
  onClose,
  onPermissionGranted,
}) => {
  const [activeTab, setActiveTab] = useState<BrowserTab>('chrome');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestAndRequestPermission = async () => {
    setTestStatus('testing');
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt của bạn không hỗ trợ API truy cập Micro (MediaDevices).');
      }

      // Direct user gesture request
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop tracks immediately after testing
      stream.getTracks().forEach((track) => track.stop());

      setTestStatus('success');
      setTimeout(() => {
        if (onPermissionGranted) {
          onPermissionGranted();
        }
        onClose();
      }, 1200);
    } catch (err: any) {
      console.warn('Microphone permission request error:', err);
      setTestStatus('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage(
          'Trình duyệt vẫn đang chặn quyền Micro. Bạn cần nhấp vào biểu tượng 🔒 cạnh thanh URL để đổi thành "Cho phép" (Allow).'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage(
          'Không tìm thấy thiết bị micro nào được cắm vào máy tính. Hãy kiểm tra lại tai nghe hoặc jack cắm micro.'
        );
      } else {
        setErrorMessage(`Lỗi cấp quyền micro: ${err.message || err.name}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Khắc phục: Cho phép quyền Micro trên trình duyệt</h2>
              <p className="text-xs text-amber-100 mt-0.5">
                Hướng dẫn mở khóa micro để học sinh nói câu hỏi với Cô Minh Ngọc AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
          {/* Quick Action Box */}
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <RefreshCw className={`w-5 h-5 ${testStatus === 'testing' ? 'animate-spin text-amber-600' : ''}`} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Thử cấp quyền & Kích hoạt lại Micro</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Nhấn nút bên cạnh để trình duyệt hiện lại hộp thoại hỏi quyền truy cập Micro.
                </p>
              </div>
            </div>

            <button
              onClick={handleTestAndRequestPermission}
              disabled={testStatus === 'testing'}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-medium text-xs shadow-sm hover:shadow transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>{testStatus === 'testing' ? 'Đang kích hoạt...' : 'Cấp quyền & Thử lại ngay'}</span>
            </button>
          </div>

          {/* Test Status feedback */}
          {testStatus === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Tuyệt vời!</strong> Quyền Micro đã được kích hoạt thành công. Đang mở lại tính năng nói câu hỏi...
              </span>
            </div>
          )}

          {testStatus === 'error' && errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Chưa được cấp quyền:</strong> {errorMessage}
              </div>
            </div>
          )}

          {/* Browser Selection Tabs */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              Chọn trình duyệt bạn đang sử dụng:
            </div>
            <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab('chrome')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'chrome'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Google Chrome
              </button>
              <button
                onClick={() => setActiveTab('edge')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'edge'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Microsoft Edge
              </button>
              <button
                onClick={() => setActiveTab('coccoc')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'coccoc'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Cốc Cốc
              </button>
              <button
                onClick={() => setActiveTab('safari')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'safari'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Safari (Mac / iPhone)
              </button>
              <button
                onClick={() => setActiveTab('mobile')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'mobile'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Điện thoại (Android)
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'system'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Cài đặt Windows / macOS
              </button>
            </div>
          </div>

          {/* Guide Steps per Browser */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3">
            {activeTab === 'chrome' && (
              <>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-600" />
                  Các bước mở khóa Micro trên Google Chrome:
                </h4>
                <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-700 leading-relaxed">
                  <li>
                    Nhìn lên thanh địa chỉ trang web (URL), bấm vào <strong>biểu tượng 🔒 (ổ khóa)</strong> hoặc biểu tượng <strong>Điều chỉnh thông tin trang web</strong> ở ngay bên trái tên miền trang web.
                  </li>
                  <li>
                    Trong danh sách quyền hiện ra, tìm mục <strong>Micro (Microphone)</strong>.
                  </li>
                  <li>
                    Gạt nút bật sang màu xanh hoặc đổi từ <strong>"Chặn (Block)"</strong> sang <strong>"Cho phép (Allow)"</strong>.
                  </li>
                  <li>
                    Trình duyệt sẽ hiển thị thông báo "Tải lại trang web" (Reload / F5) hoặc bạn bấm nút <strong>"Cấp quyền & Thử lại ngay"</strong> ở trên để hoàn tất.
                  </li>
                </ol>
              </>
            )}

            {activeTab === 'edge' && (
              <>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  Các bước mở khóa Micro trên Microsoft Edge:
                </h4>
                <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-700 leading-relaxed">
                  <li>
                    Nhấp vào <strong>biểu tượng 🔒 (ổ khóa)</strong> bên cạnh địa chỉ URL trên thanh địa chỉ.
                  </li>
                  <li>
                    Nhấp vào mục <strong>Quyền đối với trang web này (Permissions for this site)</strong>.
                  </li>
                  <li>
                    Tại dòng <strong>Microphone</strong>, đổi menu chọn sang <strong>Cho phép (Allow)</strong>.
                  </li>
                  <li>
                    Nhấn phím <strong>F5</strong> tải lại trang web và nhấn lại biểu tượng Micro để nói câu hỏi.
                  </li>
                </ol>
              </>
            )}

            {activeTab === 'coccoc' && (
              <>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  Các bước mở khóa Micro trên Cốc Cốc:
                </h4>
                <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-700 leading-relaxed">
                  <li>
                    Bấm vào <strong>biểu tượng ổ khóa hoặc icon cài đặt</strong> ở đầu thanh địa chỉ.
                  </li>
                  <li>
                    Chọn <strong>Cài đặt trang web</strong>.
                  </li>
                  <li>
                    Tìm mục <strong>Micrô</strong> và chuyển sang trạng thái <strong>Cho phép</strong>.
                  </li>
                  <li>
                    Quay lại ứng dụng và nhấn nút <strong>"Cấp quyền & Thử lại ngay"</strong>.
                  </li>
                </ol>
              </>
            )}

            {activeTab === 'safari' && (
              <>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-600" />
                  Các bước mở khóa Micro trên Safari (Mac & iPhone/iPad):
                </h4>
                <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-700 leading-relaxed">
                  <li>
                    <strong>Trên Mac:</strong> Vào thanh Menu trên cùng &gt; <strong>Safari</strong> &gt; <strong>Cài đặt cho trang web này (Settings for This Website)</strong> &gt; Tại mục <strong>Microphone</strong>, chọn <strong>Allow (Cho phép)</strong>.
                  </li>
                  <li>
                    <strong>Trên iPhone/iPad:</strong> Mở <strong>Cài đặt (Settings) máy</strong> &gt; kéo xuống chọn <strong>Safari</strong> &gt; cuộn xuống mục <strong>Microphone (Micrô)</strong> &gt; chọn <strong>Cho phép (Allow)</strong> hoặc <strong>Hỏi (Ask)</strong>.
                  </li>
                  <li>
                    Tải lại trang web và cấp quyền khi Safari hỏi.
                  </li>
                </ol>
              </>
            )}

            {activeTab === 'mobile' && (
              <>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-violet-600" />
                  Các bước trên điện thoại Chrome Android:
                </h4>
                <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-700 leading-relaxed">
                  <li>
                    Nhấn vào <strong>biểu tượng 🔒 (ổ khóa)</strong> hoặc dấu ba chấm góc trên bên phải &gt; chọn biểu tượng <strong>Cài đặt (i)</strong>.
                  </li>
                  <li>
                    Nhấn vào <strong>Quyền (Permissions)</strong> &gt; chọn <strong>Micrô</strong> &gt; chọn <strong>Cho phép khi dùng ứng dụng</strong>.
                  </li>
                  <li>
                    Nếu ứng dụng Chrome chưa được cấp quyền micro trên máy: Vào <strong>Cài đặt điện thoại &gt; Ứng dụng &gt; Chrome &gt; Quyền &gt; Micro &gt; Cho phép</strong>.
                  </li>
                </ol>
              </>
            )}

            {activeTab === 'system' && (
              <>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-slate-700" />
                  Kiểm tra quyền Micro trong Cài đặt Hệ điều hành (Windows / macOS):
                </h4>
                <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                  <p>
                    <strong>Trên Windows 10/11:</strong>
                    <br />
                    Vào <em>Start &gt; Settings &gt; Privacy & security &gt; Microphone</em>. Đảm bảo bật:
                    <br />
                    • <strong>Microphone access</strong>: Bật (On)
                    <br />
                    • <strong>Let desktop apps access your microphone</strong>: Bật (On)
                  </p>
                  <p className="pt-1">
                    <strong>Trên macOS (MacBook, iMac):</strong>
                    <br />
                    Vào <em>System Settings (Cài đặt hệ thống) &gt; Privacy & Security (Quyền riêng tư & Bảo mật) &gt; Microphone</em> &gt; tích chọn cho phép trình duyệt của bạn (Google Chrome, Edge, Safari).
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Helpful Note */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              💡 <strong>Mẹo nhỏ:</strong> Nếu đang ở phòng yên tĩnh hoặc dùng máy bàn không có micro, em vẫn có thể nhập câu hỏi bằng bàn phím hoặc chọn nhanh các câu hỏi gợi ý bên dưới ô chat!
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Hỗ trợ Web Speech API tiếng Việt chuẩn Google Chrome & Edge
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
