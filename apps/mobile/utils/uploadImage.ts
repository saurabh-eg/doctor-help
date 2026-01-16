import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001/api';

const uploadFormData = async (endpoint: string, token: string, formData: FormData) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Uploading to URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        // Do not set Content-Type to let RN set boundary
      },
      body: formData,
    });

    console.log('Upload response status:', response.status);
    const data = await response.json();
    console.log('Upload response data:', data);
    
    if (data.success && data.url) return data.url as string;
    throw new Error(data.error || 'Upload failed');
  } catch (error) {
    console.error('Upload network error:', error);
    throw error;
  }
};

export async function pickAndUploadImage(token: string): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission to access media library is required!');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  const uri = asset.uri;
  const fileName = uri.split('/').pop() || 'photo.jpg';
  const fileType = asset.type || 'image/jpeg';

  const formData = new FormData();
  formData.append('photo', {
    uri,
    name: fileName,
    type: fileType,
  } as any);

  try {
    console.log('Uploading photo to:', `${API_BASE_URL}/doctors/upload-photo`);
    return await uploadFormData('/doctors/upload-photo', token, formData);
  } catch (err: any) {
    console.error('Image upload error:', err);
    alert(err?.message || 'Image upload failed');
    return null;
  }
}

export async function pickAndUploadDocument(token: string): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  const uri = asset.uri;
  const fileName = asset.name || uri.split('/').pop() || 'document';
  const fileType = asset.mimeType || 'application/octet-stream';

  const formData = new FormData();
  formData.append('document', {
    uri,
    name: fileName,
    type: fileType,
  } as any);

  try {
    console.log('Uploading document to:', `${API_BASE_URL}/doctors/upload-document`);
    return await uploadFormData('/doctors/upload-document', token, formData);
  } catch (err: any) {
    console.error('Document upload error:', err);
    alert(err?.message || 'Document upload failed');
    return null;
  }
}
