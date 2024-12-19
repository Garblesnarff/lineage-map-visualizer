import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple text to vector function using character frequency
function textToVector(text: string): number[] {
  const vector = new Array(128).fill(0);
  const normalizedText = text.toLowerCase();
  
  for (let i = 0; i < normalizedText.length; i++) {
    const charCode = normalizedText.charCodeAt(i) % 128;
    vector[charCode] += 1;
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => magnitude ? val / magnitude : 0);
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
      if (!description) return new Array(128).fill(0);
      return textToVector(description);
    });

    console.log('Successfully generated embeddings');

    return new Response(
      JSON.stringify({ embeddings }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error generating embeddings:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});