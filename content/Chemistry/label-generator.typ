#import "../lib.typ": *

#show: post.with(
  title: "Label Generator",
  date: "2021-06-21",
  summary: "A chemical label generator designed with ease of use and beautiful labels in mind",
  extra-head: "<style>#page, .intro, .intro.p { max-width: var(--content-width-wide); }</style><style>.main {text-align: left;}</style>",
)

#let field(id, label, type: "text", extra: (:)) = [
  #html.elem("label", attrs: ("for": id), label)
  #html.elem("input", attrs: (
    type: type,
    id: id,
    name: id,
    onchange: "generate()",
    ..extra,
  ))
]

#let check(id, label, checked: false, extra: (:)) = {
  let attrs = (
    type: "checkbox",
    id: id,
    name: id,
    onchange: "generate()",
    ..extra,
  )
  if checked { attrs.checked = "" }
  (
    html.elem("input", attrs: attrs)
      + html.elem("label", attrs: ("for": id), label)
  )
}

#let radio(name, id, label, selected: false) = {
  let attrs = (type: "radio", name: name, id: id, onchange: "generate()")
  if selected { attrs.checked = "" }
  html.elem("input", attrs: attrs) + label
}

#let ghs-check(id, icon) = html.elem(
  "div",
  attrs: (class: "columncheck"),
  html.elem("input", attrs: (
    type: "checkbox",
    id: id,
    class: "columncheck",
    onchange: "generate()",
  ))
    + html.elem("label", attrs: ("for": id), pic(icon, style: "width:32px;")),
)

#let select(id, options, onchange: "generate()") = html.elem(
  "select",
  attrs: (name: id, id: id, onchange: onchange),
  options
    .map(((value, text, selected)) => {
      let attrs = (value: value)
      if selected { attrs.selected = "selected" }
      html.elem("option", attrs: attrs, text)
    })
    .join(),
)

This is a very valuable tool that's surprisingly not available online. I decided to make a simple solution
that could be quickly used to generate beautiful labels, a must have in any lab.

#divider()

#html.style(read("label-generator.css"))

= Inputs

In the inputs that allow HTML you can use `<br>` to input a line break. You can also use any other HTML tags!
For example, `<b>Text</b>` shows bold text and `<i>Wathever</i>` shows italic text.

#html.elem("div", attrs: (class: "columns"), [
  #html.elem("div", attrs: (class: "column"), [
    #html.elem("h3", [Basic])

    You may only enter one of the options.
    

    #field("cid", [PubChem's CID: ], extra: (
      value: "276350",
      onchange: "change_name('cid')",
    ))

    

    #field("smiles", [SMILES: ], extra: (onchange: "change_name('smiles')"))

    

    #field("name-fm", [Name (First Match): ], extra: (
      onchange: "change_name('name-fm')",
    ))

    

    #html.elem("label", attrs: ("for": "type"), [Label presets:])
    #select(
      "type",
      (
        ("compact", [Compact Label], false),
        ("small", [Small Label], false),
        ("normal", [Normal Label], true),
        ("detailed", [Detailed Label], false),
      ),
      onchange: "change_preset(this.value)",
    )
    (Changes customization!)

    

    #html.elem("h3", [Renderer Settings])

    This setting may be useful if the generated image is buggy or you are working with coordination complexes which
    are not very well supported.
    

    #check(
      "use-pubchem",
      [Use PubChem image instead of generated one. #strong[Download by screenshot!]],
    )

    

    #html.elem("div", attrs: (id: "image-settings"), [
      #field("bond-length", [Image Scale: ], type: "number", extra: (
        value: "1.5",
        min: "0",
        max: "5",
      ))

      

      #field("bond-width", [Bond Width (Pixels): ], type: "number", extra: (
        value: "1",
      ))

      

      #check("use-colors", [Use colored atoms], checked: true)

      

      #check(
        "terminal-carbons",
        [Draw terminal carbons as CH#html.elem("sub", [3])],
      )

      #field("atom-radius", [Atom Size: ], type: "number", extra: (value: "4"))

      

      #check("circle-atoms", [Draw atoms as a circle])
    ])
  ])

  #html.elem("div", attrs: (class: "column"), [
    #html.elem("h3", [Customization])

    #html.elem("p", [
      #html.elem("label", attrs: ("for": "layout_type"), [Layout type: ])
      #select("layout_type", (
        ("hor", [Horizontal], false),
        ("ver", [Vertical], false),
        ("corners", [Corners], true),
      ))
    ])

    #html.elem("p", [
      #html.elem("label", attrs: ("for": "custom_name"), [Custom Name: ])
      #html.elem("input", attrs: (
        type: "text",
        id: "custom_name",
        placeholder: "Default (Allows HTML)",
        name: "custom_name",
        onchange: "generate()",
      ))
    ])

    #html.elem("p", [
      #html.elem("label", attrs: ("for": "custom_text"), [Custom Text: ])
      #html.elem("textarea", attrs: (
        id: "custom_text",
        placeholder: "None (Allows HTML)",
        name: "custom_text",
        onchange: "generate()",
      ))
    ])

    #html.elem("p", [
      #html.elem("label", attrs: ("for": "custom_prop"), [Custom Properties: ])
      #html.elem("textarea", attrs: (
        id: "custom_prop",
        placeholder: "None (Allows HTML)",
        name: "custom_prop",
        onchange: "generate()",
      ))
    ])

    #html.elem("p", [
      #html.elem("label", attrs: ("for": "custom_text"), [Custom Formula: ])
      #html.elem("input", attrs: (
        type: "text",
        id: "custom_formula",
        placeholder: "Example: CuSO4*5H2O",
        name: "custom_formula",
        onchange: "generate()",
      ))
    ])

    #html.elem("p", check("show-image", [Show Image], checked: true, extra: (
      value: "Image",
    )))

    #html.elem("p", field("iwidth", [Image Width: ], type: "number", extra: (
      value: "300",
    )))

    #html.elem("p", field("iheight", [Image Height: ], type: "number", extra: (
      value: "300",
    )))

    #html.elem("p", field("margins", [Margins: ], type: "number", extra: (
      value: "3",
    )))
  ])

  #html.elem("div", attrs: (class: "column"), [
    #html.elem("h3", [Hazard Configuration])

    #html.elem("p", [
      #html.elem("label", attrs: ("for": "hazard_type"), [Hazard type:])
      #select("hazard_type", (
        ("none", [No Hazards Shown], false),
        ("danger", [GHS Danger (Force)], false),
        ("ghs", [GHS Hazards], false),
        ("ghs-custom", [Custom GHS Hazards], false),
        ("nfpa-custom", [NFPA diamond (Manual input)], false),
        ("ghs-nt", [GHS Hazards (No Text)], true),
      ))
    ])

    #html.elem("div", attrs: (id: "custom-ghs", class: "checks"), [
      You may toggle the icons manually. Insert the appropriate text into Extra Hazard Text.
      

      #ghs-check("custom-ghs-explosive", "/external/ghs/explosive.svg")
      #ghs-check("custom-ghs-flammable", "/external/ghs/flammable.svg")
      #ghs-check("custom-ghs-oxidizer", "/external/ghs/oxidizer.svg")
      #ghs-check("custom-ghs-gas", "/external/ghs/gas.svg")
      #ghs-check("custom-ghs-corrosive", "/external/ghs/corrosive.svg")
      #ghs-check("custom-ghs-toxic", "/external/ghs/toxic.svg")
      #ghs-check("custom-ghs-harmful", "/external/ghs/harmful.svg")
      #ghs-check("custom-ghs-hazard", "/external/ghs/hazard.svg")
      #ghs-check("custom-ghs-environment", "/external/ghs/environment.svg")
    ])

    #html.elem("div", attrs: (id: "custom-nfpa"), [
      #html.elem("div", attrs: (class: "row"), [Fire:
        #radio("fire", "fire-0", [0])
        #radio("fire", "fire-1", [1])
        #radio("fire", "fire-2", [2])
        #radio("fire", "fire-3", [3])
        #radio("fire", "fire-4", [4])
        #radio("fire", "fire-u", [?], selected: true)
      ])
      #html.elem("div", attrs: (class: "row"), [Health:
        #radio("health", "health-0", [0])
        #radio("health", "health-1", [1])
        #radio("health", "health-2", [2])
        #radio("health", "health-3", [3])
        #radio("health", "health-4", [4])
        #radio("health", "health-u", [?], selected: true)
      ])
      #html.elem("div", attrs: (class: "row"), [Reactivity:
        #radio("react", "react-0", [0])
        #radio("react", "react-1", [1])
        #radio("react", "react-2", [2])
        #radio("react", "react-3", [3])
        #radio("react", "react-4", [4])
        #radio("react", "react-u", [?], selected: true)
      ])
      #html.elem("div", attrs: (class: "row"), [Other:
        #radio("special", "special-ox", [OX])
        #radio("special", "special-w", html.elem("s", [W]))
        #radio("special", "special-sa", [SA])
        #radio("special", "special-cor", [COR])
        #radio("special", "special-acid", [ACID])
        #radio("special", "special-alk", [ALK])
        #radio("special", "special-bio", [☣])
        #radio("special", "special-rad", [☢])
        #radio("special", "special-cry", [CRY])
        #radio("special", "special-u", [None], selected: true)
      ])
    ])

    #html.elem("p", field(
      "ghs_size",
      [Hazard Icon Size: ],
      type: "number",
      extra: (value: "64"),
    ))

    #html.elem("p", [
      #html.elem("label", attrs: ("for": "custom_text"), [Extra Hazard Text: ])
      #html.elem("textarea", attrs: (
        id: "hazard_text",
        placeholder: "None (Allows HTML)",
        name: "hazard_text",
        onchange: "generate()",
      ))
    ])

    #html.elem("p", check(
      "unknown-hazard",
      [Use Unknown Hazard Symbol],
      checked: true,
      extra: (value: "Unknown Hazard"),
    ))

    #html.elem("h3", [Other Configurations])
    #html.elem(
      "p",
      [(Warning: Some may not be available, or not correctly extracted!)],
    )

    #html.elem("div", attrs: (class: "columns"), [
      #html.elem("div", attrs: (class: "column"), [
        #html.elem("p", check("formula", [Formula], checked: true, extra: (
          value: "Formula",
        )))
        #html.elem("p", check(
          "molar-mass",
          [Molar Mass],
          checked: true,
          extra: (value: "Molar Mass"),
        ))
        #html.elem("p", check("melting", [Density], checked: true, extra: (
          value: "Melting",
        )))
        #html.elem("p", check(
          "melting",
          [Melting Point],
          checked: true,
          extra: (value: "Melting"),
        ))
      ])

      #html.elem("div", attrs: (class: "column"), [
        #html.elem("p", check(
          "boiling",
          [Boiling Point],
          checked: true,
          extra: (value: "Boiling"),
        ))
        #html.elem("p", check("flash", [Flash Point], checked: true, extra: (
          value: "flash",
        )))
        #html.elem("p", check("vapor", [Vapor Pressure], checked: true, extra: (
          value: "Vapor",
        )))
      ])
    ])

    #html.elem("p", [
      #field("density", [Pixel Density: ], type: "number", extra: (
        value: "2.5",
        min: "0.5",
        max: "8.0",
      ))
      High values may slow down your browser, but very low values will be very pixelated once you save them. The default
      value should be more than enough for printing.
    ])
  ])
])

= Results

Use this button if the molecule is badly rendered or atoms are clumped up, as there's an element of chance in the
molecule geometry engine.

#html.elem("button", attrs: (onclick: "generate()"), [Regenerate])

#html.elem(
  "div",
  attrs: (
    id: "generated",
    style: "background-color:#ffffff;padding-top:0px;overflow:visible;",
  ),
  [
    #html.elem(
      "div",
      attrs: (
        id: "margin-holder",
        style: "border:solid 1px;display:inline-block;padding-top:0px;",
      ),
      [
        #html.elem("div", attrs: (id: "base-text"), [
          #html.elem("h3", attrs: (id: "cname"))
          #html.elem("p", attrs: (id: "ctext"))
          #html.elem("p", attrs: (id: "cformula"))
          #html.elem("p", attrs: (id: "mmass"))
        ])

        #html.elem("div", attrs: (id: "custom-prop"), [
          #html.elem("p", attrs: (id: "dens"))
          #html.elem("p", attrs: (id: "temps"))
          #html.elem("p", attrs: (id: "vap"))
          #html.elem("p", attrs: (id: "expl"))
          #html.elem("p", attrs: (id: "cprop"))
        ])

        #html.elem("div", attrs: (id: "ghs"), [
          #html.elem("img", attrs: (
            id: "ghs-corrosive",
            style: "width:64px;",
            src: "/external/ghs/corrosive.svg",
          ))
          #html.elem("img", attrs: (
            id: "ghs-environment",
            style: "width:64px;",
            src: "/external/ghs/environment.svg",
          ))
          #html.elem("img", attrs: (
            id: "ghs-gas",
            style: "width:64px;",
            src: "/external/ghs/gas.svg",
          ))
          #html.elem("img", attrs: (
            id: "ghs-harmful",
            style: "width:64px;",
            src: "/external/ghs/harmful.svg",
          ))
          #html.elem("img", attrs: (
            id: "ghs-hazard",
            style: "width:64px;",
            src: "/external/ghs/hazard.svg",
          ))
          #html.elem("img", attrs: (
            id: "ghs-oxidizer",
            style: "width:64px;",
            src: "/external/ghs/oxidizer.svg",
          ))
          #html.elem("img", attrs: (
            id: "ghs-explosive",
            style: "width:64px;",
            src: "/external/ghs/explosive.svg",
          ))
          #html.elem("img", attrs: (
            id: "ghs-flammable",
            style: "width:64px;",
            src: "/external/ghs/flammable.svg",
          ))
          #html.elem("img", attrs: (
            id: "ghs-toxic",
            style: "width:64px;",
            src: "/external/ghs/toxic.svg",
          ))
          #html.elem("img", attrs: (
            id: "ghs-unknown",
            style: "width:64px;",
            src: "/external/ghs/unknown.svg",
          ))
          #html.elem("p", attrs: (id: "ghs-string"))
          #html.elem("p", attrs: (id: "ghs-extra"))
        ])

        #html.elem(
          "div",
          attrs: (id: "nfpa-float", style: "float:left; margin-left:-5rem"),
          [
            #html.elem(
              "div",
              attrs: (id: "nfpa-diamond", style: "scale:0.5;"),
              [
                #html.elem(
                  "table",
                  attrs: (border: "1", class: "nfpa"),
                  html.elem("tr", [
                    #html.elem(
                      "td",
                      attrs: (
                        style: "background:#ff0030; width=100px; height=100px;",
                      ),
                      html.elem("div", attrs: (class: "nfpatab"), html.elem(
                        "p",
                        attrs: (
                          id: "nfpa-fire",
                          class: "nfpatext",
                          style: "top:-10px; right:0px; font-size:35px;",
                        ),
                        [1],
                      )),
                    )
                    #html.elem(
                      "td",
                      attrs: (
                        style: "background:#ffdc45; width=100px; height=100px;",
                      ),
                      html.elem("div", attrs: (class: "nfpatab"), html.elem(
                        "p",
                        attrs: (
                          id: "nfpa-react",
                          class: "nfpatext",
                          style: "top:-10px; right:0px; font-size:35px;",
                        ),
                        [2],
                      )),
                    )
                  ])
                    + html.elem("tr", [
                      #html.elem(
                        "td",
                        attrs: (
                          style: "background:#008aca; width=100px; height=100px;",
                        ),
                        html.elem("div", attrs: (class: "nfpatab"), html.elem(
                          "p",
                          attrs: (
                            id: "nfpa-health",
                            class: "nfpatext",
                            style: "top:-10px; right:0px; font-size:35px;",
                          ),
                          [3],
                        )),
                      )
                      #html.elem(
                        "td",
                        attrs: (
                          style: "background:white; width=100px; height=100px;",
                        ),
                        html.elem("div", attrs: (class: "nfpatab"), html.elem(
                          "p",
                          attrs: (
                            id: "nfpa-special",
                            class: "nfpatext",
                            style: "right:0px; font-size:35px; top:-10px;",
                          ),
                        )),
                      )
                    ]),
                )
              ],
            )
          ],
        )

        #html.elem("div", attrs: (id: "images"), [
          #html.elem("img", attrs: (id: "image", style: "width:auto;"))
          #html.elem("canvas", attrs: (id: "chem-doodle-canvas"))
        ])
      ],
    )
  ],
)

#html.elem("div", attrs: (id: "holder"))

To download the file, you can right-click and save the image. Alternatively, you may copy-paste the image
into an image editing software to print multiple labels at once.

If you have used the pubchem images, you must take a screenshot with a screenshot software, such as Window's
Snipping Tool.
This limitation has to do with how JavaScript handles off-site resources, and cannot be fixed easily.

= Credits

PubChem is used to obtain the information and GHS hazard information. Optionally, it's also used to obtain
a representation of the molecule.

OpenBabel is used to convert the SMILES given by PubChem into a MOL file, and to generate the position
of the atoms inside of this file.
ChemDoodle is used to draw the MOL file into a canvas, allowing the image to be downloaded.

Lastly, html2canvas allows converting the label into a downloadable image.

GHS pictograms (Including the unofficial question mark one) were obtained from Wikipedia, they are in the public domain.

#link("https://www.github.com/tatjam")[I (tatjam)] have glued these great tools together into this generator. You can give feedback
and check the source code at #link("https://github.com/tatjam/tatjam.github.io")[github].

#ext-script("/external/html2canvas/html2canvas.min.js")

#html.elem("link", attrs: (
  rel: "stylesheet",
  href: "/external/chemdoodle/ChemDoodleWeb.css",
  type: "text/css",
))

#ext-script("/external/chemdoodle/ChemDoodleWeb.js")

#ext-script("/external/openbabel/openbabel.js")

#ext-script("/external/label-generator.js")
