import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import os from 'os';

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Helper to get local network IP address
function getLocalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const netList = interfaces[name];
    if (netList) {
      for (const net of netList) {
        // Skip internal (127.0.0.1) and non-ipv4 addresses
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  }
  return 'localhost';
}

export interface Participant {
  id: string;
  name: string;
  timestamp: number;
  color: string;
}

export interface SessionState {
  status: 'idle' | 'running' | 'ended';
  totalExpected: number;
  duration: number;
  timeLeft: number;
  orgName: string;
  participants: Participant[];
  joinUrl: string;
}

const AVATAR_COLORS = [
  '#f43f5e', '#ec4899', '#d946ef', '#a855f7', 
  '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', 
  '#06b6d4', '#14b8a6', '#10b981', '#f59e0b'
];

// Helper to get join URL (uses FRONTEND_URL if set, or local LAN IP)
function getFrontendJoinUrl(): string {
  if (process.env.FRONTEND_URL) {
    const base = process.env.FRONTEND_URL.replace(/\/$/, '');
    return `${base}/join`;
  }
  return `http://${getLocalIp()}:5173/join`;
}

let sessionState: SessionState = {
  status: 'idle',
  totalExpected: 50,
  duration: 60,
  timeLeft: 60,
  orgName: 'Cộng đồng / Doanh nghiệp',
  participants: [],
  joinUrl: getFrontendJoinUrl()
};

let timerInterval: NodeJS.Timeout | null = null;

function broadcastState() {
  io.emit('state:sync', sessionState);
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  sessionState.status = 'running';
  broadcastState();

  timerInterval = setInterval(() => {
    if (sessionState.timeLeft > 0) {
      sessionState.timeLeft -= 1;
      io.emit('timer:tick', { timeLeft: sessionState.timeLeft });

      if (sessionState.timeLeft <= 0) {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;
        sessionState.status = 'ended';
        broadcastState();
        io.emit('session:ended', {
          totalParticipants: sessionState.participants.length,
          totalExpected: sessionState.totalExpected,
          percentage: sessionState.totalExpected > 0 
            ? Math.round((sessionState.participants.length / sessionState.totalExpected) * 100) 
            : 0
        });
      }
    }
  }, 1000);
}

function resetTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  sessionState.status = 'idle';
  sessionState.timeLeft = sessionState.duration;
  sessionState.participants = [];
  broadcastState();
}

// Socket.io Events
io.on('connection', (socket) => {
  // Always update joinUrl in case IP or port changed
  sessionState.joinUrl = getFrontendJoinUrl();
  socket.emit('state:sync', sessionState);

  socket.on('session:start', () => {
    if (sessionState.status !== 'running') {
      if (sessionState.timeLeft <= 0) {
        sessionState.timeLeft = sessionState.duration;
      }
      startTimer();
    }
  });

  socket.on('session:pause', () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    sessionState.status = 'idle';
    broadcastState();
  });

  socket.on('session:reset', () => {
    resetTimer();
  });

  socket.on('session:config', (config: { totalExpected?: number; duration?: number; orgName?: string }) => {
    if (config.totalExpected !== undefined && config.totalExpected > 0) {
      sessionState.totalExpected = Number(config.totalExpected);
    }
    if (config.duration !== undefined && config.duration > 0) {
      sessionState.duration = Number(config.duration);
      if (sessionState.status === 'idle') {
        sessionState.timeLeft = Number(config.duration);
      }
    }
    if (config.orgName !== undefined) {
      sessionState.orgName = config.orgName.trim() || 'Tổ chức';
    }
    broadcastState();
  });

  socket.on('participant:submit', (data: { name: string }) => {
    const rawName = data?.name?.trim();
    if (!rawName) return;

    const newParticipant: Participant = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: rawName,
      timestamp: Date.now(),
      color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    };

    sessionState.participants.push(newParticipant);

    // Broadcast individual bubble event immediately
    io.emit('participant:joined', newParticipant);
    // Also sync the full count
    io.emit('state:sync', sessionState);
  });
});

// REST Endpoints
app.get('/api/state', (req, res) => {
  sessionState.joinUrl = getFrontendJoinUrl();
  res.json({
    ...sessionState,
    localIp: getLocalIp()
  });
});

app.post('/api/submit', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập tên hợp lệ' });
  }

  const newParticipant: Participant = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    timestamp: Date.now(),
    color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
  };

  sessionState.participants.push(newParticipant);
  io.emit('participant:joined', newParticipant);
  io.emit('state:sync', sessionState);

  return res.json({ success: true, participant: newParticipant });
});

const PORT = Number(process.env.PORT) || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[Backend Server] Running at http://localhost:${PORT}`);
  console.log(`[Join Target] QR check-in target: ${getFrontendJoinUrl()}`);
});

