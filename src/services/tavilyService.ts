import { TAVILY_API_KEY } from './aiService';

export interface TavilySearchResult {
    title: string;
    url: string;
    content: string;
    score: number;
}

export interface TavilyResponse {
    results: TavilySearchResult[];
    query: string;
}

export interface CompanyEvent {
    id: string;
    title: string;
    type: 'Tech Talk' | 'Workshop' | 'Networking' | 'Info Session';
    date: string;
    description: string;
    registrationLink?: string;
}

export interface CompanyCourse {
    id: string;
    title: string;
    provider: string;
    duration: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    skills: string[];
    link: string;
}

/**
 * Search for real company events using Tavily API
 */
export async function searchCompanyEvents(companyName: string): Promise<CompanyEvent[]> {
    try {
        const query = `${companyName} upcoming events career tech talks workshops 2026`;

        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_key: TAVILY_API_KEY,
                query: query,
                search_depth: 'basic',
                include_answer: false,
                include_raw_content: false,
                max_results: 5,
                include_domains: [],
                exclude_domains: [],
            }),
        });

        if (!response.ok) {
            console.error('Tavily API error:', response.status, response.statusText);
            return [];
        }

        const data: TavilyResponse = await response.json();

        if (!data.results || data.results.length === 0) {
            console.log(`No events found for ${companyName}`);
            return [];
        }

        // Parse results into events
        const events: CompanyEvent[] = data.results.slice(0, 3).map((result, index) => {
            // Try to extract event type from title/content
            const content = `${result.title} ${result.content}`.toLowerCase();
            let eventType: CompanyEvent['type'] = 'Info Session';

            if (content.includes('tech talk') || content.includes('technical talk')) {
                eventType = 'Tech Talk';
            } else if (content.includes('workshop') || content.includes('hands-on')) {
                eventType = 'Workshop';
            } else if (content.includes('networking') || content.includes('mixer')) {
                eventType = 'Networking';
            }

            // Try to extract date from content (basic approach)
            const dateMatch = result.content.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/i);
            const extractedDate = dateMatch ? new Date(dateMatch[0]) : null;

            // Use extracted date or default to future date
            const eventDate = extractedDate && !isNaN(extractedDate.getTime())
                ? extractedDate.toISOString().split('T')[0]
                : new Date(Date.now() + (index + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            return {
                id: `tavily-event-${index + 1}`,
                title: result.title,
                type: eventType,
                date: eventDate,
                description: result.content.substring(0, 200) + (result.content.length > 200 ? '...' : ''),
                registrationLink: result.url,
            };
        });

        console.log(`Found ${events.length} events for ${companyName}`);
        return events;

    } catch (error) {
        console.error('Error searching for company events:', error);
        return [];
    }
}

/**
 * Search for real courses related to a company using Tavily API
 */
export async function searchCompanyCourses(companyName: string): Promise<CompanyCourse[]> {
    try {
        const query = `${companyName} online courses tutorials training certification`;

        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_key: TAVILY_API_KEY,
                query: query,
                search_depth: 'basic',
                include_answer: false,
                include_raw_content: false,
                max_results: 5,
                include_domains: [],
                exclude_domains: [],
            }),
        });

        if (!response.ok) {
            console.error('Tavily API error for courses:', response.status, response.statusText);
            return [];
        }

        const data: TavilyResponse = await response.json();

        if (!data.results || data.results.length === 0) {
            console.log(`No courses found for ${companyName}`);
            return [];
        }

        // Parse results into courses
        const courses: CompanyCourse[] = data.results.slice(0, 3).map((result, index) => {
            const content = `${result.title} ${result.content}`.toLowerCase();

            // Determine level
            let level: CompanyCourse['level'] = 'Intermediate';
            if (content.includes('beginner') || content.includes('introduction') || content.includes('basics')) {
                level = 'Beginner';
            } else if (content.includes('advanced') || content.includes('expert') || content.includes('master')) {
                level = 'Advanced';
            }

            // Determine provider from URL or content
            let provider = 'Online Platform';
            if (result.url.includes('udemy')) provider = 'Udemy';
            else if (result.url.includes('coursera')) provider = 'Coursera';
            else if (result.url.includes('edx')) provider = 'edX';
            else if (result.url.includes('pluralsight')) provider = 'Pluralsight';
            else if (result.url.includes('linkedin')) provider = 'LinkedIn Learning';
            else if (result.url.includes('youtube')) provider = 'YouTube';

            // Extract skills from content
            const skills: string[] = [];
            const skillKeywords = ['python', 'javascript', 'react', 'java', 'sql', 'aws', 'cloud', 'data', 'api', 'web'];
            skillKeywords.forEach(skill => {
                if (content.includes(skill)) {
                    skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
                }
            });
            if (skills.length === 0) skills.push('General Skills');

            return {
                id: `tavily-course-${index + 1}`,
                title: result.title.substring(0, 80) + (result.title.length > 80 ? '...' : ''),
                provider: provider,
                duration: '4-8 weeks',
                level: level,
                skills: skills.slice(0, 3),
                link: result.url,
            };
        });

        console.log(`Found ${courses.length} courses for ${companyName}`);
        return courses;

    } catch (error) {
        console.error('Error searching for company courses:', error);
        return [];
    }
}
