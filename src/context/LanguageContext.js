"use client"

import { createContext, useState, useContext, useEffect } from "react"

const LanguageContext = createContext()

const translations = {
  es: {
    "search-placeholder": "Buscar en WikiConflicts...",
    language: "Language",
    characters: "Personajes",
    organizations: "Organizaciones",
    concepts: "Conceptos",
    ukraine: "Ukraine",
    "conflict-description": "Descripción del conflicto",
    "see-testimonies": "Ver testimonios",
    "see-analysis": "Ver análisis",
    photos: "Fotos",
    videos: "Vídeos",
    "no-content": "No hay contenido disponible para esta sección.",
    footer: "© 2025 WikiConflicts — Todos los derechos reservados",
  },
  en: {
    "search-placeholder": "Search WikiConflicts...",
    language: "Language",
    characters: "Characters",
    organizations: "Organizations",
    concepts: "Concepts",
    ukraine: "Ukraine",
    "conflict-description": "Conflict Description",
    "see-testimonies": "See testimonies",
    "see-analysis": "See analysis",
    photos: "Photos",
    videos: "Videos",
    "no-content": "No content available for this section.",
    footer: "© 2025 WikiConflicts — All rights reserved",
    
  },
  ar: {
    "search-placeholder": "ابحث في ويكي كونفليكتس...",
    language: "اللغة",
    characters: "الشخصيات",
    organizations: "المنظمات",
    concepts: "المفاهيم",
    ukraine: "أوكرانيا",
    "conflict-description": "وصف النزاع",
    "see-testimonies": "عرض الشهادات",
    "see-analysis": "عرض التحليل",
    photos: "الصور",
    videos: "مقاطع فيديو",
    "no-content": "لا توجد محتويات متاحة لهذا القسم.",
    footer: "© 2025 WikiConflicts — جميع الحقوق محفوظة",
  },
  eu: {
    "search-placeholder": "Bilatu WikiConflicts-en...",
    language: "Hizkuntza",
    characters: "Pertsonaiak",
    organizations: "Erakundeak",
    concepts: "Kontzeptuak",
    ukraine: "Ukraina",
    "conflict-description": "Gatazkaren deskribapena",
    "see-testimonies": "Testigantzak ikusi",
    "see-analysis": "Azterketa ikusi",
    photos: "Argazkiak",
    videos: "Bideoak",
    "no-content": "Ez dago edukirik atal honetarako.",
    footer: "© 2025 WikiConflicts — Eskubide guztiak erreserbatuta",
  },
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("wikilang") || "es"
  })

  useEffect(() => {
    localStorage.setItem("wikilang", lang)
    document.documentElement.lang = lang
  }, [lang])

  const t = (key) => {
    return translations[lang]?.[key] || translations.es[key] || key
  }

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}
