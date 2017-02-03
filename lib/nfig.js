// nfig - https://github.com/codl/pico-nfig
// please don't look at my code it's bad

var pico8_buttons = pico8_buttons || [0, 0, 0, 0, 0, 0, 0, 0];

function nfig(settings){
    console.log("nfig initialising...");

    const storage_key = "nfig-mappings-v1";

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
        "x": 32,
        "pause": 64
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
    for(let i=0; i < 8; i++){
        default_bindings[`pad_generic:${i}:button:0:+`] = [i, "x"];
        default_bindings[`pad_generic:${i}:button:1:+`] = [i, "o"];
        default_bindings[`pad_generic:${i}:axis:0:-`] = [i, "left"];
        default_bindings[`pad_generic:${i}:axis:0:+`] = [i, "right"];
        default_bindings[`pad_generic:${i}:axis:1:-`] = [i, "up"];
        default_bindings[`pad_generic:${i}:axis:1:+`] = [i, "down"];

        default_bindings[`pad_standard:${i}:button:12:+`] = [i, "up"];
        default_bindings[`pad_standard:${i}:button:13:+`] = [i, "down"];
        default_bindings[`pad_standard:${i}:button:14:+`] = [i, "left"];
        default_bindings[`pad_standard:${i}:button:15:+`] = [i, "right"];

        default_bindings[`pad_standard:${i}:button:9:+`] = [i, "pause"];
    }
    window.default_bindings = default_bindings;
    let bindings = Object.assign({}, default_bindings);
    try {
        let saved = JSON.parse(localStorage.getItem(storage_key));
        if(saved && typeof saved == "object") {
            bindings = saved;
            console.log("nfig successfully loaded saved mappings");
        }
    } catch (e) {
        console.log(e);
    }

    const AXIS_DEADZONE = .4;


    let max_players = Math.floor(settings.players-0 || 2);

    if(!(max_players <= 8 && max_players >= 1)){
        console.error("nfig: data-players is not between 1 and 8! resetting to 2")
        max_players = 2;
    }

    function key(e){
        console.log(e);
        if(e.key == "Enter" || e.key.toLowerCase() == "p"){
            return SDL.receiveEvent.call(this, e);
        }
        if(e.ctrlKey){
            return
        }

        if(e.type == "keydown" && is_mapping){
            add_mapping(e.key.toLowerCase());
            e.preventDefault();
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

    function add_mapping(key){
        let player = player_el.value;
        bindings[key] = [player, is_mapping];
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
        localStorage.setItem(storage_key, JSON.stringify(bindings));
        render();
    }

    function on_pad(key, pad, control_type, control_index, direction, is_pressed, no_generics){
        console.log(key, is_pressed);
        if(is_mapping && is_pressed){
            add_mapping(key);
        } else {
            let binding = bindings[key];
            if(binding){
                let [player, button] = binding;
                if(button == "pause"){
                    player = 0;
                }
                if(is_pressed){
                    pico8_buttons[player] |= bitmap[button];
                } else {
                    pico8_buttons[player] &= ~bitmap[button];
                }
                render();
                return true;
            } else if(!no_generics) {
                let success = false;
                if(pad.mapping){
                    let mapping_key = key.replace(/^pad:/, `pad_${pad.mapping}:`);
                    success = on_generic_pad(mapping_key, is_pressed);
                }
                if(!success){
                    let generic_key = `pad_generic:${pad.index%max_players}:${control_type}:${control_index % 2}:${direction}`
                    on_generic_pad(generic_key, is_pressed);
                }
            }
        }
    }

    function on_generic_pad(key, is_pressed){
        return on_pad(key, null, null, null, null, is_pressed, true);
    }

    const css = document.createElement("link");
    css.rel="stylesheet";
    css.href="data:text/css;base64,Lm5maWctcGFuZWwge3Bvc2l0aW9uOiBhYnNvbHV0ZTtyaWdodDogMDtib3R0b206IDA7d2lkdGg6IDM3MHB4O2JhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC45KTtjb2xvcjogd2hpdGU7Zm9udC1mYW1pbHk6IFZlcmRhbmEsIHNhbnMtc2VyaWY7Zm9udC1zaXplOiA5cHQ7cGFkZGluZzogNnB4O21hcmdpbjogMXB4O3RyYW5zZm9ybTogdHJhbnNsYXRleSgxMDAlKTt0ZXh0LWFsaWduOiBsZWZ0O30ubmZpZy1wYW5lbC5zaG93biB7dHJhbnNmb3JtOiB0cmFuc2xhdGV5KDApO3RyYW5zaXRpb246IHRyYW5zZm9ybSAzMDBtczt9Lm5maWctY29udGFpbmVyIHtvdmVyZmxvdzogaGlkZGVuO3Bvc2l0aW9uOiByZWxhdGl2ZTt9I25maWctY2xvc2Uge2Rpc3BsYXk6IGlubGluZS1ibG9jaztmbG9hdDogcmlnaHQ7fSNuZmlnLWNvbnRyb2xsZXIge21heC13aWR0aDogMjUwcHg7ZmxvYXQ6IHJpZ2h0O2NsZWFyOiByaWdodDt9I25maWctY29udHJvbGxlciBnIHBhdGgge2ZpbGw6IHdoaXRlO30jbmZpZy1jb250cm9sbGVyIGcubWFwcGluZyBwYXRoIHtmaWxsOiBvcmFuZ2U7fSNuZmlnLWNvbnRyb2xsZXIgZy5wcmVzc2VkIHBhdGgge2ZpbGw6IHBpbms7fS5uZmlnLWxlZnQge21hcmdpbjogMWVtO30=";
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

    panel_contents += '<svg xmlns="http://www.w3.org/2000/svg" id="nfig-controller" viewBox="0 0 244.0124 148.0124"><g data-nfig-btn="left"><path d="M28.3465 60.3465H55.666V87.666H28.3465V60.3465zm7.327 13.66l10.798 6.782v-13.564l-10.798 6.782z"/><rect x="28" y="60" width="28" height="28" fill-opacity="0"/></g><g data-nfig-btn="right"><path d="M119.666 60.3465H92.3465V87.666h27.3195V60.3465zm-7.327 13.66l-10.798 6.782v-13.564l10.798 6.782z"/><rect x="92" y="60" width="28" height="28" fill-opacity="0"/></g><g data-nfig-btn="up"><path d="M60.3465 28.3465V55.666H87.666V28.3465H60.3465zm13.66 7.327l6.782 10.798h-13.564l6.782-10.798z"/><rect x="60" y="28" width="28" height="28" fill-opacity="0"/></g><g data-nfig-btn="down"><path d="M60.3465 119.666V92.3465H87.666v27.3195H60.3465zm13.66-7.327l6.782-10.798h-13.564l6.782 10.798z"/><rect x="60" y="92" width="28" height="28" fill-opacity="0"/></g><g data-nfig-btn="o"><path d="M142.6867 60.3465V87.666h27.3195V60.3465h-27.3195zm13.6594 6.129c4.1375 0 7.5312 3.393 7.5312 7.5304 0 4.1372-3.3937 7.5303-7.531 7.5303-4.1374 0-7.5305-3.393-7.5305-7.5304 0-4.1375 3.393-7.5305 7.5304-7.5305zm0 3.6666c-2.1556 0-3.8636 1.7082-3.8636 3.864 0 2.1555 1.708 3.8636 3.8637 3.8636 2.1558 0 3.864-1.708 3.864-3.8637 0-2.1558-1.7082-3.864-3.864-3.864z"/><rect x="142" y="60" width="28" height="28" fill-opacity="0"/></g><g data-nfig-btn="x"><path d="M188.3465 60.3465V87.666h27.3195V60.3465h-27.3195zm7.5864 5.431a1.948 1.948 0 0 1 1.3888.6108l4.684 4.8218 4.685-4.8217a1.948 1.948 0 0 1 1.33-.6087 1.948 1.948 0 0 1 1.4636 3.323l-4.763 4.9033 4.763 4.9025a1.948 1.948 0 1 1-2.7937 2.715l-4.6848-4.8225-4.6842 4.8224a1.948 1.948 0 1 1-2.7944-2.715l4.763-4.9025-4.763-4.9035a1.948 1.948 0 0 1 1.4055-3.325z"/><rect x="188" y="60" width="28" height="28" fill-opacity="0"/></g></svg>';

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
            status = "Press a key or a gamepad button for " + is_mapping;
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
        bindings = Object.assign({}, default_bindings);
        status_el.innerHTML = "Defaults restored."; // mmm gross
    })

    if(typeof settings.noButton == "undefined"){
        const config_button = document.querySelectorAll(".pico8_el")[4];
        config_button.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QELDRogeDaFdgAAAHxJREFUSMdjYBjqgBGXxP+PL+BMQmpRDOSXQOEz0doHRFvAyC+B4TqqWkAuYMES5uguZ4TK/yc2/gbGB0SkJnQXE5W6Bk8qIhb8//gCJT6Z6JaTsaQSqpg9oKmIES21kOZ8aK4fEB8wUtMnA+KD/9Rw+aAoi/4PyqJi+AEAK5Ud5NJbqZQAAAAASUVORK5CYII=" width="12" height="12"> Remap';
        config_button.addEventListener("click", toggle);
    }

    let pad_status_prev = {};
    function poll_gamepads(){
        requestAnimationFrame(poll_gamepads);

        if(!window.navigator || !navigator.getGamepads){ return }

        let pad_status = {};

        for(gamepad of navigator.getGamepads()){
            if(!gamepad){ continue; }
            for(let i = 0; i < gamepad.axes.length; i++){
                let key = `pad:${gamepad.index}:axis:${i}`;

                let pluskey = key + ":+";
                pad_status[pluskey] = gamepad.axes[i] > AXIS_DEADZONE;

                if(pad_status_prev[pluskey] != pad_status[pluskey]){
                    on_pad(pluskey, gamepad, "axis", i, "+", pad_status[pluskey])
                }

                let minuskey = key + ":-";
                pad_status[minuskey] = gamepad.axes[i] < -AXIS_DEADZONE;

                if(pad_status_prev[minuskey] != pad_status[minuskey]){
                    on_pad(minuskey, gamepad, "axis", i, "-", pad_status[minuskey])
                }
            }
            for(let i = 0; i < gamepad.buttons.length; i++){
                let key = `pad:${gamepad.index}:button:${i}:+`;
                pad_status[key] = gamepad.buttons[i].pressed;

                if(pad_status_prev[key] != pad_status[key]){
                    on_pad(key, gamepad, "button", i, "+", pad_status[key])
                }
            }
        }
        pad_status_prev = pad_status;
        window.pad_status = pad_status;
    }

    poll_gamepads();

    render();

    console.log("cool. let's play some video games");
}

(() => {
    let settings = document.currentScript.dataset;
    window.addEventListener("DOMContentLoaded", () => nfig(settings));
})();
