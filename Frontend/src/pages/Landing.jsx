import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Minus, Plus } from 'lucide-react'

/* ────────────────── 6 Chocolate Themes ────────────────── */
const THEMES = [
  {
    id: 'snow-white',
    name: 'Snow White',
    subtitle: 'White',
    type: 'White Chocolate',
    weight: '480G',
    tag: 'Vegetarian',
    price: '£32.00',
    description:
      'Velvety white chocolate shell hand-cracked to reveal creamy vanilla pralines, snowflake truffles and notes of warm Madagascan vanilla.',
    image: '/chocolates/snow-white.png',
  },
  {
    id: 'butter-delight',
    name: 'Butter Delight',
    subtitle: 'Milk',
    type: 'Milk Chocolate',
    weight: '500G',
    tag: 'Contains Gluten',
    price: '£29.00',
    description:
      'Generously proportioned milk chocolate halves filled with golden caramel pralines, butterscotch truffles and crisp honeycomb shards.',
    image: '/chocolates/butter-delight.png',
  },
  {
    id: 'candy-crush',
    name: 'Candy Crush',
    subtitle: 'Candy',
    type: 'Candy Mix',
    weight: '460G',
    tag: 'Fun Selection',
    price: '£26.00',
    description:
      'A playful explosion of colour — sugar-coated bonbons, fruit jellies and candy-coated chocolates tumbling from a vibrant shell.',
    image: '/chocolates/candy-crush.png',
  },
  {
    id: 'dark-solid',
    name: 'Dark Solid',
    subtitle: 'Dark',
    type: '70% Dark',
    weight: '550G',
    tag: 'Vegan',
    price: '£34.00',
    description:
      'Deep, single-origin dark chocolate with intense cocoa pralines, espresso ganache and a whisper of sea salt for a bittersweet finish.',
    image: '/chocolates/dark-solid.png',
  },
  {
    id: 'pink-world',
    name: 'Pink World',
    subtitle: 'Ruby',
    type: 'Ruby Chocolate',
    weight: '490G',
    tag: 'Limited Edition',
    price: '£36.00',
    description:
      'Naturally pink ruby chocolate with notes of fresh berries, raspberry-dusted truffles and rose ganache pralines hidden inside.',
    image: '/chocolates/pink-world.png',
  },
  {
    id: 'assortments',
    name: 'Assortments',
    subtitle: 'Mixed',
    type: 'House Selection',
    weight: '600G',
    tag: 'Bestseller',
    price: '£42.00',
    description:
      "Our chocolatier's signature mix — white, milk, dark and ruby pralines tumbling from a hand-painted shell. The whole library in one egg.",
    image: '/chocolates/assortments.png',
  },
]

const TOTAL = THEMES.length

export default function Landing() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [qty, setQty] = useState(1)
  const [infoVisible, setInfoVisible] = useState(true)

  /* Wrap helpers */
  const wrap = (n) => ((n % TOTAL) + TOTAL) % TOTAL

  const goTo = useCallback((idx) => {
    setInfoVisible(false)
    setTimeout(() => {
      setActiveIndex(wrap(idx))
      setQty(1)
      setInfoVisible(true)
    }, 150)
  }, [])

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])

  /* Keyboard nav */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev])

  const theme = THEMES[activeIndex]

  /* Visible thumbnails — show all 6, wrap the window */
  const thumbIndices = Array.from({ length: TOTAL }, (_, i) => wrap(activeIndex - 2 + i))

  return (
    <div className="choco-hero" data-theme={theme.id}>
      {/* ── Full-bleed background image (covers the entire hero) ── */}
      <div className="choco-hero-bg" aria-hidden="true">
        {THEMES.map((t, i) => (
          <div
            key={t.id}
            className={`choco-hero-slide${i === activeIndex ? ' active' : ''}`}
          >
            <img src={t.image} alt="" />
          </div>
        ))}
        {/* Soft fade so text sits above the image while it stays partially visible */}
        <div className="choco-hero-overlay" />
      </div>

      {/* ── Top Bar ── */}
      <header className="choco-topbar">
        <Link to="/" className="choco-brand">NEXUS</Link>
        <div className="choco-topbar-actions">
          <Link to="/login" className="choco-topbar-btn secondary">Sign In</Link>
          <Link to="/register" className="choco-topbar-btn primary">Get Started</Link>
        </div>
      </header>

      {/* ── Main 3-column area ── */}
      <div className="choco-hero-main">
        {/* Left — thumbnail strip */}
        <div className="choco-thumb-col">
          <button className="choco-thumb-arrow" onClick={() => goTo(activeIndex - 1)} aria-label="Previous thumbnail">
            <ChevronUp size={18} />
          </button>

          <div className="choco-thumb-list">
            {thumbIndices.map((tIdx) => {
              const t = THEMES[tIdx]
              return (
                <div
                  key={t.id + '-' + tIdx}
                  className={`choco-thumb-item${tIdx === activeIndex ? ' active' : ''}`}
                  onClick={() => goTo(tIdx)}
                >
                  <img src={t.image} alt={t.name} />
                  {tIdx === activeIndex && (
                    <div className="choco-thumb-label">
                      {t.name}
                      <span>{t.subtitle}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button className="choco-thumb-arrow" onClick={() => goTo(activeIndex + 1)} aria-label="Next thumbnail">
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Center — empty spacer so the info column sits over the full-bleed image */}
        <div className="choco-center" aria-hidden="true" />

        {/* Right — info panel (sits above the image) */}
        <div className="choco-info-col">
          <div className={`choco-info-content${infoVisible ? ' visible' : ''}`}>
            {/* Theme name (script, italic, curved) — above description */}
            <div className="choco-theme-name">{theme.name}</div>
            <div className="choco-theme-subtitle">{theme.subtitle} · {theme.type}</div>

            {/* Specs */}
            <div className="choco-specs">
              <div className="choco-spec">
                <div className="choco-spec-label">Weight</div>
                <div className="choco-spec-value">{theme.weight}</div>
              </div>
              <div className="choco-spec">
                <div className="choco-spec-label">Type</div>
                <div className="choco-spec-value">{theme.type}</div>
              </div>
              <div className="choco-spec">
                <div className="choco-spec-label">Tag</div>
                <div className="choco-spec-value">{theme.tag}</div>
              </div>
            </div>

            {/* Description */}
            <p className="choco-description" style={{ marginTop: 20 }}>{theme.description}</p>

            {/* Price */}
            <div style={{ marginTop: 8 }}>
              <div className="choco-price">{theme.price}</div>
              <div className="choco-delivery">Free standard delivery over £50</div>
            </div>

            {/* Qty + ATC */}
            <div className="choco-cart-row" style={{ marginTop: 8 }}>
              <div className="choco-qty-stepper">
                <button className="choco-qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>
                  <Minus size={14} />
                </button>
                <span className="choco-qty-value">{qty}</span>
                <button className="choco-qty-btn" onClick={() => setQty(qty + 1)}>
                  <Plus size={14} />
                </button>
              </div>
              <button className="choco-atc-btn">Add to Cart</button>
            </div>
          </div>
        </div>

        {/* ── Horizontal nav arrows ── */}
        <button className="choco-nav-arrow left" onClick={prev} aria-label="Previous theme">
          <ChevronLeft size={22} />
        </button>
        <button className="choco-nav-arrow right" onClick={next} aria-label="Next theme">
          <ChevronRight size={22} />
        </button>
      </div>

      {/* ── Pagination dots ── */}
      <div className="choco-pagination">
        {THEMES.map((t, i) => (
          <div
            key={t.id}
            className={`choco-dot${i === activeIndex ? ' active' : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  )
}
