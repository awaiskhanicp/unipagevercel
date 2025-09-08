import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const jobs = await prisma.job_opprtunities.findMany({
    orderBy: { created_at: "desc" },
  });
  return Response.json(jobs);
}

export async function POST(request) {
  try {
    const body = await request.json();
    let {
      title, job_type, city, province, country,
      site_based, skills, experience,
      requirements, responsibilities, description,
    } = body;

    // Parse skills if it's a stringified array
    if (typeof skills === "string") {
      try {
        skills = JSON.parse(skills);
      } catch {
        skills = skills.split(",").map((s) => s.trim());
      }
    }

    const job = await prisma.job_opprtunities.create({
      data: {
        title,
        job_type,
        city,
        province,
        country,
        site_based: site_based || false,
        skills: Array.isArray(skills) ? skills.join(",") : "",
        experience,
        requirements,
        responsibilities,
        description,
        mail_status: "pending",
        post_status: "active",
      },
    });
    return Response.json(job, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create job" }, { status: 500 });
  }
}