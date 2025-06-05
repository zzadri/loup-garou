import { useEffect, useState } from 'react';
import socket from '../socket';

interface Player {
  name: string;
  role: string;
  alive: boolean;
}

export default function Admin() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    fetch('/api/getPlayers').then(r => r.json()).then(setPlayers);
    socket.on('updatePlayers', setPlayers);
    return () => {
      socket.off('updatePlayers', setPlayers);
    };
  }, []);

  const addPlayer = () => {
    if (name.trim()) {
      socket.emit('addPlayer', { name });
      setName('');
    }
  };

  const killPlayer = (playerName: string) => {
    socket.emit('killPlayer', playerName);
  };

  return (
    <div>
      <h1>Admin</h1>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom" />
      <button onClick={addPlayer}>Ajouter</button>
      <ul>
        {players.map(p => (
          <li key={p.name}>
            {p.name} - {p.role} {p.alive ? '' : '(mort)'}
            <button onClick={() => killPlayer(p.name)}>Tuer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
