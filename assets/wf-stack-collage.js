(function() {
  function removeWhiteBackground(img) {
    if (!img || img.dataset.bgProcessed === "true") return;
    var src = img.getAttribute("src") || "";
    if (!src || src.indexOf("stack-collage-placeholder") !== -1) return;

    var width = img.naturalWidth || img.width;
    var height = img.naturalHeight || img.height;
    if (!width || !height) return;

    var maxDim = 900;
    var scale = Math.min(1, maxDim / Math.max(width, height));
    var cw = Math.max(1, Math.round(width * scale));
    var ch = Math.max(1, Math.round(height * scale));

    var canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    var ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    try {
      ctx.drawImage(img, 0, 0, cw, ch);
      var imageData = ctx.getImageData(0, 0, cw, ch);
      var data = imageData.data;

      for (var i = 0; i < data.length; i += 4) {
        var r = data[i];
        var g = data[i + 1];
        var b = data[i + 2];
        var a = data[i + 3];
        if (a === 0) continue;

        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var sat = max === 0 ? 0 : (max - min) / max;
        var light = (r + g + b) / 3;

        if (light > 246 && sat < 0.2) {
          data[i + 3] = 0;
          continue;
        }

        if (light > 232 && sat < 0.23) {
          var keep = Math.max(0, Math.min(1, (242 - light) / 14));
          data[i + 3] = Math.round(a * keep);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      img.setAttribute("src", canvas.toDataURL("image/png"));
      img.classList.add("wf-stack-collage__img--bg-cutout");
      img.dataset.bgProcessed = "true";
    } catch (error) {
      img.dataset.bgProcessed = "true";
    }
  }

  function processAllCollageImages() {
    var imgs = document.querySelectorAll(".wf-stack-collage__img");
    imgs.forEach(function(img) {
      if (img.complete) {
        removeWhiteBackground(img);
      } else {
        img.addEventListener("load", function() { removeWhiteBackground(img); }, { once: true });
      }
    });
  }

  window.addEventListener("load", function() {
    processAllCollageImages();
    setTimeout(processAllCollageImages, 300);
    setTimeout(processAllCollageImages, 1000);
  });
})();
