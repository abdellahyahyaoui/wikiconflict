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
- **2024-12-03**: L-Shaped Layout and Timeline Multimedia
  - Implemented L-shaped text layout for content with multimedia - text flows beside media (left/right) then continues full-width below
  - Improved renderContentBlocks algorithm to handle all content orderings (text-before-media, media-before-text, consecutive blocks)
  - Timeline editor now supports full multimedia (images, videos, audio) via RichContentEditor
  - Added individual GET route for timeline events (/countries/:countryCode/timeline/:itemId)
  - Timeline routes save contentBlocks array for rich multimedia content
  - Resistance section now displays article listings per author (like Testimonies section)
  - CSS classes: content-l-shape, l-shape-top, l-shape-media, l-shape-adjacent-text, l-shape-full-width

- **2024-12-03**: CMS Multi-language and Gallery Selection Improvements
  - Added gallery modal to RichContentEditor for selecting media from existing gallery (not just PC uploads)
  - Gallery modal includes filter bar (All/Images/Videos) for easy media selection
  - Added comprehensive country selector in CMS with 40+ countries grouped by region:
    - Middle East (Palestine, Syria, Lebanon, Yemen, Iraq, Iran)
    - Arab Countries (Morocco, Algeria, Tunisia, Libya, Egypt, etc.)
    - European Countries (Ukraine, Greece, Spain, France, etc.)
    - Latin America (Mexico, Colombia, Venezuela, Argentina, etc.)
  - Added language selector (Spanish, English, French, Arabic)
  - Fixed lang parameter propagation in all CMS editors (Testimonies, Resistance)
  - All API calls now use the selected language instead of hardcoded Spanish
  - Created demo layout article (demo-layout.json) demonstrating L/U image positioning

- **2024-12-03**: Rich Content and Gallery Improvements
  - Fixed GalleryManager component to properly load images/videos from API
  - Added Gallery section to CMS for centralized media management
  - Implemented L-shaped and U-shaped text wrapping around images
  - Images support four positions: left (L-wrap), right (L-wrap), center, and full-width
  - Added section headers loading for Testimonies and Resistance sections
  - Created comprehensive test data for Velum articles with rich content
  - Added section-headers.json for customizable section titles and descriptions
  - CSS styles using float and shape-outside for elegant text flow

- **2024-12-02**: Fototeca API Routes Fixed
  - Corrected API routes to follow `/countries/:countryCode/fototeca` convention
  - Updated FototecaEditor.js to use the correct API endpoints
  - All CRUD operations now work correctly in CMS

- **2024-12-02**: Complete CMS Implementation
  - Added Express.js backend server on port 3001 for CMS functionality
  - Implemented username/password authentication system (JSON-based, no database)
  - Created admin panel with WikiConflicts editorial design style
  - Built comprehensive content editors: Timeline, Testimonies, Analysts, Media
  - Added file upload system for images and videos with security protections
  - Implemented granular permission system (create/edit/delete per user)
  - Added country-based access control for editors
  - Security improvements: auto-generated JWT secrets, path traversal protection, random initial passwords
  - Map hover effects with elevation and shadow already implemented

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

## CMS Architecture

### Backend (Express.js - Port 3001)
```
server/
├── index.js              # Main server entry point
├── middleware/
│   └── auth.js           # JWT authentication & permissions
├── routes/
│   ├── auth.js           # Login/logout endpoints
│   ├── cms.js            # Country/section CRUD operations
│   └── upload.js         # Image/video upload handling
└── data/
    ├── users.json        # User accounts (JSON storage)
    ├── pending-changes.json  # Changes awaiting approval
    └── jwt-secret.key    # Auto-generated JWT secret
```

### Admin Panel (React)
```
src/admin/
├── AdminLogin.js         # Login page
├── AdminDashboard.js     # Main dashboard
├── AdminCountry.js       # Country content editor
├── AdminUsers.js         # User management
├── AdminPending.js       # Pending approvals
└── components/
    ├── TimelineEditor.js
    ├── TestimoniesEditor.js
    ├── AnalystsEditor.js
    └── MediaEditor.js
```

### Authentication & Permissions
- **Roles**: admin, editor
- **Permissions per user**: canCreate, canEdit, canDelete, requiresApproval
- **Country access**: Specific countries or 'all'
- **JWT tokens**: Auto-generated secrets, stored securely

### Security Features
- JWT secrets auto-generated on first run
- Path traversal protection on file deletion
- Random initial admin password (shown in logs)
- CORS configured for development

## Deployment
This application requires both frontend and backend:
- **Frontend**: React app on port 5000
- **Backend**: Express.js API on port 3001
- **Storage**: JSON files (no database required)
- Use `npm start` to run both servers concurrently

## Notes
- Multi-language support (es, en, ar, eu)
- Data stored as JSON files in `/public/data/` and `/server/data/`
- CMS panel accessible at `/admin/login`
- Initial admin credentials shown in server logs on first run
