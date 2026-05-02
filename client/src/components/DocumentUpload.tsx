import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, Loader2, FileText } from 'lucide-react';
import { documentApi } from '../services/api';
import { t } from '../i18n';
import toast from 'react-hot-toast';
import type { Document } from '../types';

interface Props {
  propertyId: string;
  onUploaded: (doc: Document) => void;
}

const DOC_TYPES = Object.entries(t.documentTypes).map(([value, label]) => ({ value, label }));

interface UploadItem {
  file: File;
  documentType: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export default function DocumentUpload({ propertyId, onUploaded }: Props) {
  const [queue, setQueue] = useState<UploadItem[]>([]);

  const onDrop = useCallback((accepted: File[]) => {
    const items: UploadItem[] = accepted.map((file) => ({
      file,
      documentType: 'other',
      status: 'idle',
      progress: 0,
    }));
    setQueue((prev) => [...prev, ...items]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/tiff': ['.tiff', '.tif'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 20 * 1024 * 1024,
    multiple: true,
  });

  const setDocType = (index: number, type: string) => {
    setQueue((prev) => prev.map((item, i) => i === index ? { ...item, documentType: type } : item));
  };

  const removeItem = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadItem = async (index: number) => {
    const item = queue[index];
    if (item.status === 'uploading' || item.status === 'success') return;

    setQueue((prev) => prev.map((it, i) =>
      i === index ? { ...it, status: 'uploading', progress: 0 } : it
    ));

    try {
      const doc = await documentApi.upload(
        propertyId, item.file, item.documentType,
        (progress) => {
          setQueue((prev) => prev.map((it, i) => i === index ? { ...it, progress } : it));
        }
      );
      setQueue((prev) => prev.map((it, i) =>
        i === index ? { ...it, status: 'success', progress: 100 } : it
      ));
      onUploaded(doc);
      toast.success(`${item.file.name} u ngarkua me sukses`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.uploadError;
      setQueue((prev) => prev.map((it, i) =>
        i === index ? { ...it, status: 'error', error: msg } : it
      ));
      toast.error(msg);
    }
  };

  const uploadAll = async () => {
    const pending = queue.map((_, i) => i).filter((i) => queue[i].status === 'idle');
    await Promise.all(pending.map(uploadItem));
  };

  const pendingCount = queue.filter((i) => i.status === 'idle').length;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-brand-400 bg-brand-50' : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragActive ? 'text-brand-500' : 'text-gray-400'}`} />
        <p className="text-gray-600 font-medium mb-1">{t.uploadInstructions}</p>
        <p className="text-xs text-gray-400">{t.uploadFormats}</p>
      </div>

      {queue.length > 0 && (
        <div className="space-y-3">
          {queue.map((item, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
                  <p className="text-xs text-gray-400 mb-2">
                    {(item.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {item.status === 'idle' && (
                    <select
                      value={item.documentType}
                      onChange={(e) => setDocType(index, e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {DOC_TYPES.map((dt) => (
                        <option key={dt.value} value={dt.value}>{dt.label}</option>
                      ))}
                    </select>
                  )}
                  {item.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-brand-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                  {item.status === 'error' && (
                    <p className="text-xs text-red-600 mt-1">{item.error}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {item.status === 'idle' && (
                    <button
                      onClick={() => uploadItem(index)}
                      className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-md hover:bg-brand-700 transition-colors"
                    >
                      Ngarko
                    </button>
                  )}
                  {item.status === 'uploading' && <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />}
                  {item.status === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                  {item.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                  {item.status !== 'uploading' && (
                    <button onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {pendingCount > 1 && (
            <button
              onClick={uploadAll}
              className="w-full py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium text-sm"
            >
              Ngarko të Gjitha ({pendingCount} skedarë)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
