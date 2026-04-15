import { usersQuery } from "../queries/users.query.ts";
import type { DbBookmarkRow, DbUser, PrivacySettings } from "../types/domain.ts";
import type { UpdateUserDto } from "../types/dto.ts";

type ServiceResult = { status: number; body: Record<string, unknown> | unknown[] };

const defaultPrivacySettings = {
  showEmail: false,
  showContacts: true,
  showProjects: true,
  showSessions: false,
  showBio: true,
  showLanguages: true,
  showStack: true,
  showLevel: true,
};

const withFrontendUserShape = (
  user: DbUser,
  options: { includeDefaultStackLevel: boolean } = { includeDefaultStackLevel: true }
) => {
  const isPublic = user.profile_public !== undefined ? user.profile_public !== false : true;
  const base = {
    ...user,
    profilePublic: isPublic,
    privacySettings: user.privacy_settings || defaultPrivacySettings,
  };

  if (!options.includeDefaultStackLevel) {
    return base;
  }

  return {
    ...base,
    stack: user.stack || 'Fullstack',
    level: user.level || 'Junior',
  };
};

export const ensureUserExists = async (userId: string): Promise<boolean> => {
  const { data: existingUser } = await usersQuery.findUserIdOnlyById(userId);

  if (existingUser) {
    return true;
  }

  const {
    data: { user: authUser },
  } = await usersQuery.getAuthUserById(userId);

  if (!authUser) {
    console.log('Auth user not found for ID:', userId);
    return false;
  }

  const { error: insertError } = await usersQuery.insertUser({
    id: userId,
    username: authUser.user_metadata?.username || `user_${userId.substring(0, 8)}`,
    name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario',
    email: authUser.email || '',
    stack: 'Fullstack',
    level: 'Junior',
    languages: [],
    contacts: { email: authUser.email },
  });

  if (insertError) {
    console.log('Error creating user profile:', insertError);
    return false;
  }

  console.log('Created user profile for:', userId);
  return true;
};

export const usersService = {
  async getUserById(requestingUserId: string | null, userId: string): Promise<ServiceResult> {
    const isOwnProfile = requestingUserId === userId;

    const { data: user, error } = await usersQuery.findUserById(userId);

    if (error || !user) {
      return { status: 404, body: { error: 'User not found' } };
    }

    if (!isOwnProfile && user.profile_public !== undefined && user.profile_public === false) {
      return { status: 403, body: { error: 'Profile is private' } };
    }

    const userData: DbUser = { ...user };
    if (!isOwnProfile && user.privacy_settings) {
      const privacy = user.privacy_settings as PrivacySettings;

      if (!privacy.showEmail) {
        userData.email = '';
      }
      if (!privacy.showContacts) {
        userData.contacts = {};
      }
      if (!privacy.showBio) {
        userData.bio = null;
      }
      if (!privacy.showLanguages) {
        userData.languages = [];
      }
    }

    const { data: bookmarks } = await usersQuery.findBookmarksByUserId(userId);

    return {
      status: 200,
      body: {
        ...withFrontendUserShape(userData),
        bookmarks: (bookmarks as DbBookmarkRow[] | null)?.map((b) => b.session_id) || [],
      },
    };
  },

  async updateUserProfile(
    authUserId: string | null,
    requestedUserId: string,
    updates: UpdateUserDto
  ): Promise<ServiceResult> {
    if (!authUserId) {
      return { status: 401, body: { error: 'Unauthorized' } };
    }

    if (authUserId !== requestedUserId) {
      return { status: 403, body: { error: 'Forbidden - can only update own profile' } };
    }

    delete updates.id;
    delete updates.email;
    delete updates.created_at;
    delete updates.bookmarks;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.profilePublic !== undefined) {
      dbUpdates.profile_public = updates.profilePublic;
    }
    if (updates.privacySettings !== undefined) {
      dbUpdates.privacy_settings = updates.privacySettings;
    }
    if (updates.username !== undefined) dbUpdates.username = updates.username;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.stack !== undefined) dbUpdates.stack = updates.stack;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.languages !== undefined) dbUpdates.languages = updates.languages;
    if (updates.contacts !== undefined) dbUpdates.contacts = updates.contacts;

    const { data: user, error } = await usersQuery.updateUserById(authUserId, dbUpdates);

    if (error) {
      if (error.message && error.message.includes('profile_public')) {
        console.log('profile_public column does not exist, retrying without it');
        delete dbUpdates.profile_public;
        const retryResult = await usersQuery.updateUserById(authUserId, dbUpdates);

        if (retryResult.error) {
          return { status: 500, body: { error: 'Error updating user: ' + retryResult.error.message } };
        }

        return {
          status: 200,
          body: withFrontendUserShape(retryResult.data, { includeDefaultStackLevel: false }),
        };
      }

      if (error.code === 'PGRST116') {
        const insertData: Record<string, unknown> = {
          id: authUserId,
          username: updates.username || `user_${authUserId.substring(0, 8)}`,
          name: updates.name || 'Usuario',
          email: updates.email || '',
        };
        if (updates.profilePublic !== undefined) {
          insertData.profile_public = updates.profilePublic;
        }
        if (updates.privacySettings !== undefined) {
          insertData.privacy_settings = updates.privacySettings;
        }
        if (updates.avatar !== undefined) insertData.avatar = updates.avatar;
        if (updates.bio !== undefined) insertData.bio = updates.bio;
        if (updates.stack !== undefined) insertData.stack = updates.stack;
        if (updates.level !== undefined) insertData.level = updates.level;
        if (updates.languages !== undefined) insertData.languages = updates.languages;
        if (updates.contacts !== undefined) insertData.contacts = updates.contacts;

        const { data: newUser, error: insertError } = await usersQuery.insertUser(insertData);

        if (insertError) {
          return { status: 500, body: { error: 'Error creating user profile' } };
        }

        return {
          status: 200,
          body: withFrontendUserShape(newUser, { includeDefaultStackLevel: false }),
        };
      }

      return { status: 500, body: { error: 'Error updating user' } };
    }

    return { status: 200, body: withFrontendUserShape(user) };
  },

  async searchUsers(query: string, stack?: string, level?: string): Promise<ServiceResult> {
    let users: DbUser[] | null = null;
    let error: { message?: string; code?: string; details?: string } | null = null;

    try {
      const result = await usersQuery.listUsers({
        stack,
        level,
        applyPublicFilter: true,
      });
      users = result.data;
      error = result.error;
    } catch {
      console.log('profile_public column may not exist, showing all users as public');
      const fallback = await usersQuery.listUsers({ stack, level, applyPublicFilter: false });
      users = fallback.data;
      error = fallback.error;
    }

    if (error && error.message && error.message.includes('profile_public')) {
      console.log('Retrying without profile_public filter:', error.message);
      const retry = await usersQuery.listUsers({ stack, level, applyPublicFilter: false });
      users = retry.data;
      error = retry.error;
    }

    if (query && !error && users) {
      const searchLower = query.toLowerCase();
      users = users.filter((user) =>
        (user.name && user.name.toLowerCase().includes(searchLower)) ||
        (user.username && user.username.toLowerCase().includes(searchLower))
      );
    }

    if (error) {
      console.log('Search users error details:', error.message, error.code, error.details);
      return { status: 500, body: { error: 'Error searching users: ' + error.message } };
    }

    const usersWithPrivacy = (users || []).map((user) => {
      const privacy = (user.privacy_settings || {}) as PrivacySettings;
      const isPublic = user.profile_public !== undefined ? user.profile_public !== false : true;
      const userData: DbUser = {
        ...user,
        profilePublic: isPublic,
        privacySettings: privacy,
        stack: user.stack || 'Fullstack',
        level: user.level || 'Junior',
      };

      if (!privacy.showEmail) {
        userData.email = '';
      }
      if (!privacy.showContacts) {
        userData.contacts = {};
      }
      if (!privacy.showBio) {
        userData.bio = null;
      }
      if (!privacy.showLanguages) {
        userData.languages = [];
      }

      return userData;
    });

    return { status: 200, body: usersWithPrivacy };
  },

  async uploadAvatar(authUserId: string | null, requestedUserId: string, file: File | null): Promise<ServiceResult> {
    if (!authUserId) {
      console.log('Upload avatar - Auth verification failed');
      return { status: 401, body: { error: 'Unauthorized' } };
    }

    if (authUserId !== requestedUserId) {
      console.log('Upload avatar - User ID mismatch');
      return { status: 403, body: { error: 'Forbidden - can only upload own avatar' } };
    }

    if (!file) {
      return { status: 400, body: { error: 'No file provided' } };
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return {
        status: 400,
        body: { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
      };
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { status: 400, body: { error: 'File too large. Maximum size is 5MB.' } };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${authUserId}/${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await usersQuery.uploadAvatarFile(filePath, uint8Array, file.type);

    if (uploadError) {
      console.log('Storage upload error:', uploadError);
      return { status: 500, body: { error: 'Error uploading file: ' + uploadError.message } };
    }

    const { data: urlData } = usersQuery.getAvatarPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    const { data: user, error: updateError } = await usersQuery.updateUserById(authUserId, { avatar: publicUrl });

    if (updateError) {
      await usersQuery.removeAvatarFiles([filePath]);
      return { status: 500, body: { error: 'Error updating user avatar' } };
    }

    return {
      status: 200,
      body: {
        avatar: publicUrl,
        user,
      },
    };
  },
};
