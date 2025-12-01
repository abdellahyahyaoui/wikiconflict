// src/components/MapEurope.js
"use client"

import React, { useState } from "react"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import { geoCentroid } from "d3-geo"
import "./WorldMap.css"
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// Lista completa de países europeos (nombres tal como aparecen en world-atlas)
const europeCountries = [
  "Andorra","Belarus","Belgium",
 "France",
  "Germany","Greece","Ireland","Italy",
 
  "Netherlands","Poland","Portugal","Spain",
  "Switzerland","Ukraine","United Kingdom","Vatican"
]

// Países que mostrarán el marcador de conflicto (normalizados, sin espacios, sin acentos)
// Puedes añadir más aquí (ej: "venezuela", "democraticrepublicofthecongo")
const CONFLICTS_NORMALIZED = new Set(["ukraine"])

function normalizeForFilename(name) {
  if (!name) return ""
  // 1) quitar diacríticos
  const noDiacritics = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  // 2) conservar sólo letras y números, eliminar espacios y símbolos
  const alnum = noDiacritics.replace(/[^0-9a-zA-Z]/g, "")
  // 3) minúsculas
  return alnum.toLowerCase()
}

function getCountryIdFromGeo(geo) {
  const name = (geo.properties.name || "").toLowerCase()
  if (geo.id === "732" || name === "morocco" || name === "western sahara") return "morocco"
  const israelIds = ["376", "275"]
  const israelNames = ["israel", "palestine", "west bank", "gaza"]
  if (israelIds.includes(geo.id) || israelNames.includes(name)) return "palestine"
  if (name === "saudi arabia") return "saudi"
  if (name === "united arab emirates") return "uae"
  return name.replace(/\s+/g, "-")
}

export default function MapEurope() {
  const [hoveredCountry, setHoveredCountry] = useState(null) // id normalizado con guiones (country-id)
  const [hoveredPlainName, setHoveredPlainName] = useState(null) // nombre tal cual del geo.properties.name

  const handleCountryClick = (countryId) => {
    const routeId = countryId === "israel" ? "palestine" : countryId
    window.location.href = `/country/${routeId}`
  }

  const imagePathFromPlainName = (plainName) => {
    const filename = normalizeForFilename(plainName) + ".png"
    const rawPath = `/Imágenes de País/${filename}`
    return encodeURI(rawPath)
  }

  return (
    <div className="map-wrapper" style={{ position: "relative" }}>
      <ComposableMap
        projection="geoMercator"
        // centro y escala que muestran bien Europa
        projectionConfig={{ scale: 800, center: [10, 50] }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies
              .filter((geo) => geo.properties && europeCountries.includes(geo.properties.name))
              .map((geo) => {
                const countryId = getCountryIdFromGeo(geo)
                const isHovered = hoveredCountry === countryId
                const fill = isHovered ? "#6e7b4e46" : "#000000ff"

                return (
                  <React.Fragment key={geo.rsmKey}>
                    <Geography
                      geography={geo}
                      onClick={() => handleCountryClick(countryId)}
                      onMouseEnter={() => {
                        setHoveredCountry(countryId)
                        setHoveredPlainName(geo.properties.name)
                      }}
                      onMouseLeave={() => {
                        setHoveredCountry(null)
                        setHoveredPlainName(null)
                      }}
                     fill={isHovered ? "#184a5f" : "#07202b"}
                      stroke="#ffffffff"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none", cursor: "pointer" },
                        hover: { outline: "none", fill: "#184a5f" },
                        pressed: { outline: "none" },
                      }}
                    />

                    {/* Marker de conflicto: si el nombre normalizado (sin espacios ni acentos) está en CONFLICTS_NORMALIZED */}
                    {CONFLICTS_NORMALIZED.has((geo.properties.name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^0-9a-zA-Z]/g, "").toLowerCase()) ? (
                      (() => {
                        const centroid = geoCentroid(geo)
                        // centroid = [lng, lat] o [NaN, NaN] en casos muy pequeños; comprobamos
                        if (!centroid || isNaN(centroid[0]) || isNaN(centroid[1])) return null
                        return (
                          <Marker key={`m-${geo.rsmKey}`} coordinates={centroid}>
                            <g
                              onMouseEnter={() => {
                                setHoveredCountry(countryId)
                                setHoveredPlainName(geo.properties.name)
                              }}
                              onMouseLeave={() => {
                                setHoveredCountry(null)
                                setHoveredPlainName(null)
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              <circle r="20" className="conflict-marker-pulse" />
                              <circle r="20" className="conflict-marker-pulse" style={{ animationDelay: "0.5s" }} />
                              <circle r="20" className="conflict-marker-pulse" style={{ animationDelay: "1s" }} />
                              <circle r="20" className="conflict-marker-pulse" style={{ animationDelay: "1.5s" }} />
                              <circle r="6" fill="#ef4444" stroke="white" strokeWidth="1" />
                            </g>
                          </Marker>
                        )
                      })()
                    ) : null}
                  </React.Fragment>
                )
              })
          }
        </Geographies>
      </ComposableMap>

      {/* POPUP CIRCULAR - idéntico al de tu WorldMap */}
      {hoveredPlainName && (
        (() => {
          const displayName = hoveredPlainName
          const imageSrc = imagePathFromPlainName(displayName)

          return (
            <div
              className="country-popup-circle"
              style={{
                position: "absolute",
                top: "-90px",
                left: "320px",
                width: 200,
                height: 200,
                borderRadius: "50%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#ffffffee",
                boxShadow: "0 0 15px rgba(0,0,0,0.3)",
                padding: "10px",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <img
                src={imageSrc}
                alt={displayName}
                style={{ width: "80px", height: "80px", borderRadius: "50%", marginBottom: "10px", objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = encodeURI("/Imágenes de País/placeholder.png")
                }}
              />
              <h3 style={{ fontSize: "16px", margin: 0 }}>{displayName}</h3>
              <p style={{ fontSize: "12px", margin: 0 }}>Información disponible próximamente.</p>
            </div>
          )
        })()
      )}
    </div>
  )
}
