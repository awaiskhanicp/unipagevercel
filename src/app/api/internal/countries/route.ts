
import { prisma } from "../../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import pool from '../../../../lib/db/db';
import { RowDataPacket } from "mysql2";

// GET - Fetch countries with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const search = searchParams.get('search') || '';
    
    console.log('🔍 Countries API called with params:', { page, limit, search });
    
    // Validate parameters
    if (page < 1) {
      return NextResponse.json({ 
        success: false, 
        error: "Page number must be greater than 0" 
      }, { status: 400 });
    }
    
    if (limit < 1 || limit > 100) {
      return NextResponse.json({ 
        success: false, 
        error: "Limit must be between 1 and 100" 
      }, { status: 400 });
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build WHERE clause for search
    let whereClause = '';
    const queryParams: any[] = [];
    if (search) {
      // Convert search to lowercase for case-insensitive search
      const searchLower = search.toLowerCase();
      whereClause = `WHERE LOWER(country) LIKE ? OR LOWER(code) LIKE ? OR LOWER(currency) LIKE ?`;
      queryParams.push(`%${searchLower}%`, `%${searchLower}%`, `%${searchLower}%`);
      console.log('🔍 Search WHERE clause:', whereClause);
    } else {
      whereClause = 'WHERE 1';  // Default condition if no search term
    }
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) AS totalCount FROM countries ${whereClause}`;
    const [countRows] = await pool.query(countQuery, queryParams);
    const totalCount = countRows[0].totalCount;
    console.log('🔍 Total count result:', totalCount);
    
    // Get paginated data
    const countriesQuery = `
      SELECT id, code, country, selected, image, currency, consultation_fee, consultation_fee_discount, created_at, updated
      FROM countries ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    queryParams.push(limit, skip);
    
    console.log('🔍 Executing countries query with:', { skip, take: limit, whereClause });
    const [countriesRows] = await pool.query<RowDataPacket[]>(countriesQuery, queryParams);
    console.log('🔍 Found countries:', countriesRows.length);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    
    const response = { 
      success: true,
      data: countriesRows,
      meta: {
        totalItems: totalCount,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
    
    console.log('🔍 Returning response with:', { 
      success: response.success, 
      dataCount: response.data.length, 
      meta: response.meta 
    });
    
    return NextResponse.json(response);
  } catch (err) {
    console.error("❌ GET API Error:", err);
    
    // Handle specific MySQL errors
    if (err.code === 'ECONNREFUSED') {
      return NextResponse.json({ 
        success: false,
        error: "Database connection failed",
        details: "Cannot connect to database server"
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch countries",
      details: err.message
    }, { status: 500 });
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

// PUT - Update country by ID
export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "Country ID is required" }, { status: 400 });
    }

    const body = await req.json();
    console.log("📥 Update request for country ID:", id, "with data:", body);
    
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

    const updateData = {
      country: name.trim(),
      code: code.toUpperCase().trim(),
      currency: currency.trim(),
      consultation_fee: parseFloat(consultationFee || 0),
      consultation_fee_discount: parseFloat(consultationDiscountFee || 0),
      image: imageData,
    };

    console.log("📝 Updating country with data:", {
      ...updateData,
      image: imageData ? "Image provided" : "No image"
    });

    // Check if country exists
    const existingCountry = await prisma.countries.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCountry) {
      return NextResponse.json({ 
        error: "Country not found" 
      }, { status: 404 });
    }

    // Update the country
    const updatedCountry = await prisma.countries.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    console.log("✅ Country updated successfully:", updatedCountry);
    return NextResponse.json(updatedCountry);
  } catch (err) {
    console.error("❌ PUT API Error:", err);
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

    if (err.code === 'P2025') {
      return NextResponse.json({ 
        error: "Country not found" 
      }, { status: 404 });
    }

    if (err.code === 'P1017') {
      return NextResponse.json({ 
        error: "Image data too large. Please use a smaller image or upload to cloud storage." 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: "Failed to update country. Please check your data and try again." 
    }, { status: 500 });
  }
}