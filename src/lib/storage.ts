import { supabase } from './supabase';

type StorageBucket = 'product-images' | 'marketing-files' | 'internal-files';

export async function getSignedUrl(bucket: StorageBucket, path: string, expiresIn = 60): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) { console.error(`签名URL失败 [${bucket}/${path}]:`, error.message); return null; }
  return data.signedUrl;
}

export function getPublicUrl(bucket: StorageBucket, path: string): string {
  if (!supabase) return '';
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function downloadFile(bucket: StorageBucket, path: string, filename: string): Promise<boolean> {
  const signedUrl = await getSignedUrl(bucket, path, 60);
  if (!signedUrl) return false;
  const a = document.createElement('a'); a.href = signedUrl; a.download = filename; a.style.display = 'none';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  return true;
}

export async function uploadFile(bucket: StorageBucket, folderPath: string, file: File): Promise<{ path: string; error: string | null }> {
  if (!supabase) return { path: '', error: 'Supabase 未配置' };
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
  const fullPath = `${folderPath}/${fileName}`;
  const { error } = await supabase.storage.from(bucket).upload(fullPath, file, { cacheControl: '3600', upsert: false });
  if (error) return { path: '', error: error.message };
  return { path: fullPath, error: null };
}

export async function deleteFile(bucket: StorageBucket, path: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) { console.error(`删除文件失败 [${bucket}/${path}]:`, error.message); return false; }
  return true;
}
