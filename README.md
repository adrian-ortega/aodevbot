# 🤖 aodevbot

## Intent
Create a Node JS server that acts as a bot, which listens to Twitch and other services. This bot HAS to interact with Twitch chat and log every message, every stream session, (some) events, and chatters.

## TODO
1. Choose Schema/Database
2. Express Server/REST API
  - Models
    - CRUD for each
3. WebSocket Server
  - Interaction with Chat (use tmi.js)
  - Push notifications for overlay
4. Overlay/Browser Source
  - Events (Subs, Re-Subs, Follow, Raid)
