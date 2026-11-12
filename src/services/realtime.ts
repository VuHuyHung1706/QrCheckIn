import mqtt, { MqttClient } from 'mqtt';
import { SessionState, Participant } from '../types';

// Supported secure public MQTT WebSocket brokers (Free, 24/7, No registration, No card required)
const BROKERS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt'
];

// Helper to get or generate persistent Room ID
export function getRoomId(): string {
  if (typeof window === 'undefined') return 'stream_room_default';

  const params = new URLSearchParams(window.location.search);
  const paramRoom = params.get('room');
  if (paramRoom) {
    localStorage.setItem('obs_room_id', paramRoom);
    return paramRoom;
  }

  const stored = localStorage.getItem('obs_room_id');
  if (stored) return stored;

  const newId = 'stream_' + Math.random().toString(36).substring(2, 8);
  localStorage.setItem('obs_room_id', newId);
  return newId;
}

class PureFrontendRealtimeService {
  private client: MqttClient | null = null;
  private channel: BroadcastChannel | null = null;
  private roomId: string = getRoomId();
  private topic: string = `obs-checkin/room/${this.roomId}`;
  private listeners: Map<string, Set<Function>> = new Map();
  private timerInterval: any = null;

  public state: SessionState = {
    status: 'idle',
    totalExpected: 50,
    duration: 60,
    timeLeft: 60,
    orgName: 'Cộng đồng / Doanh nghiệp',
    participants: [],
    joinUrl: ''
  };

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Load saved settings from localStorage if available
    const saved = localStorage.getItem(`obs_state_${this.roomId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed, status: 'idle', timeLeft: parsed.duration || 60, participants: [] };
      } catch {}
    }

    this.updateJoinUrl();

    // 1. Local BroadcastChannel for instant zero-latency cross-tab sync
    try {
      this.channel = new BroadcastChannel(`bc_${this.topic}`);
      this.channel.onmessage = (event) => {
        this.handleIncoming(event.data);
      };
    } catch {}

    // 2. Global Public MQTT WebSocket for internet & mobile phone access
    this.connectMqtt(0);
  }

  private connectMqtt(brokerIdx: number) {
    if (brokerIdx >= BROKERS.length) return;

    try {
      this.client = mqtt.connect(BROKERS[brokerIdx], {
        reconnectPeriod: 2500,
        connectTimeout: 5000,
        clean: true,
      });

      this.client.on('connect', () => {
        this.client?.subscribe(this.topic, (err) => {
          if (!err) {
            // Request latest state from any active room host
            this.broadcast('request:state', {});
          }
        });
      });

      this.client.on('message', (_top, payload) => {
        try {
          const parsed = JSON.parse(payload.toString());
          this.handleIncoming(parsed);
        } catch {}
      });

      this.client.on('error', () => {
        if (brokerIdx + 1 < BROKERS.length) {
          this.client?.end();
          this.connectMqtt(brokerIdx + 1);
        }
      });
    } catch {
      if (brokerIdx + 1 < BROKERS.length) {
        this.connectMqtt(brokerIdx + 1);
      }
    }
  }

  private updateJoinUrl() {
    if (typeof window !== 'undefined') {
      const { protocol, host } = window.location;
      this.state.joinUrl = `${protocol}//${host}/join?room=${this.roomId}`;
    }
  }

  private handleIncoming(data: { event: string; payload: any; senderId?: string }) {
    if (!data || !data.event) return;

    const { event, payload } = data;

    switch (event) {
      case 'state:sync':
        this.state = { ...this.state, ...payload, joinUrl: this.state.joinUrl };
        this.trigger('state:sync', this.state);
        break;

      case 'timer:tick':
        this.state.timeLeft = payload.timeLeft;
        this.trigger('timer:tick', { timeLeft: payload.timeLeft });
        break;

      case 'participant:joined':
        // Avoid duplicate ids
        if (!this.state.participants.some(p => p.id === payload.id)) {
          this.state.participants = [...this.state.participants, payload];
          this.trigger('participant:joined', payload);
          this.trigger('state:sync', this.state);
        }
        break;

      case 'request:state':
        // If we are currently running, broadcast our state to newcomers
        this.broadcast('state:sync', this.state);
        break;

      default:
        this.trigger(event, payload);
    }
  }

  private broadcast(event: string, payload: any) {
    const message = { event, payload, timestamp: Date.now() };

    // Send through local BroadcastChannel
    try {
      this.channel?.postMessage(message);
    } catch {}

    // Send through MQTT WebSocket over internet
    if (this.client?.connected) {
      this.client.publish(this.topic, JSON.stringify(message));
    }
  }

  private saveSettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`obs_state_${this.roomId}`, JSON.stringify({
        orgName: this.state.orgName,
        totalExpected: this.state.totalExpected,
        duration: this.state.duration,
      }));
    }
  }

  // Compatible API with Socket.IO
  public on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Initial sync for state listeners
    if (event === 'state:sync') {
      this.updateJoinUrl();
      callback(this.state);
    }
  }

  public off(event: string, callback?: Function) {
    if (!callback) {
      this.listeners.delete(event);
    } else {
      this.listeners.get(event)?.delete(callback);
    }
  }

  private trigger(event: string, data: any) {
    this.listeners.get(event)?.forEach(cb => {
      try { cb(data); } catch {}
    });
  }

  public emit(event: string, data?: any) {
    switch (event) {
      case 'session:start':
        this.startTimer();
        break;

      case 'session:pause':
        this.pauseTimer();
        break;

      case 'session:reset':
        this.resetTimer();
        break;

      case 'session:config':
        if (data?.orgName !== undefined) this.state.orgName = data.orgName;
        if (data?.totalExpected !== undefined) this.state.totalExpected = Number(data.totalExpected);
        if (data?.duration !== undefined) {
          this.state.duration = Number(data.duration);
          if (this.state.status === 'idle') {
            this.state.timeLeft = Number(data.duration);
          }
        }
        this.saveSettings();
        this.broadcast('state:sync', this.state);
        this.trigger('state:sync', this.state);
        break;

      case 'participant:submit':
        const name = data?.name?.trim();
        if (!name) return;

        const participant: Participant = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name,
          timestamp: Date.now(),
          color: '#38bdf8'
        };

        this.broadcast('participant:joined', participant);
        this.handleIncoming({ event: 'participant:joined', payload: participant });
        break;

      default:
        this.broadcast(event, data);
    }
  }

  private startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    if (this.state.timeLeft <= 0) {
      this.state.timeLeft = this.state.duration;
    }

    this.state.status = 'running';
    this.broadcast('state:sync', this.state);
    this.trigger('state:sync', this.state);

    this.timerInterval = setInterval(() => {
      if (this.state.timeLeft > 0) {
        this.state.timeLeft -= 1;
        this.broadcast('timer:tick', { timeLeft: this.state.timeLeft });
        this.trigger('timer:tick', { timeLeft: this.state.timeLeft });

        if (this.state.timeLeft <= 0) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
          this.state.status = 'ended';
          this.broadcast('state:sync', this.state);
          this.trigger('state:sync', this.state);
        }
      }
    }, 1000);
  }

  private pauseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.state.status = 'idle';
    this.broadcast('state:sync', this.state);
    this.trigger('state:sync', this.state);
  }

  private resetTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.state.status = 'idle';
    this.state.timeLeft = this.state.duration;
    this.state.participants = [];
    this.broadcast('state:sync', this.state);
    this.trigger('state:sync', this.state);
  }
}

export const realtime = new PureFrontendRealtimeService();

// Export as `socket` for 100% drop-in backwards compatibility with all components
export const socket = realtime;

