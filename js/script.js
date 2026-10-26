/* =========================================================
   For Aziza ♡ — the motion, the music, the little moments
   ========================================================= */

gsap.registerPlugin(SplitText, CustomEase, MotionPathPlugin);

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduceMotion) gsap.globalTimeline.timeScale(3);

CustomEase.create("silk", "0.22, 1, 0.36, 1");
CustomEase.create("heartbeat", "M0,0 C0.08,0 0.1,1 0.18,1 0.26,1 0.28,0.25 0.36,0.25 0.44,0.25 0.46,0.85 0.54,0.85 0.7,0.85 0.8,0 1,0");

const $ = (id) => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const centerOf = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

const PINKS = ["#ff6f91", "#ffc4d1", "#ff9cb3", "#d63a63", "#ffe6eb"];
const GOLDS = ["#f3c98b", "#ffe7bf", "#fff7f2"];

/* ---------------------------------------------------------
   Words
   --------------------------------------------------------- */

const introLines = [
    "This is not a birthday message.",
    "<span class=\"accent\">It is an experience.</span>",
    "Twenty-four little hearts are waiting for you, one for every year you've made this world a little softer.",
    "Each one is holding something I've wanted to tell you.",
    "Take your time. Open them slowly."
];

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
    "Happy 24th Birthday, <span class=\"accent\">Aziza Hussein.</span>"
];

const finalLines = [
    "This was not just 24 messages.",
    "It was 24 moments where I tried to put into words what I probably fail to explain properly.",
    "Some of these are serious. Some are a bit dramatic. Some are me clearly overthinking life.",
    "But all of them point to one thing:",
    "<span class=\"accent\">I am really glad I got to know you.</span>",
    "And if this made you smile even a little, then I consider this mission successful.",
    "<span class=\"signoff\">Happy birthday, Aziza ♡</span>"
];

/* ---------------------------------------------------------
   Sound — a little music box, built in the browser.
   If assets/music/music.mp3 exists it plays instead of the
   generated ambience.
   --------------------------------------------------------- */

const Sound = (() => {
    let ctx, master, musicBus, sfxBus, ambientTimer, nextNote = 0, step = 0;
    let muted = false;
    let usingFile = false;
    const audioEl = $("bgMusic");
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

    // IV – V – iii – vi : the progression that always feels like remembering
    const progression = [
        { pad: [53, 57, 60, 64], arp: [65, 69, 72, 76, 77, 76, 72, 69] },
        { pad: [55, 59, 62, 67], arp: [67, 71, 74, 79, 74, 71, 74, 79] },
        { pad: [52, 55, 59, 62], arp: [64, 67, 71, 74, 76, 74, 71, 67] },
        { pad: [57, 60, 64, 67], arp: [69, 72, 76, 81, 79, 76, 72, 76] }
    ];
    const EIGHTH = 0.42;

    function impulse(seconds, decay) {
        const len = ctx.sampleRate * seconds;
        const buf = ctx.createBuffer(2, len, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const d = buf.getChannelData(ch);
            for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
        }
        return buf;
    }

    function init() {
        if (ctx) return ctx;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : 0.85;
        master.connect(ctx.destination);

        const reverb = ctx.createConvolver();
        reverb.buffer = impulse(3.4, 2.4);
        const wet = ctx.createGain();
        wet.gain.value = 0.5;
        reverb.connect(wet).connect(master);

        musicBus = ctx.createGain();
        musicBus.gain.value = 0;
        musicBus.connect(master);
        musicBus.connect(reverb);

        sfxBus = ctx.createGain();
        sfxBus.gain.value = 0.7;
        sfxBus.connect(master);
        sfxBus.connect(reverb);

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) ctx.suspend();
            else if (!muted) ctx.resume();
        });
        return ctx;
    }

    function bell(midi, t, vel = 0.25, dest = musicBus, len = 2.8) {
        [[1, 1], [2, 0.3], [3.01, 0.1], [4.2, 0.05]].forEach(([ratio, amp]) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = "sine";
            o.frequency.value = hz(midi) * ratio;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(vel * amp, t + 0.005);
            g.gain.exponentialRampToValueAtTime(0.0001, t + len / ratio);
            o.connect(g).connect(dest);
            o.start(t);
            o.stop(t + len + 0.05);
        });
    }

    function pad(notes, t, len, vel = 0.03, dest = musicBus) {
        notes.forEach((m) => {
            [-7, 7].forEach((det) => {
                const o = ctx.createOscillator();
                const f = ctx.createBiquadFilter();
                const g = ctx.createGain();
                o.type = "triangle";
                o.frequency.value = hz(m);
                o.detune.value = det;
                f.type = "lowpass";
                f.frequency.value = 1100;
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(vel, t + len * 0.35);
                g.gain.linearRampToValueAtTime(0, t + len);
                o.connect(f).connect(g).connect(dest);
                o.start(t);
                o.stop(t + len + 0.05);
            });
        });
    }

    function noise(len) {
        const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        return src;
    }

    function scheduleAmbient() {
        while (nextNote < ctx.currentTime + 0.4) {
            const bar = Math.floor(step / 8) % progression.length;
            const beat = step % 8;
            const chord = progression[bar];
            if (beat === 0) {
                pad(chord.pad, nextNote, EIGHTH * 8 + 0.6);
                bell(chord.pad[0] - 12, nextNote, 0.12, musicBus, 4);
            }
            if (beat === 0 || Math.random() > 0.22) {
                bell(chord.arp[beat], nextNote + rand(0, 0.02), rand(0.07, 0.14));
            }
            nextNote += EIGHTH;
            step++;
        }
    }

    function startAmbient() {
        init();
        if (!ctx) return;
        ctx.resume();
        audioEl.volume = 0;
        audioEl.play().then(() => {
            usingFile = true;
            gsap.to(audioEl, { volume: muted ? 0 : 0.8, duration: 3 });
        }).catch(() => {
            nextNote = ctx.currentTime + 0.1;
            ambientTimer = setInterval(scheduleAmbient, 120);
            scheduleAmbient();
            musicBus.gain.linearRampToValueAtTime(1, ctx.currentTime + 4);
        });
    }

    function duck(level, seconds = 1.5) {
        if (!ctx) return;
        if (usingFile) gsap.to(audioEl, { volume: muted ? 0 : 0.8 * level, duration: seconds });
        else {
            musicBus.gain.cancelScheduledValues(ctx.currentTime);
            musicBus.gain.setValueAtTime(musicBus.gain.value, ctx.currentTime);
            musicBus.gain.linearRampToValueAtTime(level, ctx.currentTime + seconds);
        }
    }

    const ladder = [67, 69, 72, 74, 76, 79, 81, 84, 86, 88, 91, 93];

    return {
        init,
        get ctx() { return ctx; },
        startAmbient,
        duck,
        toggle() {
            muted = !muted;
            if (ctx) {
                master.gain.cancelScheduledValues(ctx.currentTime);
                master.gain.linearRampToValueAtTime(muted ? 0 : 0.85, ctx.currentTime + 0.3);
                if (!muted) ctx.resume();
            }
            if (usingFile) audioEl.muted = muted;
            return muted;
        },
        chime(n) {
            if (!ctx) return;
            const t = ctx.currentTime;
            const m = ladder[n % ladder.length];
            bell(m, t, 0.32, sfxBus, 3.2);
            bell(m - 5, t + 0.07, 0.12, sfxBus, 2.4);
        },
        cascade() {
            if (!ctx) return;
            const t = ctx.currentTime;
            ladder.concat(ladder.map((m) => m + 12)).forEach((m, i) => bell(m, t + i * 0.06, 0.16, sfxBus, 2.2));
            pad([60, 64, 67, 71, 74], t, 5, 0.035, sfxBus);
        },
        sparkle(count = 7) {
            if (!ctx) return;
            const t = ctx.currentTime;
            for (let i = 0; i < count; i++) bell(pick([84, 86, 88, 91, 93, 96]), t + i * rand(0.04, 0.09), 0.09, sfxBus, 1.6);
        },
        pop() {
            if (!ctx) return;
            const t = ctx.currentTime;
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.frequency.setValueAtTime(520, t);
            o.frequency.exponentialRampToValueAtTime(110, t + 0.18);
            g.gain.setValueAtTime(0.4, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            o.connect(g).connect(sfxBus);
            o.start(t);
            o.stop(t + 0.25);
        },
        whoosh(len = 1.3) {
            if (!ctx) return;
            const t = ctx.currentTime;
            const src = noise(len);
            const f = ctx.createBiquadFilter();
            const g = ctx.createGain();
            f.type = "bandpass";
            f.Q.value = 0.8;
            f.frequency.setValueAtTime(250, t);
            f.frequency.exponentialRampToValueAtTime(2600, t + len * 0.6);
            f.frequency.exponentialRampToValueAtTime(600, t + len);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.22, t + len * 0.5);
            g.gain.linearRampToValueAtTime(0, t + len);
            src.connect(f).connect(g).connect(sfxBus);
            src.start(t);
        },
        puff() {
            if (!ctx) return;
            const t = ctx.currentTime;
            const src = noise(0.6);
            const f = ctx.createBiquadFilter();
            const g = ctx.createGain();
            f.type = "lowpass";
            f.frequency.value = 700;
            g.gain.setValueAtTime(0.35, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
            src.connect(f).connect(g).connect(sfxBus);
            src.start(t);
        },
        ignite() {
            if (!ctx) return;
            const t = ctx.currentTime;
            const src = noise(0.5);
            const f = ctx.createBiquadFilter();
            const g = ctx.createGain();
            f.type = "highpass";
            f.frequency.setValueAtTime(400, t);
            f.frequency.linearRampToValueAtTime(1800, t + 0.3);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.12, t + 0.06);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
            src.connect(f).connect(g).connect(sfxBus);
            src.start(t);
            bell(91, t + 0.05, 0.06, sfxBus, 1.2);
        },
        happyBirthday() {
            if (!ctx) return 0;
            const beat = 0.56;
            const song = [
                [67, 0.75], [67, 0.25], [69, 1], [67, 1], [72, 1], [71, 2],
                [67, 0.75], [67, 0.25], [69, 1], [67, 1], [74, 1], [72, 2],
                [67, 0.75], [67, 0.25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2.5],
                [77, 0.75], [77, 0.25], [76, 1], [72, 1], [74, 1], [72, 3.5]
            ];
            const chords = [[0, [48, 55, 64]], [5, [43, 55, 62, 65]], [12, [43, 55, 62, 65]], [17, [48, 55, 64]],
                [24, [48, 55, 64]], [28.5, [53, 57, 65]], [32.5, [48, 55, 64]], [34.5, [43, 55, 62]], [36.5, [48, 55, 64, 72]]];
            let t = ctx.currentTime + 0.4;
            const start = t;
            song.forEach(([m, d]) => {
                bell(m + 12, t, 0.26, sfxBus, 3);
                bell(m, t, 0.08, sfxBus, 2);
                t += d * beat;
            });
            chords.forEach(([b, notes], i) => {
                const next = chords[i + 1] ? chords[i + 1][0] : b + 4;
                pad(notes, start + b * beat, (next - b) * beat + 0.8, 0.03, sfxBus);
            });
            return t - ctx.currentTime;
        },
        warmth() {
            if (!ctx) return;
            const t = ctx.currentTime;
            pad([53, 60, 64, 67, 72], t, 6, 0.045, sfxBus);
            [72, 76, 79, 84, 88].forEach((m, i) => bell(m, t + 0.15 + i * 0.16, 0.18, sfxBus, 3.5));
        },
        swell() {
            if (!ctx) return () => {};
            const t = ctx.currentTime;
            const o = ctx.createOscillator();
            const o2 = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = "sine";
            o2.type = "sine";
            o.frequency.setValueAtTime(hz(60), t);
            o.frequency.exponentialRampToValueAtTime(hz(72), t + 2.4);
            o2.frequency.setValueAtTime(hz(67), t);
            o2.frequency.exponentialRampToValueAtTime(hz(76), t + 2.4);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.09, t + 2.2);
            o.connect(g);
            o2.connect(g);
            g.connect(sfxBus);
            o.start(t);
            o2.start(t);
            return () => {
                const n = ctx.currentTime;
                g.gain.cancelScheduledValues(n);
                g.gain.setValueAtTime(g.gain.value, n);
                g.gain.linearRampToValueAtTime(0, n + 0.4);
                o.stop(n + 0.45);
                o2.stop(n + 0.45);
            };
        }
    };
})();

$("soundBtn").addEventListener("click", () => {
    const muted = Sound.toggle();
    $("soundBtn").classList.toggle("is-muted", muted);
    $("soundBtn").setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
});

/* ---------------------------------------------------------
   Canvases — the night sky behind, the sparkles in front
   --------------------------------------------------------- */

function heartPath(c, x, y, s) {
    c.beginPath();
    c.moveTo(x, y + s * 0.35);
    c.bezierCurveTo(x - s * 0.62, y - s * 0.02, x - s * 0.42, y - s * 0.62, x, y - s * 0.24);
    c.bezierCurveTo(x + s * 0.42, y - s * 0.62, x + s * 0.62, y - s * 0.02, x, y + s * 0.35);
    c.closePath();
}

const Sky = (() => {
    const sky = $("sky");
    const fx = $("fx");
    const sc = sky.getContext("2d");
    const fc = fx.getContext("2d");
    let w = 0, h = 0, dpr = 1;
    let stars = [], floaters = [], shooting = [], parts = [];
    let px = 0, py = 0, tpx = 0, tpy = 0;
    let heartTarget = 16;
    let last = performance.now();
    let nextShoot = 3;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = window.innerWidth;
        h = window.innerHeight;
        [sky, fx].forEach((c) => {
            c.width = w * dpr;
            c.height = h * dpr;
        });
        sc.setTransform(dpr, 0, 0, dpr, 0, 0);
        fc.setTransform(dpr, 0, 0, dpr, 0, 0);
        const n = Math.round((w * h) / 7000);
        stars = Array.from({ length: n }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: rand(0.3, 1.4),
            depth: rand(0.2, 1),
            phase: Math.random() * Math.PI * 2,
            speed: rand(0.6, 2.2),
            warm: Math.random() < 0.3
        }));
    }

    function newFloater(anywhere) {
        return {
            x: Math.random() * w,
            y: anywhere ? Math.random() * h : h + 40,
            s: rand(8, 26),
            vy: rand(10, 28),
            sway: rand(10, 40),
            phase: Math.random() * Math.PI * 2,
            alpha: rand(0.08, 0.28),
            depth: rand(0.3, 1),
            color: pick(["255,111,145", "255,196,209", "243,201,139", "214,58,99"])
        };
    }

    function emit(p) {
        if (parts.length < 900) parts.push(p);
    }

    function burst(x, y, opts = {}) {
        const {
            count = 26,
            colors = PINKS,
            speed = 260,
            hearts = 0.5,
            gravity = 220,
            life = 1.6,
            size = [6, 14]
        } = opts;
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2;
            const v = speed * rand(0.35, 1);
            emit({
                x, y,
                vx: Math.cos(a) * v,
                vy: Math.sin(a) * v - speed * 0.25,
                g: gravity,
                life: life * rand(0.6, 1.1),
                max: life,
                s: rand(size[0], size[1]),
                rot: rand(-0.6, 0.6),
                spin: rand(-3, 3),
                heart: Math.random() < hearts,
                color: pick(colors)
            });
        }
    }

    function sparkle(x, y, n = 2, colors = GOLDS) {
        for (let i = 0; i < n; i++) {
            emit({
                x: x + rand(-4, 4),
                y: y + rand(-4, 4),
                vx: rand(-30, 30),
                vy: rand(-40, 10),
                g: 40,
                life: rand(0.5, 1),
                max: 1,
                s: rand(1.5, 3.5),
                heart: false,
                color: pick(colors)
            });
        }
    }

    function frame(now) {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        const t = now / 1000;
        px += (tpx - px) * 0.04;
        py += (tpy - py) * 0.04;

        // the night
        sc.clearRect(0, 0, w, h);
        for (const s of stars) {
            const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * s.speed + s.phase));
            sc.globalAlpha = tw * (0.4 + s.depth * 0.6);
            sc.fillStyle = s.warm ? "#ffe7bf" : "#ffeef2";
            sc.beginPath();
            sc.arc(s.x + px * s.depth * 14, s.y + py * s.depth * 14, s.r, 0, Math.PI * 2);
            sc.fill();
        }

        // drifting hearts
        while (floaters.length < heartTarget) floaters.push(newFloater(floaters.length < 6));
        sc.shadowBlur = 14;
        for (let i = floaters.length - 1; i >= 0; i--) {
            const f = floaters[i];
            f.y -= f.vy * dt;
            const x = f.x + Math.sin(t * 0.6 + f.phase) * f.sway + px * f.depth * 24;
            sc.globalAlpha = f.alpha * Math.min(1, (h + 40 - f.y) / 120);
            sc.fillStyle = `rgb(${f.color})`;
            sc.shadowColor = `rgba(${f.color},0.8)`;
            sc.save();
            sc.translate(x, f.y + py * f.depth * 24);
            sc.rotate(Math.sin(t + f.phase) * 0.25);
            heartPath(sc, 0, 0, f.s);
            sc.fill();
            sc.restore();
            if (f.y < -40) floaters.splice(i, 1);
        }
        sc.shadowBlur = 0;

        // shooting stars
        nextShoot -= dt;
        if (nextShoot <= 0 && !reduceMotion) {
            shooting.push({ x: rand(w * 0.2, w), y: rand(0, h * 0.4), life: 1, len: rand(80, 180) });
            nextShoot = rand(4, 10);
        }
        for (let i = shooting.length - 1; i >= 0; i--) {
            const s = shooting[i];
            s.life -= dt * 1.1;
            s.x -= 520 * dt;
            s.y += 260 * dt;
            const g = sc.createLinearGradient(s.x, s.y, s.x + s.len, s.y - s.len / 2);
            g.addColorStop(0, `rgba(255,240,220,${Math.max(s.life, 0)})`);
            g.addColorStop(1, "rgba(255,240,220,0)");
            sc.globalAlpha = 1;
            sc.strokeStyle = g;
            sc.lineWidth = 1.6;
            sc.beginPath();
            sc.moveTo(s.x, s.y);
            sc.lineTo(s.x + s.len, s.y - s.len / 2);
            sc.stroke();
            if (s.life <= 0) shooting.splice(i, 1);
        }
        sc.globalAlpha = 1;

        // sparkles, bursts, trails
        fc.clearRect(0, 0, w, h);
        fc.globalCompositeOperation = "lighter";
        for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i];
            p.life -= dt;
            if (p.life <= 0) {
                parts.splice(i, 1);
                continue;
            }
            p.vx *= 0.985;
            p.vy = p.vy * 0.985 + p.g * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            const a = Math.min(1, p.life / (p.max * 0.5));
            fc.globalAlpha = a;
            fc.fillStyle = p.color;
            if (p.heart) {
                p.rot += p.spin * dt;
                fc.save();
                fc.translate(p.x, p.y);
                fc.rotate(p.rot);
                heartPath(fc, 0, 0, p.s);
                fc.fill();
                fc.restore();
            } else {
                fc.beginPath();
                fc.arc(p.x, p.y, p.s * (0.6 + a * 0.4), 0, Math.PI * 2);
                fc.fill();
            }
        }
        fc.globalCompositeOperation = "source-over";
        fc.globalAlpha = 1;

        requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (e) => {
        tpx = (e.clientX / w - 0.5) * 2;
        tpy = (e.clientY / h - 0.5) * 2;
        if (!reduceMotion) sparkle(e.clientX, e.clientY, e.pointerType === "touch" ? 2 : 1, Math.random() < 0.5 ? GOLDS : PINKS);
    }, { passive: true });

    resize();
    requestAnimationFrame(frame);

    return {
        burst: reduceMotion ? () => {} : burst,
        sparkle,
        set hearts(n) { heartTarget = n; }
    };
})();

/* ---------------------------------------------------------
   Helpers for text that arrives softly
   --------------------------------------------------------- */

function blurIn(el, opts = {}) {
    const split = new SplitText(el, { type: "words", wordsClass: "w" });
    return gsap.from(split.words, {
        opacity: 0,
        y: 14,
        filter: "blur(10px)",
        duration: opts.duration || 1,
        stagger: opts.stagger || 0.06,
        ease: "silk",
        delay: opts.delay || 0,
        onComplete: () => gsap.set(split.words, { clearProps: "filter" })
    });
}

function writeParagraphs(container, lines, pause = 0.5) {
    container.innerHTML = "";
    const tl = gsap.timeline();
    lines.forEach((html) => {
        const p = document.createElement("p");
        p.innerHTML = html;
        p.style.visibility = "hidden";
        container.appendChild(p);
        const words = html.replace(/<[^>]+>/g, "").split(/\s+/).length;
        tl.add(() => {
            p.style.visibility = "visible";
            blurIn(p, { stagger: 0.055 });
        });
        tl.to({}, { duration: Math.min(0.9 + words * 0.11, 3.2) + pause });
    });
    return tl;
}

function scene(id) {
    return $(id);
}

function showScene(el) {
    el.classList.add("is-active");
    el.scrollTop = 0;
}

function hideScene(el) {
    el.classList.remove("is-active");
}

function flash(intensity = 1, duration = 1.4) {
    return gsap.timeline()
        .fromTo($("flash"), { opacity: 0 }, { opacity: intensity, duration: duration * 0.3, ease: "power2.out" })
        .to($("flash"), { opacity: 0, duration: duration * 0.7, ease: "power2.inOut" });
}

/* ---------------------------------------------------------
   1 · The envelope
   --------------------------------------------------------- */

const envelope = $("envelope");
const seal = $("sealBtn");
let envelopeFloat;

function envelopeEntrance() {
    const eyebrow = new SplitText("#sceneEnvelope .eyebrow", { type: "chars", charsClass: "ch" });
    gsap.set(envelope, { transformPerspective: 900 });
    const tl = gsap.timeline({ delay: 0.4 });
    tl.from(eyebrow.chars, { opacity: 0, y: 10, filter: "blur(6px)", stagger: 0.03, duration: 0.8, ease: "silk" })
        .from(envelope, { y: -140, rotationX: 55, rotationZ: -8, opacity: 0, scale: 0.7, duration: 1.8, ease: "elastic.out(1, 0.6)" }, "-=0.4")
        .fromTo(".env-name", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "power2.inOut" }, "-=0.8")
        .from(seal, { scale: 0, rotation: -180, duration: 1, ease: "back.out(2.2)" }, "-=1.1")
        .add(() => {
            seal.classList.add("is-live");
            Sky.burst(centerOf(seal).x, centerOf(seal).y, { count: 14, speed: 140, hearts: 0.3, colors: GOLDS, gravity: 60 });
        })
        .from("#sealHint", { opacity: 0, y: 10, duration: 0.8 }, "-=0.3");

    envelopeFloat = gsap.to(envelope, { y: -12, rotation: -0.8, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 3.2 });
}

let opened = false;
function openEnvelope() {
    if (opened) return;
    opened = true;
    Sound.init();
    Sound.startAmbient();
    Sound.pop();
    Sound.sparkle(9);

    const c = centerOf(seal);
    seal.classList.remove("is-live");
    envelopeFloat.kill();

    const tl = gsap.timeline();
    tl.to(seal, { scale: 0.8, duration: 0.12, ease: "power2.in" })
        .add(() => {
            Sky.burst(c.x, c.y, { count: 46, speed: 340, hearts: 0.7 });
            Sky.burst(c.x, c.y, { count: 24, speed: 200, hearts: 0, colors: GOLDS, life: 1.2 });
        })
        .to(seal, { scale: 1.8, opacity: 0, rotation: 40, duration: 0.45, ease: "power2.out" })
        .to(["#sealHint", "#sceneEnvelope .eyebrow"], { opacity: 0, y: 10, duration: 0.5 }, "<")
        .to(envelope, { y: 0, rotation: 0, scale: 1.05, duration: 0.6, ease: "power2.out" }, "<")
        .to(".env-flap", { rotationX: 180, duration: 1, ease: "power2.inOut", transformPerspective: 900 }, "-=0.2")
        .set(".env-flap", { zIndex: 1 }, "-=0.5")
        .to(".env-name", { opacity: 0, duration: 0.4 }, "<")
        .to(".env-letter", { yPercent: -62, duration: 1.1, ease: "power3.out" }, "-=0.2")
        .add(() => Sound.whoosh(1.6))
        .to(".env-letter", { scale: 1.4, duration: 0.8, ease: "power2.in" }, "+=0.2")
        .to(envelope, { scale: 3.2, opacity: 0, duration: 0.9, ease: "power3.in" }, "<0.2")
        .add(() => flash(1, 1.6), "<0.4")
        .add(() => {
            hideScene(scene("sceneEnvelope"));
            showIntro();
        }, "-=0.2");
}

seal.addEventListener("click", openEnvelope);

/* ---------------------------------------------------------
   1b · The opening letter
   --------------------------------------------------------- */

function showIntro() {
    const el = scene("sceneIntro");
    showScene(el);
    const btn = $("beginBtn");
    gsap.set(btn, { opacity: 0, y: 20, scale: 0.9 });
    const tl = gsap.timeline();
    tl.from(".paper", { y: 80, scale: 0.85, rotation: -3, opacity: 0, duration: 1.4, ease: "silk" })
        .fromTo(".paper-greeting", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power2.inOut" }, "-=0.6")
        .add(writeParagraphs($("introLines"), introLines, 0.35))
        .to(btn, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "back.out(2)" });
}

$("beginBtn").addEventListener("click", () => {
    Sound.whoosh();
    gsap.timeline()
        .to(".paper", { rotationX: 70, y: -120, opacity: 0, scale: 0.9, duration: 0.9, ease: "power3.in", transformPerspective: 1000 })
        .add(() => {
            hideScene(scene("sceneIntro"));
            showHearts();
        });
});

/* ---------------------------------------------------------
   2 · Twenty-four little things
   --------------------------------------------------------- */

const grid = $("heartGrid");
const note = $("note");
const openedSet = new Set();
let heartsWhole = false;
let noteTl;
const HEART_D = "M16 28.5S1 19.6 1 9.3C1 4.6 4.6 1 9 1c3 0 5.6 1.6 7 4 1.4-2.4 4-4 7-4 4.4 0 8 3.6 8 8.3 0 10.3-15 19.2-15 19.2z";

function buildHearts() {
    grid.innerHTML = "";
    messages.forEach((_, i) => {
        const b = document.createElement("button");
        b.className = "heart-btn";
        b.setAttribute("aria-label", `Little thing number ${i + 1}`);
        b.innerHTML = `<svg viewBox="0 0 32 29" aria-hidden="true"><path d="${HEART_D}"/></svg><span>${i + 1}</span>`;
        b.addEventListener("click", () => openHeart(i, b));
        grid.appendChild(b);
    });
}

function showHearts() {
    buildHearts();
    const el = scene("sceneHearts");
    showScene(el);
    const title = new SplitText("#sceneHearts .title", { type: "chars,words", charsClass: "ch" });
    const hearts = grid.querySelectorAll(".heart-btn");

    gsap.timeline()
        .from("#sceneHearts .eyebrow", { opacity: 0, letterSpacing: "0.8em", duration: 1.4, ease: "silk" })
        .from(title.chars, { opacity: 0, y: 40, rotationX: -90, filter: "blur(8px)", stagger: 0.025, duration: 1, ease: "back.out(1.6)", transformPerspective: 600 }, "-=1")
        .from(note, { rotationY: -90, opacity: 0, duration: 1.2, ease: "back.out(1.4)", transformPerspective: 1200 }, "-=0.6")
        .from(hearts, {
            scale: 0,
            rotation: () => rand(-90, 90),
            opacity: 0,
            duration: 0.9,
            ease: "back.out(2.4)",
            stagger: { each: 0.045, grid: [4, 6], from: "center" },
            onComplete: () => gsap.set(hearts, { clearProps: "transform" })
        }, "-=0.8")
        .from(".progress", { opacity: 0, y: 10, duration: 0.6 }, "-=0.3");

    gsap.to(note, { y: -6, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });
}

function openHeart(i, btn) {
    const first = !openedSet.has(i);
    openedSet.add(i);
    Sound.chime(first ? openedSet.size - 1 : i);

    const c = centerOf(btn);
    Sky.burst(c.x, c.y, { count: first ? 22 : 10, speed: 200, hearts: 0.75 });

    grid.querySelectorAll(".is-current").forEach((b) => b.classList.remove("is-current"));
    btn.classList.add("is-open");
    if (!heartsWhole) btn.classList.add("is-current");
    gsap.fromTo(btn.querySelector("svg"), { scale: 1.5 }, { scale: 1, duration: 0.9, ease: "elastic.out(1, 0.35)" });

    // turn the note over, like a card
    if (noteTl) noteTl.progress(1);
    noteTl = gsap.timeline()
        .to(note, { rotationY: 90, duration: 0.32, ease: "power2.in" })
        .add(() => {
            $("noteNum").textContent = i + 1;
            $("noteText").innerHTML = messages[i];
            $("noteSign").textContent = `little thing nº ${i + 1}`;
        })
        .set(note, { rotationY: -90 })
        .to(note, { rotationY: 0, duration: 0.8, ease: "back.out(1.6)" })
        .fromTo("#noteNum", { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.5)" }, "<0.1")
        .add(() => blurIn($("noteText"), { stagger: 0.07, duration: 0.9 }), "<0.1")
        .fromTo("#noteSign", { opacity: 0, letterSpacing: "0.8em" }, { opacity: 1, letterSpacing: "0.3em", duration: 1.2, ease: "silk" }, "<0.3");

    // keep the note in view on small screens
    const r = note.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight) note.scrollIntoView({ behavior: "smooth", block: "center" });

    // progress
    const pct = (openedSet.size / messages.length) * 100;
    $("progressFill").style.width = pct + "%";
    const counter = { n: parseInt($("progressCount").textContent, 10) || 0 };
    gsap.to(counter, { n: openedSet.size, duration: 0.6, snap: { n: 1 }, onUpdate: () => ($("progressCount").textContent = counter.n) });

    if (i === 23) {
        setTimeout(() => {
            confetti({ particleCount: 140, spread: 100, origin: { x: c.x / innerWidth, y: c.y / innerHeight }, colors: PINKS.concat(GOLDS), disableForReducedMotion: true });
        }, 500);
    }

    if (first && openedSet.size === messages.length) setTimeout(heartsBecomeOne, 2400);
}

function heartTargets() {
    const g = grid.getBoundingClientRect();
    const k = Math.min(g.width, g.height * 1.25) / 36;
    const gx = g.left + g.width / 2;
    const gy = g.top + g.height / 2;
    return [...grid.children].map((b, i) => {
        const t = (i / messages.length) * Math.PI * 2 + Math.PI;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const r = b.getBoundingClientRect();
        const bx = r.left + r.width / 2 - (gsap.getProperty(b, "x") || 0);
        const by = r.top + r.height / 2 - (gsap.getProperty(b, "y") || 0);
        return { x: gx + hx * k - bx, y: gy + hy * k - by - k * 2.5 };
    });
}

function heartsBecomeOne() {
    heartsWhole = true;
    const hearts = [...grid.children];
    hearts.forEach((b) => b.classList.remove("is-current"));
    Sound.cascade();

    const targets = heartTargets();
    const tl = gsap.timeline();
    tl.to(hearts, {
        scale: 1.25,
        duration: 0.35,
        stagger: { each: 0.03, from: "start", yoyo: true, repeat: 1 },
        ease: "power2.out"
    })
        .to(hearts, {
            x: (i) => targets[i].x,
            y: (i) => targets[i].y,
            rotation: 0,
            scale: 0.82,
            duration: 1.8,
            ease: "power3.inOut",
            stagger: { each: 0.04, from: "random" }
        })
        .add(() => {
            grid.classList.add("is-whole");
            const c = centerOf(grid);
            Sky.burst(c.x, c.y, { count: 70, speed: 420, hearts: 0.8 });
            Sky.burst(c.x, c.y, { count: 30, speed: 260, hearts: 0, colors: GOLDS });
            Sound.sparkle(12);
            confetti({ particleCount: 90, angle: 60, spread: 70, origin: { x: 0, y: 0.75 }, colors: PINKS, disableForReducedMotion: true });
            confetti({ particleCount: 90, angle: 120, spread: 70, origin: { x: 1, y: 0.75 }, colors: PINKS, disableForReducedMotion: true });
        })
        .to(grid, { scale: 1.08, duration: 1.1, ease: "heartbeat", repeat: 2, transformOrigin: "50% 55%" })
        .add(() => {
            if (noteTl) noteTl.progress(1);
            gsap.timeline()
                .to(note, { rotationY: 90, duration: 0.32, ease: "power2.in" })
                .add(() => {
                    $("noteNum").textContent = "♡";
                    $("noteText").innerHTML = "And those are only twenty-four.<br><span class=\"accent\">I could have kept going.</span>";
                    $("noteSign").textContent = "all of them, for you";
                })
                .set(note, { rotationY: -90 })
                .to(note, { rotationY: 0, duration: 0.9, ease: "back.out(1.6)" })
                .add(() => blurIn($("noteText"), { stagger: 0.09 }), "<");
        }, "-=2")
        .add(() => {
            const btn = $("toCakeBtn");
            btn.hidden = false;
            gsap.from(btn, { scale: 0, opacity: 0, duration: 1, ease: "elastic.out(1, 0.5)" });
        });

    // the shape holds even if the window changes size
    window.addEventListener("resize", () => {
        if (!scene("sceneHearts").classList.contains("is-active")) return;
        gsap.set(hearts, { x: 0, y: 0 });
        const t = heartTargets();
        hearts.forEach((b, i) => gsap.set(b, { x: t[i].x, y: t[i].y }));
    });
}

$("toCakeBtn").addEventListener("click", () => {
    Sound.whoosh();
    gsap.timeline()
        .to(grid.children, { y: "-=120", opacity: 0, scale: 0.4, rotation: () => rand(-60, 60), duration: 0.8, stagger: { each: 0.02, from: "random" }, ease: "power2.in" })
        .to([".hearts-head", ".note-wrap", ".progress", "#toCakeBtn"], { opacity: 0, y: -40, filter: "blur(8px)", duration: 0.7, stagger: 0.08, ease: "power2.in" }, "<0.2")
        .add(() => {
            hideScene(scene("sceneHearts"));
            showCake();
        });
});

/* ---------------------------------------------------------
   3 · Make a wish
   --------------------------------------------------------- */

const candles = [...document.querySelectorAll("[data-candle]")];
let wishMade = false;
let micStream, micRaf;

function showCake() {
    const el = scene("sceneCake");
    showScene(el);
    candles.forEach((c) => c.classList.add("is-out"));
    const title = new SplitText("#sceneCake .title", { type: "chars,words", charsClass: "ch" });

    gsap.timeline()
        .from("#sceneCake .eyebrow", { opacity: 0, y: 10, duration: 0.8 })
        .from(title.chars, { opacity: 0, scale: 2, filter: "blur(12px)", stagger: 0.04, duration: 0.9, ease: "silk" }, "-=0.4")
        .from("#cakeSub", { opacity: 0, duration: 0.8 }, "-=0.3")
        .from(".plate", { scaleX: 0, opacity: 0, duration: 0.7, ease: "back.out(2)" }, "-=0.4")
        .from(".tier", { y: -window.innerHeight * 0.6, opacity: 0, duration: 1, ease: "bounce.out", stagger: { each: 0.28, from: "end" } }, "-=0.2")
        .from(".candle", { y: 60, opacity: 0, duration: 0.8, ease: "back.out(2)", stagger: 0.15 }, "-=0.2")
        .add(() => lightCandle(0), "+=0.2")
        .add(() => lightCandle(1), "+=0.45")
        .from(".cake-actions .btn-ghost", { opacity: 0, y: 16, duration: 0.7 }, "+=0.3");
}

function lightCandle(n) {
    const c = candles[n];
    c.classList.remove("is-out");
    Sound.ignite();
    const p = centerOf(c.querySelector(".flame"));
    Sky.burst(p.x, p.y, { count: 14, speed: 90, hearts: 0, colors: ["#ffd66b", "#fff2d6", "#ff9a3d"], gravity: -60, life: 0.9, size: [1.5, 3.5] });
}

function blowOut(c) {
    if (c.classList.contains("is-out") || wishMade) return;
    c.classList.add("is-out");
    Sound.puff();
    const wick = c.querySelector(".wick").getBoundingClientRect();
    for (let i = 0; i < 7; i++) {
        const s = document.createElement("span");
        s.className = "smoke";
        s.style.position = "fixed";
        s.style.left = wick.left + "px";
        s.style.top = wick.top - 6 + "px";
        s.style.zIndex = 5;
        document.body.appendChild(s);
        gsap.to(s, {
            y: rand(-140, -90),
            x: rand(-30, 30),
            scale: rand(2.5, 4.5),
            opacity: 0,
            duration: rand(1.8, 2.8),
            delay: i * 0.08,
            ease: "power1.out",
            onComplete: () => s.remove()
        });
    }
    if (candles.every((x) => x.classList.contains("is-out"))) setTimeout(makeWish, 600);
}

candles.forEach((c) => c.addEventListener("click", () => blowOut(c)));

$("micBtn").addEventListener("click", async () => {
    const btn = $("micBtn");
    if (micStream) return;
    try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch (e) {
        btn.textContent = "no mic? just tap the flames ♡";
        return;
    }
    const ctx = Sound.init();
    if (!ctx) return;
    ctx.resume();
    btn.textContent = "listening… now blow ♡";
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    ctx.createMediaStreamSource(micStream).connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let loud = 0;
    let cooldown = 0;
    const listen = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 1; i < 40; i++) sum += data[i];
        const level = sum / 39;
        loud = level > 85 ? loud + 1 : Math.max(0, loud - 1);
        if (loud > 5 && performance.now() > cooldown) {
            const lit = candles.filter((c) => !c.classList.contains("is-out"));
            if (lit.length) blowOut(level > 120 ? lit[0] : pick(lit));
            if (level > 120 && lit[1]) setTimeout(() => blowOut(lit[1]), 180);
            cooldown = performance.now() + 450;
            loud = 0;
        }
        if (!wishMade) micRaf = requestAnimationFrame(listen);
    };
    listen();
});

function stopMic() {
    cancelAnimationFrame(micRaf);
    if (micStream) micStream.getTracks().forEach((t) => t.stop());
}

function makeWish() {
    if (wishMade) return;
    wishMade = true;
    stopMic();
    document.body.classList.add("wish-made");
    Sound.duck(0.15, 1.5);

    const cake = $("cake").getBoundingClientRect();
    const from = { x: cake.left + cake.width / 2, y: cake.top - 20 };
    const orb = document.createElement("div");
    orb.className = "wish-orb";
    orb.style.left = from.x + "px";
    orb.style.top = from.y + "px";
    document.body.appendChild(orb);
    const rise = from.y - window.innerHeight * 0.14;

    gsap.timeline()
        .to("#dim", { opacity: 1, duration: 1.6, ease: "power2.inOut" })
        .to(".cake-actions .btn-ghost", { opacity: 0, duration: 0.6 }, "<")
        .to("#cakeSub", { opacity: 0, duration: 0.5 }, "<")
        .add(() => {
            $("cakeSub").textContent = "shh… it's on its way";
            Sound.happyBirthday();
        })
        .to("#cakeSub", { opacity: 1, duration: 1 })
        .fromTo(orb, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: "back.out(3)" }, "<")
        .to(orb, {
            motionPath: { path: [{ x: 0, y: 0 }, { x: -70, y: -rise * 0.3 }, { x: 60, y: -rise * 0.65 }, { x: 0, y: -rise }], curviness: 1.4 },
            duration: 4.2,
            ease: "power1.inOut",
            onUpdate: () => {
                const p = centerOf(orb);
                Sky.sparkle(p.x, p.y, 3);
            }
        })
        .add(() => {
            const p = centerOf(orb);
            orb.remove();
            Sound.sparkle(14);
            Sky.burst(p.x, p.y, { count: 60, speed: 380, hearts: 0.4, colors: GOLDS.concat(PINKS), gravity: 90, life: 2.2 });
            const origin = { x: p.x / innerWidth, y: p.y / innerHeight };
            const fire = (opts) => confetti(Object.assign({ origin, spread: 360, startVelocity: 26, gravity: 0.55, ticks: 280, scalar: 1.1, shapes: ["star", "circle"], colors: GOLDS.concat(["#ffb3c4"]), disableForReducedMotion: true }, opts));
            fire({ particleCount: 120 });
            setTimeout(() => fire({ particleCount: 80, startVelocity: 18 }), 300);
            setTimeout(() => fire({ particleCount: 60, startVelocity: 34, origin: { x: origin.x - 0.2, y: origin.y + 0.08 } }), 900);
            setTimeout(() => fire({ particleCount: 60, startVelocity: 34, origin: { x: origin.x + 0.2, y: origin.y + 0.05 } }), 1300);
        })
        .to("#cakeSub", { opacity: 0, duration: 0.5 }, "+=1.6")
        .add(() => ($("cakeSub").innerHTML = "whatever you wished for, <em>I hope it finds you</em> ✦"))
        .to("#cakeSub", { opacity: 1, duration: 1.2 })
        .to("#dim", { opacity: 0.35, duration: 2.5, ease: "power2.inOut" }, "<")
        .add(() => {
            const btn = $("toLetterBtn");
            btn.hidden = false;
            $("micBtn").hidden = true;
            gsap.from(btn, { scale: 0, opacity: 0, duration: 1.1, ease: "elastic.out(1, 0.5)" });
        }, "+=2.5");
}

$("toLetterBtn").addEventListener("click", () => {
    Sound.whoosh(2);
    Sound.duck(0.6, 3);
    const curtain = $("curtain");
    const words = $("curtainText");
    words.textContent = "and finally…";
    gsap.timeline()
        .to(curtain, { opacity: 1, duration: 1.4, ease: "power2.inOut" })
        .add(() => {
            hideScene(scene("sceneCake"));
            gsap.set("#dim", { opacity: 0 });
            document.body.classList.remove("wish-made");
        })
        .fromTo(words, { opacity: 0, filter: "blur(12px)", scale: 0.9 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 1.6, ease: "silk" })
        .to(words, { opacity: 0, filter: "blur(12px)", scale: 1.08, duration: 1.2, ease: "power2.in" }, "+=1.2")
        .add(showFinal)
        .to(curtain, { opacity: 0, duration: 2.2, ease: "power2.inOut" });
});

/* ---------------------------------------------------------
   4 · The last page
   --------------------------------------------------------- */

function makePetals() {
    const box = $("petals");
    box.innerHTML = "";
    const n = window.innerWidth < 600 ? 18 : 30;
    for (let i = 0; i < n; i++) {
        const p = document.createElement("span");
        const d = rand(9, 18);
        p.className = "petal";
        p.style.setProperty("--x", rand(0, 100) + "%");
        p.style.setProperty("--s", rand(9, 20) + "px");
        p.style.setProperty("--d", d + "s");
        p.style.setProperty("--delay", -rand(0, d) + "s");
        p.style.setProperty("--sway", rand(-90, 90) + "px");
        box.appendChild(p);
    }
}

function showFinal() {
    const el = scene("sceneFinal");
    showScene(el);
    makePetals();
    Sky.hearts = 34;
    Sound.duck(1, 4);

    const title = document.querySelector(".final-title");
    const split = new SplitText(title, { type: "words,chars", charsClass: "ch" });
    title.classList.add("is-split");
    const actions = $("finalActions");
    gsap.set(actions, { opacity: 0, y: 20 });

    gsap.timeline({ delay: 0.6 })
        .from(".final-bg", { scale: 1.35, opacity: 0, duration: 4, ease: "power2.out" })
        .from(".final-card", { y: 120, opacity: 0, scale: 0.92, filter: "blur(10px)", duration: 1.8, ease: "silk" }, "<0.6")
        .from(".final-card .eyebrow", { opacity: 0, letterSpacing: "0.9em", duration: 1.6, ease: "silk" }, "-=0.8")
        .from(split.chars, {
            opacity: 0,
            y: 50,
            rotationX: -100,
            scale: 0.6,
            filter: "blur(14px)",
            transformPerspective: 500,
            duration: 1.4,
            ease: "back.out(1.7)",
            stagger: 0.06
        }, "-=0.8")
        .add(() => {
            const r = title.getBoundingClientRect();
            for (let i = 0; i < 6; i++) setTimeout(() => Sky.burst(rand(r.left, r.right), rand(r.top, r.bottom), { count: 10, speed: 120, hearts: 0, colors: GOLDS, gravity: 30 }), i * 140);
            Sound.sparkle(10);
            // a slow wave of light passing through the letters
            gsap.timeline({ repeat: -1, repeatDelay: 1.5 })
                .to(split.chars, { color: "#fff7f2", textShadow: "0 0 24px rgba(255,231,191,0.95)", duration: 0.5, stagger: 0.07, ease: "sine.inOut" })
                .to(split.chars, { color: "#f3c98b", textShadow: "0 0 10px rgba(255,150,120,0.35)", duration: 0.9, stagger: 0.07, ease: "sine.inOut" }, 0.45);
        }, "-=0.6")
        .from(".final-name", { opacity: 0, letterSpacing: "1.2em", filter: "blur(8px)", duration: 2.2, ease: "silk" }, "-=0.4")
        .add(writeParagraphs($("finalLines"), finalLines, 0.6), "-=0.6")
        .to(actions, { opacity: 1, y: 0, duration: 1.2, ease: "silk" })
        .add(gentleFireworks);
}

function gentleFireworks() {
    let n = 0;
    const id = setInterval(() => {
        if (++n > 5) return clearInterval(id);
        confetti({
            particleCount: 50,
            spread: 360,
            startVelocity: 20,
            gravity: 0.5,
            ticks: 220,
            origin: { x: rand(0.15, 0.85), y: rand(0.1, 0.35) },
            colors: GOLDS.concat(["#ffb3c4"]),
            shapes: ["star"],
            scalar: 0.9,
            disableForReducedMotion: true
        });
        Sound.sparkle(4);
    }, 3800);
}

/* hug: press and hold */

const hugBtn = $("hugBtn");
const hugLabel = $("hugLabel");
let hugDone = false;
let stopSwell = null;
let hugEmitter = null;
const hugFill = gsap.to("#hugProgress", { strokeDashoffset: 0, duration: 2.4, ease: "none", paused: true, onComplete: hugged });

function hugStart(e) {
    if (hugDone) return;
    if (e && e.pointerId !== undefined) hugBtn.setPointerCapture(e.pointerId);
    Sound.init();
    hugFill.timeScale(1).play();
    gsap.to(hugBtn, { scale: 1.18, duration: 2.4, ease: "power1.in", overwrite: true });
    stopSwell = Sound.swell();
    hugLabel.textContent = "keep holding…";
    hugEmitter = setInterval(() => {
        const c = centerOf(hugBtn);
        Sky.burst(c.x, c.y, { count: 2, speed: 90, hearts: 1, gravity: -40, life: 1.2, size: [6, 10] });
    }, 120);
}

function hugEnd() {
    clearInterval(hugEmitter);
    if (stopSwell) stopSwell();
    stopSwell = null;
    if (hugDone) return;
    hugFill.timeScale(3).reverse();
    gsap.to(hugBtn, { scale: 1, duration: 0.5, ease: "back.out(2)", overwrite: true });
    hugLabel.textContent = "a little longer… press & hold";
}

function hugged() {
    hugDone = true;
    clearInterval(hugEmitter);
    if (stopSwell) stopSwell();
    stopSwell = null;
    if (navigator.vibrate) navigator.vibrate([80, 60, 120]);
    Sound.warmth();

    const c = centerOf(hugBtn);
    Sky.burst(c.x, c.y, { count: 90, speed: 520, hearts: 0.85, life: 2 });
    Sky.burst(c.x, c.y, { count: 30, speed: 300, hearts: 0, colors: GOLDS });
    flash(0.55, 2.2);
    const heart = confetti.shapeFromText({ text: "💗", scalar: 2 });
    confetti({ particleCount: 60, spread: 120, startVelocity: 40, origin: { x: c.x / innerWidth, y: c.y / innerHeight }, shapes: [heart], scalar: 2, disableForReducedMotion: true });

    gsap.timeline()
        .to(hugBtn, { scale: 1.45, duration: 0.25, ease: "power2.out" })
        .to(hugBtn, { scale: 1, duration: 1.2, ease: "elastic.out(1, 0.35)" })
        .to(".final-card", { scaleX: 0.96, scaleY: 1.03, duration: 0.35, ease: "power2.out", yoyo: true, repeat: 1 }, 0.1);

    hugLabel.textContent = "";
    gsap.fromTo(hugLabel, { opacity: 0 }, { opacity: 1, duration: 1, onStart: () => (hugLabel.textContent = "consider yourself hugged. tightly. ♡") });

    setTimeout(() => {
        hugDone = false;
        hugFill.pause(0);
        gsap.to(hugLabel, { opacity: 0, duration: 0.6, onComplete: () => {
            hugLabel.textContent = "need another one? press & hold";
            gsap.to(hugLabel, { opacity: 1, duration: 0.6 });
        } });
    }, 5000);
}

hugBtn.addEventListener("pointerdown", hugStart);
["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => hugBtn.addEventListener(ev, hugEnd));
hugBtn.addEventListener("contextmenu", (e) => e.preventDefault());
hugBtn.addEventListener("keydown", (e) => {
    if ((e.key === " " || e.key === "Enter") && !e.repeat) {
        e.preventDefault();
        hugStart();
    }
});
hugBtn.addEventListener("keyup", (e) => {
    if (e.key === " " || e.key === "Enter") hugEnd();
});

$("replayBtn").addEventListener("click", () => {
    Sound.duck(0, 1.4);
    $("curtainText").textContent = "";
    gsap.to("#curtain", { opacity: 1, duration: 1.4, ease: "power2.inOut", onComplete: () => location.reload() });
});

/* ---------------------------------------------------------
   Begin
   --------------------------------------------------------- */

document.fonts.ready.then(envelopeEntrance);
