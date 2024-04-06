'use strict'
let ctrlPress = false;
let mousePressed = false;
const defaultColor = window.getComputedStyle(document.body).color;
const markedColor = 'rgb(255, 0, 255)';
const input = document.querySelector('.enterText');
// input.addEventListener('selectionchange', e => e.preventDefault())
const button = document.querySelector('.addText');
const container = document.querySelector('.container');
let mouseOnContainer = false;
let rangeElements = null;
const rangesCtrl = [];
let offsetStart = 0;
let offsetEnd = 0;
let children = [];
let rengeElementCtrl = null;
let computedCoordinatesElements = null;
const mutationObserver = new MutationObserver((e) => {
    computedCoordinatesElements = [];
    children = [...container.children];
    console.log(children);
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
            // const range = new Range();
            if (!rengeElementCtrl) {

                console.log('working')
                console.dir(e.target)

                selection.extend(node, 1)
                rengeElementCtrl = node;
                console.log('to string', selection.toString())
                console.log(node)
                element.style.color = markedColor
            } else {

                const parentElement = rengeElementCtrl.parentElement;
                console.log('parent', element, parentElement);
                if (parentElement !== element) {
                    const getOffsetElement = children.indexOf(element);
                    const getOffsetParentElement = children.indexOf(parentElement);
                    const startOffsetPostion = getOffsetElement > getOffsetParentElement ? getOffsetParentElement : getOffsetElement;
                    const endOffsetPostion = getOffsetElement > getOffsetParentElement ? getOffsetElement : getOffsetParentElement;
                    const startNode = getOffsetElement > getOffsetParentElement ? rengeElementCtrl : node;
                    const endNode = getOffsetElement > getOffsetParentElement ? node : rengeElementCtrl;
                    selection.removeAllRanges()
                    selection.setBaseAndExtent(startNode, 0, endNode, 1);
                    const elementsForMarked = children.slice(startOffsetPostion, endOffsetPostion + 1).forEach(el => el.style.color = markedColor)
                    return;
                }
            
                selection.removeAllRanges()
                rengeElementCtrl = null;
            }
        }
        //Если нажата кнока ctrl идет проверка условия
        // то данный элемент записывае в буфер выделения
        // нужн еще дополнительно создать масив в который будет записываться выделенный элемент
        // и проверятся на наличие выделенных элементов для того чтобы создать группу выделений
        // тут еще нужно написать код на изменение цвета элемента
        console.log('span click');
        console.log(selection)
    });
    return span

}
function addInfo() {
    const value = input.value.trim()
    if (value) {
        console.log('value', value)
        const children = value.split('').map(craeteSpanElement)
        console.log(value.split(''))
        console.log(value, children)
        console.log(children)
        children.forEach((el) => container.appendChild(el))
    }

}


function selectionchange(event) {
    const selection = window.getSelection();
    mousePressed = false;
    // children.forEach(el => el.style.color = defaultColor)
    console.log('work')
    // if (rangeElements && rangeElements.length) rangeElements.forEach(el => el.style.color = 'red');
    rangeElements = [];//тут нужно будет установить условие нажатие клавиши ctl , чтобы сбрасывать когда она не
    // нажата на пустой масив и когда нажата 
    console.log('selection in event', selection)
    console.log('selection to string before if', selection.toString())
    if (selection.anchorNode && selection.type === "Range" && selection.anchorNode.parentElement.parentElement === container) {
        // rangeWasCriated = true;

        const span = selection.anchorNode.parentElement;
        console.log('selectionFrom event', selection)
        const rangeString = selection.toString();
        console.log(rangeString)
        const getDirection = rangeString[0] === span.textContent ? 'LeftToRight' : 'RightToLEft'
        let startOffset = 0;
        let endOffset = 0;
        if (getDirection === 'LeftToRight' && rangeString.length > 0) {
            startOffset = children.indexOf(span);
            endOffset = rangeString.length + startOffset;
        }
        if (getDirection === 'RightToLEft' && rangeString.length > 0) {
            console.log(startOffset, endOffset)
            endOffset = children.indexOf(span) + 1;
            console.log(span)
            startOffset = endOffset - rangeString.length;
        }
        rangeElements.push(...children.slice(startOffset, endOffset))
        console.log('sliceRangeElements', rangeElements)
        if (!rengeElementCtrl) { 
            rangeElements.forEach(el => el.style.color = markedColor)
        }
        return
    }
}

document.addEventListener('mousemove', (e) => {
    // var mouseX = e.pageX;
    // var mouseY = e.pageY;
    // console.log("mouseX", mouseX, mouseY)
    // console.log('mousePressed', mousePressed)
    // console.log(mousePressed)
    // console.log(rangeElements)
    if (mousePressed && rangeElements && rangeElements.length) {
        console.log('where i unpress button when moving mouse was stoped', e.target)
        var mouseX = e.pageX;
        var mouseY = e.pageY;
        console.log(mouseX, mouseY)
        if (e.target !== container && e.target !== document.querySelector('html')) {
            console.log('working', rangeElements)
            console.log(rangeElements)
            console.log(rangeElements.includes(e.target))
            if (!rangeElements.includes(e.target)) {
                console.log("not working", rangeElements)
                let prev = e.target;
                rangeElements.forEach(el => {
                    container.insertBefore(el, prev.nextSibling)
                    prev = el;
                })
                //скопировал
                //но мы установили в самом начале события
                // mousePressed = false;//Нужно устанавливать обязательно потому что при переносе елемента
                // и отпускании клавиши мыши которая была зажата,событие отпускания мыши не наступает
                // Если выделения никакого нет,а просто зажимается клавиша и идет движение мыши,
                // то событие отпускания наступит при отжати клавишии
                // Получается своего рода исключение поведения при выделении текста
                window.getSelection().removeAllRanges()
                rangeElements.length = 0;
                rengeElementCtrl = null;
            }

            return
        }
        if (e.target === container) {
            rangeElements.forEach(el => {
                container.appendChild(el)
            })
            // mousePressed = false;
            rangeElements.length = 0;
            window.getSelection().removeAllRanges()
            rengeElementCtrl = null;
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
            // mousePressed = false;
            rangeElements.length = 0;
            window.getSelection().removeAllRanges()
            rengeElementCtrl = null;
        }
    }
})
function checkCodePressedButton(e) {
    return e.code === "ControlLeft" || e.code === "ControlRight" ? true : false
}
function ctrlPressed(e) {
    if (checkCodePressedButton(e)) {
        console.log('ctrlPressed', e.code)
        ctrlPress = true;
        window.removeEventListener('keydown', ctrlPressed)//delete listener
        console.log('keyPress', ctrlPress)
    }
}
function ctrlUnpressed(e) {
    if (checkCodePressedButton(e)) {
        console.log('ctrlUnpressed', e.code)
        ctrlPress = false;
        window.addEventListener('keydown', ctrlPressed)
        console.log('keyPress', ctrlPress)
    }
}
document.addEventListener("selectionchange", selectionchange);
button.addEventListener('click', addInfo);
window.addEventListener('mousedown', (e) => {
    if (e.target !== document.querySelector('html')) { 
        mousePressed = true
    }
    if (e.target === container || e.target.parentElement === container) { 
        children.forEach(el => el.style.color = defaultColor)
    }

    console.log('mousePressed', mousePressed)
})
window.addEventListener('mouseup', (e) => {
    mousePressed = false;
    if (!ctrlPress) {
        rengeElementCtrl = null;
    }
    console.log('where was mouse pressed', e.target)
    console.log("mousePressed", mousePressed)

})
window.addEventListener('keyup', ctrlUnpressed)//отпущена
window.addEventListener('keydown', ctrlPressed)//нажата