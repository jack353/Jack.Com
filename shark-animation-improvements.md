# Shark Animation Improvements

## Current Implementation Analysis

The current shark animation consists of three main components:

1. **Horizontal Swimming Motion** (`bruceSwim` in `animations.js`):
   - Moves the `#bruceTank` container from 80vh to -210vh
   - Takes 15 seconds to complete one cycle
   - Uses `easeInOutSine` easing
   - Flips the shark image between `bruce.png` and `bruceReverse.png` at each end

2. **Vertical Bobbing Motion** (`bruceBob` in `animations.js`):
   - Moves the shark up and down by 3vh
   - Takes 750ms per cycle
   - Uses `easeInOutSine` easing

3. **Click Interaction** (`bruceClick` in `bruceRoutine.js`):
   - Pauses swimming animation
   - Starts a jumping animation (`bruceJump`)
   - Triggers bubble popping effect
   - Returns to swimming after 3 seconds

## Proposed Improvements

### 1. Smoother Swimming Motion

**Issues with current implementation:**
- Abrupt direction changes when flipping images
- Linear movement between positions doesn't feel natural
- Fixed timing doesn't respond to user interaction

**Improvements:**
- Use `easeInOutQuad` or `easeInOutCubic` for more natural acceleration/deceleration
- Implement curved swimming paths instead of straight lines
- Add slight rotation effects for more fluid movement

### 2. Cursor Tracking Implementation

**New functionality:**
- Add mouse movement event listeners to track cursor position
- Calculate distance between shark and cursor
- Adjust swimming speed based on cursor proximity
- Implement direction changes that follow cursor movement

### 3. Attack Behavior with Snapping Animation

**Trigger conditions:**
- When cursor moves rapidly (velocity detection)
- When cursor is within a certain distance of the shark
- When cursor hovers over the shark for a specific duration

**Attack sequence:**
1. Increase swimming speed (2-3x normal speed)
2. Direct shark toward cursor position
3. Play snapping animation (jaw movement)
4. Return to normal swimming after attack

## Technical Implementation Plan

### File Modifications Required

1. **js/animations.js**:
   - Replace `bruceSwim` animation with cursor-responsive version
   - Add new snapping animation for attack behavior
   - Implement smoother easing functions

2. **js/bruceRoutine.js**:
   - Add mouse tracking functionality
   - Implement attack trigger logic
   - Add velocity detection for cursor movement

3. **index.html**:
   - Add mouse tracking attributes (if needed)

### New Animation Sequences

#### Smooth Swimming Animation
```javascript
let bruceSwim = anime({
    targets: ['#bruceTank'],
    translateX: {
        value: ['80vh', '-210vh'],
        easing: 'easeInOutQuad'  // Smoother than easeInOutSine
    },
    loop: true,
    duration: 12000,  // Slightly faster for more dynamic feel
    direction: 'alternate',
    update: function(anim) {
        // Update shark direction based on movement
        updateSharkDirection(anim);
    }
});
```

#### Cursor Tracking Animation
```javascript
function trackCursor(cursorX, cursorY) {
    // Calculate distance between shark and cursor
    const sharkRect = document.getElementById('bruceTank').getBoundingClientRect();
    const sharkX = sharkRect.left + sharkRect.width / 2;
    const sharkY = sharkRect.top + sharkRect.height / 2;
    
    const distance = Math.sqrt(Math.pow(cursorX - sharkX, 2) + Math.pow(cursorY - sharkY, 2));
    
    // Adjust speed based on distance
    if (distance < 200) {
        // Speed up when cursor is close
        bruceSwim.speed = 3;
        // Trigger attack if cursor is very close
        if (distance < 50) {
            triggerAttack(cursorX, cursorY);
        }
    } else {
        // Normal speed when cursor is far
        bruceSwim.speed = 1;
    }
}
```

#### Attack Animation Sequence
```javascript
function triggerAttack(cursorX, cursorY) {
    // Pause normal swimming
    bruceSwim.pause();
    
    // Animate shark toward cursor
    anime({
        targets: ['#bruceTank'],
        translateX: cursorX - 100, // Adjust for shark size
        translateY: cursorY - 50,  // Adjust for shark size
        duration: 500,
        easing: 'easeOutQuad',
        complete: function() {
            // Play snapping animation
            playSnapAnimation();
            
            // Return to swimming after delay
            setTimeout(() => {
                bruceSwim.play();
            }, 1000);
        }
    });
}
```

## Implementation Steps

1. Add mouse movement event listeners to track cursor position
2. Implement distance calculation between shark and cursor
3. Modify swimming speed based on cursor proximity
4. Create attack trigger conditions
5. Implement snapping animation for attack behavior
6. Add smooth direction changes for more natural movement
7. Test and refine animations for optimal user experience

## Performance Considerations

- Use `requestAnimationFrame` for smooth cursor tracking
- Implement throttling for mouse move events to prevent performance issues
- Cache DOM element positions to minimize layout thrashing
- Use CSS transforms instead of changing position properties directly