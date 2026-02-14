import React, { useState } from 'react';
import { Edit, Ticket, Plus, X, ChevronDown, Info, Smartphone, Building2, CreditCard, Globe, Wallet } from 'lucide-react';
import '../StepStyles.css';

const PaymentStep = ({ formData, setFormData }) => {
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showDescriptionInput, setShowDescriptionInput] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    title: 'Ticket 1',
    description: '',
    amount: '',
    feeType: 'Team Fee',
    purchaseRequirement: 'Required',
    sendInvoice: 'No'
  });
  const [accountForm, setAccountForm] = useState({
    accountHolder: '',
    phoneNo: '',
    email: '',
    bankAccount: '',
    confirmBankAccount: '',
    ifscCode: '',
    panNumber: '',
    gstin: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Initialize payment methods in formData if not exists
  React.useEffect(() => {
    if (!formData.paymentMethods) {
      handleChange('paymentMethods', {
        upi: true,
        netbanking: true,
        card_indian: true,
        card_international: true,
        wallet: true
      });
    }
    // Load existing account details if available
    if (formData.accountDetails) {
      setAccountForm(formData.accountDetails);
    }
  }, []);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const togglePaymentMethod = (methodId) => {
    const currentMethods = formData.paymentMethods || {
      upi: true,
      netbanking: true,
      card_indian: true,
      card_international: true,
      wallet: true
    };
    handleChange('paymentMethods', {
      ...currentMethods,
      [methodId]: !currentMethods[methodId]
    });
  };

  const handleSaveAccountDetails = () => {
    handleChange('accountDetails', accountForm);
    setShowAccountModal(false);
  };

  const handleAddTicket = () => {
    if (ticketForm.title && ticketForm.amount) {
      const currentTickets = formData.ticketsList || [];
      handleChange('ticketsList', [...currentTickets, { ...ticketForm, id: Date.now() }]);
      setTicketForm({
        title: 'Ticket 1',
        description: '',
        amount: '',
        feeType: 'Team Fee',
        purchaseRequirement: 'Required',
        sendInvoice: 'No'
      });
      setShowDescriptionInput(false);
      setShowTicketModal(false);
    }
  };

  const paymentMethods = [
    { id: 'upi', name: 'UPI (Google Pay, BHIM, PhonePe, etc.)', charge: '2%', icon: Smartphone },
    { id: 'netbanking', name: 'Internet banking (All major banks)', charge: '3%', icon: Building2 },
    { id: 'card_indian', name: 'Indian Credit/ Debit card (Visa, Mastercard, RuPay, Maestro)', charge: '3%', icon: CreditCard },
    { id: 'card_international', name: 'International Credit/ Debit card', charge: '5%', icon: Globe },
    { id: 'wallet', name: 'Wallet (Mobikwik, Freecharge, etc.)', charge: '3%', icon: Wallet }
  ];

  return (
    <div className="unified-step-container">
      <div className="unified-step-header">
        <h2 className="unified-step-title">Payment</h2>
        <p className="unified-step-description">
          Set up participation fees for the opportunity (if applicable), choose payment methods, and create tickets or discount coupons that candidates can use while registering.
        </p>
      </div>

      {/* Info Banner */}
      <div style={{
        padding: '1rem',
        background: 'rgba(255, 193, 7, 0.1)',
        border: '1px solid rgba(255, 193, 7, 0.3)',
        borderRadius: '8px',
        marginBottom: '2rem',
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
          Enable payments for your opportunity with 0% transaction fees. We support national, international payments and allow coupon code creation. Credits are transferred to your bank within 14 working days after registration closes.
        </p>
      </div>

      <div className="unified-form-grid">
        {/* Registration Fee */}
        <div className="unified-form-group unified-full-width">
          <label className="unified-form-label">Does this opportunity have a registration fee?</label>
          <div className="unified-radio-group">
            <div 
              className={`unified-radio-option ${formData.hasRegistrationFee === 'yes' ? 'unified-selected' : ''}`}
              onClick={() => handleChange('hasRegistrationFee', 'yes')}
            >
              <input
                type="radio"
                name="hasRegistrationFee"
                className="unified-radio-input"
                checked={formData.hasRegistrationFee === 'yes'}
                readOnly
              />
              <label className="unified-radio-label">Yes</label>
            </div>
            <div 
              className={`unified-radio-option ${formData.hasRegistrationFee === 'no' ? 'unified-selected' : ''}`}
              onClick={() => handleChange('hasRegistrationFee', 'no')}
            >
              <input
                type="radio"
                name="hasRegistrationFee"
                className="unified-radio-input"
                checked={formData.hasRegistrationFee === 'no'}
                readOnly
              />
              <label className="unified-radio-label">No</label>
            </div>
          </div>
        </div>

        {formData.hasRegistrationFee === 'yes' && (
          <>
            {/* Payment Platform */}
            <div className="unified-form-group unified-full-width">
              <label className="unified-form-label">Choose payment platform</label>
              <div className="unified-radio-group">
                <div 
                  className={`unified-radio-option ${formData.paymentPlatform === 'roac' ? 'unified-selected' : ''}`}
                  onClick={() => handleChange('paymentPlatform', 'roac')}
                >
                  <input
                    type="radio"
                    name="paymentPlatform"
                    className="unified-radio-input"
                    checked={formData.paymentPlatform === 'roac'}
                    readOnly
                  />
                  <label className="unified-radio-label">ROAC</label>
                </div>
                <div 
                  className={`unified-radio-option ${formData.paymentPlatform === 'other' ? 'unified-selected' : ''}`}
                  onClick={() => handleChange('paymentPlatform', 'other')}
                >
                  <input
                    type="radio"
                    name="paymentPlatform"
                    className="unified-radio-input"
                    checked={formData.paymentPlatform === 'other'}
                    readOnly
                  />
                  <label className="unified-radio-label">Other payment portal</label>
                </div>
              </div>
            </div>

            {/* Payment Ticket */}
            <div className="unified-form-group unified-full-width" style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#FFD600', marginBottom: '0.5rem' }}>
                Payment ticket
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem' }}>
                Set application fees with customizable ticket pricing and coupon codes.
              </p>
              
              {(!formData.ticketsList || formData.ticketsList.length === 0) ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem 2rem', 
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  border: '2px dashed rgba(255, 255, 255, 0.1)'
                }}>
                  <Ticket size={64} style={{ color: '#FFD600', marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>
                    No Tickets created
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem' }}>
                    No tickets are currently set up for this opportunity.
                  </p>
                  <button 
                    onClick={() => setShowTicketModal(true)}
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
                    <Plus size={20} /> Add ticket
                  </button>
                </div>
              ) : (
                <div>
                  {formData.ticketsList.map((ticket) => (
                    <div key={ticket.id} style={{
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.5rem' }}>
                        {ticket.title}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#FFD600' }}>
                        ₹{ticket.amount}
                      </div>
                      {ticket.description && (
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem' }}>
                          {ticket.description}
                        </div>
                      )}
                      <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.5rem' }}>
                        {ticket.feeType} • {ticket.purchaseRequirement}
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setShowTicketModal(true)}
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
                    <Plus size={20} /> Add ticket
                  </button>
                </div>
              )}
            </div>

            {/* Account Details / Payout Form */}
            <div className="unified-form-group unified-full-width" style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#FFD600', margin: 0 }}>
                  Account details / Payout form
                </h3>
                <Edit 
                  size={18} 
                  style={{ color: '#FFD600', cursor: 'pointer' }} 
                  onClick={() => setShowAccountModal(true)}
                />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1rem' }}>
                Enter your bank account details to facilitate timely payment transfers after registration closes.
              </p>

              {/* Info Banner */}
              <div style={{
                padding: '1rem',
                background: 'rgba(33, 150, 243, 0.1)',
                border: '1px solid rgba(33, 150, 243, 0.3)',
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
                  background: 'rgba(33, 150, 243, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ color: '#2196F3', fontSize: '0.9rem', fontWeight: 'bold' }}>i</span>
                </div>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: 'rgba(33, 150, 243, 0.9)', 
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  We advise you add Payout details to receive payments on time!
                </p>
              </div>

              {/* Account Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {[
                  { label: 'Account holder', value: formData.accountDetails?.accountHolder },
                  { label: 'Phone No', value: formData.accountDetails?.phoneNo },
                  { label: 'Email', value: formData.accountDetails?.email },
                  { label: 'Bank account', value: formData.accountDetails?.bankAccount },
                  { label: 'Confirm bank account', value: formData.accountDetails?.confirmBankAccount },
                  { label: 'IFSC code', value: formData.accountDetails?.ifscCode },
                  { label: 'PAN number', value: formData.accountDetails?.panNumber },
                  { label: 'GSTIN', value: formData.accountDetails?.gstin },
                  { label: 'Address 1', value: formData.accountDetails?.address1, fullWidth: true },
                  { label: 'Address 2', value: formData.accountDetails?.address2, fullWidth: true },
                  { label: 'City', value: formData.accountDetails?.city },
                  { label: 'State', value: formData.accountDetails?.state },
                  { label: 'Pincode', value: formData.accountDetails?.pincode }
                ].map((field) => (
                  <div key={field.label} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    gridColumn: field.fullWidth ? '1 / -1' : 'auto'
                  }}>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>{field.label}:</span>
                    <span style={{ fontSize: '0.9rem', color: field.value ? '#FFD600' : 'rgba(255, 255, 255, 0.5)' }}>
                      {field.value || '--'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Get Service Charge From */}
            <div className="unified-form-group unified-full-width" style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#FFD600', marginBottom: '0.5rem' }}>
                Get service charge from
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem' }}>
                Specify if the processing fee/tax will be added to the participant's payment or deducted from the organizer's payout
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {/* Player Card */}
                <div 
                  onClick={() => handleChange('serviceChargeFrom', 'player')}
                  style={{
                    padding: '1.5rem',
                    background: formData.serviceChargeFrom === 'player' ? 'rgba(255, 214, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    border: formData.serviceChargeFrom === 'player' ? '2px solid #FFD600' : '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input
                      type="radio"
                      checked={formData.serviceChargeFrom === 'player'}
                      readOnly
                      style={{ accentColor: '#FFD600' }}
                    />
                    <h4 style={{ fontSize: '1rem', color: '#fff', margin: 0 }}>Player</h4>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    <p style={{ margin: '0.5rem 0' }}>Example</p>
                    <p style={{ margin: '0.5rem 0' }}>If registration amount: <span style={{ color: '#4CAF50' }}>₹100</span></p>
                    <p style={{ margin: '0.5rem 0' }}>Tax: 2%+ (18% GST of 2%)</p>
                    <p style={{ margin: '0.5rem 0' }}>User pay: <span style={{ color: '#FFD600' }}>₹102.36</span></p>
                    <p style={{ margin: '0.5rem 0' }}>You get: <span style={{ color: '#4CAF50' }}>₹100</span></p>
                  </div>
                </div>

                {/* Organiser Card */}
                <div 
                  onClick={() => handleChange('serviceChargeFrom', 'organiser')}
                  style={{
                    padding: '1.5rem',
                    background: formData.serviceChargeFrom === 'organiser' ? 'rgba(255, 214, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    border: formData.serviceChargeFrom === 'organiser' ? '2px solid #FFD600' : '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input
                      type="radio"
                      checked={formData.serviceChargeFrom === 'organiser'}
                      readOnly
                      style={{ accentColor: '#FFD600' }}
                    />
                    <h4 style={{ fontSize: '1rem', color: '#fff', margin: 0 }}>Organiser</h4>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    <p style={{ margin: '0.5rem 0' }}>Example</p>
                    <p style={{ margin: '0.5rem 0' }}>If registration amount: <span style={{ color: '#4CAF50' }}>₹100</span></p>
                    <p style={{ margin: '0.5rem 0' }}>Tax: 2.31(2% + (18% GST of 2%))</p>
                    <p style={{ margin: '0.5rem 0' }}>User pay: <span style={{ color: '#FFD600' }}>₹100</span></p>
                    <p style={{ margin: '0.5rem 0' }}>You get: <span style={{ color: '#4CAF50' }}>₹97.69</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="unified-form-group unified-full-width" style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#FFD600', marginBottom: '0.5rem' }}>
                Payment methods
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem' }}>
                Enable at least one payout method to ensure seamless transfer of funds
              </p>

              {paymentMethods.map((method) => {
                const isEnabled = formData.paymentMethods?.[method.id] ?? true;
                const IconComponent = method.icon;
                return (
                  <div 
                    key={method.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <IconComponent size={24} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.25rem' }}>
                          {method.name}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                          Service charge: {method.charge}
                        </div>
                      </div>
                    </div>
                    <label 
                      style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.preventDefault();
                        togglePaymentMethod(method.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => {}}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: isEnabled ? '#FFD600' : 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '26px',
                        transition: '0.4s'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '',
                          height: '20px',
                          width: '20px',
                          left: isEnabled ? '27px' : '3px',
                          bottom: '3px',
                          background: 'white',
                          borderRadius: '50%',
                          transition: '0.4s'
                        }} />
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add Ticket Modal */}
      {showTicketModal && (
        <div className="rounds-modal-overlay" onClick={() => setShowTicketModal(false)}>
          <div className="rounds-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="rounds-modal-header">
              <h3>Create a Ticket</h3>
              <button className="rounds-modal-close" onClick={() => setShowTicketModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="rounds-modal-body">
              {/* Ticket Title */}
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label">Ticket title</label>
                <input
                  type="text"
                  className="unified-form-input"
                  placeholder="Ticket 1"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                />
              </div>

              {/* Add Description Toggle */}
              <div style={{ marginBottom: '1rem' }}>
                <button
                  onClick={() => setShowDescriptionInput(!showDescriptionInput)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0'
                  }}
                >
                  <Plus size={18} /> Add ticket description (if any)
                </button>
                {showDescriptionInput && (
                  <textarea
                    className="unified-form-textarea"
                    placeholder="Enter ticket description"
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    rows={3}
                    style={{ marginTop: '0.5rem' }}
                  />
                )}
              </div>

              {/* Ticket Fee/Amount */}
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label">
                  Ticket Fee/ Amount (in INR) <span className="unified-required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '1rem'
                  }}>₹</span>
                  <input
                    type="number"
                    className="unified-form-input"
                    placeholder="00"
                    value={ticketForm.amount}
                    onChange={(e) => setTicketForm({ ...ticketForm, amount: e.target.value })}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              {/* Fee Type */}
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Fee type <Info size={16} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    className="unified-form-input"
                    value={ticketForm.feeType}
                    onChange={(e) => setTicketForm({ ...ticketForm, feeType: e.target.value })}
                    style={{ appearance: 'none', paddingRight: '2.5rem' }}
                  >
                    <option value="Team Fee">Team Fee</option>
                    <option value="Individual Fee">Individual Fee</option>
                  </select>
                  <ChevronDown size={20} style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255, 255, 255, 0.5)',
                    pointerEvents: 'none'
                  }} />
                </div>
              </div>

              {/* Ticket Purchase Requirement */}
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label">Ticket purchase requirement</label>
                <div style={{ position: 'relative' }}>
                  <select
                    className="unified-form-input"
                    value={ticketForm.purchaseRequirement}
                    onChange={(e) => setTicketForm({ ...ticketForm, purchaseRequirement: e.target.value })}
                    style={{ appearance: 'none', paddingRight: '2.5rem' }}
                  >
                    <option value="Required">Required</option>
                    <option value="Optional">Optional</option>
                  </select>
                  <ChevronDown size={20} style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255, 255, 255, 0.5)',
                    pointerEvents: 'none'
                  }} />
                </div>
              </div>

              {/* Send Invoice */}
              <div className="unified-form-group unified-full-width">
                <label className="unified-form-label">Do you want to send invoice to team</label>
                <div style={{ position: 'relative' }}>
                  <select
                    className="unified-form-input"
                    value={ticketForm.sendInvoice}
                    onChange={(e) => setTicketForm({ ...ticketForm, sendInvoice: e.target.value })}
                    style={{ appearance: 'none', paddingRight: '2.5rem' }}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                  <ChevronDown size={20} style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255, 255, 255, 0.5)',
                    pointerEvents: 'none'
                  }} />
                </div>
              </div>
            </div>
            <div className="rounds-modal-footer">
              <button 
                className="btn-primary" 
                onClick={handleAddTicket}
                disabled={!ticketForm.title || !ticketForm.amount}
              >
                Add Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Details Modal */}
      {showAccountModal && (
        <div className="rounds-modal-overlay" onClick={() => setShowAccountModal(false)}>
          <div className="rounds-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="rounds-modal-header">
              <h3>Account Details / Payout Form</h3>
              <button className="rounds-modal-close" onClick={() => setShowAccountModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="rounds-modal-body">
              <div className="unified-form-grid">
                {/* Account Holder */}
                <div className="unified-form-group">
                  <label className="unified-form-label">Account holder</label>
                  <input
                    type="text"
                    className="unified-form-input"
                    placeholder="Enter account holder name"
                    value={accountForm.accountHolder}
                    onChange={(e) => setAccountForm({ ...accountForm, accountHolder: e.target.value })}
                  />
                </div>

                {/* Phone No */}
                <div className="unified-form-group">
                  <label className="unified-form-label">Phone No</label>
                  <input
                    type="tel"
                    className="unified-form-input"
                    placeholder="Enter phone number"
                    value={accountForm.phoneNo}
                    onChange={(e) => setAccountForm({ ...accountForm, phoneNo: e.target.value })}
                  />
                </div>

                {/* Email */}
                <div className="unified-form-group unified-full-width">
                  <label className="unified-form-label">Email</label>
                  <input
                    type="email"
                    className="unified-form-input"
                    placeholder="Enter email address"
                    value={accountForm.email}
                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                  />
                </div>

                {/* Bank Account */}
                <div className="unified-form-group">
                  <label className="unified-form-label">Bank account</label>
                  <input
                    type="text"
                    className="unified-form-input"
                    placeholder="Enter bank account number"
                    value={accountForm.bankAccount}
                    onChange={(e) => setAccountForm({ ...accountForm, bankAccount: e.target.value })}
                  />
                </div>

                {/* Confirm Bank Account */}
                <div className="unified-form-group">
                  <label className="unified-form-label">Confirm bank account</label>
                  <input
                    type="text"
                    className="unified-form-input"
                    placeholder="Re-enter bank account number"
                    value={accountForm.confirmBankAccount}
                    onChange={(e) => setAccountForm({ ...accountForm, confirmBankAccount: e.target.value })}
                  />
                </div>

                {/* IFSC Code */}
                <div className="unified-form-group">
                  <label className="unified-form-label">IFSC code</label>
                  <input
                    type="text"
                    className="unified-form-input"
                    placeholder="Enter IFSC code"
                    value={accountForm.ifscCode}
                    onChange={(e) => setAccountForm({ ...accountForm, ifscCode: e.target.value })}
                  />
                </div>

                {/* PAN Number */}
                <div className="unified-form-group">
                  <label className="unified-form-label">PAN number</label>
                  <input
                    type="text"
                    className="unified-form-input"
                    placeholder="Enter PAN number"
                    value={accountForm.panNumber}
                    onChange={(e) => setAccountForm({ ...accountForm, panNumber: e.target.value })}
                  />
                </div>

                {/* GSTIN */}
                <div className="unified-form-group unified-full-width">
                  <label className="unified-form-label">GSTIN</label>
                  <input
                    type="text"
                    className="unified-form-input"
                    placeholder="Enter GSTIN"
                    value={accountForm.gstin}
                    onChange={(e) => setAccountForm({ ...accountForm, gstin: e.target.value })}
                  />
                </div>

                {/* Address 1 */}
                <div className="unified-form-group unified-full-width">
                  <label className="unified-form-label">Address 1</label>
                  <input
                    type="text"
                    className="unified-form-input"
                    placeholder="Enter address line 1"
                    value={accountForm.address1}
                    onChange={(e) => setAccountForm({ ...accountForm, address1: e.target.value })}
                  />
                </div>

                {/* Address 2 */}
                <div className="unified-form-group unified-full-width">
                  <label className="unified-form-label">Address 2</label>
                  <input
                    type="text"
                    className="unified-form-input"
                    placeholder="Enter address line 2"
                    value={accountForm.address2}
                    onChange={(e) => setAccountForm({ ...accountForm, address2: e.target.value })}
                  />
                </div>

                {/* City */}
                <div className="unified-form-group">
                  <label className="unified-form-label">City</label>
                  <input
                    type="text"
                    className="unified-form-input"
                    placeholder="Enter city"
                    value={accountForm.city}
                    onChange={(e) => setAccountForm({ ...accountForm, city: e.target.value })}
                  />
                </div>

                {/* State */}
                <div className="unified-form-group">
                  <label className="unified-form-label">State</label>
                  <input
                    type="text"
                    className="unified-form-input"
                    placeholder="Enter state"
                    value={accountForm.state}
                    onChange={(e) => setAccountForm({ ...accountForm, state: e.target.value })}
                  />
                </div>

                {/* Pincode */}
                <div className="unified-form-group">
                  <label className="unified-form-label">Pincode</label>
                  <input
                    type="text"
                    className="unified-form-input"
                    placeholder="Enter pincode"
                    value={accountForm.pincode}
                    onChange={(e) => setAccountForm({ ...accountForm, pincode: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="rounds-modal-footer">
              <button className="btn-secondary" onClick={() => setShowAccountModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveAccountDetails}>
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStep;
