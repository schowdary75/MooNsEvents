import fs from 'node:fs';
import path from 'node:path';

const targetDir = 'C:/MooNsEWeb/app/api/careers/apply';
fs.mkdirSync(targetDir, { recursive: true });

const routeCode = `import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
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
      return NextResponse.json(
        { error: "Name, email, and phone are required." },
        { status: 400 }
      );
    }

    const crmUrl = process.env.CRM_INTERNAL_API_URL || "http://localhost:8080";
    let crmResult = null;

    try {
      const crmResponse = await fetch(\`\${crmUrl}/api/public/careers/apply\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: jobId || 1,
          jobTitle: jobTitle || "Event Specialist",
          name,
          email,
          phone,
          resumeUrl,
          coverLetter,
          mockTestScore,
          mockTestAnswers,
        }),
      });
      if (crmResponse.ok) {
        crmResult = await crmResponse.json();
      }
    } catch (crmErr) {
      console.warn("[Careers Apply API] CRM forward fallback:", crmErr);
    }

    const score = typeof mockTestScore === "number" ? mockTestScore : 0;
    const isQualified = score >= 75;

    return NextResponse.json({
      success: true,
      qualified: isQualified,
      score,
      status: isQualified ? "shortlisted" : "rejected",
      message: isQualified
        ? "Congratulations! You passed the MooNs Event Scenario Reasoning Test. Your application is shortlisted for Round 2."
        : "Thank you for your application. Unfortunately, your test score did not meet the 75% benchmark for this cycle.",
      crmResult,
    });
  } catch (err: any) {
    console.error("[Careers Apply API] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process application." },
      { status: 500 }
    );
  }
}
`;

fs.writeFileSync(path.join(targetDir, 'route.ts'), routeCode, 'utf8');
console.log('Successfully written C:/MooNsEWeb/app/api/careers/apply/route.ts');
