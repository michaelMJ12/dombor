import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, Search, Bookmark, Star, MessageCircle, Play, ArrowLeft } from 'lucide-react';
import { useUiStore } from '@/store/ui.store';
import { motion } from "framer-motion";
import { cn } from '@/lib/utils';
import { ShareButton } from '@/features/chat/components/ShareButton';

interface VideoCard {
  id: string;
  category: string;
  categoryColor: string;
  title: string;
  duration: string;
  image: string;
  video: string;
  isSaved: boolean;
  isStarred: boolean;
}

const videoCards: VideoCard[] = [
  {
    id: '1',
    category: 'Welfare',
    categoryColor: 'bg-[#6366f1]',
    title: 'What are the provisions of the new electoral bill?',
    duration: '33 Sec',
    image: 'https://res.cloudinary.com/jzbsiqig/image/upload/v1783669833/comprehend/screenshot-thumbnail.png',
    video: 'https://res.cloudinary.com/jzbsiqig/video/upload/v1783669899/comprehend/comprehend-edit-7.mp4',
    isSaved: true,
    isStarred: false,
  },
  {
    id: '2',
    category: 'Identity',
    categoryColor: 'bg-[#d4a843]',
    title: 'What are the provisions of the new electoral bill?What are the provisions of the new electoral bill?What are the provisions of the new electoral bill?',
    duration: '33 Sec',
    image: 'https://res.cloudinary.com/jzbsiqig/image/upload/v1783669833/comprehend/screenshot-thumbnail.png',
    video: 'https://res.cloudinary.com/jzbsiqig/video/upload/v1783669899/comprehend/comprehend-edit-7.mp4',
    isSaved: false,
    isStarred: true,
  },
  {
    id: '3',
    category: 'Legislation',
    categoryColor: 'bg-[#a8715a]',
    title: 'What are the provisions of the new electoral bill?What are the provisions of the new electoral bill?What are the provisions of the new electoral bill?',
    duration: '33 Sec',
    image: 'https://res.cloudinary.com/jzbsiqig/image/upload/v1783669833/comprehend/screenshot-thumbnail.png',
    video: 'https://res.cloudinary.com/jzbsiqig/video/upload/v1783669899/comprehend/comprehend-edit-7.mp4',
    isSaved: true,
    isStarred: true,
  },
  {
    id: '4',
    category: 'Identity',
    categoryColor: 'bg-[#d4a843]',
    title: 'What are the provisions of the new electoral bill?What are the provisions of the new electoral bill?',
    duration: '33 Sec',
    image: 'https://res.cloudinary.com/jzbsiqig/image/upload/v1783669833/comprehend/screenshot-thumbnail.png',
    video: 'https://res.cloudinary.com/jzbsiqig/video/upload/v1783669899/comprehend/comprehend-edit-7.mp4',
    isSaved: false,
    isStarred: false,
  },
  {
    id: '5',
    category: 'Legislation',
    categoryColor: 'bg-[#a8715a]',
    title: 'What are the provisions of the new electoral bill?What are the provisions of the new electoral bill?What are the provisions of the new electoral bill?',
    duration: '33 Sec',
    image: 'https://res.cloudinary.com/jzbsiqig/image/upload/v1783669833/comprehend/screenshot-thumbnail.png',
    video: 'https://res.cloudinary.com/jzbsiqig/video/upload/v1783669899/comprehend/comprehend-edit-7.mp4',
    isSaved: true,
    isStarred: false,
  },
  {
    id: '6',
    category: 'Elections',
    categoryColor: 'bg-[#2563eb]',
    title: 'What are the provisions of the new electoral bill?',
    duration: '33 Sec',
    image: 'https://res.cloudinary.com/jzbsiqig/image/upload/v1783669833/comprehend/screenshot-thumbnail.png',
    video: 'https://res.cloudinary.com/jzbsiqig/video/upload/v1783669899/comprehend/comprehend-edit-7.mp4',
    isSaved: false,
    isStarred: true,
  },
  {
    id: '7',
    category: 'Welfare',
    categoryColor: 'bg-[#6366f1]',
    title: 'What are the provisions of the new electoral bill?What are the provisions of the new electoral bill?',
    duration: '33 Sec',
    image: 'https://res.cloudinary.com/jzbsiqig/image/upload/v1783669833/comprehend/screenshot-thumbnail.png',
    video: 'https://res.cloudinary.com/jzbsiqig/video/upload/v1783669899/comprehend/comprehend-edit-7.mp4',
    isSaved: true,
    isStarred: true,
  },
  {
    id: '8',
    category: 'Elections',
    categoryColor: 'bg-[#2563eb]',
    title: 'What are the provisions of the new electoral bill?What are the provisions of the new electoral bill?',
    duration: '33 Sec',
    image: 'https://res.cloudinary.com/jzbsiqig/image/upload/v1783669833/comprehend/screenshot-thumbnail.png',
    video: 'https://res.cloudinary.com/jzbsiqig/video/upload/v1783669899/comprehend/comprehend-edit-7.mp4',
    isSaved: false,
    isStarred: false,
  },
  {
    id: '9',
    category: 'Elections',
    categoryColor: 'bg-[#2563eb]',
    title: 'What are the provisions of the new electoral bill?',
    duration: '33 Sec',
    image: 'https://res.cloudinary.com/jzbsiqig/image/upload/v1783669833/comprehend/screenshot-thumbnail.png',
    video: 'https://res.cloudinary.com/jzbsiqig/video/upload/v1783669899/comprehend/comprehend-edit-7.mp4',
    isSaved: false,
    isStarred: false,
  },
  {
    id: '10',
    category: 'Elections',
    categoryColor: 'bg-[#2563eb]',
    title: 'What are the provisions of the new electoral bill?What are the provisions of the new electoral bill?',
    duration: '33 Sec',
    image: 'https://res.cloudinary.com/jzbsiqig/image/upload/v1783669833/comprehend/screenshot-thumbnail.png',
    video: 'https://res.cloudinary.com/jzbsiqig/video/upload/v1783669899/comprehend/comprehend-edit-7.mp4',
    isSaved: false,
    isStarred: false,
  },
  {
    id: '11',
    category: 'Elections',
    categoryColor: 'bg-[#2563eb]',
    title: 'What are the provisions of the new electoral bill?',
    duration: '33 Sec',
    image: 'https://res.cloudinary.com/jzbsiqig/image/upload/v1783669833/comprehend/screenshot-thumbnail.png',
    video: 'https://res.cloudinary.com/jzbsiqig/video/upload/v1783669899/comprehend/comprehend-edit-7.mp4',
    isSaved: false,
    isStarred: false,
  },
  {
    id: '12',
    category: 'Elections',
    categoryColor: 'bg-[#2563eb]',
    title: 'What are the provisions of the new electoral bill?What are the provisions of the new electoral bill?What are the provisions of the new electoral bill?',
    duration: '33 Sec',
    image: 'https://res.cloudinary.com/jzbsiqig/image/upload/v1783669833/comprehend/screenshot-thumbnail.png',
    video: 'https://res.cloudinary.com/jzbsiqig/video/upload/v1783669899/comprehend/comprehend-edit-7.mp4',
    isSaved: false,
    isStarred: false,
  },
  {
    id: '13',
    category: 'Elections',
    categoryColor: 'bg-[#2563eb]',
    title: 'What are the provisions of the new electoral bill?What are the provisions of the new electoral bill?What are the provisions of the new electoral bill?',
    duration: '33 Sec',
    image: 'https://res.cloudinary.com/jzbsiqig/image/upload/v1783669833/comprehend/screenshot-thumbnail.png',
    video: 'https://res.cloudinary.com/jzbsiqig/video/upload/v1783669899/comprehend/comprehend-edit-7.mp4',
    isSaved: false,
    isStarred: false,
  },
  {
    id: '14',
    category: 'Elections',
    categoryColor: 'bg-[#2563eb]',
    title: 'What are the provisions of the new electoral bill?',
    duration: '33 Sec',
    image: 'https://res.cloudinary.com/jzbsiqig/image/upload/v1783669833/comprehend/screenshot-thumbnail.png',
    video: 'https://res.cloudinary.com/jzbsiqig/video/upload/v1783669899/comprehend/comprehend-edit-7.mp4',
    isSaved: false,
    isStarred: false,
  },
  {
    id: '15',
    category: 'Elections',
    categoryColor: 'bg-[#2563eb]',
    title: 'What are the provisions of the new electoral bill? n What are the provisions of the new electoral bill?What are the provisions of the new electoral bill?',
    duration: '33 Sec',
    image: 'https://res.cloudinary.com/jzbsiqig/image/upload/v1783669833/comprehend/screenshot-thumbnail.png',
    video: 'https://res.cloudinary.com/jzbsiqig/video/upload/v1783669899/comprehend/comprehend-edit-7.mp4',
    isSaved: false,
    isStarred: false,
  },
  {
    id: '16',
    category: 'Elections',
    categoryColor: 'bg-[#2563eb]',
    title: 'What are the provisions of the new electoral bill? What are the provisions of the new electoral bill?What are the provisions of the new electoral bill?',
    duration: '33 Sec',
    image: 'https://res.cloudinary.com/jzbsiqig/image/upload/v1783669833/comprehend/screenshot-thumbnail.png',
    video: 'https://res.cloudinary.com/jzbsiqig/video/upload/v1783669899/comprehend/comprehend-edit-7.mp4',
    isSaved: false,
    isStarred: false,
  },
];

const CATEGORIES = [
  { name: 'All', color: '#135336', tint: '#deecdb' },
  { name: 'Welfare', color: '#5057a6', tint: '#cedeff' },
  { name: 'Elections', color: '#165ab3', tint: '#b7e9ff' },
  { name: 'Identity', color: '#b1892a', tint: '#f0e1ae' },
  { name: 'Sovereignty', color: '#00809d', tint: '#a2eaec' },
  { name: 'Legislation', color: '#9f6b3e', tint: '#e3d8cf' },
  { name: 'Governance', color: '#348c72', tint: '#b3efdd' },
  { name: 'Justice', color: '#d06a26', tint: '#ffc5a4' },
  { name: 'Execution', color: '#984755', tint: '#ffbbbc' },
  { name: 'Finance', color: '#ac5eac', tint: '#f5ddff' },
  { name: 'Rights', color: '#808E50', tint: '#E7EFCC' },
];

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

export default function ComprehendPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All cards');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cards, setCards] = useState<VideoCard[]>(videoCards);
  const [searchQuery, setSearchQuery] = useState('');

  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 8;

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkSidebar = () => {
      setSidebarCollapsed(document.body.classList.contains('sidebar-closed'));
    };
    checkSidebar();
    const observer = new MutationObserver(checkSidebar);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const setImmersive = useUiStore((s) => s.setImmersive);
  const detailOpen = activeVideoId !== null;
  useEffect(() => {
    setImmersive(detailOpen);
    return () => setImmersive(false);
  }, [detailOpen, setImmersive]);

  const toggleSave = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isSaved: !c.isSaved } : c))
    );
  };

  const toggleStar = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isStarred: !c.isStarred } : c))
    );
  };

  let filteredCards = cards;

  if (selectedFilter === 'Saved cards') {
    filteredCards = cards.filter((c) => c.isSaved);
  } else if (selectedFilter === 'Starred cards') {
    filteredCards = cards.filter((c) => c.isStarred);
  }

  if (activeCategory !== 'All') {
    filteredCards = filteredCards.filter((c) => c.category === activeCategory);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredCards = filteredCards.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }

  const hasMore = visibleCount < filteredCards.length;
  const paginatedCards = filteredCards.slice(0, visibleCount);
  const isEmpty = paginatedCards.length === 0;

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoadingMore) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
          setIsLoadingMore(false);
        }, 600);
      }
    },
    [hasMore, isLoadingMore]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [handleObserver]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedFilter, activeCategory, searchQuery]);

  const activeIndex = activeVideoId ? filteredCards.findIndex(c => c.id === activeVideoId) : -1;
  const activeCard = activeIndex >= 0 ? filteredCards[activeIndex] : null;
  const prevCard = activeIndex > 0 ? filteredCards[activeIndex - 1] : null;
  const nextCard = activeIndex < filteredCards.length - 1 ? filteredCards[activeIndex + 1] : null;

  const openVideo = (id: string) => {
    setActiveVideoId(id);
    setIsPlaying(true);
  };

  const closeVideo = useCallback(() => {
    setActiveVideoId(null);
    setIsPlaying(false);
  }, []);

  /* ═══════════════════════════════════════════════════════════════════════
   * HORIZONTAL SNAP SCROLL — Same pattern as Clarify (Reels style)
   * ═══════════════════════════════════════════════════════════════════════ */
  const isMobile = useIsTouchViewport();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Mobile: scroll to the initially opened card on mount
  useEffect(() => {
    if (!isMobile || !activeCard) return;
    const container = scrollContainerRef.current;
    if (!container || activeIndex < 0) return;
    const target = container.children[activeIndex] as HTMLElement | undefined;
    if (target) target.scrollIntoView({ block: 'nearest', inline: 'center' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!activeCard, isMobile]);

  // Desktop: scroll to the initially opened card on mount
  useEffect(() => {
    if (isMobile || !activeCard) return;
    const container = desktopScrollRef.current;
    if (!container || activeIndex < 0) return;
    const target = container.children[activeIndex] as HTMLElement | undefined;
    if (target) target.scrollIntoView({ block: 'nearest', inline: 'center' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!activeCard, isMobile]);

  // Mobile: IntersectionObserver to track active card
  useEffect(() => {
    if (!isMobile) return;
    const container = scrollContainerRef.current;
    if (!container || !activeCard) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const id = (entry.target as HTMLElement).dataset.reelId;
            if (id) setActiveVideoId(id);
          }
        }
      },
      { root: container, threshold: 0.6 },
    );
    Array.from(container.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [isMobile, activeCard, filteredCards]);

  // Desktop: IntersectionObserver to track active card
  useEffect(() => {
    if (isMobile) return;
    const container = desktopScrollRef.current;
    if (!container || !activeCard) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const id = (entry.target as HTMLElement).dataset.reelId;
            if (id) setActiveVideoId(id);
          }
        }
      },
      { root: container, threshold: 0.6 },
    );
    Array.from(container.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [isMobile, activeCard, filteredCards]);

  // Keyboard navigation — ArrowLeft/ArrowRight for both mobile and desktop
  useEffect(() => {
    if (!activeCard) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeVideo();
      else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const container = isMobile ? scrollContainerRef.current : desktopScrollRef.current;
        if (!container || activeIndex <= 0) return;
        const prev = container.children[activeIndex - 1] as HTMLElement | undefined;
        prev?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const container = isMobile ? scrollContainerRef.current : desktopScrollRef.current;
        if (!container || activeIndex >= filteredCards.length - 1) return;
        const next = container.children[activeIndex + 1] as HTMLElement | undefined;
        next?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeCard, closeVideo, activeIndex, filteredCards.length, isMobile]);

  // Lock background scroll while the detail view is open.
  useEffect(() => {
    if (!activeCard) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeCard]);

  return (
    <div className="relative flex w-full flex-1 flex-col overflow-hidden md:overflow-visible">
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col relative overflow-hidden md:overflow-visible">
        {/* Header */}
        <div className="px-4 pb-4 sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <img src="/assets/Icons/nav-comprehend.svg" alt="" aria-hidden className="h-8 w-8 dark:brightness-0 dark:invert" />
                <h1 className="text-[22px] font-medium tracking-wide text-[#1a5f4a] dark:text-[#f1f3ec] sm:text-[30px]">COMPREHEND</h1>
              </div>
              <p className="mt-1 max-w-md text-[14px] leading-snug text-[#1a5f4a] dark:text-[#a5a5a5] sm:text-[18px]">
                Get quick clarity on important questions Nigerians are asking.
              </p>
            </div>

            {/* Top Right Menu */}
            <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
              <div className="relative min-w-0 flex-1 sm:flex-none">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a5f4a] dark:text-[#a5a5a5]" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-[#1a5f4a] bg-[#f3fdff] py-2 pl-4 pr-9 text-[14px] text-[#1a5f4a] placeholder:text-[#1a5f4a]/40 focus:outline-none focus:ring-2 focus:ring-[#1a5f4a]/20 dark:border-[#383838] dark:bg-[#1d1d1d] dark:text-[#f1f3ec] dark:placeholder:text-[#a5a5a5]/60 sm:w-56 sm:text-[16px]"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-1.5 rounded-full border border-[#1a5f4a] px-3 py-2 text-[13px] font-medium text-[#1a5f4a] transition-colors dark:border-[#383838] dark:text-[#f1f3ec] sm:gap-2 sm:px-4 sm:text-[16px]"
                >
                  <span>{selectedFilter}</span>
                  <svg className="w-4 h-4 text-[#1a5f4a] dark:text-[#f1f3ec]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {filterOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-2 w-40 z-20 dark:bg-[#1d1d1d] dark:border-[#383838]">
                      <button
                        onClick={() => { setSelectedFilter('All cards'); setFilterOpen(false); }}
                        className="flex items-center gap-2 px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 w-full text-left dark:text-[#bdbdbd] dark:hover:bg-white/5"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        All cards
                      </button>
                      <button
                        onClick={() => { setSelectedFilter('Saved cards'); setFilterOpen(false); }}
                        className="flex items-center gap-2 px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 w-full text-left dark:text-[#bdbdbd] dark:hover:bg-white/5"
                      >
                        <img
                          src="/assets/Icons/bookmark.svg"
                          alt="Comprehend"
                          className="h-4 w-4"
                        />
                        Saved cards
                      </button>
                      <button
                        onClick={() => { setSelectedFilter('Starred cards'); setFilterOpen(false); }}
                        className="flex items-center gap-2 px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 w-full text-left dark:text-[#bdbdbd] dark:hover:bg-white/5"
                      >
                        <img
                          src="/assets/Icons/star.svg"
                          alt="Comprehend"
                          className="h-4 w-4"
                        />
                        Starred cards
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="no-scrollbar mb-5 flex flex-nowrap gap-2 overflow-x-auto px-4 pb-1 sm:px-8">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.name;
            if (cat.name === 'All') {
              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory('All')}
                  className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors sm:px-5 sm:py-2 sm:text-[16px] ${isActive
                    ? 'bg-cvq-green-solid text-cvq-on-green'
                    : 'border border-cvq-mint text-cvq-green hover:bg-cvq-green/5'
                    }`}
                >
                  All
                </button>
              );
            }
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className="shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium text-cvq-ink transition-transform hover:scale-[1.03] sm:px-5 sm:py-2 sm:text-[16px]"
                style={isActive ? { backgroundColor: cat.color, color: '#fffff2' } : { backgroundColor: cat.tint }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="min-h-0 flex-1 overflow-y-auto md:overflow-visible pb-8 md:pb-0">
        {isEmpty ? (
          <div className="px-4 sm:px-8 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1a5f4a]/10 flex items-center justify-center mb-4 dark:bg-white/10">
              {selectedFilter === 'Saved cards' ? (
                <Bookmark className="w-8 h-8 text-[#1a5f4a] dark:text-[#f1f3ec]" />
              ) : (
                <Star className="w-8 h-8 text-[#1a5f4a] dark:text-[#f1f3ec]" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-[#1a5f4a] mb-2 dark:text-[#f1f3ec]">
              No {selectedFilter === 'Saved cards' ? 'saved' : 'starred'} cards yet
            </h3>
            <p className="text-sm text-gray-500 max-w-xs dark:text-[#a5a5a5]">
              {selectedFilter === 'Saved cards'
                ? 'Bookmark cards you want to revisit later. They will appear here.'
                : 'Star your favorite cards to quickly find them here.'}
            </p>
          </div>
        ) : (
          /* Video Grid */
          <div className="px-4 pb-8 sm:px-8">
            <div className="columns-1 sm:columns-2 lg:columns-4 gap-4 space-y-4">
              {paginatedCards.map((card) => (
                <div
                  key={card.id}
                  className="relative rounded-[20px] overflow-hidden shadow-sm group cursor-pointer h-full flex flex-col break-inside-avoid mb-4"
                >
                  {/* Thumbnail image */}
                  <div className="relative h-64 bg-gray-200 flex-shrink-0">
                    <img
                      src="https://res.cloudinary.com/jzbsiqig/image/upload/v1783669833/comprehend/screenshot-thumbnail.png"
                      alt="Video thumbnail"
                      className="w-full h-full object-cover object-top"
                    />

                    {/* Play Button Overlay - click to open modal */}
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={() => openVideo(card.id)}
                    >
                      <img
                        src="/assets/Icons/play2.png"
                        alt="Play"
                        width={70}
                        height={90}
                        style={{ width: 70, height: 90 }}
                        className="cursor-pointer"
                      />
                    </div>

                    {/* Top-right action buttons */}
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave(card.id);
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${card.isSaved
                          ? 'bg-white/90'
                          : 'bg-black/30 hover:bg-black/40'
                          }`}
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${card.isSaved
                            ? 'text-[#1a5f4a] fill-[#1a5f4a]'
                            : 'text-white'
                            }`}
                        />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(card.id);
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${card.isStarred
                          ? 'bg-white/90'
                          : 'bg-black/30 hover:bg-black/40'
                          }`}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${card.isStarred
                            ? 'text-[#1a5f4a] fill-[#1a5f4a]'
                            : 'text-white'
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Overlay */}
                  <div
                    className={`${card.categoryColor} p-3.5 rounded-t-[20px] -mt-12 relative z-10 flex-shrink-0`}
                  >
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] text-[#D7F7FF] font-semibold font-['Jost'] uppercase tracking-wide border border-[#D7F7FF]">
                      {card.category}
                    </span>

                    <div className="mt-2.5 text-white sm:mt-3">
                      {card.title.split('\n').map((line, i) => (
                        <p key={i} className="text-[23px] font-medium text-[#D7F7FF] font-['Rhode'] leading-[1.12] sm:text-[23px]">
                          {line}
                        </p>
                      ))}
                      <p className="text-[13px] text-white/70 mt-1.5">
                        {card.duration}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Loader */}
            <div
              ref={loaderRef}
              className="flex flex-col items-center justify-center py-8"
            >
              {isLoadingMore && hasMore && (
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-4 border-[#1a5f4a]/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1a5f4a] animate-spin" />
                  </div>
                  <span className="text-sm font-medium text-[#1a5f4a] dark:text-[#a5a5a5]">Loading more...</span>
                </div>
              )}
              {!hasMore && paginatedCards.length > 0 && (
                <p className="text-xs text-[#1a5f4a]/60 font-medium dark:text-[#a5a5a5]/70">No more cards</p>
              )}
            </div>
          </div>
        )}
        </div>

        {/* Floating Chat Button */}
        <img
          src="/assets/Icons/chat.png"
          alt="Comprehend"
          width={100}
          height={90}
          className="fixed bottom-6 right-6 w-[100px] h-[90px] z-50 cursor-pointer"
        />

        <div className="absolute bottom-4 right-6 z-10 fixed mt-10">
          <button className="flex items-center gap-2  px-1.5 py-1.5 rounded-full shadow-lg  transition-colors">
            <span className="text-[#1a5f4a] text-sm font-medium dark:text-[#f1f3ec]">Ask Civiqli</span>
          </button>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════════
       * VIDEO DETAIL MODAL — Same horizontal scroll pattern as Clarify
       * ═══════════════════════════════════════════════════════════════ */}
      {activeVideoId && activeCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className={cn(
            'fixed inset-y-0 right-0 z-[60] flex flex-col',
            sidebarCollapsed ? 'left-0 lg:left-[72px]' : 'left-0 lg:left-[272px]',
          )}
        >
          {/* Dark background */}
          <div className="absolute inset-0 bg-black" onClick={closeVideo} aria-hidden />

          {/* Back button */}
          <button
            type="button"
            onClick={closeVideo}
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
                const container = desktopScrollRef.current;
                if (!container || activeIndex <= 0) return;
                const prev = container.children[activeIndex - 1] as HTMLElement | undefined;
                prev?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
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
                const container = desktopScrollRef.current;
                if (!container || activeIndex >= filteredCards.length - 1) return;
                const next = container.children[activeIndex + 1] as HTMLElement | undefined;
                next?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              }}
              aria-label="Next card"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="h-6 w-6 rotate-180" />
            </button>
          )}

          {/* MOBILE — horizontal snap scroll with bounce-back */}
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
              {filteredCards.map((c) => {
                const isActive = c.id === activeVideoId;
                return (
                  <div
                    key={c.id}
                    data-reel-id={c.id}
                    className="snap-center snap-always w-full h-full shrink-0 relative flex items-center justify-center"
                  >
                  <div
                    className="relative w-full h-full sm:w-[min(400px,90vw)] sm:h-[min(720px,92vh)] sm:rounded-3xl overflow-hidden"
                    style={{
                      boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
                    }}
                  >
                    <div
                      className="relative w-full h-full group"
                      onMouseEnter={() => {
                        setActiveVideoId(c.id);
                        setIsPlaying(true);
                        const vid = document.querySelector<HTMLVideoElement>(`[data-vid="${c.id}"]`);
                        vid?.play().catch(() => {});
                      }}
                      onMouseLeave={() => {
                        const vid = document.querySelector<HTMLVideoElement>(`[data-vid="${c.id}"]`);
                        vid?.pause();
                        setIsPlaying(false);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isActive) {
                          togglePlay();
                        } else {
                          setActiveVideoId(c.id);
                          setIsPlaying(true);
                        }
                      }}
                    >
                      <video
                        data-vid={c.id}
                        ref={isActive ? videoRef : null}
                        className="w-full h-full object-cover"
                        loop
                        playsInline
                        src={c.video}
                      />

                      {/* Play icon when paused */}
                      <div className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none">
                        {(!isActive || !isPlaying) && (
                          <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                          </div>
                        )}
                      </div>

                      {/* Full gradient backdrop — covers bottom half behind text AND action buttons */}
                      <div className="absolute inset-x-0 bottom-0 top-1/3 z-[2] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

                      {/* Bottom info + description */}
                      <div className="absolute bottom-0 left-0 right-14 sm:right-16 z-[3] p-4 sm:p-5 pb-6 sm:pb-8">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block px-2.5 py-0.5 bg-blue-600 rounded-md text-[10px] text-[#D7F7FF] font-semibold uppercase tracking-wide">
                            {c.category}
                          </span>
                          <span className="flex items-center gap-1 text-white/80 text-[10px]">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {c.duration}
                          </span>
                        </div>
                        <h3 className="text-[22px] font-medium text-[#D7F7FF] font-['Rhode'] leading-snug sm:text-[25px] line-clamp-2">
                          {c.title.split("\n")[0]}
                        </h3>
                        <p className="text-[16px] font-normal text-[#FFFFFF] font-['Jost'] mt-1.5 line-clamp-3 leading-snug sm:text-[18px]">
                          Lorem metus porttitor purus enim. Non et mauris quam
                          porttitor faucibus id. Donec lacus scelerisque nisl ultrices
                          habitasse amet pellentesque at ultrices.
                        </p>
                      </div>
                    </div>

                    {/* Right-side action buttons — sits on top of the gradient */}
                    <div className="absolute bottom-6 sm:bottom-8 right-3 sm:right-4 z-[4] flex flex-col items-center gap-3 sm:gap-4">
                      <ShareButton title={c.title} />

                      <button
                        className="flex flex-col items-center gap-0.5 group"
                        onClick={() => toggleSave(c.id)}
                      >
                        <div className={cn(
                          'w-9 h-9 sm:w-10 sm:h-10 shrink-0 aspect-square rounded-full flex items-center justify-center transition-all',
                          c.isSaved ? 'bg-white' : 'bg-white/10 group-hover:bg-white/20 group-active:scale-90',
                        )}>
                          <Bookmark className={cn(
                            'w-4 h-4 sm:w-5 sm:h-5',
                            c.isSaved ? 'text-[#1a5f4a] fill-[#1a5f4a]' : 'text-white',
                          )} />
                        </div>
                      </button>

                      <button
                        className="flex flex-col items-center gap-0.5 group"
                        onClick={() => toggleStar(c.id)}
                      >
                        <div className={cn(
                          'w-9 h-9 sm:w-10 sm:h-10 shrink-0 aspect-square rounded-full flex items-center justify-center transition-all',
                          c.isStarred ? 'bg-white' : 'bg-white/10 group-hover:bg-white/20 group-active:scale-90',
                        )}>
                          <Star className={cn(
                            'w-4 h-4 sm:w-5 sm:h-5',
                            c.isStarred ? 'text-[#1a5f4a] fill-[#1a5f4a]' : 'text-white',
                          )} />
                        </div>
                        <span className="text-white text-[10px] sm:text-[11px] font-medium">237</span>
                      </button>

                      <button className="flex flex-col items-center gap-0.5 group">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 aspect-square rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 group-active:scale-90 transition-all">
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              );
              })}
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
              {filteredCards.map((c) => {
                const isActive = c.id === activeVideoId;
                return (
                  <div
                    key={c.id}
                    data-reel-id={c.id}
                    className="snap-center w-full h-full shrink-0 relative flex items-center justify-center"
                  >
                  <div
                    className="relative w-full h-full sm:w-[min(400px,90vw)] sm:h-[min(720px,92vh)] sm:rounded-3xl overflow-hidden"
                    style={{
                      boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
                    }}
                  >
                    <div
                      className="relative w-full h-full group"
                      onMouseEnter={() => {
                        setActiveVideoId(c.id);
                        setIsPlaying(true);
                        const vid = document.querySelector<HTMLVideoElement>(`[data-vid="${c.id}"]`);
                        vid?.play().catch(() => {});
                      }}
                      onMouseLeave={() => {
                        const vid = document.querySelector<HTMLVideoElement>(`[data-vid="${c.id}"]`);
                        vid?.pause();
                        setIsPlaying(false);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isActive) {
                          togglePlay();
                        } else {
                          setActiveVideoId(c.id);
                          setIsPlaying(true);
                        }
                      }}
                    >
                      <video
                        data-vid={c.id}
                        ref={isActive ? videoRef : null}
                        className="w-full h-full object-cover"
                        loop
                        playsInline
                        src={c.video}
                      />

                      <div className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none">
                        {(!isActive || !isPlaying) && (
                          <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                          </div>
                        )}
                      </div>

                      <div className="absolute inset-x-0 bottom-0 top-1/3 z-[2] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

                      <div className="absolute bottom-0 left-0 right-14 sm:right-16 z-[3] p-4 sm:p-5 pb-6 sm:pb-8">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block px-2.5 py-0.5 bg-blue-600 rounded-md text-[10px] text-[#D7F7FF] font-semibold uppercase tracking-wide">
                            {c.category}
                          </span>
                          <span className="flex items-center gap-1 text-white/80 text-[10px]">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {c.duration}
                          </span>
                        </div>
                        <h3 className="text-[22px] font-medium text-[#D7F7FF] font-['Rhode'] leading-snug sm:text-[25px] line-clamp-2">
                          {c.title.split("\n")[0]}
                        </h3>
                        <p className="text-[16px] font-normal text-[#FFFFFF] font-['Jost'] mt-1.5 line-clamp-3 leading-snug sm:text-[18px]">
                          Lorem metus porttitor purus enim. Non et mauris quam
                          porttitor faucibus id. Donec lacus scelerisque nisl ultrices
                          habitasse amet pellentesque at ultrices.
                        </p>
                      </div>
                    </div>

                    <div className="absolute bottom-6 sm:bottom-8 right-3 sm:right-4 z-[4] flex flex-col items-center gap-3 sm:gap-4">
                      <ShareButton title={c.title} />

                      <button
                        className="flex flex-col items-center gap-0.5 group"
                        onClick={() => toggleSave(c.id)}
                      >
                        <div className={cn(
                          'w-9 h-9 sm:w-10 sm:h-10 shrink-0 aspect-square rounded-full flex items-center justify-center transition-all',
                          c.isSaved ? 'bg-white' : 'bg-white/10 group-hover:bg-white/20 group-active:scale-90',
                        )}>
                          <Bookmark className={cn(
                            'w-4 h-4 sm:w-5 sm:h-5',
                            c.isSaved ? 'text-[#1a5f4a] fill-[#1a5f4a]' : 'text-white',
                          )} />
                        </div>
                      </button>

                      <button
                        className="flex flex-col items-center gap-0.5 group"
                        onClick={() => toggleStar(c.id)}
                      >
                        <div className={cn(
                          'w-9 h-9 sm:w-10 sm:h-10 shrink-0 aspect-square rounded-full flex items-center justify-center transition-all',
                          c.isStarred ? 'bg-white' : 'bg-white/10 group-hover:bg-white/20 group-active:scale-90',
                        )}>
                          <Star className={cn(
                            'w-4 h-4 sm:w-5 sm:h-5',
                            c.isStarred ? 'text-[#1a5f4a] fill-[#1a5f4a]' : 'text-white',
                          )} />
                        </div>
                        <span className="text-white text-[10px] sm:text-[11px] font-medium">237</span>
                      </button>

                      <button className="flex flex-col items-center gap-0.5 group">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 aspect-square rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 group-active:scale-90 transition-all">
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}