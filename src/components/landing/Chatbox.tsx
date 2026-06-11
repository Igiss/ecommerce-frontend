'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageSquare,
  Bot,
  Sparkles,
  X,
  Send,
  RotateCcw,
  ShoppingCart,
  Loader
} from 'lucide-react'
import { sendChatMessage, type ChatMessage } from '@/lib/api/chat.service'
import { getProducts } from '@/lib/api/products.service'
import { useCartStore } from '@/store/cart.store'
import type { Product } from '@/types/product'

const QUICK_PROMPTS = [
  'Tìm cốc sứ đẹp',
  'Ly giữ nhiệt giá bao nhiêu?',
  'Có cốc thủy tinh không?',
  'Làm thế nào để tự thiết kế cốc?'
]

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: 'Xin chào! Mình là trợ lý ảo của Cup Store. Bạn cần tìm kiếm cốc, ly giữ nhiệt hay muốn tự thiết kế sản phẩm của riêng mình? Hãy hỏi mình nhé! 😊'
}

export function Chatbox() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<ChatMessage & { products?: any[] }>>([WELCOME_MESSAGE])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const addItem = useCartStore((state) => state.addItem)

  // Fetch all products once to map modelUrls & other details for recommendations
  useEffect(() => {
    getProducts()
      .then((data: any) => {
        let list: Product[] = []
        if (Array.isArray(data)) {
          list = data
        } else if (data && typeof data === 'object') {
          if ('items' in data && Array.isArray(data.items)) {
            list = data.items
          } else if ('products' in data && Array.isArray(data.products)) {
            list = data.products
          }
        }
        const normalized = list.map((item: any) => ({
          ...item,
          id: item.id || item._id
        }))
        setAllProducts(normalized)
      })
      .catch((err) => console.error('Failed to load products list for chat assistant:', err))
  }, [])

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading])

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return

    const userMsg = textToSend.trim()
    setInputText('')
    setLoading(true)

    // Add user message to state
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }]
    setMessages(newMessages)

    try {
      // Map messages history to API DTO
      const apiHistory = newMessages.map(m => ({
        role: m.role,
        content: m.content
      }))

      const response = await sendChatMessage({ messages: apiHistory })
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.reply || 'Mình chưa hiểu ý bạn lắm. Bạn có thể hỏi lại không?',
          products: response.products
        }
      ])
    } catch (error: any) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: error.message || 'Rất tiếc, hệ thống đang bận. Bạn vui lòng thử lại sau.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch sử chat không?')) {
      setMessages([WELCOME_MESSAGE])
    }
  }

  const handleAddToCart = (chatProduct: any) => {
    const fullProduct = allProducts.find(
      (p) => String(p.id) === String(chatProduct.id)
    )

    const productToAdd: Product = fullProduct || {
      id: String(chatProduct.id),
      name: chatProduct.name,
      description: chatProduct.description || '',
      price: chatProduct.price,
      modelUrl: chatProduct.modelUrl
    }

    addItem(productToAdd, 1)
    alert(`Đã thêm ${productToAdd.name} vào giỏ hàng!`)
  }

  const handleCustomize = (chatProduct: any) => {
    setIsOpen(false) // Close chatbox when customizer opens
    router.push(`/?customize=${chatProduct.id}`)
  }

  return (
    <>
      {/* Floating Button Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-700 to-amber-900 text-white shadow-lg shadow-amber-950/20 hover:scale-105 hover:from-amber-850 hover:to-stone-950 transition-all duration-300 focus:outline-none"
        title="Trợ lý ảo AI"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6" />
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold ring-2 ring-stone-900 animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat Window Popup */}
      <div
        className={`fixed bottom-24 right-6 z-50 flex w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-8rem)] flex-col rounded-2xl border border-stone-200/80 bg-white/95 backdrop-blur-md shadow-2xl transition-all duration-300 origin-bottom-right ${
          isOpen
            ? 'scale-100 opacity-100 pointer-events-auto'
            : 'scale-90 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-gradient-to-r from-amber-800 to-stone-900 p-4 rounded-t-2xl text-white">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-800 shadow-inner">
              <Bot className="h-5 w-5" />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-amber-800" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">Trợ Lý AI Shop</h3>
              <p className="text-[10px] text-amber-100 flex items-center gap-1">
                <Sparkles className="h-3 w-3 animate-pulse text-amber-300" />
                Đang trực tuyến
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              className="rounded-lg p-1.5 hover:bg-white/10 transition-colors text-white/80 hover:text-white cursor-pointer"
              title="Làm mới chat"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 hover:bg-white/10 transition-colors text-white/80 hover:text-white cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
          {messages.map((msg, idx) => {
            const isBot = msg.role === 'assistant'
            return (
              <div key={idx} className="space-y-2">
                <div className={`flex items-start gap-2.5 ${!isBot ? 'justify-end' : 'justify-start'}`}>
                  {isBot && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 border border-stone-200/50 text-amber-800 text-xs">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`text-xs sm:text-sm leading-relaxed p-3 shadow-sm ${
                      isBot
                        ? 'bg-stone-100/90 text-stone-800 rounded-2xl rounded-tl-none border border-stone-200/50 max-w-[82%]'
                        : 'bg-amber-800 text-white rounded-2xl rounded-tr-none max-w-[82%]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>

                {/* Display Product Recommendations if any */}
                {isBot && msg.products && msg.products.length > 0 && (
                  <div className="ml-10 flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-amber-200">
                    {msg.products.map((p) => {
                      const localMatch = allProducts.find((lp) => String(lp.id) === String(p.id))
                      const hasModel = !!(localMatch?.modelUrl || p.modelUrl)
                      const pImg = p.images?.[0] || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300'

                      return (
                        <div
                          key={p.id}
                          className="w-[145px] shrink-0 rounded-xl border border-stone-200/80 bg-white p-2.5 shadow-sm hover:border-amber-600/30 transition-all flex flex-col justify-between"
                        >
                          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-stone-50">
                            <img
                              src={pImg}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                            {hasModel && (
                              <span className="absolute top-1 right-1 flex items-center gap-0.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[8px] font-bold text-white">
                                <Sparkles className="h-2 w-2" />
                                3D
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex-grow">
                            <h4 className="text-[11px] font-bold text-stone-900 line-clamp-1">
                              {p.name}
                            </h4>
                            <p className="text-[11px] font-extrabold text-amber-850 mt-0.5">
                              {p.price.toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                          
                          <div className="mt-2.5 flex flex-col gap-1">
                            <button
                              onClick={() => handleAddToCart(p)}
                              className="flex w-full items-center justify-center gap-1 rounded-md bg-stone-100 hover:bg-amber-50 hover:text-amber-800 text-[10px] font-bold text-stone-700 py-1 border border-stone-200/60 transition-colors cursor-pointer"
                            >
                              <ShoppingCart className="h-3 w-3" />
                              Thêm giỏ
                            </button>
                            {hasModel && (
                              <button
                                onClick={() => handleCustomize(p)}
                                className="w-full text-center rounded-md bg-amber-800 hover:bg-amber-900 text-[10px] font-bold text-white py-1 transition-colors cursor-pointer"
                              >
                                Tự thiết kế
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 border border-stone-200/50 text-amber-800 text-xs">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-stone-100/90 text-stone-500 rounded-2xl rounded-tl-none border border-stone-200/50 px-4 py-3 shadow-sm flex items-center gap-1">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-500 [animation-delay:-0.3s]" />
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-500 [animation-delay:-0.15s]" />
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {messages.length === 1 && !loading && (
          <div className="px-4 py-2 bg-stone-50/50 border-t border-stone-150">
            <p className="text-[10px] text-stone-500 font-semibold mb-1">Gợi ý câu hỏi:</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[10px] text-stone-600 transition-colors hover:border-amber-700 hover:bg-amber-50 hover:text-amber-800 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend(inputText)
          }}
          className="flex items-center gap-2 border-t border-stone-200 bg-white/70 p-3 rounded-b-2xl"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Hỏi về sản phẩm, thiết kế 3D..."
            className="flex-1 rounded-xl border border-stone-300 bg-stone-50/50 px-3 py-2 text-xs sm:text-sm focus:border-amber-700 focus:bg-white focus:outline-none transition-all text-stone-850"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-800 text-white transition-colors hover:bg-amber-900 disabled:bg-stone-200 disabled:text-stone-400 focus:outline-none cursor-pointer"
          >
            {loading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </>
  )
}
