document.addEventListener('DOMContentLoaded', function () {
	var btn = document.getElementById('theme-toggle');
	if (!btn) return;

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

		document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
	});
});
