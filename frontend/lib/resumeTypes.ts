export interface ResumePersonal {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export interface ResumeData {
  personal: ResumePersonal;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
}

export const defaultResumeData: ResumeData = {
  personal: { name: '', email: '', phone: '', location: '', linkedin: '', website: '' },
  summary: '',
  experience: [],
  education: [],
  skills: [],
};

export const RESUME_STORAGE_KEY = 'ai_job_tracker_resume_draft';
export const RESUME_SUMMARY_KEY = 'ai_job_tracker_ai_summary';
