// Variables to track mouse position
let mouseX = Math.floor(window.innerWidth / 2); // Start at center
let mouseY = Math.floor(window.innerHeight / 2);
let followInterval;
let hasAttacked = false; // Add flag to track if attack has happened
let isMovingRight = false; // Track Bruce's direction
let bruceWidth = 0;
let bruceHeight = 0;

// Initialize Bruce's dimensions
function initBruceDimensions() {
    const bruce = document.getElementById('bruce');
    bruce.onload = function() {
        bruceWidth = this.naturalWidth;
        bruceHeight = this.naturalHeight;
        console.log('Bruce dimensions initialized:', { width: bruceWidth, height: bruceHeight });
    }
    // In case image is already loaded
    if (bruce.complete) {
        bruceWidth = bruce.naturalWidth;
        bruceHeight = bruce.naturalHeight;
        console.log('Bruce dimensions initialized (already loaded):', { width: bruceWidth, height: bruceHeight });
    }
}

// Track mouse movement
document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Make shark constantly move toward cursor position
function startFollowingCursor() {
    followInterval = setInterval(function() {
        const bruceTank = document.getElementById('bruceTank');
        const bruce = document.getElementById('bruce');
        const bruceRect = bruceTank.getBoundingClientRect();
        
        // Adjust reference point based on shark direction
        // For normal bruce.png (facing right), use right side of image as reference (head)
        // For bruceReverse.png (facing left), use right side of image as reference (head)
        let bruceX, bruceY;
        if (bruce.src.indexOf("bruceReverse.png") > -1) {
            // Shark facing left - head is on the right side of the reversed image
//             bruceX = bruceRect.            left + bruce.naturalWidth;
            bruceX = bruceRect.left + bruce.naturalWidth / 2;
            bruceY = bruceRect.top + bruce.naturalHeight * 0.6; // Adjusted to center vertically
        }
        else {
            // Shark facing right - head is on the right side of the image
            bruceX = bruceRect.right + bruce.naturalWidth / 2;
            bruceY = bruceRect.top + bruce.naturalHeight * 0.6;
        }
        
        // Calculate direction to cursor
        const deltaX = mouseX - bruceX;
        const deltaY = mouseY - bruceY;
        
        // Calculate speed multiplier based on proximity
        const speedMultiplier = (Math.abs(deltaX) < bruce.naturalWidth * 1.25 && Math.abs(deltaY) < bruce.naturalHeight / 1.25) ? 5 : 1.5;
        
        // Move shark toward cursor with variable speed
        const moveX = deltaX * 0.005 * speedMultiplier;
        const moveY = deltaY * 0.005 * speedMultiplier;  
      // Get current position from transform
        const currentTransform = bruceTank.style.transform || 'translateX(0px) translateY(0px)';
        let currentTranslateX = 0;
        let currentTranslateY = 0;
        
        // Extract current translateX and translateY values
        const translateXMatch = currentTransform.match(/translateX\((-?[0-9.]+)px\)/);
        const translateYMatch = currentTransform.match(/translateY\((-?[0-9.]+)px\)/);
        if (translateXMatch) {
            currentTranslateX = parseFloat(translateXMatch[1]) || 0;
        }
        if (translateYMatch) {
            currentTranslateY = parseFloat(translateYMatch[1]) || 0;
        }
        
        // Update position
        const newTranslateX = currentTranslateX + moveX;
        const newTranslateY = currentTranslateY + moveY;
        bruceTank.style.transform = `translateX(${newTranslateX}px) translateY(${newTranslateY}px)`;
        
        // Get Bruce's center position
        const bruceCenterX = bruceRect.left + bruce.naturalWidth / 2;

        // console.log('Bruce Left:', bruceRect.left);  
        // console.log('Bruce Width:', bruce.naturalWidth);

        // Update shark direction based on cursor position relative to center
        if (mouseX > bruceCenterX && !isMovingRight) {
            bruce.src = "assets/pngs/bruceReverse.png";
            isMovingRight = true;
        } else if (mouseX < bruceCenterX && isMovingRight) {
            bruce.src = "assets/pngs/bruce.png";
            isMovingRight = false;
        }
        
        // Attack if cursor is very close and hasn't attacked yet
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (Math.abs(deltaX) < bruce.naturalWidth * 1.25 && Math.abs(deltaY) < bruce.naturalHeight / 1.25 && !hasAttacked) {
            bruce.src = isMovingRight ? "assets/pngs/bruceMouthOpenReverse.png" : "assets/pngs/bruceMouthOpen.png";
            bruceAttack.complete = () => {
                bruce.src = isMovingRight ? "assets/pngs/bruceReverse.png" : "assets/pngs/bruce.png";
                bruceTank.style.transform = `translateX(${0}px) translateY(${0}px)`;
                hasAttacked = false;
            };
            bruceAttack.restart();
            hasAttacked = true;
        }
    }, 20); // Update every 20ms for smooth movement
}

// Reset the attack flag when following cursor starts
document.addEventListener('DOMContentLoaded', function() {
    hasAttacked = false;
    startFollowingCursor();
});

async function bruceClick(){
    hasAttacked = false;
    // Clear the following interval temporarily
    clearInterval(followInterval);

    bruce.src = "assets/pngs/bruceMouthOpen.png"
    
    bruceRun.restart();
    bruceJump.restart();

    popAll();

    setTimeout(() => {
        bruceRun.pause();
        bubble.restart
        bruceJump.pause();

        bruce.src = "assets/pngs/bruce.png";

        // Restart following cursor
        startFollowingCursor();
    }, 3000);
}

// Add delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function popAll(){
    let bubbles = document.getElementsByClassName("bubble");
    for (bubble of bubbles) {
        popBubble(bubble.id);
        await delay(100); // 100ms delay between each pop
    }
    // Array.prototype.forEach.call(bubbles, function(bubble) {
    //     popBubble(bubble.id, 3000);
    //     await delay(100); // 100ms delay between each pop
    // });
}

function popBubble(bubble){
    let icon = document.getElementById("icon"+bubble);
    bubble = document.getElementById(bubble);

    setTimeout(() => {
        icon.style.visibility = 'hidden';
        bubble.src = "assets/pngs/pop.png";
        setTimeout(() => {bubble.style.visibility = 'hidden';}, getRandomInt(500));
    }, getRandomInt(250));

    setTimeout(() => {bubble.src = "assets/pngs/bigBubble.png";
        bubble.style.visibility = 'visible';
        icon.style.visibility = 'visible';}, 3000);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}