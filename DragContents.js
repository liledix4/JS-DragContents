// Heavily modified https://codepen.io/thenutz/pen/VwYeYEE

import { updateObject } from "../JS-UpdateObject/UpdateObject.js";
import { changeHTMLClasses } from "../JS-ChangeHTMLClasses/ChangeHTMLClasses.js";

const configDefault = {
    active_class: "active", // STRING or ARRAY of strings are allowed! Array of strings apply multiple classes!
    scrolling_speed: 1,
    html_attr: {
        main: "drag-contents",
        start_x: "start-x",
        scroll_left: "scroll-left",
        drag_state: "dragging"
    },
    debug: false // If you set anything different from "true", you'll disable console logs.
};
const debugMessage = {
    script_processing: "⏳ Processing...",
    script_ready: "✅ Ready!",
    touch_detected: "👆 Touch input detected!"
};
let config;
let htmlAttr;
let mouseButtonIsDown = false;

function debug(log) {
    if (config.debug === true) {
        console.log(
            "drag-contents\n",
            log
        );
    }
}

function dragState(element, mode) {
    if (typeof mode === "boolean") {
        const configClass = config.active_class;
        mouseButtonIsDown = mode;
        switch(mode) {
            case true:
                element.setAttribute(htmlAttr.drag_state, "");
                changeHTMLClasses(element, configClass, "add");
                break;
            case false:
                element.removeAttribute(htmlAttr.drag_state);
                element.removeAttribute(htmlAttr.start_x);
                element.removeAttribute(htmlAttr.scroll_left);
                changeHTMLClasses(element, configClass, "remove");
                break;
        }
    }
}
function inputPress(e, element) {
    dragState(element, true);

    let e2 = e;
    if (e.touches) {
        debug(debugMessage.touch_detected);
        e2 = e.touches[0];
    }

    // WARNING: It's necessary to apply *attributes* to HTML tags instead of using *JS variables*!
    // Imagine multi-touch input. So several containers could be scrolled simultaneously.
    // It can't be achieved with JS variables – in this case, only one container could be scrolled.
    element.setAttribute(htmlAttr.start_x, e2.pageX - element.offsetLeft);
    element.setAttribute(htmlAttr.scroll_left, element.scrollLeft);
}
function inputMove(e, element) {
    if (mouseButtonIsDown === false) {return};
    e.preventDefault();

    let e2 = e;
    if (e.touches) {
        e2 = e.touches[0];
    }

    function getInt(param) {
        return parseInt(element.getAttribute(param));
    }

    const startX = getInt(htmlAttr.start_x);
    const scrollLeft = getInt(htmlAttr.scroll_left);

    const x = e2.pageX - element.offsetLeft;
    const walk = (x - startX) * config.scrolling_speed;

    element.scrollLeft = scrollLeft - walk;
    debug([element, walk]);
}

function addListeners(element) {
    debug(element);

    // Mouse
    element.addEventListener("mousedown", (e) => {
        inputPress(e, element);
    });
    element.addEventListener("mouseleave", () => {
        dragState(element, false);
    });
    element.addEventListener("mouseup", () => {
        dragState(element, false);
    });
    element.addEventListener("mousemove", (e) => {
        inputMove(e, element);
    });

    // Touch
    element.addEventListener("touchstart", (e) => {
        inputPress(e, element); // DO NOT replace "e" with "e.touches" – it'll break "e.preventDefault()"! See "inputMove" function.
    });
    element.addEventListener("touchend", () => {
        dragState(element, false);
    });
    element.addEventListener("touchcancel", () => {
        dragState(element, false);
    });
    element.addEventListener("touchmove", (e) => {
        inputMove(e, element);
    });
}

export function dragContents(configCustom) {
    config = updateObject(configDefault, configCustom);
    htmlAttr = config.html_attr;
    debug(debugMessage.script_processing);
    const elementsList = document.querySelectorAll(`[${htmlAttr.main}]`);
    debug(elementsList);
    for (let i = 0; i < elementsList.length; i++) {
        addListeners(elementsList[i]);
    }
    debug(debugMessage.script_ready);
}