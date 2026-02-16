import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Target, FileText, Code, Upload, Video, MessageCircle, Globe, Calendar } from 'lucide-react';
import '../StepStyles.css';

const RoundsStep = ({ formData, setFormData, contentType }) => {
  const [showRoundTypeModal, setShowRoundTypeModal] = useState(false);
  const [showRoundDetailModal, setShowRoundDetailModal] = useState(false);
  const [selectedRoundType, setSelectedRoundType] = useState(null);
  const [editingRound, setEditingRound] = useState(null);
  const [roundForm, setRoundForm] = useState({
    name: '',
    description: '',
    liveDate: '',
    closeDate: '',
    platform: 'ROAC'
  });

  const isOpportunity = contentType === 'opportunity';
  const rounds = formData.rounds || [];

  // Round types with lucide-react icons
  const roundTypes = [
    {
      id: 'assessment',
      name: 'Assessment',
      icon: FileText,
      color: '#9C27B0',
      description: 'Create MCQs or subjective assessments with customizations, and next-gen proctoring'
    },
    {
      id: 'code-contest',
      name: 'Code Contest',
      icon: Code,
      color: '#4CAF50',
      description: 'Create code contest with inbuilt code writer & compiler for 15+ coding languages'
    },
    {
      id: 'submission',
      name: 'Submission through ROAC',
      icon: Upload,
      color: '#FF9800',
      description: 'Accept submissions like PPT, articles, pictures, etc. You can also attach a case file'
    },
    {
      id: 'session',
      name: 'Session on Youtube & Vimeo',
      icon: Video,
      color: '#F44336',
      description: 'For sessions to be hosted on YouTube & Vimeo platform'
    },
    {
      id: 'interview',
      name: 'Interview',
      icon: MessageCircle,
      color: '#E91E63',
      description: 'For interviews to be hosted either offline or virtually on ROAC'
    },
    {
      id: 'other',
      name: 'Other',
      icon: Globe,
      color: '#607D8B',
      description: 'Custom round type for other purposes'
    }
  ];

  const handleAddRound = () => {
    setShowRoundTypeModal(true);
  };

  const handleSelectRoundType = (roundType) => {
    setSelectedRoundType(roundType);
    setEditingRound(null);
    setRoundForm({
      name: roundType.name,
      description: roundType.description,
      liveDate: '',
      closeDate: '',
      platform: 'ROAC',
      type: roundType.id
    });
    setShowRoundTypeModal(false);
    setShowRoundDetailModal(true);
  };

  const handleEditRound = (round) => {
    setEditingRound(round.id);
    setRoundForm(round);
    const roundType = roundTypes.find(rt => rt.id === round.type);
    setSelectedRoundType(roundType);
    setShowRoundDetailModal(true);
  };

  const handleSaveRound = () => {
    // Ensure name and description exist before calling trim
    const name = roundForm.name || '';
    const description = roundForm.description || '';
    
    if (!name.trim() || !description.trim() || !roundForm.liveDate || !roundForm.closeDate) {
      return;
    }

    if (editingRound) {
      // Update existing round
      const updatedRounds = rounds.map(r =>
        r.id === editingRound ? { ...roundForm, id: editingRound } : r
      );
      setFormData({
        ...formData,
        rounds: updatedRounds
      });
    } else {
      // Add new round
      const newRound = {
        id: Date.now(),
        ...roundForm
      };
      setFormData({
        ...formData,
        rounds: [...rounds, newRound]
      });
    }

    setShowRoundDetailModal(false);
    setEditingRound(null);
    setSelectedRoundType(null);
    setRoundForm({
      name: '',
      description: '',
      liveDate: '',
      closeDate: '',
      platform: 'ROAC'
    });
  };

  const handleDeleteRound = (id) => {
    setFormData({
      ...formData,
      rounds: rounds.filter(r => r.id !== id)
    });
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} Days`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  return (
    <div className="unified-step-container">
      <div className="unified-step-header">
        <h2 className="unified-step-title">
          {isOpportunity ? 'Rounds & Stages' : 'Hiring Rounds'}
        </h2>
        <p className="unified-step-description">
          Create rounds to represent each stage of the {isOpportunity ? 'opportunity' : 'hiring process'}. Add rounds in sequence to define the flow and ensure every step of the process is captured clearly.
        </p>
      </div>

      {/* Rounds List or Empty State */}
      {rounds.length > 0 ? (
        <>
          <div style={{ marginBottom: '1.5rem' }}>
            <button 
              className="unified-add-item-btn" 
              onClick={handleAddRound}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #FFD600 0%, #FFA500 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
            >
              <Plus size={20} />
              Add Round
            </button>
          </div>

          <div className="unified-item-list">
            {rounds.map((round, index) => {
              const roundType = roundTypes.find(rt => rt.id === round.type);
              const RoundIcon = roundType?.icon || Target;
              
              return (
                <div key={round.id} className="unified-item-card">
                  <div className="unified-item-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        background: `${roundType?.color || '#FFD600'}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <RoundIcon size={24} style={{ color: roundType?.color || '#FFD600' }} />
                      </div>
                      <div>
                        <div className="unified-item-title">
                          {index + 1}. {round.name}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.25rem' }}>
                          {formatDate(round.liveDate)} - {formatDate(round.closeDate)} • {calculateDuration(round.liveDate, round.closeDate)}
                        </div>
                      </div>
                    </div>
                    <div className="unified-item-actions">
                      <button className="unified-icon-btn" onClick={() => handleEditRound(round)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="unified-icon-btn delete" onClick={() => handleDeleteRound(round.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {round.description && (
                    <div style={{ marginTop: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginLeft: '64px' }}>
                      {round.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem 2rem', 
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          border: '2px dashed rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            margin: '0 auto 1.5rem',
            borderRadius: '50%',
            background: 'rgba(255, 214, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Target size={40} style={{ color: '#FFD600' }} />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
            No round added yet
          </h3>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem' }}>
            Please click on the 'Add Round' button to create a round
          </p>
          <button 
            className="unified-add-item-btn" 
            onClick={handleAddRound}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #FFD600 0%, #FFA500 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#000',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <Plus size={20} />
            Add Round
          </button>
        </div>
      )}

      {/* Select Round Type Modal */}
      {showRoundTypeModal && (
        <div className="rounds-modal-overlay" onClick={() => setShowRoundTypeModal(false)}>
          <div className="rounds-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
            <div className="rounds-modal-header">
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>Select a Round</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
                  Specify the rounds like Quiz or Hackathon to represent the flow of opportunity
                </p>
              </div>
              <button className="rounds-modal-close" onClick={() => setShowRoundTypeModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="rounds-modal-body">
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1rem' 
              }}>
                {roundTypes.map((roundType) => {
                  const IconComponent = roundType.icon;
                  return (
                    <div
                      key={roundType.id}
                      onClick={() => handleSelectRoundType(roundType)}
                      style={{
                        padding: '1.5rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = roundType.color;
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '12px',
                        background: `${roundType.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <IconComponent size={28} style={{ color: roundType.color }} />
                      </div>
                      <div>
                        <h4 style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: '600', 
                          color: '#fff', 
                          marginBottom: '0.5rem' 
                        }}>
                          {roundType.name}
                        </h4>
                        <p style={{ 
                          fontSize: '0.85rem', 
                          color: 'rgba(255, 255, 255, 0.6)', 
                          lineHeight: '1.5',
                          margin: 0
                        }}>
                          {roundType.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Round Detail Modal */}
      {showRoundDetailModal && selectedRoundType && (
        <div className="rounds-modal-overlay" onClick={() => setShowRoundDetailModal(false)}>
          <div className="rounds-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="rounds-modal-header">
              <h3>{roundForm.name}</h3>
              <button className="rounds-modal-close" onClick={() => setShowRoundDetailModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="rounds-modal-body">
              <div className="unified-form-grid">
                {/* Platform Selection */}
                <div className="unified-form-group unified-full-width">
                  <label className="unified-form-label">Select round conduct platform</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div 
                      onClick={() => setRoundForm({ ...roundForm, platform: 'ROAC' })}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        background: roundForm.platform === 'ROAC' ? 'rgba(255, 214, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        border: roundForm.platform === 'ROAC' ? '2px solid #FFD600' : '2px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Globe size={32} style={{ color: '#FFD600', margin: '0 auto 0.5rem' }} />
                      <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: '600' }}>ROAC</div>
                    </div>
                    <div 
                      onClick={() => setRoundForm({ ...roundForm, platform: 'Other' })}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        background: roundForm.platform === 'Other' ? 'rgba(255, 214, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        border: roundForm.platform === 'Other' ? '2px solid #FFD600' : '2px dashed rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Globe size={32} style={{ color: 'rgba(255, 255, 255, 0.5)', margin: '0 auto 0.5rem' }} />
                      <div style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>Other platform</div>
                    </div>
                  </div>
                </div>

                {/* Round Name */}
                <div className="unified-form-group unified-full-width">
                  <label className="unified-form-label">
                    Round name <span className="unified-required">*</span>
                  </label>
                  <input
                    type="text"
                    className="unified-form-input"
                    value={roundForm.name}
                    onChange={(e) => setRoundForm({ ...roundForm, name: e.target.value })}
                  />
                </div>

                {/* Round Description */}
                <div className="unified-form-group unified-full-width">
                  <label className="unified-form-label">
                    Round Description <span className="unified-required">*</span>
                  </label>
                  <textarea
                    className="unified-form-textarea"
                    value={roundForm.description}
                    onChange={(e) => setRoundForm({ ...roundForm, description: e.target.value })}
                    rows={4}
                  />
                </div>

                {/* Round Dates */}
                <div className="unified-form-group unified-full-width">
                  <label className="unified-form-label">
                    Round dates <span className="unified-required">*</span>
                  </label>
                  <div style={{ 
                    padding: '1.5rem', 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        background: '#4CAF50' 
                      }} />
                      <span style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)', minWidth: '60px' }}>
                        Live
                      </span>
                      <input
                        type="datetime-local"
                        className="unified-form-input"
                        value={roundForm.liveDate}
                        onChange={(e) => setRoundForm({ ...roundForm, liveDate: e.target.value })}
                        style={{ flex: 1 }}
                      />
                    </div>
                    
                    <div style={{ 
                      width: '2px', 
                      height: '20px', 
                      background: 'rgba(255, 255, 255, 0.2)',
                      marginLeft: '5px',
                      borderLeft: '2px dashed rgba(255, 255, 255, 0.3)'
                    }} />
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        border: '2px solid rgba(255, 255, 255, 0.5)',
                        background: 'transparent'
                      }} />
                      <span style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)', minWidth: '60px' }}>
                        Close
                      </span>
                      <input
                        type="datetime-local"
                        className="unified-form-input"
                        value={roundForm.closeDate}
                        onChange={(e) => setRoundForm({ ...roundForm, closeDate: e.target.value })}
                        style={{ flex: 1 }}
                      />
                    </div>

                    {roundForm.liveDate && roundForm.closeDate && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        marginTop: '0.5rem',
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '6px'
                      }}>
                        <Calendar size={16} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                        <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                          This round will be Live from {formatDate(roundForm.liveDate)} to {formatDate(roundForm.closeDate)} for {calculateDuration(roundForm.liveDate, roundForm.closeDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Warning Banner */}
                <div className="unified-form-group unified-full-width">
                  <div style={{
                    padding: '1rem',
                    background: 'rgba(255, 193, 7, 0.1)',
                    border: '1px solid rgba(255, 193, 7, 0.3)',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%',
                      background: 'rgba(255, 193, 7, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{ color: '#FFC107', fontSize: '0.9rem', fontWeight: 'bold' }}>i</span>
                    </div>
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: 'rgba(255, 193, 7, 0.9)', 
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      You can add problem statements/questions in this round later in the edit panel
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounds-modal-footer">
              <button 
                className="btn-primary" 
                onClick={handleSaveRound}
                disabled={!roundForm.name?.trim() || !roundForm.description?.trim() || !roundForm.liveDate || !roundForm.closeDate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundsStep;
