import { connect, connection } from "mongoose";
import { mongoDB } from "./config/secrets.json";

export default async function initDB() {
    //@ts-ignore
    connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

    connection.on('connecting', () => {
        console.log("[MONGOOSE] Logging in!")
    });

    connection.on('connected', () => {
        console.log("[MONGOOSE] Logged in!")
    });

    connection.on('disconnecting', () => {
        console.log("[MONGOOSE] Logging out")
    });

    connection.on('disconnected', () => {
        console.log("[MONGOOSE] Logged out")
    });

    connection.on('error', error => {
        console.log(`[MONGOOSE] ${error}`)
    });
}