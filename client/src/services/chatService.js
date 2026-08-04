import api from './api';

export const sendMessage = async (message, chatId) => {
  const { data } = await api.post('/chat', { message, chatId });
  return data;
};

export const getChats = async () => {
  const { data } = await api.get('/chat');
  return data;
};

export const getChatById = async (id) => {
  const { data } = await api.get(`/chat/${id}`);
  return data;
};

export const deleteChat = async (id) => {
  const { data } = await api.delete(`/chat/${id}`);
  return data;
};