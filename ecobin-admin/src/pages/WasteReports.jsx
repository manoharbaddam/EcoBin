import { useEffect, useState, useMemo } from 'react';
import { getAllReports, updateReportStatus } from '../firebase/firestore';
import { format } from 'date-fns';
import StatusBadge from '../components/StatusBadge';
import ReportModal from '../components/ReportModal';
import toast from 'react-hot-toast';

const STATUSES   = ['all', 'pending', 'in_progress', 'collected'];
const WASTE_TYPES = ['all', 'plastic', 'organic', 'electronic', 'paper', 'metal', 'glass', 'recyclable', 'non-recyclable', 'hazardous', 'e-waste'];

export default function WasteReports() {
  const [reports,   setReports]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [modal,     setModal]     = useState(null);

  // Filters
  const [statusFilter,    setStatusFilter]    = useState('all');
  const [wasteTypeFilter, setWasteTypeFilter] = useState('all');
  const [dateFrom,        setDateFrom]        = useState('');
  const [dateTo,          setDateTo]          = useState('');

  const fetchReports = () => {
    setLoading(true);
    getAllReports({ status: statusFilter, wasteType: wasteTypeFilter, dateFrom, dateTo })
      .then(setReports)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, [statusFilter, wasteTypeFilter, dateFrom, dateTo]);

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await updateReportStatus(reportId, newStatus);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
      if (modal?.id === reportId) setModal(prev => ({ ...prev, status: newStatus }));
      toast.success(`Status updated to "${newStatus}"`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const getWasteType = (r) =>
    r.wasteType || r.classification?.category || '—';

  const getAddress = (r) =>
    r.location?.address || r.address || (
      r.location?.latitude
        ? `${r.location.latitude.toFixed(4)}, ${r.location.longitude.toFixed(4)}`
        : '—'
    );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 capitalize ${
                  statusFilter === s
                    ? 'bg-primary-700 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s === 'all' ? 'All Status' : s.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Waste type */}
          <select
            value={wasteTypeFilter}
            onChange={e => setWasteTypeFilter(e.target.value)}
            className="input w-44"
          >
            {WASTE_TYPES.map(t => (
              <option key={t} value={t}>
                {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="input w-38 text-sm"
              placeholder="From"
            />
            <span className="text-gray-400 text-sm">→</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="input w-38 text-sm"
              placeholder="To"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                ✕ Clear
              </button>
            )}
          </div>

          <div className="ml-auto text-sm text-gray-500 font-medium">
            {reports.length} report{reports.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading reports…</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500 bg-red-50">⚠️ {error}</div>
        ) : reports.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <p className="text-4xl mb-3">🗑️</p>
            <p className="text-sm">No reports found for the selected filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Report ID', 'User', 'Waste Type', 'Address', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id} className="hover:bg-primary-50/40 transition-colors">
                    <td className="table-cell">
                      <span className="font-mono text-xs text-gray-400">{r.id.slice(0, 8)}…</span>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm font-medium text-gray-800">{r.userName || '—'}</p>
                      <p className="text-xs text-gray-400 font-mono">{r.userId?.slice(0, 8)}…</p>
                    </td>
                    <td className="table-cell">
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-semibold capitalize">
                        {getWasteType(r)}
                      </span>
                    </td>
                    <td className="table-cell max-w-[200px]">
                      <p className="text-xs text-gray-600 truncate" title={getAddress(r)}>
                        {getAddress(r)}
                      </p>
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={r.status || 'pending'} />
                    </td>
                    <td className="table-cell text-xs text-gray-500">
                      {r.createdAt ? format(r.createdAt.toDate(), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        {/* View photo */}
                        <button
                          onClick={() => setModal(r)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm"
                          title="View Photo"
                        >
                          📷
                        </button>
                        {/* Status dropdown */}
                        <select
                          value={r.status || 'pending'}
                          onChange={e => handleStatusUpdate(r.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="collected">Collected</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {modal && (
        <ReportModal
          report={modal}
          onClose={() => setModal(null)}
          onStatusChange={(id, status) => {
            setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
          }}
        />
      )}
    </div>
  );
}
