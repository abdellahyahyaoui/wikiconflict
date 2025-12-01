"use client"

import "./Home.css"
import { useState, useEffect } from "react"

// Tu mapa original (mundo árabe)
import WorldMap from "../components/WorldMap"

// Nuevos mapas que te crearé ahora
import MapLatinAmerica from "../components/MapLatinAmerica"
import MapAfrica from "../components/MapAfrica"
import MapEurope from "../components/MapEurope"
import MapAsia from "../components/MapAsia"

function Home() {
  const [isMobile, setIsMobile] = useState(false)
  const [isAnimated, setIsAnimated] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [mapIndex, setMapIndex] = useState(0)

  const maps = [
    <WorldMap key="arab" />, 
    <MapLatinAmerica key="latam" />,
    
    <MapEurope key="europe" />,
    
  ]

  const nextMap = () => {
    setMapIndex((prev) => (prev + 1) % maps.length)
  }

  const prevMap = () => {
    setMapIndex((prev) => (prev - 1 + maps.length) % maps.length)
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 860)
    checkMobile()
    window.addEventListener("resize", checkMobile)

    const timer = setTimeout(() => setIsAnimated(true), 1500)

    return () => {
      window.removeEventListener("resize", checkMobile)
      clearTimeout(timer)
    }
  }, [])

  if (isMobile) {
    return (
      <div className={`mobile-home ${isAnimated ? "animated" : ""}`}>
        <div className="mobile-home-search">
          <input
            type="search"
            className="mobile-search-input"
            placeholder="Buscar en WikiConflicts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar contenido"
          />
        </div>

        <div className="mobile-brand-center">
          <h1 className="title-main">
            <span className="title-wiki">Wiki</span>
            <span className="title-conflicts">Conflicts</span>
          </h1>
          <p className="mobile-quote">
            "Y mientras el verdugo insista en escribir la historia, mi deber será arrancarle la pluma."
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="home-container">

      {/* TÍTULO Y SUBTÍTULO (NO TOCO NADA) */}
      <div className="title-block">
        <h1 className="title-main">
          <span className="title-wiki">Wiki</span>
          <span className="title-conflicts">Conflicts</span>
        </h1>
        <h2 className="title-sub">La voz de las victimas</h2>
      </div>

      {/* AQUÍ CAMBIAN LOS MAPAS, TODO IGUAL QUE ANTES */}
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {maps[mapIndex]}

        {/* FLECHA IZQUIERDA */}
        <button
          onClick={prevMap}
          style={{
            position: "absolute",
            top: "50%",
            left: "20px",
            transform: "translateY(-50%)",
            background: "#ffffffdd",
            width: "60px",
            height: "60px",
            borderRadius: "8px",
            border: "none",
            fontSize: "32px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
          }}
        >
          ◀
        </button>

        {/* FLECHA DERECHA */}
        <button
          onClick={nextMap}
          style={{
            position: "absolute",
            top: "50%",
            right: "20px",
            transform: "translateY(-50%)",
            background: "#ffffffdd",
            width: "60px",
            height: "60px",
            borderRadius: "8px",
            border: "none",
            fontSize: "32px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
          }}
        >
          ▶
        </button>
      </div>
    </div>
  )
}

export default Home
