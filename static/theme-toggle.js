document.addEventListener('DOMContentLoaded', function () {
	var btn = document.getElementById('theme-toggle');
	if (btn) {
		function syncToggle() {
			var root = document.documentElement;
			var current = root.getAttribute('data-theme');
			var systemDark = window.matchMedia &&
				window.matchMedia('(prefers-color-scheme: dark)').matches;
			var isDark = current ? current === 'dark' : systemDark;
			var label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
			btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
			btn.setAttribute('aria-label', label);
			btn.title = label;
		}

		syncToggle();
		btn.addEventListener('click', function () {
			var root = document.documentElement;
			var current = root.getAttribute('data-theme');
			var systemDark = window.matchMedia &&
				window.matchMedia('(prefers-color-scheme: dark)').matches;

			var isDark = current ? current === 'dark' : systemDark;
			var next = isDark ? 'light' : 'dark';

			root.setAttribute('data-theme', next);
			try {
				localStorage.setItem('theme', next);
			} catch (e) {
			}

			syncToggle();
			document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
		});
	}

	var topbar = document.querySelector('.topbar');
	if (topbar) {
		function syncStickyTop() {
			document.documentElement.style.setProperty('--sticky-top', topbar.offsetHeight + 'px');
		}
		syncStickyTop();
		if (window.ResizeObserver) {
			new ResizeObserver(syncStickyTop).observe(topbar);
		} else {
			window.addEventListener('resize', syncStickyTop);
		}
	}

	var bar = document.querySelector('.reading-progress');
	if (bar) {
		function updateProgress() {
			var max = document.documentElement.scrollHeight - window.innerHeight;
			var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
			bar.style.width = (ratio * 100).toFixed(2) + '%';
		}
		window.addEventListener('scroll', updateProgress, { passive: true });
		window.addEventListener('resize', updateProgress);
		updateProgress();
	}
});
