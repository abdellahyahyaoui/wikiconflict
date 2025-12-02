# WikiConflicts - Interactive Conflict Documentation Platform

## Overview
WikiConflicts is a React-based web application that provides interactive documentation and visualization of global conflicts. The application features an interactive world map with detailed country-specific information including testimonies, media galleries, analyst perspectives, and terminology databases.

## Project Architecture

### Technology Stack
- **Frontend Framework**: React 18.2.0
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Routing**: React Router DOM v6.20.0
- **Mapping Library**: react-simple-maps v3.0.0
- **Language**: JavaScript/TypeScript

### Project Structure
```
├── public/
│   ├── data/           # Country-specific conflict data (JSON)
│   │   ├── es/         # Spanish language data
│   │   │   ├── palestine/  # Palestine conflict data
│   │   │   │   ├── testimonies/  # Witness testimonies
│   │   │   │   ├── analysts/     # Expert analysis
│   │   │   │   ├── media/        # Images and videos
│   │   │   │   └── meta.json
│   │   │   ├── morocco/
│   │   │   ├── libya/
│   │   │   ├── algeria/
│   │   │   └── terminology/  # Conflict terminology database
│   ├── flags/          # Country flag images
│   ├── imagenes/       # General images
│   └── index.html
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── WorldMap.js         # Main interactive map
│   │   ├── MapAfrica.js        # Africa region map
│   │   ├── MapAsia.js          # Asia region map
│   │   ├── MapEurope.js        # Europe region map
│   │   ├── MapLatinAmerica.js  # Latin America map
│   │   ├── FloatingCountries.jsx
│   │   ├── MobileMenu.jsx
│   │   └── MobileNavigation.jsx
│   ├── context/
│   │   └── LanguageContext.js  # Multi-language support
│   ├── layout/
│   │   ├── CountryLayout.jsx   # Country page layout
│   │   ├── CountryHeader.jsx
│   │   ├── CountryContent.jsx
│   │   ├── CountrySidebar.jsx
│   │   └── MediaGallery.jsx
│   ├── pages/
│   │   ├── Home.js             # Homepage with world map
│   │   └── Country.js          # Country detail page
│   ├── utils/
│   │   └── dataLoader.js       # Data loading utilities
│   └── App.js
└── package.json
```

### Key Features
1. **Interactive World Map**: Browse conflicts by clicking on different regions/countries
2. **Multi-language Support**: Content available in multiple languages (Spanish data present)
3. **Rich Content Types**:
   - Witness testimonies with detailed accounts
   - Analyst perspectives and expert commentary
   - Media galleries (images and videos)
   - Terminology database with key concepts, organizations, and figures
4. **Mobile-Responsive**: Dedicated mobile navigation and menu components

## Replit Configuration

### Environment Variables (Development)
- `PORT=5000` - Server port
- `HOST=0.0.0.0` - Bind to all network interfaces
- `DANGEROUSLY_DISABLE_HOST_CHECK=true` - Allow Replit proxy access
- `WDS_SOCKET_PORT=0` - WebSocket configuration for HMR

### Workflow
- **Name**: Start application
- **Command**: `npm start`
- **Port**: 5000 (webview)
- **Type**: Frontend development server

## Development

### Running Locally
The application runs automatically via the configured workflow. The development server will:
- Start on port 5000
- Hot reload on file changes
- Display ESLint warnings in the console

### Build for Production
```bash
npm run build
```
Creates an optimized production build in the `/build` folder.

### Known ESLint Warnings
The codebase has some non-critical ESLint warnings:
- Unused variables in map components
- React Hook dependency warnings
These do not affect functionality.

## Data Structure

### Country Data Format
Each country has its own folder under `/public/data/es/` with:
- `meta.json` - Country metadata
- `description.json` - Country description
- `testimonies/` - Witness testimony files
- `analysts/` - Expert analysis files
- `media/` - Image and video metadata

### Adding New Countries
1. Create a new folder under `/public/data/es/[country-name]/`
2. Add required JSON files following the palestine folder structure
3. Update the map components to include the new country

## Recent Changes
- **2024-12-02**: Major feature additions
  - Added Timeline section with newspaper-style layout showing chronological events
  - Added Resistance section for "Guardianes" stories (same structure as Testimonios)
  - Added Collaborate button in header linking to PayPal donations
  - Added social media icons in footer (Twitter, Instagram, Telegram, YouTube)
  - Improved map design: cleaner, more professional look, subtle hover effects
  - Updated translations in 4 languages (es, en, ar, eu)
  - Configured new section order: Description → Timeline → Testimonios → Resistencia → Fototeca

- **2024-12-02**: Initial Replit environment setup
  - Installed all dependencies
  - Configured environment variables for Replit proxy
  - Set up workflow on port 5000
  - Verified application runs successfully

## Deployment
This is a static React application that can be deployed using:
- Static hosting (configured for Replit deployment)
- Build output: `/build` folder
- No backend required

## Notes
- The application is primarily in Spanish (es) language
- Data is stored as static JSON files in the public folder
- No database or backend API required
- All content is client-side rendered
