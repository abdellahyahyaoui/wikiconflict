"use client"

import { useState } from "react"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import "./WorldMap.css"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// ---------------------------
// LISTA DE PAISES ASIA (excluye Turkey, Iran y países árabes)
// ---------------------------
const asiaCountries = [
  "China","India","Japan","South Korea","Indonesia","Pakistan","Bangladesh","Philippines"
]

// ---------------------------
// DATOS DE PAISES (POPUPS)
// ---------------------------
const countryData = {
  china: { name: "China", coordinates: [116.4074, 39.9042], image: "/china-beijing.jpg", description: "La nación más poblada del mundo.", hasConflict: false },
  india: { name: "India", coordinates: [77.209, 28.6139], image: "/india-delhi.jpg", description: "Gigante del sur de Asia.", hasConflict: false },
  japan: { name: "Japón", coordinates: [139.6917, 35.6895], image: "/japan-tokyo.jpg", description: "Islas tecnológicas del Pacífico.", hasConflict: false },
  south_korea: { name: "Corea del Sur", coordinates: [126.978, 37.5665], image: "/korea-seoul.jpg", description: "Potencia tecnológica asiática.", hasConflict: false },
  indonesia: { name: "Indonesia", coordinates: [106.8456, -6.2088], image: "/indonesia-jakarta.jpg", description: "Archipiélago más grande del mundo.", hasConflict: false },
}

// ---------------------------
// COMPONENTE
// ---------------------------
export default function MapAsia() {
  const [hoveredCountry, setHoveredCountry] = useState(null)

  const getCountryId = (geo) => {
    const name = geo.properties.name.toLowerCase()
    if (geo.id === "732" || name === "morocco" || name === "western sahara") return "morocco"
    const israelIds = ["376", "275"]
    const israelNames = ["israel", "palestine", "west bank", "gaza"]
    if (israelIds.includes(geo.id) || israelNames.includes(name)) return "palestine"
    if (name === "saudi arabia") return "saudi"
    if (name === "united arab emirates") return "uae"
    return name.replace(/\s+/g, "-")
  }

  const handleCountryClick = (countryId) => {
    const routeId = countryId === "israel" ? "palestine" : countryId
    window.location.href = `/country/${routeId}`
  }

  return (
    <div className="map-wrapper" style={{ position: "relative" }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 550, center: [100, 35] }}
        style={{ width: "100%", height: "105%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies
              .filter((geo) => asiaCountries.includes(geo.properties.name))
              .map((geo) => {
                const countryId = getCountryId(geo)
                const isHovered = hoveredCountry === countryId
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleCountryClick(countryId)}
                    onMouseEnter={() => setHoveredCountry(countryId)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    fill={isHovered ? "#6e7b4e46" : "#000000ff"}
                    stroke="#e6c55b"
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

        {/* MARKERS DE CONFLICTO */}
        {Object.entries(countryData).map(([id, data]) => {
          if (!data.hasConflict) return null
          return (
            <Marker key={id} coordinates={data.coordinates}>
              <g onMouseEnter={() => setHoveredCountry(id)} onMouseLeave={() => setHoveredCountry(null)} style={{ cursor: "pointer" }}>
                <circle r="20" className="conflict-marker-pulse" />
                <circle r="20" className="conflict-marker-pulse" style={{ animationDelay: "0.5s" }} />
                <circle r="20" className="conflict-marker-pulse" style={{ animationDelay: "1s" }} />
                <circle r="20" className="conflict-marker-pulse" style={{ animationDelay: "1.5s" }} />
                <circle r="6" fill="#ef4444" stroke="white" strokeWidth="1" />
              </g>
            </Marker>
          )
        })}
      </ComposableMap>

      {/* POPUP CIRCULAR */}
      {hoveredCountry && countryData[hoveredCountry] && (
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
          }}
        >
          <img src={countryData[hoveredCountry].image} alt={countryData[hoveredCountry].name} style={{ width: "80px", height: "80px", borderRadius: "50%", marginBottom: "10px", objectFit: "cover" }} />
          <h3 style={{ fontSize: "16px", margin: 0 }}>{countryData[hoveredCountry].name}</h3>
          <p style={{ fontSize: "12px", margin: 0 }}>{countryData[hoveredCountry].description}</p>
        </div>
      )}
    </div>
  )
}
