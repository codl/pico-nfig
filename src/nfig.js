// nfig - https://github.com/codl/pico-nfig
// please don't look at my code it's bad

var pico8_buttons = pico8_buttons || [0, 0, 0, 0, 0, 0, 0, 0];

function nfig(settings){
    console.log("nfig initialising...");

    window.addEventListener("load", () => {
        document.removeEventListener("keydown", SDL.receiveEvent);
        document.removeEventListener("keyup", SDL.receiveEvent);
    });
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
     "up": [0, "up"],
     "down": [0, "down"],
     "left": [0, "left"],
     "right": [0, "right"],
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


    let max_players = settings.players-0 || 2;

    if(!(max_players <= 8 && max_players >= 1)){
        console.error("nfig: data-players is not between 1 and 8! resetting to 2")
        max_players = 2;
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

    // PICO-8 Styler compat. That br isn't there in Styler
    let br = main_section.querySelector("br");
    if(br){
        main_section.removeChild(br);
    }

    const panel_el = document.createElement("div");
    panel_el.classList.add("nfig-panel");

    let panel_contents = '<div id="nfig-title">Remap controls <button id="nfig-close">Done</button></div>';

    panel_contents += '{{SVG}}';

    panel_contents += '<div class="nfig-left">';
    if(max_players <= 1){
        panel_contents += '<input id="nfig-player" type="hidden" value="0"></input>';
    } else {
        panel_contents += '<select id="nfig-player">';
        for(let i = 0; i < max_players; i++){
            panel_contents += '<option value=' + i + (i==0?' selected':'') + '>Player ' + (i+1) + '</option>';
        }
        panel_contents += '</select>';
    }

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
        if(e){
            e.preventDefault();
            // prevent focus from staying on the "Done" button
            e.target.blur();
        }
        cancel();
        panel_el.classList.toggle("shown");
    }

    window.nfig_toggle = toggle;

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

    if(typeof settings.noButton == "undefined"){
        const config_button = document.querySelectorAll(".pico8_el")[4];
        config_button.innerHTML = '<img src="icon.png" width="12" height="12"> Remap';
        config_button.addEventListener("click", toggle);
    }

    if(navigator.getGamepads && window.updateGamepads){

        // wrapper for https://github.com/krajzeg/pico8gamepad/
        let oldUpdateGamepads = updateGamepads;
        let ugp_buttons = [0,0,0,0,0,0,0,0];
        function newUpdateGamepads(t){
            let buffer = pico8_buttons;
            let ugp_buttons_before = ugp_buttons.slice();

            pico8_buttons = ugp_buttons;
            oldUpdateGamepads(t);
            pico8_buttons = buffer;

            let must_render = false;

            for(let i = 0; i < ugp_buttons.length; i++){
                if(ugp_buttons_before[i] != ugp_buttons[i]){
                    pico8_buttons[i] = ugp_buttons[i];
                    must_render = true;
                }
            }

            if(must_render){
                render();
            }
        }
        updateGamepads = newUpdateGamepads;
    }

    render();

    console.log("cool. let's play some video games");
}

(() => {
    let settings = document.currentScript.dataset;
    window.addEventListener("DOMContentLoaded", () => nfig(settings));
})();
