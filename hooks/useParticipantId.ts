
import { useState, useEffect } from 'react';

const PARTICIPANT_ID_KEY = 'flowup-participant-id';

function generateId() {
    return `participant_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function useParticipantId(): string {
  const [participantId, setParticipantId] = useState('');

  useEffect(() => {
    let storedId = localStorage.getItem(PARTICIPANT_ID_KEY);
    if (!storedId) {
      storedId = generateId();
      localStorage.setItem(PARTICIPANT_ID_KEY, storedId);
    }
    setParticipantId(storedId);
  }, []);

  return participantId;
}
