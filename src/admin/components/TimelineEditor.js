import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from './ImageUploader';

export default function TimelineEditor({ countryCode }) {
  const { user, getAuthHeaders } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    date: '',
    year: '',
    month: '',
    title: '',
    summary: '',
    image: '',
    video: '',
    paragraphs: [],
    sources: []
  });
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => {
    loadItems();
  }, [countryCode]);

  async function loadItems() {
    try {
      const res = await fetch(`/api/cms/countries/${countryCode}/timeline?lang=es`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error loading timeline:', error);
    }
    setLoading(false);
  }

  function openCreateModal() {
    setEditingItem(null);
    setFormData({
      id: '',
      date: '',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      title: '',
      summary: '',
      image: '',
      video: '',
      paragraphs: [''],
      sources: ['']
    });
    setShowModal(true);
  }

  function openEditModal(item) {
    setEditingItem(item);
    setFormData({
      id: item.id,
      date: item.date || '',
      year: item.year || '',
      month: item.month || '',
      title: item.title || '',
      summary: item.summary || '',
      image: item.image || '',
      video: item.video || '',
      paragraphs: item.paragraphs || [''],
      sources: item.sources || ['']
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    const url = editingItem
      ? `/api/cms/countries/${countryCode}/timeline/${editingItem.id}?lang=es`
      : `/api/cms/countries/${countryCode}/timeline?lang=es`;
    
    const method = editingItem ? 'PUT' : 'POST';

    const body = {
      ...formData,
      id: formData.id || formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      year: parseInt(formData.year) || null,
      month: parseInt(formData.month) || null,
      paragraphs: formData.paragraphs.filter(p => p.trim()),
      sources: formData.sources.filter(s => s.trim())
    };

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
          alert('Cambio enviado para aprobación del administrador');
        }
        loadItems();
      } else {
        alert(data.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`¿Eliminar "${item.title}"?`)) return;

    try {
      const res = await fetch(`/api/cms/countries/${countryCode}/timeline/${item.id}?lang=es`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await res.json();
      
      if (res.ok) {
        if (data.pending) {
          alert('Eliminación enviada para aprobación');
        }
        loadItems();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  }

  function addParagraph() {
    setFormData({ ...formData, paragraphs: [...formData.paragraphs, ''] });
  }

  function updateParagraph(index, value) {
    const newParagraphs = [...formData.paragraphs];
    newParagraphs[index] = value;
    setFormData({ ...formData, paragraphs: newParagraphs });
  }

  function removeParagraph(index) {
    setFormData({ 
      ...formData, 
      paragraphs: formData.paragraphs.filter((_, i) => i !== index) 
    });
  }

  function addSource() {
    setFormData({ ...formData, sources: [...formData.sources, ''] });
  }

  function updateSource(index, value) {
    const newSources = [...formData.sources];
    newSources[index] = value;
    setFormData({ ...formData, sources: newSources });
  }

  function removeSource(index) {
    setFormData({ 
      ...formData, 
      sources: formData.sources.filter((_, i) => i !== index) 
    });
  }

  const years = [...new Set(items.map(i => i.year).filter(Boolean))].sort((a, b) => b - a);
  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  const filteredItems = items.filter(item => {
    if (filterYear && item.year !== parseInt(filterYear)) return false;
    if (filterMonth && item.month !== parseInt(filterMonth)) return false;
    return true;
  });

  const canCreate = user.role === 'admin' || user.permissions?.canCreate;
  const canEdit = user.role === 'admin' || user.permissions?.canEdit;
  const canDelete = user.role === 'admin' || user.permissions?.canDelete;

  if (loading) {
    return <div className="admin-loading">Cargando timeline...</div>;
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <h2>Timeline</h2>
        <div className="admin-editor-filters">
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
            <option value="">Todos los años</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
            <option value="">Todos los meses</option>
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        {canCreate && (
          <button onClick={openCreateModal} className="admin-btn-primary">
            + Nuevo Evento
          </button>
        )}
      </div>

      <div className="admin-items-list">
        {filteredItems.length === 0 ? (
          <div className="admin-empty">
            <p>No hay eventos en el timeline</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="admin-item-card">
              {item.image && (
                <img src={item.image} alt={item.title} className="admin-item-thumb" />
              )}
              <div className="admin-item-content">
                <div className="admin-item-date">{item.date}</div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </div>
              <div className="admin-item-actions">
                {canEdit && (
                  <button onClick={() => openEditModal(item)} className="admin-btn-icon">
                    ✏️
                  </button>
                )}
                {canDelete && (
                  <button onClick={() => handleDelete(item)} className="admin-btn-icon delete">
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal large">
            <h3>{editingItem ? 'Editar Evento' : 'Nuevo Evento'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row three">
                <div className="admin-form-group">
                  <label>Fecha (texto)</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="15 de mayo de 1948"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Año</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="1948"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Mes</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  >
                    <option value="">Sin mes</option>
                    {months.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Resumen</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="admin-form-group">
                <label>Imagen</label>
                <ImageUploader
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                />
              </div>

              <div className="admin-form-group">
                <label>Video (URL)</label>
                <input
                  type="text"
                  value={formData.video}
                  onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                  placeholder="/imagenes/video.mp4 o URL externa"
                />
              </div>

              <div className="admin-form-group">
                <label>Contenido (párrafos)</label>
                {formData.paragraphs.map((p, i) => (
                  <div key={i} className="admin-array-item">
                    <textarea
                      value={p}
                      onChange={(e) => updateParagraph(i, e.target.value)}
                      rows={3}
                      placeholder={`Párrafo ${i + 1}`}
                    />
                    <button type="button" onClick={() => removeParagraph(i)} className="admin-btn-remove">
                      ×
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addParagraph} className="admin-btn-add">
                  + Añadir párrafo
                </button>
              </div>

              <div className="admin-form-group">
                <label>Fuentes</label>
                {formData.sources.map((s, i) => (
                  <div key={i} className="admin-array-item">
                    <input
                      type="text"
                      value={s}
                      onChange={(e) => updateSource(i, e.target.value)}
                      placeholder={`Fuente ${i + 1}`}
                    />
                    <button type="button" onClick={() => removeSource(i)} className="admin-btn-remove">
                      ×
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addSource} className="admin-btn-add">
                  + Añadir fuente
                </button>
              </div>

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingItem ? 'Guardar Cambios' : 'Crear Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
