// src/components/MapAfrica.js
"use client"

import React, { useState } from "react"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import "./WorldMap.css"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// Lista de países en conflicto (puedes añadir más ids normalizados más abajo)
const CONFLICTS_NORMALIZED = new Set([
  "democraticrepublicofthecongo", // Congo-Kinshasa (ejemplo)
  // añade aquí más países normalizados si deseas marcadores de conflicto
])

// Normaliza el nombre del país para convertirlo en filename "nombrejunto" sin acentos
function normalizeForFilename(name) {
  if (!name) return ""
  // 1) pasar a NFD y eliminar diacríticos
  const noDiacritics = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  // 2) eliminar caracteres no alfanuméricos
  const alnum = noDiacritics.replace(/[^0-9a-zA-Z]/g, "")
  // 3) pasar a minúsculas
  return alnum.toLowerCase()
}

// Normalizaciones y mapeo de ids (igual que tu WorldMap original)
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

export default function MapAfrica() {
  const [hoveredCountry, setHoveredCountry] = useState(null)
  const [hoveredPlainName, setHoveredPlainName] = useState(null)

  const handleCountryClick = (countryId) => {
    const routeId = countryId === "israel" ? "palestine" : countryId
    window.location.href = `/country/${routeId}`
  }

  // Construye ruta de imagen dentro de public (carpeta: "Imágenes de País")
  const imagePathFromPlainName = (plainName) => {
    const filename = normalizeForFilename(plainName) + ".png" // "southafrica.png"
    const rawPath = `/Imágenes de País/${filename}`
    return encodeURI(rawPath) // maneja espacios y caracteres
  }

  return (
    <div className="map-wrapper" style={{ position: "relative" }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 360, center: [20, 0] }}
        style={{ width: "100%", height: "105%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies
              .filter((geo) => {
                // incluir TODOS los países cuyo continente sea África
                return geo.properties && geo.properties.continent === "Africa"
              })
              .map((geo) => {
                const countryId = getCountryIdFromGeo(geo)
                const isHovered = hoveredCountry === countryId
                const fill = isHovered ? "#6e7b4e46" : "#000000ff"

                return (
                  <Geography
                    key={geo.rsmKey}
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
                    fill={fill}
                    stroke="#ffffffff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none", cursor: "pointer" },
                      hover: { outline: "none", fill: "#6e7b4e46" },
                      pressed: { outline: "none" },
                    }}
                  />
                )
              })
          }
        </Geographies>

        {/* MARCADORES DE CONFLICTO:
            Mostramos marcadores solo si el nombre normalizado del país está en CONFLICTS_NORMALIZED.
            Usamos centroid approximate by projecting coordinates from geo if needed, but para simplicidad
            intentamos usar country centroids provided by the topology if accessible (react-simple-maps doesn't
            give them directly here). Como alternativa liviana, usamos lat/lng aproximados si los tuvieras.
            Aquí dejamos la lógica para que marque si corresponde. */}
        {/** NOTA: Si quieres marcadores exactos, añade un objeto countryData con coordinates para cada país. **/}
        {/* No añadimos markers automáticos sin coordenadas fiables para todos los países para evitar errores visuales */}
      </ComposableMap>

      {/* POPUP CIRCULAR (idéntico al de tu WorldMap) */}
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
                  // fallback: si no existe la imagen, mostramos un placeholder que debes poner en public
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
