// main.js

function main() {
    const submitBtn = document.querySelector('.playBtn');
    submitBtn.addEventListener('click', function(evt) {
        evt.preventDefault();

        // remove the start values query after user hits play
        const start = document.querySelector(".start");
        start.classList.add('remove');
        
        play();
    });
}

function play() {
    // generate a randomized deck, with user specified start values on top
    const startValues = document.querySelector("#startValues").value;
    const deck = generateDeck(startValues);
    
    // deal starting cards
    const playerHand = [];
    const computerHand = [];
    for(let i = 0; i < 2; i++) {
        computerHand.push(deck.shift());
        playerHand.push(deck.shift());
    }
    
    // display game on page, 6 row flexbox structure
    //
    //     COMPUTER TOTAL   (row 0)
    //     COMPUTER HAND    (row 1)
    //        
    //     PLAYER TOTAL     (row 2)
    //     PLAYER HAND      (row 3)
    //
    //     HIT OR STAND     (row 4)
    //     RESTART          (row 5)
    //
    const rows = [];
    for(let i = 0; i < 6; i++) {
        let row = document.createElement('div');
        row.className = 'row';
        rows.push(row);
    }

    // displayer computer total (?)
    displayTotal(computerHand, rows[0], false);

    // display computer hand
    displayCard(computerHand[0].value, computerHand[0].suit, rows[1], true);
    displayCard(computerHand[1].value, computerHand[1].suit, rows[1], false);

    // display player total
    displayTotal(playerHand, rows[2], true);

    // display player hand
    displayCard(playerHand[0].value, playerHand[0].suit, rows[3], false);
    displayCard(playerHand[1].value, playerHand[1].suit, rows[3], false);

    // display hit or stand
    let hit = document.createElement('button');
    hit.className = 'hit';
    hit.innerHTML = 'Hit';

    let stand = document.createElement('button');
    stand.className = 'stand';
    stand.innerHTML = 'Stand';

    rows[4].append(hit);
    rows[4].append(stand);

    const game = document.querySelector('.game');
    rows.map((row) => game.append(row));

    // start game, player goes first
    playerTurn(playerHand, computerHand, rows, deck);
}

function handleGameFinish(outcome, playerHand, computerHand, rows) {
    // display computer total
    const cpuTotal = calculateHand(computerHand);
    document.querySelector('.computerTotal').innerText = `Computer Hand - Total: ${cpuTotal}`;

    // display rest of computer cards
    document.querySelector('.hiddenCard').className = 'card';
    for(let i = 2; i < computerHand.length; i++) {
        displayCard(computerHand[i].value, computerHand[i].suit, rows[1], false);
        console.log(computerHand[i]);
    }

    // remove hit and stand buttons
    const hit = document.querySelector('.hit');
    hit.remove();
    const stand = document.querySelector('.stand');
    stand.remove();

    // if both sides choose stand, compare results
    if(outcome === 3) {
        const cpuScore = Math.abs(cpuTotal-21);
        const playerScore = Math.abs(calculateHand(playerHand)-21)
        if(cpuScore > playerScore) {
            outcome = 1;
        } else if(cpuScore < playerScore) {
            outcome = 2;
        } else {
            outcome = 3;
        }
    }

    // add winning message
    const win = document.createElement('div');
    const msg = document.createElement('p');
    msg.className = 'msg';
    if(outcome === 1) {
        console.log("PLAYER WINS");
        win.className = 'playerWin';
        msg.innerText = "PLAYER WINS!";
    } else if(outcome === 2) {
        console.log("COMPUTER WINS");
        win.className = 'computerWin';
        msg.innerText = "COMPUTER WINS!";
    } else {
        console.log("DRAW");
        win.className = 'draw';
        msg.innerText = "DRAW!"
    }
    win.append(msg);
    rows[4].append(win);

    const restart = document.createElement('div');
    const restartTxt = document.createElement('p');
    restart.className = 'restart';
    restartTxt.className = 'msg';
    restartTxt.innerText = "Restart";
    restart.append(restartTxt);
    rows[5].append(restart);
    restart.addEventListener('click', function(evt) {
        const game = document.querySelector('.game');
        while (game.lastElementChild) {
            game.removeChild(game.lastElementChild);
        }
        play();
    });
}

// outcome 1 means player wins
// outcome 2 means computer wins
// outcome 3 means both choose to stand
function playerTurn(playerHand, computerHand, rows, deck) {
    let outcome = 0;
    let result = 0;
    let cpuStandState = false;
    let pStandState = false;
    const hitBtn = document.querySelector('.hit');
    const standBtn = document.querySelector('.stand');

    // player hit option
    hitBtn.addEventListener('click', function(evt) {
        evt.preventDefault();

        // deal new card from deck and update total
        const newCard = deck.shift();
        playerHand.push(newCard);
        displayCard(newCard.value, newCard.suit, rows[3], false);
        const sum = calculateHand(playerHand);
        document.querySelector('.playerTotal').innerText = `Player Hand - Total: ${sum}`;

        if(calculateHand(playerHand) > 21) {
            outcome = 2;
        } else {
            // go to computer turn
            result = computerTurn(computerHand, deck, pStandState);
            if(result === -1) {
                outcome = 1;
            } else if(result == 1) {
                cpuStandState = true;
            } else if(result == 2) {
                outcome = 3;
            }
        }

        if(outcome !== 0) {
            handleGameFinish(outcome, playerHand, computerHand, rows);
            return outcome;
        }
    });

    // player stand option
    standBtn.addEventListener('click', function(evt) {
        evt.preventDefault();

        // player does nothing. go to computer turn
        // if computer choose to stand last turn, then game is over
        pStandState = true;
        if(cpuStandState) {
            outcome = 3;
        } else {
            result = computerTurn(computerHand, deck, pStandState);
            if(result === -1) {
                outcome = 1;
            } else if(result == 1) {
                cpuStandState = true;
            } else if(result == 2) {
                outcome = 3;
            }
        }

        if(outcome !== 0) {
            handleGameFinish(outcome, playerHand, computerHand, rows);
            return outcome;
        }
    });
    
}

// return -1 if computer hits and busts
// return 0 if computer hits successfully
// return 1 if computer stands
// return 2 if computer stands, and the player choose to stand the round before
function computerTurn(computerHand, deck, pStandState) {
    const random = Math.floor(Math.random() * 20);
    if(random < 14) {
        console.log("COMPUTER CHOOSES TO HIT");
        const newCard = deck.shift();
        computerHand.push(newCard);
        console.log(computerHand);
        if(calculateHand(computerHand) > 21) {
            return -1;
        }
        return 0;
    } else {
        console.log("COMPUTER CHOOSES TO STAND");
        if(pStandState) {
            return 2;
        } else {
            return 1;
        }
    }
}

function calculateHand(hand) {
    // aces are added at the end to optimize their value
    let aces = [];
    let sum = 0;
    hand.map((card) => {
        if(card.value !== 'A') {
            if(card.value === 'J' || card.value === 'Q' || card.value === 'K') {
                sum += 10;
            } else {
                sum += parseInt(card.value);
            }
        } else {
            aces.push(card);
        }
    });

    // if an 11-value ace can be added safely, add it. otherwise add 1-value ace
    // "safely" means: current ace is 11 value. all other aces are assumed to be 1-value. adding them up gives <= 21
    aces.map((ace) => {
        if(sum + aces.length + 10 <= 21) {
            sum += 11;
            aces.shift();
        } else {
            sum += 1;
        }
    });

    return sum;
}

function displayTotal(hand, row, isPlayer) {
    let total = document.createElement('div');
    let display = document.createElement('p');
    let name, sum;

    if(isPlayer) {
        name = 'Player';
        sum = calculateHand(hand);
        display.className = 'playerTotal';
    } else {
        name = 'Computer'
        sum = '?';
        display.className = 'computerTotal';
    }
    total.className = 'total';
    display.innerText = `${name} Hand - Total: ${sum}`;
    total.append(display);
    row.append(total);
}

function displayCard(value, suit, row, hidden) {
    // value of -1 indicates card is hidden
    let card = document.createElement('div');
    card.className = 'hiddenCard';
    let symbol = '';
    switch(suit) {
        case('heart'):
            symbol = '♥';
            break;
        case('diamond'):
            symbol = '♦';
            break;
        case('spade'):
            symbol = '♠';
            break;
        case('club'):
            symbol = '♣';
            break;
        default:
            console.log("error, card has invalid suit");
    }
    if(hidden) {
        card.className = 'hiddenCard';
    } else {
        card.className = 'card';
    }
    card.append(value, document.createElement('p'));
    card.append(symbol, document.createElement('p'));
    
    row.append(card);
}

function card(position, value, suit) {
    this.position = position;
    this.value = value;
    this.suit = suit;
}

function generateDeck(startValues) {
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
	const suits = ['heart','diamond','spade','club'];
    let deck = [];
    
    // generate a deck of 52 cards
    let position = 1;
    suits.map((suit) => {
        values.map((value) => {
            deck.push(new card(position, value, suit));
            position++;
        });
    });

    // shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // if user specified start values, move matching cards to top of deck
    if(startValues !== '') {
        const targetCards = [];
        // find specified cards in deck, store them in targetCards, and pop them out of deck
        const values = startValues.trim().toUpperCase().split(',');
        values.map((value) => {
            const target = deck.find((card) => card.value == value);
            deck.splice(deck.indexOf(target), 1);
            targetCards.push(target);
        });
        // re-add the cards to the top of the deck
        targetCards.reverse().map((card) => {
            deck.unshift(card);
        });
    }

    return deck;
}

document.addEventListener('DOMContentLoaded', main);