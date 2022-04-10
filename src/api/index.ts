import { Client } from "discord.js";
import express from "express";

export async function initExpress(client: Client){
    const app = express();

    app.get("/guilds", async (req, res) => {
        res.json(await client.guilds.fetch());
    });

    app.get("/", async (req, res) => {
        res.json({
            message: "hello world!"
        });
    })

    app.listen(2000, () => console.log("API up on port 2000 (for local use: http://localhost:2000/)"));
}