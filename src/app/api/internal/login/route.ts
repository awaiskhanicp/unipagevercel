import pool from '../../../../lib/db/db';
import { NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import { loginSchema as Schema } from '../../../../validations/LoginValidation';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';


// POST create new consultation
export async function POST(req) {
  try {
    const body = await req.json();

    const parsed = Schema.parse(body);

    const { email, password } = parsed;

    const [ checkEmail ] = await pool.query<RowDataPacket[]>("SELECT * FROM users WHERE email = ? LIMIT 1", [email])
    
    if(checkEmail.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid Credentials' },
        { status: 409 }
      );
    }

    const validPassword = await bcrypt.compare(password, checkEmail[0].password);
    if(validPassword)
    {
        const token = jwt.sign(
            {
                id: checkEmail[0].id,
                email: checkEmail[0].email,
                role: checkEmail[0].user_type
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "1d"
            }
        );

        const response =  NextResponse.json(
            {
                message: "Login Successfully",
                role: checkEmail[0].user_type
            },
            {
                status: 200
            }
        )

        response.cookies.set('university-token', token, {httpOnly: true})

        return response;
    }
    else{
        return NextResponse.json(
            {
                message: "Invalid Credentials",
                
            }
            ,
            {
                status: 400
            }
        );
    }

  } catch (err: any) {
    if (err?.issues) {
      // ZodError
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of err.issues) {
        const key = (issue.path?.[0] as string) ?? '_';
        fieldErrors[key] = fieldErrors[key] || [];
        fieldErrors[key].push(issue.message);
      }
      return NextResponse.json(
        { ok: false, message: fieldErrors },
        { status: 400 }
      );
    }

    console.error("freeconsulation POST error:", err);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}