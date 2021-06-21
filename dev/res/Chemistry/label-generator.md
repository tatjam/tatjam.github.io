Label Generator
2021-06-21
A chemical label generator designed with ease of use and beautiful labels in mind

This is a very valuable tool that's surprisingly not available online. I decided to make a simple solution
that could be quickly used to generate beautiful labels, a must have in any lab.

---

<style>
* {
  box-sizing: border-box;
}

/* Create two equal columns that floats next to each other */
.column {
  float: left;
  width: 50%;
  padding: 10px;
}

/* Clear floats after the columns */
.row:after {
  content: "";
  display: table;
  clear: both;
}

input {
    margin-top: 5px;
    margin-bottom:15px;
}

input[type=checkbox] {
    margin-bottom: -5px;
    margin-top: 0px;
}

canvas.ChemDoodleWebComponent {
    border:none;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}

</style>

# Inputs

<div class="row">
<div class="column">

<h3>Basic</h3>

You may only enter one of the options.<br>

<label for="smiles">CID: </label>
<input type="text" id="cid" name="cid" value="276350" onchange="change_name('cid')">

<br>

<label for="smiles">SMILES: </label>
<input type="text" id="smiles" name="smiles" onchange="change_name('smiles')">

<br>

<label for="smiles">Name (First Match): </label>
<input type="text" id="name-fm" name="name-fm" onchange="change_name('name-fm')">

<br>

<label for="type">Label presets:</label>
<select name="type" id="type" onchange="change_preset(this.value)">
    <option value="compact">Compact Label</option>
    <option value="small">Small Label</option>
    <option value="normal" selected="selected">Normal Label</option>
    <option value="detailed">Detailed Label</option>
</select>
(Changes customization!)

<br>


<h3>Renderer Settings</h3>

<input type="checkbox" id="use-pubchem" name="use-pubchem" value="Use Pubchem" onchange="generate()">
<label for="use-pubchem">Use PubChem image instead of generated one. <b>NOT DOWNLOADABLE!</b></label><br>

<br>

<label for="bond-length">Image Scale: </label>
<input type="number" id="bond-length" value=1.5 name="bond-length" onchange="generate()" min="0" max="5">

<br>

<label for="bond-width">Bond Width (Pixels): </label>
<input type="number" id="bond-width" value=1 name="bond-width" onchange="generate()">

<br>

<input type="checkbox" id="use-colors" name="use-colors" value="Use Colors" checked onchange="generate()">
<label for="use-colors">Use colored atoms</label><br>

<br>

<input type="checkbox" id="terminal-carbons" name="terminal-carbons" value="Use Terminal Carbons" onchange="generate()">
<label for="terminal-carbons">Draw terminal carbons as CH<sub>3</sub></label><br>

<label for="iheight">Atom Size: </label>
<input type="number" id="atom-radius" value=4 name="atom-radius" onchange="generate()">

<br>

<input type="checkbox" id="circle-atoms" name="circle-atoms" value="Use Circular Carbons" onchange="generate()">
<label for="circle-atoms">Draw atoms as a circle<br>

</div>
<div class="column">

<h3>Customization</h3>

<label for="layout_type">Layout type: </label>
<select name="layout_type" id="layout_type" onchange="generate()">
    <option value="hor">Horizontal</option>
    <option value="ver">Vertical</option>
    <option value="corners" selected="selected">Corners</option>
</select>

<br>

<label for="custom_name">Custom Name: </label>
<input type="text" id="custom_name" placeholder="Default (Allows HTML)" name="custom_name" onchange="generate()">

<br>

<label for="custom_text">Custom Text: </label>
<textarea type="text" id="custom_text" placeholder="None (Allows HTML)" name="custom_text" onchange="generate()"></textarea>

<br>

<label for="custom_text">Custom Formula: </label>
<input type="text" id="custom_formula" placeholder="Example: CuSO4*5H2O" name="custom_formula" onchange="generate()"></input>

<br>

<label for="iwidth">Image Width: </label>
<input type="number" id="iwidth" value=300 name="iwidth" onchange="generate()">

<br>

<label for="iheight">Image Height: </label>
<input type="number" id="iheight" value=300 name="iheight" onchange="generate()">

<br>

<label for="margins">Margins: </label>
<input type="number" id="margins" value=3 name="margins" onchange="generate()">

<br>

<label for="hazard_type">Hazard type:</label>
<select name="hazard_type" id="hazard_type" onchange="generate()">
    <option value="none">No Hazards Shown</option>
    <option value="danger">GHS Danger (Force)</option>
    <option value="ghs" selected="selected">GHS Hazards</option>
    <option value="ghs-nt">GHS Hazards (No Text)</option>
</select>

<br>

<label for="ghs_size">Hazard Icon Size: </label>
<input type="number" id="ghs_size" value=64 name="ghs_size" onchange="generate()">

<br>

<label for="custom_text">Extra Hazard Text: </label>
<textarea type="text" id="hazard_text" placeholder="None (Allows HTML)" name="hazard_text" onchange="generate()"></textarea>

<br>
<br>

<input type="checkbox" id="unknown-hazard" name="unknown-hazard" value="Unknown Hazard" checked onchange="generate()">
<label for="unknown-hazard">Use Unknown Hazard Symbol</label><br>

<br>

<input type="checkbox" id="formula" name="formula" value="Formula" checked onchange="generate()">
<label for="formula">Formula</label><br>

<br>

<input type="checkbox" id="molar-mass" name="molar-mass" value="Molar Mass" checked onchange="generate()">
<label for="molar-mass">Molar Mass</label><br>

<br>

</div>
</div>


# Results

<div id="generated" style="background-color:#ffffff;padding-top:0px;overflow:visible;">
<div id="margin-holder" style="border:solid 1px;display:inline-block;padding-top:0px;">
    <div id="base-text">
    <h3 id="cname"></h3>
    <p id="ctext"></p>
    <p id="cformula"></p>
    <p id="mmass"></p>
    </div>

    <div id="ghs">
        <img id="ghs-corrosive" style="width:64px;" src="/external/ghs/corrosive.svg"></img>
        <img id="ghs-environment" style="width:64px;" src="/external/ghs/environment.svg"></img>
        <img id="ghs-gas" style="width:64px;" src="/external/ghs/gas.svg"></img>
        <img id="ghs-harmful" style="width:64px;" src="/external/ghs/harmful.svg"></img>
        <img id="ghs-hazard" style="width:64px;" src="/external/ghs/hazard.svg"></img>
        <img id="ghs-oxidizer" style="width:64px;" src="/external/ghs/oxidizer.svg"></img>
        <img id="ghs-explosive" style="width:64px;" src="/external/ghs/explosive.svg"></img>
        <img id="ghs-flammable" style="width:64px;" src="/external/ghs/flammable.svg"></img>
        <img id="ghs-toxic" style="width:64px;" src="/external/ghs/toxic.svg"></img>
        <img id="ghs-unknown" style="width:64px;" src="/external/ghs/unknown.svg"></img>
        <p id="ghs-string"></p>
        <p id="ghs-extra"></p>
    </div>

    <div id="images">
    <img id="image" style="width:auto;"></img>
    <canvas id="chem-doodle-canvas"></canvas>
    </div>

</div>
</div>

<div id="holder"></div>

To download the file, you can right-click and save the image. Alternatively, you may copy-paste the image
into an image editing software to print multiple labels at once.

If you have used the pubchem images, you must take a screenshot with a screenshot software, such as Window's
Snipping Tool. 
This limitation has to do with how JavaScript handles off-site resources, and cannot be fixed easily.

# Credits

PubChem is used to obtain the information and GHS hazard information. Optionally, it's also used to obtain
a representation of the molecule.

OpenBabel is used to convert the SMILES given by PubChem into a MOL file, and to generate the position
of the atoms inside of this file.
ChemDoodle is used to draw the MOL file into a canvas, allowing the image to be downloaded.

Lastly, html2canvas allows converting the label into a downloadable image.

GHS pictograms (Including the unofficial question mark one) were obtained from Wikipedia, they are in the public domain.

[I (tatjam)](https://www.github.com/tatjam) have glued these great tools together into this generator. You can give feedback
and check the source code at [github](https://github.com/tatjam/tatjam.github.io).

<script src="/external/html2canvas/html2canvas.min.js"></script>
<link rel="stylesheet" href="/external/chemdoodle/ChemDoodleWeb.css" type="text/css">
<script type="text/javascript" src="/external/chemdoodle/ChemDoodleWeb.js"></script>
<script src="/external/openbabel/openbabel.js"></script>
<script src="/external/label-generator.js">