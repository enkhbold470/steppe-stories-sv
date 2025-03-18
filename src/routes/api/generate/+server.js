import { json } from '@sveltejs/kit';
import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '$env/static/private';

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY
});

export async function POST({ request }) {
  console.log("[API] Story generation request received");
  try {
    const { genre, keywords, wordLength } = await request.json();
    console.log("[API] Request parameters:", { genre, keywords, wordLength });
    
    const prompt = `Write a ${genre} story about ${keywords} that is approximately ${wordLength} words long.`;
    console.log("[API] Generated prompt:", prompt);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log("[API] Initializing Anthropic stream");
          const stream = await anthropic.messages.create({
            model: "claude-3-5-haiku-latest",
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }],
            stream: true
          });

          let fullStory = "";
          const startTime = Date.now();
          let chunkCount = 0;

          console.log("[API] Starting to process stream chunks");
          for await (const chunk of stream) {
            chunkCount++;
            if (chunk.type === 'content_block_delta') {
              const text = chunk.delta.text;
              fullStory += text;
              
              // Send the content as a proper JSON object
              const contentChunk = JSON.stringify({
                type: 'content',
                content: text
              });
              
              controller.enqueue(encoder.encode(contentChunk + '\n'));
              
              // Log every 10th chunk to avoid flooding the console
              if (chunkCount % 10 === 0) {
                console.log(`[API] Processed ${chunkCount} chunks, latest text: "${text.substring(0, 30)}..."`);
              }
            }
          }

          const totalTime = (Date.now() - startTime) / 1000;
          const wordCount = fullStory.trim().split(/\s+/).length;
          const tokenCount = wordCount * 1.3;
          const cost = tokenCount * 0.000015;

          console.log("[API] Stream completed, sending stats");
          console.log("[API] Stats:", { totalTime, wordCount, tokenCount, cost });

          // Generate a title from the first few words
          const titleText = fullStory.split('.')[0].substring(0, 40).trim() + "...";
          
          // Send stats as JSON
          const stats = JSON.stringify({
            type: 'stats',
            totalTokens: Math.round(tokenCount),
            cost: cost,
            time: totalTime,
            totalWords: wordCount
          });
          
          // Send title as JSON
          const title = JSON.stringify({
            type: 'title',
            title: titleText
          });
          
          // Send completion signal as JSON
          const complete = JSON.stringify({
            type: 'complete'
          });

          controller.enqueue(encoder.encode('\n' + stats + '\n'));
          controller.enqueue(encoder.encode('\n' + title + '\n'));
          controller.enqueue(encoder.encode('\n' + complete + '\n'));
          controller.close();
          
          console.log("[API] Response completed successfully");
        } catch (error) {
          console.error('[API] Stream processing error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
      }
    });

  } catch (error) {
    console.error('[API] Failed to generate story:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to generate story' },
      { status: 500 }
    );
  }
}