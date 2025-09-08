// /app/api/internal/subjects/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma"; // Adjust if needed

// ✅ GET single subject
export async function GET(req, { params }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const subject = await prisma.subjects.findUnique({ where: { id } });
    if (!subject) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    return NextResponse.json(subject);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// ✅ PUT update subject
export async function PUT(req, { params }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const body = await req.json();
    const updatedSubject = await prisma.subjects.update({
      where: { id },
      data: {
        name: body.name,
        icon: body.icon,
      },
    });
    return NextResponse.json(updatedSubject);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// ✅ DELETE subject
export async function DELETE(req, { params }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    await prisma.subjects.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}