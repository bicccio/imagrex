import * as cocoSsd from "@tensorflow-models/coco-ssd";

const video = document.querySelector("#videoElement");
const canvas = document.querySelector("#canvasElement");
const resultBox = document.querySelector("#result");

if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: {
        facingMode: "user"
      }
    })
    .then(stream => {
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        cocoSsd.load().then(model => {
          detectFrame(video, model);
        });
      };
    })
    .catch(function(error) {
      console.log("Something went wrong!");
      console.log(error);
    });
}

const detectFrame = (video, model) => {
  model
    .detect(video)
    .then(predictions => {
      renderPredictions(predictions);
      requestAnimationFrame(() => {
        detectFrame(video, model);
      });
    })
    .catch(error => {
      console.log(error);
    });
};

const renderPredictions = predictions => {
  if (predictions.length === 0) {
    resultBox.innerHTML = "";
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }

  const results = {};
  predictions.forEach(prediction => {
    results[prediction.class] = prediction;
  });

  let elements = "";
  let score = "";
  Object.keys(results).forEach(key => {
    score = Math.round(results[key].score * 100);
    elements += `<div id="class">${results[key].class}</div> \
      <div id="score">${score}%</div> \
      <div id="position">${JSON.stringify(results[key].bbox)}</div>`;
  });
  resultBox.innerHTML = elements;

  renderBoxes(predictions);
};

const renderBoxes = predictions => {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  predictions.forEach(prediction => {
    const x = prediction.bbox[0];
    const y = prediction.bbox[1];
    const width = prediction.bbox[2];
    const height = prediction.bbox[3];
    // Draw the bounding box.
    ctx.strokeStyle = "#0000FF";
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, width, height);
  });
};
