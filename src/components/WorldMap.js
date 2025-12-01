"use client"

import { useState } from "react"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import "./WorldMap.css"


const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// ---------------------------
// LISTA DE PAISES ÁRABES + Turquía e Irán
// ---------------------------
const arabCountries = [
  "Algeria", "Bahrain", "Comoros", "Egypt", "Iraq", "Israel", "Jordan",
  "Kuwait", "Lebanon", "Libya", "Mauritania", "Morocco", "Oman", "Qatar",
  "Saudi Arabia", "Sudan", "South Sudan", "Syria", "Tunisia",
  "United Arab Emirates", "Yemen", "Western Sahara",
  "Palestinian Territory, Occupied",
]

const extraArab = ["Turkey", "Iran"]

const regionFilters = arabCountries.concat(extraArab)

// ---------------------------
// DATOS DE PAISES
// ---------------------------
const countryData = {
  morocco: { 
    name: "Marruecos", 
    coordinates: [-6.8498, 34.0209], 
    image: "/flags/ma.png", 
    hasConflict: false 
  },
  palestine: { 
    name: "Palestina", 
    coordinates: [35.2, 31.9], 
    image: "/flags/pa.png", 
    hasConflict: true 
  },
  lebanon: { 
    name: "Líbano", 
    coordinates: [35.5018, 33.8886], 
    image: "/flags/li.png", 
    hasConflict: true
  },
  yemen: { 
    name: "Yemen", 
    coordinates: [44.2075, 15.3694], 
    image: "/flags/ye.png", 
    hasConflict: true 
  },
  turkey: { 
    name: "Turquía", 
    coordinates: [32.8597, 39.9334], 
    image: "/flags/tu.png", 
    hasConflict: false 
  },
  iran: { 
    name: "Irán", 
    coordinates: [51.3890, 35.6892], 
    image: "/flags/ir.png", 
    hasConflict: true 
  },
  algeria: { 
    name: "Argelia", 
    coordinates: [3.0588, 36.7538], 
    image: "/flags/ar.png", 
    hasConflict: false 
  },
  egypt: { 
    name: "Egipto", 
    coordinates: [31.2357, 30.0444], 
    image: "/flags/eg.png", 
    hasConflict: false
  },
  sudan: { 
    name: "Sudán", 
    coordinates: [32.5599, 15.5007], 
    image: "/flags/su.png", 
    hasConflict: true 
  },
  saudi: { 
    name: "Arabia Saudita", 
    coordinates: [46.6753, 24.7136], 
    image: "/flags/ara.png", 
    hasConflict: false 
  },
  uae: { 
    name: "Emiratos Árabes Unidos", 
    coordinates: [54.3705, 24.4539], 
    image: "/flags/em.png", 
    hasConflict: false 
  },
  qatar: { 
    name: "qatar", 
    coordinates: [51.531, 25.2854], 
    image: "/flags/qa.png", 
    hasConflict: false 
  },
  bahrain: { 
    name: "Baréin", 
    coordinates: [50.5577, 26.0667], 
    image: "/flags/ba.png", 
    hasConflict: false 
  },
  jordan: { 
    name: "Jordania", 
    coordinates: [35.9456, 31.9454], 
    image: "/flags/jo.png", 
    hasConflict: false 
  },
  iraq: { 
    name: "Irak", 
    coordinates: [44.3661, 33.3152], 
    image: "/flags/ira.png", 
    hasConflict: false
  },
  kuwait: { 
    name: "Kuwait", 
    coordinates: [47.9774, 29.3759], 
    image: "/flags/ku.png", 
    hasConflict: false 
  },
  libya: { 
    name: "Libia", 
    coordinates: [13.1913, 32.8872], 
    image: "/flags/li.png", 
    hasConflict: true
  },
  tunisia: { 
    name: "Túnez", 
    coordinates: [10.1815, 36.8065], 
    image: "/flags/tun.png", 
    hasConflict: false 
  },
  oman: { 
    name: "Omán", 
    coordinates: [58.4059, 23.588], 
    image: "/flags/om.png", 
    hasConflict: false 
  },
  mauritania: { 
    name: "Mauritania", 
    coordinates: [-15.9785, 18.0735], 
    image: "/flags/mau.png", 
    hasConflict: false 
  },
  comoros: { 
    name: "Comoras", 
    coordinates: [43.2418, -11.7172], 
    image: "/flags/co.png", 
    hasConflict: false 
  },
  syria: { 
    name: "Siria",
    coordinates: [38.9968, 34.8021], 
    image: "/flags/si.png", 
    hasConflict:true
  },
}

// ---------------------------
// COMPONENTE
// ---------------------------
export default function WorldMap() {
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
        projectionConfig={{ scale: 700, center: [25, 28] }}
        style={{ width: "100%", height: "105%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies
              .filter((geo) => regionFilters.includes(geo.properties.name) || geo.id === "732" || geo.id === "275")
              .map((geo) => {
                const countryId = getCountryId(geo)
                const isLifted = hoveredCountry === countryId

                return (
                  <Geography
  key={geo.rsmKey}
  geography={geo}
  onClick={() => handleCountryClick(countryId)}
  onMouseEnter={() => setHoveredCountry(countryId)}
  onMouseLeave={() => setHoveredCountry(null)}
  className={`${isLifted ? "country-lifted" : ""} ${countryData[countryId]?.hasConflict ? "conflict-country" : ""}`}
  fill={isLifted ? "#1E4350" : "#0C1E28"}
stroke="#F2F5F7"
  strokeWidth={0.5}
  style={{
    default: { outline: "none", cursor: "pointer" },
    hover: { outline: "none" },
    pressed: { outline: "none" },
  }}
/>
                )
              })
          }
        </Geographies>

        {/* SOLO MARCADORES EN CONFLICTO */}
        {Object.entries(countryData).map(([id, data]) => {
          if (!data.hasConflict) return null
          return (
           <Marker key={id} coordinates={data.coordinates}>
  <g
    className="conflict-marker-group"
    aria-label={`${data.name} — posible zona de conflicto`}
    role="img"
  >
    <circle className="conflict-wave" />
    <circle className="conflict-wave" />
    <circle className="conflict-wave" />
  </g>
</Marker>

          )
        })}
      </ComposableMap>

      {/* POPUP CIRCULAR FIJO ARRIBA-IZQUIERDA */}
      {hoveredCountry && countryData[hoveredCountry] && (
        <div
          className="country-popup-circle"
          
           
        >
          <img
            src={countryData[hoveredCountry].image}
            alt={countryData[hoveredCountry].name}
            style={{ width: "80px", height: "80px", borderRadius: "50%", marginBottom: "10px", objectFit: "cover" }}
          />
          <h3 style={{ fontSize: "16px", margin: 0 }}>{countryData[hoveredCountry].name}</h3>
          <p style={{ fontSize: "12px", margin: 0 }}>{countryData[hoveredCountry].description}</p>
        </div>
      )}
    </div>
  )
}
