(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var toggle = qs("[data-mobile-toggle]");
        var panel = qs("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = qs("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = qsa(".hero-slide", hero);
        var dots = qsa(".hero-dots button", hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(dotIndex);
                play();
            });
        });
        show(0);
        play();
    }

    function setupImages() {
        qsa("img").forEach(function (img) {
            img.addEventListener("error", function () {
                var holder = img.parentElement;
                if (holder) {
                    holder.classList.add("image-missing");
                    holder.setAttribute("data-title", img.getAttribute("alt") || "");
                }
            });
        });
    }

    function startVideo(shell) {
        var video = qs("video", shell);
        if (!video) {
            return;
        }
        var url = video.getAttribute("data-video");
        if (!url) {
            return;
        }
        function begin() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        shell.classList.add("is-playing");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (!video.getAttribute("src")) {
                video.setAttribute("src", url);
            }
            begin();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!video._hlsPlayer) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                video._hlsPlayer = hls;
                hls.on(window.Hls.Events.MANIFEST_PARSED, begin);
            } else {
                begin();
            }
            return;
        }
        if (!video.getAttribute("src")) {
            video.setAttribute("src", url);
        }
        begin();
    }

    function setupPlayers() {
        qsa(".player-shell").forEach(function (shell) {
            var cover = qs(".player-cover", shell);
            var video = qs("video", shell);
            if (cover) {
                cover.addEventListener("click", function () {
                    startVideo(shell);
                });
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!shell.classList.contains("is-playing")) {
                        startVideo(shell);
                    }
                });
            }
        });
    }

    function getParam(name) {
        return new URLSearchParams(window.location.search).get(name) || "";
    }

    function renderSearchCard(movie) {
        return [
            '<article class="movie-card">',
            '<a href="video/' + movie.id + '.html" class="movie-card-link" aria-label="' + escapeHtml(movie.title) + '">',
            '<span class="poster-wrap">',
            '<img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="poster-shade"></span>',
            '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
            '</span>',
            '<span class="card-body">',
            '<strong>' + escapeHtml(movie.title) + '</strong>',
            '<span class="card-line">' + escapeHtml(movie.oneLine) + '</span>',
            '<span class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</span>',
            '</span>',
            '</a>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function setupSearchPage() {
        var form = qs("[data-search-form]");
        var grid = qs("[data-search-results]");
        var status = qs("[data-search-status]");
        if (!form || !grid || !status || !window.SITE_MOVIES) {
            return;
        }
        var input = qs("[name='q']", form);
        var type = qs("[name='type']", form);
        var year = qs("[name='year']", form);
        var initialQuery = getParam("q");
        if (initialQuery && input) {
            input.value = initialQuery;
        }
        function apply() {
            var q = (input.value || "").trim().toLowerCase();
            var t = type.value;
            var y = year.value;
            var results = window.SITE_MOVIES.filter(function (movie) {
                var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
                var okQuery = !q || haystack.indexOf(q) !== -1;
                var okType = !t || movie.type === t;
                var okYear = !y || movie.year === y;
                return okQuery && okType && okYear;
            }).slice(0, 120);
            grid.innerHTML = results.map(renderSearchCard).join("");
            status.textContent = results.length ? "找到 " + results.length + " 条相关影片" : "未找到相关影片";
            setupImages();
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            apply();
        });
        [input, type, year].forEach(function (node) {
            if (node) {
                node.addEventListener("input", apply);
                node.addEventListener("change", apply);
            }
        });
        apply();
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupImages();
        setupPlayers();
        setupSearchPage();
    });
})();
