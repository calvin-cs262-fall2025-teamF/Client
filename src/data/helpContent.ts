export interface HelpSection {
  title: string;
  content: string[];
}

export interface HelpContent {
  title: string;
  sections: HelpSection[];
}

export const helpContent: Record<string, HelpContent> = {
  Dashboard: {
    title: 'Dashboard',
    sections: [
      {
        title: 'What this shows',
        content: [
          'The Dashboard gives you a quick overview of your job search activity.',
        ],
      },
      {
        title: 'What you can do here',
        content: [
          'See how many jobs you\'ve applied to',
          'View upcoming deadlines or reminders',
          'Check your overall progress at a glance',
        ],
      },
      {
        title: 'How to use the Dashboard',
        content: [
          'Open the Dashboard tab',
          'Review your total applications and weekly progress stats',
          'Use Quick Actions to:',
          '  • Find job opportunities',
          '  • Add new job applications',
          '  • Add new target companies',
          'The Dashboard helps you stay organized and focused every time you open the app.',
        ],
      },
    ],
  },
  JobTracker: {
    title: 'Job Tracker',
    sections: [
      {
        title: 'What this does',
        content: [
          'The Job Tracker helps you keep track of every job application in one place.',
        ],
      },
      {
        title: 'Why this matters',
        content: [
          'Tracking applications prevents missed follow-ups and keeps your job search organized.',
        ],
      },
      {
        title: 'How to add a job application',
        content: [
          '• Tap "Add Your First Application"',
          '• Enter the Company name, Role, Job link, and Location',
          '• Select the current application status',
          '• Save to begin tracking',
        ],
      },
      {
        title: 'How to update a job',
        content: [
          '• Open a job entry',
          '• Edit the status or job details',
          '• Save your changes',
        ],
      },
    ],
  },
  Recommendations: {
    title: 'Jobs',
    sections: [
      {
        title: 'What this does',
        content: [
          'The Jobs tab lets you explore job opportunities and save roles you\'re interested in.',
        ],
      },
      {
        title: 'When to use it',
        content: [
          'Use this tab when researching jobs or planning where to apply next.',
        ],
      },
      {
        title: 'How to use Jobs',
        content: [
          '• Open the Jobs tab',
          '• Browse or search for roles',
          '• Use Filters to tailor results to your preferences',
          '• Tap a job to view full details on the external website',
        ],
      },
    ],
  },
  Targets: {
    title: 'Companies',
    sections: [
      {
        title: 'What this does',
        content: [
          'The Companies tab helps you monitor your target companies and add new ones.',
        ],
      },
      {
        title: 'Why this matters',
        content: [
          'Understanding a company helps you tailor applications and prepare for interviews.',
        ],
      },
      {
        title: 'How to use Companies',
        content: [
          '• Open the Companies tab',
          '• Search for or select a company',
          '• View key details, events, courses, and checklists',
          '• Company gets added to list of Target Companies',
        ],
      },
    ],
  },
  Resume: {
    title: 'Resume Manager',
    sections: [
      {
        title: 'What this does',
        content: [
          'The Resumes tab lets you store and manage multiple versions of your resume using different resumes, tailored for different roles or industries',
        ],
      },
      {
        title: 'How to upload a resume',
        content: [
          '• Open the Resumes tab',
          '• Tap Upload PDF Resume',
          '• Select a PDF file from your device',
          '• Resumes will be available when applying for jobs.',
        ],
      },
      {
        title: 'How to tailor a resume',
        content: [
          '• Open the Resumes tab',
          '• Tap Tailor Resume for Job',
          '• Select the resume to tailor',
          '• Enter the Company name',
          '• Enter the Position title',
          '• Paste the Job description',
          '• Tap Start Tailoring',
          '• Resume will be tailored for the job.',
        ],
      },
    ],
  },
  Tailoring: {
    title: 'Tailoring Resumes',
    sections: [
      {
        title: 'What this does',
        content: [
          'Resume Tailoring helps you customize a resume for a specific job.',
        ],
      },
      {
        title: 'How to tailor a resume',
        content: [
          'Click Tailor Resume for Job',
          'Enter the company name',
          'Enter the position title',
          'Paste the job description',
          'Click Start Tailoring',
          'Poros uses this information to help tailor your resume to the role.',
        ],
      },
    ],
  },
};

