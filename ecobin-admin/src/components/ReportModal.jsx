import { useState } from 'react';
import { format } from 'date-fns';
import { updateReportStatus } from '../firebase/firestore';
import StatusBadge from './StatusBadge';
import toast from 'react-hot-toast';

export default function ReportModal({ report, onClose, onStatusChange }) {
  const [status, setStatus]   = useState(report?.status || 'pending');
  const [saving, setSaving]   = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!report) return null;

  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    try {
      await updateReportStatus(report.id, newStatus);
      setStatus(newStatus);
      onStatusChange?.(report.id, newStatus);
      toast.success(`Status updated to "${newStatus}"`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const photoURL = report.photoURL || report.imageUrl || report.imageURL;
  const lat      = report.location?.latitude  || report.locationLat;
  const lng      = report.location?.longitude || report.locationLng;
  const address  = report.location?.address   || report.address || '—';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-primary-900 text-white">
            <div>
              <h3 className="font-bold text-lg">Waste Report</h3>
              <p className="text-primary-300 text-xs font-mono">{report.id}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-primary-700 flex items-center justify-center text-2xl leading-none transition-colors"
            >
              ×
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {/* Photo */}
            <div className="relative bg-gray-900">
              {photoURL && !imgError ? (
                <img
                  src={photoURL}
                  alt="Waste report"
                  className="w-full h-64 object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                  <div className="text-center text-gray-400">
                    <p className="text-4xl mb-2">🗑️</p>
                    <p className="text-sm">{imgError ? 'Failed to load image' : 'No photo available'}</p>
                  </div>
                </div>
              )}
              {/* Status overlay */}
              <div className="absolute top-3 right-3">
                <StatusBadge status={status} />
              </div>
            </div>

            {/* Details */}
            <div className="p-6 space-y-5">
              {/* Grid info */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Waste Type',  value: report.wasteType || report.classification?.category || '—' },
                  { label: 'Reported By', value: report.userName || report.userId || '—' },
                  { label: 'Date',        value: report.createdAt ? format(report.createdAt.toDate(), 'MMM d, yyyy h:mm a') : '—' },
                  { label: 'Last Updated', value: report.updatedAt ? format(report.updatedAt.toDate(), 'MMM d, yyyy') : '—' },
                  { label: 'Address',     value: address, span: true },
                  { label: 'Coordinates', value: lat ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : '—' },
                ].map(item => (
                  <div key={item.label} className={item.span ? 'col-span-2' : ''}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{item.label}</p>
                    <p className="text-sm text-gray-800 font-medium capitalize">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {report.description && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100 leading-relaxed">
                    {report.description}
                  </p>
                </div>
              )}

              {/* Status Update */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Update Status</p>
                <div className="flex gap-2">
                  {['pending', 'in_progress', 'collected'].map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={saving || status === s}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                        status === s
                          ? s === 'pending'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : s === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      } disabled:opacity-50`}
                    >
                      {saving && status !== s ? '…' : s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
