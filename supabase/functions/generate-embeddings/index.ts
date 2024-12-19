import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { pipeline } from "npm:@huggingface/transformers";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Create a feature-extraction pipeline
    const extractor = await pipeline(
      "feature-extraction",
      "mixedbread-ai/mxbai-embed-xsmall-v1",
      { device: "cpu" }
    );

    // Generate embeddings for all descriptions
    const embeddings = await Promise.all(
      descriptions.map(async (description) => {
        if (!description) return null;
        
        const output = await extractor(description, { 
          pooling: "mean", 
          normalize: true 
        });
        
        return output.tolist();
      })
    );

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