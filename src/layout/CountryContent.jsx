"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "../context/LanguageContext"
import "./country-content.css"
import "./timeline.css"
import MediaGallery from "./MediaGallery"

export default function CountryContent({ countryCode, section, searchTerm = "" }) {
  const { lang, t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState("index")
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedLetter, setSelectedLetter] = useState(null)
  const [availableLetters, setAvailableLetters] = useState([])
  const [currentCategory, setCurrentCategory] = useState(null)
  const [analysesIndex, setAnalysesIndex] = useState(null)
  const [globalTerminologyResults, setGlobalTerminologyResults] = useState([])
  const [isGlobalSearching, setIsGlobalSearching] = useState(false)
  const [isChaptersMenuOpen, setIsChaptersMenuOpen] = useState(false)

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      if (section.startsWith("terminology-")) {
        performGlobalTerminologySearch(searchTerm)
      }
      // Search is now applied via filteredItems for other sections
    } else {
      setGlobalTerminologyResults([])
      setIsGlobalSearching(false)
    }
  }, [searchTerm, section, lang])

  async function performGlobalTerminologySearch(term) {
    setIsGlobalSearching(true)
    const categories = ["personajes", "organizaciones", "conceptos"]
    const allLetters = "abcdefghijklmnopqrstuvwxyz".split("")
    let allResults = []

    try {
      for (const category of categories) {
        for (const letter of allLetters) {
          try {
            const res = await fetch(`/data/${lang}/terminology/${category}/${letter}.json`)
            if (res.ok) {
              const json = await res.json()
              const filtered = (json.items || []).filter((item) => {
                const searchLower = term.toLowerCase()
                return (
                  item.name?.toLowerCase().includes(searchLower) ||
                  item.title?.toLowerCase().includes(searchLower) ||
                  item.content?.toLowerCase().includes(searchLower)
                )
              })
              allResults = [...allResults, ...filtered.map((item) => ({ ...item, category, letter }))]
            }
          } catch {
            // Skip missing files
          }
        }
      }
      setGlobalTerminologyResults(allResults)
    } catch (err) {
      console.error("[v0] Error in global terminology search:", err)
    }
    setIsGlobalSearching(false)
  }

  useEffect(() => {
    loadSection()
  }, [section, countryCode, lang])

  async function loadSection() {
    setLoading(true)
    setView("index")
    setSelectedItem(null)
    setSelectedLetter(null)
    setItems([])
    setAnalysesIndex(null)
    setGlobalTerminologyResults([])
    setIsGlobalSearching(false)

    try {
      if (section.startsWith("terminology-")) {
        const category = section.replace("terminology-", "")
        setCurrentCategory(category)
        const res = await fetch(`/data/${lang}/terminology.index.json`)
        const json = await res.json()
        const categoryData = json.categories.find((c) => c.id === category)
        if (categoryData) setAvailableLetters(categoryData.letters.map((l) => l.toUpperCase()))
        setView("letters")
      } else if (["testimonies", "analysts", "genocides", "resistance"].includes(section)) {
        const res = await fetch(`/data/${lang}/${countryCode}/${section}.index.json`)
        const json = res.ok ? await res.json() : { items: [] }
        setItems(json.items || [])
        setView(json.items?.length ? "grid" : "empty")
      } else if (section === "timeline") {
        const res = await fetch(`/data/${lang}/${countryCode}/timeline/timeline.index.json`)
        const json = res.ok ? await res.json() : { items: [] }
        setItems(json.items || [])
        setView(json.items?.length ? "timeline" : "empty")
      } else if (["media-gallery-images", "media-gallery-videos"].includes(section)) {
        let mediaItems = []

        if (section === "media-gallery-images") {
          const resImages = await fetch(`/data/${lang}/${countryCode}/media/images.json`)
          const imagesJson = resImages.ok ? await resImages.json() : { images: [] }
          mediaItems = (imagesJson.images || []).map((img) => ({
            ...img,
            url: img.url || img.image || "/placeholder.svg",
            type: "image",
          }))
        } else if (section === "media-gallery-videos") {
          const resVideos = await fetch(`/data/${lang}/${countryCode}/media/videos.json`)
          const videosJson = resVideos.ok ? await resVideos.json() : { videos: [] }
          mediaItems = (videosJson.videos || []).map((vid) => ({
            ...vid,
            url: vid.url || vid.video,
            type: "video",
          }))
        }

        if (mediaItems.length > 0) {
          setItems(mediaItems)
          setView("media-gallery")
        } else {
          setView("empty")
        }
      } else if (section === "description") {
        const res = await fetch(`/data/${lang}/${countryCode}/description.json`)
        if (!res.ok) {
          setView("empty")
        } else {
          const json = await res.json()
          if (json.chapters) {
            setItems(json.chapters)
            setSelectedItem(json.chapters[0] || null)
            setView("chapter-index")
          } else {
            setSelectedItem(json)
            setView("article")
          }
        }
      }
    } catch (err) {
      console.error("[v0] Error loading section:", err)
      setView("empty")
    }

    setLoading(false)
  }

  async function showItemsForLetter(letter) {
    setSelectedLetter(letter)
    try {
      const res = await fetch(`/data/${lang}/terminology/${currentCategory}/${letter.toLowerCase()}.json`)
      const json = res.ok ? await res.json() : { items: [] }
      setItems(json.items || [])
      setView("grid")
    } catch {
      setItems([])
      setView("grid")
    }
  }

  async function loadItemDetail(item) {
    try {
      if (section.startsWith("terminology-")) {
        const category = item.category || section.split("-")[1]
        const letter = item.letter || item.name?.charAt(0).toLowerCase()

        try {
          const res = await fetch(`/data/${lang}/terminology/${category}/${letter}.json`)
          if (res.ok) {
            const json = await res.json()
            const fullItem = json.items?.find((i) => i.id === item.id || i.name === item.name)
            if (fullItem) {
              setSelectedItem({ ...fullItem, category })
            } else {
              setSelectedItem({ ...item, category })
            }
          } else {
            setSelectedItem({ ...item, category })
          }
        } catch {
          setSelectedItem({ ...item, category })
        }

        setView("article-with-letters")
        return
      }

      let path = ""
      if (section === "testimonies") path = `/data/${lang}/${countryCode}/testimonies/${item.id}.json`
      else if (section === "analysts") path = `/data/${lang}/${countryCode}/analysts/${item.id}.json`
      else if (section === "genocides") path = `/data/${lang}/${countryCode}/genocides/${item.id}.json`
      else if (section === "resistance") path = `/data/${lang}/${countryCode}/resistance/${item.id}.json`

      if (path) {
        const res = await fetch(path)

        if (res.ok) {
          const json = await res.json()

          if (json.analyses && Array.isArray(json.analyses)) {
  // Caso ANALYSTS (múltiples análisis)
  setAnalysesIndex({ ...json, type: "analysis" })
  setView("analyses-index")
} else if (json.testimonies && Array.isArray(json.testimonies)) {
  // Caso TESTIMONIES (múltiples testimonios por persona)
  setAnalysesIndex({ ...json, type: "testimony" })
  setView("analyses-index")
} else {
  // Caso normal (artículo único)
  setSelectedItem(json)
  setView("article")
}

        }
      }
    } catch (err) {
      console.error("[v0] Error loading item:", err)
    }
  }

  async function loadSpecificAnalysis(analysisId) {
    try {
      const isTestimony = analysesIndex?.type === "testimony"
      const isResistance = section === "resistance"
      let baseFolder = "analysts"
      if (isTestimony) baseFolder = "testimonies"
      if (isResistance) baseFolder = "resistance"

      const path = `/data/${lang}/${countryCode}/${baseFolder}/${analysesIndex.id}/${analysisId}.json`

      const res = await fetch(path)
      if (res.ok) {
        const json = await res.json()
        setSelectedItem(json)
        setView("article")
      }
    } catch (err) {
      console.error("[v0] Error loading specific analysis:", err)
    }
  }

  async function loadTimelineDetail(item) {
    try {
      const path = `/data/${lang}/${countryCode}/timeline/${item.id}.json`
      const res = await fetch(path)
      if (res.ok) {
        const json = await res.json()
        setSelectedItem(json)
        setView("timeline-article")
      }
    } catch (err) {
      console.error("[v0] Error loading timeline item:", err)
    }
  }

  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      item.title?.toLowerCase().includes(searchLower) ||
      item.content?.toLowerCase().includes(searchLower) ||
      item.shortDescription?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.bio?.toLowerCase().includes(searchLower) ||
      item.summary?.toLowerCase().includes(searchLower) ||
      item.paragraphs?.some((p) => p.toLowerCase().includes(searchLower))
    )
  })

  if (loading) return <div className="content-loading">{t("loading")}</div>
  if (view === "empty") return <div className="content-inner">{t("no-content")}</div>

  const showAlphabetBar =
    section.startsWith("terminology-") && (view === "letters" || view === "article-with-letters" || view === "grid")

  if (showAlphabetBar) {
    const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

    return (
      <div className="content-inner">
        <h2 className="section-header">
          {t("terminology")} -{" "}
          {currentCategory === "personajes"
            ? t("characters")
            : currentCategory === "organizaciones"
              ? t("organizations")
              : t("concepts")}
        </h2>

        {/* Alphabet bar always visible in terminology */}
        <div className="alphabet-bar">
          {allLetters.map((letter) => {
            const hasContent = availableLetters.includes(letter)
            return (
              <span
                key={letter}
                className={`letter ${hasContent ? "has-content" : "no-content"} ${selectedLetter === letter ? "active" : ""}`}
                onClick={() => {
                  if (hasContent) {
                    showItemsForLetter(letter)
                    setSelectedItem(null)
                  }
                }}
                role={hasContent ? "button" : undefined}
                tabIndex={hasContent ? 0 : -1}
                style={{ cursor: hasContent ? "pointer" : "default" }}
                onKeyDown={(e) => {
                  if (hasContent && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault()
                    showItemsForLetter(letter)
                    setSelectedItem(null)
                  }
                }}
              >
                {letter}
              </span>
            )
          })}
        </div>

        {searchTerm && isGlobalSearching && (
          <div className="search-results-info">{t("searching-global-terminology")}</div>
        )}

        {searchTerm && !isGlobalSearching && globalTerminologyResults.length > 0 && (
          <div>
            <div className="search-results-info">
              {globalTerminologyResults.length} {t("results-found")} "{searchTerm}"
            </div>
            <div className="items-grid">
              {globalTerminologyResults.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="item-card"
                  onClick={() => loadItemDetail(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      loadItemDetail(item)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                >
                  <div className="item-icon">
                    <img src={item.image || "/placeholder.svg?height=80&width=80"} alt={item.name} />
                  </div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-category">
                    {item.category === "personajes"
                      ? t("characters")
                      : item.category === "organizaciones"
                        ? t("organizations")
                        : t("concepts")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchTerm && !isGlobalSearching && globalTerminologyResults.length === 0 && (
          <div className="no-results">
            {t("no-results-found")} "{searchTerm}" {t("in-global-terminology")}.
          </div>
        )}

        {/* Show letter content grid when not searching and a letter is selected */}
        {!searchTerm && view === "grid" && selectedLetter && (
          <div className="items-grid">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="item-card"
                onClick={() => loadItemDetail(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    loadItemDetail(item)
                  }
                }}
                role="button"
                tabIndex={0}
                style={{ cursor: "pointer" }}
              >
                <div className="item-icon">
                  <img src={item.image || "/placeholder.svg?height=80&width=80"} alt={item.name} />
                </div>
                <div className="item-name">{item.name}</div>
              </div>
            ))}
          </div>
        )}

        {/* Show article with letters visible */}
        {view === "article-with-letters" && selectedItem && (
          <article className="article-content">
            <button
              className="back-button"
              onClick={() => {
                setSelectedItem(null)
                setView("grid")
              }}
            >
              {t("back-button")}
            </button>
            <h1 className="article-title">{selectedItem.title || selectedItem.name}</h1>
            <div className="article-body">
              {selectedItem.image && (
                <div className="article-media">
                  <img
                    src={selectedItem.image || "/placeholder.svg"}
                    alt={selectedItem.title || selectedItem.name}
                    className="article-image"
                  />
                </div>
              )}
              {selectedItem.video && (
                <div className="article-media">
                  <video src={selectedItem.video} controls className="article-video" />
                </div>
              )}
              <div className="article-text">
                {selectedItem.content && <p>{selectedItem.content}</p>}
                {selectedItem.paragraphs && selectedItem.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          </article>
        )}
      </div>
    )
  }

  if (view === "analyses-index" && analysesIndex) {
    return (
      <div className="content-inner">
        <button className="back-button" onClick={() => loadSection()}>
          {t("back-button")}
        </button>
        <div className="analyst-header">
          {analysesIndex.image && (
            <img src={analysesIndex.image || "/placeholder.svg"} alt={analysesIndex.name} className="analyst-photo" />
          )}
          <div className="analyst-info">
            <h1 className="analyst-name">{analysesIndex.name}</h1>
            {analysesIndex.bio && <p className="analyst-bio">{analysesIndex.bio}</p>}
          </div>
        </div>
       <h2 className="analyses-list-title">
  {analysesIndex.type === "testimony"
    ? t("available-testimonies")
    : t("available-analyses")}
</h2>

<div className="analyses-list">
  {(analysesIndex.type === "testimony"
    ? analysesIndex.testimonies
    : analysesIndex.analyses
  ).map((analysis) => (
            <div
              key={analysis.id}
              className="analysis-card"
              onClick={() => loadSpecificAnalysis(analysis.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  loadSpecificAnalysis(analysis.id)
                }
              }}
              role="button"
              tabIndex={0}
              style={{ cursor: "pointer" }}
            >
              <h3 className="analysis-title">{analysis.title}</h3>
              {analysis.date && <p className="analysis-date">{analysis.date}</p>}
              {analysis.summary && <p className="analysis-summary">{analysis.summary}</p>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (section === "description" && view === "chapter-index") {
    return (
      <div className="description-wrapper">
        <div className="chapters-menu-sticky">
          <h2 className="section-header-inline">{t("conflict-description")}</h2>
          <div className="chapters-nav-container">
            <button className="chapters-hamburger-btn" onClick={() => setIsChaptersMenuOpen(!isChaptersMenuOpen)}>
              <span>☰</span> <span>ÍNDICE DE SECCIONES</span>
            </button>
            {isChaptersMenuOpen && (
              <div className="chapters-dropdown-menu">
                {filteredItems.map((ch) => (
                  <div
                    key={ch.id}
                    className={`chapter-dropdown-item ${selectedItem?.id === ch.id ? "active" : ""}`}
                    onClick={() => {
                      setSelectedItem(ch)
                      setIsChaptersMenuOpen(false)
                    }}
                  >
                    {ch.title}
                  </div>
                ))}
              </div>
            )}
            <div className="chapters-horizontal-menu desktop-only">
              {filteredItems.map((ch) => (
                <div
                  key={ch.id}
                  className={`chapter-tab ${selectedItem?.id === ch.id ? "active" : ""}`}
                  onClick={() => setSelectedItem(ch)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setSelectedItem(ch)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                >
                  {ch.title}
                </div>
              ))}
            </div>
          </div>
        </div>
        {searchTerm && filteredItems.length < items.length && (
          <div className="search-results-info" style={{ padding: "1rem" }}>
            {t("showing-results")} {filteredItems.length} {t("of")} {items.length} {t("for-search-term")} "{searchTerm}"
          </div>
        )}
        {searchTerm && filteredItems.length === 0 && (
          <div className="no-results" style={{ padding: "1rem" }}>
            {t("no-results-found")} "{searchTerm}"
          </div>
        )}
        <div className="chapter-content-scrollable">
          {selectedItem && (
            <article className="article-content">
              <h1 className="article-title">{selectedItem.title}</h1>
              <div className="article-body">
                {selectedItem.image && (
                  <div className="article-media">
                    <img
                      src={selectedItem.image || "/placeholder.svg"}
                      alt={selectedItem.title || selectedItem.name}
                      className="article-image"
                    />
                  </div>
                )}
                {selectedItem.video && (
                  <div className="article-media">
                    <video src={selectedItem.video} controls className="article-video" />
                  </div>
                )}
                <div className="article-text">
                  {selectedItem.content && <p>{selectedItem.content}</p>}
                  {selectedItem.paragraphs && selectedItem.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    )
  }

  if (view === "media-gallery") {
    return (
      <div className="content-inner">
        <h2 className="section-header">{t("media-gallery")}</h2>
        {searchTerm && (
          <div className="search-results-info">
            {t("showing-results")} {filteredItems.length} {t("of")} {items.length} {t("for-search-term")} "{searchTerm}"
          </div>
        )}
        <MediaGallery items={filteredItems} />
        {filteredItems.length === 0 && searchTerm && (
          <div className="no-results">
            {t("no-results-found")} "{searchTerm}"
          </div>
        )}
      </div>
    )
  }

  if (view === "grid") {
    return (
      <div className="content-inner">
        {searchTerm && (
          <div className="search-results-info">
            {t("showing-results")} {filteredItems.length} {t("of")} {items.length} {t("for-search-term")} "{searchTerm}"
          </div>
        )}
        <div className="items-grid">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="item-card"
              onClick={() => loadItemDetail(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  loadItemDetail(item)
                }
              }}
              role="button"
              tabIndex={0}
              style={{ cursor: "pointer" }}
            >
              <div className="item-icon">
                <img src={item.image || "/placeholder.svg?height=80&width=80"} alt={item.name} />
              </div>
              <div className="item-name">{item.name}</div>
            </div>
          ))}
        </div>
        {filteredItems.length === 0 && searchTerm && (
          <div className="no-results">
            {t("no-results-found")} "{searchTerm}"
          </div>
        )}
      </div>
    )
  }

  if (view === "article" && selectedItem) {
    return (
      <div className="content-inner">
        <button
          className="back-button"
          onClick={() => {
            if (analysesIndex) {
              setView("analyses-index")
            } else {
              loadSection()
            }
          }}
        >
          {t("back-button")}
        </button>
        <article className="article-content">
          <h1 className="article-title">{selectedItem.title || selectedItem.name}</h1>
          <div className="article-body">
            {selectedItem.image && (
              <div className="article-media">
                <img
                  src={selectedItem.image || "/placeholder.svg"}
                  alt={selectedItem.title || selectedItem.name}
                  className="article-image"
                />
              </div>
            )}
            {selectedItem.video && (
              <div className="article-media">
                <video src={selectedItem.video} controls className="article-video" />
              </div>
            )}
            <div className="article-text">
              {selectedItem.content && <p>{selectedItem.content}</p>}
              {selectedItem.paragraphs && selectedItem.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
        </article>
      </div>
    )
  }

  if (view === "timeline") {
    return (
      <div className="timeline-container">
        <div className="timeline-header">
          <h2>{t("timeline")}</h2>
          <p>{t("timeline-subtitle")}</p>
        </div>
        <div className="timeline-line">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="timeline-event"
              onClick={() => loadTimelineDetail(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  loadTimelineDetail(item)
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="timeline-date">{item.date}</div>
              <div className="timeline-title">{item.title}</div>
              <div className="timeline-summary">{item.summary}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (view === "timeline-article" && selectedItem) {
    return (
      <div className="content-inner">
        <button className="back-button" onClick={() => loadSection()}>
          {t("back-button")}
        </button>
        <div className="timeline-article">
          <div className="timeline-article-media">
            {selectedItem.image && (
              <img src={selectedItem.image} alt={selectedItem.title} />
            )}
            {selectedItem.video && (
              <video src={selectedItem.video} controls />
            )}
          </div>
          <div className="timeline-article-content">
            <div className="timeline-article-date">{selectedItem.date}</div>
            <h1 className="timeline-article-title">{selectedItem.title}</h1>
            <div className="timeline-article-text">
              {selectedItem.paragraphs && selectedItem.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {selectedItem.sources && (
              <div className="timeline-sources">
                <h4>{t("sources")}</h4>
                <ul>
                  {selectedItem.sources.map((source, i) => (
                    <li key={i}>{source}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}
