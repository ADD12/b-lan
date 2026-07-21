# B-LAN Decentralized Inference Specification (v2.0)
## Transitioning from Lemonade/REST to libp2p-based iCore

### 1. Executive Summary
This document outlines the architectural shift for the Civic-Twin iCore and B-LAN from a centralized REST-based model (Lemonade) to a decentralized, peer-to-peer (P2P) inference framework. By utilizing **libp2p**, we enable resilient, offline-first task distribution across the McCoy Creek rewilding mesh.

---

### 2. libp2p Inference Wrapper: "Check-out/Return" Blueprint

The core of the new iCore is a libp2p-based wrapper that treats inference tasks as distributed assets.

#### Step-by-Step Implementation:
1.  **Peer Identity & Discovery**:
    *   Each node generates a unique `PeerId` (Ed25519).
    *   Nodes use **mDNS** for local discovery and **Kademlia DHT** for wide-area mesh discovery.
2.  **The Task Topic (Gossipsub)**:
    *   All nodes subscribe to `/blan/v1/inference/tasks`.
    *   Requesters publish a `TaskDescriptor` (JSON) containing the model type, input data hash (CID), and a unique `TaskID`.
3.  **Task Claiming (Check-out)**:
    *   A worker node with available capacity sends a `TaskClaim` message.
    *   To prevent race conditions in a partitioned mesh, the claim is recorded in the local DHT. If a node sees multiple claims for the same `TaskID`, it follows a deterministic tie-breaking rule (e.g., lowest PeerId).
4.  **Offline Execution**:
    *   The worker downloads the input data (via **IPFS/Bitswap** or direct libp2p stream).
    *   The worker enters "Processing" state. If the mesh signal is lost, the task remains in the worker's local queue.
5.  **Result Propagation (Return)**:
    *   Once inference is complete, the worker signs the result.
    *   The result is published to `/blan/v1/inference/results/{TaskID}`.
    *   If the requester is offline, the result is stored in the **Store-and-Forward (STN)** buffer of neighboring nodes until the requester regains signal.

---

### 3. STN Metadata Schema (Capability Discovery)

To optimize task routing, nodes broadcast their "Health & Wealth" (capabilities) via a periodic Gossipsub heartbeat.

```json
{
  "peer_id": "12D3KooW...",
  "timestamp": 1712386500,
  "capabilities": {
    "vram_total_mb": 12288,
    "vram_available_mb": 8192,
    "compute_units": "npu-edge-v4",
    "supported_models": ["gemma-4b", "yolo-v11-tiny", "whisper-base"]
  },
  "mesh_stats": {
    "latency_ms": 45,
    "uptime_pct": 98.2,
    "hop_count_to_exit": 3
  },
  "stn_buffer": {
    "capacity_mb": 512,
    "current_usage_mb": 42
  }
}
```

---

### 4. Resilience Comparison: libp2p vs. NATS/MQTT

For the **McCoy Creek rewilding sensor network**, where nodes are scattered across rugged terrain with intermittent line-of-sight:

| Feature | libp2p (B-LAN Choice) | NATS / MQTT |
| :--- | :--- | :--- |
| **Topology** | Pure P2P / Mesh | Hub-and-Spoke (Broker) |
| **Single Point of Failure** | None | The Broker |
| **Partition Tolerance** | High (Sub-meshes continue working) | Low (Clients disconnect from broker) |
| **Discovery** | Automatic (mDNS/DHT) | Manual Configuration / Static IPs |
| **Overhead** | Moderate (Handshakes/DHT maintenance) | Low (Simple TCP/UDP packets) |

**Verdict**: **libp2p** is significantly more resilient for McCoy Creek. In a NATS/MQTT setup, if the central gateway node (the "Lemonade Server") goes down or is physically obscured by a ridge, the entire sensor network loses the ability to coordinate. With libp2p, two sensors in a valley can still exchange inference results and synchronize state even if they are cut off from the rest of the world.

---

### 5. Implementation Roadmap
1.  **Phase 1**: Replace Express.js REST endpoints in `LemonadeServer.tsx` with a libp2p node instance.
2.  **Phase 2**: Implement the `TaskQueue` service using `js-libp2p-gossipsub`.
3.  **Phase 3**: Integrate Gemma 4 (Wasm/WebGPU) as the default local worker engine.
4.  **Phase 4**: Deploy STN (Store-and-Forward) logic to handle multi-hour mesh partitions.

---
*Document generated for Civic-Twin iCore v2.0 // B-LAN Protocol v2.0*
