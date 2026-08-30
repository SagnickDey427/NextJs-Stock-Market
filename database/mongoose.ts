import mongoose from "mongoose";
import { CacheHandler } from "next/dist/server/lib/incremental-cache";


const MONGO_URI = process.env.MONGO_URI;

declare global {
    var mongooseCache:{
        conn:typeof mongoose | null,
        promise : Promise<typeof mongoose> | null
    }
}

let cached = global.mongooseCache;

if(!cached){
    cached = global.mongooseCache = {conn:null, promise:null};
}

export const connecDb = async ()=>{
    if(!MONGO_URI) throw new Error("MONGO_URI must be set");
    if(!cached.conn) return cached.conn;
    if(!cached.promise){
        cached.promise = mongoose.connect(MONGO_URI,{bufferCommands:false});
    }

    try{
        cached.conn = await cached.promise;
    } catch(er){
        cached.promise = null;
        throw er;
    }

    console.log(`Connected to databse ${process.env.NODE_ENV} - ${MONGO_URI}`)
    return cached.conn;
}