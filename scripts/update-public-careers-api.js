import fs from 'node:fs';

const publicApiFile = 'C:/MooNsEvents/server/src/compatibility/publicApi.ts';
let code = fs.readFileSync(publicApiFile, 'utf8');

const careerFunctions = `
async function publicCareerJobs() {
  try {
    const jobs = await prisma.careers_jobs.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
    });
    if (jobs && jobs.length > 0) return jobs;
  } catch (err) {
    console.warn('[Public API] careers_jobs query fallback:', err);
  }
  // Default Event Production Openings fallback
  return [
    {
      id: 1,
      title: "Wedding Production & Stage Lead",
      department: "Wedding Operations",
      location: "Hyderabad / Pan-India",
      type: "Full-time",
      description: "Direct on-site wedding mandap setup, floral production, vendor synchronization, and wedding day run-of-show execution.",
      responsibilities: "Manage on-site decor crews, coordinate with banquet venue managers, ensure Zero No-Show SLA compliance.",
      requirements: "3+ years event production experience, crisis management skills, strong vendor leadership.",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Audio-Visual & Intelligent Lighting Engineer",
      department: "Technical Production",
      location: "Hyderabad / Bengaluru",
      type: "Full-time",
      description: "Manage line-array sound systems, DMX moving head trussing, LED walls, and live failover systems for concerts and summits.",
      responsibilities: "Design truss rigging, engineer sound consoles, oversee 4K live broadcast signal distribution.",
      requirements: "Experience with digital mixers, DMX512 controllers, LED video processors.",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: "Master Emcee & VIP Hospitality Captain",
      department: "Guest Experience",
      location: "Hyderabad / Mumbai",
      type: "Full-time",
      description: "Orchestrate grand entrances, VIP guest welcome protocols, registration desks, and schedule adherence.",
      responsibilities: "Train hostess teams, lead guest registration desks, coordinate bridal car and bus fleet arrivals.",
      requirements: "Excellent bilingual communication (English/Hindi/Telugu), graceful under pressure, luxury hospitality background.",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 4,
      title: "Transport & Logistics Fleet Dispatcher",
      department: "Fleet Operations",
      location: "Pan-India",
      type: "Full-time",
      description: "Command the relative transport fleet: 50-seater AC buses, tempo travelers, and VIP bridal cars with real-time GPS routing.",
      responsibilities: "Coordinate driver manifests, route planning, airport pickups, and zero-delay turnaround.",
      requirements: "Logistics dispatching background, GPS fleet tracker familiarity, emergency route rerouting experience.",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 5,
      title: "Gourmet Catering & Live Station Manager",
      department: "Food & Beverage",
      location: "Hyderabad",
      type: "Full-time",
      description: "Oversee multi-cuisine banquet buffets, food temperature safety, live stations, mocktail bars, and plating quality.",
      responsibilities: "Manage kitchen timeline, dietary allergy protocols, live chaat and dessert station throughput.",
      requirements: "Hospitality degree or 4+ years 5-star banquet catering operations experience.",
      is_active: true,
      created_at: new Date().toISOString(),
    }
  ];
}

async function publicCareerApply(request: Request) {
  const body = await request.json();
  const {
    jobId,
    jobTitle,
    name,
    email,
    phone,
    resumeUrl,
    coverLetter,
    mockTestScore,
    mockTestAnswers,
  } = body;

  if (!name || !email || !phone) {
    return badRequest('Name, email, and phone are required.');
  }

  const score = typeof mockTestScore === 'number' ? mockTestScore : 0;
  const isQualified = score >= 75;
  const applicationStatus = isQualified ? 'shortlisted' : 'rejected';

  let savedApplication: any = null;
  try {
    savedApplication = await prisma.careers_applications.create({
      data: {
        job_id: Number(jobId) || 1,
        name,
        email,
        phone,
        resume_url: resumeUrl || 'https://moons.events/resumes/submitted-profile',
        cover_letter: coverLetter || \`Applied for \${jobTitle || 'Event Role'}. Reasoning Test score: \${score}%\`,
        status: applicationStatus as any,
        mock_test_score: score,
        mock_test_answers: typeof mockTestAnswers === 'string' ? mockTestAnswers : JSON.stringify(mockTestAnswers || {}),
      },
    });
  } catch (err) {
    console.warn('[Public API] Error saving to careers_applications:', err);
  }

  return json({
    success: true,
    applicationId: savedApplication?.id || Date.now(),
    qualified: isQualified,
    score,
    status: applicationStatus,
    message: isQualified
      ? 'Congratulations! You passed the MooNs Event Scenario Reasoning Test. Your application is shortlisted for Round 2.'
      : 'Thank you for your application. Unfortunately, your test score did not meet the 75% benchmark for this cycle. We wish you the best in your career journey.',
  });
}
`;

// Insert the career functions before export handlePublicApi
const targetIdx = code.indexOf('export async function handlePublicApi');
if (targetIdx !== -1) {
  code = code.slice(0, targetIdx) + careerFunctions + '\n\n' + code.slice(targetIdx);
}

// Add the route matching in handlePublicApi
const routerTarget = "if (pathname === '/api/public/reviews') return json(await reviews(url));";
const routerReplacement = `if (pathname === '/api/public/careers/jobs') return json(await publicCareerJobs());
    if (pathname === '/api/public/careers/apply') {
      if (request.method !== 'POST') return badRequest('POST required');
      return await publicCareerApply(request);
    }
    if (pathname === '/api/public/reviews') return json(await reviews(url));`;

code = code.replace(routerTarget, routerReplacement);

fs.writeFileSync(publicApiFile, code, 'utf8');
console.log('Successfully updated publicApi.ts with Careers endpoints');
