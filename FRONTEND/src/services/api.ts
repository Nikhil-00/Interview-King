import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadFiles = async (resume: File, jobDescription: File) => {
  const formData = new FormData();
  formData.append('resume', resume);
  formData.append('job_description', jobDescription);

  try {
    console.log('🚀 Starting file upload...');
    console.log('📁 Resume file:', resume.name, resume.size, 'bytes');
    console.log('📄 Job description file:', jobDescription.name, jobDescription.size, 'bytes');
    console.log('🌐 API URL:', `${API_BASE_URL}/upload/`);
    
    // Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log('FormData:', key, value);
    }
    
    const response = await fetch(`${API_BASE_URL}/upload/`, {
      method: 'POST',
      body: formData,
    });

    console.log('📡 Response status:', response.status, response.statusText);
    console.log('📡 Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload failed:', errorText);
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Upload successful! Response data:', data);
    console.log('📊 ATS Score from backend:', data.ats_score);
    console.log('📊 Similarity Score from backend:', data.similarity_score);
    return data;
  } catch (error) {
    console.error('💥 Error uploading files:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to backend server. Please make sure the backend is running on http://localhost:8000');
    }
    throw error;
  }
};

export const sendChatMessage = async (message: string, domain?: string) => {
  try {
    const response = await api.post('/chat/', { message, domain });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
