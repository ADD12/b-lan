<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# B-LAN Community Core v2.0
### Local-First // Mesh Sharded // Neighborhood Governance

</div>

## 🌐 Overview
B-LAN (Bottom-up Local Area Network) is a revolutionary offline-first community platform designed for self-governed neighborhood ecosystems. It transforms local hardware into a resilient, distributed mesh network that provides critical infrastructure services without reliance on centralized cloud providers or consistent WAN access.

## 🚀 Key Features
- **PIM (Personal Information Module)**: A localized identity shard storing your skills, bio, and social trust data.
- **Honey Do Economy**: A peer-to-peer job board where neighbors exchange skills for Karma tokens.
- **Immutable Karma Ledger**: A local sidechain for tracking community contributions with parent-hash verification.
- **Mesh Security Command**: Integrated security monitoring with "Privacy Mode" and Tesla-USB Sentry sharding.
- **Rye Neural Link**: A real-time voice assistant for community triage and skill routing.
- **iCore Decentralized Inference**: libp2p-based task distribution replacing the legacy Lemonade/REST model.
- **PWA / Offline First**: Optimized for local hosting with Service Workers for near-instant response times.

## 🏗 Architecture
Built on the **Fog-Over-DTN** protocol, B-LAN utilizes delay-tolerant networking to ensure data propagation across intermittent mesh links.
- **Frontend**: React + Tailwind CSS (Offline-optimized with Code Splitting)
- **Database**: Local SQL Cluster (LocalStorage PIM Simulation)
- **Intelligence**: Gemma 4 (Local Offline Core) + Gemini 3 Pro (Cloud Uplink)
- **P2P Networking**: libp2p (Gossipsub + Kademlia DHT)
- **Caching**: VitePWA for local asset persistence

## 🛠 Deployment & Local Hosting
B-LAN is designed for sideloading and local hosting on community servers.

### Fast Demo Build
To generate a lightweight build optimized for rapid demonstration:
```bash
npm run build:demo
```

### Local Hosting (Static)
The `dist/` folder contains a fully static version of the app. You can host this on any local server (Nginx, Apache, or even a simple Python server):
```bash
# Example using Python
cd dist
python3 -m http.server 8080
```
Once loaded, the **Service Worker** will cache the entire application (including the login screen), allowing it to work 100% offline and respond instantly on subsequent loads.

## 🛡 Privacy
- **100% Offline Logic**: Personal data never leaves the physical community mesh.
- **CCPA Compliant Sharding**: California Privacy standards enabled by default at the kernel level.
- **SDR Bridge Control**: External egress requires manual hardware bridge activation.

---
*B-LAN: Reclaiming the network, one neighborhood at a time.*
