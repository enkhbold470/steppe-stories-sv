import { json } from '@sveltejs/kit';
import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '$env/static/private';
import { countWords } from 'alfaaz'; // Import alfaaz word counter

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY
});

// Function to create improved prompts for continuation
function createContinuationPrompt(genre, keywords, wordLength, currentStory, remainingWords) {
  return `Continue this ${genre} story about ${keywords}. 
  
Here's what has been written so far:

${currentStory}

Continue the story from exactly where it left off. Write approximately ${remainingWords} more words to reach the target length of ${wordLength} words total. Maintain the same tone, perspective, and style as the existing text.`;
}

export async function POST({ request }) {
  console.log("[API] Story generation request received");
  try {
    const { genre, keywords, wordLength } = await request.json();
    console.log("[API] Request parameters:", { genre, keywords, wordLength });
    
    // Initialize tracking variables
    let fullStory = "";
    let currentWordCount = 0;
    const targetWordCount = wordLength;
    let apiCallCount = 0;
    const allApiCalls = [];
    const totalStartTime = Date.now();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log("[API] Beginning multi-call story generation process");
          
          // Continue making API calls until we reach the target word count or max calls
          while (currentWordCount < targetWordCount && apiCallCount < 5) {
            apiCallCount++;
            const callStartTime = Date.now();
            
            // Create appropriate prompt based on whether this is the first call or a continuation
            let prompt;
            if (apiCallCount === 1) {
              prompt = `Write a ${genre} story about ${keywords} that is approximately ${wordLength} words long.`;
            } else {
              const remainingWords = targetWordCount - currentWordCount;
              prompt = createContinuationPrompt(genre, keywords, wordLength, fullStory, remainingWords);
            }
            
            console.log(`[API] Call #${apiCallCount} - Starting with ${currentWordCount}/${targetWordCount} words`);
            console.log(`[API] Call #${apiCallCount} - Generated prompt: ${prompt.substring(0, 150)}...`);
            console.log(`[API] Call #${apiCallCount} - Initializing Anthropic stream`);
            
            const stream = await anthropic.messages.create({
              model: "claude-3-5-sonnet-20240620",
              max_tokens: 4096,
              messages: [{ role: "user", content: prompt }],
              stream: true
            });

            let callChunks = 0;
            let callContent = "";
            
            console.log(`[API] Call #${apiCallCount} - Starting to process stream chunks`);
            
            for await (const chunk of stream) {
              callChunks++;
              
              if (chunk.type === 'content_block_delta') {
                const delta = chunk.delta;
                if ('text' in delta) {
                  const text = delta.text;
                  
                  // Add to both the call content and full story
                  callContent += text;
                  fullStory += text;
                  
                  // Update word count using alfaaz
                  currentWordCount = countWords(fullStory);
                  
                  // Send the content to the frontend with progress info
                  const contentChunk = JSON.stringify({
                    type: 'content',
                    content: text,
                    currentWords: currentWordCount,
                    targetWords: targetWordCount,
                    progress: Math.min(Math.round((currentWordCount / targetWordCount) * 100), 99),
                    apiCall: apiCallCount
                  });
                  
                  controller.enqueue(encoder.encode(contentChunk + '\n'));
                  
                  // Log progress periodically
                  if (callChunks % 10 === 0) {
                    console.log(`[API] Call #${apiCallCount} - Processed ${callChunks} chunks, latest text: "${text.substring(0, 30)}..."`);
                    console.log(`[API] Call #${apiCallCount} - Current progress: ${currentWordCount}/${targetWordCount} words (${Math.round((currentWordCount / targetWordCount) * 100)}%)`);
                  }
                } else {
                  console.log(`[API] Call #${apiCallCount} - Received non-text delta:`, delta);
                }
              } else {
                console.log(`[API] Call #${apiCallCount} - Received non-content chunk type: ${chunk.type}`);
              }
            }
            
            // Calculate and log statistics for this API call
            const callDuration = (Date.now() - callStartTime) / 1000;
            const callWordCount = countWords(callContent);
            const estimatedTokens = callContent.length / 4; // rough estimate
            const estimatedCost = estimatedTokens * 0.000015;
            
            const callStats = {
              callNumber: apiCallCount,
              wordCount: callWordCount,
              tokensUsed: Math.round(estimatedTokens),
              duration: callDuration,
              cost: estimatedCost
            };
            
            allApiCalls.push(callStats);
            
            console.log(`[API] Call #${apiCallCount} - Completed in ${callDuration.toFixed(2)} seconds`);
            console.log(`[API] Call #${apiCallCount} - Generated ${callWordCount} words (${Math.round(estimatedTokens)} tokens)`);
            console.log(`[API] Call #${apiCallCount} - Estimated cost: $${estimatedCost.toFixed(6)}`);
            console.log(`[API] Overall progress: ${currentWordCount}/${targetWordCount} words (${Math.round((currentWordCount / targetWordCount) * 100)}%)`);
            
            // Send intermediate call stats to frontend
            const callStatsChunk = JSON.stringify({
              type: 'callStats',
              stats: callStats,
              overallProgress: Math.round((currentWordCount / targetWordCount) * 100)
            });
            
            controller.enqueue(encoder.encode(callStatsChunk + '\n'));
            
            // If we've reached at least 90% of target, we can stop to avoid excessive generation
            if (currentWordCount >= targetWordCount * 0.9) {
              console.log(`[API] Reached ${currentWordCount}/${targetWordCount} words (${Math.round((currentWordCount / targetWordCount) * 100)}%), which is sufficient`);
              break;
            }
          }

          // Calculate final statistics
          const totalDuration = (Date.now() - totalStartTime) / 1000;
          const totalTokens = allApiCalls.reduce((sum, call) => sum + call.tokensUsed, 0);
          const totalCost = allApiCalls.reduce((sum, call) => sum + call.cost, 0);
          
          console.log("[API] All generation calls completed");
          console.log(`[API] Total calls made: ${apiCallCount}`);
          console.log(`[API] Final word count: ${currentWordCount}/${targetWordCount}`);
          console.log(`[API] Total tokens used: ${totalTokens}`);
          console.log(`[API] Total generation time: ${totalDuration.toFixed(2)} seconds`);
          console.log(`[API] Total estimated cost: $${totalCost.toFixed(6)}`);

          // Generate a title from the first sentence
          const titleText = fullStory.split('.')[0].substring(0, 40).trim() + "...";
          
          // Send final stats as JSON
          const stats = JSON.stringify({
            type: 'stats',
            totalTokens: totalTokens,
            totalWords: currentWordCount,
            targetWords: targetWordCount, 
            totalTime: totalDuration,
            totalCost: totalCost,
            callsMade: apiCallCount,
            individualCalls: allApiCalls,
            completionPercentage: Math.round((currentWordCount / targetWordCount) * 100)
          });
          
          // Send title
          const title = JSON.stringify({
            type: 'title',
            title: titleText
          });
          
          // Send completion signal
          const complete = JSON.stringify({
            type: 'complete',
            finalWordCount: currentWordCount,
            targetWordCount: targetWordCount
          });

          // Send all final information to frontend
          controller.enqueue(encoder.encode('\n' + stats + '\n'));
          controller.enqueue(encoder.encode('\n' + title + '\n'));
          controller.enqueue(encoder.encode('\n' + complete + '\n'));
          controller.close();
          
          console.log("[API] Response completed successfully");
          
          // Task completed: Update API to track accurate word count during generation ✓
          // Task completed: Implement multi-call generation until word count requirement is met ✓
          // Task completed: Enhance prompt engineering for continuation calls ✓
          // Task completed: Add separate logging for each API call made ✓
          // Task completed: Track and display statistics for each API call ✓
          
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