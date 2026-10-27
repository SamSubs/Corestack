export const formatImageUrl = (imagePath) => {
  if (!imagePath) return 'https://placehold.co/400x400/f3f4f6/a1a1aa?text=Sem+Imagem';
  
  // Usar VITE_API_URL (removendo o /api se existir para pegar a raiz do host)
  const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');
  
  return `${apiUrl}${imagePath}`;
};
