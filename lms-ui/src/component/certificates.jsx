import React, { useState } from "react";
import apiService from "../services/api";
import { useToast } from "../contexts/ToastContext";

export default function Certificates() {
  const toast = useToast();
  const [certId, setCertId] = useState("");
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(false);

  const onView = async () => {
    try {
      setLoading(true);
      const data = await apiService.certificates.getById(Number(certId));
      setCert(data);
      toast.info("Certificate loaded");
    } catch (e) {
      toast.error(e?.message || "Failed to fetch certificate");
    } finally {
      setLoading(false);
    }
  };

  const onDownload = async () => {
    try {
      setLoading(true);
      const blob = await apiService.certificates.download(Number(certId));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${certId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (e) {
      toast.error(e?.message || "Failed to download certificate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-slate-900 mb-4">Certificates</h1>
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 max-w-xl">
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Enter certificate ID"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
          />
          <button onClick={onView} disabled={!certId || loading} className="px-3 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-50">{loading ? 'Loading...' : 'View'}</button>
          <button onClick={onDownload} disabled={!certId || loading} className="px-3 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">Download</button>
        </div>
        {cert && (
          <div className="text-sm text-slate-700">
            <div><span className="font-medium">Trainee:</span> {cert.traineeFullName}</div>
            <div><span className="font-medium">Course:</span> {cert.courseName}</div>
            <div><span className="font-medium">Issued:</span> {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString() : '-'}</div>
          </div>
        )}
      </div>
    </div>
  );
}