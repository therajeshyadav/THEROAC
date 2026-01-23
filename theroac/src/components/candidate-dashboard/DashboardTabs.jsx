// src/components/candidate-dashboard/DashboardTabs.jsx
import React from "react";
import HomeTab from "./HomeTab";
import JobsTab from "./JobsTab";
import EventsTab from "./EventsTab";
import PrimeHubTab from "./PrimeHubTab";
import ApplicationsTab from "./ApplicationsTab";
import SavedItemsTab from "./SavedItemsTab";
import ProfileTab from "./CandidateProfilePage";

const DashboardTabs = ({
  activeTab,
  quickStats,
  jobs,
  events,
  hubContent,
  applications,
  dashboardStats,
  appliedItems,
  authUser,
  profileCompletion,
  isEditingProfile,
  profileData,
  getStatusColor,
  onApplyJob,
  onRegisterEvent,
  onApplyHubContent,
  onViewJobDetails,
  onViewEventDetails,
  onViewHubContentDetails,
  onEditProfile,
  onSaveProfile,
  onCancelEdit,
  onProfileInputChange,
  setActiveTab,
}) => {
  if (activeTab === "internships") {
    return (
      <HomeTab
        quickStats={quickStats}
        applications={applications}
        events={events}
        jobs={jobs}
        dashboardStats={dashboardStats}
        appliedItems={appliedItems}
        authUser={authUser}
        profileCompletion={profileCompletion}
        getStatusColor={getStatusColor}
        onApplyJob={onApplyJob}
        onViewJobDetails={onViewJobDetails}
        onViewEventDetails={onViewEventDetails}
        setActiveTab={setActiveTab}
      />
    );
  }

  if (activeTab === "jobs") {
    // Extract internships from hubContent to pass to JobsTab
    const internships = hubContent
      ? hubContent.filter((item) => item.contentType === "internship")
      : [];

    return (
      <JobsTab
        jobs={jobs}
        internships={internships}
        dashboardStats={dashboardStats}
        appliedItems={appliedItems}
        onApplyJob={onApplyJob}
        onViewJobDetails={onViewJobDetails}
      />
    );
  }

  if (activeTab === "events") {
    return (
      <EventsTab
        events={events}
        appliedItems={appliedItems}
        onRegisterEvent={onRegisterEvent}
        onViewEventDetails={onViewEventDetails}
      />
    );
  }

  if (activeTab === "prime-hub") {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>
        <h3>ROAC Prime is coming soon 🚧</h3>
        <p>This section is currently locked.</p>
      </div>
    );
  }

  if (activeTab === "applications") {
    return (
      <ApplicationsTab
        applications={applications}
        getStatusColor={getStatusColor}
        onViewJobDetails={onViewJobDetails}
      />
    );
  }

  if (activeTab === "saved-items") {
    return <SavedItemsTab />;
  }

  if (activeTab === "profile") {
    return (
      <ProfileTab initialProfile={authUser} onSaveProfile={onSaveProfile} />
    );
  }

  return null;
};

export default DashboardTabs;
