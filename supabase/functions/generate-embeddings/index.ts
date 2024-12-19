import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple TF-IDF like vectorization
function generateEmbedding(text: string): number[] {
  // Normalize and tokenize text
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);

  // Create word frequency map
  const wordFreq = new Map<string, number>();
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });

  // Convert frequencies to vector (using log scaling)
  const vector: number[] = Array.from(wordFreq.values())
    .map(freq => Math.log(1 + freq));

  // Pad or truncate to fixed dimension (384 to match original model)
  const targetDim = 384;
  if (vector.length < targetDim) {
    return [...vector, ...new Array(targetDim - vector.length).fill(0)];
  }
  return vector.slice(0, targetDim);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { descriptions } = await req.json();

    if (!Array.isArray(descriptions)) {
      throw new Error('Descriptions must be an array');
    }

    console.log(`Processing ${descriptions.length} descriptions`);

    // Generate embeddings for all descriptions
    const embeddings = descriptions.map(description => {
      if (!description) return new Array(384).fill(0);
      return generateEmbedding(description);
    });

    console.log('Successfully generated embeddings');

    return new Response(
      JSON.stringify({ embeddings }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating embeddings:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});