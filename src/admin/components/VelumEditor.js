import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from './ImageUploader';

export default function VelumEditor({ countryCode }) {
  const { user, getAuthHeaders } = useAuth();
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    author: '',
    authorImage: '',
    date: '',
    abstract: '',
    keywords: [],
    sections: [],
    bibliography: []
  });

  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    loadArticles();
  }, [countryCode]);

  async function loadArticles() {
    try {
      const res = await fetch(`/api/cms/velum?lang=es`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setArticles(data.items || []);
      }
    } catch (error) {
      console.error('Error loading VELUM articles:', error);
    }
    setLoading(false);
  }

  function openCreateModal() {
    setEditingArticle(null);
    setFormData({
      id: '',
      title: '',
      author: '',
      authorImage: '',
      date: new Date().toISOString().split('T')[0],
      abstract: '',
      keywords: [],
      sections: [{ title: '', content: '' }],
      bibliography: ['']
    });
    setShowModal(true);
  }

  function openEditModal(article) {
    setEditingArticle(article);
    setFormData({
      id: article.id,
      title: article.title || '',
      author: article.author || '',
      authorImage: article.authorImage || '',
      date: article.date || '',
      abstract: article.abstract || '',
      keywords: article.keywords || [],
      sections: article.sections?.length ? article.sections : [{ title: '', content: '' }],
      bibliography: article.bibliography?.length ? article.bibliography : ['']
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    const body = {
      ...formData,
      id: formData.id || formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30),
      sections: formData.sections.filter(s => s.title.trim() || s.content.trim()),
      bibliography: formData.bibliography.filter(b => b.trim())
    };

    const url = editingArticle
      ? `/api/cms/velum/${editingArticle.id}?lang=es`
      : `/api/cms/velum?lang=es`;

    const method = editingArticle ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      
      if (res.ok) {
        setShowModal(false);
        if (data.pending) {
          alert('Cambio enviado para aprobación');
        }
        loadArticles();
      } else {
        alert(data.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  }

  async function handleDelete(article) {
    if (!window.confirm(`¿Eliminar "${article.title}"?`)) return;

    try {
      const res = await fetch(`/api/cms/velum/${article.id}?lang=es`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        loadArticles();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  }

  function addKeyword() {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData({ ...formData, keywords: [...formData.keywords, newKeyword.trim()] });
      setNewKeyword('');
    }
  }

  function removeKeyword(keyword) {
    setFormData({ ...formData, keywords: formData.keywords.filter(k => k !== keyword) });
  }

  function addSection() {
    setFormData({ ...formData, sections: [...formData.sections, { title: '', content: '' }] });
  }

  function updateSection(index, field, value) {
    const newSections = [...formData.sections];
    newSections[index][field] = value;
    setFormData({ ...formData, sections: newSections });
  }

  function removeSection(index) {
    setFormData({ ...formData, sections: formData.sections.filter((_, i) => i !== index) });
  }

  function addBibliography() {
    setFormData({ ...formData, bibliography: [...formData.bibliography, ''] });
  }

  function updateBibliography(index, value) {
    const newBib = [...formData.bibliography];
    newBib[index] = value;
    setFormData({ ...formData, bibliography: newBib });
  }

  function removeBibliography(index) {
    setFormData({ ...formData, bibliography: formData.bibliography.filter((_, i) => i !== index) });
  }

  const canCreate = user.role === 'admin' || user.permissions?.canCreate;
  const canEdit = user.role === 'admin' || user.permissions?.canEdit;

  if (loading) {
    return <div className="admin-loading">Cargando artículos VELUM...</div>;
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <h2>VELUM - Micro-tesis e Investigaciones</h2>
        {canCreate && (
          <button onClick={openCreateModal} className="admin-btn-primary">
            + Nuevo Artículo
          </button>
        )}
      </div>

      <div className="admin-velum-list">
        {articles.map(article => (
          <div key={article.id} className="admin-velum-card">
            <div className="admin-velum-card-content">
              <div className="admin-velum-meta">
                <span className="admin-velum-date">{article.date}</span>
                <span className="admin-velum-author">{article.author}</span>
              </div>
              <h3 className="admin-velum-title">{article.title}</h3>
              {article.abstract && (
                <p className="admin-velum-abstract">{article.abstract.substring(0, 200)}...</p>
              )}
              {article.keywords && article.keywords.length > 0 && (
                <div className="admin-velum-keywords">
                  {article.keywords.slice(0, 4).map((kw, i) => (
                    <span key={i} className="admin-velum-keyword">{kw}</span>
                  ))}
                </div>
              )}
            </div>
            {canEdit && (
              <div className="admin-velum-actions">
                <button onClick={() => openEditModal(article)} className="admin-btn-secondary small">
                  Editar
                </button>
                <button onClick={() => handleDelete(article)} className="admin-btn-danger small">
                  Eliminar
                </button>
              </div>
            )}
          </div>
        ))}
        {articles.length === 0 && (
          <div className="admin-empty">
            <p>No hay artículos en VELUM</p>
            {canCreate && (
              <button onClick={openCreateModal} className="admin-btn-primary">
                Crear primer artículo
              </button>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal large">
            <h3>{editingArticle ? 'Editar Artículo' : 'Nuevo Artículo VELUM'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Título del artículo"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Autor</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Nombre del autor"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Imagen del autor</label>
                <ImageUploader
                  value={formData.authorImage}
                  onChange={(url) => setFormData({ ...formData, authorImage: url })}
                />
              </div>

              <div className="admin-form-group">
                <label>Resumen (Abstract)</label>
                <textarea
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  rows={4}
                  placeholder="Resumen del artículo..."
                />
              </div>

              <div className="admin-form-group">
                <label>Palabras clave</label>
                <div className="admin-keywords-input">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    placeholder="Añadir palabra clave"
                  />
                  <button type="button" onClick={addKeyword} className="admin-btn-add-keyword">+</button>
                </div>
                <div className="admin-keywords-list">
                  {formData.keywords.map((kw, i) => (
                    <span key={i} className="admin-keyword-tag">
                      {kw}
                      <button type="button" onClick={() => removeKeyword(kw)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="admin-form-group">
                <label>Secciones del artículo</label>
                {formData.sections.map((section, i) => (
                  <div key={i} className="admin-section-item">
                    <div className="admin-section-header">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(i, 'title', e.target.value)}
                        placeholder={`Título de la sección ${i + 1}`}
                      />
                      <button type="button" onClick={() => removeSection(i)} className="admin-btn-remove">×</button>
                    </div>
                    <textarea
                      value={section.content}
                      onChange={(e) => updateSection(i, 'content', e.target.value)}
                      rows={4}
                      placeholder="Contenido de la sección..."
                    />
                  </div>
                ))}
                <button type="button" onClick={addSection} className="admin-btn-add">
                  + Añadir sección
                </button>
              </div>

              <div className="admin-form-group">
                <label>Bibliografía</label>
                {formData.bibliography.map((bib, i) => (
                  <div key={i} className="admin-array-item">
                    <input
                      type="text"
                      value={bib}
                      onChange={(e) => updateBibliography(i, e.target.value)}
                      placeholder="Referencia bibliográfica..."
                    />
                    <button type="button" onClick={() => removeBibliography(i)} className="admin-btn-remove">×</button>
                  </div>
                ))}
                <button type="button" onClick={addBibliography} className="admin-btn-add">
                  + Añadir referencia
                </button>
              </div>

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingArticle ? 'Guardar Cambios' : 'Crear Artículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
