document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var filterRoots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
    filterRoots.forEach(function (root) {
        var input = root.querySelector('[data-search-input]');
        var select = root.querySelector('[data-filter-select]');
        var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
        var empty = root.querySelector('[data-empty-state]');

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var selected = select ? select.value : 'all';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' ').toLowerCase();
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchSelect = selected === 'all' || haystack.indexOf(selected.toLowerCase()) !== -1;
                var show = matchKeyword && matchSelect;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (select) {
            select.addEventListener('change', applyFilter);
        }
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (box) {
        var video = box.querySelector('video');
        var button = box.querySelector('[data-play-button]');
        var source = box.getAttribute('data-video-src');
        var attached = false;

        function attachSource() {
            if (!video || !source || attached) {
                return;
            }

            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                box._hls = hls;
            } else {
                video.src = source;
            }
        }

        function startPlayback() {
            attachSource();
            if (button) {
                button.classList.add('is-hidden');
            }
            if (video) {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            }
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
        }
    });
});
