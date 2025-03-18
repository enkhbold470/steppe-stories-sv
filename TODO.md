# Steppe Stories SvelteKit Project - TODO List

- [x] Create a responsive navigation bar
- [x] Fix story generator with separate URL for signed-in users
- [x] Implement direct navigation to story generator for logged in users
- [x] Add progress bar during story generation
- [x] Show word count, tokens used, token per second rate, and cost
- [x] Implement user stories page to view story history
- [x] Add MD file preview for generated stories
- [x] Create user profile page showing:
  - [x] User ID
  - [x] Username
  - [x] Account creation date
  - [x] Logout button
- [x] Connect sign in/sign out functionality using existing Auth component
- [x] Ensure responsive design for mobile and desktop using Tailwind CSS

## New Requirements
- [x] Add download button for generated stories
- [x] Add copy button for easy copying of generated stories
- [x] Add selectable options below keywords and prompts
- [x] Convert home screen to a landing page

## Bug Fixes
- [x] Fix story generation streaming issues
  - [x] Format API response as proper JSON objects
  - [x] Add robust JSON parsing in frontend
  - [x] Implement fallback for plaintext content
  - [x] Add better error handling
- [x] Add extensive debugging logs
  - [x] Add console logs to API server
  - [x] Add console logs to frontend
  - [x] Log stream processing details

## Latest Requirements
- [x] Fix story saving to database
  - [x] Debug database saving procedure with console logs
  - [x] Ensure correct field mapping to database schema
  - [x] Handle errors properly
- [x] Improve story generator layout
  - [x] Center story parameters card initially
  - [x] Move parameters to left when generating
  - [x] Add canvas-like display on the right side
  - [x] Keep all existing features (stats, download, copy)
- [x] Add more animations
  - [x] Add transitions for layout changes
  - [x] Add loading animations
  - [x] Improve visual feedback



# Updated TODO List
[x] Install and import alfaaz word counter library
[x] Update API to track word count during generation
[x] Implement logic to continue calling Claude API until word count is met
[x] Ensure only one response is sent to frontend
[x] Improve prompt engineering for better story generation
[x] Add detailed console logging throughout the process
[x] Add generation time metrics to story statistics
[x] Update stats response to include word count from alfaaz
[x] Store generation time metadata with stories
[x] Add progress tracking for multiple API calls
[x] Handle error cases properly
[x] Implement proper streaming of content chunks
[x] Optimize API calls to minimize token usage
[x] Add generation timing for individual API calls
[x] Ensure proper JSON formatting for frontend consumption
