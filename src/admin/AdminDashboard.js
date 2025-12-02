import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './admin.css';

export default function AdminDashboard() {
  const { user, logout, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showNewCountry, setShowNewCountry] = useState(false);
  const [newCountry, setNewCountry] = useState({ code: '', name: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [countriesRes, pendingRes] = await Promise.all([
        fetch('/api/cms/countries?lang=es', { headers: getAuthHeaders() }),
        user.role === 'admin' ? fetch('/api/cms/pending', { headers: getAuthHeaders() }) : Promise.resolve({ ok: true, json: () => ({ changes: [] }) })
      ]);

      if (countriesRes.ok) {
        const data = await countriesRes.json();
        setCountries(data.countries);
      }

      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingCount(data.changes?.length || 0);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  }

  async function handleCreateCountry(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/cms/countries', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...newCountry, lang: 'es' })
      });

      if (res.ok) {
        setShowNewCountry(false);
        setNewCountry({ code: '', name: '' });
        loadData();
      }
    } catch (error) {
      console.error('Error creating country:', error);
    }
  }

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  if (loading) {
    return <div className="admin-loading">Cargando...</div>;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-left">
          <h1>Wiki<span>Conflicts</span> CMS</h1>
        </div>
        <div className="admin-header-right">
          <span className="admin-user-name">{user.name}</span>
          <span className="admin-user-role">{user.role === 'admin' ? 'Administrador' : 'Editor'}</span>
          <button onClick={handleLogout} className="admin-btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      <nav className="admin-nav">
        <Link to="/admin" className="admin-nav-item active">Países</Link>
        {user.role === 'admin' && (
          <>
            <Link to="/admin/users" className="admin-nav-item">Usuarios</Link>
            <Link to="/admin/pending" className="admin-nav-item">
              Pendientes {pendingCount > 0 && <span className="admin-badge">{pendingCount}</span>}
            </Link>
          </>
        )}
        <Link to="/admin/media" className="admin-nav-item">Medios</Link>
        <a href="/" className="admin-nav-item admin-nav-back">← Volver al sitio</a>
      </nav>

      <main className="admin-main">
        <div className="admin-section">
          <div className="admin-section-header">
            <h2>Países</h2>
            {(user.role === 'admin' || user.permissions?.canCreate) && (
              <button onClick={() => setShowNewCountry(true)} className="admin-btn-primary">
                + Nuevo País
              </button>
            )}
          </div>

          {showNewCountry && (
            <div className="admin-modal-overlay">
              <div className="admin-modal">
                <h3>Crear Nuevo País</h3>
                <form onSubmit={handleCreateCountry}>
                  <div className="admin-form-group">
                    <label>Código (ej: syria, yemen)</label>
                    <input
                      type="text"
                      value={newCountry.code}
                      onChange={(e) => setNewCountry({ ...newCountry, code: e.target.value.toLowerCase().replace(/[^a-z]/g, '') })}
                      required
                      placeholder="codigo-del-pais"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Nombre</label>
                    <input
                      type="text"
                      value={newCountry.name}
                      onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })}
                      required
                      placeholder="Nombre del País"
                    />
                  </div>
                  <div className="admin-modal-actions">
                    <button type="button" onClick={() => setShowNewCountry(false)} className="admin-btn-secondary">
                      Cancelar
                    </button>
                    <button type="submit" className="admin-btn-primary">
                      Crear País
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="admin-countries-grid">
            {countries.map(country => {
              const hasAccess = user.role === 'admin' || 
                user.countries?.includes('all') || 
                user.countries?.includes(country.code);
              
              return (
                <div 
                  key={country.code} 
                  className={`admin-country-card ${!hasAccess ? 'disabled' : ''}`}
                >
                  <h3>{country.name}</h3>
                  <p className="admin-country-code">{country.code}</p>
                  <p className="admin-country-sections">
                    {country.sections?.length || 0} secciones
                  </p>
                  {hasAccess ? (
                    <Link to={`/admin/country/${country.code}`} className="admin-btn-secondary">
                      Gestionar
                    </Link>
                  ) : (
                    <span className="admin-no-access">Sin acceso</span>
                  )}
                </div>
              );
            })}

            {countries.length === 0 && (
              <div className="admin-empty">
                <p>No hay países configurados</p>
                <p>Haz clic en "Nuevo País" para comenzar</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
