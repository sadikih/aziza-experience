const line1 = document.getElementById("line1");
const line2 = document.getElementById("line2");
const enterBtn = document.getElementById("enterBtn");
const music = document.getElementById("bgMusic");

const experience = document.getElementById("experience");
const vaultGrid = document.getElementById("vaultGrid");
const displayCard = document.getElementById("displayCard");
const displayText = document.getElementById("displayText");
const finalScene = document.getElementById("finalScene");

const text1 = "This is not a birthday message.";
const text2 = "It is an experience.";

function createParticles() {
    for (let i = 0; i < 25; i++) {
        const p = document.createElement("div");
        p.classList.add("particle");

        p.style.left = Math.random() * 100 + "vw";
        p.style.animationDuration = (4 + Math.random() * 4) + "s";
        p.style.opacity = Math.random();

        document.body.appendChild(p);

        setTimeout(() => {
            p.remove();
        }, 8000);
    }

    setInterval(createParticles, 2000);
}

function typeText(el, text, cb) {
    let i = 0;
    const interval = setInterval(() => {
        el.textContent += text[i];
        i++;
        if (i === text.length) {
            clearInterval(interval);
            if (cb) cb();
        }
    }, 50);
}

window.onload = () => {
    typeText(line1, text1, () => {
        typeText(line2, text2);
    });
};

enterBtn.addEventListener("click", () => {

    music.volume = 0;
    music.play();

    let v = 0;
    const fade = setInterval(() => {
        if (v < 1) {
            v += 0.05;
            music.volume = v;
        } else {
            clearInterval(fade);
        }
    }, 100);

document.querySelector(".intro-screen").style.opacity = "0";

setTimeout(() => {
    document.querySelector(".intro-screen").style.display = "none";
}, 800);    experience.classList.remove("hidden");

    createVault();
    createParticles();
});

const messages = [
    "Your smile is unforgettable.",
    "You carry yourself with grace.",
    "Your mind is beautiful.",
    "You are deeply thoughtful.",
    "You make conversations effortless.",
    "You are incredibly driven.",
    "You have a calming presence.",
    "You are naturally elegant.",
    "You notice small details.",
    "You are emotionally intelligent.",
    "You inspire ambition.",
    "You are easy to talk to.",
    "You are quietly confident.",
    "You are rare.",
    "You are appreciated more than you know.",
    "You are strong-hearted.",
    "You are kind.",
    "You are unforgettable.",
    "You bring peace into chaos.",
    "You are interesting.",
    "You are worth knowing.",
    "You are special.",
    "You matter.",
    "Happy 24th Birthday Aziza Hussein."
];

function createVault() {
    vaultGrid.innerHTML = "";

    for (let i = 0; i < 24; i++) {
        const btn = document.createElement("div");
        btn.classList.add("vault-num");
        btn.innerText = i + 1;

        btn.addEventListener("click", () => {

            displayCard.innerText = i + 1;
            displayText.innerText = messages[i];

            document.querySelectorAll(".vault-num").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            displayCard.style.transform = "scale(1.3)";
            setTimeout(() => displayCard.style.transform = "scale(1)", 150);

            if (i === 23) if (i === 23) {

    setTimeout(() => {

    experience.style.transition = "opacity 1.2s ease";
    experience.style.opacity = "0";

    setTimeout(() => {
        experience.classList.add("hidden");

        finalScene.classList.remove("hidden");

        const content = finalScene.querySelector(".final-content");
        content.style.opacity = "0";

        setTimeout(() => {
            content.style.transition = "opacity 1.5s ease";
            content.style.opacity = "1";

            startFinalTyping();

        }, 800);

    }, 1200);

}, 1000);
}
        });

        vaultGrid.appendChild(btn);
    }
}
function startFinalTyping() {
    const el = document.getElementById("finalText");

    const lines = [
        "This was not just 24 messages.",
        "It was 24 moments where I tried to put into words what I probably fail to explain properly.",
        "",
        "Some of these are serious.",
        "Some are a bit dramatic.",
        "Some are me clearly overthinking life.",
        "",
        "But all of them point to one thing:",
        "I am really glad I got to know you.",
        "",
        "And if this made you smile even a little, then I consider this mission successful."
    ];

    el.innerHTML = "";

    let i = 0;

    function showNextLine() {
        if (i >= lines.length) return;

        const line = document.createElement("div");
        line.style.marginTop = "10px";
        line.textContent = lines[i];

        line.style.opacity = "0";
        line.style.transform = "translateY(6px)";
        line.style.transition = "all 0.4s ease";

        el.appendChild(line);

        requestAnimationFrame(() => {
            line.style.opacity = "1";
            line.style.transform = "translateY(0)";
        });

        i++;
        setTimeout(showNextLine, 650);
    }

    showNextLine();
}

document.addEventListener("click", (e) => {
    if (e.target.id === "replayBtn") {
        location.reload();
    }
});