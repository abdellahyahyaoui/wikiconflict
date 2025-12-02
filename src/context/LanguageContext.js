"use client"

import { createContext, useState, useContext, useEffect } from "react"

const LanguageContext = createContext()

const translations = {
  es: {
    "search-placeholder": "Buscar en WikiConflicts...",
    language: "Language",
    collaborate: "Colaborar",
    characters: "Personajes",
    organizations: "Organizaciones",
    concepts: "Conceptos",
    ukraine: "Ukraine",
    "conflict-description": "Descripcion del conflicto",
    "see-testimonies": "Ver testimonios",
    "see-analysis": "Ver analisis",
    photos: "Fotos",
    videos: "Videos",
    "no-content": "No hay contenido disponible para esta seccion.",
    footer: "© 2025 WikiConflicts — Todos los derechos reservados",
    timeline: "Cronologia",
    "timeline-subtitle": "Principales acontecimientos del conflicto",
    resistance: "Resistencia",
    guardians: "Guardianes",
    victims: "Victimas",
    sources: "Fuentes",
    "back-button": "Volver",
    loading: "Cargando...",
    "available-testimonies": "Testimonios disponibles",
    "available-analyses": "Analisis disponibles",
  },
  en: {
    "search-placeholder": "Search WikiConflicts...",
    language: "Language",
    collaborate: "Collaborate",
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
    timeline: "Timeline",
    "timeline-subtitle": "Major events of the conflict",
    resistance: "Resistance",
    guardians: "Guardians",
    victims: "Victims",
    sources: "Sources",
    "back-button": "Back",
    loading: "Loading...",
    "available-testimonies": "Available testimonies",
    "available-analyses": "Available analyses",
  },
  ar: {
    "search-placeholder": "ابحث في ويكي كونفليكتس...",
    language: "اللغة",
    collaborate: "تعاون",
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
    timeline: "الجدول الزمني",
    "timeline-subtitle": "الأحداث الرئيسية للنزاع",
    resistance: "المقاومة",
    guardians: "الحراس",
    victims: "الضحايا",
    sources: "المصادر",
    "back-button": "رجوع",
    loading: "جار التحميل...",
    "available-testimonies": "الشهادات المتاحة",
    "available-analyses": "التحليلات المتاحة",
  },
  eu: {
    "search-placeholder": "Bilatu WikiConflicts-en...",
    language: "Hizkuntza",
    collaborate: "Lagundu",
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
    timeline: "Kronologia",
    "timeline-subtitle": "Gatazkaren gertaera nagusiak",
    resistance: "Erresistentzia",
    guardians: "Zaindari",
    victims: "Biktimak",
    sources: "Iturriak",
    "back-button": "Itzuli",
    loading: "Kargatzen...",
    "available-testimonies": "Testigantza eskuragarriak",
    "available-analyses": "Azterketa eskuragarriak",
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
