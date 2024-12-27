export async function parseAmazonUrl(url: string) {
  try {
    const response = await fetch(`/api/parse-amazon?url=${encodeURIComponent(url)}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to parse Amazon URL');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error parsing Amazon URL:', error);
    throw error;
  }
}
