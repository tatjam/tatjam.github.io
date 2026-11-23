#let heading-tag(it) = html.elem("h" + str(it.level), it.body)

#let code-block(it) = {
  let attrs = if it.lang == none or it.lang == "" { (:) } else { (class: "language-" + it.lang) }
  html.elem("pre", html.elem("code", attrs: attrs, it.text))
}

#let pic(src, alt: "", style: none) = {
  let attrs = (src: src, alt: alt)
  if style != none { attrs.style = style }
  html.elem("img", attrs: attrs)
}

#let ext-script(src) = html.elem("script", attrs: (src: src))

#let video(src, vid-type: "video/mp4", width: "50%", center: false) = {
  let attrs = (width: width, controls: "")
  if center { attrs.style = "margin: 0 auto" }
  let player = html.elem(
    "video",
    attrs: attrs,
    html.elem("source", attrs: (src: src, type: vid-type))
      + [Your browser does not support the video tag],
  )
  if center { html.elem("div", attrs: (style: "text-align: center"), player) } else { player }
}

#let post(title: "", date: "", summary: "", extra-head: none, body) = {
  set document(title: title, description: summary)
  show heading: heading-tag
  show raw.where(block: true): code-block
  [#metadata((date: date, summary: summary, extra-head: extra-head)) <post-meta>]
  body
}
