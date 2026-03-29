import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocuments } from '../../hooks/useDocuments';
import { useAnalysis } from '../../hooks/useAnalysis';
import { useAutoSave } from '../../hooks/useAutoSave';
import { ScoreDisplay } from '../common/ScoreDisplay';
import { FAB } from '../common/FAB';

type PanelType = 'input' | 'output' | 'tips';

export function MainPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { documents, updateDocument } = useDocuments();
  const { result, loading: analyzing, analyze, setResult } = useAnalysis();

  const documentId = id ? parseInt(id) : null;
  const document = documentId ? documents.find(d => d.id === documentId) : null;

  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [activePanel, setActivePanel] = useState<PanelType>('output');
  const [proofreading, setProofreading] = useState(false);

  // Load document content when id changes (only on initial load)
  useEffect(() => {
    if (document && text === '') {
      setText(document.original_text || '');
      setTitle(document.title || 'Untitled Document');
      if (document.corrected_text) {
        setResult({
          corrected_text: document.corrected_text,
          tips: document.tips ? JSON.parse(document.tips) : [],
          score: document.score,
          errors_found: 0,
        });
      }
    }
  }, [document]);

  // Auto-save text
  useAutoSave({
    documentId,
    text,
    enabled: !!documentId,
    debounceMs: 1000,
  });

  // Auto-save title
  useAutoSave({
    documentId,
    text: title,
    field: 'title',
    enabled: !!documentId && title !== 'Untitled Document',
    debounceMs: 500,
  });

  // Analysis trigger
  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) return;

    const analysisResult = await analyze(text);
    if (analysisResult && documentId) {
      await updateDocument(documentId, {
        corrected_text: analysisResult.corrected_text,
        tips: JSON.stringify(analysisResult.tips),
        score: analysisResult.score,
      });
    }
  }, [text, analyze, documentId, updateDocument]);

  // Manual proof read via FAB
  const handleProofRead = async () => {
    if (!text.trim() || proofreading) return;
    setProofreading(true);
    await handleAnalyze();
    setProofreading(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          handleProofRead();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleProofRead]);

  if (!documentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f0e6]">
        <div className="text-center">
          <p className="text-[#5d5245] mb-4 font-[Lora]">Please select or create a document</p>
          <button
            onClick={() => navigate('/')}
            className="gradient-gold text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all font-[Inter]"
          >
            Go to Startup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f5f0e6]">
      {/* Title Bar */}
      <div className="bg-[#2c1810] text-white px-4 py-2 flex items-center gap-3 shadow-md">
        <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Document"
          className="flex-1 bg-transparent text-white placeholder-amber-200/50 text-sm font-[Playfair_Display] focus:outline-none focus:border-b focus:border-amber-400/50 border-b border-transparent"
        />
      </div>

      {/* Panel Selector (Mobile) */}
      <div className="bg-[#faf8f5] border-b border-[#d4c5a9] px-4 py-2 flex items-center justify-between md:hidden">
        <select
          value={activePanel}
          onChange={(e) => setActivePanel(e.target.value as PanelType)}
          className="text-sm border border-[#d4c5a9] rounded px-2 py-1 bg-white font-[Inter]"
        >
          <option value="input">Input</option>
          <option value="output">Corrected Text</option>
          <option value="tips">Tips</option>
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => setActivePanel('input')}
            className={`px-3 py-1 text-sm rounded font-[Inter] ${
              activePanel === 'input' 
                ? 'gradient-gold text-white' 
                : 'bg-[#e8e0d0] text-[#5d5245]'
            }`}
          >
            1
          </button>
          <button
            onClick={() => setActivePanel('output')}
            className={`px-3 py-1 text-sm rounded font-[Inter] ${
              activePanel === 'output' 
                ? 'gradient-gold text-white' 
                : 'bg-[#e8e0d0] text-[#5d5245]'
            }`}
          >
            2
          </button>
          <button
            onClick={() => setActivePanel('tips')}
            className={`px-3 py-1 text-sm rounded font-[Inter] ${
              activePanel === 'tips' 
                ? 'gradient-gold text-white' 
                : 'bg-[#e8e0d0] text-[#5d5245]'
            }`}
          >
            3
          </button>
        </div>
      </div>

      {/* Main Content - Three Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Input */}
        <div className={`flex-1 flex flex-col rounded-t-lg shadow-sm bg-[#faf8f5] ${activePanel === 'input' ? 'block' : 'hidden md:flex'} min-w-0`}>
          <div className="bg-[#faf8f5] px-4 py-3 border-b border-[#d4c5a9] flex items-center justify-between hover:bg-[#f5f0e6] transition-colors duration-200 cursor-default">
            <span className="font-semibold text-[#2c1810] font-[Playfair_Display] uppercase tracking-wide text-sm">
              Your Text
            </span>
            <span className="text-sm text-[#8b8173] font-[Inter]">
              {text.split(/\s+/).filter(w => w).length} words
            </span>
          </div>
          <div className="flex-1 p-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing your text here...\n\nClick the pen button to proofread your writing."
              className="w-full h-full p-5 resize-none focus:outline-none text-[#2d241e] leading-relaxed font-[Lora] text-lg bg-[#f5f0e6] rounded-lg shadow-sm border border-[#e8e0d0]"
              spellCheck="false"
            />
          </div>
        </div>

        {/* Middle Panel - Corrected Output */}
        <div className={`flex-1 flex flex-col rounded-t-lg shadow-sm bg-[#faf8f5] ${activePanel === 'output' ? 'block' : 'hidden md:flex'} min-w-0`}>
          <div className="bg-[#faf8f5] px-4 py-3 border-b border-[#d4c5a9] flex items-center justify-between hover:bg-[#f5f0e6] transition-colors duration-200 cursor-default">
            <span className="font-semibold text-[#2c1810] font-[Playfair_Display] uppercase tracking-wide text-sm">
              Corrected Text
            </span>
            {analyzing && <span className="text-sm text-[#8b5e3c] font-[Inter]">Analyzing...</span>}
          </div>
          <div className="flex-1 p-2">
            {result?.corrected_text ? (
              <div className="w-full h-full p-5 bg-[#f5f0e6] rounded-lg shadow-sm border border-[#e8e0d0] overflow-auto">
                <div className="prose max-w-none text-[#2d241e] leading-relaxed whitespace-pre-wrap font-[Lora]">
                  {result.corrected_text}
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-[#f5f0e6] rounded-lg shadow-sm border border-[#e8e0d0] flex flex-col items-center justify-center text-[#8b8173] font-[Lora]">
                <svg className="w-12 h-12 mb-3 text-[#d4c5a9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <p className="text-lg">Start typing to see corrections</p>
                <p className="text-sm mt-2">Click the pen button to proofread</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Tips & Score */}
        <div className={`flex-1 flex flex-col rounded-t-lg shadow-sm bg-[#faf8f5] ${activePanel === 'tips' ? 'block' : 'hidden md:flex'} min-w-0`}>
          <div className="bg-[#faf8f5] px-4 py-3 border-b border-[#d4c5a9] flex items-center justify-between hover:bg-[#f5f0e6] transition-colors duration-200 cursor-default">
            <span className="font-semibold text-[#2c1810] font-[Playfair_Display] uppercase tracking-wide text-sm">
              Tips & Score
            </span>
          </div>
          <div className="flex-1 p-2">
            <div className="w-full h-full p-5 bg-[#f5f0e6] rounded-lg shadow-sm border border-[#e8e0d0] overflow-auto">
              {/* Score Display */}
              <div className="mb-6">
                <ScoreDisplay score={result?.score ?? 10} />
              </div>

              {/* Tips List */}
              <div>
                <h4 className="font-semibold text-[#2c1810] mb-3 font-[Playfair_Display]">Writing Tips</h4>
                {result?.tips && result.tips.length > 0 ? (
                  <ul className="space-y-3">
                    {result.tips.map((tip, index) => (
                      <li key={index} className="flex gap-3 text-sm text-[#2d241e] font-[Lora]">
                        <span className="text-[#c9a047] font-bold text-base">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#8b8173] text-sm font-[Lora]">Enter text and click proofread to receive tips</p>
                )}
              </div>

              {/* Quick Tips */}
              <div className="mt-6 pt-5 border-t border-[#e8e0d0]">
                <h4 className="font-semibold text-[#2c1810] mb-2 text-sm font-[Playfair_Display]">Keyboard Shortcut</h4>
                <div className="text-xs text-[#8b8173] font-[Inter]">
                  <p><kbd className="bg-[#e8e0d0] px-1.5 py-0.5 rounded text-[#5d5245]">Ctrl+S</kbd> to proofread</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button - Proof Read */}
      <FAB onClick={handleProofRead} loading={proofreading || analyzing} />
    </div>
  );
}
