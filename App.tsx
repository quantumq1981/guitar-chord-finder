
import React, { useState, useEffect } from 'react';

const strings = ['E', 'A', 'D', 'G', 'B', 'E'];
const frets = Array.from({ length: 12 }, (_, i) => i);
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const openNotes = [4, 9, 2, 7, 11, 4];

type ChordEntry = {
  name: string;
  formula: string;
};

const App: React.FC = () => {
  const [selectedFrets, setSelectedFrets] = useState<Record<string, boolean>>({});
  const [chordLibrary, setChordLibrary] = useState<ChordEntry[]>([]);
  const [identifiedChords, setIdentifiedChords] = useState<ChordEntry[]>([]);

  useEffect(() => {
    fetch('/chord_formulas_extracted.json')
      .then((res) => res.json())
      .then((data) => setChordLibrary(data));
  }, []);

  const getNote = (stringIndex: number, fret: number) =>
    (openNotes[stringIndex] + fret) % 12;

  const getNoteName = (note: number) => noteNames[note];

  const handleFretClick = (stringIndex: number, fret: number) => {
    const key = `${stringIndex}-${fret}`;
    setSelectedFrets((prev) => {
      const updated = { ...prev };
      if (updated[key]) {
        delete updated[key];
      } else {
        Object.keys(updated).forEach((k) => {
          if (k.startsWith(`${stringIndex}-`)) delete updated[k];
        });
        updated[key] = true;
      }
      return updated;
    });
  };

  const analyzeChord = () => {
    const notes = Object.keys(selectedFrets)
      .map((k) => getNote(...k.split('-').map(Number)))
      .sort((a, b) => a - b);

    const uniqueNotes = [...new Set(notes)];

    const matches: ChordEntry[] = chordLibrary.filter((chord) => {
      const formula = chord.formula
        .split(',')
        .map((f) => parseInt(f.replace(/[^\d]/g, ''), 10))
        .map((i) => (uniqueNotes[0] + i) % 12);
      const match = formula.filter((note) => uniqueNotes.includes(note));
      return match.length >= Math.min(3, formula.length);
    });

    setIdentifiedChords(matches.slice(0, 5));
  };

  useEffect(() => {
    analyzeChord();
  }, [selectedFrets]);

  const resetSelection = () => {
    setSelectedFrets({});
    setIdentifiedChords([]);
  };

  return (
    <div style={{ padding: '1rem', color: 'white', backgroundColor: '#1e293b', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>🎸 Guitar Chord Finder</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        {strings.map((string, stringIndex) => (
          <div key={stringIndex}>
            <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>{string}</div>
            {frets.map((fret) => {
              const key = `${stringIndex}-${fret}`;
              const selected = selectedFrets[key];
              const note = getNote(stringIndex, fret);
              return (
                <button
                  key={key}
                  style={{
                    width: '2.5rem',
                    height: '2rem',
                    margin: '0.2rem',
                    backgroundColor: selected ? '#2563eb' : '#334155',
                    color: selected ? 'white' : '#cbd5e1',
                    border: '1px solid #475569',
                    fontSize: '0.75rem'
                  }}
                  onClick={() => handleFretClick(stringIndex, fret)}
                >
                  {selected ? getNoteName(note) : ''}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <button onClick={resetSelection} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', backgroundColor: '#475569', borderRadius: '0.375rem', color: 'white' }}>
        Reset
      </button>

      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Identified Chords</h2>
        {identifiedChords.length > 0 ? (
          <ul>
            {identifiedChords.map((chord, idx) => (
              <li key={idx} style={{ backgroundColor: '#334155', padding: '0.5rem', borderRadius: '0.375rem', marginBottom: '0.5rem' }}>
                <strong>{chord.name}</strong> – {chord.formula}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#94a3b8' }}>No chord identified yet.</p>
        )}
      </div>
    </div>
  );
};

export default App;
