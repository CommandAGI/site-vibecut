// VibeCut's cut engine, held to its promises: a description always yields a cut of the length asked for, made only
// of the footage the description allows, and the same description yields the same cut.
// Run: node --test tests/edl.test.mjs (from this folder).
import test from 'node:test';
import assert from 'node:assert/strict';
import { CLIPS, CLIP_BY_ID, cut, readDescription, toFile } from '../lib/edl.mjs';

const DESCRIPTIONS = [
    '',
    'a 20 second cut, fast, wide shots, the robot arm, end with the logo, no coffee',
    'Un corte de 15 segundos, rápido, planos generales, el brazo robot, sin café',
    '20 秒，快剪，全景，机械臂，以标志结尾，不要咖啡',
    'a calm one minute film about the studio at dawn',
    '45 seconds of the city at night, slow, no people',
    'close-ups only, 12s',
    'a 30 second cut with no logo and no city',
    'start with the coffee, end with the city, 10 seconds',
    'half a minute of the part turning, slow motion',
    '8 seconds',
    'a 2 second cut',
    'everything except hands, 40 seconds',
    'only the lens and the hands, 6 seconds, fast',
    'no robots at all, 25 seconds',
    'un minuto de la ciudad, sin logo',
    '不要特写，30 秒，慢',
];

test('every description yields a cut of the length it asked for', () => {
    for (const text of DESCRIPTIONS) {
        const plan = cut(text);
        assert.ok(plan.shots.length > 0, `no shots for ${JSON.stringify(text)}`);
        const total = plan.shots.reduce((sum, s) => sum + s.seconds, 0);
        assert.ok(Math.abs(total - plan.requested) < 0.002, `${text}: ${total} vs ${plan.requested}`);
        assert.ok(Math.abs(plan.seconds - plan.requested) < 0.002, `${text}: seconds ${plan.seconds}`);
        // The shots follow one another with no gap and no overlap.
        let at = 0;
        for (const shot of plan.shots) {
            assert.ok(Math.abs(shot.start - at) < 1e-6, `${text}: shot starts at ${shot.start}, expected ${at}`);
            at = shot.end;
        }
    }
});

test('every shot names real footage and stays inside it', () => {
    for (const text of DESCRIPTIONS) {
        for (const shot of cut(text).shots) {
            const clip = CLIP_BY_ID.get(shot.clip);
            assert.ok(clip, `${text}: unknown clip ${shot.clip}`);
            assert.equal(shot.shot, clip.shot);
            assert.ok(shot.seconds > 0);
            // What the shot plays of its source — length × speed — is source the clip has.
            assert.ok(shot.sourceIn + shot.seconds * shot.rate <= clip.available + 1e-6,
                `${text}: ${shot.clip} uses ${shot.sourceIn}+${shot.seconds * shot.rate} of ${clip.available}`);
        }
    }
});

test('the same description always yields the same cut', () => {
    for (const text of DESCRIPTIONS) {
        assert.deepEqual(cut(text), cut(text));
    }
});

test('a description rules out footage it says no to, in every language', () => {
    const english = cut('a 20 second cut, wide shots, no coffee');
    // Every shot is a wide shot, except the end card the cut adds unless the description rules it out.
    assert.ok(english.shots.filter(s => s.shot !== 'logo').every(s => s.shot === 'wide'));
    assert.ok(!english.shots.some(s => s.clip === 'coffee-steam'));

    const spanish = cut('Un corte de 20 segundos, planos generales, sin café');
    assert.ok(!spanish.shots.some(s => s.clip === 'coffee-steam'));

    const chinese = cut('20 秒，全景，不要咖啡，不要城市');
    assert.ok(!chinese.shots.some(s => s.clip === 'coffee-steam' || s.clip === 'city-night'));

    // "no logo" means no end card, and the reason says so.
    const noLogo = cut('20 seconds, no logo');
    assert.ok(!noLogo.shots.some(s => s.shot === 'logo'));
    assert.ok(noLogo.reasons.some(r => r.code === 'excluded' && r.params.tags.includes('logo')));
});

test('the end card closes the cut unless it was ruled out', () => {
    const withCard = cut('20 seconds of the studio');
    assert.equal(withCard.shots.at(-1).shot, 'logo');
    const noCard = cut('20 seconds of the studio, no logo');
    assert.ok(!noCard.shots.some(s => s.shot === 'logo'));
});

test('a named opening clip opens, and a named closing clip closes', () => {
    const plan = cut('start with the coffee, end with the city, 10 seconds');
    assert.equal(plan.shots[0].clip, 'coffee-steam');
    assert.equal(plan.shots.at(-1).clip, 'city-night');
});

test('a fast pace cuts shorter shots than a calm pace', () => {
    const fast = cut('20 seconds, fast, the studio');
    const calm = cut('20 seconds, calm, the studio');
    assert.ok(fast.pace < calm.pace);
    const mean = plan => plan.shots.reduce((sum, s) => sum + s.seconds, 0) / plan.shots.length;
    assert.ok(mean(fast) < mean(calm));
    assert.ok(fast.reasons.some(r => r.code === 'pace-fast'));
    assert.ok(calm.reasons.some(r => r.code === 'pace-slow'));
});

test('lengths in seconds, minutes and halves are read, and bounded', () => {
    assert.equal(readDescription('a 20 second cut').seconds, 20);
    assert.equal(readDescription('30s').seconds, 30);
    assert.equal(readDescription('2 minutes').seconds, 120);
    assert.equal(readDescription('medio minuto').seconds, 30);
    assert.equal(readDescription('半分钟').seconds, 30);
    assert.equal(readDescription('90 segundos').seconds, 90);
    assert.equal(readDescription('').seconds, 20);
    assert.equal(readDescription('1 second').seconds, 2, 'a cut is at least 2 seconds');
    assert.equal(readDescription('999 seconds').seconds, 180, 'a cut is at most 3 minutes');
});

test('slow motion plays each shot at half speed', () => {
    const plan = cut('10 seconds, slow motion, the part turning');
    assert.equal(plan.rate, 0.5);
    assert.equal(plan.slowMotion, true);
    for (const shot of plan.shots) {
        const clip = CLIP_BY_ID.get(shot.clip);
        assert.equal(shot.rate, 0.5);
        assert.ok(shot.sourceIn + shot.seconds * 0.5 <= clip.available + 1e-6);
    }
    assert.ok(plan.reasons.some(r => r.code === 'slow-motion'));
});

test('a description of footage the sample does not have falls back to what is left, and says why', () => {
    // No shot or subject is named: the cut follows the footage's own order and the list says so.
    const unnamed = cut('20 seconds');
    assert.ok(unnamed.shots.length > 0);
    assert.ok(unnamed.reasons.some(r => r.code === 'default-order'));

    // A kind of shot the footage has none of: the cut uses the rest, and the list says the name was not found.
    const missing = cut('20 seconds of drone shots');
    assert.ok(missing.shots.length > 0);
    assert.ok(missing.reasons.some(r => r.code === 'no-match'));
});

test('a cut is a file a person can read', () => {
    const plan = cut('10 seconds, wide shots, no coffee');
    const file = toFile(plan);
    assert.equal(file.kind, 'vibecut.cut');
    assert.equal(file.v, 1);
    assert.equal(file.seconds, 10);
    assert.deepEqual(file.shots.map(s => s.clip), plan.shots.map(s => s.clip));
    // It is JSON, and it names no state the page has to guess.
    assert.deepEqual(JSON.parse(JSON.stringify(file)), file);
});

test('the sample footage is what the cut engine says it is', () => {
    // The page's scenes and the engine's catalog must name the same eight shots: a cut that names a shot the page
    // cannot draw is a black frame, not a cut.
    assert.equal(CLIPS.length, 8);
    const ids = CLIPS.map(c => c.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) assert.ok(CLIP_BY_ID.get(id));
    assert.deepEqual(CLIPS.map(c => c.shot), ['wide', 'wide', 'wide', 'close', 'close', 'close', 'b-roll', 'logo']);
});
