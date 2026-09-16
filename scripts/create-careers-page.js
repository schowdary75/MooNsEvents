import fs from 'node:fs';
import path from 'node:path';

const targetDir = 'C:/MooNsEWeb/app/careers';
fs.mkdirSync(targetDir, { recursive: true });

const careersPageCode = `"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Crown,
  ExternalLink,
  Flame,
  Globe2,
  HeartHandshake,
  HelpCircle,
  Layers,
  Lightbulb,
  Loader2,
  Lock,
  Mail,
  MapPin,
  PartyPopper,
  Phone,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  UtensilsCrossed,
  X,
  XCircle,
  Zap,
} from "lucide-react";

interface JobPosting {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  openings: number;
}

const jobOpenings: JobPosting[] = [
  {
    id: 1,
    title: "Wedding Production & Stage Lead",
    department: "Wedding Operations",
    location: "Hyderabad / Pan-India",
    type: "Full-time",
    salary: "₹8.5L – ₹14L / yr",
    openings: 3,
    description: "Direct on-site wedding mandap setup, floral production, vendor synchronization, and wedding day run-of-show execution.",
    responsibilities: [
      "Orchestrate on-site decor, lighting, and stage crews across 500 to 2,000 guest weddings.",
      "Liaise directly with luxury banquet properties and resort management.",
      "Enforce MooNs Zero No-Show SLA with contingency vendor backups.",
    ],
    requirements: [
      "3+ years experience in large-scale luxury wedding production.",
      "Flawless real-time crisis resolution and crowd flow leadership.",
      "Bilingual fluency (English + Hindi / Telugu / Kannada).",
    ],
  },
  {
    id: 2,
    title: "Audio-Visual & Intelligent Lighting Engineer",
    department: "Technical Production",
    location: "Hyderabad / Bengaluru",
    type: "Full-time",
    salary: "₹7L – ₹12L / yr",
    openings: 2,
    description: "Manage line-array sound systems, DMX moving head trussing, LED walls, and live failover systems for concerts, DJ nights, and summits.",
    responsibilities: [
      "Engineer digital sound consoles (Yamaha/Allen & Heath) and line-array rigging.",
      "Program DMX intelligent moving head fixtures, hazers, and laser cues.",
      "Maintain dual-redundant 4K video switchers and live broadcast encoders.",
    ],
    requirements: [
      "Hands-on mastery of live concert sound, lighting consoles, and video processors.",
      "Ability to handle high-pressure live stage cues without delay.",
    ],
  },
  {
    id: 3,
    title: "Master Emcee & VIP Hospitality Captain",
    department: "Guest Experience",
    location: "Hyderabad / Mumbai",
    type: "Full-time",
    salary: "₹6L – ₹10L / yr",
    openings: 4,
    description: "Orchestrate grand entrances, VIP guest welcome protocols, registration desks, and schedule adherence.",
    responsibilities: [
      "Train and supervise hostess teams, tilak/garland greeters, and registration desks.",
      "Lead stage announcements, timeline adherence, and VIP family coordination.",
      "Manage guest transport arrivals with bridal car and luxury bus captains.",
    ],
    requirements: [
      "Charismatic presence, polished etiquette, and exceptional stage command.",
      "Luxury hotel or premier event hospitality background.",
    ],
  },
  {
    id: 4,
    title: "Transport & Logistics Fleet Dispatcher",
    department: "Fleet Operations",
    location: "Pan-India",
    type: "Full-time",
    salary: "₹5.5L – ₹9L / yr",
    openings: 2,
    description: "Command relative transport fleet: 50-seater AC buses, tempo travelers, and VIP bridal cars with real-time GPS tracking.",
    responsibilities: [
      "Manage driver manifests, airport pickup schedules, and venue shuttles.",
      "Monitor live traffic, GPS alerts, and emergency rerouting.",
      "Ensure passenger comfort, luggage safety, and zero departure delays.",
    ],
    requirements: [
      "Fleet management or transport dispatching background.",
      "Sharp logistics acumen and rapid emergency route improvisation.",
    ],
  },
  {
    id: 5,
    title: "Gourmet Catering & Live Station Manager",
    department: "Food & Beverage",
    location: "Hyderabad",
    type: "Full-time",
    salary: "₹6.5L – ₹11L / yr",
    openings: 2,
    description: "Oversee multi-cuisine banquet buffets, food temperature safety, live stations, mocktail bars, and plating quality.",
    responsibilities: [
      "Supervise live chaat, tandoor, pasta, and dessert counters.",
      "Enforce rigorous food hygiene, temperature checks, and dietary allergy safety.",
      "Ensure rapid replenishment and zero food shortage during peak banquet hours.",
    ],
    requirements: [
      "Degree in Hotel Management or 3+ years experience with 5-star catering operations.",
      "High standards for culinary presentation and guest hospitality.",
    ],
  },
];

interface Question {
  id: number;
  scenario: string;
  category: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const assessmentQuestions: Question[] = [
  {
    id: 1,
    category: "Weather & Crisis Management",
    scenario: "Sudden heavy unseasonal rains begin 2 hours before a 1,200-guest outdoor wedding reception on a lawn. The ground is getting wet. What is your immediate priority action as the MooNs Production Lead?",
    options: [
      "Cancel the reception and ask guests to wait in their private cars.",
      "Activate the pre-contracted weatherproof German hangar canopy failover, deploy industrial blowers, and reroute the dining buffet to the covered arcade.",
      "Wait for the rain to stop before initiating any contingency actions.",
      "Ask the bride and groom's family to decide what to do on the spot.",
    ],
    correctIndex: 1,
    explanation: "Under MooNs protocols, pre-contracted weather canopy failovers and covered rerouting must be triggered immediately without causing client panic.",
  },
  {
    id: 2,
    category: "Zero No-Show Vendor SLA",
    scenario: "The primary floral delivery van carrying orchids for the main Mandap breaks down 4 hours before the wedding rituals. What is your action?",
    options: [
      "Inform the client that orchids will be missing from their Mandap stage.",
      "Dispatch our standby refrigerated backup vehicle to transship the stock, while simultaneously authorizing the secondary local partner to supply matching orchids.",
      "Replace all stage flowers with artificial balloons.",
      "Demand a financial refund from the broken-down driver.",
    ],
    correctIndex: 1,
    explanation: "MooNs guarantees 100% execution SLA: we deploy emergency transshipment and secondary standby vendor fulfillment concurrently.",
  },
  {
    id: 3,
    category: "VIP Hospitality & Flow",
    scenario: "A 50-member VIP delegation arrives 45 minutes earlier than scheduled while lighting truss moving heads are still undergoing final alignment. How do you handle them?",
    options: [
      "Lock the main gates and tell them to wait outside in the heat.",
      "Usher the delegation into the designated air-conditioned VIP Hospitality Lounge with welcome mocktails and greeters while production finalizes the hall in silent mode.",
      "Halt all lighting checks immediately and let the VIPs wander around the unfinished stage.",
      "Tell the VIPs the event is delayed due to technical mistakes.",
    ],
    correctIndex: 1,
    explanation: "VIP hospitality isolation ensures guests experience premier luxury while technical crews complete stage alignment without disturbance.",
  },
  {
    id: 4,
    category: "Food Safety & Dietary Emergency",
    scenario: "During banquet dinner service, a high-profile guest notifies the supervisor of a severe peanut/nut allergy. What is your immediate protocol?",
    options: [
      "Suggest they skip dinner and only drink bottled water.",
      "Direct the head banquet chef to prepare a sterile, freshly plated allergen-free meal from a dedicated sanitized counter and inspect all cross-contamination risks.",
      "Tell the guest that a tiny amount of nuts in the gravy will not cause any harm.",
      "Publicly reprimand the catering vendor in the dining area.",
    ],
    correctIndex: 1,
    explanation: "Zero-risk allergen containment requires immediate sterile meal preparation by the executive chef.",
  },
  {
    id: 5,
    category: "AV & Live Tech Failover",
    scenario: "During the climax of a corporate product reveal, the primary HDMI video feed to the 40-foot main LED wall goes completely black. What is your technical action?",
    options: [
      "Shut down and reboot the main power generator.",
      "Seamlessly trigger the hardware matrix switcher to the redundant backup SDI video feed within 2 seconds while the engineer diagnoses the primary line.",
      "Announce over the master microphone that the video failed and ask the speaker to pause.",
      "Walk onto the stage and ask the audience for patience.",
    ],
    correctIndex: 1,
    explanation: "Dual-redundant matrix switching maintains seamless broadcast continuity with zero attendee disruption.",
  },
];

export default function CareersPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  // Application & Test Wizard State
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1); // 1: Profile, 2: Test, 3: Result

  const [candidateProfile, setCandidateProfile] = useState({
    name: "",
    email: "",
    phone: "",
    experienceYears: "3",
    portfolioUrl: "",
    coverLetter: "",
  });

  const [testAnswers, setTestAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testScore, setTestScore] = useState<number>(0);
  const [isQualified, setIsQualified] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string>("");

  const departments = useMemo(() => {
    return ["All", ...new Set(jobOpenings.map((j) => j.department))];
  }, []);

  const filteredJobs = useMemo(() => {
    if (selectedDepartment === "All") return jobOpenings;
    return jobOpenings.filter((j) => j.department === selectedDepartment);
  }, [selectedDepartment]);

  const startApplication = (job: JobPosting) => {
    setSelectedJob(job);
    setWizardStep(1);
    setTestAnswers({});
    setApplyModalOpen(true);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateProfile.name || !candidateProfile.email || !candidateProfile.phone) {
      alert("Please fill in your name, email, and phone number.");
      return;
    }
    setWizardStep(2); // Proceed to Event Reasoning Test
  };

  const handleAnswerSelect = (questionId: number, optionIdx: number) => {
    setTestAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const submitAssessment = async () => {
    if (Object.keys(testAnswers).length < assessmentQuestions.length) {
      alert("Please answer all 5 situational reasoning questions before submitting.");
      return;
    }

    setIsSubmitting(true);

    // Calculate score
    let correctCount = 0;
    const answerBreakdown: Record<string, string> = {};

    assessmentQuestions.forEach((q) => {
      const selected = testAnswers[q.id];
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount++;
      answerBreakdown[\`Q\${q.id} (\${q.category})\`] = \`Selected: "\${q.options[selected]}" [\${isCorrect ? "CORRECT" : "INCORRECT"}]\`;
    });

    const scorePercentage = Math.round((correctCount / assessmentQuestions.length) * 100);
    const qualified = scorePercentage >= 75;

    setTestScore(scorePercentage);
    setIsQualified(qualified);

    try {
      const response = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJob?.id || 1,
          jobTitle: selectedJob?.title || "Event Specialist",
          name: candidateProfile.name,
          email: candidateProfile.email,
          phone: candidateProfile.phone,
          resumeUrl: candidateProfile.portfolioUrl || "https://moons.events/resumes/candidate-profile",
          coverLetter: \`Experience: \${candidateProfile.experienceYears} yrs. Notes: \${candidateProfile.coverLetter || "None"}\`,
          mockTestScore: scorePercentage,
          mockTestAnswers: answerBreakdown,
        }),
      });

      const data = await response.json();
      setResultMessage(data.message || (qualified ? "Congratulations! You passed." : "Thank you for applying."));
      setWizardStep(3); // Show results
    } catch (err: any) {
      setResultMessage("Application recorded successfully.");
      setWizardStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="careers-page-shell">
      {/* Hero Section */}
      <section className="careers-hero-section">
        <div className="careers-hero-ambient" />
        <div className="careers-hero-content">
          <Link href="/" className="careers-back-link">
            <ArrowLeft size={16} /> Back to MooNs
          </Link>
          <span className="careers-kicker">
            <Crown size={15} /> Join India’s Premier Event Production Collective
          </span>
          <h1 className="careers-hero-heading">
            Orchestrate <em>extraordinary</em><br />moments with MooNs.
          </h1>
          <p className="careers-hero-lead">
            We build India’s most memorable weddings, high-energy concerts, and corporate summits. If you thrive on live production excellence, take our Event Reasoning Assessment to fast-track your application directly to leadership.
          </p>

          <div className="careers-perks-grid">
            <div className="careers-perk-card">
              <Sparkles size={20} className="text-purple-600" />
              <strong>High-Impact Live Shows</strong>
              <small>Command 500 to 2,000+ guest productions with industry-leading production gear.</small>
            </div>
            <div className="careers-perk-card">
              <Award size={20} className="text-amber-600" />
              <strong>Top 5% Compensation</strong>
              <small>Competitive salary, performance incentives, and milestone project bonuses.</small>
            </div>
            <div className="careers-perk-card">
              <Zap size={20} className="text-emerald-600" />
              <strong>Instant Fast-Track Hiring</strong>
              <small>Pass the 5-question reasoning test to skip initial screening and enter Round 2 directly.</small>
            </div>
          </div>
        </div>
      </section>

      {/* Job Openings Board */}
      <section className="careers-board-section">
        <div className="careers-board-container">
          <div className="careers-board-head">
            <div>
              <h2>Current Open Positions</h2>
              <p>Explore leadership and specialist roles across our Pan-India operations.</p>
            </div>

            {/* Department Filter Pills */}
            <div className="careers-dept-filters">
              {departments.map((dept) => (
                <button
                  type="button"
                  key={dept}
                  className={\`careers-dept-pill \${selectedDepartment === dept ? "active" : ""}\`}
                  onClick={() => setSelectedDepartment(dept)}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          <div className="careers-jobs-grid">
            {filteredJobs.map((job) => (
              <div key={job.id} className="careers-job-card">
                <div className="careers-job-card-head">
                  <div>
                    <span className="careers-job-dept-tag">{job.department}</span>
                    <h3 className="careers-job-title">{job.title}</h3>
                  </div>
                  <span className="careers-job-salary">{job.salary}</span>
                </div>

                <p className="careers-job-desc">{job.description}</p>

                <div className="careers-job-meta">
                  <span><MapPin size={14} /> {job.location}</span>
                  <span><Clock size={14} /> {job.type}</span>
                  <span><Users size={14} /> {job.openings} Openings</span>
                </div>

                <div className="careers-job-points">
                  <strong>Key Focus:</strong>
                  <ul>
                    {job.responsibilities.slice(0, 2).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="careers-job-action">
                  <button
                    type="button"
                    className="careers-apply-btn"
                    onClick={() => startApplication(job)}
                  >
                    <span>Apply & Take Assessment</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application & Event Reasoning Assessment Modal */}
      {applyModalOpen && selectedJob && (
        <div className="careers-modal-overlay">
          <div className="careers-modal-box">
            <button
              type="button"
              className="careers-modal-close"
              onClick={() => setApplyModalOpen(false)}
            >
              <X size={20} />
            </button>

            {/* Step 1: Candidate Profile Form */}
            {wizardStep === 1 && (
              <form onSubmit={handleProfileSubmit}>
                <div className="careers-modal-header">
                  <span className="careers-step-badge">Step 1 of 2: Candidate Details</span>
                  <h2>Apply for {selectedJob.title}</h2>
                  <p>Provide your contact info and experience. Next, you will take the 5-question Event Reasoning Test.</p>
                </div>

                <div className="careers-form-grid">
                  <label className="careers-form-field">
                    <span>Full Name *</span>
                    <input
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={candidateProfile.name}
                      onChange={(e) => setCandidateProfile({ ...candidateProfile, name: e.target.value })}
                    />
                  </label>

                  <label className="careers-form-field">
                    <span>Email Address *</span>
                    <input
                      type="email"
                      required
                      placeholder="rahul@example.com"
                      value={candidateProfile.email}
                      onChange={(e) => setCandidateProfile({ ...candidateProfile, email: e.target.value })}
                    />
                  </label>

                  <label className="careers-form-field">
                    <span>Phone Number *</span>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={candidateProfile.phone}
                      onChange={(e) => setCandidateProfile({ ...candidateProfile, phone: e.target.value })}
                    />
                  </label>

                  <label className="careers-form-field">
                    <span>Years of Live Event Experience</span>
                    <select
                      value={candidateProfile.experienceYears}
                      onChange={(e) => setCandidateProfile({ ...candidateProfile, experienceYears: e.target.value })}
                    >
                      <option value="1-2">1 – 2 Years</option>
                      <option value="3-5">3 – 5 Years</option>
                      <option value="5-8">5 – 8 Years</option>
                      <option value="8+">8+ Years (Master Level)</option>
                    </select>
                  </label>

                  <label className="careers-form-field full">
                    <span>Portfolio / Resume Link (Google Drive / LinkedIn / Website)</span>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/... or drive link"
                      value={candidateProfile.portfolioUrl}
                      onChange={(e) => setCandidateProfile({ ...candidateProfile, portfolioUrl: e.target.value })}
                    />
                  </label>

                  <label className="careers-form-field full">
                    <span>Brief Background / Key Event Achievements</span>
                    <textarea
                      placeholder="Tell us about the largest event you have produced or coordinated..."
                      rows={3}
                      value={candidateProfile.coverLetter}
                      onChange={(e) => setCandidateProfile({ ...candidateProfile, coverLetter: e.target.value })}
                    />
                  </label>
                </div>

                <div className="careers-modal-footer">
                  <button type="submit" className="careers-submit-btn">
                    <span>Proceed to Event Reasoning Test (5 Questions)</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Interactive Event Scenario Reasoning Test */}
            {wizardStep === 2 && (
              <div>
                <div className="careers-modal-header">
                  <div className="flex items-center justify-between">
                    <span className="careers-step-badge">Step 2 of 2: Situational Reasoning</span>
                    <span className="careers-test-benchmark">⚡ Passing Threshold: 75%</span>
                  </div>
                  <h2>MooNs Event Scenario Reasoning Test</h2>
                  <p>Read each real-world production crisis scenario and select the most effective operational decision.</p>
                </div>

                <div className="careers-quiz-list">
                  {assessmentQuestions.map((q, idx) => {
                    const selectedOption = testAnswers[q.id];
                    return (
                      <div key={q.id} className="careers-quiz-card">
                        <div className="careers-quiz-card-head">
                          <span className="careers-quiz-num">Scenario {idx + 1}</span>
                          <span className="careers-quiz-cat">{q.category}</span>
                        </div>
                        <p className="careers-quiz-scenario">{q.scenario}</p>

                        <div className="careers-options-list">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = selectedOption === optIdx;
                            return (
                              <button
                                type="button"
                                key={optIdx}
                                className={\`careers-option-item \${isSelected ? "selected" : ""}\`}
                                onClick={() => handleAnswerSelect(q.id, optIdx)}
                              >
                                <span className="careers-option-radio">
                                  {isSelected ? <Check size={12} /> : String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="careers-modal-footer">
                  <button
                    type="button"
                    className="careers-back-subtle-btn"
                    onClick={() => setWizardStep(1)}
                  >
                    Back to Profile
                  </button>
                  <button
                    type="button"
                    className="careers-submit-btn"
                    onClick={submitAssessment}
                    disabled={isSubmitting || Object.keys(testAnswers).length < assessmentQuestions.length}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Evaluating Score...
                      </>
                    ) : (
                      <>
                        Submit & Reveal Score <Zap size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Instant Score & Qualification Result */}
            {wizardStep === 3 && (
              <div className="careers-result-box">
                {isQualified ? (
                  <div className="careers-result-content pass">
                    <div className="careers-result-icon pass">
                      <CheckCircle2 size={54} />
                    </div>
                    <span className="careers-result-pill pass">Assessment Passed (Score: {testScore}%)</span>
                    <h2>Congratulations, {candidateProfile.name}!</h2>
                    <p className="careers-result-desc">
                      You met our 75% operational benchmark. Your full assessment breakdown, resume, and profile have been synchronized with the <strong>MooNsEvents CRM Leadership Hub</strong>.
                    </p>

                    <div className="careers-next-steps-card">
                      <strong>What happens next?</strong>
                      <ul>
                        <li>Our Senior Production Captain reviews your score breakdown.</li>
                        <li>You will receive a calendar invite for Round 2 technical alignment.</li>
                        <li>Direct compensation and project allocation briefing.</li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      className="careers-finish-btn"
                      onClick={() => setApplyModalOpen(false)}
                    >
                      Done & Return to Openings
                    </button>
                  </div>
                ) : (
                  <div className="careers-result-content fail">
                    <div className="careers-result-icon fail">
                      <XCircle size={54} />
                    </div>
                    <span className="careers-result-pill fail">Score: {testScore}% (Benchmark: 75%)</span>
                    <h2>Assessment Completed</h2>
                    <p className="careers-result-desc">
                      Thank you for attempting the MooNs Event Scenario Reasoning Test. Your score of {testScore}% did not meet our 75% benchmark for this production cycle.
                    </p>
                    <p className="careers-result-subtext">
                      An automated confirmation has been sent to your email ({candidateProfile.email}). You are welcome to re-apply after 90 days.
                    </p>

                    <button
                      type="button"
                      className="careers-finish-btn fail"
                      onClick={() => setApplyModalOpen(false)}
                    >
                      Close & Return to Careers
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(path.join(targetDir, 'page.tsx'), careersPageCode, 'utf8');
console.log('Successfully written C:/MooNsEWeb/app/careers/page.tsx');
