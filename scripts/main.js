// Крестики Нолики на Канвасе

// Требования:

// 1. Загружается канвас с стандартной пустой сеткой 3 на 3
// 2. Первыми ходят всегда крестики, на второй клик ходят нолики.
// 3. Если установка  крестика или нолика невозможна, показывать Алерт с ошибкой
// 4. автоматически выявлять победителя, проводя линией по ряду, после сбросить канвас.

const message = document.querySelector('#message');
const canvas = document.querySelector('#canvas');
let canvasWidth = canvas.clientWidth;
const canvasHeight = canvas.clientHeight;
const ctx = canvas.getContext('2d');

const config = {
    cellSize: 50,
    borderWidth: 5,
    borderColor: 'black',
    winLineWidth: 2,
    winLineColor: "red",
    signWidth: 5,
    xColor: "green",
    oColor: "blue",
    fieldColor: 'pink'
}

let currentPoint;
let xField;
let oField;

init();

function init() {
    canvas.style.backgroundColor = config.fieldColor;
    xField = 0;
    oField = 0;
    currentPoint = 'X';
    message.innerHTML = '';
    renderEmptyField();

    document.addEventListener('click', handleClick);
}


function handleClick(event) {
    event.preventDefault();
    if (event.target != canvas) {
        message.innerHTML = 'Out of field';
        return;
    };
    setCell(event.offsetX, event.offsetY);
}

function renderEmptyField() {
    canvas.setAttribute('width', config.cellSize * 3 + config.borderWidth);
    canvas.setAttribute('height', config.cellSize * 3 + config.borderWidth);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.strokeStyle = config.borderColor;
    ctx.lineWidth = config.borderWidth;

    for (let i = 0; i < 4; i++) {
        // horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * config.cellSize + config.borderWidth / 2);
        ctx.lineTo(canvas.clientWidth, i * config.cellSize + config.borderWidth / 2);
        ctx.stroke();
        // vertical lines
        ctx.beginPath();
        ctx.moveTo(i * config.cellSize + config.borderWidth / 2, 0);
        ctx.lineTo(i * config.cellSize + config.borderWidth / 2, canvas.clientHeight);
        ctx.stroke();
    };
}



function setCell(x, y) {
    if (isClickOnBorder(x, y)) {
        message.innerHTML = 'Click on Border';
        return;
    }
    let step = canvas.clientHeight / 3;

    let colIndex = Math.floor(x / step);
    let rowIndex = Math.floor(y / step);
    let bitShift = colIndex + 3 * rowIndex;
    let num = 1 << bitShift
    if (num & xField || num & oField) {
        message.innerHTML = 'Cell is occupied';
        return;
    }

    currentPoint === 'X' && (xField = xField | num);
    currentPoint === 'O' && (oField = oField | num);

    renderSign(x, y, currentPoint);
    let winStatus = checkWin(xField, oField);

    if (winStatus.length > 0) {
        renderWinLine(winStatus);
        message.innerHTML = currentPoint + ' Win!!!!';
        document.removeEventListener('click', handleClick);
        setTimeout(() => {
            init();
        }, 2000);
        return;
    }

    if ((xField + oField) === 511) {
        message.innerHTML = 'Dead Heat';
        document.removeEventListener('click', handleClick);
        setTimeout(() => {
            init();
        }, 2000)
    }

    currentPoint = (currentPoint === 'X' ? 'O' : 'X');
}

function isClickOnBorder(eventTargetX, eventTargetY) {
    let cellSize = config.cellSize;
    let borderWidth = config.borderWidth;
    let result = false;

    for (let i = 0; i < 4; i++) {
        let rangeMin = cellSize * i;
        let rangeMax = cellSize * i + borderWidth;
        if (eventTargetX >= rangeMin && eventTargetX <= rangeMax) {
            result = true;
        }
        if (eventTargetY >= rangeMin && eventTargetY <= rangeMax) {
            result = true;
        }
    }

    return result;
}

function renderSign(eventTargetX, eventTargetY, sign) {
    let borderWidth = config.borderWidth;
    let step = canvas.clientHeight / 3;
    let effectiveCellSize = (canvas.clientHeight - 4 * borderWidth) / 3;
    let signSize = 0.6 * effectiveCellSize;

    let x = Math.floor(eventTargetX / step) * (effectiveCellSize + borderWidth) + borderWidth + effectiveCellSize / 2 - signSize / 2;
    let y = Math.floor(eventTargetY / step) * (effectiveCellSize + borderWidth) + borderWidth + effectiveCellSize / 2 - signSize / 2;

    ctx.lineWidth = config.signWidth;
    if (sign === 'X') {
        ctx.strokeStyle = config.xColor;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + signSize, y + signSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y + signSize);
        ctx.lineTo(x + signSize, y);
        ctx.stroke();
    }

    if (sign === 'O') {
        ctx.strokeStyle = config.oColor;
        ctx.beginPath();
        ctx.arc(x + signSize / 2, y + signSize / 2, signSize / 2, 0, 2 * Math.PI);
        ctx.stroke();
    }

}

function renderWinLine(winStatus) {
    let borderWidth = config.borderWidth;
    let effectiveCellSize = (canvas.clientHeight - 4 * borderWidth) / 3;
    let normal = 2 * borderWidth + 3 * effectiveCellSize - effectiveCellSize / 2;
    let beginX;
    let beginY;
    let endX;
    let endY;

    winStatus.forEach(item => {
        if (item.type === 'row') {
            beginX = borderWidth + effectiveCellSize / 4;
            endX = beginX + normal;
            beginY = borderWidth + effectiveCellSize / 2 + (borderWidth + effectiveCellSize) * item.num;
            endY = beginY;
        }

        if (item.type === 'col') {
            beginY = borderWidth + effectiveCellSize / 4;
            endY = beginY + normal;
            beginX = borderWidth + effectiveCellSize / 2 + (borderWidth + effectiveCellSize) * item.num;
            endX = beginX;
        }

        if (item.type === 'diag') {
            beginX = borderWidth + effectiveCellSize / 4;
            endX = beginX + normal;
            beginY = borderWidth + effectiveCellSize / 4;
            endY = beginY + normal;
            if (item.num) {
                let temp = beginY;
                beginY = endY;
                endY = temp;
            }
        }

        ctx.lineWidth = config.winLineWidth;
        ctx.beginPath();
        ctx.moveTo(beginX, beginY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = config.winLineColor;
        ctx.stroke();
    })

}

function checkWin(xField, oField) {
    let res = [];
    const winNums = {
        "7": { type: 'row', num: 0 },
        "56": { type: 'row', num: 1 },
        "448": { type: 'row', num: 2 },
        "73": { type: 'col', num: 0 },
        "146": { type: 'col', num: 1 },
        "292": { type: 'col', num: 2 },
        "84": { type: 'diag', num: 2 },
        "273": { type: 'diag', num: 0 },
    };
    Object.keys(winNums).forEach(item => {
        let itemNum = Number.parseInt(item);
        if ((xField & itemNum) === itemNum || (oField & itemNum) === itemNum) {
            res.push(winNums[item]);
        };
    });
    return res;
};


