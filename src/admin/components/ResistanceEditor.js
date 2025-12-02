import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from './ImageUploader';

export default function ResistanceEditor({ countryCode }) {
  const { user, getAuthHeaders } = useAuth();
  const [resistors, setResistors] = useState([]);
  const [selectedResistor, setSelectedResistor] = useState(null);
  const [resistorDetail, setResistorDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResistorModal, setShowResistorModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingResistor, setEditingResistor] = useState(null);
  
  const [resistorForm, setResistorForm] = useState({
    id: '',
    name: '',
    bio: '',
    image: '',
    social: { instagram: '', telegram: '', donation: '' }
  });

  const [entryForm, setEntryForm] = useState({
    id: '',
    title: '',
    summary: '',
    date: '',
    paragraphs: ['']
  });

  useEffect(() => {
    loadResistors();
  }, [countryCode]);

  async function loadResistors() {
    try {
      const res = await fetch(`/api/cms/countries/${countryCode}/resistance?lang=es`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setResistors(data.items || []);
      }
    } catch (error) {
      console.error('Error loading resistance:', error);
    }
    setLoading(false);
  }

  async function loadResistorDetail(resistorId) {
    try {
      const res = await fetch(`/api/cms/countries/${countryCode}/resistance/${resistorId}?lang=es`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setResistorDetail(data);
        setSelectedResistor(resistorId);
      }
    } catch (error) {
      console.error('Error loading resistor detail:', error);
    }
  }

  function openCreateResistorModal() {
    setEditingResistor(null);
    setResistorForm({
      id: '',
      name: '',
      bio: '',
      image: '',
      social: { instagram: '', telegram: '', donation: '' }
    });
    setShowResistorModal(true);
  }

  function openEditResistorModal() {
    if (!resistorDetail) return;
    setEditingResistor(resistorDetail);
    setResistorForm({
      id: resistorDetail.id,
      name: resistorDetail.name || '',
      bio: resistorDetail.bio || '',
      image: resistorDetail.image || '',
      social: resistorDetail.social || { instagram: '', telegram: '', donation: '' }
    });
    setShowResistorModal(true);
  }

  function openCreateEntryModal() {
    const nextId = `r${(resistorDetail?.entries?.length || 0) + 1}`;
    setEntryForm({
      id: nextId,
      title: '',
      summary: '',
      date: '',
      paragraphs: ['']
    });
    setShowEntryModal(true);
  }

  async function handleResistorSubmit(e) {
    e.preventDefault();
    
    const url = editingResistor
      ? `/api/cms/countries/${countryCode}/resistance/${editingResistor.id}?lang=es`
      : `/api/cms/countries/${countryCode}/resistance?lang=es`;
    
    const method = editingResistor ? 'PUT' : 'POST';

    const body = {
      ...resistorForm,
      id: resistorForm.id || resistorForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)
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
        setShowResistorModal(false);
        if (data.pending) {
          alert('Cambio enviado para aprobación');
        }
        loadResistors();
        if (editingResistor) {
          loadResistorDetail(editingResistor.id);
        }
      } else {
        alert(data.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  }

  async function handleEntrySubmit(e) {
    e.preventDefault();
    
    const body = {
      ...entryForm,
      paragraphs: entryForm.paragraphs.filter(p => p.trim())
    };

    try {
      const res = await fetch(
        `/api/cms/countries/${countryCode}/resistance/${selectedResistor}/entry?lang=es`,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );

      const data = await res.json();
      
      if (res.ok) {
        setShowEntryModal(false);
        if (data.pending) {
          alert('Cambio enviado para aprobación');
        }
        loadResistorDetail(selectedResistor);
      } else {
        alert(data.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  }

  function addParagraph() {
    setEntryForm({ ...entryForm, paragraphs: [...entryForm.paragraphs, ''] });
  }

  function updateParagraph(index, value) {
    const newParagraphs = [...entryForm.paragraphs];
    newParagraphs[index] = value;
    setEntryForm({ ...entryForm, paragraphs: newParagraphs });
  }

  function removeParagraph(index) {
    setEntryForm({ 
      ...entryForm, 
      paragraphs: entryForm.paragraphs.filter((_, i) => i !== index) 
    });
  }

  const canCreate = user.role === 'admin' || user.permissions?.canCreate;
  const canEdit = user.role === 'admin' || user.permissions?.canEdit;

  if (loading) {
    return <div className="admin-loading">Cargando resistencia...</div>;
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <h2>Resistencia</h2>
        {canCreate && (
          <button onClick={openCreateResistorModal} className="admin-btn-primary">
            + Nueva Persona/Grupo
          </button>
        )}
      </div>

      <div className="admin-testimonies-layout">
        <div className="admin-witnesses-list">
          <h3>Personas/Grupos ({resistors.length})</h3>
          {resistors.map(resistor => (
            <div 
              key={resistor.id} 
              className={`admin-witness-item ${selectedResistor === resistor.id ? 'active' : ''}`}
              onClick={() => loadResistorDetail(resistor.id)}
            >
              {resistor.image && (
                <img src={resistor.image} alt={resistor.name} className="admin-witness-thumb" />
              )}
              <span>{resistor.name}</span>
            </div>
          ))}
          {resistors.length === 0 && (
            <div className="admin-empty-small">No hay entradas de resistencia</div>
          )}
        </div>

        <div className="admin-witness-detail">
          {resistorDetail ? (
            <>
              <div className="admin-witness-header">
                <div className="admin-witness-info">
                  {resistorDetail.image && (
                    <img src={resistorDetail.image} alt={resistorDetail.name} className="admin-witness-avatar" />
                  )}
                  <div>
                    <h3>{resistorDetail.name}</h3>
                    <p className="admin-witness-bio">{resistorDetail.bio}</p>
                  </div>
                </div>
                {canEdit && (
                  <button onClick={openEditResistorModal} className="admin-btn-secondary">
                    Editar
                  </button>
                )}
              </div>

              <div className="admin-testimonies-section">
                <div className="admin-section-header">
                  <h4>Entradas ({resistorDetail.entries?.length || 0})</h4>
                  {canCreate && (
                    <button onClick={openCreateEntryModal} className="admin-btn-primary small">
                      + Añadir Entrada
                    </button>
                  )}
                </div>

                <div className="admin-testimonies-list">
                  {resistorDetail.entries?.map(entry => (
                    <div key={entry.id} className="admin-testimony-card">
                      <h5>{entry.title}</h5>
                      <p>{entry.summary}</p>
                      <span className="admin-testimony-date">{entry.date}</span>
                    </div>
                  ))}
                  {(!resistorDetail.entries || resistorDetail.entries.length === 0) && (
                    <div className="admin-empty-small">No hay entradas</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="admin-empty">
              <p>Selecciona una persona o grupo para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>

      {showResistorModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal large">
            <h3>{editingResistor ? 'Editar Persona/Grupo' : 'Nueva Persona/Grupo'}</h3>
            <form onSubmit={handleResistorSubmit}>
              <div className="admin-form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={resistorForm.name}
                  onChange={(e) => setResistorForm({ ...resistorForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Descripción/Biografía</label>
                <textarea
                  value={resistorForm.bio}
                  onChange={(e) => setResistorForm({ ...resistorForm, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="admin-form-group">
                <label>Foto/Imagen</label>
                <ImageUploader
                  value={resistorForm.image}
                  onChange={(url) => setResistorForm({ ...resistorForm, image: url })}
                />
              </div>

              <div className="admin-form-group">
                <label>Redes Sociales / Enlaces</label>
                <div className="admin-social-inputs">
                  <input
                    type="text"
                    placeholder="Instagram URL"
                    value={resistorForm.social.instagram}
                    onChange={(e) => setResistorForm({ 
                      ...resistorForm, 
                      social: { ...resistorForm.social, instagram: e.target.value }
                    })}
                  />
                  <input
                    type="text"
                    placeholder="Telegram URL"
                    value={resistorForm.social.telegram}
                    onChange={(e) => setResistorForm({ 
                      ...resistorForm, 
                      social: { ...resistorForm.social, telegram: e.target.value }
                    })}
                  />
                  <input
                    type="text"
                    placeholder="Donación URL"
                    value={resistorForm.social.donation}
                    onChange={(e) => setResistorForm({ 
                      ...resistorForm, 
                      social: { ...resistorForm.social, donation: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowResistorModal(false)} className="admin-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingResistor ? 'Guardar Cambios' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEntryModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal large">
            <h3>Nueva Entrada de Resistencia</h3>
            <form onSubmit={handleEntrySubmit}>
              <div className="admin-form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={entryForm.title}
                  onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Resumen</label>
                  <input
                    type="text"
                    value={entryForm.summary}
                    onChange={(e) => setEntryForm({ ...entryForm, summary: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Fecha/Contexto</label>
                  <input
                    type="text"
                    value={entryForm.date}
                    onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Contenido (párrafos)</label>
                {entryForm.paragraphs.map((p, i) => (
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

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowEntryModal(false)} className="admin-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary">
                  Crear Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
