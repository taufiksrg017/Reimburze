import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FileText } from 'lucide-react';

export default function SecureFile({ file }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const isPdf = file.file_type === 'application/pdf';

  useEffect(() => {
    let isMounted = true;

    api.get(file.file_path, {
      responseType: 'blob',
      baseURL: '',
    })
      .then(res => {
        if (isMounted) {
          const url = URL.createObjectURL(res.data);
          setBlobUrl(url);
        }
      })
      .catch(err => console.error('Gagal memuat file', err));

    return () => {
      isMounted = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [file.file_path]);

  // Loading skeleton
  if (!blobUrl) {
    return (
      <div className="w-40 h-40 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl" />
    );
  }

  // PDF
  if (isPdf) {
    return (
      <a
        href={blobUrl}
        target="_blank"
        rel="noreferrer"
        className="block relative group overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700"
      >
        <div className="w-40 h-40 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
          <FileText size={40} className="text-red-500 dark:text-red-400 mb-2" />
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 px-2 text-center truncate w-full">
            {file.original_name || 'Dokumen PDF'}
          </span>
        </div>
      </a>
    );
  }

  // Gambar
  return (
    <a
      href={blobUrl}
      target="_blank"
      rel="noreferrer"
      className="block relative group overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700"
    >
      <img
        src={blobUrl}
        alt="nota"
        className="w-40 h-40 object-cover group-hover:scale-105 transition-transform"
      />
    </a>
  );
}