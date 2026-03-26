import { create } from 'zustand';
import { WasteReport } from '../types';

interface ReportState {
  userReports: WasteReport[];
  submitting: boolean;
  setReports: (reports: WasteReport[]) => void;
  addReport: (report: WasteReport) => void;
  setSubmitting: (submitting: boolean) => void;
}

export const useReportStore = create<ReportState>((set) => ({
  userReports: [],
  submitting: false,
  setReports: (userReports) => set({ userReports }),
  addReport: (report) =>
    set((state) => ({ userReports: [report, ...state.userReports] })),
  setSubmitting: (submitting) => set({ submitting }),
}));
