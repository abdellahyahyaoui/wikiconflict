"use client"

import "./Home.css"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"

import WorldMap from "../components/WorldMap"
import MapLatinAmerica from "../components/MapLatinAmerica"
import MapAfrica from "../components/MapAfrica"
import MapEurope from "../components/MapEurope"
import MapAsia from "../components/MapAsia"

const regions = [
  {
    name: "Oriente Medio",
    countries: [
      { id: "palestine", name: "Palestina", flag: "/flags/pa.png", hasConflict: true },
      { id: "lebanon", name: "Líbano", flag: "/flags/li.png", hasConflict: true },
      { id: "yemen", name: "Yemen", flag: "/flags/ye.png", hasConflict: true },
      { id: "syria", name: "Siria", flag: "/flags/sy.png", hasConflict: true },
      { id: "iran", name: "Irán", flag: "/flags/ir.png", hasConflict: true },
      { id: "iraq", name: "Irak", flag: "/flags/ira.png", hasConflict: false },
    ]
  },
  {
    name: "África",
    countries: [
      { id: "sudan", name: "Sudán", flag: "/flags/su.png", hasConflict: true },
      { id: "morocco", name: "Marruecos", flag: "/flags/ma.png", hasConflict: false },
      { id: "algeria", name: "Argelia", flag: "/flags/ar.png", hasConflict: false },
      { id: "libya", name: "Libia", flag: "/flags/li.png", hasConflict: false },
      { id: "egypt", name: "Egipto", flag: "/flags/eg.png", hasConflict: false },
    ]
  },
  {
    name: "Europa",
    countries: [
      { id: "ukraine", name: "Ucrania", flag: "/flags/ukr.png", hasConflict: true },
    ]
  },
  {
    name: "América Latina",
    countries: [
      { id: "venezuela", name: "Venezuela", flag: "/flags/ve.png", hasConflict: true },
    ]
  }
]

function Home() {
  const [isMobile, setIsMobile] = useState(false)
  const [isAnimated, setIsAnimated] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [mapIndex, setMapIndex] = useState(0)
  const navigate = useNavigate()

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

    const timer = setTimeout(() => setIsAnimated(true), 800)

    return () => {
      window.removeEventListener("resize", checkMobile)
      clearTimeout(timer)
    }
  }, [])

  const filteredRegions = regions.map(region => ({
    ...region,
    countries: region.countries.filter(country => 
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(region => region.countries.length > 0)

  if (isMobile) {
    return (
      <div className={`mobile-home ${isAnimated ? "animated" : ""}`}>
        <Link to="/admin/login" className="admin-button-mobile">
          Admin
        </Link>
        
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
        
        <div className="mobile-countries-container">
          {filteredRegions.map((region) => (
            <div key={region.name} className="mobile-region">
              <h3 className="mobile-region-title">{region.name}</h3>
              <div className="mobile-countries-grid">
                {region.countries.map((country) => (
                  <div
                    key={country.id}
                    className={`mobile-country-circle ${country.hasConflict ? 'has-conflict' : ''}`}
                    onClick={() => navigate(`/country/${country.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/country/${country.id}`)
                      }
                    }}
                  >
                    <div className="country-circle-inner">
                      <span className="country-circle-name">{country.name}</span>
                      {country.hasConflict && (
                        <span className="country-conflict-badge"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="home-container">
      <Link to="/admin/login" className="admin-button">
        Admin
      </Link>

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
