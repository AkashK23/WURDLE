import wordList from "./wordList.js";
document.addEventListener("DOMContentLoaded", () => {
  createSquares();
  

  let guessedWords = [[]];
  let availableSpace = 1;

  let word;
  getNewWord();
  // console.log(word);
  // console.log("here")
  let guessedWordCount = 0;

  const keys = document.querySelectorAll(".keyboard-row button");

  function getNewWord() {
    // console.log(wordList[Math.floor(Math.random() * 2316)]);
    word = wordList[Math.floor(Math.random() * 2316)];

    // fetch(
    //   `https://wordsapiv1.p.rapidapi.com/words/?random=true&lettersMin=5&lettersMax=5`,
    //   {
    //     method: "GET",
    //     headers: {
    //       "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
    //       "x-rapidapi-key": "<YOUR_KEY_GOES_HERE>",
    //     },
    //   }
    // )
    //   .then((response) => {
    //     return response.json();
    //   })
    //   .then((res) => {
    //     word = res.word;
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //   });
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

      availableSpace = availableSpace + 1;
      availableSpaceEl.textContent = letter;
    }
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
        }

        if (guessedWords.length === 6) {
          window.alert(`Sorry, you have no more guesses! The word is ${word}.`);
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
    const removedLetter = currentWordArr.pop();

    guessedWords[guessedWords.length - 1] = currentWordArr;

    const lastLetterEl = document.getElementById(String(availableSpace - 1));

    lastLetterEl.textContent = "";
    availableSpace = availableSpace - 1;
  }

  for (let i = 0; i < keys.length; i++) {
    keys[i].onclick = ({ target }) => {
      const letter = target.getAttribute("data-key");

      if (letter === "enter") {
        handleSubmitWord();
        return;
      }

      if (letter === "del") {
        handleDeleteLetter();
        return;
      }

      updateGuessedWords(letter);
    };
  }
});
