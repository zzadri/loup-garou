import { useEffect, useState } from 'react';
import socket from '../socket';

interface Player {
  name: string;
  role: string;
  alive: boolean;
}

export default function TV() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    fetch('/api/getPlayers').then(r => r.json()).then(setPlayers);
    socket.on('updatePlayers', setPlayers);
    return () => {
      socket.off('updatePlayers', setPlayers);
    };
  }, []);

  return (
    <div>
      <h1>TV</h1>
      <ul>
        {players.map(p => (
          <li key={p.name}>
            {p.name} {p.alive ? '' : '(mort)'}
          </li>
        ))}
      </ul>
    </div>
  );
}
