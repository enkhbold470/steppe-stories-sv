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