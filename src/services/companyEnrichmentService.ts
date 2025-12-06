// Import the API key from aiService to avoid duplication
// Make sure to update the API key in aiService.ts with your actual Anthropic API key
import { ANTHROPIC_API_KEY } from './aiService';
import { searchCompanyEvents, searchCompanyCourses } from './tavilyService';
import { Event, Course, ChecklistItem } from '../types';


export interface EnrichedCompanyData {
  name: string;
  industry: string;
  logo: string;
  companyInfo: {
    size: string;
    culture: string[];
    benefits: string[];
    interviewProcess: string[];
  };
  applicationTimeline: {
    internship: string;
    fullTime: string;
    contractor: string;
    coop: string;
  };
  events: Event[];
  recommendedCourses: Course[];
  preparationChecklist: ChecklistItem[];
}

/**
 * Enriches company data using Claude API for company info/courses/checklist
 * and Tavily API for real event search
 * @param companyName - The name of the company to enrich
 * @returns Enriched company data
 */
export async function enrichCompanyData(companyName: string): Promise<EnrichedCompanyData> {
  try {
    console.log(`Enriching data for company: ${companyName}`);

    // Search for real events and courses using Tavily API
    console.log(`Searching for real events for ${companyName}...`);
    const realEvents = await searchCompanyEvents(companyName);
    console.log(`Found ${realEvents.length} real events for ${companyName}`);

    console.log(`Searching for real courses for ${companyName}...`);
    const realCourses = await searchCompanyCourses(companyName);
    console.log(`Found ${realCourses.length} real courses for ${companyName}`);

    // Generate future dates for the template (in case we need them)
    const now = new Date();
    const event1Date = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month from now
    const event2Date = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 2 months from now
    const event3Date = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months from now

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const prompt = `You are a career research assistant. I need comprehensive information about the company "${companyName}" for a job search application.

Please provide the following information in a structured JSON format. Be specific and realistic based on your knowledge of the company.

{
  "name": "${companyName}",
  "industry": "Brief industry description (e.g., 'Social Media & Technology', 'Music Streaming & Technology')",
  "logo": "A single emoji that represents the company (e.g., 🔍 for Google, 🍎 for Apple, 🎵 for Spotify)",
  "companyInfo": {
    "size": "Employee count range (e.g., '10,000+ employees')",
    "culture": ["Value 1", "Value 2", "Value 3", "Value 4"],
    "benefits": ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4"],
    "interviewProcess": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]
  },
  "applicationTimeline": {
    "internship": "Typical application period (e.g., 'September - November')",
    "fullTime": "Typical application period",
    "contractor": "Typical application period (often 'Year-round')",
    "coop": "Typical application period"
  },
  "events": [
    {
      "id": "1",
      "title": "Realistic event name related to ${companyName}",
      "type": "Tech Talk",
      "date": "${formatDate(event1Date)}",
      "description": "Brief description of the event",
      "registrationLink": "Real URL to ${companyName}'s events/careers page (e.g., https://meta.com/careers/events or https://google.com/events)"
    },
    {
      "id": "2",
      "title": "Another event",
      "type": "Workshop",
      "date": "${formatDate(event2Date)}",
      "description": "Brief description",
      "registrationLink": "Real URL to ${companyName}'s events page"
    },
    {
      "id": "3",
      "title": "Third event",
      "type": "Networking",
      "date": "${formatDate(event3Date)}",
      "description": "Brief description",
      "registrationLink": "Real URL to ${companyName}'s events or careers page"
    }
  ],
  "recommendedCourses": [
    {
      "id": "1",
      "title": "Relevant course for ${companyName}",
      "provider": "Course provider (e.g., Coursera, Udemy, company name)",
      "duration": "X weeks",
      "level": "Beginner",
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "link": "https://example.com/course"
    },
    {
      "id": "2",
      "title": "Another relevant course",
      "provider": "Provider",
      "duration": "X weeks",
      "level": "Intermediate",
      "skills": ["Skill 1", "Skill 2"],
      "link": "https://example.com/course2"
    },
    {
      "id": "3",
      "title": "Advanced course",
      "provider": "Provider",
      "duration": "X weeks",
      "level": "Advanced",
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "link": "https://example.com/course3"
    }
  ],
  "preparationChecklist": [
    {
      "id": "1",
      "title": "Portfolio task relevant to ${companyName}",
      "description": "Detailed description of what to do",
      "completed": false,
      "category": "Portfolio"
    },
    {
      "id": "2",
      "title": "Interview prep task",
      "description": "What to practice",
      "completed": false,
      "category": "Interview Prep"
    },
    {
      "id": "3",
      "title": "Culture study task",
      "description": "What to research about the company",
      "completed": false,
      "category": "Culture Study"
    },
    {
      "id": "4",
      "title": "Technical skills task",
      "description": "What technical skills to learn",
      "completed": false,
      "category": "Technical Skills"
    }
  ]
}

IMPORTANT GUIDELINES:
- Return ONLY the JSON object, no markdown formatting or additional text
- Be realistic and accurate based on your knowledge of ${companyName}
- Event types must be one of: "Tech Talk", "Workshop", "Networking", "Info Session"
- Course levels must be one of: "Beginner", "Intermediate", "Advanced"
- Checklist categories must be one of: "Portfolio", "Interview Prep", "Culture Study", "Technical Skills"
- Make events, courses, and checklist items specific to ${companyName}'s industry and culture
- CRITICAL: Provide REAL, working URLs to ${companyName}'s actual events/careers pages (e.g., https://meta.com/careers/events, https://google.com/events)
- DO NOT use example.com or placeholder URLs - use the company's actual website
- Use the exact dates provided in the template (they are already set to future dates)
- Provide actual course links if you know them, otherwise use placeholder URLs
- Make the emoji representative of the company's brand or industry`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096, // Increased for more content
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API Error:', errorData);
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.content[0].text;

    // Parse the JSON response
    const enrichedData: EnrichedCompanyData = JSON.parse(responseText.trim());

    // Replace Claude-generated events and courses with real Tavily results
    enrichedData.events = realEvents;
    enrichedData.recommendedCourses = realCourses;

    return enrichedData;
  } catch (error) {
    console.error('Error enriching company data:', error);

    // Return fallback data if API fails (but with real events from Tavily if available)
    const fallbackData = generateFallbackCompanyData(companyName);

    // Try to get real events even if Claude fails
    try {
      const realEvents = await searchCompanyEvents(companyName);
      fallbackData.events = realEvents;
    } catch (eventError) {
      console.error('Error fetching events for fallback:', eventError);
      // Keep empty events array from fallback
    }

    return fallbackData;
  }
}

/**
 * Generates fallback company data when API fails
 * @param companyName - The name of the company
 * @returns Basic company data structure
 */
export const generateFallbackCompanyData = (companyName: string): EnrichedCompanyData => {
  // Calculate future dates for events (1-3 months from now)
  const now = new Date();
  const event1Date = new Date(now);
  event1Date.setMonth(now.getMonth() + 1);
  const event2Date = new Date(now);
  event2Date.setMonth(now.getMonth() + 2);
  const event3Date = new Date(now);
  event3Date.setMonth(now.getMonth() + 3);

  // Format dates as YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  return {
    name: companyName,
    industry: 'Technology',
    logo: '🏢',
    companyInfo: {
      size: 'Information not available',
      culture: ['Innovation', 'Collaboration', 'Growth', 'Excellence'],
      benefits: ['Competitive Salary', 'Health Insurance', 'Professional Development', 'Work-Life Balance'],
      interviewProcess: [
        'Initial Application Review',
        'Phone Screen',
        'Technical Interview',
        'Onsite/Virtual Interview',
        'Final Decision',
      ],
    },
    applicationTimeline: {
      internship: 'September - November',
      fullTime: 'August - December',
      contractor: 'Year-round',
      coop: 'September - November',
    },
    events: [],  // No fallback events - Tavily will provide real events or empty array
    recommendedCourses: [
      {
        id: '1',
        title: 'Software Development Fundamentals',
        provider: 'Coursera',
        duration: '6 weeks',
        level: 'Beginner',
        skills: ['Programming', 'Software Engineering', 'Problem Solving'],
        link: 'https://coursera.org',
      },
      {
        id: '2',
        title: 'Advanced System Design',
        provider: 'Udemy',
        duration: '8 weeks',
        level: 'Intermediate',
        skills: ['System Design', 'Architecture', 'Scalability'],
        link: 'https://udemy.com',
      },
      {
        id: '3',
        title: 'Leadership and Communication',
        provider: 'LinkedIn Learning',
        duration: '4 weeks',
        level: 'Beginner',
        skills: ['Leadership', 'Communication', 'Teamwork'],
        link: 'https://linkedin.com/learning',
      },
    ],
    preparationChecklist: [
      {
        id: '1',
        title: 'Build a Portfolio Project',
        description: `Create a project that demonstrates skills relevant to ${companyName}`,
        completed: false,
        category: 'Portfolio',
      },
      {
        id: '2',
        title: 'Practice Technical Interviews',
        description: 'Review common interview questions and practice coding challenges',
        completed: false,
        category: 'Interview Prep',
      },
      {
        id: '3',
        title: `Research ${companyName}'s Culture`,
        description: `Learn about ${companyName}'s mission, values, and work environment`,
        completed: false,
        category: 'Culture Study',
      },
      {
        id: '4',
        title: 'Develop Technical Skills',
        description: 'Focus on technologies and tools commonly used in the industry',
        completed: false,
        category: 'Technical Skills',
      },
    ],
  };
};
