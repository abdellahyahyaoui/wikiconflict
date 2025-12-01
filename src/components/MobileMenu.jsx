"use client"

import "./mobile-menu.css"

export default function MobileMenu({ countryName, sections, onClose, onSelectSection, onHome, isGlobal = false }) {
  return (
    <div className="mobile-menu-overlay">
      <div className="mobile-menu-header">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        <h2 className="menu-title">Menú</h2>
      </div>

      <div className="mobile-menu-content">
        <button className="menu-item home-link" onClick={onHome}>
          Inicio
        </button>

        <div className="menu-divider"></div>

        {isGlobal ? (
          <h3 className="menu-section-title">Secciones Globales</h3>
        ) : (
          <h3 className="menu-section-title">Secciones de {countryName}</h3>
        )}

        <div className="menu-sections-list">
          <button className="menu-item section-link" onClick={() => onSelectSection("terminology-conceptos")}>
            Terminología
          </button>

          {sections && sections.length > 0 ? (
            sections.map((section) => {
              if (section.id === "media-gallery") {
                return (
                  <div key="media-group" className="menu-media-group">
                    <button className="menu-item section-link" onClick={() => onSelectSection("media-gallery-images")}>
                      Fotos
                    </button>
                    <button className="menu-item section-link" onClick={() => onSelectSection("media-gallery-videos")}>
                      Vídeos
                    </button>
                  </div>
                )
              }
              if (section.id.startsWith("terminology")) return null

              return (
                <button key={section.id} className="menu-item section-link" onClick={() => onSelectSection(section.id)}>
                  {section.title || section.name || section.label}
                </button>
              )
            })
          ) : (
            <div className="menu-fallback">
              <button className="menu-item section-link" onClick={() => onSelectSection("description")}>
                Descripción del conflicto
              </button>
              <button className="menu-item section-link" onClick={() => onSelectSection("testimonies")}>
                Testimonios
              </button>
              <button className="menu-item section-link" onClick={() => onSelectSection("analysts")}>
                Análisis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
