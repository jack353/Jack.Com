function changeSource(bubble){
    let icon = document.getElementById("icon"+bubble);
    bubble = document.getElementById(bubble);

    icon.style.visibility = 'hidden';
    bubble.src = "assets/pngs/pop.png";


    setTimeout(() => {bubble.src = "assets/pngs/bigBubble.png";
        bubble.style.visibility = 'visible';
        icon.style.visibility = 'visible';}, 1200);
}

function openResume(){
    changeSource(0);
    setTimeout(() => {window.open("assets/Resume-Jack-Ciroli.pdf", "_blank");}, 250);
}

function openGithub(){
    changeSource(1);
    setTimeout(() => {window.open("https://github.com/jack353", "_blank");}, 250);
}

function openLinkedIn(){
    changeSource(2);
    setTimeout(() => {window.open("https://www.linkedin.com/in/jack-ciroli/", "_blank");}, 250);
}