import { prisma } from "../../../../../lib/prisma";

export async function GET(request, context) {
  const jobId = parseInt(context.params.id);
  const job = await prisma.job_opprtunities.findUnique({ where: { id: jobId } });
  if (!job) {
    return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404 });
  }
  return new Response(JSON.stringify(job), { status: 200 });
}

export async function DELETE(request, context) {
  const jobId = parseInt(context.params.id);
  await prisma.job_opprtunities.delete({ where: { id: jobId } });
  return new Response(JSON.stringify({ message: 'Deleted successfully' }), { status: 200 });
}

export async function PUT(request, context) {
  const jobId = parseInt(context.params.id);
  const { post_status } = await request.json();
  const updated = await prisma.job_opprtunities.update({
    where: { id: jobId },
    data: { post_status },
  });
  return new Response(JSON.stringify(updated), { status: 200 });
}