export async function generateScad(productData: any, mountingRequirements: any) {
  try {
    const response = await fetch('/api/generate-scad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productData,
        mountingRequirements,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to generate SCAD');
    }

    const data = await response.json();
    return data.scadCode;
  } catch (error) {
    console.error('Error generating SCAD:', error);
    throw error;
  }
}
