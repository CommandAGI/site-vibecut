// VibeCut's drawn footage: eight shots drawn on a canvas, each a function of time (`t` in seconds of its source).
// Seven of the eight also exist as generated clips (media/, app/footage.mjs); the screen shows the clip once it can
// play and this drawing until then, or when the clip cannot load. The end card is only drawn.

const W = 1280;
const H = 720;

const ease = t => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

function sky(ctx, top, bottom) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
}

function grain(ctx, seed, amount = 0.05) {
    // A little noise, deterministic per frame: sampled footage never looks like a flat fill.
    let s = seed;
    const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    ctx.save();
    ctx.globalAlpha = amount;
    for (let i = 0; i < 140; i += 1) {
        ctx.fillStyle = rnd() > 0.5 ? '#ffffff' : '#000000';
        ctx.fillRect(rnd() * W, rnd() * H, 2, 2);
    }
    ctx.restore();
}

function room(ctx, t, warm) {
    sky(ctx, warm ? '#2a2118' : '#151b24', warm ? '#0d0a07' : '#080b10');
    // The window, and the light it throws on the floor.
    ctx.fillStyle = warm ? '#f6d9a8' : '#8fb4d9';
    ctx.fillRect(760, 130, 340, 300);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.beginPath();
    ctx.moveTo(760, 430);
    ctx.lineTo(1100, 430);
    ctx.lineTo(980, 700);
    ctx.lineTo(560, 700);
    ctx.closePath();
    ctx.fill();
    // A table, a bench, and the arm standing over them.
    ctx.fillStyle = '#3a2f26';
    ctx.fillRect(140, 470, 640, 26);
    ctx.fillRect(190, 496, 22, 200);
    ctx.fillRect(700, 496, 22, 200);
}

function armShape(ctx, x, y, reach, lift) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#c9d1d9';
    ctx.fillRect(-26, -34, 52, 68);
    ctx.rotate((-0.9 + reach) * 0.6);
    ctx.fillStyle = '#e6edf3';
    ctx.fillRect(0, -14, 210, 28);
    ctx.beginPath();
    ctx.arc(210, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(210, 0);
    ctx.rotate((-0.4 + lift) * 0.9);
    ctx.fillStyle = '#c9d1d9';
    ctx.fillRect(0, -10, 130, 20);
    ctx.fillStyle = '#8b949e';
    ctx.fillRect(120, 18, 34, 44);
    ctx.restore();
}

function blocks(ctx, stack) {
    const colors = ['#e8b04b', '#5aa9e6', '#e0635f', '#7bd88f'];
    for (let i = 0; i < stack; i += 1) {
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(860, 620 - i * 52, 96, 48);
    }
}

/** The eight sample shots, by clip id. `t` is seconds into the clip's own source. */
export const SCENES = {
    'dawn-studio'(ctx, t) {
        sky(ctx, '#1d2a3a', '#c4814f');
        const rise = ease(t / 6) * 130;
        ctx.fillStyle = '#f6c26b';
        ctx.beginPath();
        ctx.arc(980, 470 - rise, 74, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(10,14,20,0.92)';
        for (let i = 0; i < 14; i += 1) ctx.fillRect(i * 96, 300 + ((i * 37) % 120), 64, 420);
        ctx.fillStyle = '#2b2119';
        ctx.fillRect(60, 470, 620, 24);
        grain(ctx, Math.floor(t * 24));
    },
    'studio-wide'(ctx, t) {
        room(ctx, t, true);
        // Two people at the bench, seen from behind.
        for (const [x, bob] of [[380, 0], [470, 0.6]]) {
            ctx.fillStyle = '#241b14';
            ctx.beginPath();
            ctx.arc(x, 400 + Math.sin(t * 1.2 + bob) * 4, 34, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(x - 44, 430, 88, 70);
        }
        grain(ctx, Math.floor(t * 24));
    },
    'arm-stack'(ctx, t) {
        room(ctx, t, false);
        const stack = Math.min(4, Math.floor(t / 1.6));
        blocks(ctx, stack);
        armShape(ctx, 420, 430, ease((t % 1.6) / 0.8), ease(((t + 0.8) % 1.6) / 0.8));
        grain(ctx, Math.floor(t * 24));
    },
    'lathe-turn'(ctx, t) {
        sky(ctx, '#101418', '#05070a');
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(t * 1.4);
        for (let i = 0; i < 12; i += 1) {
            ctx.rotate((Math.PI * 2) / 12);
            ctx.fillStyle = i % 2 ? '#5f6b78' : '#95a3b3';
            ctx.fillRect(90, -8, 250, 16);
        }
        ctx.fillStyle = '#e6edf3';
        ctx.beginPath();
        ctx.arc(0, 0, 96, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1b2027';
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        grain(ctx, Math.floor(t * 24));
    },
    'lens-hands'(ctx, t) {
        sky(ctx, '#141a14', '#070a07');
        const k = ease(Math.min(1, t / 5));
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.scale(0.8 + k * 0.5, 0.8 + k * 0.5);
        for (const r of [300, 250, 205, 168]) {
            ctx.strokeStyle = 'rgba(180,200,210,0.5)';
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.fillStyle = 'rgba(120,190,255,0.16)';
        ctx.beginPath();
        ctx.arc(-40, -30, 120, 0, Math.PI * 2);
        ctx.fill();
        // Two hands, in silhouette, turning the focus ring.
        ctx.fillStyle = '#0a0c0a';
        ctx.beginPath();
        ctx.ellipse(-230, 140 + Math.sin(t * 2) * 6, 120, 70, 0.4, 0, Math.PI * 2);
        ctx.ellipse(240, 120 + Math.cos(t * 2) * 6, 120, 70, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        grain(ctx, Math.floor(t * 24));
    },
    'coffee-steam'(ctx, t) {
        room(ctx, t, true);
        ctx.fillStyle = '#efe6d8';
        ctx.beginPath();
        ctx.ellipse(930, 470, 86, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(860, 470, 140, 90);
        ctx.fillStyle = '#231a12';
        ctx.beginPath();
        ctx.ellipse(930, 466, 66, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 3; i += 1) {
            ctx.strokeStyle = 'rgba(240,235,225,0.28)';
            ctx.lineWidth = 6;
            ctx.beginPath();
            for (let y = 0; y < 150; y += 6) {
                const x = 930 + Math.sin((y / 22) + t * 1.6 + i) * (14 + y / 14);
                ctx.lineTo(x, 440 - y - i * 12);
            }
            ctx.stroke();
        }
        grain(ctx, Math.floor(t * 24), 0.04);
    },
    'city-night'(ctx, t) {
        sky(ctx, '#05070f', '#131a2b');
        let x = 0;
        let seed = 7;
        const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
        while (x < W) {
            const w = 50 + rnd() * 90;
            const h = 120 + rnd() * 340;
            ctx.fillStyle = '#0a0d16';
            ctx.fillRect(x, H - h, w, h);
            for (let y = H - h + 20; y < H - 20; y += 26) {
                for (let wx = x + 8; wx < x + w - 10; wx += 20) {
                    const on = rnd() > 0.55;
                    ctx.fillStyle = on ? `rgba(255,${190 + Math.floor(rnd() * 50)},120,${0.35 + 0.4 * Math.abs(Math.sin(t + wx))})` : 'rgba(30,40,60,0.6)';
                    ctx.fillRect(wx, y, 10, 12);
                }
            }
            x += w + 6;
        }
        grain(ctx, Math.floor(t * 24), 0.07);
    },
    'end-card'(ctx, t) {
        // The brand's own end title: the wordmark set in the site's display face, a vermilion splice through it.
        ctx.fillStyle = '#101010';
        ctx.fillRect(0, 0, W, H);
        const k = ease(Math.min(1, t / 0.9));
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.globalAlpha = k;
        ctx.fillStyle = '#f3f0e8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 168px "Big Shoulders", "Arial Narrow", sans-serif';
        ctx.fillText('VIBECUT', 0, -10);
        ctx.fillStyle = '#f0442c';
        ctx.fillRect(-6 + (1 - k) * 220, -110, 12, 200);
        ctx.globalAlpha = k * 0.75;
        ctx.fillStyle = '#f3f0e8';
        ctx.font = '500 22px "DM Mono", ui-monospace, monospace';
        ctx.fillText('CUT BY DESCRIPTION', 0, 120);
        ctx.restore();
        grain(ctx, Math.floor(t * 24), 0.03);
    },
};

/** Draw one moment of the cut into a 1280×720 canvas. */
export function drawAt(ctx, shot, sourceSeconds) {
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    const scene = SCENES[shot.clip];
    if (scene) scene(ctx, sourceSeconds);
    else if (shot.clip === undefined && shot.id) SCENES[shot.id]?.(ctx, sourceSeconds);
    ctx.restore();
}

/** Reframe the 16:9 picture into a canvas of the cut's shape: it fills the frame and the frame crops it. */
export function fit(ctx, canvas) {
    const scale = Math.max(canvas.width / W, canvas.height / H);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, (canvas.width - W * scale) / 2, (canvas.height - H * scale) / 2);
}

export const FRAME = { width: W, height: H };
