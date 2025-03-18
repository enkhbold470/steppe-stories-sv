import { json } from '@sveltejs/kit';
import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '$env/static/private';

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY
});

export async function POST({ request }) {
  try {
    const { genre, keywords, wordLength } = await request.json();
    const prompt = `Write a ${genre} story about ${keywords} that is approximately ${wordLength} words long.`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const stream = await anthropic.messages.create({
            model: "claude-3-5-haiku-latest",
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }],
            stream: true
          });

          let fullStory = "";
          const startTime = Date.now();

          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta') {
              const text = chunk.delta.text;
              fullStory += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          const totalTime = (Date.now() - startTime) / 1000;
          const wordCount = fullStory.trim().split(/\s+/).length;
          const tokenCount = wordCount * 1.3;
          const cost = tokenCount * 0.000015;

          const stats = {
            type: 'stats',
            tokensUsed: Math.round(tokenCount),
            cost: cost,
            time: totalTime,
            totalWords: wordCount
          };

          controller.enqueue(encoder.encode('\n' + JSON.stringify(stats) + '\n'));
          controller.close();
        } catch (error) {
          console.error('Stream processing error:', error);
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
    console.error('Failed to generate story:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to generate story' },
      { status: 500 }
    );
  }
}