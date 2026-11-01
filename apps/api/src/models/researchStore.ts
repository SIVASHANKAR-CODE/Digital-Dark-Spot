import fs from 'fs';
import path from 'path';
import type {
  ResearchSession,
  Source,
  ChecklistItem,
  ResearchStatus,
  SourceStatus,
} from '../types';
import { generateId } from '../utils/idGenerator';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase/supabaseClient';

const DATA_DIR = path.resolve(__dirname, '../../data');
const SESSIONS_FILE = path.join(DATA_DIR, 'research_sessions.json');

function mapRowToSession(row: any): ResearchSession {
  return {
    id: row.id,
    question: row.question,
    objective: row.objective || undefined,
    status: (row.status || 'draft') as ResearchStatus,
    sources: Array.isArray(row.sources) ? row.sources : [],
    analysis: row.analysis || undefined,
    checklist: Array.isArray(row.checklist) ? row.checklist : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    analyzedAt: row.analyzed_at || undefined,
  };
}

function mapSessionToRow(session: ResearchSession): any {
  return {
    id: session.id,
    question: session.question,
    objective: session.objective || null,
    status: session.status,
    sources: session.sources || [],
    analysis: session.analysis || null,
    checklist: session.checklist || [],
    created_at: session.createdAt,
    updated_at: session.updatedAt,
    analyzed_at: session.analyzedAt || null,
  };
}

class ResearchStore {
  // Local in-memory / disk cache & fallback
  private sessions: Map<string, ResearchSession> = new Map();

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(SESSIONS_FILE)) {
        const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
        const list: ResearchSession[] = JSON.parse(raw);
        for (const item of list) {
          if (item && item.id) {
            this.sessions.set(item.id, item);
          }
        }
      }
    } catch (e) {
      console.warn('[ResearchStore] Warning loading sessions from disk:', e);
    }
  }

  private saveToDisk(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const list = Array.from(this.sessions.values());
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[ResearchStore] Warning saving sessions to disk:', e);
    }
  }

  public async createResearch(data: {
    question: string;
    objective?: string;
    sourceUrls?: string[];
  }): Promise<ResearchSession> {
    const id = generateId();
    const now = new Date().toISOString();

    const sources: Source[] = (data.sourceUrls || []).map((url) => {
      let domain = '';
      try {
        domain = new URL(url).hostname;
      } catch {
        domain = 'unknown';
      }
      return {
        id: generateId(),
        url,
        title: url,
        domain,
        status: 'pending' as SourceStatus,
      };
    });

    const session: ResearchSession = {
      id,
      question: data.question,
      objective: data.objective,
      status: 'draft' as ResearchStatus,
      sources,
      checklist: [],
      createdAt: now,
      updatedAt: now,
    };

    this.sessions.set(id, session);
    this.saveToDisk();

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { error } = await client.from('research_sessions').insert(mapSessionToRow(session));
          if (error) {
            console.warn('[ResearchStore] Error writing session to Supabase:', error.message);
          }
        }
      } catch (err) {
        console.warn('[ResearchStore] Failed writing session to Supabase:', err);
      }
    }

    return session;
  }

  public async getResearch(id: string): Promise<ResearchSession | undefined> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { data, error } = await client
            .from('research_sessions')
            .select('*')
            .eq('id', id)
            .single();

          if (data && !error) {
            const session = mapRowToSession(data);
            this.sessions.set(id, session);
            return session;
          }
        }
      } catch (err) {
        console.warn('[ResearchStore] Error fetching session from Supabase, falling back to cache:', err);
      }
    }

    return this.sessions.get(id);
  }

  public async getAllResearch(): Promise<ResearchSession[]> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { data, error } = await client
            .from('research_sessions')
            .select('*')
            .order('created_at', { ascending: false });

          if (data && !error) {
            const list = data.map(mapRowToSession);
            for (const s of list) {
              this.sessions.set(s.id, s);
            }
            return list;
          }
        }
      } catch (err) {
        console.warn('[ResearchStore] Error fetching all sessions from Supabase, falling back to cache:', err);
      }
    }

    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async updateResearch(id: string, updates: Partial<ResearchSession>): Promise<ResearchSession | undefined> {
    const existing = await this.getResearch(id);
    if (!existing) return undefined;

    const updated: ResearchSession = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.sessions.set(id, updated);
    this.saveToDisk();

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { error } = await client
            .from('research_sessions')
            .update(mapSessionToRow(updated))
            .eq('id', id);

          if (error) {
            console.warn('[ResearchStore] Error updating session in Supabase:', error.message);
          }
        }
      } catch (err) {
        console.warn('[ResearchStore] Failed updating session in Supabase:', err);
      }
    }

    return updated;
  }

  public async deleteResearch(id: string): Promise<boolean> {
    const deleted = this.sessions.delete(id);
    this.saveToDisk();

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { error } = await client.from('research_sessions').delete().eq('id', id);
          if (error) {
            console.warn('[ResearchStore] Error deleting session from Supabase:', error.message);
          }
        }
      } catch (err) {
        console.warn('[ResearchStore] Failed deleting session from Supabase:', err);
      }
    }

    return deleted;
  }

  public async addSources(id: string, urls: string[]): Promise<Source[] | undefined> {
    const session = await this.getResearch(id);
    if (!session) return undefined;

    const newSources: Source[] = urls.map((url) => {
      let domain = '';
      try {
        domain = new URL(url).hostname;
      } catch {
        domain = 'unknown';
      }
      return {
        id: generateId(),
        url,
        title: url,
        domain,
        status: 'pending' as SourceStatus,
      };
    });

    const updatedSources = [...session.sources, ...newSources];
    await this.updateResearch(id, { sources: updatedSources });
    return newSources;
  }

  public async updateSource(
    sessionId: string,
    sourceId: string,
    updates: Partial<Source>
  ): Promise<Source | undefined> {
    const session = await this.getResearch(sessionId);
    if (!session) return undefined;

    const sourceIndex = session.sources.findIndex((s) => s.id === sourceId);
    if (sourceIndex === -1) return undefined;

    const updatedSources = [...session.sources];
    updatedSources[sourceIndex] = {
      ...updatedSources[sourceIndex],
      ...updates,
    };

    await this.updateResearch(sessionId, { sources: updatedSources });
    return updatedSources[sourceIndex];
  }

  public async updateChecklist(
    sessionId: string,
    checklist: ChecklistItem[]
  ): Promise<ChecklistItem[] | undefined> {
    const session = await this.getResearch(sessionId);
    if (!session) return undefined;

    await this.updateResearch(sessionId, { checklist });
    return checklist;
  }

  public async toggleChecklistItem(sessionId: string, itemId: string): Promise<ChecklistItem | undefined> {
    const session = await this.getResearch(sessionId);
    if (!session) return undefined;

    const item = session.checklist.find((c) => c.id === itemId);
    if (!item) return undefined;

    item.completed = !item.completed;
    await this.updateResearch(sessionId, { checklist: session.checklist });
    return item;
  }

  public async addChecklistItem(
    sessionId: string,
    item: Omit<ChecklistItem, 'id' | 'createdAt'>
  ): Promise<ChecklistItem | undefined> {
    const session = await this.getResearch(sessionId);
    if (!session) return undefined;

    const newItem: ChecklistItem = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    const updatedChecklist = [...session.checklist, newItem];
    await this.updateResearch(sessionId, { checklist: updatedChecklist });
    return newItem;
  }
}

export const researchStore = new ResearchStore();
