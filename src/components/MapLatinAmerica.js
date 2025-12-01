"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import "./WorldMap.css";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ---------------------------
// LISTA DE PAISES LATINOAMERICANOS
// ---------------------------
const latinCountries = [
  "Brazil","Argentina","Colombia","Chile","Peru","Venezuela",
  "Bolivia","Paraguay","Uruguay","Ecuador",
 "Trinidad and Tobago",
];

// ---------------------------
// DATOS DE PAISES (POPUPS)
// ---------------------------
const countryData = {
  brazil: { name: "Brasil", coordinates: [-47.8825, -15.7942], image: "/brazil-rio.jpg", description: "El gigante sudamericano.", hasConflict: false },
  argentina: { name: "Argentina", coordinates: [-58.3816, -34.6037], image: "/argentina-buenos-aires.jpg", description: "País austral de gran cultura.", hasConflict: false },
  mexico: { name: "México", coordinates: [-99.1332, 19.4326], image: "/mexico-city.jpg", description: "Centro histórico y cultural.", hasConflict: false },
  colombia: { name: "Colombia", coordinates: [-74.0721, 4.711], image: "/colombia-bogota.jpg", description: "País biodiverso en los Andes.", hasConflict: false },
  chile: { name: "Chile", coordinates: [-70.6693, -33.4489], image: "/chile-santiago.jpg", description: "Entre los Andes y el Pacífico.", hasConflict: false },
  peru: { name: "Perú", coordinates: [-77.0428, -12.0464], image: "/peru-lima.jpg", description: "Cuna del Imperio Inca.", hasConflict: false },
  venezuela: { name: "Venezuela", coordinates: [-66.9036, 10.4806], image: "/venezuela-caracas.jpg", description: "País en conflicto político y social.", hasConflict: true }
};

// ---------------------------
// COMPONENTE PRINCIPAL
// ---------------------------
export default function LatinAmericaMap(){
  const [hoveredCountry, setHoveredCountry] = useState(null);

  const getCountryId = (geo) => geo.properties.name.toLowerCase().replace(/\s+/g, "-");

  const handleCountryClick = (countryId) => {
    window.location.href = `/country/${countryId}`;
  };

  return (
    <div className="map-wrapper" style={{ position: "relative" }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 400, center: [-65, -25] }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies
              .filter((geo) => latinCountries.includes(geo.properties.name))
              .map((geo) => {
                const countryId = getCountryId(geo);
                const isHovered = hoveredCountry === countryId;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleCountryClick(countryId)}
                    onMouseEnter={() => setHoveredCountry(countryId)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    fill={isHovered ? "#184a5f" : "#07202b"}
                    stroke="#ffffff"
                    strokeWidth={0.4}
                    style={{
                      default: { outline: "none", cursor: "pointer" },
                      hover: { outline: "none", fill: "#184a5f" },
                      pressed: { outline: "none" }
                    }}
                  />
                );
              })
          }
        </Geographies>

        {/* MARCADORES PARA PAISES EN CONFLICTO */}
        {Object.entries(countryData).map(([id, data]) => {
          if (!data.hasConflict) return null;
          return (
            <Marker key={id} coordinates={data.coordinates}>
              <g
                onMouseEnter={() => setHoveredCountry(id)}
                onMouseLeave={() => setHoveredCountry(null)}
                style={{ cursor: "pointer" }}
              >
                <circle r="20" className="conflict-marker-pulse" />
                <circle r="20" className="conflict-marker-pulse" style={{ animationDelay: "0.5s" }} />
                <circle r="20" className="conflict-marker-pulse" style={{ animationDelay: "1s" }} />
                <circle r="20" className="conflict-marker-pulse" style={{ animationDelay: "1.5s" }} />
                <circle r="6" fill="#ef4444" stroke="white" strokeWidth="1" />
              </g>
            </Marker>
          );
        })}
      </ComposableMap>

      {/* POPUP CIRCULAR */}
      {hoveredCountry && countryData[hoveredCountry] && (
        <div
          className="country-popup-circle"
          style={{
            position: "absolute",
            top: "-90px",
            left: "220px",
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
  );
}
