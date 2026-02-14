import React, { useState } from 'react';
import { Plus, X, Trophy, User } from 'lucide-react';
import '../StepStyles.css';

const PrizesStep = ({ formData, setFormData }) => {
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [prizeForm, setPrizeForm] = useState({
    rank: '',
    prizeType: 'cash',
    amount: '',
    currency: 'INR',
    perks: [],
    otherDetails: ''
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddPrize = () => {
    if (prizeForm.rank && (prizeForm.prizeType === 'kind' || prizeForm.amount)) {
      const currentPrizes = formData.prizesList || [];
      handleChange('prizesList', [...currentPrizes, { ...prizeForm, id: Date.now() }]);
      setPrizeForm({
        rank: '',
        prizeType: 'cash',
        amount: '',
        currency: 'INR',
        perks: [],
        otherDetails: ''
      });
      setShowPrizeModal(false);
    }
  };

  const togglePerk = (perk) => {
    const currentPerks = prizeForm.perks || [];
    if (currentPerks.includes(perk)) {
      setPrizeForm({ ...prizeForm, perks: currentPerks.filter(p => p !== perk) });
    } else {
      setPrizeForm({ ...prizeForm, perks: [...currentPerks, perk] });
    }
  };

  return (
    <div className="unified-step-container">
      <div className="unified-step-header">
        <h2 className="unified-step-title">Prizes</h2>
        <p className="unified-step-description">
          Mention awards and prizes, perks and other important details for this opportunity.
        </p>
      </div>

      <div className="unified-form-grid">
        {/* What do participants receive */}
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">What do participants receive?</label>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.75rem' }}>
            One-liner description about prizes
          </p>
          <textarea
            className="unified-form-textarea"
            placeholder="Type description here"
            value={formData.prizeDescription || ''}
            onChange={(e) => handleChange('prizeDescription', e.target.value)}
            rows={3}
          />
        </div>

        {/* Prize deliver days */}
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">Prize deliver days</label>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.75rem' }}>
            Within how many days will you be able to release the prizes (if any) and/or certificates after the event is over?
          </p>
          <input
            type="text"
            className="unified-form-input"
            placeholder="Enter here"
            value={formData.prizeDeliverDays || ''}
            onChange={(e) => handleChange('prizeDeliverDays', e.target.value)}
          />
        </div>

        {/* Participation certificate */}
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">Participation certificate will be provided?</label>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.75rem' }}>
            You can generate and send participation/winning certificates through the ROAC platform itself once the particular round/opportunity is over
          </p>
          <div className="unified-radio-group">
            <div 
              className={`unified-radio-option ${formData.participationCertificate === 'yes' ? 'unified-selected' : ''}`}
              onClick={() => handleChange('participationCertificate', 'yes')}
            >
              <input
                type="radio"
                name="participationCertificate"
                className="unified-radio-input"
                checked={formData.participationCertificate === 'yes'}
                readOnly
              />
              <label className="unified-radio-label">Yes</label>
            </div>
            <div 
              className={`unified-radio-option ${formData.participationCertificate === 'no' ? 'unified-selected' : ''}`}
              onClick={() => handleChange('participationCertificate', 'no')}
            >
              <input
                type="radio"
                name="participationCertificate"
                className="unified-radio-input"
                checked={formData.participationCertificate === 'no'}
                readOnly
              />
              <label className="unified-radio-label">No</label>
            </div>
          </div>
        </div>

        {/* Add Prizes Section */}
        <div className="unified-form-group unified-full-width" style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#FFD600', marginBottom: '0.5rem' }}>
            Add Prizes
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1rem' }}>
            Create prizes and seamlessly send participation or winning certificates via ROAC after your opportunity ends.
          </p>

          {/* Warning Banner */}
          <div style={{
            padding: '1rem',
            background: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '8px',
            marginBottom: '1.5rem',
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
              Enter the confirmed prize amount. Once the event is live, the prize money cannot be reduced
            </p>
          </div>

          {/* Empty State or Prize List */}
          {(!formData.prizesList || formData.prizesList.length === 0) ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem 2rem', 
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '2px dashed rgba(255, 255, 255, 0.1)'
            }}>
              <Trophy size={64} style={{ color: '#FFD600', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>
                No Prize listed
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem' }}>
                You have not set up any prizes.
              </p>
              <button 
                onClick={() => setShowPrizeModal(true)}
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
                  gap: '0.5rem'
                }}
              >
                <Plus size={20} /> Add prize
              </button>
            </div>
          ) : (
            <div>
              {formData.prizesList.map((prize, index) => (
                <div key={prize.id} style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.5rem' }}>
                    Rank: {prize.rank}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#FFD600' }}>
                    {prize.prizeType === 'cash' ? `${prize.currency} ${prize.amount}` : 'Kind'}
                  </div>
                  {prize.perks.length > 0 && (
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem' }}>
                      Perks: {prize.perks.join(', ')}
                    </div>
                  )}
                </div>
              ))}
              <button 
                onClick={() => setShowPrizeModal(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255, 214, 0, 0.1)',
                  border: '1px solid #FFD600',
                  borderRadius: '8px',
                  color: '#FFD600',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '1rem'
                }}
              >
                <Plus size={20} /> Add prize
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Prize Modal */}
      {showPrizeModal && (
        <div className="rounds-modal-overlay" onClick={() => setShowPrizeModal(false)}>
          <div className="rounds-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="rounds-modal-header">
              <h3>Add Prize</h3>
              <button className="rounds-modal-close" onClick={() => setShowPrizeModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="rounds-modal-body">
              {/* Rank */}
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label">
                  Rank <span className="unified-required">*</span>
                </label>
                <input
                  type="text"
                  className="unified-form-input"
                  placeholder="Enter rank"
                  value={prizeForm.rank}
                  onChange={(e) => setPrizeForm({ ...prizeForm, rank: e.target.value })}
                />
              </div>

              {/* Prize Type */}
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label">Prize Type</label>
                <div className="unified-radio-group">
                  <div 
                    className={`unified-radio-option ${prizeForm.prizeType === 'cash' ? 'unified-selected' : ''}`}
                    onClick={() => setPrizeForm({ ...prizeForm, prizeType: 'cash' })}
                  >
                    <input
                      type="radio"
                      checked={prizeForm.prizeType === 'cash'}
                      readOnly
                    />
                    <label className="unified-radio-label">Cash</label>
                  </div>
                  <div 
                    className={`unified-radio-option ${prizeForm.prizeType === 'kind' ? 'unified-selected' : ''}`}
                    onClick={() => setPrizeForm({ ...prizeForm, prizeType: 'kind' })}
                  >
                    <input
                      type="radio"
                      checked={prizeForm.prizeType === 'kind'}
                      readOnly
                    />
                    <label className="unified-radio-label">Kind</label>
                  </div>
                </div>
              </div>

              {/* Cash Amount */}
              {prizeForm.prizeType === 'cash' && (
                <div className="unified-form-group unified-full-width">
                  <label className="unified-form-label">
                    Enter cash amount <span className="unified-required">*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      className="unified-form-input"
                      value={prizeForm.currency}
                      onChange={(e) => setPrizeForm({ ...prizeForm, currency: e.target.value })}
                      style={{ maxWidth: '120px' }}
                    >
                      <option value="INR">₹ (INR)</option>
                      <option value="USD">$ (USD)</option>
                      <option value="EUR">€ (EUR)</option>
                      <option value="GBP">£ (GBP)</option>
                    </select>
                    <input
                      type="number"
                      className="unified-form-input"
                      placeholder="Enter amount"
                      value={prizeForm.amount}
                      onChange={(e) => setPrizeForm({ ...prizeForm, amount: e.target.value })}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              )}

              {/* Additional Perks */}
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label">Additional perks</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {['Certificate', 'Pre-placement interview', 'Pre-placement offer'].map((perk) => (
                    <div
                      key={perk}
                      onClick={() => togglePerk(perk)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: prizeForm.perks.includes(perk) ? 'rgba(255, 214, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        border: prizeForm.perks.includes(perk) ? '2px solid #FFD600' : '2px dashed rgba(255, 255, 255, 0.2)',
                        borderRadius: '20px',
                        color: prizeForm.perks.includes(perk) ? '#FFD600' : 'rgba(255, 255, 255, 0.7)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <User size={16} /> {perk}
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Details */}
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label">Other details</label>
                <textarea
                  className="unified-form-textarea"
                  placeholder="Add any additional details about this prize"
                  value={prizeForm.otherDetails}
                  onChange={(e) => setPrizeForm({ ...prizeForm, otherDetails: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="rounds-modal-footer">
              <button 
                className="btn-primary" 
                onClick={handleAddPrize}
                disabled={!prizeForm.rank || (prizeForm.prizeType === 'cash' && !prizeForm.amount)}
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

export default PrizesStep;
