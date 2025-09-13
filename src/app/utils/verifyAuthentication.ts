import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export interface tokenInterface {
    id: number;
    email: string;
    role: string;
}

export async function verifyAuthentication(token: string | null): Promise<tokenInterface | NextResponse>{

    try{

        if(!token){
            return NextResponse.json(
                {
                    message: "Unauthorized"
                }
                ,
                {
                    status: 401
                }
           
            )
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as tokenInterface;

        return decodedToken;

    } catch (error) {
        console.log("Jwt Verification Fail", error);
        return NextResponse.json(
            {
                message: "Unauthorized"
            }
            ,
            {
                status: 401
            }
        )
    }
}