import type { UserRecord, UserProfile, UserRole } from '../types';
import { generateId } from '../utils/idGenerator';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase/supabaseClient';

function mapRowToUserRecord(row: any): UserRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash || undefined,
    avatar: row.avatar || undefined,
    role: (row.role || 'user') as UserRole,
    authProvider: row.auth_provider || 'local',
    googleId: row.google_id || undefined,
    emailVerified: Boolean(row.email_verified),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at || undefined,
  };
}

function mapUserRecordToRow(user: UserRecord): any {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    password_hash: user.passwordHash || null,
    avatar: user.avatar || null,
    role: user.role,
    auth_provider: user.authProvider,
    google_id: user.googleId || null,
    email_verified: user.emailVerified,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
    last_login_at: user.lastLoginAt || null,
  };
}

class UserStore {
  // In-memory cache & fallback store
  private users: Map<string, UserRecord> = new Map();
  private emailIndex: Map<string, string> = new Map();
  private googleIdIndex: Map<string, string> = new Map();

  constructor() {
    this.seedInitialUsers();
  }

  private seedInitialUsers(): void {
    const demoId = 'usr_demo_researcher_001';
    const now = new Date().toISOString();
    const demoUser: UserRecord = {
      id: demoId,
      email: 'researcher@veriscope.internal',
      name: 'VeriScope Lead Researcher',
      role: 'user',
      authProvider: 'local',
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };
    this.users.set(demoId, demoUser);
    this.emailIndex.set(demoUser.email.toLowerCase(), demoId);
  }

  private cacheUser(user: UserRecord): void {
    this.users.set(user.id, user);
    if (user.email) {
      this.emailIndex.set(user.email.toLowerCase(), user.id);
    }
    if (user.googleId) {
      this.googleIdIndex.set(user.googleId, user.id);
    }
  }

  public async findById(id: string): Promise<UserRecord | undefined> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { data, error } = await client
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

          if (data && !error) {
            const user = mapRowToUserRecord(data);
            this.cacheUser(user);
            return user;
          }
        }
      } catch (err) {
        console.warn('[UserStore] Error fetching user by ID from Supabase, falling back to cache:', err);
      }
    }
    return this.users.get(id);
  }

  public async findByEmail(email: string): Promise<UserRecord | undefined> {
    const normalized = email.trim().toLowerCase();

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { data, error } = await client
            .from('users')
            .select('*')
            .ilike('email', normalized)
            .single();

          if (data && !error) {
            const user = mapRowToUserRecord(data);
            this.cacheUser(user);
            return user;
          }
        }
      } catch (err) {
        console.warn('[UserStore] Error fetching user by email from Supabase, falling back to cache:', err);
      }
    }

    const id = this.emailIndex.get(normalized);
    if (!id) return undefined;
    return this.users.get(id);
  }

  public async findByGoogleId(googleId: string): Promise<UserRecord | undefined> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { data, error } = await client
            .from('users')
            .select('*')
            .eq('google_id', googleId)
            .single();

          if (data && !error) {
            const user = mapRowToUserRecord(data);
            this.cacheUser(user);
            return user;
          }
        }
      } catch (err) {
        console.warn('[UserStore] Error fetching user by Google ID from Supabase, falling back to cache:', err);
      }
    }

    const id = this.googleIdIndex.get(googleId);
    if (!id) return undefined;
    return this.users.get(id);
  }

  public async createGoogleUser(data: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  }): Promise<UserRecord> {
    const normalizedEmail = data.email.trim().toLowerCase();

    // Check if account already exists with this email
    const existing = await this.findByEmail(normalizedEmail);
    if (existing) {
      return this.linkGoogleAccount(existing.id, {
        googleId: data.googleId,
        avatar: data.avatar,
      });
    }

    const id = generateId();
    const now = new Date().toISOString();
    const newUser: UserRecord = {
      id,
      email: normalizedEmail,
      name: data.name.trim() || normalizedEmail.split('@')[0],
      avatar: data.avatar,
      googleId: data.googleId,
      role: 'user',
      authProvider: 'google',
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };

    this.cacheUser(newUser);

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { error } = await client.from('users').insert(mapUserRecordToRow(newUser));
          if (error) {
            console.warn('[UserStore] Error inserting Google user into Supabase:', error.message);
          }
        }
      } catch (err) {
        console.warn('[UserStore] Failed writing user to Supabase:', err);
      }
    }

    return newUser;
  }

  public async createLocalUser(data: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<UserRecord> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const existing = await this.findByEmail(normalizedEmail);
    if (existing || this.emailIndex.has(normalizedEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const id = generateId();
    const now = new Date().toISOString();
    const newUser: UserRecord = {
      id,
      email: normalizedEmail,
      name: data.name.trim(),
      passwordHash: data.passwordHash,
      role: 'user',
      authProvider: 'local',
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };

    this.cacheUser(newUser);

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { error } = await client.from('users').insert(mapUserRecordToRow(newUser));
          if (error) {
            console.warn('[UserStore] Error inserting local user into Supabase:', error.message);
          }
        }
      } catch (err) {
        console.warn('[UserStore] Failed writing user to Supabase:', err);
      }
    }

    return newUser;
  }

  public async linkGoogleAccount(
    userId: string,
    data: { googleId: string; avatar?: string }
  ): Promise<UserRecord> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found for account linking.');
    }

    const now = new Date().toISOString();
    const updated: UserRecord = {
      ...user,
      googleId: data.googleId,
      avatar: user.avatar || data.avatar,
      emailVerified: true,
      lastLoginAt: now,
      updatedAt: now,
    };

    this.cacheUser(updated);

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { error } = await client
            .from('users')
            .update({
              google_id: updated.googleId,
              avatar: updated.avatar,
              email_verified: updated.emailVerified,
              last_login_at: updated.lastLoginAt,
              updated_at: updated.updatedAt,
            })
            .eq('id', userId);

          if (error) {
            console.warn('[UserStore] Error updating linked user in Supabase:', error.message);
          }
        }
      } catch (err) {
        console.warn('[UserStore] Failed updating linked user in Supabase:', err);
      }
    }

    return updated;
  }

  public async updateLastLogin(userId: string): Promise<void> {
    const user = this.users.get(userId);
    const now = new Date().toISOString();
    if (user) {
      user.lastLoginAt = now;
      user.updatedAt = now;
      this.cacheUser(user);
    }

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          await client
            .from('users')
            .update({
              last_login_at: now,
              updated_at: now,
            })
            .eq('id', userId);
        }
      } catch (err) {
        console.warn('[UserStore] Failed updating last login in Supabase:', err);
      }
    }
  }

  public toProfile(user: UserRecord): UserProfile {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      authProvider: user.authProvider,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  public async getAllUsersCount(): Promise<number> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { count, error } = await client
            .from('users')
            .select('*', { count: 'exact', head: true });
          if (!error && typeof count === 'number') {
            return count;
          }
        }
      } catch (err) {
        console.warn('[UserStore] Failed counting users from Supabase:', err);
      }
    }
    return this.users.size;
  }
}

export const userStore = new UserStore();
