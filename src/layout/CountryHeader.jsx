"use client"

import { useState } from "react"
import { useLanguage } from "../context/LanguageContext"
import "./country-header.css"

export default function CountryHeader({ onHomeClick = () => {}, onSearch = () => {} }) {
  const [open, setOpen] = useState(false)
  const { lang, setLang, t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")

  // 🔥 Tus 4 idiomas con MAPAS/IMÁGENES (no emojis)
  const LANGS = [
    { code: "eu", img: "/flags/eu.png", alt: "Euskara" },
    { code: "es", img: "/flags/es.png", alt: "Español" },
    { code: "en", img: "/flags/en.png", alt: "English" },
    { code: "ar", img: "/flags/ar.png", alt: "العربية" },
  ]

  function toggleMenu() {
    setOpen((v) => !v)
  }

  function changeLang(code) {
    setLang(code)
    setOpen(false)

    if (code === "ar") {
      document.body.style.fontFamily = "'Amiri', serif"
      document.body.dir = "rtl"
    } else {
      document.body.style.fontFamily = "'Cinzel', serif"
      document.body.dir = "ltr"
    }

    setTimeout(() => window.location.reload(), 100)
  }

  function handleLogoClick(e) {
    if (e.type === "click" || (e.type === "keydown" && (e.key === "Enter" || e.key === " "))) {
      e.preventDefault()
      onHomeClick()
    }
  }

  function handleSearchChange(e) {
    const value = e.target.value
    setSearchTerm(value)
    onSearch(value)
  }

  return (
    <header className="country-header">
      <div
        className="header-left"
        onClick={handleLogoClick}
        onKeyDown={handleLogoClick}
        role="button"
        tabIndex={0}
        style={{ cursor: "pointer" }}
      >
        <div className="header-logo">
          <span className="logo-wiki">Wiki</span>
          <span className="logo-conflicts">conflicts</span>
        </div>
        <div className="header-quote">La historia contada desde su presente</div>
      </div>

      <div className="header-center">
        <div className="search-wrapper">
          <input
            className="header-search"
            type="search"
            placeholder={t("search-placeholder")}
            aria-label={t("search-placeholder")}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="header-right">
        
        {/* ⭐ NUEVO BOTÓN VERDE — SUSTITUYE AL 🌐 */}
        <button
          className="language-button-green"
          onClick={toggleMenu}
          aria-expanded={open}
          aria-haspopup="true"
          aria-label="Seleccionar idioma"
        >
          Language
        </button>

        {/* ⭐ NUEVO MENÚ ESTILO LanguageSelector */}
        <div className={`language-dropdown ${open ? "open" : ""}`} role="menu">
          {LANGS.map((l) => (
            <div
              key={l.code}
              className={`language-flag-circle ${lang === l.code ? "active" : ""}`}
              onClick={() => changeLang(l.code)}
              role="menuitem"
              title={l.alt}
            >
              <img src={l.img} alt={l.alt} />
            </div>
          ))}
        </div>

      </div>
    </header>
  )
}
