// The generated sample clips (media/<clip>.webm|mp4), one muted <video> each, drawn into the editor's canvas.
// A clip loads when a cut first names it, so the page's first screen costs only the clips its first cut uses.
// `frame(shot, source)` answers the video to draw at that second of the source, or null while it is not ready:
// the caller then draws the shot's drawing (app/scenes.mjs), so the screen is never blank.
const CLIPS = ['dawn-studio', 'studio-wide', 'arm-stack', 'lathe-turn', 'lens-hands', 'coffee-steam', 'city-night'];

export const hasClip = id => CLIPS.includes(id);
export const poster = (root, id) => (hasClip(id) ? `${root}media/${id}.webp` : null);

export function footage(root, onReady) {
    const videos = new Map();
    const av1 = document.createElement('video').canPlayType('video/webm; codecs="av01.0.05M.08"');
    const ext = av1 ? 'webm' : 'mp4';

    function get(id) {
        if (!hasClip(id)) return null;
        let video = videos.get(id);
        if (!video) {
            video = document.createElement('video');
            video.muted = true;
            video.playsInline = true;
            video.preload = 'auto';
            video.src = `${root}media/${id}.${ext}`;
            video.addEventListener('loadeddata', onReady);
            video.addEventListener('seeked', onReady);
            videos.set(id, video);
        }
        return video;
    }

    return {
        /** Start loading the clips a cut uses. */
        want(ids) { for (const id of ids) get(id); },
        /** The video for a shot at a second of its source, synced to it; null until it can draw. */
        frame(shot, source, playing) {
            const video = get(shot.clip);
            if (!video || video.readyState < 2 || !video.duration) return null;
            const target = source % video.duration;
            video.playbackRate = shot.rate;
            for (const [id, other] of videos) if (id !== shot.clip && !other.paused) other.pause();
            if (playing) {
                if (Math.abs(video.currentTime - target) > 0.3) video.currentTime = target;
                if (video.paused) video.play().catch(() => {});
            } else {
                if (!video.paused) video.pause();
                if (Math.abs(video.currentTime - target) > 0.04) video.currentTime = target;
            }
            return video;
        },
        pauseAll() { for (const v of videos.values()) v.pause(); },
    };
}
