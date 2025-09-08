import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

// PUT - Update web event
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    
    const { type, action_button, page_hit_name, whatsapp_button_text } = body;

    if (!type || !action_button || !page_hit_name || !whatsapp_button_text) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const updatedEvent = await prisma.web_events.update({
      where: { id: parseInt(id) },
      data: {
        type,
        action_button,
        page_hit_name,
        whatsapp_button_text,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: "Web event updated successfully",
    });
  } catch (error) {
    console.error("Error updating web event:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update web event" },
      { status: 500 }
    );
  }
}

// DELETE - Delete web event
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    await prisma.web_events.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Web event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting web event:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete web event" },
      { status: 500 }
    );
  }
}