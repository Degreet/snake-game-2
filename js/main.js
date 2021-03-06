/*
    ?-Сделать, чтобы яблоко не могло появиться на змейке
    ?-добровольную трату Power (дольше работает)
    ?-счётчик длины змейки на экране
    ?-яблоки разного размера
    ?-и появляются по одному, два или три
    ?-таблицу рекордов
    ?-фикс потери змейки за отрицательными координатами
    ?-паузу
    ?-рестарт
    ?-больше блоков
    ?-блоки не пересекают стенки
    ?-второй прямоугольник головы пофиксить при выездах за экран
    !-спидометр
    ?-секундомер
    ?-счётчик столкновений
    ?-пересеканий экрана
    -поворотов
    ?-пробега
    ?-изгибов
    ?-угасание змейки к хвосту
    !-другая голова (квадратная) отдельным объектом
    !-проверка столкновений по нему
*/

const ctx = canv.getContext('2d')
const records = JSON.parse(localStorage.records || '[]')
let isLost = false
let showdownCount = 0, migrateCount = 0, distance = 0, rotateCount = 0, applesCount = 0

const apples = [
    {
        x: 500,
        y: 300,
        width: 20,
        length: 20
    }
]

const snake = {
    color: '#1fb9dd',
    colorHead: '#00ffff',
    colorApple: '#d86464',
    length: 200,
    width: 20,
    tick: 14,
    power: 0,
    accelerate: 2,
    parts: [
        {
            x: 100,
            y: 100,
            length: 100,
            dir: 'down'
        },
        {
            x: 120,
            y: 180,
            length: 100,
            dir: 'right'
        }
    ]
}

const blocks = []

onload = onresize = () => {
    if (innerWidth <= 1065) canv.width = 750
    if (innerWidth <= 785) canv.width = 600
}

nextColors.deg = 0;
[snake.color, snake.colorHead] = nextColors()

function drawSnake() {
    ctx.fillStyle = snake.color
    let turns = 0, portals = 0, lastDir
    let i = 0

    snake.parts.reduceRight((_, part) => {
        ctx.fillStyle = snake.color
        ctx.fillStyle = ctx.fillStyle + (255 - Math.min(200, 3*i++)).toString(16)
        if (part.dir == 'up' || part.dir == 'down') ctx.fillRect(part.x, part.y, snake.width, part.length)
        else ctx.fillRect(part.x, part.y, part.length, snake.width)

        if (lastDir) {
            if (lastDir != part.dir) turns++
            else portals++
        }

        rotateCountSpan.innerText = `Изгибов: ${turns}`
        portalsCountSpan.innerText = `Порталов: ${portals}`

        lastDir = part.dir
    }, 0)

    drawSnakeHead()
}

function drawApples() {
    ctx.fillStyle = snake.colorApple
    apples.forEach(apple => ctx.fillRect(apple.x, apple.y, apple.width, apple.width))
}

function drawBlocks() {
    ctx.fillStyle = '#425870'
    blocks.forEach(coords => {
        ctx.fillRect(coords.x, coords.y, snake.width * 2, snake.width * 2)
    })
}

function drawBlocks2() {
    const image = ctx.getImageData(0, 0, canv.width, canv.height)
    const { data } = image
    const steps = data.length / 4

    for (let i = 0; i < steps; i += 4) {
        const color = data.slice(i, i + 4).join()
        if (color == '0,0,0,0' || color == '66,88,112,255') continue
        else data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0
    }

    ctx.putImageData(image, 0, 0)
}

function generateBlocks() {
    const count = Math.floor(Math.random() * 19 + 1)
    for (let i = 0; i < count; i++) {
        const block = {
            x: Math.floor(Math.random() * (canv.width - (snake.width * 2))),
            y: Math.floor(Math.random() * (canv.height - (snake.width * 2)))
        }

        if (snake.parts.some(part => doRectsOverlap(rectFrom(part), rectFrom(block))) ||
            doRectsOverlap(rectFrom(block), rectFrom(apples[0]))) {
            i--
            continue
        }

        blocks.push(block)
    }
}

function generateApple() {
    const apple = {}
    apple.width = apple.length = Math.floor(Math.random() * 15 + 15)
    apple.x = Math.floor(Math.random() * (canv.width - apple.width))
    apple.y = Math.floor(Math.random() * (canv.height - apple.width))
    if (snake.parts.some(part => doRectsOverlap(rectFrom(apple), rectFrom(part)))) return generateApple()
    apples.push(apple)
}

function generateApples() {
    const seed = Math.floor(Math.random() * 9)
    const count = seed < 5 ? 1 : seed < 8 ? 2 : 3
    for (let i = 0; i < count; i++) generateApple()
}

function drawSnakeHead() {
    let head = snake.parts[snake.parts.length - 1]
    ctx.fillStyle = snake.colorHead

    if (head.length > snake.width) {
        if (head.dir == 'up' || head.dir == 'left') ctx.fillRect(head.x, head.y, snake.width, snake.width)
        else if (head.dir == 'down') ctx.fillRect(head.x, head.y + head.length - snake.width, snake.width, snake.width)
        else ctx.fillRect(head.x + head.length - snake.width, head.y, snake.width, snake.width)
    } else {
        if (head.dir == 'up' || head.dir == 'down') ctx.fillRect(head.x, head.y, snake.width, head.length)
        else ctx.fillRect(head.x, head.y, head.length, snake.width)

        const neck = snake.parts[snake.parts.length - 2]
        
        // if (head.dir == 'up') ctx.fillRect(head.x, neck.y, snake.width, snake.width - head.length)
        // else if (head.dir == 'down') ctx.fillRect(head.x, neck.y + head.length, snake.width, snake.width - head.length)
        // else if (head.dir == 'left') ctx.fillRect(neck.x, head.y, snake.width - head.length, snake.width)
        // else ctx.fillRect(neck.x + head.length, head.y, snake.width - head.length, snake.width)
        
        if (head.dir == 'up' || head.dir == 'left') ctx.fillRect(head.x, head.y, snake.width, snake.width)
        else if (head.dir == 'down') ctx.fillRect(head.x, head.y + head.length - snake.width, snake.width, snake.width)
        else ctx.fillRect(head.x + head.length - snake.width, head.y, snake.width, snake.width)
    }
}

function rndColor() {
    return '#' + Math.floor(Math.random() * 16777216).toString(16).padStart(6, 0)
}

function nextColors() {
    return [`hsl(${nextColors.deg += 10} 65% 50%)`, `hsl(${nextColors.deg++} 65% 30%)`]
}

function checkBlockCollision() {
    const head = snake.parts[snake.parts.length - 1]
    return blocks.some(block => doRectsOverlap(rectFrom(block), rectFrom(head)))
}

function checkAppleCollision() {
    const index = apples.findIndex(apple => {
        if (apple.eaten) return
        const head = snake.parts[snake.parts.length - 1]
        return doRectsOverlap(rectFrom(apple), rectFrom(head))
    })

    return index == -1 ? false : index
}

function checkSnakeCollision() {
    const head = snake.parts[snake.parts.length - 1]
    for (let i = 0; i < snake.parts.length - 1; i++) {
        if (doRectsOverlap(rectFrom(head), rectFrom(snake.parts[i]))) return true
    }
}

function checkBorderCollision() {
    const head = snake.parts[snake.parts.length - 1]
    return !(head.x >= 0 && head.y >= 0 && (head.dir == "left" || head.dir == "right" ?
        (head.x + head.length < canv.width && head.y + snake.width < canv.height) :
        (head.x + snake.width < canv.width && head.y + head.length < canv.height)))
}

function rectFrom(part) {
    const top = part.y, left = part.x
    let right, bottom
    if (part.length !== undefined) {
        right = left - 1 + (part.dir == 'up' || part.dir == 'down' ? snake.width : part.length),
            bottom = top - 1 + (part.dir == 'left' || part.dir == 'right' ? snake.width : part.length)
    } else {
        right = left + snake.width * 2
        bottom = top + snake.width * 2
    }
    return { top, left, right, bottom }
}

function doRectsOverlap(rect1, rect2) {
    return !(
        rect1.left < rect2.left && rect1.right < rect2.left ||
        rect1.right > rect2.right && rect1.left > rect2.right ||
        rect1.top < rect2.top && rect1.bottom < rect2.top ||
        rect1.bottom > rect2.bottom && rect1.top > rect2.bottom
    )
}

function tick() {
    const head = snake.parts[snake.parts.length - 1]
    const tail = snake.parts[0]

    distance++
    distanceSpan.innerText = `Пробег: ${distance}`

    if (!apples.some(apple => apple.eaten)) {
        if (tail.dir == 'down') tail.y++
        else if (tail.dir == 'right') tail.x++
        tail.length--
    }

    if (tail.length <= snake.width && !tail.portal) {
        snake.parts.shift()
        const tail = snake.parts[0]
        if (tail.dir == 'down') tail.y -= snake.width
        else if (tail.dir == 'right') tail.x -= snake.width
        tail.length += snake.width
    } else if (tail.length <= 0) {
        snake.parts.shift()
    }

    if (head.dir == 'left') head.x = head.x > -5 ? head.x - 1 : 0
    else if (head.dir == 'up') head.y = head.y > -5 ? head.y - 1 : 0
    head.length++

    snake.length = snake.parts.reduce((sum, part) => sum + part.length, 0)
    snakeLengthSpan.innerText = `Длина: ${snake.length}`

    ctx.clearRect(0, 0, canv.width, canv.height)
    drawBlocks()
    drawApples()
    drawSnake()

    if (checkBorderCollision()) {
        portalSnake()
    }

    if (!snake.strong && checkBlockCollision()) {
        handleCollision()
    } else {
        loseSpan.style.display = 'none'
    }

    const appleIndex = checkAppleCollision()

    if (appleIndex !== false) {
        const apple = apples[appleIndex]
        apple.eaten = true
        snake.power++
        applesCount++
        applesCountSpan.innerText = `Яблок: ${applesCount}`
        powerSpan.innerText = `Сила: ${snake.power}`
        const applesLeft = apples.reduce((count, apple) => count += apple.eaten ? 0 : 1, 0)
        if (!applesLeft) setTimeout(generateApples, snake.tick * apple.width)
        setTimeout(() => {
            apples.splice(apples.indexOf(apple), 1)
        }, snake.tick * apple.width)
    }

    if (!snake.strong && checkSnakeCollision()) {
        handleCollision();
        [snake.color, snake.colorHead] = nextColors()
    }

    if (snake.nextDir && (head.length > snake.width || snake.nextDir == snake.parts[snake.parts.length - 2].dir)) {
        turnSnake(snake.nextDir)
        delete snake.nextDir
    }

    if (!isLost) tickInterval = setTimeout(tick, snake.tick)
}

function usePower() {
    snake.power--
    powerSpan.innerText = `Сила: ${snake.power}`
    powerSpan.style.fontSize = '40px'
    snake.strong = true
    snake.tick /= snake.accelerate
    setTimeout(() => {
        snake.strong = false
        powerSpan.style.fontSize = '20px'
        snake.tick *= snake.accelerate
    }, 5000)
}

function handleCollision() {
    if (snake.power) {
        usePower()
        showdownCount++
        showdownCountSpan.innerText = `Ударов: ${showdownCount}`
    } else {
        loseSpan.style.display = 'unset'
        if (snake.length > 200) {
            records.push([snake.length, new Date().toLocaleString()])
            localStorage.records = JSON.stringify(records.sort().reverse())
        }
        console.log(records)
        isLost = true
        clearTimeout(tickInterval)

        recordList.innerHTML = ''
        records.forEach(record => {
            recordList.innerHTML += /*html*/`
                <li>
                    <span>${snake.length == record[0] ? `<big><b>${record[0]}</b></big>` : record[0]}</span>
                    <span>${record[1]}</span>
                </li>
            `
        })
        recordList.className = 'active'
    }
}

function portalSnake() {
    const head = snake.parts[snake.parts.length - 1]
    const newHead = { length: 0 }
    head.portal = true

    migrateCount++
    migrateCountSpan.innerText = `Побегов: ${migrateCount}`

    if (head.dir == 'up') {
        Object.assign(newHead, {
            x: head.x,
            y: canv.height - 1,
            dir: 'up'
        })
    } else if (head.dir == 'down') {
        Object.assign(newHead, {
            x: head.x,
            y: 0,
            dir: 'down'
        })
    } else if (head.dir == 'left') {
        Object.assign(newHead, {
            x: canv.width - 1,
            y: head.y,
            dir: 'left'
        })
    } else {
        Object.assign(newHead, {
            x: 0,
            y: head.y,
            dir: 'right'
        })
    }

    snake.parts.push(newHead)
}

function turnSnake(dir) {
    const head = snake.parts[snake.parts.length - 1]
    const newHead = { length: 0 }

    if (dir == 'up') {
        Object.assign(newHead, {
            x: head.dir == 'left' ? head.x : head.x + head.length - snake.width,
            y: head.y,
            dir: 'up'
        })
    } else if (dir == 'down') {
        Object.assign(newHead, {
            x: head.dir == 'left' ? head.x : head.x + head.length - snake.width,
            y: head.y + snake.width,
            dir: 'down'
        })
    } else if (dir == 'left') {
        Object.assign(newHead, {
            x: head.x,
            y: head.dir == 'up' ? head.y : head.y + head.length - snake.width,
            dir: 'left'
        })
    } else {
        Object.assign(newHead, {
            x: head.x + snake.width,
            y: head.dir == 'up' ? head.y : head.y + head.length - snake.width,
            dir: 'right'
        })
    }

    snake.parts.push(newHead)
}

function timer() {
    seconds++

    if (seconds >= 60) {
        seconds = 0
        minutes++
    }

    if (minutes >= 60) {
        minutes = 0
        hours++
    }

    timerSpan.innerText = `${hours.toString().length == 1 ? `0${hours}` : hours}:${minutes.toString().length == 1 ? `0${minutes}` : minutes}:${seconds.toString().length == 1 ? `0${seconds}` : seconds}`
}

onkeydown = e => {
    const head = snake.parts[snake.parts.length - 1]
    if (!head.length) return

    if (e.key == 'ArrowUp' && (head.dir == 'left' || head.dir == 'right')) snake.nextDir = 'up'
    else if (e.key == 'ArrowDown' && (head.dir == 'left' || head.dir == 'right')) snake.nextDir = 'down'
    else if (e.key == 'ArrowLeft' && (head.dir == 'up' || head.dir == 'down')) snake.nextDir = 'left'
    else if (e.key == 'ArrowRight' && (head.dir == 'up' || head.dir == 'down')) snake.nextDir = 'right'

    if (e.key == 'r') location.reload()
    else if (e.key == ' ' && !snake.strong && snake.power) usePower()
    else if (e.key == 'Escape') {
        if (tickInterval) {
            clearTimeout(tickInterval)
            tickInterval = 0
            recordList.className = 'active'
        } else {
            tickInterval = setTimeout(tick, snake.tick)
            recordList.className = ''
        }

        if (timerInterval) {
            clearInterval(timerInterval)
            timerInterval = 0
        } else timerInterval = setInterval(timer, 1000)
    } else if (e.key == 'Backspace') {
        snake.power = 0
        handleCollision()
    }
}

// drawSnake()
generateBlocks()
drawBlocks()
let tickInterval = setTimeout(tick, snake.tick)

let hours = 0, minutes = 0, seconds = 0
let timerInterval = setInterval(timer, 1000)

records.forEach(record => {
    recordList.innerHTML += /*html*/`
        <li>
            <span>${snake.length == record[0] ? `<big><b>${record[0]}</b></big>` : record[0]}</span>
            <span>${record[1]}</span>
        </li>
    `
})