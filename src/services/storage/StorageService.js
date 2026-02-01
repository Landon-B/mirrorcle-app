// Abstract StorageService interface
// This allows easy migration to Supabase later by implementing a new adapter

export class StorageService {
  async get(key) {
    throw new Error('Method not implemented');
  }

  async set(key, value) {
    throw new Error('Method not implemented');
  }

  async remove(key) {
    throw new Error('Method not implemented');
  }

  async clear() {
    throw new Error('Method not implemented');
  }

  // User-specific methods (Supabase-ready)
  async getUser() {
    throw new Error('Method not implemented');
  }

  async saveSession(session) {
    throw new Error('Method not implemented');
  }

  async getSessions() {
    throw new Error('Method not implemented');
  }

  async saveFavorite(favorite) {
    throw new Error('Method not implemented');
  }

  async removeFavorite(affirmationId) {
    throw new Error('Method not implemented');
  }

  async getFavorites() {
    throw new Error('Method not implemented');
  }

  async getStats() {
    throw new Error('Method not implemented');
  }

  async saveStats(stats) {
    throw new Error('Method not implemented');
  }

  async getPreferences() {
    throw new Error('Method not implemented');
  }

  async savePreferences(preferences) {
    throw new Error('Method not implemented');
  }
}
