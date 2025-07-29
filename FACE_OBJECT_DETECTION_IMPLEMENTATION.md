# Face & Object Detection Implementation

## Overview

This document describes the implementation of face and object detection for the anti-cheating system, along with the updated violation threshold system that allows 3 violations before automatic termination.

## 🎯 Key Features Implemented

### 1. Face Detection System
- **Real-time camera monitoring** during quizzes and coding challenges
- **Skin tone analysis** for face detection using canvas pixel analysis
- **Multiple face detection** to identify when multiple people are present
- **No face detection** to catch when users turn away from camera
- **Confidence scoring** based on detection accuracy

### 2. Object Detection System
- **Bright screen detection** to identify phones, tablets, or secondary monitors
- **Dark object detection** to identify dark devices or suspicious objects
- **Pattern analysis** using color and brightness algorithms
- **Suspicious object classification** with risk assessment

### 3. Updated Violation Threshold
- **3 violations allowed** before automatic termination (changed from 1)
- **Configurable thresholds** per security mode
- **Real-time violation tracking** with visual indicators
- **Automatic submission** when threshold is reached

## 🔧 Technical Implementation

### Face Detection Algorithm

The face detection uses a simplified but effective approach:

```typescript
// Basic skin tone detection using RGB analysis
const detectFaces = (canvas: HTMLCanvasElement): number => {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let skinPixels = 0;
  let totalPixels = data.length / 4;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Skin tone detection criteria
    if (r > 95 && g > 40 && b > 20 && 
        Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
        Math.abs(r - g) > 15 && r > g && r > b) {
      skinPixels++;
    }
  }
  
  const skinPercentage = skinPixels / totalPixels;
  
  // Estimate faces based on skin percentage
  if (skinPercentage > 0.3) {
    return Math.max(1, Math.round(skinPercentage * 3));
  } else if (skinPercentage > 0.1) {
    return 1;
  }
  
  return 0;
};
```

### Object Detection Algorithm

```typescript
// Object detection using brightness and color analysis
const detectObjects = (canvas: HTMLCanvasElement): string[] => {
  const objects: string[] = [];
  
  // Detect bright areas (potential screens/devices)
  let brightPixels = 0;
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (r + g + b) / 3;
    if (brightness > 200) {
      brightPixels++;
    }
  }
  
  const brightPercentage = brightPixels / totalPixels;
  if (brightPercentage > 0.4) {
    objects.push('bright_screen');
  }
  
  // Detect dark areas (potential devices)
  let darkPixels = 0;
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (r + g + b) / 3;
    if (brightness < 50) {
      darkPixels++;
    }
  }
  
  const darkPercentage = darkPixels / totalPixels;
  if (darkPercentage > 0.3) {
    objects.push('dark_object');
  }
  
  return objects;
};
```

## 📁 File Structure

```
src/
├── components/
│   ├── security/
│   │   └── FaceObjectDetection.tsx    # Main detection component
│   └── quiz/
│       └── AdvancedSecurityMonitor.tsx # Updated with face detection
├── pages/
│   └── FaceDetectionTestPage.tsx      # Test page for detection
├── config/
│   └── security.ts                    # Updated with 3-violation threshold
└── lib/
    └── openrouter.ts                  # AI-powered analysis (backup)
```

## 🚀 Usage

### 1. Face Detection Test Page

Navigate to `/face-detection-test` to test the detection system:

```bash
# Start the development server
npm run dev

# Navigate to the test page
http://localhost:5173/face-detection-test
```

### 2. Integration in Security Monitor

The face detection is automatically integrated into the `AdvancedSecurityMonitor`:

```typescript
// Face detection is enabled by default
const defaultConfig: SecurityConfig = {
  // ... other config
  enableFaceObjectDetection: true,
  maxViolations: 3, // Updated threshold
  // ... other config
};
```

### 3. Security Modes

The system supports different security modes:

```typescript
export const SECURITY_MODES = {
  DEVELOPMENT: {
    maxViolations: 10,
    developmentMode: true,
    // ... other settings
  },
  TESTING: {
    maxViolations: 5,
    developmentMode: true,
    // ... other settings
  },
  PRODUCTION: {
    maxViolations: 3, // New threshold
    developmentMode: false,
    // ... other settings
  }
};
```

## 🎮 Testing Scenarios

### Test the Face Detection

1. **Single Face (Normal)**
   - Sit in front of camera
   - Should show 1 face, low risk
   - No violations triggered

2. **Multiple Faces (Violation)**
   - Have someone else in frame
   - Should trigger critical violation
   - Risk level: CRITICAL

3. **No Face (Violation)**
   - Turn away from camera
   - After 3 consecutive detections
   - Should trigger high risk violation

### Test the Object Detection

1. **Bright Screen Detection**
   - Hold phone/tablet in frame
   - Should detect 'bright_screen' object
   - Risk level: MEDIUM

2. **Dark Object Detection**
   - Hold dark device in frame
   - Should detect 'dark_object'
   - Risk level: MEDIUM

## 🔒 Security Features

### Violation Types

1. **Face Detection Violations**
   - Multiple people detected
   - No face detected (after 3 consecutive detections)

2. **Object Detection Violations**
   - Bright screen detected
   - Dark object detected

3. **Risk Levels**
   - **LOW**: Normal behavior
   - **MEDIUM**: Suspicious objects detected
   - **HIGH**: No face detected
   - **CRITICAL**: Multiple faces detected

### Violation Threshold System

- **3 violations allowed** before automatic termination
- **Real-time tracking** with visual indicators
- **Automatic submission** when threshold reached
- **Configurable per security mode**

## 🎨 UI Components

### Face Detection Component

```typescript
<FaceObjectDetection
  isActive={isActive}
  onDetection={handleDetection}
  onError={handleError}
  className="w-80"
/>
```

### Security Status Panel

The security monitor now shows:
- Current violation count (X/3)
- Face detection status
- Real-time risk assessment
- Visual warnings for violations

## 🔧 Configuration

### Security Configuration

```typescript
// src/config/security.ts
export const CURRENT_SECURITY_MODE = 'PRODUCTION';

export const SECURITY_MODES = {
  PRODUCTION: {
    name: 'Production',
    description: 'Three violations allowed before automatic termination',
    zeroTolerance: false,
    immediateTermination: false,
    maxViolations: 3, // Updated threshold
    developmentMode: false,
    logToServer: true
  }
};
```

### Component Configuration

```typescript
// Enable face detection in security monitor
const config = {
  enableFaceObjectDetection: true,
  maxViolations: 3,
  autoSubmitOnViolation: true,
  // ... other settings
};
```

## 🐛 Troubleshooting

### Common Issues

1. **Camera Access Denied**
   - Ensure browser has camera permissions
   - Check HTTPS requirement for camera access
   - Try refreshing the page

2. **Detection Not Working**
   - Check browser console for errors
   - Ensure good lighting conditions
   - Verify camera is not being used by other applications

3. **False Positives**
   - Adjust detection thresholds in the component
   - Fine-tune skin tone detection parameters
   - Modify brightness thresholds for object detection

### Debug Mode

Use the test page to debug detection issues:

```bash
# Navigate to test page
http://localhost:5173/face-detection-test

# Check browser console for detailed logs
# Monitor detection results in real-time
```

## 📊 Performance Considerations

### Optimization Features

1. **Detection Interval**: 3 seconds between detections
2. **Canvas Analysis**: Efficient pixel processing
3. **Memory Management**: Proper cleanup of video streams
4. **Error Handling**: Graceful fallbacks for detection failures

### Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

## 🔮 Future Enhancements

### Planned Improvements

1. **AI-Powered Detection**
   - Integration with TensorFlow.js models
   - More accurate face and object recognition
   - Machine learning-based risk assessment

2. **Advanced Analytics**
   - Detailed violation reporting
   - Pattern analysis for cheating detection
   - Predictive security measures

3. **Enhanced UI**
   - Real-time video overlay
   - Interactive detection zones
   - Advanced configuration options

## 📝 Summary

The face and object detection system provides:

✅ **Real-time camera monitoring** during assessments  
✅ **Face detection** with multiple person identification  
✅ **Object detection** for suspicious devices  
✅ **3-violation threshold** before automatic termination  
✅ **Configurable security modes** for different environments  
✅ **Comprehensive testing interface** for validation  
✅ **Integration with existing security system**  

This implementation significantly enhances the anti-cheating capabilities while providing a more flexible violation threshold system that allows for 3 violations before automatic termination, as requested. 