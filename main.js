'use strict'
let ctrlPress = false;
let mousePressed = false;
const defaultColor = window.getComputedStyle(document.body).color;
const markedColor = 'rgb(255, 0, 255)';
const input = document.querySelector('.enterText');
const button = document.querySelector('.addText');
const container = document.querySelector('.container');
let rangeElements = null;
let children = [];
let rangeElementCtrl = null;
const mutationObserver = new MutationObserver((e) => {
    children = [...container.children];
})
mutationObserver.observe(container, { childList: true })
function craeteSpanElement(value) {
    const span = document.createElement('span');
    span.append(value);
    span.addEventListener('click', (e) => {
        const selection = window.getSelection();
        if (ctrlPress && selection.anchorNode) {
            const element = e.target;
            const node = element.childNodes[0]
            if (!rangeElementCtrl) {
                selection.extend(node, 1)
                rangeElementCtrl = node;
                element.style.color = markedColor
            } else {
                const parentElement = rangeElementCtrl.parentElement;
                if (parentElement !== element) {
                    const getOffsetElement = children.indexOf(element);
                    const getOffsetParentElement = children.indexOf(parentElement);
                    const startOffsetPostion = getOffsetElement > getOffsetParentElement ? getOffsetParentElement : getOffsetElement;
                    const endOffsetPostion = getOffsetElement > getOffsetParentElement ? getOffsetElement : getOffsetParentElement;
                    const startNode = getOffsetElement > getOffsetParentElement ? rangeElementCtrl : node;
                    const endNode = getOffsetElement > getOffsetParentElement ? node : rangeElementCtrl;
                    selection.removeAllRanges()
                    selection.setBaseAndExtent(startNode, 0, endNode, 1);
                    children.slice(startOffsetPostion, endOffsetPostion + 1).forEach(el => el.style.color = markedColor)
                    return;
                }
                selection.removeAllRanges()
                rangeElementCtrl = null;
            }
            return
        }
        selection.removeAllRanges()
        children.forEach(el => el.style.color = defaultColor)
    });
    return span
}
function addInfo() {
    const value = input.value.trim()
    if (value) {
        const children = value.split('').map(craeteSpanElement)
        children.forEach((el) => container.appendChild(el))
    }

}

function selectionchange() {
    const selection = window.getSelection();
    mousePressed = false;
    rangeElements = [];

    if (selection.anchorNode && selection.type === "Range" && selection.anchorNode.parentElement.parentElement === container) {
        const span = selection.anchorNode.parentElement;
        const rangeString = selection.toString();
        const getDirection = rangeString[0] === span.textContent ? 'LeftToRight' : 'RightToLEft'
        let startOffset = 0;
        let endOffset = 0;
        if (getDirection === 'LeftToRight' && rangeString.length > 0) {
            startOffset = children.indexOf(span);
            endOffset = rangeString.length + startOffset;
        }
        if (getDirection === 'RightToLEft' && rangeString.length > 0) {
            endOffset = children.indexOf(span) + 1;
            startOffset = endOffset - rangeString.length;
        }
        rangeElements.push(...children.slice(startOffset, endOffset))
        if (!rangeElementCtrl) { 
            rangeElements.forEach(el => el.style.color = markedColor)
        }
        return
    }
}

document.addEventListener('mousemove', (e) => {
    if (mousePressed && rangeElements && rangeElements.length) {
        var mouseX = e.pageX;
        var mouseY = e.pageY;
        rangeElements.forEach(el => el.style.color = defaultColor)
        if (e.target !== container && e.target !== document.querySelector('html')) {
            if (!rangeElements.includes(e.target)) {
                let prev = e.target;
                rangeElements.forEach(el => {
                    container.insertBefore(el, prev.nextSibling)
                    prev = el;
                })
                window.getSelection().removeAllRanges()
                rangeElements.length = 0;
                rangeElementCtrl = null;
            }
            return
        }
        if (e.target === container) {
            rangeElements.forEach(el => {
                container.appendChild(el)
            })
            rangeElements.length = 0;
            window.getSelection().removeAllRanges()
            rangeElementCtrl = null;
            return
        }
        if (e.target === document.querySelector('html')) {
            const wrapper = document.createElement('div');
            wrapper.style.display = 'inline-block'
            wrapper.style.top = mouseY + 'px';
            wrapper.style.left = mouseX + 'px';
            wrapper.style.position = 'absolute';
            rangeElements.forEach(el => {
                wrapper.appendChild(el)
            });
            document.body.appendChild(wrapper);
            rangeElements.length = 0;
            window.getSelection().removeAllRanges()
            rangeElementCtrl = null;
        }
    }
})
function checkCodePressedButton(e) {
    return e.code === "ControlLeft" || e.code === "ControlRight" ? true : false
}
function ctrlPressed(e) {
    if (checkCodePressedButton(e)) {
        ctrlPress = true;
        window.removeEventListener('keydown', ctrlPressed)
    }
}
function ctrlUnpressed(e) {
    if (checkCodePressedButton(e)) {
        ctrlPress = false;
        window.addEventListener('keydown', ctrlPressed)
    }
}
document.addEventListener("selectionchange", selectionchange);
button.addEventListener('click', addInfo);
window.addEventListener('mousedown', (e) => {
    if (e.target !== document.querySelector('html')) {
        mousePressed = true
    }
    if (e.target === document.querySelector('html') && rangeElements) {
        window.getSelection().removeAllRanges();
    }
})
window.addEventListener('mouseup', (e) => {
    mousePressed = false;
    if (!ctrlPress) {
        rangeElementCtrl = null;
    }
})

window.addEventListener('keyup', ctrlUnpressed)
window.addEventListener('keydown', ctrlPressed)
