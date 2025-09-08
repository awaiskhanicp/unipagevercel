import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const record = await prisma.contact_us_messages.findUnique({ where: { id: parseInt(id) } });
    if (!record) {
      return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
    }
    const now = new Date();
    const updateData = { ...body };
    // Track follow-up changes
    if (
      Object.prototype.hasOwnProperty.call(body, 'first_followup') &&
      (record.first_followup !== body.first_followup)
    ) {
      updateData.first_date = now;
    }
    if (
      Object.prototype.hasOwnProperty.call(body, 'second_followup') &&
      (record.second_followup !== body.second_followup)
    ) {
      updateData.second_date = now;
    }
    if (
      Object.prototype.hasOwnProperty.call(body, 'third_followup') &&
      (record.third_followup !== body.third_followup)
    ) {
      updateData.third_date = now;
    }
    if (
      Object.prototype.hasOwnProperty.call(body, 'assigned_employees') &&
      (record.assigned_employees !== body.assigned_employees)
    ) {
      updateData.assigned_date = now;
    }
    if (
      Object.prototype.hasOwnProperty.call(body, 'quality_status') &&
      (record.quality_status !== body.quality_status)
    ) {
      updateData.quality_date = now;
    }
    // Remove forbidden fields if present
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;
    const updated = await prisma.contact_us_messages.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/contactUs/[id] error:", error);
    return NextResponse.json({ success: false, message: "Update failed", error: { name: error.name, message: error.message } }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const record = await prisma.contact_us_messages.findUnique({ where: { id: parseInt(id) } });
    if (!record) {
      return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
    }
    await prisma.contact_us_messages.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("DELETE /api/contactUs/[id] error:", error);
    return NextResponse.json({ success: false, message: "Delete failed", error }, { status: 500 });
  }
} 