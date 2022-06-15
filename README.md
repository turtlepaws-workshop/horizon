# Horizon - A TS-built, open-source, multipurpose Discord bot.

Thanks for checking out Horizon's Github!

<details open>
  <summary>Table of Contents</summary>
  
  - [Emoji Guilds](#emoji-guilds)
  - [Invite Link](#invite-link)
  - [Support Server](#support-server)
  - [Self Hosting](#self-hosting)
    - [Requirements](#setup-to-do-list)
    - [Checklist](#steps)
    - [Config](#config)

</details>

## Emoji guilds
You can join these emoji guilds if you want to use the emojis from Horizon. You can DM me (Turtlepaw#3806) to get your self-hosted (or other) bot added.

- [Turtlepaw's Emoji Vault v1](https://discord.gg/7evbFRBHjz)
- [Turtlepaw's Emoji Vault v2](https://discord.gg/ksNFnpqRNW)
- [Horizon Emojis (Fluent)](https://discord.gg/sfAfn6kfkT)
- [Horizon Emojis 2 (Fluent)](https://discord.gg/9hjjHcnZA7)

## Invite Link
[
   <img src="images/ADD_TO_SERVER.svg" style="width: 300px;">
](https://horizon.trtle.xyz/add)

## Support Server
You can join my hub for all my bots [here](https://discord.gg/9N8BkWzuBK). For the original bot or support on an error in the code.

![Image](https://invidget.switchblade.xyz/834199640702320650)

## Self-hosting
We support self-hosting the bot. Here's a quick to-do list before setting up your bot!

### Prerequisites
Software | Version | Homepage
--- | --- | ---
Node | v16.6.0 | [nodejs.org](https://nodejs.org)
Discord.js | v13 (soon v14) | [discord.js.org](https://discord.js.org)

### Installation
Step | Description | Command/Code
--- | --- | ---
1 | Clone the repo | `git clone https://github.com/turtlepaws-workshop/horizon.git`
2 | Install typescript | `yarn add -g typescript`
3 | Install all modules | `yarn`
4 | Create a file called `secrets.json` in `src/config` (full URL: `./src/config/secrets.json`) and edit it | [Example](https://github.com/turtlepaws-workshop/horizon/blob/main/src/config/secrets.example.json)
5 | Optionally, you can edit the [config.js file](https://github.com/turtlepaws-workshop/horizon/blob/main/src/config/config.js)
6 | Run the code ✨ | `npm run buildAndRun` or in vscode <kbd>F5</kbd> -> <kbd>Run Dist & TS</kbd>

### Config
You can edit the config values in [`secrets.example.json`](https://github.com/turtlepaws-workshop/horizon/blob/main/src/config/secrets.example.json)
Key | Value | From | Required
--- | --- | --- | ---
`token` | Your bot's token | You can get this from [Discord's Developer Portal](https://discord.com/developers/applications) | true
`clientId` | Your bot's clientId | You can get this from [Discord's Developer Portal](https://discord.com/developers/applications) | true
`API_TOKEN` | Your API token for the [dashboard](https://github.com/turtlepaw/horizon-dashboard) | You can generate one from [passwordsgenerator.net](https://passwordsgenerator.net/) | If you have the dashboard enabled

> **Note**

> There are also [optional](https://github.com/turtlepaws-workshop/horizon/blob/main/src/config/config.ts) config settings for your bot.
