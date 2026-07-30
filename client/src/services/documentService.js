import api from './api';

export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data;
};

export const getDocuments = async () => {
  const { data } = await api.get('/documents');
  return data;
};

export const getDocumentStatus = async (id) => {
  const { data } = await api.get(`/documents/${id}`);
  return data;
};

export const deleteDocument = async (id) => {
  const { data } = await api.delete(`/documents/${id}`);
  return data;
};