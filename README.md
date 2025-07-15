# RideGlobal
Multiplayer BMX game built in Unity — race globally, perform tricks, and rule the leaderboard.
# Node.js backend
node_modules/
npm-debug.log*
.env
*.log
MIT License

Copyright (c) 2025 [Anselm Perkins]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...

[Rest of MIT license remains unchanged — scroll up if needed]
# RideGlobal 🌍🚴‍♂️

**RideGlobal** is a global multiplayer BMX stunt and racing game built in Unity. Trick, compete, and explore a dynamic 3D world where every player represents their country in fast-paced, skill-based BMX challenges.

## 🎮 Features

- ✅ Realistic BMX physics & tricks
- 🌍 Global matchmaking & multiplayer races
- 🧠 AI-assisted leaderboards & replays
- 🗺️ Play on terrain from real-world countries
- 🏆 Leaderboards, custom gear, and ranked events

## 🚀 Tech Stack

- Unity 2022+ (URP compatible)
- Node.js (multiplayer backend)
- WebSocket (low-latency networking)
- MongoDB / PlayFab (for player data and stats)
- JSON/GeoJSON (for map & country data)

## 🧭 Directory Structure
## ⚡ Quick Start

1. Open the Unity project in `client/UnityProject`
2. Run multiplayer server:
   ```bash
   cd server
   npm install
   npm start
   bmx multiplayer game
global bmx racing game
unity bmx tricks
ride bmx online
bmx stunt challenge
multiplayer bike game
bmx online leaderboard
---

## 🧩 PHASE 2: Node.js Multiplayer Server

**📁 Folder:** `server/`

### 📄 `server/package.json`
```json
{
  "name": "rideglobal-server",
  "version": "1.0.0",
  "description": "Multiplayer backend for RideGlobal BMX Game",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.13.0"
  }
}
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = {};
let playerCount = 0;

function generateRoomId() {
    return 'room_' + Math.floor(Math.random() * 10000);
}

wss.on("connection", (ws) => {
    let currentRoom = null;
    let playerId = "player_" + playerCount++;

    ws.on("message", (data) => {
        const msg = JSON.parse(data);

        if (msg.type === "join") {
            for (const roomId in rooms) {
                if (rooms[roomId].length < 4) {
                    currentRoom = roomId;
                    rooms[roomId].push(ws);
                    break;
                }
            }

            if (!currentRoom) {
                currentRoom = generateRoomId();
                rooms[currentRoom] = [ws];
            }

            ws.send(JSON.stringify({ type: "joined", playerId, roomId: currentRoom }));
        } else if (msg.type === "sync") {
            if (rooms[currentRoom]) {
                rooms[currentRoom].forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: "update",
                            playerId,
                            position: msg.position,
                            rotation: msg.rotation
                        }));
                    }
                });
            }
        }
    });

    ws.on("close", () => {
        if (currentRoom && rooms[currentRoom]) {
            rooms[currentRoom] = rooms[currentRoom].filter(client => client !== ws);
            if (rooms[currentRoom].length === 0) delete rooms[currentRoom];
        }
    });
});

server.listen(3000, () => {
    console.log("RideGlobal server running on port 3000");
});
using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance;
    public GameObject localPlayerPrefab;

    void Awake()
    {
        if (Instance == null) Instance = this;
        else Destroy(gameObject);

        DontDestroyOnLoad(gameObject);
    }

    void Start()
    {
        Debug.Log("RideGlobal Game Started");
    }

    public void SpawnLocalPlayer()
    {
        Instantiate(localPlayerPrefab, Vector3.zero, Quaternion.identity);
    }
}
using UnityEngine;
using WebSocketSharp;
using Newtonsoft.Json;
using System.Collections.Generic;

public class NetworkManager : MonoBehaviour
{
    public static NetworkManager Instance;
    private WebSocket ws;
    public GameObject remotePlayerPrefab;
    private string playerId;

    public Dictionary<string, GameObject> remotePlayers = new();

    void Awake()
    {
        if (Instance == null) Instance = this;
        else Destroy(gameObject);

        DontDestroyOnLoad(gameObject);
    }

    void Start()
    {
        ws = new WebSocket("ws://localhost:3000");
        ws.OnMessage += OnMessageReceived;
        ws.Connect();

        Send(new { type = "join" });
    }

    void Send(object obj)
    {
        string json = JsonConvert.SerializeObject(obj);
        ws.Send(json);
    }

    void OnMessageReceived(object sender, MessageEventArgs e)
    {
        var data = JsonConvert.DeserializeObject<Dictionary<string, object>>(e.Data);
        string type = data["type"].ToString();

        if (type == "joined")
        {
            playerId = data["playerId"].ToString();
            GameManager.Instance.SpawnLocalPlayer();
        }

        if (type == "update")
        {
            string id = data["playerId"].ToString();
            if (id == playerId) return;

            if (!remotePlayers.ContainsKey(id))
                remotePlayers[id] = Instantiate(remotePlayerPrefab);

            var pos = JsonConvert.DeserializeObject<Vector3>(data["position"].ToString());
            var rot = JsonConvert.DeserializeObject<Quaternion>(data["rotation"].ToString());

            remotePlayers[id].transform.SetPositionAndRotation(pos, rot);
        }
    }

    public void SendPlayerState(Vector3 position, Quaternion rotation)
    {
        Send(new {
            type = "sync",
            position,
            rotation
        });
    }
}
using UnityEngine;

public class PlayerNetwork : MonoBehaviour
{
    void Update()
    {
        if (NetworkManager.Instance != null)
        {
            NetworkManager.Instance.SendPlayerState(transform.position, transform.rotation);
        }
    }
}
using UnityEngine;

public class BMXController : MonoBehaviour
{
    public float moveSpeed = 10f;
    public float jumpForce = 5f;
    private Rigidbody rb;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
    }

    void Update()
    {
        float moveH = Input.GetAxis("Horizontal");
        float moveV = Input.GetAxis("Vertical");

        Vector3 move = new Vector3(moveH, 0, moveV) * moveSpeed * Time.deltaTime;
        rb.AddForce(move, ForceMode.VelocityChange);

        if (Input.GetKeyDown(KeyCode.Space))
            rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
    }
}
using UnityEngine;
using UnityEngine.SceneManagement;

public class SceneLoader : MonoBehaviour
{
    public void LoadGameScene()
    {
        SceneManager.LoadScene("GameScene");
    }
}


