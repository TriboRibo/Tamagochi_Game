const animalContainer = document.getElementById("selectYourAnimal") as HTMLElement;
const selectContainer = document.getElementById("selectContainer") as HTMLElement;
const mainGameContainer = document.getElementById("gameContainer") as HTMLElement;
const startGameButton = document.getElementById("startGame") as HTMLElement;

const animalIconElem = document.getElementById("animalIconElem") as HTMLElement;

const hungerElem = document.getElementById('hunger') as HTMLElement;
const happinessElem = document.getElementById('happiness') as HTMLElement;
const energyElem = document.getElementById('energy') as HTMLElement;

const feedButton = document.getElementById('feedButton') as HTMLElement;
const playButton = document.getElementById('playButton') as HTMLElement;
const sleepButton = document.getElementById('sleepButton') as HTMLElement;

const animals: { [key: string]: string } = {
    blackBird: '🐦‍⬛',
    babyChick: '🐤',
    frontFacingBabyChick: '🐥',
    duck: '🦆',
    parrot: 'sprite',
    antelope: 'spriteA'
};

let selectedAnimal: string | null = null;
let hunger = 0;
let happiness = 100;
let energy = 100;
let gameInterval: number | null = null;
let spriteIntervals: { [className: string]: number } = {}
let movementInterval: number | null = null;

const spriteData = [
    { className: 'sprite', width: 560, frameWidth: 140, frameHeight: 143, maxPosY: 572, interval: 100 },
    { className: 'spriteA', width: 564, frameWidth: 141, frameHeight: 90, maxPosY: 180, interval: 100 },
];

function populateAnimalOptions() {
    animalContainer.innerHTML = '';
    Object.entries(animals).forEach(([name, className]) => {
        const animalOption = document.createElement('div');
        animalOption.classList.add('animalOption');

        if (className.startsWith('sprite')) {
            animalOption.innerHTML = `
                <div class="icon ${className}">
                    <div class="nameHover">${name}</div>
                </div>    
            `
            animalOption.addEventListener('click', () => {
                selectAnimal(name, className, animalOption);
            })
        } else {
            animalOption.innerHTML = `
                <div class="icon">${className}
                    <div class="nameHover">${name}</div>
                </div>
            `
            animalOption.addEventListener('click', () => {
                selectAnimal(name, className, animalOption)
            })
        }
        animalContainer.appendChild(animalOption)
    })
    animateSprites()
}

function selectAnimal(animalName: string, animalClass:string, element: HTMLElement):void {
    selectedAnimal = animalName;

    if (animalClass.startsWith('sprite')) {
        animalIconElem.innerHTML = '';
        animalIconElem.className = `icon ${animalClass}`;
        animateSprite(animalClass);
    } else {
        animalIconElem.innerHTML = animalClass;
        animalIconElem.className = 'icon';
        stopAllSpriteAnimations();
    }

    document.querySelectorAll('.animalOption').forEach(option => {
        option.classList.remove('selected');
    });

    element.classList.add('selected');
    startGameButton.classList.remove('d-none');
}

startGameButton.addEventListener('click', () => {
    if (selectedAnimal) {
        selectContainer.classList.add('d-none');
        mainGameContainer.classList.remove('d-none');
        startGame()
    } else {
        alert('Please select an animal');
    }
})

function startGame() {
    updateStatus()
    gameInterval = window.setInterval(decreaseStats, 2000)
    startMovement()
}

function updateStatus() {
    hungerElem.innerHTML = `Hunger: ${hunger}`;
    happinessElem.innerHTML = `Happiness: ${happiness}`;
    energyElem.innerHTML = `Energy: ${energy}`;
}

function feed() {
    if (hunger > 0) {
        hunger -= 10;
        if (hunger < 0) hunger = 0;
        happiness += 5;
        if (happiness > 100) happiness = 100;
    }
    updateStatus();
}

function play() {
    if (energy > 10) {
        happiness += 10;
        energy -= 5;
        if (happiness > 100) happiness = 100;
    }
    updateStatus();
}

function sleep() {
    if (energy < 100) {
        energy += 30;
        if (energy > 100) energy = 100;
        hunger += 10;
    }
    updateStatus();
}

function decreaseStats() {
    hunger += 5;
    happiness -= 5;
    energy -= 5;

    if (hunger > 100) hunger = 100;
    if (happiness < 0) happiness = 0;
    if (energy < 0) energy = 0;

    updateStatus();

    if (hunger >= 100 || happiness <= 0 || energy <= 0) {
        alert("Game Over! Your Tamagotchi has died.");
        if (gameInterval) clearInterval(gameInterval);
        if (movementInterval) clearInterval(movementInterval);
    }
}

function animateSprites() {
    spriteData.forEach(({ className, width, frameWidth, frameHeight, maxPosY, interval }) => {
        const spriteDiv = document.querySelector(`.${className}`);
        if (spriteDiv) {
            if (spriteIntervals[className]){
                clearInterval(spriteIntervals[className])
            }
            let posX = 0;
            let posY = 0;
            spriteIntervals[className] = window.setInterval(() => {
                spriteDiv.style.backgroundPosition = `-${posX}px -${posY}px`;
                posX += frameWidth;
                if (posX >= width) {
                    posX = 0;
                    posY += frameHeight;
                    if (posY >= maxPosY) {
                        posY = 0;
                    }
                }
            }, interval)
        }
    });
}

function animateSprite(className: string) {
    if (spriteIntervals[className]) {
        clearInterval(spriteIntervals[className]);
    } // Check if animation is already running

    const spriteDiv = document.querySelector(`.${className}`) as HTMLElement;
    const spriteInfo = spriteData.find(data => data.className === className);
    if (spriteDiv && spriteInfo) {
        let {width, frameWidth, frameHeight, maxPosY, interval} = spriteInfo
        let posX = 0;
        let posY = 0;
        spriteIntervals[className] = window.setInterval(() => {
            spriteDiv.style.backgroundPosition = `-${posX}px -${posY}px`;
            posX += frameWidth;
            if (posX >= width) {
                posX = 0;
                posY += frameHeight;
                if (posY >= maxPosY) {
                    posY = 0;
                }
            }
        }, interval);
    }
}

function stopAllSpriteAnimations() {
    for (const className in spriteIntervals) {
        clearInterval(spriteIntervals[className]); // Stop all sprite animations
    }
    spriteIntervals = {}; // Clear the sprite intervals object
}

function startMovement() {
    const road = document.getElementById('animalRoad') as HTMLElement;
    const roadWidth = road.clientWidth
    const iconWidth = animalIconElem.clientWidth
    let position = 0
    let direction = 1; // 1 for right, -1 for left

    if (movementInterval) clearInterval(movementInterval)
    movementInterval = setInterval(() => {
        position += direction *5; //move 5 px at a time
        animalIconElem.style.left = `${position}px`;
        if (position + iconWidth >= roadWidth || position <= 0) {
            direction *= -1 // change direction
        }
    }, 50)
}

populateAnimalOptions()
updateStatus()

feedButton.onclick = () => {
    feed();
}
playButton.onclick = () => {
    play();
}
sleepButton.onclick = () => {
    sleep();
}