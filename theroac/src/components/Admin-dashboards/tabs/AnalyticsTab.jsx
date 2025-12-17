// src/components/admin/AdminDashboard/tabs/AnalyticsTab.jsx
import { BarChart3 } from "lucide-react";
import "./AnalyticsTab.css";

const AnalyticsTab = () => {
  return (
    <section className="admin-tab-content">
      <div className="analytics-placeholder">
        <BarChart3 className="w-16 h-16 mb-4" />
        <h3>Advanced Analytics</h3>
        <p>Comprehensive analytics and reporting features coming soon!</p>
      </div>
    </section>
  );
};

export default AnalyticsTab;
