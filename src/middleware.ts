import { NextResponse, NextRequest } from 'next/server'
import { JWTPayload, jwtVerify } from 'jose';

interface DecodedJwtPayload extends JWTPayload {
    role: string;
}
 

export async function middleware(request: NextRequest) {

    const token = request.cookies.get('university-token')?.value;

    // Skip token check for the /api/login route
    if (request.nextUrl.pathname.startsWith('/api/internal/login')) {
        return NextResponse.next();
    }

    if (request.nextUrl.pathname.startsWith('/api')) {
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const decoded = await jwtVerify<DecodedJwtPayload>(token, secret);
            const role = decoded.payload.role;

            if (role !== 'admin' && !request.nextUrl.pathname.startsWith('/admin')) {
                return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
            }

            return NextResponse.next();
        } catch (error) {
            console.log("Token Verification Failed", error);
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
    }

    if (!token) {
        return NextResponse.redirect(new URL('/student-login', request.url));
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const decoded = await jwtVerify<DecodedJwtPayload>(token, secret);

        const role = decoded.payload.role;
        const currentPath = request.nextUrl.pathname;

        if (role === 'admin' && !currentPath.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }

        return NextResponse.next();

    } catch (error) {
        console.log("Token Verification Failed", error);
        return NextResponse.redirect(new URL('/student-login', request.url));
    }
}

export const config = {
  matcher: ["/admin/:path*", '/api/:path*'],
}
