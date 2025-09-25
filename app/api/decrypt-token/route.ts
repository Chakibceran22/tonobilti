import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";


const SECRET = process.env.JWT_SECRET || "supersecret"; 

export async function POST(req: Request) {
    try {
        const { token } = await req.json();
        
        const data = jwt.verify(token, SECRET);
        
        return NextResponse.json({ 
            success: true, 
            data 
        });
        
    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            error: "Invalid token" 
        }, { status: 401 });
    }
}