import { v4 as uuidv4 } from 'uuid';
import { SessionData } from '../types';

const SESSION_TIMEOUT_MS = (parseInt(process.env.SESSION_TIMEOUT_HOURS || '24') * 60 * 60 * 1000);

class SessionManager {
  private sessions: Map<string, SessionData> = new Map();

  createSession(): string {
    const sessionId = uuidv4();
    const now = new Date();
    
    this.sessions.set(sessionId, {
      sessionId,
      createdAt: now,
      lastAccessedAt: now,
      financialContext: null,
      debts: [],
    });

    // Clean up old sessions periodically
    this.cleanupSessions();
    
    return sessionId;
  }

  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    // Check if session has expired
    const now = new Date();
    const timeSinceLastAccess = now.getTime() - session.lastAccessedAt.getTime();
    
    if (timeSinceLastAccess > SESSION_TIMEOUT_MS) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Update last accessed time
    session.lastAccessedAt = now;
    return session;
  }

  updateSession(sessionId: string, updates: Partial<Omit<SessionData, 'sessionId' | 'createdAt'>>): boolean {
    const session = this.getSession(sessionId);
    if (!session) {
      return false;
    }

    Object.assign(session, updates);
    session.lastAccessedAt = new Date();
    return true;
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  private cleanupSessions(): void {
    const now = new Date();
    const sessionsToDelete: string[] = [];

    this.sessions.forEach((session, sessionId) => {
      const timeSinceLastAccess = now.getTime() - session.lastAccessedAt.getTime();
      if (timeSinceLastAccess > SESSION_TIMEOUT_MS) {
        sessionsToDelete.push(sessionId);
      }
    });

    sessionsToDelete.forEach(sessionId => this.sessions.delete(sessionId));
  }

  // For debugging/admin purposes
  getActiveSessionCount(): number {
    this.cleanupSessions();
    return this.sessions.size;
  }
}

export const sessionManager = new SessionManager();

