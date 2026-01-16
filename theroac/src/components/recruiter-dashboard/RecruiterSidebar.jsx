import {
  Users,
  Briefcase,
  Calendar,
  UserCheck,
  Settings,
  Download,
  Grid,
  ClipboardCheck,
  Star,
  UsersRound
} from "lucide-react";

const navItems = [
  { id: "dashboard", icon: Grid, label: "Dashboard" },
  { id: "evaluate", icon: UserCheck, label: "Evaluate Events" },
  { id: "jobs", icon: Briefcase, label: "Jobs & Internships" },
  { id: "team", icon: UsersRound, label: "Team Management" },
  { id: "opportunities", icon: Star, label: "Opportunities" },
  { id: "events", icon: Calendar, label: "Events" },
  { id: "assessments", icon: ClipboardCheck, label: "Assessments" },
  { id: "talent", icon: Users, label: "Talent Pipeline" }
];

const RecruiterSidebar = ({
  activeTab,
  setActiveTab
}) => {
  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="organizer-sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${
              activeTab === item.id ? "active" : ""
            }`}
            onClick={() => handleNavClick(item.id)}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="nav-item">
          <Download className="w-5 h-5" />
          <span>My Download(s)</span>
        </button>

        <button
          className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default RecruiterSidebar;
