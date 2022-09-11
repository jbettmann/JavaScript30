const video = document.querySelector(".player");
const canvas = document.querySelector(".photo");
const ctx = canvas.getContext("2d");
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");

function getVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false }) // gets users video from
    .then((localMediaStream) => {
      console.log(localMediaStream);
      video.srcObject = localMediaStream; // converts localMediaStream into URL
      video.play();
    })
    .catch((err) => console.error("NO!", err));
}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;

  // IMPORTANT *** Sets canvas size to camera size
  canvas.width = width;
  canvas.height = height;

  // paints video to canvas
  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    //take pixels out
    let pixels = ctx.getImageData(0, 0, width, height);
    //mess with them
    pixels = greenScreen(pixels);
    // ctx.globalAlpha = 0.1;
    //put them back
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

function redEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i] = pixels.data[i] + 100; // red
    pixels.data[i + 1] = pixels.data[i + 1] - 50; // green
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // blue
    pixels.data[i + 3]; // alpha
  }

  return pixels;
}

function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 150] = pixels.data[i]; // red
    pixels.data[i + 100] = pixels.data[i + 1]; // green
    pixels.data[i - 150] = pixels.data[i + 2]; // blue
    pixels.data[i + 3]; // alpha
  }

  return pixels;
}

function greenScreen(pixels) {
  const levels = {};

  document.querySelectorAll(".rgb input").forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (
      red >= levels.rmin &&
      green >= levels.gmin &&
      blue >= levels.bmin &&
      red <= levels.rmax &&
      green <= levels.gmax &&
      blue <= levels.bmax
    ) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}
function takePhoto() {
  //played sound
  snap.currentTime = 0;
  snap.play();

  // take data out of canvas
  const data = canvas.toDataURL("image/jpeg"); // created image
  const link = document.createElement("a"); // created element
  link.href = data; //
  link.setAttribute("download", "handsome"); // attribute is download and value is handsome
  link.innerHTML = `<img src="${data}" alt="Real Photo" />`;
  // link.textContent = "Download Image"; // sets text content
  strip.insertBefore(link, strip.firstChild); // like prepend in jQuery
}

getVideo();

video.addEventListener("canplay", paintToCanvas);
