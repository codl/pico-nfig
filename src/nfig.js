// nfig - https://github.com/codl/pico-nfig
// please don't look at my code it's bad

let pico8_buttons = [0, 0, 0, 0, 0, 0, 0, 0]
Module.doNotCaptureKeyboard = true;

function nfig(){
    console.log("nfig initialising...");
    const buttons = ["left", "right", "up", "down", "o", "x"]
    const bitmap = {
        "left": 1,
        "right": 2,
        "up": 4,
        "down": 8,
        "o": 16,
        "x": 32
    }
    const default_bindings = {
     "arrowup": [0, "up"],
     "arrowdown": [0, "down"],
     "arrowleft": [0, "left"],
     "arrowright": [0, "right"],
     "z": [0, "o"],
     "x": [0, "x"],
     "c": [0, "o"],
     "v": [0, "x"],
     "n": [0, "o"],
     "m": [0, "x"],

     "e": [1, "up"],
     "d": [1, "down"],
     "s": [1, "left"],
     "f": [1, "right"],
     "tab": [1, "o"],
     "q": [1, "x"],
     "shift": [1, "o"],
     "a": [1, "x"]
    };
    let bindings = Object.assign({}, default_bindings);
    try {
        let saved = JSON.parse(localStorage.getItem("nfig-mappings"));
        if(saved && typeof saved == "object") {
            bindings = saved;
            console.log("nfig successfully loaded saved mappings");
        }
    } catch (e) {
        console.log(e);
    }
    function key(e){
        if(e.key == "Enter" || e.key.toLowerCase() == "p"){
            return SDL.receiveEvent.call(this, e);
        }
        if(e.ctrlKey){
            return
        }

        if(e.type == "keydown" && is_mapping){
            // the panel is open and we're pressing a key to be bound
            let player = player_el.value;
            e.preventDefault();
            bindings[e.key.toLowerCase()] = [player, is_mapping];
            if(mapping_all){
                let next = buttons.indexOf(is_mapping) + 1;
                if(next >= buttons.length){
                    is_mapping = null;
                }
                else {
                    is_mapping = buttons[next];
                }
            }
            else {
                is_mapping = null;
            }
            localStorage.setItem("nfig-mappings", JSON.stringify(bindings));
            render();
        }

        else {
            let binding = bindings[e.key.toLowerCase()];
            if(binding){
                let [player, button] = binding;
                if(e.type == "keydown"){
                    pico8_buttons[player] |= bitmap[button];
                } else if(e.type == "keyup"){
                    pico8_buttons[player] &= ~bitmap[button];
                }
                e.preventDefault();
                render();
            }
        }
    }
    window.addEventListener("keydown", key);
    window.addEventListener("keyup", key);

    const css = document.createElement("link");
    css.rel="stylesheet";
    css.href="panel.css";
    document.body.appendChild(css);

    const container_el = document.createElement("div");
    container_el.classList.add("nfig-container");

    const canvas = document.querySelector("canvas");

    const main_section = canvas.parentNode
    main_section.replaceChild(container_el, canvas);
    container_el.appendChild(canvas);

    main_section.removeChild(main_section.querySelector("br"));

    const panel_el = document.createElement("div");
    panel_el.classList.add("nfig-panel");

    let panel_contents = '<div id="nfig-title">Remap controls <button id="nfig-close">Done</button></div>';

    panel_contents += '<svg xmlns="http://www.w3.org/2000/svg" id="nfig-controller" viewBox="0 0 244.0124 148.0124"><g data-nfig-btn="left"><path d="M28.3465 60.3465H55.666V87.666H28.3465V60.3465zm7.327 13.66l10.798 6.782v-13.564l-10.798 6.782z"/><rect x="28" y="60" width="28" height="28" fill-opacity="0"/></g><g data-nfig-btn="right"><path d="M119.666 60.3465H92.3465V87.666h27.3195V60.3465zm-7.327 13.66l-10.798 6.782v-13.564l10.798 6.782z"/><rect x="92" y="60" width="28" height="28" fill-opacity="0"/></g><g data-nfig-btn="up"><path d="M60.3465 28.3465V55.666H87.666V28.3465H60.3465zm13.66 7.327l6.782 10.798h-13.564l6.782-10.798z"/><rect x="60" y="28" width="28" height="28" fill-opacity="0"/></g><g data-nfig-btn="down"><path d="M60.3465 119.666V92.3465H87.666v27.3195H60.3465zm13.66-7.327l6.782-10.798h-13.564l6.782 10.798z"/><rect x="60" y="92" width="28" height="28" fill-opacity="0"/></g><g data-nfig-btn="o"><path d="M142.6867 60.3465V87.666h27.3195V60.3465h-27.3195zm13.6594 6.129c4.1375 0 7.5312 3.393 7.5312 7.5304 0 4.1372-3.3937 7.5303-7.531 7.5303-4.1374 0-7.5305-3.393-7.5305-7.5304 0-4.1375 3.393-7.5305 7.5304-7.5305zm0 3.6666c-2.1556 0-3.8636 1.7082-3.8636 3.864 0 2.1555 1.708 3.8636 3.8637 3.8636 2.1558 0 3.864-1.708 3.864-3.8637 0-2.1558-1.7082-3.864-3.864-3.864z"/><rect x="142" y="60" width="28" height="28" fill-opacity="0"/></g><g data-nfig-btn="x"><path d="M188.3465 60.3465V87.666h27.3195V60.3465h-27.3195zm7.5864 5.431a1.948 1.948 0 0 1 1.3888.6108l4.684 4.8218 4.685-4.8217a1.948 1.948 0 0 1 1.33-.6087 1.948 1.948 0 0 1 1.4636 3.323l-4.763 4.9033 4.763 4.9025a1.948 1.948 0 1 1-2.7937 2.715l-4.6848-4.8225-4.6842 4.8224a1.948 1.948 0 1 1-2.7944-2.715l4.763-4.9025-4.763-4.9035a1.948 1.948 0 0 1 1.4055-3.325z"/><rect x="188" y="60" width="28" height="28" fill-opacity="0"/></g></svg>';

    panel_contents += '<div class="nfig-left">';
    panel_contents += '<select id="nfig-player">';
    for(let i = 0; i < 8; i++){
        panel_contents += '<option value=' + i + (i==0?' selected':'') + '>Player ' + (i+1) + '</option>';
    }
    panel_contents += '</select>';

    panel_contents += '<p id="nfig-status"></p>';

    panel_contents += '<div id="nfig-actions"><button id="nfig-cancel">Cancel</button> <button id="nfig-remapall">Remap all</button> <button id="nfig-reset">Restore defaults</button></div>';

    panel_contents += '</div>';

    panel_el.innerHTML = panel_contents;
    container_el.appendChild(panel_el);

    let is_mapping, mapping_all;

    const svg_buttons = Array.from(panel_el.querySelectorAll("svg g"));
    for(let button of svg_buttons){
        // switch this back when firefox 51 comes out
        //let which = button.dataset.nfigBtn;
        let which = button.getAttribute("data-nfig-btn");
        button.addEventListener("click", e => {
            is_mapping = which;
            mapping_all = false;
            render();
        });
    }

    let status_el = panel_el.querySelector("#nfig-status");

    function render(){
        let player = player_el.value - 0;
        let cancel_el = panel_el.querySelector("#nfig-cancel");
        let status = "Click any button to remap it."
        if(is_mapping){
            status = "Press a key to map it to " + is_mapping;
            if(mapping_all){
                status = "Mapping all keys for player " + (player+1) + "... " + status;
            }
        }
        for(let button of svg_buttons){
            // switch this back when firefox 51 comes out
            //let which = button.dataset.nfigBtn;
            let which = button.getAttribute("data-nfig-btn");
            button.classList.toggle("mapping", is_mapping && which == is_mapping)
            button.classList.toggle("pressed", pico8_buttons[player] & bitmap[which])
        }
        cancel_el.style.display = is_mapping ? "inline" : "none";
        status_el.innerHTML = status;
    }

    function cancel(){
        is_mapping = null;
        render();
    }

    panel_el.querySelector("#nfig-cancel").addEventListener("click", cancel);
    let player_el = panel_el.querySelector("#nfig-player")
    player_el.addEventListener("change", cancel);

    function toggle(e){
        e.preventDefault();
        // prevent focus from staying on the "Done" button
        e.target.blur();
        cancel();
        panel_el.classList.toggle("shown");
    }

    panel_el.querySelector("#nfig-close").addEventListener("click", toggle);

    panel_el.querySelector("#nfig-remapall").addEventListener("click", () => {
        is_mapping = buttons[0];
        mapping_all = true;
        render();
    });

    panel_el.querySelector("#nfig-reset").addEventListener("click", () => {
        cancel();
        bindings = Object.assign(bindings, default_bindings);
        status_el.innerHTML = "Defaults restored."; // mmm gross
    })

    const config_button = document.querySelectorAll(".pico8_el")[4];
    config_button.innerHTML = '<img src="icon.png" width="12" height="12"> Remap';
    config_button.addEventListener("click", toggle);

    render();

    console.log("cool. let's play some video games");
}

window.addEventListener("load", nfig);
