// import { animate, waapi, eases, createSpring } from 'animejs';

//Default Animations
let bubble = anime({
    targets: ['.bubble','.icon'],
    translateY: 30,
    loop: true,
    easing: 'easeInOutSine',
    direction: 'alternate',
})

let bruceBob = anime({
    targets: ['.bruce'],
    translateY: ['0vh', '-3vh'],
    height: ["30vh", "31vh"],
    loop: true,
    easing: 'easeInOutQuad', // Smoother easing for bobbing
    duration: 750,
    direction: 'alternate',
    autoplay: false, // Disabled - shark should only follow cursor
})

// Bruce swimming animation has been removed since shark now follows cursor
// The cursor following is handled in bruceRoutine.js

//Bruce Clicked Animations
let bruceJump = anime({
    targets: ['.bruce'],
    translateY: '-75vh',
    loop: true,
    ease: 'easeInOut',
    duration: 1500,
    direction: 'alternate',
    autoplay: false,
})

let bruceRun = anime({
    targets: ['#bruceTank'],
    translateX: ['30vh', '-180vh'],
    loop: true,
    duration: 750,
    easing: 'easeInOutQuad', // Smoother easing
    direction: 'alternate',
    autoplay: false,
    update: function(anim) {
        const bruce = document.getElementById('bruce');
        // Going right (first half)
        if (anim.progress < 50) {
            bruce.src = "assets/pngs/bruceMouthOpen.png";
        }
        // Going left (second half)
        else if (anim.progress > 50) {
            bruce.src = "assets/pngs/bruceMouthOpenReverse.png";
        }
    }
})

// New attack animation - snapping motion
let bruceAttack = anime({
    targets: ['.bruce'],
    scaleX: [
        {value: 1.5, duration: 500, easing: 'easeInOutQuad'},
        {value: 1, duration: 300, easing: 'easeOutQuad'}
    ],
    scaleY: [
        {value: 1.5, duration: 500, easing: 'easeInOutQuad'},
        {value: 1, duration: 300, easing: 'easeOutQuad'}
    ],
    autoplay: false,
    complete: function(anim) {
        const bruce = document.getElementById('bruce');
        bruce.src = bruce.src.includes('Reverse') ? 'assets/pngs/bruceReverse.png' : 'assets/pngs/bruce.png';
        hasAttacked = false; // Reset attack flag after animation completes
    }
})

// New animation for chasing cursor (not used in simplified version)
let bruceChase = anime({
    targets: ['#bruceTank'],
    translateX: '0vw',
    translateY: '0vh',
    duration: 500,
    easing: 'easeOutQuad',
    autoplay: false,
})