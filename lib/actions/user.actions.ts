'use server';

import { connectDb } from "@/database/mongoose";

export const getAllUsersForNewsMail = async ()=>{
    try{
        const mongoose = await connectDb();
        const db = mongoose.connection.db;
        if(!db) throw new Error("Can't find collection for nfetching users for news mail");
        const users = db.collection('user').find(
            {email : {$exists:true, $ne:null}},
            {projection:{_id:1, id:1, name:1, email:1}}
        ).toArray();

        return (await users).filter((user)=> user.email && user.name).map((user)=>({
            id:user.id || user._id?.toString() || '',
            name:user.name,
            email:user.email
        }));
    } catch(e){
        console.log(`Error fetching users for news mail : ${e}`);
        return [];
    }
}