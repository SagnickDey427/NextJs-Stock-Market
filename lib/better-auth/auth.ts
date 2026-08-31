import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectDb } from "@/database/mongoose";
import { nextCookies } from "better-auth/next-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createAuthInstance = (db: any) => betterAuth({
    database: mongodbAdapter(db),
    secret: process.env.BETTER_AUTH_SECRET as string, 
    baseURL: process.env.BETTER_AUTH_URL as string,
    emailAndPassword: {
        enabled: true,
        disableSignUp: false,
        requireEmailVerification: false,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: true
    },
    plugins: [nextCookies()]
});

let authInstance : ReturnType<typeof createAuthInstance> | null = null;
export const getAuth = async ()=>{
    if(authInstance) return authInstance;

    const mongoose = await connectDb();
    const db = mongoose?.connection.db;
    if(!db) throw new Error("MongoDB connection not found.");

    authInstance = createAuthInstance(db);
    return authInstance;

}

export const auth = await getAuth();