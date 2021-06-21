var data_done = false;
var clasif_done = false;


var OpenBabel = OpenBabelModule();
OpenBabel.onRuntimeInitialized = function()
{
    generate();
}

// Set element colors
ChemDoodle.ELEMENT["H"].jmolColor = "#4f7474";
ChemDoodle.ELEMENT["Cl"].jmolColor = "#34c334";
ChemDoodle.ELEMENT["S"].jmolColor = "#b09d45";
ChemDoodle.ELEMENT["F"].jmolColor = "#bd2183";

// https://stackoverflow.com/questions/2481350/how-to-get-scrollbar-position-with-javascript
getScroll = function() {
    if (window.pageYOffset != undefined) {
        return [pageXOffset, pageYOffset];
    } else {
        var sx, sy, d = document,
            r = d.documentElement,
            b = d.body;
        sx = r.scrollLeft || b.scrollLeft || 0;
        sy = r.scrollTop || b.scrollTop || 0;
        return [sx, sy];
    }
}
function $(x) {return document.getElementById(x);}

function find_ghs(strings, node)
{
    for (var i = 0; i < node.length; i++)
    {
        for(var j = 0; j < strings.length; j++)
        {
            if (node[i]["Information"].Name.startsWith(strings[j]))
            {
                return true;
            }
        }
    }

    return false;
}

function get_ghs_string(node)
{
    var out = "";
    for (var i = 0; i < node.length; i++)
    {
        var name = node[i]["Information"].Name;
        if (name.startsWith("H") && name[1] >= '0' && name[1] <= '9')
        {
            out += node[i]["Information"].Name + "<br>";
        }
    }

    return out;
}

function hide_all_ghs()
{
    $("ghs-corrosive").style.display = "none";
    $("ghs-environment").style.display = "none";
    $("ghs-explosive").style.display = "none";
    $("ghs-gas").style.display = "none";
    $("ghs-harmful").style.display = "none";
    $("ghs-hazard").style.display = "none";
    $("ghs-oxidizer").style.display = "none";
    $("ghs-flammable").style.display = "none";
    $("ghs-toxic").style.display = "none";
    $("ghs-unknown").style.display = "none";
}

function set_ghs_size(sizepx)
{
    var size = sizepx + "px";
    $("ghs-corrosive").style.width = size;
    $("ghs-environment").style.width = size;
    $("ghs-explosive").style.width = size;
    $("ghs-gas").style.width = size;
    $("ghs-harmful").style.width = size;
    $("ghs-hazard").style.width = size;
    $("ghs-oxidizer").style.width = size;
    $("ghs-toxic").style.width = size;
    $("ghs-unknown").style.width = size;
}

function set_ghs_shown(id, value)
{
    if(value == false)
    {
        $(id).style.display = "none";
    }
    else
    {
        $(id).style.display = "inline";
    }
}

function change_name(type)
{
    if(type == "smiles")
    {
        $("cid").value = "";
        $("name-fm").value = "";
    }
    else if(type == "cid")
    {
        $("smiles").value = "";
        $("name-fm").value = "";
    }
    else
    {
        $("smiles").value = "";
        $("cid").value = "";
    }

    generate();
}

function change_preset(value)
{
    if(value == "compact")
    {
        $("layout_type").value = "hor";
        $("iwidth").value = 100;
        $("iheight").value = 100;
        $("bond-length").value = 1.0;
        $("ghs_size").value = 50;
        $("margins").value = 4;
        $("hazard_type").value = "ghs-nt";
        $("formula").checked = true;
        $("molar-mass").checked = false;
    }
    else if(value == "small")
    {
        $("layout_type").value = "hor";
        $("iwidth").value = 200;
        $("iheight").value = 200;
        $("bond-length").value = 1.5;
        $("ghs_size").value = 64;
        $("margins").value = 6;
        $("hazard_type").value = "ghs-nt";
        $("formula").checked = true;
        $("molar-mass").checked = true;
    }
    else if(value == "normal")
    {
        $("layout_type").value = "corners";
        $("iwidth").value = 300;
        $("iheight").value = 300;
        $("bond-length").value = 2.0;
        $("ghs_size").value = 100;
        $("margins").value = 10;
        $("hazard_type").value = "ghs";
        $("formula").checked = true;
        $("molar-mass").checked = true;
    }
    else if(value == "detailed")
    {
        $("layout_type").value = "corners";
        $("iwidth").value = 600;
        $("iheight").value = 600;
        $("bond-length").value = 5.0;
        $("ghs_size").value = 120;
        $("margins").value = 15;
        $("hazard_type").value = "ghs";
        $("formula").checked = true;
        $("molar-mass").checked = true;
    }

    generate()
}


function generate()
{
    $("margin-holder").style.padding = $("margins").value + "px";
    $("generated").style.padding = "10px";
    position_elements();


    data_done = false;
    clasif_done = false;

    var type = "smiles";
    if($("cid").value != "")
    {
        type = "cid";
    }
    else if($("name-fm").value != "")
    {
        type = "name-fm";
    }

    var img_url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/";
    if(type == "smiles")
    {
        img_url += "smiles/";
        img_url += $("smiles").value;
    }
    else if(type == "name-fm")
    {
        img_url += "name/";
        img_url += $("name-fm").value;
    }
    else
    {
        img_url += "cid/";
        img_url += $("cid").value;
    }

    var data_url = img_url;

    img_url += "/png?image_size=";
    img_url += $("iwidth").value + "x" + $("iheight").value;

    if($("use-pubchem").checked)
    {
        $("image").src = img_url;
        $("image").width = $("iwidth").value;
        $("image").height = $("iheight").value;
        $("image").style.display="inline";
    }
    else
    {
        $("image").style.display="none";
    }
    var classif_url = data_url;
    data_url += "/property/Title,MolecularFormula,MolecularWeight,IsomericSMILES/JSON";
    classif_url += "/classification/JSON";

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200)
        {
            var obj = JSON.parse(this.responseText).PropertyTable.Properties[0];
            load_data(obj);
        }
    };
    xmlhttp.open("GET", data_url, true);
    xmlhttp.send();

    var xmlhttp2 = new XMLHttpRequest();
    xmlhttp2.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200)
        {
            var obj = JSON.parse(this.responseText).Hierarchies.Hierarchy;
            load_classif(obj);
        }
    };
    xmlhttp2.open("GET", classif_url, true);
    xmlhttp2.send();


}

// Mix of the OpenBabel wiki and ChemDoodle wiki
function render(smiles)
{

    if($("use-pubchem").checked)
    {
        return;
    }

    var conv = new OpenBabel.ObConversionWrapper();  // create ObConversionWrapper instance
    try
    {
        conv.setInFormat('', 'smi');  // set input format by file extension
        var mol = new OpenBabel.OBMol();  // create a new molecule object...
        conv.readString(mol, smiles);  // ... and load it with input data
        conv.setOutFormat('', 'mol');  // set out format by file extension

        // We also need to generate 2D coordinates
        var gen2d = OpenBabel.OBOp.FindType("Gen2D");
        gen2d.Do(mol, '');

        // Now we can read the data
        var outData = conv.writeString(mol, false);  // get output data, do not trim white spaces

        // And render it!
        let chem_mol = ChemDoodle.readMOL(outData);


        let canvas = new ChemDoodle.ViewerCanvas('chem-doodle-canvas', $("iwidth").value, $("iheight").value);
        canvas.styles.atoms_useJMOLColors = $("use-colors").checked;
        canvas.styles.atoms_circles_2D = $("circle-atoms").checked;
        canvas.styles.atoms_circleDiameter_2D = $("atom-radius").value * 2;
        canvas.styles.atoms_circleBorderWidth_2D = 0;
        canvas.styles.atoms_displayTerminalCarbonLabels_2D = $("terminal-carbons").checked;
        canvas.styles.atoms_font_size_2D = $("atom-radius").value * 2;
        canvas.styles.bonds_width_2D = $("bond-width").value;
        canvas.styles.atoms_font_bold_2D = true;

        $("chem-doodle-canvas").style.border = "none";

        canvas.loadMolecule(chem_mol);
        canvas.styles.scale = $("bond-length").value;
        canvas.repaint();
    }
    finally
    {
        conv.delete();  // free ObConversionWrapper instance

    }

}

function load_classif(obj)
{

    set_ghs_size($("ghs_size").value);

    if($("hazard_type").value == "none")
    {
        $("ghs").style.display = "none";
    }
    else
    {
        $("ghs").style.display = "inline";
    }

    if($("hazard_type").value == "danger")
    {
        hide_all_ghs();
        $("ghs-harmful").style.display = "inline";
        $("ghs-string").style.display = "none";
    }
    else
    {
        // Show only those mentioned in the file
        // We can simply search for UN_GHS_tree, its sub nodes contain what
        // we are looking for
        var ghs_node = -1;
        for (var i = 0; i < obj.length; i++)
        {
            if (obj[i].SourceID == "UN_GHS_tree")
            {
                ghs_node = obj[i].Node;
            }
        }

        if(ghs_node == -1)
        {
            hide_all_ghs();
            if($("unknown-hazard").checked == true)
            {
                $("ghs-unknown").style.display = "inline";

                if($("hazard_type").value == "ghs")
                {
                    $("ghs-string").innerHTML = "Unknown hazards";
                }
                else
                {
                    $("ghs-string").innerHTML = "";
                }
            }
        }
        else
        {
            hide_all_ghs();
            var explosive = ["H201", "H202", "H203", "H204", "H240", "H241"];
            var flammable = ["H206", "H207", "H208", "H220", "H221", "H222", "H223",
                "H224", "H225", "H226", "H228", "H229", "H230", "H231", "H232", "H241",
                "H242", "H250", "H251", "H252", "H260", "H261"];
            var oxidizer = ["H270", "H271", "H272"];
            var gas = ["H280", "H281", "H282", "H283", "H284"];
            var corrosive = ["H290", "H314", "H318"];
            var toxic = ["H300", "H301", "H310", "H311", "H330", "H331"];
            var environment = ["H400", "H410", "H411"];
            var hazard = ["H304", "H305", "H334", "H340", "H341", "H350",
                "H350i", "H351", "H360", "H360F", "H360D", "H360FD", "H360Fd",
                "H360Df", "H361", "H361f", "H361d", "H361fd", "H362", "H370",
                "H371", "H372", "H373"];
            var harmful = ["H312", "H315", "H317", "H319", "H332", "H335",
                "H336", "H420"];

            set_ghs_shown("ghs-corrosive", find_ghs(corrosive, ghs_node));
            set_ghs_shown("ghs-environment", find_ghs(environment, ghs_node));
            set_ghs_shown("ghs-explosive", find_ghs(explosive, ghs_node));
            set_ghs_shown("ghs-gas", find_ghs(gas, ghs_node));
            set_ghs_shown("ghs-harmful", find_ghs(harmful, ghs_node));
            set_ghs_shown("ghs-hazard", find_ghs(hazard, ghs_node));
            set_ghs_shown("ghs-oxidizer", find_ghs(oxidizer, ghs_node));
            set_ghs_shown("ghs-flammable", find_ghs(flammable, ghs_node));
            set_ghs_shown("ghs-toxic", find_ghs(toxic, ghs_node));

            if($("hazard_type").value == "ghs")
            {
                $("ghs-string").innerHTML = get_ghs_string(ghs_node);
            }
            else
            {
                $("ghs-string").innerHTML = "";

            }

        }

    }

    clasif_done = true;
    if(data_done)
    {
        generate_image();
    }
}

function load_data(obj)
{
    // This is executed after data is received, which is good
    if($("custom_name").value != "")
    {
        $("cname").innerHTML = $("custom_name").value;
    }
    else
    {
        $("cname").innerHTML = obj.Title;
    }

    $("ctext").innerHTML = $("custom_text").value;
    $("ghs-extra").innerHTML = $("hazard_text").value;

    if(!$("formula").checked)
    {
        $("cformula").style.display = "none";
    }
    else
    {
        $("cformula").style.display = "block";
        if ($("custom_formula").value != "")
        {
            $("cformula").innerHTML = make_formula($("custom_formula").value);
        }
        else
        {
            $("cformula").innerHTML = make_formula(obj.MolecularFormula);
        }
    }

    if($("molar-mass").checked)
    {
        $("mmass").innerHTML = obj.MolecularWeight + " g/mol";
    }
    else
    {
        $("mmass").innerHTML = "";
    }

    render(obj.IsomericSMILES);
    data_done = true;

    if(clasif_done)
    {
        generate_image();
    }
}

function make_formula(text)
{
    var html_out = "";
    var in_number = false;
    var special = false;

    for(let i = 0; i < text.length; i++)
    {
        var this_special = false;

        if(text[i] == '*')
        {
            special = true
            this_special = true;

            if(in_number)
            {
                html_out += "</sub>";
                in_number = false;
            }

        }

        if(text[i] >= '0' && text[i] <= '9')
        {
            if(!in_number && !special)
            {
                html_out += "<sub>";
            }
            in_number = true;
        }
        else
        {
            if(in_number && !special)
            {
                html_out += "</sub>";
            }
            in_number = false;
            if(this_special == false)
            {
                special = false;
            }
        }

        if(this_special)
        {
            html_out += '•';
        }
        else
        {
            html_out += text[i];
        }

    }

    return html_out;
}

function generate_image()
{
    if($("use-pubchem").checked)
     {
         $("generated").style.display="inline-block";
         $("chem-doodle-canvas").style.display="none";
         $("holder").innerHTML="";
         $("generated").style.position="relative";
         $("generated").style.backgroundColor="#f5f5f5";
     }
     else
     {
         $("generated").style.backgroundColor="#ffffff";
         $("chem-doodle-canvas").style.display="inline";
         var scroll0 = getScroll();

         // For some reason if we don't do this the image shows blank
         window.scrollTo(0, 0);

         $("generated").style.display="inline-block";
         $("generated").style.position="absolute";
         $("generated").style.top = 0;

         html2canvas($("generated")).then(function(canvas) {
             $("holder").innerHTML="";
             url = canvas.toDataURL(),
             img = document.createElement('img');
             img.src = url;
             img.style.width="auto";
             $("holder").appendChild(img);
         });

         $("generated").style.display="none";

         window.scrollTo(scroll0[0], scroll0[1]);
     }
}

function position_elements()
{
    // Position all the elements depending on layout type
    reset_positions();

    if($("layout_type").value == "hor")
    {
        $("base-text").style.display = "inline-block";
        $("ghs").style.display = "inline-block";
        $("images").style.display = "inline-block";

        $("base-text").style.float = "left";
        $("base-text").style.width = $("iwidth") * 0.75 + "px";
        $("base-text").style.height = "auto";
        $("base-text").style.padding = "5px";
        $("ghs").style.float = "left";
        $("ghs").style.width = $("iwidth") * 0.75 + "px";
        $("ghs").style.height = "auto";
        $("ghs").style.padding = "5px";
        $("images").style.float = "left";
    }
    else if($("layout_type").value == "ver")
    {
        // (Reset positions is the vertical layout)
    }
    else if($("layout_type").value == "corners")
    {
        $("base-text").style.display = "inline-block";
        $("ghs").style.display = "inline-block";
        $("images").style.display = "inline-block";

        $("base-text").style.float = "top";
        $("base-text").style.width = $("iwidth") * 0.75 + "px";
        $("base-text").style.height = "auto";
        $("base-text").style.padding = "5px";
        $("ghs").style.float = "top";
        $("ghs").style.width = $("iwidth") * 0.85 + "px";
        $("ghs").style.height = "auto";
        $("ghs").style.padding = "5px";
        $("images").style.float = "top";
    }

}

function reset_positions()
{
    $("base-text").style.display = "block";
    $("ghs").style.display = "block";
    $("images").style.display = "block";

    $("base-text").style.float = "none";
    $("base-text").style.height = $("iheight") * 0.75 + "px";
    $("base-text").style.width = "auto";
    $("base-text").style.padding = "5px";
    $("ghs").style.float = "none";
    $("ghs").style.height = $("iheight") * 0.75 + "px";
    $("ghs").style.width = "auto";
    $("ghs").style.padding = "5px";
    $("images").style.float = "none";

}