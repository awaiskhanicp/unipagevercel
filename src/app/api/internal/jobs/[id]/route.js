import { prisma } from "../../../../../lib/prisma";

export async function GET(request, context) {
  const params = await context.params;
  const jobId = parseInt(params.id);
  const job = await prisma.job_opprtunities.findUnique({ where: { id: jobId } });
  if (!job) {
    return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404 });
  }
  return new Response(JSON.stringify(job), { status: 200 });
}

export async function DELETE(request, context) {
  const params = await context.params;
  const jobId = parseInt(params.id);
  await prisma.job_opprtunities.delete({ where: { id: jobId } });
  return new Response(JSON.stringify({ message: 'Deleted successfully' }), { status: 200 });
}

export async function PUT(request, context) {
  const params = await context.params;
  const jobId = parseInt(params.id);
  const body = await request.json();

  // Normalize incoming fields
  let {
    title,
    job_type,
    city,
    province,
    country,
    site_based,
    skills,
    experience,
    requirements,
    responsibilities,
    description,
    post_status,
    active,
  } = body || {};

  // Normalize post_status to integer (DB expects Int)
  const normalizePostStatus = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'boolean') return val ? 1 : 0;
    if (typeof val === 'string') {
      const v = val.toLowerCase();
      if (v === '1' || v === 'active' || v === 'open' || v === 'true') return 1;
      if (v === '0' || v === 'closed' || v === 'inactive' || v === 'false') return 0;
      const parsed = parseInt(val, 10);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return undefined;
  };
  if (post_status === undefined && typeof active === 'boolean') {
    post_status = normalizePostStatus(active);
  } else if (post_status !== undefined) {
    post_status = normalizePostStatus(post_status);
  }

  // Coerce site_based to boolean if sent as string
  if (typeof site_based === 'string') {
    site_based = site_based.toLowerCase() === 'true';
  }

  // Ensure skills is stored as comma-separated string
  if (Array.isArray(skills)) {
    skills = skills.join(',');
  }

  const data = {};
  if (title !== undefined) data.title = title;
  if (job_type !== undefined) data.job_type = job_type;
  if (city !== undefined) data.city = city;
  if (province !== undefined) data.province = province;
  if (country !== undefined) data.country = country;
  if (site_based !== undefined) data.site_based = !!site_based ? 'true' : 'false';
  if (skills !== undefined) data.skills = typeof skills === 'string' ? skills : '';
  if (experience !== undefined) data.experience = experience;
  if (requirements !== undefined) data.requirements = requirements;
  if (responsibilities !== undefined) data.responsibilities = responsibilities;
  if (description !== undefined) data.description = description;
  if (post_status !== undefined) data.post_status = post_status;

  const updated = await prisma.job_opprtunities.update({
    where: { id: jobId },
    data,
  });
  return new Response(JSON.stringify(updated), { status: 200 });
}