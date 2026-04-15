import { bookmarksQuery } from "../queries/bookmarks.query.ts";
import type { DbBookmarkRow } from "../types/domain.ts";

type ServiceResult = { status: number; body: Record<string, unknown> | unknown[] };

export const bookmarksService = {
  async toggleBookmark(userId: string | null, body: { sessionId?: string }): Promise<ServiceResult> {
    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized' } };
    }

    const { sessionId } = body;

    if (!sessionId) {
      return { status: 400, body: { error: 'Session ID required' } };
    }

    const { data: existing } = await bookmarksQuery.findBookmark(userId, sessionId);

    if (existing) {
      await bookmarksQuery.deleteBookmark(userId, sessionId);
    } else {
      await bookmarksQuery.insertBookmark(userId, sessionId);
    }

    const { data: bookmarks } = await bookmarksQuery.findBookmarkSessionIds(userId);

    return {
      status: 200,
      body: {
        bookmarks: (bookmarks as DbBookmarkRow[] | null)?.map((b) => b.session_id) || [],
        isBookmarked: !existing,
      },
    };
  },

  async getBookmarks(userId: string | null): Promise<ServiceResult> {
    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized' } };
    }

    const { data: bookmarks } = await bookmarksQuery.findBookmarksWithSessions(userId);
    const sessions = ((bookmarks as Array<{ sessions: unknown }> | null) || [])
      .map((b) => b.sessions)
      .filter(Boolean);

    return {
      status: 200,
      body: sessions,
    };
  },
};
