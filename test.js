import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  ChevronDown,
  ChevronLeft,
  LayoutGrid,
  ArrowLeft,
  Bookmark,
  Star,
  MessageCircle,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/ui.store'
import { clarifyService } from '@/features/chat'
import { ShareButton } from '@/features/chat/components/ShareButton'
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { useChatStore } from '@/store/chat.store'
import { ROUTES } from '@/constants/routes'
import { useUiLanguage } from '@/contexts/TranslationContext'


function clarifyShareUrl(cardId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/share/${cardId}`
}

/* ────────────────────────────────────────────────────────────────────────
 * Clarify — quick-answer cards that flip between a question (front) and its
 * answer (back). Built from the Figma design; content comes from the backend
 * (clarifyService.list, managed via the Admin Dashboard). No demo/mock cards —
 * when the API returns nothing the page shows its empty state.
 * 
 * MODIFIED: Detail view uses vertical snap scroll (Instagram Reels style).
 * Full-screen cards, swipe up/down to navigate, action buttons on right side.
 * ──────────────────────────────────────────────────────────────────────── */

/* erasableSyntaxOnly: union type instead of a TS enum. */
type CategoryId =
  | 'welfare'
  | 'elections'
  | 'identity'
  | 'sovereignty'
  | 'legislation'
  | 'governance'
  | 'justice'
  | 'execution'
  | 'finance'
  | 'rights'

interface Category {
  id: CategoryId
  label: string
  /** Solid brand color — front card fill + the back-face tag. */
  color: string
  /** Light tint — used for the filter pill. */
  tint: string
  /** Category illustration (served from public/). */
  image: string
}

const CDN = 'https://res.cloudinary.com/jzbsiqig/image/upload/f_auto,q_auto/clarify/categories'

const CATEGORIES: Category[] = [
  { id: 'welfare', label: 'Welfare', color: '#5057a6', tint: '#cedeff', image: `${CDN}/welfare.png` },
  { id: 'elections', label: 'Elections', color: '#165ab3', tint: '#b7e9ff', image: `${CDN}/elections.png` },
  { id: 'identity', label: 'Identity', color: '#b1892a', tint: '#f0e1ae', image: `${CDN}/identity.png` },
  { id: 'sovereignty', label: 'Sovereignty', color: '#00809d', tint: '#a2eaec', image: `${CDN}/sovereignty.png` },
  { id: 'legislation', label: 'Legislation', color: '#9f6b3e', tint: '#e3d8cf', image: `${CDN}/legislation.png` },
  { id: 'governance', label: 'Governance', color: '#348c72', tint: '#b3efdd', image: `${CDN}/governance.png` },
  { id: 'justice', label: 'Justice', color: '#d06a26', tint: '#ffc5a4', image: `${CDN}/justice.png` },
  { id: 'execution', label: 'Execution', color: '#984755', tint: '#ffbbbc', image: `${CDN}/executive.png` },
  { id: 'finance', label: 'Finance', color: '#ac5eac', tint: '#f5ddff', image: `${CDN}/finance.png` },
  { id: 'rights', label: 'Rights', color: '#808E50', tint: '#E7EFCC', image: `${CDN}/executive.png` },
]

const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>

interface ClarifyCardData {
  id: string
  categoryId: CategoryId
  question: string
  answer: string
  likes: number
  liked: boolean
  /** Card height (px) — drives the staggered masonry layout, mirroring Figma. */
  height: number
}

/** Open-book glyph from Figma (node Group 7333) — the flip affordance. */
function FlipIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 26.7803 38.0565"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M11.276 0L11.276 38.0565" stroke="currentColor" strokeWidth="3.6" />
      <path
        d="M23.6738 2.15316C25.2579 1.77419 26.7801 2.97461 26.7803 4.60335V33.3455C26.7803 35.0078 25.1991 36.2146 23.5957 35.7762L15.5049 33.5633V4.10726L23.6738 2.15316ZM12.6855 32.7928L1.85547 29.8319C0.759915 29.5323 0 28.537 0 27.4012V9.80452C8.3643e-05 8.63877 0.799855 7.62565 1.93359 7.35433L12.6855 4.78109V32.7928Z"
        fill="currentColor"
      />
    </svg>
  )
}

interface ClarifyCardProps {
  card: ClarifyCardData
  liked: boolean
  likeCount: number
  onToggleLike: () => void
  /** Open the full-screen detail / carousel view for this card. */
  onOpen: () => void
}

/**
 * A single Clarify card. Click the flip button (open-book glyph) to flip
 * between the question face and the answer face with a 3D rotateY animation.
 */
function ClarifyCard({ card, liked, likeCount, onToggleLike, onOpen }: ClarifyCardProps) {
  const [flipped, setFlipped] = useState(false)
  const category = CATEGORY_BY_ID[card.categoryId]

  return (
    <div
      className="mb-5 cursor-pointer break-inside-avoid [perspective:1600px]"
      style={{ height: card.height }}
      onClick={onOpen}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── FRONT: question ─────────────────────────────────────────── */}
        {/* pointer-events toggles so only the visible face is clickable —
            otherwise the away-facing face still intercepts clicks. */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[40px] [backface-visibility:hidden]"
          style={{ backgroundColor: category.color, pointerEvents: flipped ? 'none' : 'auto' }}
        >
          {/* Illustration fills the card and is anchored to the bottom edge,
              bleeding to the rounded corners — matching the Figma cards. */}
          <img
            src={category.image}
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-0 h-auto w-5/4 object-contain object-right-bottom opacity-95"
          />
          <div className="relative z-[1] flex h-full flex-col justify-between p-5 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <span className="inline-flex rounded-[7px] border-[1.5px] border-white/25 px-2.5 py-1 text-[13px] font-semibold text-[#d7f7ff] sm:px-3 sm:text-[15px]">
                {category.label}
              </span>
              <p data-no-translate className="font-chip text-[25px] leading-[1.12] text-[#d7f7ff] sm:text-[25px]">{card.question}</p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setFlipped(true)
                }}
                aria-label="Flip card to read the answer"
                className="text-[#d7f7ff] transition-transform hover:scale-110 active:scale-95"
              >
                <FlipIcon className="h-8 w-auto drop-shadow-sm sm:h-9" />
              </button>
            </div>
          </div>
        </div>

        {/* ── BACK: answer ────────────────────────────────────────────── */}
        <div
          className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[40px] border-[0.5px] border-cvq-green-solid bg-[#d7f7ff] p-5 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-6"
          style={{ pointerEvents: flipped ? 'auto' : 'none' }}
        >
          <div className="min-h-0 space-y-3 overflow-hidden">
            <span
              className="inline-flex rounded-[7px] px-2.5 py-1 text-[13px] font-semibold text-[#d7f7ff] sm:px-3 sm:text-[15px]"
              style={{ backgroundColor: category.color }}
            >
              {category.label}
            </span>
            <p className="text-[18px] leading-[1.4] text-cvq-ink sm:text-[18px]">
              <span data-no-translate>{card.answer}</span>{' '}
              <button type="button" className="font-semibold underline-offset-2 hover:underline">
                Read more
              </button>
            </p>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleLike()
              }}
              aria-pressed={liked}
              aria-label={liked ? 'Unlike' : 'Like'}
              className="flex items-center gap-2 text-cvq-ink transition-transform hover:scale-105 active:scale-95"
            >
              <Star className={cn('h-5 w-5 sm:h-6 sm:w-6', liked ? 'text-cvq-ink fill-cvq-ink' : 'fill-transparent')} />
              <span className="text-[15px] sm:text-[18px]">{likeCount}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setFlipped(false)
              }}
              aria-label="Flip card back to the question"
              className="text-cvq-ink transition-transform hover:scale-110 active:scale-95"
            >
              <FlipIcon className="h-8 w-auto -scale-x-100 sm:h-9" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/** True below the `lg` breakpoint — i.e. mobile/tablet, where swipe is enabled. */
function useIsTouchViewport() {
  const [match, setMatch] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1023px)')
    const sync = () => setMatch(mql.matches)
    sync()
    mql.addEventListener('change', sync)
    return () => mql.removeEventListener('change', sync)
  }, [])
  return match
}

/* ═══════════════════════════════════════════════════════════════════════
 * SINGLE CARD DETAIL VIEW — VERTICAL SNAP SCROLL (Instagram Reels style)
 * Full-screen cards, swipe up/down to navigate, action buttons on right,
 * content overlaid at the bottom with gradient.
 * ═══════════════════════════════════════════════════════════════════════ */

interface ClarifyDetailProps {
  card: ClarifyCardData
  liked: boolean
  likeCount: number
  prevCard: ClarifyCardData | null
  nextCard: ClarifyCardData | null
  allCards: ClarifyCardData[]
  activeIndex: number
  sidebarCollapsed: boolean
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onToggleLike: () => void
  onToggleSave: (id: string) => void
  onSetActiveId: (id: string) => void
  likedIds: Set<string>
  savedIds: Set<string>
  getLikeCount: (card: ClarifyCardData) => number
  onShuffle: () => void
}

/** Renders a single card's inner content (used by both mobile scroll and desktop animated views). */
function ClarifyCardContent({
  c,
  onSetActiveId,
  onToggleLike,
  onToggleSave,
  askAi,
  likedIds,
  savedIds,
  getLikeCount,
}: {
  c: ClarifyCardData
  onSetActiveId: (id: string) => void
  onToggleLike: () => void
  onToggleSave: (id: string) => void
  askAi: (q: string) => void
  likedIds: Set<string>
  savedIds: Set<string>
  getLikeCount: (card: ClarifyCardData) => number
}) {
  const cardCategory = CATEGORY_BY_ID[c.categoryId]
  const cardLiked = likedIds.has(c.id)
  const cardSaved = savedIds.has(c.id)
  const cardLikeCount = getLikeCount(c)

  return (
    <div
      className="relative w-full h-full sm:w-[min(400px,90vw)] sm:h-[min(720px,92vh)] sm:rounded-3xl overflow-hidden"
      style={{ backgroundColor: cardCategory.color }}
    >
      <img
        src={cardCategory.image}
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-auto w-5/4 object-contain object-right-bottom opacity-95"
      />

      <div className="relative z-[1] flex h-full flex-col justify-between p-4 sm:p-5 lg:p-6">
        <div className="flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5 font-display text-[14px] sm:text-[16px] font-semibold text-[#d7f7ff]">
            <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium">Ask</span>
            Civiqli
          </span>
          <span className="inline-flex rounded-[10px] border-[1.5px] border-white/25 px-2 sm:px-3 py-1 text-[11px] sm:text-[12px] font-medium text-[#d7f7ff]">
            {cardCategory.label}
          </span>
        </div>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden mt-4 sm:mt-6 relative">
          <div className="pr-14 sm:pr-16">
            <h2 data-no-translate className="font-chip text-[30px] sm:text-[22px] lg:text-[25px] leading-[1.08] text-[#d7f7ff]">
              {c.question}
            </h2>
            <p data-no-translate className="mt-3 sm:mt-4 text-[20px] sm:text-[16px] lg:text-[18px] leading-relaxed text-[#d7f7ff]/90">
              {c.answer}
            </p>
          </div>

          <div className="absolute bottom-0 right-0 flex flex-col items-center gap-3 sm:gap-4 py-1">
            <button
              className="flex flex-col items-center gap-0.5 group"
              onClick={() => { onSetActiveId(c.id); onToggleLike() }}
            >
              <div className={cn(
                'w-9 h-9 sm:w-10 sm:h-10 shrink-0 aspect-square rounded-full flex items-center justify-center transition-all',
                cardLiked ? 'bg-white' : 'bg-white/10 group-hover:bg-white/20 group-active:scale-90',
              )}>
                <Star className={cn('w-4 h-4 sm:w-5 sm:h-5 transition-colors', cardLiked ? 'text-[#1a5f4a] fill-[#1a5f4a]' : 'text-white')} />
              </div>
              <span className="text-white text-[10px] sm:text-[11px] font-medium">{cardLikeCount}</span>
            </button>

            <button
              className="flex flex-col items-center gap-0.5 group"
              onClick={() => { onSetActiveId(c.id); onToggleSave(c.id) }}
            >
              <div className={cn(
                'w-9 h-9 sm:w-10 sm:h-10 shrink-0 aspect-square rounded-full flex items-center justify-center transition-all',
                cardSaved ? 'bg-white' : 'bg-white/10 group-hover:bg-white/20 group-active:scale-90',
              )}>
                <Bookmark className={cn('w-4 h-4 sm:w-5 sm:h-5 transition-colors', cardSaved ? 'text-[#1a5f4a] fill-[#1a5f4a]' : 'text-white')} />
              </div>
            </button>

            <div>
              <ShareButton title={c.question} text={c.answer} shareUrl={clarifyShareUrl(c.id)} />
            </div>

            <button
              type="button"
              onClick={() => { onSetActiveId(c.id); askAi(c.question) }}
              aria-label="Ask AI about this"
              className="flex flex-col items-center gap-0.5 group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 aspect-square rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 group-active:scale-90 transition-all">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ClarifyDetail({
  card,
  liked,
  likeCount,
  allCards,
  activeIndex,
  sidebarCollapsed,
  onClose,
  onToggleLike,
  onToggleSave,
  onSetActiveId,
  likedIds,
  savedIds,
  getLikeCount,
}: ClarifyDetailProps) {
  const navigate = useNavigate()
  const setPendingAsk = useChatStore((s) => s.setPendingAsk)
  const startNewChat = useChatStore((s) => s.newChat)
  const isMobile = useIsTouchViewport()

  const askAi = (question: string) => {
    setPendingAsk(question)
    startNewChat('ask')
    onClose()
    navigate(ROUTES.HOME)
  }

  // Desktop vertical scroll ref
  const desktopScrollRef = useRef<HTMLDivElement>(null)

  // ── Mobile: snap scroll refs & observers ──
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isMobile) return
    const container = scrollContainerRef.current
    if (!container || activeIndex < 0) return
    const target = container.children[activeIndex] as HTMLElement | undefined
    if (target) target.scrollIntoView({ block: 'nearest', inline: 'center' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile])

  useEffect(() => {
    if (!isMobile) return
    const container = scrollContainerRef.current
    if (!container) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const id = (entry.target as HTMLElement).dataset.reelId
            if (id) onSetActiveId(id)
          }
        }
      },
      { root: container, threshold: 0.6 },
    )
    Array.from(container.children).forEach((child) => observer.observe(child))
    return () => observer.disconnect()
  }, [isMobile, allCards, onSetActiveId])

  // Desktop: IntersectionObserver to track active card in vertical scroll
  useEffect(() => {
    if (isMobile) return
    const container = desktopScrollRef.current
    if (!container) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const id = (entry.target as HTMLElement).dataset.reelId
            if (id) onSetActiveId(id)
          }
        }
      },
      { root: container, threshold: 0.6 },
    )
    Array.from(container.children).forEach((child) => observer.observe(child))
    return () => observer.disconnect()
  }, [isMobile, allCards, onSetActiveId])

  // Desktop: scroll to initial card on mount
  useEffect(() => {
    if (isMobile) return
    const container = desktopScrollRef.current
    if (!container || activeIndex < 0) return
    const target = container.children[activeIndex] as HTMLElement | undefined
    if (target) target.scrollIntoView({ block: 'nearest', inline: 'center' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile])

  // Keyboard navigation — ArrowLeft/ArrowRight for both mobile and desktop (horizontal)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const container = isMobile ? scrollContainerRef.current : desktopScrollRef.current
        if (!container || activeIndex <= 0) return
        const prev = container.children[activeIndex - 1] as HTMLElement | undefined
        prev?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        const container = isMobile ? scrollContainerRef.current : desktopScrollRef.current
        if (!container || activeIndex >= allCards.length - 1) return
        const next = container.children[activeIndex + 1] as HTMLElement | undefined
        next?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, activeIndex, allCards.length, isMobile])

  // Shared card content props
  const cardProps = {
    onSetActiveId,
    onToggleLike,
    onToggleSave,
    askAi,
    likedIds,
    savedIds,
    getLikeCount,
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'fixed inset-y-0 right-0 z-[60] flex flex-col',
        sidebarCollapsed ? 'left-0 lg:left-[72px]' : 'left-0 lg:left-[272px]',
      )}
    >
      <div className="absolute inset-0 bg-black" onClick={onClose} aria-hidden />

      {/* Back button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute left-3 top-3 z-30 grid size-9 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:left-5 sm:top-5 sm:size-10"
      >
        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>


      {/* Left arrow — desktop only */}
      {!isMobile && (
        <button
          type="button"
          onClick={() => {
            const container = desktopScrollRef.current
            if (!container || activeIndex <= 0) return
            const prev = container.children[activeIndex - 1] as HTMLElement | undefined
            prev?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
          }}
          aria-label="Previous card"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Right arrow — desktop only */}
      {!isMobile && (
        <button
          type="button"
          onClick={() => {
            const container = desktopScrollRef.current
            if (!container || activeIndex >= allCards.length - 1) return
            const next = container.children[activeIndex + 1] as HTMLElement | undefined
            next?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
          }}
          aria-label="Next card"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="h-6 w-6 rotate-180" />
        </button>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MOBILE — horizontal snap scroll                               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isMobile ? (
        <div
          ref={scrollContainerRef}
          className="relative z-10 flex h-full w-full items-center overflow-x-auto overflow-y-hidden snap-x snap-mandatory overscroll-x-contain"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {allCards.map((c) => (
            <div
              key={c.id}
              data-reel-id={c.id}
              className="snap-center snap-always w-full h-full shrink-0 relative flex items-center justify-center"
            >
              <ClarifyCardContent c={c} {...cardProps} />
            </div>
          ))}
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════ */
        /* DESKTOP — horizontal snap scroll                             */
        /* ═══════════════════════════════════════════════════════════════ */
        <div
          ref={desktopScrollRef}
          className="relative z-10 flex h-full w-full items-center overflow-x-auto overflow-y-hidden snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {allCards.map((c) => (
            <div
              key={c.id}
              data-reel-id={c.id}
              className="snap-center w-full h-full shrink-0 flex items-center justify-center"
            >
              <ClarifyCardContent c={c} {...cardProps} />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

type CardFilter = 'all' | 'liked' | 'saved'

// Varied card heights for the staggered masonry layout (mirrors the Figma look).
const CARD_HEIGHTS = [300, 452, 256, 388, 312, 344]

const PENDING_SHARE_KEY = 'civiqli_pending_share_card'

export default function ClarifyPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | CategoryId>('all')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<CardFilter>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { onRequireSignUp } = useOutletContext<{ keyboardOpen: boolean; onRequireSignUp: () => void }>()

  const shareCardParam = searchParams.get('card')

  // The selected UI language (EN/HA/YO/IG/PID) — used to pick each card's text.
  const { code } = useUiLanguage()

  // Published Clarify cards from the backend (each carries all language texts).
  const { data: apiCards = [] } = useQuery({
    queryKey: ['clarify'],
    queryFn: clarifyService.list,
    staleTime: 5 * 60 * 1000,
  })

  // Resolve each card to the selected language (manual translations; falls back
  // to English when a language — e.g. Pidgin — isn't in the sheet yet). If the
  // API returns nothing, the page shows its empty state (no demo content).
  const cards = useMemo<ClarifyCardData[]>(() => {
    const mapped = apiCards.map((c, i) => {
      const categoryId = (CATEGORIES.find((cat) => cat.id === c.domain.toLowerCase())?.id ??
        'governance') as CategoryId
      const question = c.frontI18n?.[code] || c.frontI18n?.EN || c.front
      const answer = c.backI18n?.[code] || c.backI18n?.EN || c.back
      return {
        id: c.id,
        categoryId,
        question,
        answer,
        likes: c.likes,
        liked: false,
        height: CARD_HEIGHTS[i % CARD_HEIGHTS.length],
      }
    })
    if (!mapped.length) return []

    // Round-robin interleave by category so the "All" view shows a mix from every
    // category (instead of 50 Elections cards first, then 50 Legislation, …).
    const groups = new Map<CategoryId, ClarifyCardData[]>()
    for (const c of mapped) {
      const g = groups.get(c.categoryId) ?? []
      g.push(c)
      groups.set(c.categoryId, g)
    }
    const lists = [...groups.values()]
    const interleaved: ClarifyCardData[] = []
    for (let i = 0; interleaved.length < mapped.length; i++) {
      for (const list of lists) if (i < list.length) interleaved.push(list[i])
    }
    return interleaved
  }, [apiCards, code])

  // Like state lifted here so the "Liked cards" filter and counts stay in sync.
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set<string>())

  const toggleLike = (id: string) =>
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // Saved state lifted here so the "Saved cards" filter stays in sync.
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set<string>())

  const toggleSave = (id: string) =>
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const likeCount = (card: ClarifyCardData) => {
    const baseLiked = card.liked
    const nowLiked = likedIds.has(card.id)
    if (nowLiked === baseLiked) return card.likes
    return nowLiked ? card.likes + 1 : card.likes - 1
  }

  const visibleCards = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cards.filter((c) => {
      if (activeCategory !== 'all' && c.categoryId !== activeCategory) return false
      if (filter === 'liked' && !likedIds.has(c.id)) return false
      if (filter === 'saved' && !savedIds.has(c.id)) return false
      if (q && !c.question.toLowerCase().includes(q) && !c.answer.toLowerCase().includes(q)) return false
      return true
    })
  }, [cards, activeCategory, query, filter, likedIds, savedIds])

  // ── Infinite scroll: reveal cards a page at a time as the sentinel below
  // the grid scrolls into view (mirrors the Comprehend page). ──────────────
  const ITEMS_PER_PAGE = 8
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)

  const hasMore = visibleCount < visibleCards.length
  const paginatedCards = visibleCards.slice(0, visibleCount)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        setIsLoadingMore(true)
        setTimeout(() => {
          setVisibleCount((prev) => prev + ITEMS_PER_PAGE)
          setIsLoadingMore(false)
        }, 600)
      }
    },
    [hasMore, isLoadingMore],
  )

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    })
    const el = loaderRef.current
    if (el) observer.observe(el)
    return () => {
      if (el) observer.unobserve(el)
    }
  }, [handleObserver])

  // Reset to the first page whenever the filters change.
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE)
  }, [activeCategory, query, filter])

  // ── Share link auth gate ─────────────────────────────────────────────────
  useEffect(() => {
    if (!shareCardParam) return
    if (!isAuthenticated) {
      sessionStorage.setItem(PENDING_SHARE_KEY, shareCardParam)
      onRequireSignUp()
    }
  }, [shareCardParam, isAuthenticated, onRequireSignUp])

  // ── Card detail / carousel modal ────────────────────────────────────────
  const [activeId, setActiveId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // ── Shuffled cards state for carousel reload behavior ───────────────────
  const [shuffledCards, setShuffledCards] = useState<ClarifyCardData[] | null>(null)

  // Use shuffled cards if available, otherwise use visibleCards
  const carouselCards = shuffledCards ?? visibleCards

  const activeIndex = activeId ? carouselCards.findIndex((c) => c.id === activeId) : -1
  const activeCard = activeIndex >= 0 ? carouselCards[activeIndex] : null
  const prevCard = activeIndex > 0 ? carouselCards[activeIndex - 1] : null
  const nextCard =
    activeIndex >= 0 && activeIndex < carouselCards.length - 1 ? carouselCards[activeIndex + 1] : null

  // Auto-open the shared card once authenticated and cards are loaded
  useEffect(() => {
    if (!shareCardParam || !isAuthenticated || !cards.length) return
    const found = cards.find((c) => c.id === shareCardParam)
    if (found) {
      sessionStorage.removeItem(PENDING_SHARE_KEY)
      setActiveId(found.id)
      setSearchParams({}, { replace: true })
    }
  }, [shareCardParam, isAuthenticated, cards, setSearchParams])

  // Handle shuffle/reload when reaching beginning of carousel
  const handleShuffle = useCallback(() => {
    const shuffled = [...visibleCards].sort(() => Math.random() - 0.5)
    setShuffledCards(shuffled)
    // Keep the current active card at index 0, or pick first shuffled card
    if (shuffled.length > 0) {
      setActiveId(shuffled[0].id)
    }
  }, [visibleCards])

  // Track the sidebar's collapse state (set as a body class by ChatSidebar) so
  // the detail overlay can offset itself past the rail on desktop.
  useEffect(() => {
    const sync = () => setSidebarCollapsed(document.body.classList.contains('sidebar-closed'))
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Lock background scroll while the detail view is open.
  useEffect(() => {
    if (!activeCard) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [activeCard])

  // Flag the shell as "immersive" while the detail view is open so it can hide
  // the mobile menu button (keyed on the boolean so swiping doesn't churn it).
  const setImmersive = useUiStore((s) => s.setImmersive)
  const detailOpen = activeCard != null
  useEffect(() => {
    setImmersive(detailOpen)
    return () => setImmersive(false)
  }, [detailOpen, setImmersive])

  return (
    <div className="relative flex w-full flex-1 flex-col overflow-hidden md:overflow-visible">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 px-4 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <img src="/assets/Icons/nav-clarify.svg" alt="" aria-hidden className="h-7 w-7 dark:brightness-0 dark:invert sm:h-8 sm:w-8" />
            <h1 className="text-[22px] font-medium tracking-wide text-cvq-green dark:text-[#f1f3ec] sm:text-[30px]">CLARIFY</h1>
          </div>
          <p className="mt-1 max-w-md text-[14px] leading-snug text-[#6a8970] dark:text-[#a5a5a5] sm:text-[18px]">
            Get quick clarity on important questions Nigerians are asking.
          </p>
        </div>

        {/* Search + filter dropdown */}
        <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full border border-[#527058] bg-[#f3fdff] py-2 pl-4 pr-9 text-[14px] text-cvq-green placeholder:text-cvq-green/40 focus:outline-none focus:ring-2 focus:ring-cvq-green/20 dark:border-[#383838] dark:bg-[#1d1d1d] sm:w-56 sm:text-[16px]"
            />
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cvq-green" />
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-cvq-green-solid px-3 py-2 text-[13px] font-medium text-cvq-green sm:gap-2 sm:px-4 sm:text-[16px]"
            >
              <span>{filter === 'all' ? 'All cards' : filter === 'liked' ? 'Liked cards' : 'Saved cards'}</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', filterOpen && 'rotate-180')} />
            </button>
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} aria-hidden />
                <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-2xl border border-cvq-mint-border bg-cvq-offwhite py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setFilter('all')
                      setFilterOpen(false)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-[15px] text-cvq-green hover:bg-black/5"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    All cards
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilter('liked')
                      setFilterOpen(false)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-[15px] text-cvq-green hover:bg-black/5"
                  >
                    <Star className="h-4 w-4" />
                    Liked cards
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilter('saved')
                      setFilterOpen(false)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-[15px] text-cvq-green hover:bg-black/5"
                  >
                    <Bookmark className="h-4 w-4" />
                    Saved cards
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Category filter pills — single scrollable line (never wraps) ── */}
      <div className="no-scrollbar mt-6 flex flex-nowrap gap-2 overflow-x-auto px-4 pb-1 sm:px-8">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={cn(
            'shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors sm:px-5 sm:py-2 sm:text-[16px]',
            activeCategory === 'all'
              ? 'bg-cvq-green-solid text-cvq-on-green'
              : 'border border-cvq-mint text-cvq-green hover:bg-cvq-green/5',
          )}
        >
          All
        </button>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className="shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium text-cvq-ink transition-transform hover:scale-[1.03] sm:px-5 sm:py-2 sm:text-[16px]"
              style={
                isActive
                  ? { backgroundColor: cat.color, color: '#fffff2' }
                  : { backgroundColor: cat.tint }
              }
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* ── Cards (masonry) ──────────────────────────────────────────── */}
      <div className="mt-6 min-h-0 flex-1 overflow-y-auto md:overflow-visible px-4 pb-8 sm:px-8">
        {visibleCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 grid size-16 place-items-center rounded-full bg-cvq-green/10">
              <Search className="h-7 w-7 text-cvq-green" />
            </div>
            <h3 className="text-lg font-semibold text-cvq-green">No cards found</h3>
            <p className="mt-1 max-w-xs text-sm text-cvq-muted">
              Try a different category, clear your search, or switch back to all cards.
            </p>
          </div>
        ) : (
          <>
            <div className="columns-1 [column-gap:1.25rem] sm:columns-2 lg:columns-3 2xl:columns-4">
              {paginatedCards.map((card) => (
                <ClarifyCard
                  key={card.id}
                  card={card}
                  liked={likedIds.has(card.id)}
                  likeCount={likeCount(card)}
                  onToggleLike={() => toggleLike(card.id)}
                  onOpen={() => setActiveId(card.id)}
                />
              ))}
            </div>

            {/* Infinite-scroll sentinel + loader */}
            <div ref={loaderRef} className="flex flex-col items-center justify-center py-8">
              {isLoadingMore && hasMore && (
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10">
                    <div className="absolute inset-0 rounded-full border-4 border-cvq-green/20" />
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-cvq-green" />
                  </div>
                  <span className="text-sm font-medium text-cvq-green">Loading more...</span>
                </div>
              )}
              {!hasMore && paginatedCards.length > 0 && (
                <p className="text-xs font-medium text-cvq-green/60">No more cards</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Card detail / carousel modal ─────────────────────────── */}
      {activeCard && (
        <ClarifyDetail
          card={activeCard}
          liked={likedIds.has(activeCard.id)}
          likeCount={likeCount(activeCard)}
          prevCard={prevCard}
          nextCard={nextCard}
          allCards={carouselCards}
          activeIndex={activeIndex}
          sidebarCollapsed={sidebarCollapsed}
          onClose={() => setActiveId(null)}
          onPrev={() => prevCard && setActiveId(prevCard.id)}
          onNext={() => nextCard && setActiveId(nextCard.id)}
          onToggleLike={() => toggleLike(activeCard.id)}
          onToggleSave={toggleSave}
          onSetActiveId={setActiveId}
          likedIds={likedIds}
          savedIds={savedIds}
          getLikeCount={likeCount}
          onShuffle={handleShuffle}
        />
      )}

      {/* ── Floating "Ask Civiqli" button (matches the Comprehend page) ── */}
      <img
        src="/assets/Icons/chat.png"
        alt="Ask Civiqli"
        width={100}
        height={90}
        className="fixed bottom-4 right-4 z-50 h-auto w-14 cursor-pointer drop-shadow-md sm:bottom-6 sm:right-6 sm:w-[100px] sm:drop-shadow-none"
      />
      <div className="fixed bottom-4 right-6 z-10 mt-10 hidden sm:block">
        <button className="flex items-center gap-2 rounded-full px-1.5 py-1 shadow-lg transition-colors">
          <span className="text-sm font-medium text-cvq-green">Ask Civiqli</span>
        </button>
      </div>
    </div>
  )
}
