import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

// GET - Fetch all countries
export async function GET() {
  try {
    const countries = await prisma.countries.findMany({
      orderBy: { created_at: 'desc' }
    });
    
    return NextResponse.json(countries);
  } catch (err) {
    console.error("❌ GET API Error:", err);
    return NextResponse.json({ error: "Failed to fetch countries" }, { status: 500 });
  }
}

// POST - Create new country
export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📥 Received data:", body);
    
    const {
      name, // Frontend sends 'name' but DB expects 'country'
      code,
      currency,
      consultationFee,
      consultationDiscountFee,
      featureImage,
    } = body;

    // Validate required fields
    if (!name || !code || !currency) {
      console.log("❌ Missing required fields:", { name, code, currency });
      return NextResponse.json({ 
        error: "Country name, code, and currency are required" 
      }, { status: 400 });
    }

    // Handle image data - store the uploaded image URL
    let imageData = null;
    if (featureImage) {
      // If it's a URL (from upload), store it
      if (featureImage.startsWith('/uploads/')) {
        imageData = featureImage;
        console.log("✅ Image URL stored:", imageData);
      } else if (featureImage.startsWith('data:image')) {
        // For backward compatibility with base64 (not recommended)
        const base64Size = Math.ceil((featureImage.length * 3) / 4);
        const maxSize = 500 * 1024; // 500KB limit
        
        if (base64Size > maxSize) {
          console.log("⚠️ Base64 image too large:", base64Size, "bytes");
          return NextResponse.json({ 
            error: "Image is too large. Please use the file upload instead." 
          }, { status: 400 });
        }
        
        imageData = featureImage;
        console.log("⚠️ Using base64 image (not recommended):", base64Size, "bytes");
      } else {
        // If it's a URL, store it
        imageData = featureImage;
      }
    }

    const countryData = {
      country: name.trim(),
      code: code.toUpperCase().trim(),
      currency: currency.trim(),
      consultation_fee: parseFloat(consultationFee || 0),
      consultation_fee_discount: parseFloat(consultationDiscountFee || 0),
      image: imageData,
      selected: false,
    };

    console.log("📝 Creating country with data:", {
      ...countryData,
      image: imageData ? "Image provided" : "No image"
    });

    const newCountry = await prisma.countries.create({
      data: countryData,
    });

    console.log("✅ Country created successfully:", newCountry);
    return NextResponse.json(newCountry, { status: 201 });
  } catch (err) {
    console.error("❌ POST API Error:", err);
    console.error("❌ Error details:", {
      code: err.code,
      message: err.message,
      meta: err.meta
    });
    
    // Handle specific Prisma errors
    if (err.code === 'P2002') {
      return NextResponse.json({ 
        error: "Country code already exists" 
      }, { status: 409 });
    }
    
    if (err.code === 'P2003') {
      return NextResponse.json({ 
        error: "Invalid data provided" 
      }, { status: 400 });
    }

    if (err.code === 'P1017') {
      return NextResponse.json({ 
        error: "Image data too large. Please use a smaller image or upload to cloud storage." 
      }, { status: 400 });
    }

    if (err.code === 'P2022') {
      return NextResponse.json({ 
        error: "Database schema mismatch. Please run 'npx prisma generate' and restart the server." 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      error: "Failed to create country. Please check your data and try again." 
    }, { status: 500 });
  }
}

// DELETE - Delete country by ID
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "Country ID is required" }, { status: 400 });
    }

    await prisma.countries.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Country deleted successfully" });
  } catch (err) {
    console.error("❌ DELETE API Error:", err);
    
    if (err.code === 'P2025') {
      return NextResponse.json({ 
        error: "Country not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      error: "Failed to delete country" 
    }, { status: 500 });
  }
}