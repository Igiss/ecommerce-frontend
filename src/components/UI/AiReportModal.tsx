import { X, Sparkles, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface AiReportModalProps {
  isOpen: boolean
  onClose: () => void
  report: string
  loading: boolean
}

export function AiReportModal({ isOpen, onClose, report, loading }: AiReportModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-600" />
            <h3 className="font-black text-amber-900">Báo cáo Phân tích AI</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5 transition-colors">
            <X className="h-5 w-5 text-stone-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-stone-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-amber-600 mb-4" />
              <p className="text-sm font-bold text-stone-600 animate-pulse">AI đang phân tích dữ liệu bán hàng...</p>
              <p className="text-xs text-stone-400 mt-2">Quá trình này có thể mất vài giây</p>
            </div>
          ) : report ? (
            <div className="prose prose-sm md:prose-base prose-amber max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {report}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-20 text-stone-500">
              Không có dữ liệu báo cáo.
            </div>
          )}
        </div>

        <div className="p-4 border-t border-stone-100 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold text-sm bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
