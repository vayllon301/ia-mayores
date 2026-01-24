# Voice Interaction Feature Documentation

## Overview
This document describes the implementation of voice interaction functionality in the IA-Mayores chatbot application.

## Features Implemented

### 1. Voice Recording
- Users can click the microphone button (🎤) to start recording their voice
- While recording, the button changes to a stop button (⏹️) with a red pulsing background
- A recording indicator appears above the input area showing "Grabando..."
- Users click the stop button to end the recording and send it for processing

### 2. Voice API Integration
- Voice messages are sent to: `menteviva-bwc9ejdthjhsfecn.swedencentral-01.azurewebsites.net/voice`
- Audio is recorded in WebM format and sent as form data
- The API processes the audio and returns transcribed text

### 3. User Experience
- Transcribed messages are displayed with a microphone emoji (🎤) to indicate they came from voice input
- The transcribed text is automatically sent to the chat API for a response
- Visual feedback throughout the entire process (recording indicator, loading states)
- Error handling with user-friendly messages

## Technical Implementation

### Files Created/Modified

#### 1. `/app/api/voice/route.ts` (NEW)
- API route that handles voice message processing
- Receives audio files via FormData
- Forwards audio to the external voice API
- Returns transcribed text to the client
- Includes timeout handling (60 seconds) and error management

#### 2. `/app/chatbot/page.tsx` (MODIFIED)
- Added state management for voice recording:
  - `isRecording`: tracks recording state
  - `mediaRecorder`: MediaRecorder instance
  - `audioChunks`: stores audio data during recording
  
- New functions:
  - `startRecording()`: Initializes MediaRecorder and begins audio capture
  - `stopRecording()`: Stops recording and triggers processing
  - `sendVoiceMessage()`: Sends audio to voice API and handles response
  - `handleVoiceClick()`: Toggles recording on/off
  - `sendTextMessage()`: Refactored to be reusable for both text and voice messages

- UI enhancements:
  - Recording indicator with pulsing red dot
  - Dynamic microphone button (changes from 🎤 to ⏹️)
  - Updated help text to guide users
  - Visual feedback with animations

#### 3. `/app/api/chat/route.ts` (FIXED)
- Fixed undefined `baseUrl` variable bug (changed to `backendUrl`)

## API Flow

### Voice Message Flow
```
User clicks mic button
    ↓
Browser requests microphone permission
    ↓
Recording starts (MediaRecorder API)
    ↓
User clicks stop button
    ↓
Audio blob created (WebM format)
    ↓
Sent to /api/voice (Next.js API route)
    ↓
Forwarded to voice API endpoint
    ↓
Voice API returns transcribed text
    ↓
Text displayed in chat with 🎤 icon
    ↓
Text sent to chat API for AI response
    ↓
AI response displayed to user
```

## Browser Compatibility

### Requirements
- Modern browser with MediaRecorder API support
- Microphone access permissions
- Supported audio formats: WebM

### Supported Browsers
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 14.3+)
- Opera: ✅ Full support

## User Permissions

The application will request microphone access when the user first clicks the voice button. Users must grant permission for the feature to work.

## Error Handling

### Client-Side Errors
- Microphone access denied
- Recording failure
- Network errors
- Timeout errors

### Server-Side Errors
- Voice API unavailable
- Invalid audio format
- Processing failures

All errors are displayed to the user with clear, actionable messages.

## Configuration

### Environment Variables
No additional environment variables needed for voice functionality. The voice API endpoint is hardcoded in the route handler.

### Timeouts
- Voice API requests: 60 seconds (can be adjusted in `/app/api/voice/route.ts`)

## Future Enhancements

Possible improvements:
1. Audio playback of responses (text-to-speech)
2. Visual waveform display during recording
3. Audio format selection (WebM, MP3, etc.)
4. Recording duration indicator
5. Ability to cancel recording without sending
6. Multi-language voice recognition support
7. Voice settings panel (input device selection, volume control)

## Testing

### Manual Testing Checklist
- [ ] Click microphone button starts recording
- [ ] Recording indicator appears and animates
- [ ] Click stop button ends recording and sends audio
- [ ] Transcribed text appears in chat with 🎤 icon
- [ ] AI responds to the transcribed message
- [ ] Error handling works when microphone is denied
- [ ] Error handling works when API is unavailable
- [ ] Button states (disabled during loading)
- [ ] Visual feedback (colors, animations)
- [ ] Mobile responsiveness

## Security Considerations

1. Audio data is transmitted to external API over HTTPS
2. No audio is stored locally or on the server
3. Microphone access requires explicit user permission
4. API route includes timeout protection against hanging requests

## Accessibility

- Proper ARIA labels for voice button states
- Visual indicators for recording state
- Clear user feedback throughout the process
- Keyboard navigation support maintained

## Dependencies

No new npm packages required. Uses built-in browser APIs:
- `MediaRecorder` API for audio recording
- `getUserMedia` API for microphone access
- `FormData` API for file upload
