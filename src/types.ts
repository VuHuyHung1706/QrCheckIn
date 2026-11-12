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

export interface BubbleItem {
  id: string;
  name: string;
  color: string;
  startX: number; // percentage (e.g. 25% to 85%)
  duration: number; // seconds
  size: number; // px
  delay: number;
  swayDistance: number;
}

