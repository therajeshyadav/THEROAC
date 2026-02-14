import { Edit3, FileText, Users, TrendingUp, Info, Sparkles } from 'lucide-react';

export const getStepsForType = (contentType) => {
  const commonSteps = {
    eligibility: { key: 'eligibility', label: 'Eligibility', icon: <FileText size={20} /> },
    additional: { key: 'additional', label: 'Additional Info', icon: <FileText size={20} /> },
    banner: { key: 'banner', label: 'Banner / Theme', icon: <Sparkles size={20} /> },
  };

  if (contentType === 'job') {
    return [
      { key: 'details', label: 'Job Details', icon: <Edit3 size={20} /> },
      commonSteps.eligibility,
      { key: 'application', label: 'Application Settings', icon: <Users size={20} /> },
      { key: 'rounds', label: 'Hiring Rounds', icon: <TrendingUp size={20} /> },
      commonSteps.additional,
      commonSteps.banner,
    ];
  }

  if (contentType === 'internship') {
    return [
      { key: 'details', label: 'Internships Details', icon: <Edit3 size={20} /> },
      commonSteps.eligibility,
      { key: 'application', label: 'Application Settings', icon: <Users size={20} /> },
      { key: 'rounds', label: 'Hiring Rounds', icon: <TrendingUp size={20} /> },
      commonSteps.additional,
      commonSteps.banner,
    ];
  }

  if (contentType === 'opportunity') {
    return [
      { key: 'details', label: 'Basic details', icon: <Edit3 size={20} /> },
      commonSteps.eligibility,
      { key: 'application', label: 'Registration Settings', icon: <Users size={20} /> },
      { key: 'rounds', label: 'Rounds & Stages', icon: <TrendingUp size={20} /> },
      { key: 'prizes', label: 'Prizes', icon: <Info size={20} /> },
      { key: 'payment', label: 'Payment', icon: <Info size={20} /> },
      commonSteps.additional,
      commonSteps.banner,
    ];
  }

  return [];
};
