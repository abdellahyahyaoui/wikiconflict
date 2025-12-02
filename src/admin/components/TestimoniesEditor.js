import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from './ImageUploader';

export default function TestimoniesEditor({ countryCode }) {
  const { user, getAuthHeaders } = useAuth();
  const [witnesses, setWitnesses] = useState([]);
  const [selectedWitness, setSelectedWitness] = useState(null);
  const [witnessDetail, setWitnessDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWitnessModal, setShowWitnessModal] = useState(false);
  const [showTestimonyModal, setShowTestimonyModal] = useState(false);
  const [editingWitness, setEditingWitness] = useState(null);
  const [editingTestimony, setEditingTestimony] = useState(null);
  
  const [witnessForm, setWitnessForm] = useState({
    id: '',
    name: '',
    bio: '',
    image: '',
    social: { instagram: '', telegram: '', donation: '' }
  });

  const [testimonyForm, setTestimonyForm] = useState({
    id: '',
    title: '',
    summary: '',
    date: '',
    paragraphs: ['']
  });

  useEffect(() => {
    loadWitnesses();
  }, [countryCode]);

  async function loadWitnesses() {
    try {
      const res = await fetch(`/api/cms/countries/${countryCode}/testimonies?lang=es`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setWitnesses(data.items || []);
      }
    } catch (error) {
      console.error('Error loading witnesses:', error);
    }
    setLoading(false);
  }

  async function loadWitnessDetail(witnessId) {
    try {
      const res = await fetch(`/api/cms/countries/${countryCode}/testimonies/${witnessId}?lang=es`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setWitnessDetail(data);
        setSelectedWitness(witnessId);
      }
    } catch (error) {
      console.error('Error loading witness detail:', error);
    }
  }

  function openCreateWitnessModal() {
    setEditingWitness(null);
    setWitnessForm({
      id: '',
      name: '',
      bio: '',
      image: '',
      social: { instagram: '', telegram: '', donation: '' }
    });
    setShowWitnessModal(true);
  }

  function openEditWitnessModal() {
    if (!witnessDetail) return;
    setEditingWitness(witnessDetail);
    setWitnessForm({
      id: witnessDetail.id,
      name: witnessDetail.name || '',
      bio: witnessDetail.bio || '',
      image: witnessDetail.image || '',
      social: witnessDetail.social || { instagram: '', telegram: '', donation: '' }
    });
    setShowWitnessModal(true);
  }

  function openCreateTestimonyModal() {
    setEditingTestimony(null);
    const nextId = `t${(witnessDetail?.testimonies?.length || 0) + 1}`;
    setTestimonyForm({
      id: nextId,
      title: '',
      summary: '',
      date: '',
      paragraphs: ['']
    });
    setShowTestimonyModal(true);
  }

  async function handleWitnessSubmit(e) {
    e.preventDefault();
    
    const url = editingWitness
      ? `/api/cms/countries/${countryCode}/testimonies/${editingWitness.id}?lang=es`
      : `/api/cms/countries/${countryCode}/testimonies?lang=es`;
    
    const method = editingWitness ? 'PUT' : 'POST';

    const body = {
      ...witnessForm,
      id: witnessForm.id || witnessForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)
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
        setShowWitnessModal(false);
        if (data.pending) {
          alert('Cambio enviado para aprobación');
        }
        loadWitnesses();
        if (editingWitness) {
          loadWitnessDetail(editingWitness.id);
        }
      } else {
        alert(data.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  }

  async function handleTestimonySubmit(e) {
    e.preventDefault();
    
    const body = {
      ...testimonyForm,
      paragraphs: testimonyForm.paragraphs.filter(p => p.trim())
    };

    try {
      const res = await fetch(
        `/api/cms/countries/${countryCode}/testimonies/${selectedWitness}/testimony?lang=es`,
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
        setShowTestimonyModal(false);
        if (data.pending) {
          alert('Cambio enviado para aprobación');
        }
        loadWitnessDetail(selectedWitness);
      } else {
        alert(data.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  }

  function addParagraph() {
    setTestimonyForm({ ...testimonyForm, paragraphs: [...testimonyForm.paragraphs, ''] });
  }

  function updateParagraph(index, value) {
    const newParagraphs = [...testimonyForm.paragraphs];
    newParagraphs[index] = value;
    setTestimonyForm({ ...testimonyForm, paragraphs: newParagraphs });
  }

  function removeParagraph(index) {
    setTestimonyForm({ 
      ...testimonyForm, 
      paragraphs: testimonyForm.paragraphs.filter((_, i) => i !== index) 
    });
  }

  const canCreate = user.role === 'admin' || user.permissions?.canCreate;
  const canEdit = user.role === 'admin' || user.permissions?.canEdit;

  if (loading) {
    return <div className="admin-loading">Cargando testimonios...</div>;
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <h2>Testimonios</h2>
        {canCreate && (
          <button onClick={openCreateWitnessModal} className="admin-btn-primary">
            + Nuevo Testigo
          </button>
        )}
      </div>

      <div className="admin-testimonies-layout">
        <div className="admin-witnesses-list">
          <h3>Testigos ({witnesses.length})</h3>
          {witnesses.map(witness => (
            <div 
              key={witness.id} 
              className={`admin-witness-item ${selectedWitness === witness.id ? 'active' : ''}`}
              onClick={() => loadWitnessDetail(witness.id)}
            >
              {witness.image && (
                <img src={witness.image} alt={witness.name} className="admin-witness-thumb" />
              )}
              <span>{witness.name}</span>
            </div>
          ))}
          {witnesses.length === 0 && (
            <div className="admin-empty-small">No hay testigos</div>
          )}
        </div>

        <div className="admin-witness-detail">
          {witnessDetail ? (
            <>
              <div className="admin-witness-header">
                <div className="admin-witness-info">
                  {witnessDetail.image && (
                    <img src={witnessDetail.image} alt={witnessDetail.name} className="admin-witness-avatar" />
                  )}
                  <div>
                    <h3>{witnessDetail.name}</h3>
                    <p className="admin-witness-bio">{witnessDetail.bio}</p>
                  </div>
                </div>
                {canEdit && (
                  <button onClick={openEditWitnessModal} className="admin-btn-secondary">
                    Editar Testigo
                  </button>
                )}
              </div>

              <div className="admin-testimonies-section">
                <div className="admin-section-header">
                  <h4>Testimonios ({witnessDetail.testimonies?.length || 0})</h4>
                  {canCreate && (
                    <button onClick={openCreateTestimonyModal} className="admin-btn-primary small">
                      + Añadir Testimonio
                    </button>
                  )}
                </div>

                <div className="admin-testimonies-list">
                  {witnessDetail.testimonies?.map(t => (
                    <div key={t.id} className="admin-testimony-card">
                      <h5>{t.title}</h5>
                      <p>{t.summary}</p>
                      <span className="admin-testimony-date">{t.date}</span>
                    </div>
                  ))}
                  {(!witnessDetail.testimonies || witnessDetail.testimonies.length === 0) && (
                    <div className="admin-empty-small">No hay testimonios</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="admin-empty">
              <p>Selecciona un testigo para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>

      {showWitnessModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal large">
            <h3>{editingWitness ? 'Editar Testigo' : 'Nuevo Testigo'}</h3>
            <form onSubmit={handleWitnessSubmit}>
              <div className="admin-form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={witnessForm.name}
                  onChange={(e) => setWitnessForm({ ...witnessForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Biografía</label>
                <textarea
                  value={witnessForm.bio}
                  onChange={(e) => setWitnessForm({ ...witnessForm, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="admin-form-group">
                <label>Foto</label>
                <ImageUploader
                  value={witnessForm.image}
                  onChange={(url) => setWitnessForm({ ...witnessForm, image: url })}
                />
              </div>

              <div className="admin-form-group">
                <label>Redes Sociales</label>
                <div className="admin-social-inputs">
                  <input
                    type="text"
                    placeholder="Instagram URL"
                    value={witnessForm.social.instagram}
                    onChange={(e) => setWitnessForm({ 
                      ...witnessForm, 
                      social: { ...witnessForm.social, instagram: e.target.value }
                    })}
                  />
                  <input
                    type="text"
                    placeholder="Telegram URL"
                    value={witnessForm.social.telegram}
                    onChange={(e) => setWitnessForm({ 
                      ...witnessForm, 
                      social: { ...witnessForm.social, telegram: e.target.value }
                    })}
                  />
                  <input
                    type="text"
                    placeholder="Donación URL"
                    value={witnessForm.social.donation}
                    onChange={(e) => setWitnessForm({ 
                      ...witnessForm, 
                      social: { ...witnessForm.social, donation: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowWitnessModal(false)} className="admin-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingWitness ? 'Guardar Cambios' : 'Crear Testigo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTestimonyModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal large">
            <h3>Nuevo Testimonio</h3>
            <form onSubmit={handleTestimonySubmit}>
              <div className="admin-form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={testimonyForm.title}
                  onChange={(e) => setTestimonyForm({ ...testimonyForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Resumen</label>
                  <input
                    type="text"
                    value={testimonyForm.summary}
                    onChange={(e) => setTestimonyForm({ ...testimonyForm, summary: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Fecha/Contexto</label>
                  <input
                    type="text"
                    value={testimonyForm.date}
                    onChange={(e) => setTestimonyForm({ ...testimonyForm, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Contenido (párrafos)</label>
                {testimonyForm.paragraphs.map((p, i) => (
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
                <button type="button" onClick={() => setShowTestimonyModal(false)} className="admin-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary">
                  Crear Testimonio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
