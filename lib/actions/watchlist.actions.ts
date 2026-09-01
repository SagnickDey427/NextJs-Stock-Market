'use server';

import { connectDb } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";

export const getWatchlistSymbolsByEmail = async (email: string): Promise<string[]> => {
    try {
        const mongoose = await connectDb();
        const db = mongoose.connection.db;
        if (!db) throw new Error("Can't connect to db");

        const user = await db.collection('user').findOne({ email });
        if (!user) return [];

        const userId = user.id || user._id?.toString();
        if (!userId) return [];

        const watchlist = await Watchlist.find({ userId }).select('symbol').lean();
        return watchlist.map(item => item.symbol);
    } catch (e) {
        console.error("Error in getWatchlistSymbolsByEmail:", e);
        return [];
    }
}

