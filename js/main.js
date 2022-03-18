import wordList from "./wordList.js";
String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
document.addEventListener("DOMContentLoaded", () => {
  createSquares();
  
  let finished = false;
  let guessedWords = [[]];
  let availableSpace = 1;
  let guessedWordCount = 0;

  let word;
  let event = new Date();
  let dateStr = event.toLocaleDateString();
  getNewWord();
  // console.log(word)

  const share = document.getElementById("shareButton");
  console.log(share);
  share.onclick = () => {
    console.log("here share no solve");
    alert("Solve WUrdle first");
  };
  console.log(share);

  if (localStorage.getItem("date") === dateStr) {
    prePopulate();
  } else { 
    dePopulate();
    localStorage.setItem("date", dateStr);
  }

  const keys = document.querySelectorAll(".keyboard-row button");
  
  function copyText() {
    let copyStr = "";

    for (let i = 0; i < guessedWords.length; i++) {
      for (let j = 0; j < guessedWords[i].length; j++) {
        if (guessedWords[i][j] == word[j]) {
          copyStr = copyStr + String.fromCodePoint(0x1F7E9);
        } else if (closeToLetter(guessedWords[i][j], j)) {
          copyStr = copyStr + String.fromCodePoint(0x1F7E8);
        } else {
          copyStr = copyStr + String.fromCodePoint(0x2B1B);
        }
      }
      copyStr = copyStr + "\n";
    }
    copyStr = copyStr + "\n";
    copyStr = copyStr + "Krishna Productions (not BWU)";
    copyStr = copyStr + "\n";
    copyStr = copyStr + "https://akashk23.github.io/WURDLE/";
    return copyStr;
  }

  function dePopulate() {
    let letterId = 1;
    while (localStorage.getItem(String(letterId))) {
      localStorage.removeItem(String(letterId));
      letterId = letterId + 1;
    }
    localStorage.removeItem("finished");
  }

  function prePopulate() {
    let letterId = 1;
    while (localStorage.getItem(String(letterId))) {
      let prevLetter = localStorage.getItem(String(letterId));
      updateGuessedWords(prevLetter);
      letterId = letterId + 1;
      if (letterId % 5 == 1 && letterId > 5) {
        preApprovedWords();
      }
    }
    finished = localStorage.getItem("finished") === "done";
    if (finished) {
      share.onclick = () => {
        navigator.clipboard.writeText(copyText());
        alert("copied text");
      };
    }
  }

  function getNewWord() {
    // console.log(wordList[Math.floor(Math.random() * 2316)]);
    word = wordList[dateStr.hashCode() % 2316];

  }

  function getCurrentWordArr() {
    const numberOfGuessedWords = guessedWords.length;
    return guessedWords[numberOfGuessedWords - 1];
  }

  function updateGuessedWords(letter) {
    const currentWordArr = getCurrentWordArr();
    if (currentWordArr && currentWordArr.length < 5) {
      currentWordArr.push(letter);

      const availableSpaceEl = document.getElementById(String(availableSpace));
      localStorage.setItem(String(availableSpace), letter);
      availableSpace = availableSpace + 1;
      availableSpaceEl.textContent = letter;
    }
  }

  function preApprovedWords() {
    const currentWordArr = getCurrentWordArr();
    const firstLetterId = guessedWordCount * 5 + 1;
    const interval = 200;
    currentWordArr.forEach((letter, index) => {
      setTimeout(() => {
        const tileColor = getTileColor(letter, index);

        const letterId = firstLetterId + index;
        const letterEl = document.getElementById(letterId);
        letterEl.classList.add("animate__flipInX");
        letterEl.style = `background-color:${tileColor};border-color:${tileColor}`;
      }, interval * index);
    });

    guessedWordCount += 1;
    guessedWords.push([]);
  }

  function getTileColor(letter, index) {
    const isCorrectLetter = word.includes(letter);

    // if (!isCorrectLetter) {
      // return "rgb(58, 58, 60)";
    // }

    const letterInThatPosition = word.charAt(index);
    const isCorrectPosition = letter === letterInThatPosition;

    if (isCorrectPosition) {
      return "rgb(83, 141, 78)";
    }

    if (closeToLetter(letter, index)) {
      return "rgb(181, 159, 59)";
    } else {
      return "rgb(58, 58, 60)";
    }
  }

  function closeToLetter(letter, index) {
    let guessCode = letter.charCodeAt(0);
    let actualCode = word.charCodeAt(index);
    guessCode = guessCode - 97;
    actualCode = actualCode - 97;

    if ((actualCode > guessCode - 4) && (actualCode < guessCode + 4)) {
      return true;
    }
    
    let maxVal = Math.max(guessCode, actualCode);
    let minVal = Math.min(guessCode, actualCode);
    if ((maxVal - minVal) >= 23) {
      return true;
    }
    return false;

  }

  function handleSubmitWord() {
    const currentWordArr = getCurrentWordArr();
    if (currentWordArr.length !== 5) {
      window.alert("Word must be 5 letters");
    }

    const currentWord = currentWordArr.join("");

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentWord}`, {
      method: "GET",
      
    })
      .then((res) => {
        if (!res.ok) {
          throw Error();
        }
        // console.log(res.json());

        const firstLetterId = guessedWordCount * 5 + 1;
        const interval = 200;
        currentWordArr.forEach((letter, index) => {
          setTimeout(() => {
            const tileColor = getTileColor(letter, index);

            const letterId = firstLetterId + index;
            const letterEl = document.getElementById(letterId);
            letterEl.classList.add("animate__flipInX");
            letterEl.style = `background-color:${tileColor};border-color:${tileColor}`;
          }, interval * index);
        });

        guessedWordCount += 1;

        if (currentWord === word) {
          window.alert("Congratulations!");
          finished = true;
          localStorage.setItem("finished", "done")
          share.onclick = () => {
            navigator.clipboard.writeText(copyText());
            alert("copied text");
          };
        } else if (guessedWords.length === 6) {
          window.alert(`Sorry, you have no more guesses! The word is ${word}.`);
          finished = true;
          localStorage.setItem("finished", "done");
          share.onclick = () => {
            navigator.clipboard.writeText(copyText());
            alert("copied text");
          };
        }
        guessedWords.push([]);
      })
      .catch(() => {
        window.alert("Word is not recognised!");
      });
  }

  function createSquares() {
    const gameBoard = document.getElementById("board");

    for (let index = 0; index < 30; index++) {
      let square = document.createElement("div");
      square.classList.add("square");
      square.classList.add("animate__animated");
      square.setAttribute("id", index + 1);
      gameBoard.appendChild(square);
    }
  }

  function handleDeleteLetter() {
    const currentWordArr = getCurrentWordArr();
    if (availableSpace % 5 == 1 && currentWordArr.length == 0) {
      return;
    }
    const removedLetter = currentWordArr.pop();

    guessedWords[guessedWords.length - 1] = currentWordArr;

    const lastLetterEl = document.getElementById(String(availableSpace - 1));
    
    lastLetterEl.textContent = "";
    availableSpace = availableSpace - 1;
    localStorage.removeItem(String(availableSpace));
  }

  for (let i = 0; i < keys.length; i++) {
    // console.log(finished);
    keys[i].onclick = ({ target }) => {
      const letter = target.getAttribute("data-key");
      if (!finished) {
        if (letter === "enter") {
          handleSubmitWord();
          return;
        }
  
        if (letter === "del") {
          handleDeleteLetter();
          return;
        }
  
        updateGuessedWords(letter);
      } 
    };
  }
});
