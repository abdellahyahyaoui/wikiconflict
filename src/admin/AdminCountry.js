import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TimelineEditor from './components/TimelineEditor';
import TestimoniesEditor from './components/TestimoniesEditor';
import AnalystsEditor from './components/AnalystsEditor';
import FototecaEditor from './components/FototecaEditor';
import ResistanceEditor from './components/ResistanceEditor';
import './admin.css';

export default function AdminCountry() {
  const { countryCode } = useParams();
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [country, setCountry] = useState(null);
  const [activeSection, setActiveSection] = useState('timeline');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCountry();
  }, [countryCode]);

  async function loadCountry() {
    try {
      const res = await fetch(`/api/cms/countries?lang=es`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const found = data.countries.find(c => c.code === countryCode);
        if (found) {
          setCountry(found);
        } else {
          navigate('/admin');
        }
      }
    } catch (error) {
      console.error('Error loading country:', error);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="admin-loading">Cargando...</div>;
  }

  if (!country) {
    return <div className="admin-loading">País no encontrado</div>;
  }

  const sections = [
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'testimonies', label: 'Testimonios', icon: '👤' },
    { id: 'resistance', label: 'Resistencia', icon: '✊' },
    { id: 'analysts', label: 'Analistas', icon: '📊' },
    { id: 'fototeca', label: 'Fototeca', icon: '🖼️' }
  ];

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-left">
          <Link to="/admin" className="admin-back-link">← Volver</Link>
          <h1>{country.name}</h1>
        </div>
        <div className="admin-header-right">
          <span className="admin-user-name">{user.name}</span>
        </div>
      </header>

      <div className="admin-country-layout">
        <aside className="admin-sidebar">
          <nav className="admin-sidebar-nav">
            {sections.map(section => (
              <button
                key={section.id}
                className={`admin-sidebar-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="admin-sidebar-icon">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="admin-content">
          {activeSection === 'timeline' && (
            <TimelineEditor countryCode={countryCode} />
          )}
          {activeSection === 'testimonies' && (
            <TestimoniesEditor countryCode={countryCode} />
          )}
          {activeSection === 'resistance' && (
            <ResistanceEditor countryCode={countryCode} />
          )}
          {activeSection === 'analysts' && (
            <AnalystsEditor countryCode={countryCode} />
          )}
          {activeSection === 'fototeca' && (
            <FototecaEditor countryCode={countryCode} />
          )}
        </main>
      </div>
    </div>
  );
}
