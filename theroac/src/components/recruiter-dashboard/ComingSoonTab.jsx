const ComingSoonTab = ({ icon: Icon, title, description }) => {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-content">
        <Icon className="coming-soon-icon" size={64} />
        <h2>{title}</h2>
        <p>{description}</p>
        <span className="coming-soon-badge">Coming Soon</span>
      </div>
    </div>
  );
};

export default ComingSoonTab;
