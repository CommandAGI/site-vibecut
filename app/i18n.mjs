// The page's own words, in the three languages the site ships. The page's HTML carries the rest (headlines,
// sections); these are the strings the demo writes and the names of the eight sample shots.
export const LOCALES = ['en', 'es', 'zh-Hans'];

export const CLIP_TITLES = {
    'dawn-studio': { en: 'Studio at dawn', es: 'El estudio al amanecer', 'zh-Hans': '清晨的工作室' },
    'studio-wide': { en: 'Two at the bench', es: 'Dos en el banco de trabajo', 'zh-Hans': '工作台前的两个人' },
    'arm-stack': { en: 'The arm stacks blocks', es: 'El brazo apila bloques', 'zh-Hans': '机械臂堆叠方块' },
    'lathe-turn': { en: 'The part turns', es: 'La pieza gira', 'zh-Hans': '零件旋转' },
    'lens-hands': { en: 'Hands on the lens', es: 'Manos en el objetivo', 'zh-Hans': '双手调节镜头' },
    'coffee-steam': { en: 'Coffee, still hot', es: 'Café todavía caliente', 'zh-Hans': '还热着的咖啡' },
    'city-night': { en: 'The city at night', es: 'La ciudad de noche', 'zh-Hans': '夜晚的城市' },
    'end-card': { en: 'End card', es: 'Cierre', 'zh-Hans': '片尾' },
};

const STRINGS = {
    'cut.button': { en: 'Cut it', es: 'Cortar', 'zh-Hans': '开始剪辑' },
    'cut.again': { en: 'Cut it again', es: 'Cortar otra vez', 'zh-Hans': '重新剪辑' },
    'cut.empty': { en: 'Describe the cut you want, then press Cut it.', es: 'Describe el corte que quieres y pulsa Cortar.', 'zh-Hans': '先描述你要的剪辑，再点“开始剪辑”。' },
    'cut.placeholder': {
        en: 'A 20 second cut, fast, wide shots, the robot arm, end with the logo, no coffee',
        es: 'Un corte de 20 segundos, rápido, planos generales, el brazo robot, terminar con el logo, sin café',
        'zh-Hans': '20 秒，快剪，全景，机械臂，以标志结尾，不要咖啡',
    },
    'editor.title': { en: 'The cut', es: 'El corte', 'zh-Hans': '剪辑' },
    'editor.play': { en: 'Play', es: 'Reproducir', 'zh-Hans': '播放' },
    'editor.pause': { en: 'Pause', es: 'Pausar', 'zh-Hans': '暂停' },
    'editor.download': { en: 'Download the cut', es: 'Descargar el corte', 'zh-Hans': '下载剪辑单' },
    'editor.export': { en: 'Render a video', es: 'Generar un vídeo', 'zh-Hans': '导出视频' },
    'editor.exporting': { en: 'Rendering…', es: 'Generando…', 'zh-Hans': '正在导出…' },
    'editor.exportNote': {
        en: 'The video records as it plays, in real time.',
        es: 'El vídeo se graba mientras se reproduce, en tiempo real.',
        'zh-Hans': '视频在播放时实时录制。',
    },
    'editor.saveNote': {
        en: 'The cut is a plain JSON file: every shot, where it starts, which second of the source it uses.',
        es: 'El corte es un archivo JSON legible: cada plano, dónde empieza y qué segundo de la fuente usa.',
        'zh-Hans': '剪辑是一个纯 JSON 文件：每个镜头、起点，以及取自素材的第几秒。',
    },
    'editor.total': { en: '{n} seconds', es: '{n} segundos', 'zh-Hans': '{n} 秒' },
    'editor.shot': { en: '{n} shots', es: '{n} planos', 'zh-Hans': '{n} 个镜头' },
    'editor.timeline': { en: 'Timeline', es: 'Línea de tiempo', 'zh-Hans': '时间线' },
    'editor.why': { en: 'Why this cut', es: 'Por qué este corte', 'zh-Hans': '为什么这样剪' },
    'reason.matched': {
        en: 'You named {what}, so only those shots are used.',
        es: 'Nombraste {what}, así que solo se usan esos planos.',
        'zh-Hans': '你指定了{what}，因此只使用这些镜头。',
    },
    'reason.excluded': {
        en: 'Left out, because you said no: {what}.',
        es: 'Fuera, porque dijiste que no: {what}.',
        'zh-Hans': '已排除（你说了不要）：{what}。',
    },
    'reason.start-with': { en: 'It opens on {clip}.', es: 'Abre con {clip}.', 'zh-Hans': '以{clip}开场。' },
    'reason.end-with': { en: 'It closes on {clip}.', es: 'Cierra con {clip}.', 'zh-Hans': '以{clip}结尾。' },
    'reason.end-card': {
        en: 'The end card closes the cut, unless you rule it out.',
        es: 'El cierre termina el corte, salvo que lo excluyas.',
        'zh-Hans': '片尾收尾，除非你排除它。',
    },
    'reason.default-order': {
        en: 'You named no shot or subject, so the cut follows the footage in its own order.',
        es: 'No nombraste ningún plano ni sujeto, así que el corte sigue el material en su propio orden.',
        'zh-Hans': '你没有指定镜头或对象，所以按素材本身的顺序剪辑。',
    },
    'reason.no-match': {
        en: 'Nothing in this footage is called {what}, so the cut uses the shots that are left.',
        es: 'En este material no hay nada llamado {what}, así que el corte usa los planos que quedan.',
        'zh-Hans': '素材里没有{what}，所以使用剩下的镜头。',
    },
    'reason.all-excluded': {
        en: 'You ruled out every shot, so the cut keeps one of each kind it can.',
        es: 'Excluiste todos los planos, así que el corte conserva uno de cada tipo posible.',
        'zh-Hans': '你排除了所有镜头，因此剪辑保留了每种一镜头。',
    },
    'reason.pace-fast': { en: 'Fast pace: each shot holds about {s} seconds.', es: 'Ritmo rápido: cada plano dura unos {s} segundos.', 'zh-Hans': '快节奏：每个镜头约 {s} 秒。' },
    'reason.pace-slow': { en: 'Calm pace: each shot holds about {s} seconds.', es: 'Ritmo tranquilo: cada plano dura unos {s} segundos.', 'zh-Hans': '平缓节奏：每个镜头约 {s} 秒。' },
    'reason.slow-motion': { en: 'Slow motion: each shot plays at half speed.', es: 'Cámara lenta: cada plano va a media velocidad.', 'zh-Hans': '慢动作：每个镜头以半速播放。' },
    'edl.clip': { en: 'Clip', es: 'Plano', 'zh-Hans': '镜头' },
    'edl.src': { en: 'Src in', es: 'Fuente', 'zh-Hans': '素材入点' },
    'edl.in': { en: 'Rec in', es: 'Entrada', 'zh-Hans': '入点' },
    'edl.out': { en: 'Rec out', es: 'Salida', 'zh-Hans': '出点' },
    'reason.frame': { en: 'Reframed to {frame}, as you asked.', es: 'Reencuadrado a {frame}, como pediste.', 'zh-Hans': '按你的要求，改为 {frame} 画幅。' },
    'frame.scope': { en: 'scope (2.39:1)', es: 'panorámico (2.39:1)', 'zh-Hans': '宽银幕（2.39:1）' },
    'frame.16:9': { en: '16:9', es: '16:9', 'zh-Hans': '16:9' },
    'frame.square': { en: 'square (1:1)', es: 'cuadrado (1:1)', 'zh-Hans': '方形（1:1）' },
    'frame.vertical': { en: 'vertical (9:16)', es: 'vertical (9:16)', 'zh-Hans': '竖屏（9:16）' },
    'shot.wide': { en: 'wide', es: 'general', 'zh-Hans': '全景' },
    'shot.close': { en: 'close', es: 'primer plano', 'zh-Hans': '特写' },
    'shot.b-roll': { en: 'b-roll', es: 'b-roll', 'zh-Hans': '空镜' },
    'shot.logo': { en: 'logo', es: 'logo', 'zh-Hans': '标志' },
    'tag.robot': { en: 'the robot arm', es: 'el brazo robot', 'zh-Hans': '机械臂' },
    'tag.studio': { en: 'the studio', es: 'el estudio', 'zh-Hans': '工作室' },
    'tag.hands': { en: 'hands', es: 'las manos', 'zh-Hans': '手' },
    'tag.lens': { en: 'the lens', es: 'el objetivo', 'zh-Hans': '镜头' },
    'tag.city': { en: 'the city', es: 'la ciudad', 'zh-Hans': '城市' },
    'tag.night': { en: 'night', es: 'la noche', 'zh-Hans': '夜晚' },
    'tag.coffee': { en: 'coffee', es: 'el café', 'zh-Hans': '咖啡' },
    'tag.people': { en: 'people', es: 'la gente', 'zh-Hans': '人物' },
    'tag.part': { en: 'the part', es: 'la pieza', 'zh-Hans': '零件' },
    'tag.dawn': { en: 'dawn', es: 'el amanecer', 'zh-Hans': '黎明' },
    'tag.room': { en: 'the room', es: 'la sala', 'zh-Hans': '房间' },
    'tag.logo': { en: 'the logo', es: 'el logo', 'zh-Hans': '标志' },
    'error.nothing': {
        en: 'That description cannot make a cut. Name a length or a kind of shot.',
        es: 'Esa descripción no puede hacer un corte. Indica una duración o un tipo de plano.',
        'zh-Hans': '这段描述无法生成剪辑。请指定时长或镜头类型。',
    },
};

/** The string for `key` in `locale`, English when the locale has no line. */
export function t(locale, key, values = {}) {
    const line = STRINGS[key]?.[locale] ?? STRINGS[key]?.en ?? key;
    return line.replace(/\{(\w+)\}/g, (match, name) => (values[name] ?? match));
}

/** The localized name of a clip or a tag. */
export function name(locale, kind, id) {
    if (kind === 'clip') return CLIP_TITLES[id]?.[locale] ?? CLIP_TITLES[id]?.en ?? id;
    return t(locale, `${kind}.${id}`);
}

/** A word the page has a name for, whichever vocabulary it came from (a kind of shot or a subject). */
function word(locale, id) {
    const line = STRINGS[`tag.${id}`]?.[locale] ?? STRINGS[`shot.${id}`]?.[locale];
    if (line) return line;
    const english = STRINGS[`tag.${id}`]?.en ?? STRINGS[`shot.${id}`]?.en;
    return english ?? id;
}

/** A reason code, as a sentence in the visitor's language. */
export function reasonSentence(locale, reason) {
    const p = reason.params ?? {};
    switch (reason.code) {
        case 'matched': {
            const what = [...p.shots.map(s => name(locale, 'shot', s)), ...p.subjects.map(s => name(locale, 'tag', s))].join(', ');
            return t(locale, 'reason.matched', { what });
        }
        case 'excluded': return t(locale, 'reason.excluded', { what: p.tags.map(tag => word(locale, tag)).join(', ') });
        case 'start-with': return t(locale, 'reason.start-with', { clip: name(locale, 'clip', p.clip) });
        case 'end-with': return t(locale, 'reason.end-with', { clip: name(locale, 'clip', p.clip) });
        case 'end-card': return t(locale, 'reason.end-card');
        case 'default-order': return t(locale, 'reason.default-order');
        case 'no-match': {
            const what = [...p.shots.map(s => name(locale, 'shot', s)), ...p.subjects.map(s => name(locale, 'tag', s))].join(', ');
            return t(locale, 'reason.no-match', { what });
        }
        case 'all-excluded': return t(locale, 'reason.all-excluded');
        case 'pace-fast': return t(locale, 'reason.pace-fast', { s: p.seconds });
        case 'pace-slow': return t(locale, 'reason.pace-slow', { s: p.seconds });
        case 'slow-motion': return t(locale, 'reason.slow-motion');
        case 'frame': return t(locale, 'reason.frame', { frame: t(locale, `frame.${p.frame}`) });
        default: return '';
    }
}
