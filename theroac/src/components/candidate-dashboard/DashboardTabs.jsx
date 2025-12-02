// src/components/candidate-dashboard/DashboardTabs.jsx
import React from "react";
import HomeTab from "./HomeTab";
import JobsTab from "./JobsTab";
import EventsTab from "./EventsTab";
import PrimeHubTab from "./PrimeHubTab";
import ApplicationsTab from "./ApplicationsTab";
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
    return (
      <JobsTab
        jobs={jobs}
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
      <PrimeHubTab
        hubContent={hubContent}
        appliedItems={appliedItems}
        onApplyHubContent={onApplyHubContent}
        onViewHubContentDetails={onViewHubContentDetails}
        setActiveTab={setActiveTab}
      />
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

  if (activeTab === "profile") {
    return (
      <ProfileTab
        initialProfile={authUser}
        onSaveProfile={onSaveProfile}
      />
    );
  }

  return null;
};

export default DashboardTabs;
