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
using UnityEngine;

public class TrickManager : MonoBehaviour
{
    private Animator animator;
    private bool isTricking;

    void Start()
    {
        animator = GetComponent<Animator>();
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Alpha1)) DoTrick("TailWhip");
        if (Input.GetKeyDown(KeyCode.Alpha2)) DoTrick("BarSpin");
    }

    void DoTrick(string trickName)
    {
        if (animator == null || isTricking) return;

        isTricking = true;
        animator.Play(trickName);
        Debug.Log($"Trick performed: {trickName}");
        Invoke(nameof(ResetTrick), 1.5f); // Reset after animation duration
    }

    void ResetTrick() => isTricking = false;
}
using UnityEngine;
using System.Collections.Generic;
using System.Linq;

public class LeaderboardManager : MonoBehaviour
{
    private Dictionary<string, int> leaderboard = new();

    public void RecordTrick(string playerId, int score)
    {
        if (!leaderboard.ContainsKey(playerId))
            leaderboard[playerId] = 0;

        leaderboard[playerId] += score;
        PrintLeaderboard();
    }

    void PrintLeaderboard()
    {
        var sorted = leaderboard.OrderByDescending(x => x.Value);
        Debug.Log("--- LEADERBOARD ---");
        foreach (var entry in sorted)
        {
            Debug.Log($"{entry.Key}: {entry.Value}");
        }
    }
}
FindObjectOfType<LeaderboardManager>().RecordTrick("YOU", 100);
using UnityEngine;
using UnityEngine.SceneManagement;

public class CountrySelectManager : MonoBehaviour
{
    public void SelectCountry(string countryCode)
    {
        PlayerPrefs.SetString("PlayerCountry", countryCode);
        Debug.Log($"Country Selected: {countryCode}");
        SceneManager.LoadScene("GameScene");
    }
}
string country = PlayerPrefs.GetString("PlayerCountry");
using UnityEngine;
using TMPro;
using System.Linq;
using System.Collections.Generic;

public class UILeaderboard : MonoBehaviour
{
    public TextMeshProUGUI leaderboardText;

    private Dictionary<string, int> scores = new();

    public void UpdateScore(string playerId, int points)
    {
        if (!scores.ContainsKey(playerId))
            scores[playerId] = 0;

        scores[playerId] += points;
        RefreshUI();
    }

    void RefreshUI()
    {
        leaderboardText.text = "🏆 Leaderboard:\n";
        foreach (var kvp in scores.OrderByDescending(k => k.Value))
        {
            leaderboardText.text += $"{kvp.Key}: {kvp.Value} pts\n";
        }
    }
}
FindObjectOfType<UILeaderboard>().UpdateScore("YOU", 200);
// Example for flag support
string country = PlayerPrefs.GetString("PlayerCountry", "🌍");
leaderboardText.text += $"{country} {kvp.Key}: {kvp.Value} pts\n";
using UnityEngine;

public class CosmeticManager : MonoBehaviour
{
    public static CosmeticManager Instance;

    public string currentColor = "Red";

    void Awake()
    {
        if (Instance == null) Instance = this;
        else Destroy(gameObject);
        DontDestroyOnLoad(gameObject);

        LoadCosmetics();
    }

    public void SetBikeColor(string color)
    {
        currentColor = color;
        PlayerPrefs.SetString("BikeColor", color);
        ApplyColorToBike();
    }

    void LoadCosmetics()
    {
        currentColor = PlayerPrefs.GetString("BikeColor", "Red");
    }

    public void ApplyColorToBike()
    {
        GameObject player = GameObject.FindGameObjectWithTag("Player");
        if (player != null)
        {
            Renderer r = player.GetComponentInChildren<Renderer>();
            if (r != null)
            {
                Color c;
                if (ColorUtility.TryParseHtmlString(currentColor, out c))
                    r.material.color = c;
                else
                    r.material.color = Color.red;
            }
        }
    }
}
using UnityEngine;

public class ShopUI : MonoBehaviour
{
    public void SelectRed() => CosmeticManager.Instance.SetBikeColor("#FF0000");
    public void SelectBlue() => CosmeticManager.Instance.SetBikeColor("#0000FF");
    public void SelectYellow() => CosmeticManager.Instance.SetBikeColor("#FFFF00");
}
POST /api/player/save  { playerId, color, tricks }
GET  /api/player/{id}
using UnityEngine;
using UnityEngine.SceneManagement;
using TMPro;
using System.Collections;

public class TournamentManager : MonoBehaviour
{
    public TextMeshProUGUI timerText;
    public float raceTime = 0f;
    private bool isRacing = false;

    void Start()
    {
        StartCoroutine(StartRace());
    }

    IEnumerator StartRace()
    {
        yield return new WaitForSeconds(2f);
        isRacing = true;
        raceTime = 0f;
    }

    void Update()
    {
        if (isRacing)
        {
            raceTime += Time.deltaTime;
            timerText.text = $"⏱ {raceTime:F2}s";
        }

        if (Input.GetKeyDown(KeyCode.F)) // Finish line trigger (temp)
        {
            EndRace();
        }
    }

    public void EndRace()
    {
        isRacing = false;
        SaveTime(raceTime);
    }

    void SaveTime(float time)
    {
        float best = PlayerPrefs.GetFloat("BestTime", float.MaxValue);
        if (time < best)
        {
            PlayerPrefs.SetFloat("BestTime", time);
            Debug.Log($"🏅 New Best: {time:F2}s");
        }
        else
        {
            Debug.Log($"🏁 Finished: {time:F2}s — Best: {best:F2}s");
        }
    }
}
using UnityEngine;
using System.Collections.Generic;

public class GhostRecorder : MonoBehaviour
{
    private List<Vector3> positions = new();
    private List<Quaternion> rotations = new();

    public float recordRate = 0.1f;
    private float timer;

    void Update()
    {
        timer += Time.deltaTime;
        if (timer >= recordRate)
        {
            timer = 0f;
            positions.Add(transform.position);
            rotations.Add(transform.rotation);
        }
    }

    public GhostData SaveGhost()
    {
        return new GhostData { positions = positions.ToArray(), rotations = rotations.ToArray() };
    }
}

[System.Serializable]
public class GhostData
{
    public Vector3[] positions;
    public Quaternion[] rotations;
}
using UnityEngine;
using System.Collections;

public class GhostReplayer : MonoBehaviour
{
    public GhostData ghostData;
    public float playRate = 0.1f;

    public void PlayGhost()
    {
        StartCoroutine(Replay());
    }

    IEnumerator Replay()
    {
        for (int i = 0; i < ghostData.positions.Length; i++)
        {
            transform.position = ghostData.positions[i];
            transform.rotation = ghostData.rotations[i];
            yield return new WaitForSeconds(playRate);
        }
    }
}
GhostData data = player.GetComponent<GhostRecorder>().SaveGhost();
ghostObject.GetComponent<GhostReplayer>().ghostData = data;
ghostObject.GetComponent<GhostReplayer>().PlayGhost();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const tournaments = {}; // { tournamentId: [players...] }
let playerCounter = 0;

wss.on("connection", (ws) => {
  let playerId = "player_" + playerCounter++;
  let tournamentId = null;

  ws.on("message", (data) => {
    const msg = JSON.parse(data);

    if (msg.type === "joinTournament") {
      tournamentId = msg.tournamentId;

      if (!tournaments[tournamentId]) tournaments[tournamentId] = [];
      tournaments[tournamentId].push({ ws, playerId });

      ws.send(JSON.stringify({ type: "joinedTournament", playerId, tournamentId }));

      // Notify others
      tournaments[tournamentId].forEach((client) => {
        if (client.ws !== ws) {
          client.ws.send(JSON.stringify({ type: "playerJoined", playerId }));
        }
      });
    }

    if (msg.type === "submitTime") {
      tournaments[tournamentId].forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(
            JSON.stringify({
              type: "tournamentTime",
              playerId,
              time: msg.time
            })
          );
        }
      });
    }
  });

  ws.on("close", () => {
    if (tournamentId && tournaments[tournamentId]) {
      tournaments[tournamentId] = tournaments[tournamentId].filter((c) => c.ws !== ws);
    }
  });
});

server.listen(3000, () => console.log("Tournament Server on :3000"));
using UnityEngine;
using WebSocketSharp;
using Newtonsoft.Json;
using System.Collections.Generic;

public class TournamentClient : MonoBehaviour
{
    WebSocket ws;
    string playerId;

    void Start()
    {
        ws = new WebSocket("ws://localhost:3000");
        ws.OnMessage += OnMessage;
        ws.Connect();

        var joinMsg = new { type = "joinTournament", tournamentId = "daily_race" };
        ws.Send(JsonConvert.SerializeObject(joinMsg));
    }

    void OnMessage(object sender, MessageEventArgs e)
    {
        var data = JsonConvert.DeserializeObject<Dictionary<string, object>>(e.Data);
        string type = data["type"].ToString();

        if (type == "joinedTournament")
        {
            playerId = data["playerId"].ToString();
            Debug.Log($"🟢 Joined tournament as {playerId}");
        }

        if (type == "tournamentTime")
        {
            Debug.Log($"🏁 {data["playerId"]} finished in {data["time"]}s");
        }
    }

    public void SubmitTime(float time)
    {
        var msg = new { type = "submitTime", time };
        ws.Send(JsonConvert.SerializeObject(msg));
    }
}
using UnityEngine;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;

public class GhostDatabase : MonoBehaviour
{
    public void SaveGhost(GhostData data, string ghostId)
    {
        string path = Application.persistentDataPath + "/" + ghostId + ".ghost";
        FileStream stream = new FileStream(path, FileMode.Create);

        BinaryFormatter formatter = new BinaryFormatter();
        formatter.Serialize(stream, data);
        stream.Close();

        Debug.Log($"📼 Ghost saved: {path}");
    }

    public GhostData LoadGhost(string ghostId)
    {
        string path = Application.persistentDataPath + "/" + ghostId + ".ghost";
        if (!File.Exists(path)) return null;

        FileStream stream = new FileStream(path, FileMode.Open);
        BinaryFormatter formatter = new BinaryFormatter();
        GhostData data = (GhostData)formatter.Deserialize(stream);
        stream.Close();

        return data;
    }
}
const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017"; // or your cloud cluster URI
const dbName = "rideglobal";
let db;

// Connect once on server startup
MongoClient.connect(uri).then(client => {
  db = client.db(dbName);
  console.log("✅ Connected to MongoDB");
}).catch(err => console.error("MongoDB connection error", err));

// Save ghost data
router.post("/ghost", async (req, res) => {
  const { playerId, ghostData, time, country } = req.body;
  const entry = { playerId, ghostData, time, country, date: new Date() };

  try {
    await db.collection("ghosts").insertOne(entry);
    res.status(200).json({ message: "Ghost saved." });
  } catch (err) {
    res.status(500).json({ error: "Failed to save ghost." });
  }
});

// Fetch top ghosts
router.get("/leaderboard", async (req, res) => {
  try {
    const top = await db.collection("ghosts")
      .find()
      .sort({ time: 1 }) // Fastest first
      .limit(10)
      .toArray();

    res.status(200).json(top);
  } catch (err) {
    res.status(500).json({ error: "Failed to get leaderboard." });
  }
});

module.exports = router;
const bodyParser = require("body-parser");
const apiRoutes = require("./api");

app.use(bodyParser.json({ limit: "1mb" }));
app.use("/api", apiRoutes);
"dependencies": {
  "express": "^4.18.2",
  "ws": "^8.13.0",
  "mongodb": "^5.7.0",
  "body-parser": "^1.20.2"
}
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System;

[Serializable]
public class UploadRequest
{
    public string playerId;
    public GhostData ghostData;
    public float time;
    public string country;
}

public class GhostUploader : MonoBehaviour
{
    public IEnumerator UploadGhost(GhostData data, float time, string playerId, string country)
    {
        UploadRequest request = new()
        {
            playerId = playerId,
            ghostData = data,
            time = time,
            country = country
        };

        string json = JsonUtility.ToJson(request);
        using UnityWebRequest www = UnityWebRequest.Put("http://localhost:3000/api/ghost", json);
        www.method = UnityWebRequest.kHttpVerbPOST;
        www.SetRequestHeader("Content-Type", "application/json");

        yield return www.SendWebRequest();

        if (www.result != UnityWebRequest.Result.Success)
            Debug.LogError("❌ Ghost upload failed: " + www.error);
        else
            Debug.Log("✅ Ghost uploaded to server.");
    }
}
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using TMPro;

public class LeaderboardDownloader : MonoBehaviour
{
    public TextMeshProUGUI leaderboardText;

    public void LoadLeaderboard()
    {
        StartCoroutine(GetLeaderboard());
    }

    IEnumerator GetLeaderboard()
    {
        UnityWebRequest www = UnityWebRequest.Get("http://localhost:3000/api/leaderboard");
        yield return www.SendWebRequest();

        if (www.result != UnityWebRequest.Result.Success)
            Debug.LogError("Leaderboard error: " + www.error);
        else
        {
            leaderboardText.text = "🏆 Global Leaderboard:\n";
            string json = www.downloadHandler.text;
            var entries = JsonUtility.FromJson<GhostEntryArray>("{\"entries\":" + json + "}");
            foreach (var entry in entries.entries)
                leaderboardText.text += $"{entry.playerId} ({entry.country}) - {entry.time:F2}s\n";
        }
    }
}

[System.Serializable]
public class GhostEntryArray { public GhostEntry[] entries; }

[System.Serializable]
public class GhostEntry
{
    public string playerId;
    public float time;
    public string country;
}

