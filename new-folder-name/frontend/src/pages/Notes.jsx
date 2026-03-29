import { useState } from 'react'
import { useStore } from '../store/useStore'
import { PenLine, Trash2, Lightbulb } from 'lucide-react'

const QUICK_TAGS = [
  'Felt dizzy', 'Skipped lunch', 'Poor sleep', 'Good energy',
  'Took a walk', 'Skipped medication', 'Felt nauseous', 'Pain increased',
  'Feeling better', 'Drank enough water',
]

export default function Notes() {
  const { notes, addNote, deleteNote } = useStore()
  const [text, setText] = useState('')

  const handleAdd = () => {
    if (!text.trim()) return
    addNote(text.trim())
    setText('')
  }

  const handleQuickTag = (tag) => {
    addNote(tag)
  }

  // Simple pattern detection from notes
  const patterns = []
  const noteTexts = notes.map((n) => n.text.toLowerCase())
  if (noteTexts.filter((t) => t.includes('dizzy')).length >= 2)
    patterns.push('Dizziness mentioned multiple times — mention this to your doctor.')
  if (noteTexts.filter((t) => t.includes('skip') && t.includes('med')).length >= 2)
    patterns.push('Medications skipped multiple times — try setting a reminder.')
  if (noteTexts.filter((t) => t.includes('poor sleep') || t.includes('sleep')).length >= 2)
    patterns.push('Sleep issues detected — good sleep is critical for recovery.')
  if (noteTexts.filter((t) => t.includes('pain')).length >= 3)
    patterns.push('Pain mentioned frequently — log symptoms to track severity.')

  return (
    <div className="p-5 space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Notes</h2>
        <p className="text-slate-500 text-sm mt-1">Track small observations about your day</p>
      </div>

      {/* Input */}
      <div className="card space-y-3">
        <textarea
          className="input-field resize-none"
          rows={3}
          placeholder="e.g. Felt dizzy after lunch, skipped afternoon walk..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn-primary" onClick={handleAdd} disabled={!text.trim()}>
          <PenLine size={18} className="inline mr-2" /> Save Note
        </button>
      </div>

      {/* Quick tags */}
      <div>
        <p className="text-sm font-semibold text-slate-500 mb-2">QUICK ADD</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleQuickTag(tag)}
              className="text-sm bg-slate-100 hover:bg-primary-50 hover:text-primary-700 text-slate-600 px-3 py-2 rounded-xl transition-all active:scale-95 border border-slate-200"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Pattern insights */}
      {patterns.length > 0 && (
        <div className="card bg-amber-50 border-amber-200 space-y-2">
          <p className="font-semibold text-amber-700 flex items-center gap-2">
            <Lightbulb size={16} /> Patterns Detected
          </p>
          {patterns.map((p, i) => (
            <p key={i} className="text-amber-600 text-sm">• {p}</p>
          ))}
        </div>
      )}

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <PenLine size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No notes yet</p>
          <p className="text-sm mt-1">Add your first observation above</p>
        </div>
      ) : (
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-2">YOUR NOTES ({notes.length})</p>
          <div className="space-y-2">
            {notes.map((note) => (
              <div key={note.id} className="card flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-slate-700">{note.text}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    {new Date(note.createdAt).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <button onClick={() => deleteNote(note.id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
