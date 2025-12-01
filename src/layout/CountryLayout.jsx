"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext"

import CountryHeader from "./CountryHeader"
import CountrySidebar from "./CountrySidebar"
import CountryContent from "./CountryContent"
import MobileMenu from "../components/MobileMenu"

import "./country-layout.css"

export default function CountryLayout() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { lang } = useLanguage()
  const [meta, setMeta] = useState(null)
  const [currentSection, setCurrentSection] = useState(null)
  const [currentCategory, setCurrentCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 860)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    async function loadMeta() {
      try {
        const url = `/data/${lang}/${code}/meta.json`
        const res = await fetch(url)
        if (!res.ok) {
          const minimalMeta = {
            name: code.charAt(0).toUpperCase() + code.slice(1),
            sections: [
              { id: "description", title: "Descripción del conflicto", label: "Descripción del conflicto" },
              { id: "testimonies", title: "Testimonios", label: "Testimonios" },
              { id: "analysts", title: "Análisis", label: "Análisis" },
              { id: "media-gallery", title: "Fototeca", label: "Fototeca" },
            ],
          }
          setMeta(minimalMeta)
          setCurrentSection("description")
          setLoading(false)
          return
        }

        const json = await res.json()
        setMeta(json)

        if (isMobile) {
          setCurrentSection("description")
        } else {
          let firstSection = json.sections?.find((s) => s.id === "description") || json.sections?.[0]
          if (firstSection?.id === "media-gallery") {
            firstSection = { ...firstSection, id: "media-gallery-images" }
          }
          setCurrentSection(firstSection?.id || "description")
        }
      } catch (err) {
        console.error("[v0] Error loading meta.json:", err)
        const minimalMeta = {
          name: code.charAt(0).toUpperCase() + code.slice(1),
          sections: [
            { id: "description", title: "Descripción del conflicto", label: "Descripción del conflicto" },
            { id: "testimonies", title: "Testimonios", label: "Testimonios" },
            { id: "analysts", title: "Análisis", label: "Análisis" },
            { id: "media-gallery", title: "Fototeca", label: "Fototeca" },
          ],
        }
        setMeta(minimalMeta)
        setCurrentSection("description")
      }
      setLoading(false)
    }

    loadMeta()
  }, [code, lang, isMobile])

  function handleSelect(sectionId) {
    setCurrentSection(sectionId)
    setCurrentCategory(null)
    setSearchTerm("")
  }

  function handleSelectCategory(categoryId) {
    setCurrentCategory(categoryId)
  }

  function handleSearch(term) {
    setSearchTerm(term)
  }

  function handleBackMobile() {
    if (currentCategory) {
      setCurrentCategory(null)
    } else if (currentSection !== "description") {
      setCurrentSection("description")
    } else {
      navigate("/")
    }
  }

  if (loading) return <div className="country-loading">Cargando país {code}...</div>
  if (!meta) return <div className="country-loading">No se encontraron datos para {code}</div>

  if (isMobile && meta) {
    return (
      <div className="country-layout mobile-wiki-mode">
        {/* Mobile Specific Header */}
        <div className="mobile-wiki-header">
          <div className="mobile-header-top">
            <div className="mobile-logo-large" onClick={() => navigate("/")}>
              <span className="logo-wiki">Wiki</span>
              <span className="logo-conflicts">Conflicts</span>
            </div>

            <button className="mobile-menu-toggle-btn" onClick={() => setIsMenuOpen(true)}>
              <div className="hamburger-box">
                <span className="hamburger-inner"></span>
              </div>
              <span className="menu-label">Menú</span>
            </button>
          </div>

          <div className="mobile-search-bar">
            <input
              type="search"
              className="mobile-search-input"
              placeholder="Buscar en WikiConflicts..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              aria-label="Buscar contenido"
            />
          </div>

          <h1 className="mobile-country-title">{meta.name}</h1>
        </div>

        {/* Menu Overlay */}
        {isMenuOpen && (
          <MobileMenu
            countryName={meta.name}
            sections={meta.sections}
            onClose={() => setIsMenuOpen(false)}
            onSelectSection={(sectionId) => {
              handleSelect(sectionId)
              setIsMenuOpen(false)
            }}
            onHome={() => navigate("/")}
          />
        )}

        {/* Content Area */}
        <div className="country-content-wrapper mobile-content-padding">
          {currentSection ? (
            <CountryContent
              countryCode={code}
              section={currentSection}
              searchTerm={searchTerm}
              openMenu={setIsMenuOpen}
            />
          ) : (
            <div className="select-prompt">Seleccione una sección del menú para comenzar.</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="country-layout">
      <CountryHeader onHomeClick={() => navigate("/")} onSearch={handleSearch} />

      <div className="country-body">
        {!isMobile && (
          <CountrySidebar
            countryName={meta.name}
            sections={meta.sections}
            currentSection={currentSection}
            onSelectSection={handleSelect}
          />
        )}

        <div className="country-content-wrapper">
          {currentSection ? (
            <CountryContent countryCode={code} section={currentSection} searchTerm={searchTerm} />
          ) : (
            <div>Seleccione una sección</div>
          )}
        </div>
      </div>

      <footer className="country-footer">
        <div className="footer-line"></div>
        <p>© {new Date().getFullYear()} WikiConflicts — Todos los derechos reservados</p>
      </footer>
    </div>
  )
}
