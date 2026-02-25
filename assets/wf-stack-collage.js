(function () {
  function isNearBlack(r, g, b) {
    return r < 24 && g < 24 && b < 24;
  }

  function knockOutEdgeBlack(img) {
    if (!img || img.dataset.bgProcessed === "true") return;
    var src = img.getAttribute("src") || "";
    if (!src || src.indexOf("stack-collage-placeholder") !== -1) return;

    var width = img.naturalWidth || img.width;
    var height = img.naturalHeight || img.height;
    if (!width || !height) return;

    var maxDim = 1200;
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
      var visited = new Uint8Array(cw * ch);
      var queue = [];

      function idx(x, y) {
        return y * cw + x;
      }

      function pushIfBlack(x, y) {
        if (x < 0 || y < 0 || x >= cw || y >= ch) return;
        var i = idx(x, y);
        if (visited[i]) return;
        var p = i * 4;
        if (!isNearBlack(data[p], data[p + 1], data[p + 2])) return;
        visited[i] = 1;
        queue.push(i);
      }

      for (var x = 0; x < cw; x++) {
        pushIfBlack(x, 0);
        pushIfBlack(x, ch - 1);
      }
      for (var y = 0; y < ch; y++) {
        pushIfBlack(0, y);
        pushIfBlack(cw - 1, y);
      }

      while (queue.length) {
        var current = queue.pop();
        var px = current % cw;
        var py = Math.floor(current / cw);
        var p4 = current * 4;
        data[p4 + 3] = 0;

        pushIfBlack(px + 1, py);
        pushIfBlack(px - 1, py);
        pushIfBlack(px, py + 1);
        pushIfBlack(px, py - 1);
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
    var imgs = document.querySelectorAll(".wf-stack-collage__img[data-wf-stack-image='1']");
    imgs.forEach(function (img) {
      if (img.complete) {
        knockOutEdgeBlack(img);
      } else {
        img.addEventListener("load", function () { knockOutEdgeBlack(img); }, { once: true });
      }
    });
  }

  window.addEventListener("load", function () {
    processAllCollageImages();
    setTimeout(processAllCollageImages, 250);
    setTimeout(processAllCollageImages, 900);
  });
})();
