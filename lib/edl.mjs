// VibeCut's cut engine: one description in, one edit decision list (EDL) out.
//
// It is pure on purpose. The site's editor, its tests and its exports all read the same answer, and a cut is a file
// a person can read and keep (the JSON the editor downloads). No model call: a description names shots, subjects,
// a length and a pace, and those words are matched here, so the demo works offline and answers the same every time.
// The vocabulary is the demo's sample footage; a real cut of a person's own footage is the product's next step.

/** The sample footage. `available` is the seconds of source each clip has; `tags` are what a description can name. */
export const CLIPS = [
    { id: 'dawn-studio', shot: 'wide', tags: ['studio', 'dawn', 'room'], available: 8 },
    { id: 'studio-wide', shot: 'wide', tags: ['studio', 'people', 'room'], available: 8 },
    { id: 'arm-stack', shot: 'wide', tags: ['robot', 'studio'], available: 8 },
    { id: 'lathe-turn', shot: 'close', tags: ['robot', 'part'], available: 6 },
    { id: 'lens-hands', shot: 'close', tags: ['hands', 'lens'], available: 6 },
    { id: 'coffee-steam', shot: 'close', tags: ['coffee', 'studio'], available: 6 },
    { id: 'city-night', shot: 'b-roll', tags: ['city', 'night'], available: 8 },
    { id: 'end-card', shot: 'logo', tags: ['logo'], available: 4 },
];

export const CLIP_BY_ID = new Map(CLIPS.map(c => [c.id, c]));

/** Words a description may use for a kind of shot. English, Spanish and Simplified Chinese. */
const SHOT_WORDS = {
    wide: ['wide', 'wide shot', 'establishing', 'plano general', 'general', 'abierto', '全景', '广角', '远景'],
    close: ['close', 'close-up', 'closeup', 'close up', 'first plan', 'primer plano', 'plano detalle', 'detalle', '特写', '近景'],
    'b-roll': ['b-roll', 'broll', 'b roll', 'cutaway', 'atmosphere', 'b-roll', 'b-roll', '空镜', '过场', '氛围'],
    logo: ['logo', 'end card', 'endcard', 'logotipo', 'cierre', '片尾', '标志', 'logo 收尾'],
    insert: ['insert', 'inserto', 'insertar', '细节', '插入'],
};

/** Words a description may use for what is in the shot. */
const SUBJECT_WORDS = {
    robot: ['robot', 'arm', 'robotic', 'brazo', 'robotico', 'robótico', '机械臂', '机器人'],
    studio: ['studio', 'workshop', 'estudio', 'taller', '工作室', '车间'],
    hands: ['hands', 'hand', 'manos', 'mano', '手', '双手'],
    lens: ['lens', 'camera', 'lente', 'camara', 'cámara', '镜头', '相机'],
    city: ['city', 'street', 'skyline', 'ciudad', 'calle', '城市', '街'],
    night: ['night', 'nighttime', 'noche', '夜晚', '夜景'],
    coffee: ['coffee', 'cup', 'cafe', 'café', 'taza', '咖啡', '杯子'],
    people: ['people', 'person', 'team', 'gente', 'personas', 'equipo', '人', '团队'],
    part: ['part', 'parts', 'piece', 'pieza', '零件'],
    dawn: ['dawn', 'sunrise', 'morning', 'amanecer', 'mañana', '黎明', '清晨'],
    // Named, but not in this sample footage: a description that asks for them is answered with what the sample has,
    // and the list of reasons says the name was not found.
    drone: ['drone', 'aerial', 'dron', '无人机', '航拍'],
    ocean: ['ocean', 'sea', 'beach', 'mar', 'playa', '海', '海滩'],
};

/** Words that turn a description's fast pace into short clips, and its calm pace into long ones. */
const PACE_WORDS = {
    fast: { seconds: 1.5, words: ['fast', 'quick', 'punchy', 'snappy', 'tight', 'rapid', 'energetic', 'rápido', 'rapido', 'ágil', 'agil', 'rápida', 'rápidas', '快', '快剪', '紧凑', '利落'] },
    slow: { seconds: 4, words: ['slow', 'calm', 'dreamy', 'gentle', 'slow burn', 'relaxed', 'lento', 'lenta', 'tranquilo', 'tranquila', 'suave', '慢', '舒缓', '平静'] },
};

/** A word before a term that means the description does not want it. */
const NEGATIONS = ['no', 'not', 'without', 'never', 'sin', 'nunca', 'ningún', 'ningun', 'not', '不要', '不', '别', '没有', '无'];

const SLOW_MOTION = ['slow motion', 'slow-mo', 'cámara lenta', 'camara lenta', '慢动作'];

const DEFAULT_SECONDS = 20;
const DEFAULT_PACE = 2.5;

/** All matches of a term list in a text: [{ term, at }] where `at` is the character index of the match. */
function findTerms(text, terms) {
    const hits = [];
    for (const term of terms) {
        if (!term) continue;
        let from = 0;
        for (;;) {
            const at = text.indexOf(term, from);
            if (at === -1) break;
            // A term matches on word boundaries where the script has them; CJK has no spaces, so a bare index is right.
            const before = at > 0 ? text[at - 1] : ' ';
            const after = text[at + term.length] ?? ' ';
            const cjk = /[㐀-鿿]/.test(term);
            const bounded = cjk || (/[^a-z0-9]/i.test(before) && /[^a-z0-9]/i.test(after));
            if (bounded) hits.push({ term, at });
            from = at + term.length;
        }
    }
    return hits.sort((a, b) => a.at - b.at);
}

/** True when a negation word stands just before `at`: "no coffee", "sin café", "不要咖啡". */
function negatedAt(text, at) {
    const before = text.slice(Math.max(0, at - 24), at);
    const words = before.split(/[\s,.;:!?()，。；：！？、]+/u).filter(Boolean);
    // English and Spanish put the negation a word or two back ("no more coffee"); Chinese puts it on the term.
    return words.slice(-3).some(w => NEGATIONS.includes(w.toLowerCase()));
}

/** What a description asked for: shots, subjects, exclusions, seconds, pace, first and last. */
export function readDescription(text) {
    const raw = String(text ?? '');
    // Keep the accents: the Spanish words above are listed with them, and a term's own accents must match.
    const lowered = raw.toLowerCase();

    const shots = { include: new Set(), exclude: new Set() };
    for (const [shot, words] of Object.entries(SHOT_WORDS)) {
        for (const hit of findTerms(lowered, words)) (negatedAt(lowered, hit.at) ? shots.exclude : shots.include).add(shot);
    }
    // A detail shot is a close shot in this footage; the description's word and the catalog's name need not agree.
    if (shots.include.has('insert')) shots.include.add('close');

    const subjects = { include: new Set(), exclude: new Set() };
    for (const [subject, words] of Object.entries(SUBJECT_WORDS)) {
        for (const hit of findTerms(lowered, words)) (negatedAt(lowered, hit.at) ? subjects.exclude : subjects.include).add(subject);
    }

    const paceFast = findTerms(lowered, PACE_WORDS.fast.words).length > 0;
    const paceSlow = findTerms(lowered, PACE_WORDS.slow.words).length > 0;
    const pace = paceFast && !paceSlow ? PACE_WORDS.fast.seconds : paceSlow && !paceFast ? PACE_WORDS.slow.seconds : DEFAULT_PACE;

    const slowMotion = findTerms(lowered, SLOW_MOTION).length > 0;

    // The length: a number and its unit, "half a minute", or nothing (the default).
    let seconds = null;
    const number = lowered.match(/(\d+(?:[.,]\d+)?)\s*(seconds?|secs?|s\b|segundos?|segs?\b|秒|minutes?|mins?\b|minutos?|分钟)/);
    if (number) {
        const value = Number(number[1].replace(',', '.'));
        const unit = number[2];
        const perMinute = /min|分钟|minutos?/.test(unit) ? 60 : 1;
        seconds = value * perMinute;
    } else if (/half a minute|medio minuto|半分钟/.test(lowered)) {
        seconds = 30;
    }
    if (seconds != null) seconds = Math.min(180, Math.max(2, seconds));
    const requested = seconds ?? DEFAULT_SECONDS;

    // "start with the robot arm", "end with the logo": the clip that opens and the one that closes.
    const startWith = clauseAfter(lowered, ['start with', 'begin with', 'open with', 'empezar con', 'empieza con', 'comenzar con', 'abrir con', '开场', '开头用', '以', '开始用']);
    const endWith = clauseAfter(lowered, ['end with', 'finish with', 'close with', 'terminar con', 'termina con', 'acabar con', 'cerrar con', '结尾', '结束用']);
    const pinnedFirst = matchClip(startWith);
    const pinnedLast = matchClip(endWith);

    return {
        text: raw.trim(),
        shots: [...shots.include],
        excludedShots: [...shots.exclude],
        subjects: [...subjects.include],
        excludedSubjects: [...subjects.exclude],
        seconds: requested,
        pace,
        slowMotion,
        pinnedFirst: pinnedFirst?.id ?? null,
        pinnedLast: pinnedLast?.id ?? null,
    };
}

/** The words after the first phrase of `phrases` that appears, to the end of its clause. */
function clauseAfter(text, phrases) {
    for (const phrase of phrases) {
        const at = text.indexOf(phrase);
        if (at === -1) continue;
        return text.slice(at + phrase.length).split(/[.;,。；，]| and | then | y |然后|接着/)[0].trim();
    }
    return '';
}

/** The clip a phrase names best: a subject match first (the robot arm), then a shot kind (the wide shot). */
function matchClip(phrase) {
    if (!phrase) return null;
    const text = phrase.toLowerCase();
    let best = null;
    let score = 0;
    for (const clip of CLIPS) {
        let s = 0;
        for (const [subject, words] of Object.entries(SUBJECT_WORDS)) {
            if (clip.tags.includes(subject) && findTerms(text, words).length) s += 3;
        }
        for (const [shot, words] of Object.entries(SHOT_WORDS)) {
            if ((clip.shot === shot || (shot === 'insert' && clip.shot === 'close')) && findTerms(text, words).length) s += 2;
        }
        if (s > score) { score = s; best = clip; }
    }
    return best;
}

/**
 * The cut: a description → { seconds, pace, shots: [{ clip, shot, start, end, seconds, sourceIn, rate }], reasons }.
 * `reasons` are codes with parameters, so the page shows them in the visitor's language; the engine stays English-free.
 */
export function cut(text, options = {}) {
    const read = readDescription(text);
    const reasons = [];
    const excluded = new Set([...read.excludedShots, ...read.excludedSubjects]);

    let eligible = CLIPS.filter(c =>
        !excluded.has(c.shot) && !c.tags.some(t => excluded.has(t)));

    if (read.shots.length || read.subjects.length) {
        const matched = eligible.filter(c => read.shots.includes(c.shot) || c.tags.some(t => read.subjects.includes(t)));
        if (matched.length) {
            eligible = matched;
            reasons.push({ code: 'matched', params: { shots: read.shots, subjects: read.subjects } });
        } else {
            reasons.push({ code: 'no-match', params: { shots: read.shots, subjects: read.subjects } });
        }
    } else {
        reasons.push({ code: 'default-order', params: {} });
    }
    if (excluded.size) reasons.push({ code: 'excluded', params: { tags: [...excluded] } });
    if (read.pace === PACE_WORDS.fast.seconds) reasons.push({ code: 'pace-fast', params: { seconds: read.pace } });
    if (read.pace === PACE_WORDS.slow.seconds) reasons.push({ code: 'pace-slow', params: { seconds: read.pace } });
    if (read.slowMotion) reasons.push({ code: 'slow-motion', params: {} });
    if (read.pinnedFirst) reasons.push({ code: 'start-with', params: { clip: read.pinnedFirst } });
    if (read.pinnedLast) reasons.push({ code: 'end-with', params: { clip: read.pinnedLast } });
    if (!eligible.length) {
        // Every clip the visitor ruled out is gone: say so and cut from the footage that is left, never an empty cut.
        eligible = CLIPS.filter(c => c.shot !== 'logo');
        reasons.push({ code: 'all-excluded', params: {} });
    }

    // The end card closes the cut unless the description asked for it somewhere else or ruled it out. It comes from
    // the whole catalog, not only the shots the description named: a cut of "wide shots" still ends on the brand.
    const endCard = excluded.has('logo') ? null : CLIPS.find(c => c.shot === 'logo') ?? null;
    if (endCard && read.pinnedLast !== endCard.id) reasons.push({ code: 'end-card', params: {} });

    // The order: the story order of the shots the description allowed, the opening clip first, the closing one last.
    const order = eligible.filter(c => c.id !== endCard?.id);
    if (read.pinnedFirst) {
        const at = order.findIndex(c => c.id === read.pinnedFirst);
        if (at > 0) order.unshift(...order.splice(at, 1));
        else if (at === -1) order.unshift(CLIP_BY_ID.get(read.pinnedFirst));
    }
    const closing = read.pinnedLast ? CLIP_BY_ID.get(read.pinnedLast) : endCard;
    if (closing) {
        const at = order.findIndex(c => c.id === closing.id);
        if (at >= 0) order.splice(at, 1);
        order.push(closing);
    }
    if (!order.length) throw new Error('no footage left');

    const rate = read.slowMotion ? 0.5 : 1;
    const total = read.seconds;
    // The closing clip holds the last seconds of the cut, so the cut really ends on it; the body fills the rest.
    const closingLength = closing ? Math.min(read.pace, closing.available / rate, total) : 0;
    const body = round3(total - closingLength);

    const shots = [];
    const push = (clip, start, length, pass) => shots.push({
        clip: clip.id,
        shot: clip.shot,
        start: round3(start),
        end: round3(start + length),
        seconds: length,
        sourceIn: sourceOffset(clip, pass, bodyClips.length, length * rate),
        rate,
    });

    // The body cycles through the shots the description allowed, the closing one aside: it has its own seconds.
    const bodyClips = order.filter(c => c.id !== closing?.id);
    if (!bodyClips.length) bodyClips.push(...CLIPS.filter(c => c.shot !== 'logo'));

    let at = 0;
    let pass = 0;
    // Round to milliseconds so the sum of the shots equals the asked length exactly, not to a floating-point residue.
    while (at < body - 1e-9) {
        const clip = bodyClips[pass % bodyClips.length];
        let length = Math.min(read.pace, body - at);
        // A clip's source limits its length: a slow-motion shot spends source twice as fast.
        length = Math.min(length, clip.available / rate);
        length = Math.round(length * 1000) / 1000;
        if (length <= 0) break;
        push(clip, at, length, pass);
        at = round3(at + length);
        pass += 1;
        if (pass > 400) break;
    }
    if (closing && closingLength > 0) push(closing, at, round3(closingLength), pass);
    at = round3(at + closingLength);

    return {
        description: read.text,
        seconds: round3(at),
        requested: total,
        pace: read.pace,
        rate,
        slowMotion: read.slowMotion,
        shots,
        reasons,
        language: options.locale ?? null,
    };
}

/** Where in its source a repeated use of a clip starts, so the second pass is not the first pass again. */
function sourceOffset(clip, pass, cycleLength, needed) {
    const cycles = Math.floor(pass / cycleLength);
    if (cycles === 0) return 0;
    const span = clip.available - needed;
    if (span <= 0) return 0;
    return round3((cycles * (clip.available / 3)) % span);
}

function round3(n) {
    return Math.round(n * 1000) / 1000;
}

/** The cut as a file the visitor keeps: the same answer, plain, with the footage it names. */
export function toFile(plan) {
    return {
        v: 1,
        kind: 'vibecut.cut',
        description: plan.description,
        seconds: plan.seconds,
        pace: plan.pace,
        rate: plan.rate,
        reasons: plan.reasons,
        shots: plan.shots.map(s => ({
            clip: s.clip,
            shot: s.shot,
            start: s.start,
            end: s.end,
            sourceIn: s.sourceIn,
            rate: s.rate,
        })),
    };
}
