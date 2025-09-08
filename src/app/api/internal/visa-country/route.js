import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import slugify from 'slugify';

export async function POST(req) {
  try {
    const data = await req.json();

    // Validate required fields including continent
    if (!data.countryName || !data.currency || !data.amount ||
        !data.description || !data.countryImageUrl || !data.bannerImageUrl || !data.continent) {
      return NextResponse.json(
        { success: false, message: 'All fields including continent are required' },
        { status: 400 }
      );
    }

    const slug = slugify(data.countryName, { lower: true, strict: true });

          const countryData = {
        country_name: data.countryName,
        slug,
        currency: data.currency,
        price: data.amount.toString(),
        discount_price: data.discount.toString(), // Save discount percentage directly
        description: data.description,
        country_image: data.countryImageUrl,
        banner_image: data.bannerImageUrl,
        continent: data.continent, // Add continent to the data
      };

    const visaCountry = await prisma.visa_countries.create({
      data: countryData,
    });

    return NextResponse.json({
      success: true,
      data: visaCountry
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating visa country:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const data = await req.json();

    // Validate required fields including continent
    if (!data.id || !data.countryName || !data.currency || !data.amount ||
        !data.description || !data.countryImageUrl || !data.bannerImageUrl || !data.continent) {
      return NextResponse.json(
        { success: false, message: 'All fields including continent are required' },
        { status: 400 }
      );
    }

    const slug = slugify(data.countryName, { lower: true, strict: true });

    const updateData = {
      country_name: data.countryName,
      slug,
      currency: data.currency,
      price: data.amount.toString(),
      discount_price: data.discount.toString(), // Save discount percentage directly
      description: data.description,
      country_image: data.countryImageUrl,
      banner_image: data.bannerImageUrl,
      continent: data.continent, // Add continent to update data
      updated_at: new Date(),
    };

    const visaCountry = await prisma.visa_countries.update({
      where: { id: parseInt(data.id) },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: visaCountry
    });

  } catch (error) {
    console.error('Error updating visa country:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const continent = searchParams.get('continent') || '';
    const getContinents = searchParams.get('getContinents') === 'true';

    // If requesting continents only
    if (getContinents) {
      const continents = await prisma.visa_countries.findMany({
        select: {
          continent: true
        },
        distinct: ['continent']
      });
      
      const uniqueContinents = continents
        .map(c => c.continent)
        .filter(Boolean)
        .sort();
      
      return NextResponse.json({
        success: true,
        data: ['all', ...uniqueContinents]
      });
    }

    // Build where clause
    let where = {};
    
    if (search) {
      where.OR = [
        { country_name: { contains: search } },
        { description: { contains: search } }
      ];
    }
    
    // Add continent filter if provided
    if (continent && continent !== 'all') {
      where.continent = continent;
    }

    // Get visa countries with pagination and filtering
    const visaCountries = await prisma.visa_countries.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        created_at: 'desc'
      },
    });

    // Get total count for pagination
    const total = await prisma.visa_countries.count({ where });

    return NextResponse.json({
      success: true,
      data: visaCountries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching visa countries:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch visa countries' },
      { status: 500 }
    );
  }
}