import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../../hooks/useDocuments';
import { ConfirmDialog } from '../common/ConfirmDialog';

export function StartupPage() {
  const navigate = useNavigate();
  const { documents, loading, createDocument, deleteDocument } = useDocuments();
  
  const [deleteConfirm, setDeleteConfirm] = useState<{
    showing: boolean;
    docId: number | null;
  }>({ showing: false, docId: null });

  const handleNewDocument = async () => {
    const doc = await createDocument();
    if (doc) {
      navigate(`/main/${doc.id}`);
    }
  };

  const handleLoadDocument = (id: number) => {
    navigate(`/main/${id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeleteConfirm({ showing: true, docId: id });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm.docId) {
      await deleteDocument(deleteConfirm.docId);
    }
    setDeleteConfirm({ showing: false, docId: null });
  };

  return (
    <div className="min-h-screen bg-[#f5f0e6]">
      {/* Hero Section */}
      <div className="gradient-hero text-white py-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl font-bold font-[Playfair_Display] mb-4 tracking-tight">
            Write Better English with AI
          </h2>
          <p className="text-xl text-amber-100/90 mb-8 font-[Lora] max-w-2xl mx-auto">
            Get real-time grammar corrections, style tips, and scoring powered by AI
          </p>
          <button
            onClick={handleNewDocument}
            className="gradient-gold text-white px-10 py-4 rounded-lg font-semibold text-lg hover:shadow-lg hover:brightness-110 transition-all duration-300 font-[Inter]"
          >
            + New Document
          </button>
        </div>
        
        {/* Decorative bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400/0 via-amber-400/50 to-amber-400/0"></div>
      </div>

      {/* Documents List */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold font-[Playfair_Display] text-[#2c1810]">Recent Documents</h3>
          <span className="text-[#8b8173] font-[Inter] text-sm">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#8b5e3c] border-t-transparent mx-auto"></div>
            <p className="text-[#5d5245] mt-4 font-[Lora]">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-lg border border-[#d4c5a9]">
            <svg className="w-16 h-16 text-[#d4c5a9] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-[#5d5245] mb-4 font-[Lora]">No documents yet</p>
            <button
              onClick={handleNewDocument}
              className="text-[#8b5e3c] hover:text-[#6b4423] font-medium font-[Inter] transition-colors"
            >
              Create your first document
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleLoadDocument(doc.id)}
                className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-[#e8e0d0] hover:border-[#d4c5a9] group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-[#2c1810] font-[Playfair_Display] truncate">
                        {doc.title}
                      </h4>
                      {doc.score > 0 && (
                        <span className={`text-sm font-bold font-[Inter] ${
                          doc.score >= 8 ? 'text-green-700' : doc.score >= 6 ? 'text-amber-600' : 'text-red-700'
                        }`}>
                          {doc.score}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#5d5245] line-clamp-2 font-[Lora]">
                      {doc.original_text || 'No content yet'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#8b8173] font-[Inter]">
                      <span>{doc.word_count} words</span>
                      <span>•</span>
                      <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteClick(e, doc.id)}
                    className="p-2 text-[#8b8173] hover:text-[#8b2e38] hover:bg-[#fef0f0] rounded transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="Delete document"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.showing}
        onClose={() => setDeleteConfirm({ showing: false, docId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Document?"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
