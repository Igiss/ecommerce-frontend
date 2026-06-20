const fetch = require('node-fetch'); // Next.js polyfills fetch natively but in raw node we can use native fetch on node 18+

async function test() {
  const baseUrl = 'http://localhost:3000';
  const path = '/products/ly-thuy-tinh';
  
  try {
    const response = await fetch(`${baseUrl}/api${path}`);
    if (!response.ok) {
      console.log('Error', response.status, await response.text());
      return;
    }
    const data = await response.json();
    console.log('Success:', data.slug);
  } catch(e) {
    console.log('Fetch error:', e);
  }
}

test();
