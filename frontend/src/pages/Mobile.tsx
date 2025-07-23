import { useEffect, useState } from 'react';
import socket from '../socket';

interface Player {
  name: string;
  role: string;
}

export default function Mobile() {
  const [name, setName] = useState('');
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    socket.on('playerAdded', (p: Player) => {
      if (p.name === name) setPlayer(p);
    });
    socket.on('updateRole', (data: { role: string }) => {
      setPlayer((prev) => prev && { ...prev, role: data.role });
    });
    socket.on('redirectToLogin', () => window.location.reload());
  }, [name]);

  const join = () => {
    if (name.trim()) {
      socket.emit('addPlayer', { name });
    }
  };

  if (!player) {
    return (
      <div>
        <h1>Rejoindre</h1>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={join}>Rejoindre</button>
      </div>
    );
  }

  return (
    <div>
      <h2>{player.name}</h2>
      <p>Role: {player.role}</p>
    </div>
  );
}
