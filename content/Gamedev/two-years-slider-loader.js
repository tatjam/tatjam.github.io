var head = document.getElementsByTagName("head")[0],
cssLink = document.createElement("link");

cssLink.href = "../external/slider/before-effect-slider.min.css";
cssLink.id="dynamic-css";
cssLink.media="screen";
cssLink.type="text/css";
cssLink.rel = "stylesheet";

head.appendChild(cssLink);

scriptLink = document.createElement("script")
scriptLink.type = "text/javascript"
scriptLink.src = "../external/slider/before-effect-slider.js"
head.appendChild(scriptLink)
