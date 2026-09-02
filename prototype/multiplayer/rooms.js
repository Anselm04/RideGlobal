export function createRoomClient({ supabaseUrl, accessToken, userId }) {
  const headers = {
    apikey: accessToken ? undefined : '',
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };

  const request = async (path, options = {}) => {
    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Room request failed');
    return data;
  };

  const roomCode = () => crypto.randomUUID().replaceAll('-', '').slice(0, 6).toUpperCase();

  return {
    async createPrivateRoom({ vehicleType = 'bmx', trackId = 'prototype-track-1', maxPlayers = 8 } = {}) {
      const code = roomCode();
      const rooms = await request('rideglobal_rooms', {
        method: 'POST',
        body: JSON.stringify({
          code,
          host_user_id: userId,
          vehicle_type: vehicleType,
          track_id: trackId,
          is_private: true,
          max_players: maxPlayers,
        }),
      });
      const room = rooms[0];
      await request('rideglobal_room_members', {
        method: 'POST',
        body: JSON.stringify({ room_id: room.id, user_id: userId }),
      });
      return room;
    },

    async joinRoom(code) {
      const rooms = await request(`rideglobal_rooms?code=eq.${encodeURIComponent(code)}&limit=1`);
      if (!rooms[0]) throw new Error('Room not found');
      const room = rooms[0];
      await request('rideglobal_room_members', {
        method: 'POST',
        body: JSON.stringify({ room_id: room.id, user_id: userId }),
      });
      return room;
    },

    async publishState(roomId, { x, y, z, yaw, vehicleType }) {
      return request(`rideglobal_player_states?on_conflict=room_id,user_id`, {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({
          room_id: roomId,
          user_id: userId,
          x,
          y,
          z,
          yaw,
          vehicle_type: vehicleType,
          updated_at: new Date().toISOString(),
        }),
      });
    },

    async getRoomStates(roomId) {
      return request(`rideglobal_player_states?room_id=eq.${roomId}`);
    },
  };
}
