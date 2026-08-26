import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/ui';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function SystemSettings() {
  const { getSettings, updateSettings, getAnalytics, getUsers, getCourses } = useApp();
  const { toast } = useToast();

  const settings = getSettings();

  const [institutionName, setInstitutionName] = useState(settings.institutionName || '');
  const [academicYear, setAcademicYear] = useState(settings.academicYear || '');
  const [attendanceThreshold, setAttendanceThreshold] = useState(settings.attendanceThreshold || 75);
  const [lateMarkWindow, setLateMarkWindow] = useState(settings.lateMarkWindow || 30);
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      updateSettings({
        institutionName,
        academicYear,
        attendanceThreshold: Number(attendanceThreshold),
        lateMarkWindow: Number(lateMarkWindow),
      });
      toast.success('System settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const generateInstitutionReportPDF = () => {
    try {
      const doc = new jsPDF();
      const analytics = getAnalytics();
      const students = analytics.students || [];

      // Header
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text(institutionName || 'College Attendance Management System', 14, 20);

      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      doc.text(`Official Attendance Summary Report — Academic Year ${academicYear}`, 14, 28);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}`, 14, 34);

      // Threshold Badge
      doc.setFontSize(10);
      doc.setTextColor(220, 38, 38);
      doc.text(`Mandatory Minimum Attendance Rule: ${attendanceThreshold}%`, 14, 42);

      // Table data
      const tableData = students.map((s, idx) => [
        idx + 1,
        s.rollNumber || '—',
        s.name,
        s.department,
        s.section,
        `${s.present}/${s.total}`,
        `${s.percentage}%`,
        s.isLow ? 'LOW (< 75%)' : 'OK'
      ]);

      doc.autoTable({
        startY: 48,
        head: [['#', 'Roll No', 'Student Name', 'Department', 'Sec', 'Attended', '%', 'Status']],
        body: tableData,
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { fontSize: 9 },
      });

      doc.save(`institution_attendance_report_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('Institution Attendance PDF Report generated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF report.');
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="System Settings & Reports"
        subtitle="Configure institution policy thresholds and generate official attendance reports"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Policy Configuration Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2">
          <h2 className="text-base font-bold text-slate-800 mb-4">⚙️ Policy & Threshold Settings</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Institution Name</label>
              <input
                type="text"
                value={institutionName}
                onChange={e => setInstitutionName(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2024-25"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Minimum Attendance Threshold (%) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={attendanceThreshold}
                    onChange={e => setAttendanceThreshold(e.target.value)}
                    required
                    className="input-field font-bold text-indigo-600"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Students below this percentage will trigger low-attendance warnings.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Late Mark Grace Window (Minutes)</label>
              <input
                type="number"
                min={5}
                max={60}
                value={lateMarkWindow}
                onChange={e => setLateMarkWindow(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary px-6">
                {saving ? 'Saving...' : '💾 Save Policy Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Reports & PDF Export Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-2">📊 Institution Reports</h2>
            <p className="text-xs text-slate-500 mb-6">
              Generate formatted PDF and CSV reports for institutional compliance and HOD audits.
            </p>

            <div className="space-y-3">
              <button
                onClick={generateInstitutionReportPDF}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm font-semibold"
              >
                <span>📄</span> Download Master PDF Report
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-700">🔒 System Status</p>
            <p className="text-xs text-slate-500 mt-1">All audit logs active · Unlimited past modifications enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
}
