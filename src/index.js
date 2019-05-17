const throttle = (fn, delay) => {
  let lastCall = 0;
  return function(...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  };
};

export default class Beep {
  constructor(props) {
    const url = props.url;
    const volume = props.volume || 1.0;
    const throttleMs = props.throttleMs || 0;

    // this is a hack
    // to force browser to
    // preload audio file
    const appendAudioElement = url => {
      // hash function
      // credit: https://stackoverflow.com/a/8831937/11330825
      const hash = str => {
        var hash = 0;
        if (str.length === 0) {
          return hash;
        }
        for (var i = 0; i < str.length; i++) {
          var char = str.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
      };
      const id = `boink-${hash(url)}`;

      let audioElement = document.createElement("audio");
      audioElement.id = id;
      audioElement.src = url;
      audioElement.preload = "auto";

      document.body.appendChild(audioElement);
      return;
    };

    // argument validation
    if (!url) throw Error('Requires valid "url" for audio file');
    if (volume) {
      if (typeof volume !== "number" || volume < 0 || volume > 1.0) {
        throw Error('"Volume" must be a number between 0.0 and 1.0');
      }
    }

    appendAudioElement(url);

    this.url = url;
    this.volume = volume;
    this.throttleMs = throttleMs;
  }

  play = throttle(() => {
    const audioElement = new Audio(this.url);

    audioElement.addEventListener("loadeddata", () => {
      audioElement.volume = this.volume;
      audioElement.play();
    });

    return this;
  }, this.throttleMs);

  adjustVolume = volume => {
    this.volume = volume;
    return this;
  };
}
