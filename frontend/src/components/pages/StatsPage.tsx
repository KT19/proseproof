import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statsApi } from '../../services/api';
import { useDocuments } from '../../hooks/useDocuments';
import { ConfirmDialog } from '../common/ConfirmDialog';
import type { UserStats } from '../../types';

export function StatsPage() {
  const navigate = useNavigate();
  const { documents, deleteDocument } = useDocuments();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    showing: boolean;
    docId: number | null;
  }>({ showing: false, docId: null });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await statsApi.get();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-700';
    if (score >= 6) return 'text-amber-600';
    return 'text-red-700';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Excellent';
    if (score >= 7) return 'Good';
    if (score >= 5) return 'Fair';
    return 'Needs Work';
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
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-[#2c1810] font-[Playfair_Display] mb-2">
            Your Statistics
          </h2>
          <p className="text-[#5d5245] font-[Lora]">Track your writing progress over time</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Documents */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e8e0d0] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#8b8173] text-sm font-[Inter]">Total Documents</span>
              <div className="w-10 h-10 rounded-lg bg-[#f5e6d3] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#8b5e3c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            {loading ? (
              <div className="animate-pulse bg-[#f5e6d3] h-8 rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-[#2c1810] font-[Playfair_Display]">{stats?.total_documents || 0}</p>
            )}
          </div>

          {/* Total Words */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e8e0d0] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#8b8173] text-sm font-[Inter]">Words Processed</span>
              <div className="w-10 h-10 rounded-lg bg-[#e8f5e9] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#3d6e42]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m11 1l-4-4m0 0l-4 4m4-4v12" />
                </svg>
              </div>
            </div>
            {loading ? (
              <div className="animate-pulse bg-[#f5e6d3] h-8 rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-[#2c1810] font-[Playfair_Display]">
                {(stats?.total_words || 0).toLocaleString()}
              </p>
            )}
          </div>

          {/* Average Score */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e8e0d0] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#8b8173] text-sm font-[Inter]">Average Score</span>
              <div className="w-10 h-10 rounded-lg bg-[#fef3e2] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#c97c3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.914c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            {loading ? (
              <div className="animate-pulse bg-[#f5e6d3] h-8 rounded"></div>
            ) : (
              <div>
                <p className={`text-3xl font-bold font-[Playfair_Display] ${getScoreColor(stats?.average_score || 0)}`}>
                  {stats?.average_score?.toFixed(1) || '0.0'}
                  <span className="text-[#8b8173] text-xl">/10</span>
                </p>
                <p className="text-sm text-[#8b8173] mt-1 font-[Inter]">
                  {getScoreLabel(stats?.average_score || 0)}
                </p>
              </div>
            )}
          </div>

          {/* Analyzed Documents */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e8e0d0] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#8b8173] text-sm font-[Inter]">Analyzed</span>
              <div className="w-10 h-10 rounded-lg bg-[#e3f2fd] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1a2b49]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            {loading ? (
              <div className="animate-pulse bg-[#f5e6d3] h-8 rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-[#2c1810] font-[Playfair_Display]">
                {stats?.analyzed_documents || 0}
              </p>
            )}
          </div>
        </div>

        {/* Documents History */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e8e0d0] overflow-hidden">
          <div className="px-6 py-4 bg-[#faf8f5] border-b border-[#d4c5a9] flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#2c1810] font-[Playfair_Display]">Document History</h3>
            <span className="text-sm text-[#8b8173] font-[Inter]">{documents.length} documents</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#faf8f5] border-b border-[#d4c5a9]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8b8173] uppercase tracking-wider font-[Inter]">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8b8173] uppercase tracking-wider font-[Inter]">Content Preview</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#8b8173] uppercase tracking-wider font-[Inter]">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8b8173] uppercase tracking-wider font-[Inter]">Words</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8b8173] uppercase tracking-wider font-[Inter]">Updated</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#8b8173] uppercase tracking-wider font-[Inter]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e0d0]">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-[#8b8173] font-[Lora]">
                      No documents yet. Create one to see your history!
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr
                      key={doc.id}
                      onClick={() => navigate(`/main/${doc.id}`)}
                      className="hover:bg-[#f5f0e6]/50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-[#2c1810] font-[Playfair_Display]">{doc.title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#5d5245] truncate block max-w-xs font-[Lora]">
                          {doc.original_text || 'No content'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {doc.score > 0 ? (
                          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold font-[Playfair_Display] ${getScoreColor(doc.score)} bg-[#f5e6d3]`}>
                            {doc.score}
                          </span>
                        ) : (
                          <span className="text-[#d4c5a9] font-[Playfair_Display]">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#5d5245] font-[Inter]">{doc.word_count}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#5d5245] font-[Inter]">
                          {new Date(doc.updated_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={(e) => handleDeleteClick(e, doc.id)}
                          className="p-2 text-[#8b8173] hover:text-[#8b2e38] hover:bg-[#fef0f0] rounded transition-all"
                          title="Delete document"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
