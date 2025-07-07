
import React, { useEffect, useState, useRef } from 'react';

const strings = ['E', 'A', 'D', 'G', 'B', 'E'];
const frets = Array.from({ length: 12 }, (_, i) => i);
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const openNotes = [4, 9, 2, 7, 11, 4];

const App = () => {
  const [selectedFrets, setSelectedFrets] = useState({});
  const [identifiedChords, setIdentifiedChords] = useState([]);
  const [chordLibrary, setChordLibrary] = useState([]);

  useEffect(() => {
    fetch('./unified_chord_library.json')
      .then(res => res.json())
      .then(data => setChordLibrary(data));
  }, []);

  const getNote = (stringIndex, fret) => {
    return (openNotes[stringIndex] + fret) % 12;
  };

  const getNoteName = (noteValue) => {
    return noteNames[noteValue];
  };

  const handleFretClick = (stringIndex, fret) => {
    const key = `${stringIndex}-${fret}`;
    setSelectedFrets(prev => {
      const newSelected = { ...prev };
      if (newSelected[key]) {
        delete newSelected[key];
      } else {
        Object.keys(newSelected).forEach(k => {
          if (k.startsWith(`${stringIndex}-`)) {
            delete newSelected[k];
          }
        });
        newSelected[key] = true;
      }
      return newSelected;
    });
  };

  const analyzeChord = () => {
    const selectedNotes = Object.keys(selectedFrets)
      .map(key => {
        const [stringIndex, fret] = key.split('-').map(Number);
        return fret >= 0 ? fret : 'x';
      });

    const matchedChords = chordLibrary.filter(chord => {
      return chord.positions.join() === selectedNotes.join();
    });

    setIdentifiedChords(matchedChords.length > 0 ? matchedChords : []);
  };

  useEffect(() => {
    analyzeChord();
  }, [selectedFrets]);

  const resetSelection = () => {
    setSelectedFrets({});
    setIdentifiedChords([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-6 text-blue-400">🎸 Guitar Chord Finder</h1>

      <div className="flex justify-center mb-4">
        <button
          onClick={resetSelection}
          className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600"
        >
          Reset Fretboard
        </button>
      </div>

      <div className="overflow-x-auto mb-6">
        <div className="min-w-max">
          <div className="flex mb-2">
            <div className="w-12 text-center text-sm text-slate-400">Open</div>
            {frets.map(fret => (
              <div key={fret} className="w-12 text-center text-sm text-slate-400">
                {fret === 0 ? '' : fret}
              </div>
            ))}
          </div>

          {strings.map((string, stringIndex) => (
            <div key={stringIndex} className="flex items-center mb-2">
              <div className="w-12 text-center font-medium text-slate-300">{string}</div>
              {frets.map(fret => {
                const key = `${stringIndex}-${fret}`;
                const isSelected = selectedFrets[key];
                const note = getNote(stringIndex, fret);
                const noteName = getNoteName(note);

                return (
                  <button
                    key={fret}
                    onClick={() => handleFretClick(stringIndex, fret)}
                    className={\`w-12 h-8 border border-slate-600 text-xs font-medium transition-colors \${isSelected ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}\`}
                  >
                    {isSelected ? noteName : ''}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Identified Chords</h2>
        {identifiedChords.length > 0 ? (
          identifiedChords.map((chord, idx) => (
            <div key={idx} className="mb-2">
              <strong className="text-blue-400">{chord.chordName}</strong> → {chord.positions.join(', ')}
            </div>
          ))
        ) : (
          <p className="text-slate-400">No chord matched yet.</p>
        )}
      </div>
    </div>
  );
};

export default App;
