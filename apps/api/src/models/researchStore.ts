import type {
  ResearchSession,
  Source,
  ChecklistItem,
  AnalysisResult,
  ResearchStatus,
  SourceStatus,
} from '../types';
import { generateId } from '../utils/idGenerator';

class ResearchStore {
  private sessions: Map<string, ResearchSession> = new Map();

  constructor() {
    this.seedDemoIfEmpty();
  }

  private seedDemoIfEmpty() {
    // We can pre-seed or let user initiate demo
  }

  public createResearch(data: {
    question: string;
    objective?: string;
    sourceUrls?: string[];
  }): ResearchSession {
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
    return session;
  }

  public getResearch(id: string): ResearchSession | undefined {
    return this.sessions.get(id);
  }

  public getAllResearch(): ResearchSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public updateResearch(id: string, updates: Partial<ResearchSession>): ResearchSession | undefined {
    const existing = this.sessions.get(id);
    if (!existing) return undefined;

    const updated: ResearchSession = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.sessions.set(id, updated);
    return updated;
  }

  public deleteResearch(id: string): boolean {
    return this.sessions.delete(id);
  }

  public addSources(id: string, urls: string[]): Source[] | undefined {
    const session = this.sessions.get(id);
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

    session.sources = [...session.sources, ...newSources];
    session.updatedAt = new Date().toISOString();
    return newSources;
  }

  public updateSource(
    sessionId: string,
    sourceId: string,
    updates: Partial<Source>
  ): Source | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const sourceIndex = session.sources.findIndex((s) => s.id === sourceId);
    if (sourceIndex === -1) return undefined;

    session.sources[sourceIndex] = {
      ...session.sources[sourceIndex],
      ...updates,
    };
    session.updatedAt = new Date().toISOString();
    return session.sources[sourceIndex];
  }

  public updateChecklist(
    sessionId: string,
    checklist: ChecklistItem[]
  ): ChecklistItem[] | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    session.checklist = checklist;
    session.updatedAt = new Date().toISOString();
    return checklist;
  }

  public toggleChecklistItem(sessionId: string, itemId: string): ChecklistItem | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const item = session.checklist.find((c) => c.id === itemId);
    if (!item) return undefined;

    item.completed = !item.completed;
    session.updatedAt = new Date().toISOString();
    return item;
  }

  public addChecklistItem(
    sessionId: string,
    item: Omit<ChecklistItem, 'id' | 'createdAt'>
  ): ChecklistItem | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const newItem: ChecklistItem = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    session.checklist.push(newItem);
    session.updatedAt = new Date().toISOString();
    return newItem;
  }
}

export const researchStore = new ResearchStore();
