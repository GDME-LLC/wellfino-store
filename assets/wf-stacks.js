(function() {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function fetchStacks(url) {
    return fetch(url, { credentials: "same-origin" }).then(function(response) {
      if (!response.ok) throw new Error("Failed to load stacks.");
      return response.json();
    });
  }

  function renderIndex(container, stacks) {
    var html = stacks.map(function(stack) {
      var image = stack.hero_image
        ? '<img class="wf-stack-card__img" src="' + escapeHtml(stack.hero_image) + '" alt="' + escapeHtml(stack.name) + '" loading="lazy">'
        : '<div class="wf-stack-card__img wf-stack-card__img--placeholder" aria-hidden="true">Stack</div>';
      return '' +
        '<article class="wf-tile wf-stack-card">' +
          image +
          '<h3>' + escapeHtml(stack.name) + '</h3>' +
          '<p>' + escapeHtml(stack.short_description) + '</p>' +
          '<a class="wf-btn wf-btn--primary" href="/pages/' + escapeHtml(stack.handle) + '">Shop Stack</a>' +
        '</article>';
    }).join("");
    container.innerHTML = html;
  }

  function renderDetail(container, stack) {
    var includes = Array.isArray(stack.includes) && stack.includes.length
      ? stack.includes.map(function(item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("")
      : "<li>Foundational daily support selected for routine consistency.</li>";
    var stackOptionsUrl = stack.endpoint_type === "product"
      ? stack.endpoint_url + "#stack-options"
      : stack.endpoint_url;
    var image = stack.hero_image
      ? '<img class="wf-stack-hero__img" src="' + escapeHtml(stack.hero_image) + '" alt="' + escapeHtml(stack.name) + '" loading="lazy">'
      : '<div class="wf-stack-hero__img wf-stack-hero__img--placeholder" aria-hidden="true">Stack Preview</div>';

    container.innerHTML = '' +
      '<section class="wf-stack-hero">' +
        '<div class="wf-stack-hero__content">' +
          '<h1>' + escapeHtml(stack.name) + '</h1>' +
          '<p class="wf-stack-hero__why">' + escapeHtml(stack.why_it_matters) + '</p>' +
          '<h2>What\'s Included</h2>' +
          '<ul class="wf-stack-includes">' + includes + '</ul>' +
          '<div class="wf-stack-cta">' +
            '<a class="wf-btn wf-btn--primary" href="' + escapeHtml(stack.endpoint_url) + '">Shop Stack</a>' +
            '<a class="wf-btn" href="' + escapeHtml(stackOptionsUrl) + '">View Stack Options</a>' +
          '</div>' +
          '<ul class="wf-trust-strip" aria-label="Wellfino trust standards">' +
            '<li>&#10003; Packaged in the USA</li>' +
            '<li>&#10003; Manufactured in FDA-Registered Facilities</li>' +
            '<li>&#10003; GMP-Certified Production</li>' +
            '<li>&#10003; Third-Party Tested for Quality</li>' +
          '</ul>' +
        '</div>' +
        '<div class="wf-stack-hero__media">' + image + '</div>' +
      '</section>';
  }

  function renderError(container, message) {
    container.innerHTML = '<div class="wf-tile"><h3>Stack unavailable</h3><p>' + escapeHtml(message) + '</p></div>';
  }

  function initIndex() {
    var container = document.querySelector("[data-stacks-index]");
    if (!container) return;
    var url = container.getAttribute("data-stacks-url");
    fetchStacks(url).then(function(stacks) {
      renderIndex(container, stacks);
    }).catch(function() {
      renderError(container, "Unable to load stacks right now.");
    });
  }

  function initDetail() {
    var container = document.querySelector("[data-stack-detail]");
    if (!container) return;
    var handle = container.getAttribute("data-stack-handle");
    var url = container.getAttribute("data-stacks-url");
    fetchStacks(url).then(function(stacks) {
      var stack = stacks.find(function(entry) { return entry.handle === handle; });
      if (!stack) {
        renderError(container, "No stack configuration found for this page handle.");
        return;
      }
      renderDetail(container, stack);
    }).catch(function() {
      renderError(container, "Unable to load stack details right now.");
    });
  }

  initIndex();
  initDetail();
})();
