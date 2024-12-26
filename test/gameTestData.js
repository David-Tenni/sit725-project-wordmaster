const testData = {
    rounds: [
      {
        category: 'animals',
        answers: {
          james: { word: 'elephant', time: 3500 },
          sofia: { word: 'giraffe', time: 4200 },
          lucas: { word: 'penguin', time: 2800 }
        }
      },
      {
        category: 'countries',
        answers: {
          james: { word: 'france', time: 2900 },
          sofia: { word: 'brazil', time: 3700 },
          lucas: { word: 'japan', time: 4500 }
        }
      },
      {
        category: 'periodic elements',
        answers: {
          james: { word: 'hydrogen', time: 3100 },
          sofia: { word: 'helium', time: 2500 },
          lucas: { word: 'lithium', time: 4700 }
        }
      },
      {
        category: 'best picture winning movies',
        answers: {
          james: { word: 'titanic', time: 3300 },
          sofia: { word: 'parasite', time: 4100 },
          lucas: { word: 'gladiator', time: 2900 }
        }
      },
      {
        category: 'animals',
        answers: {
          james: { word: 'kangaroo', time: 2800 },
          sofia: { word: 'octopus', time: 3900 },
          lucas: { word: 'cheetah', time: 3100 }
        }
      },
      {
        category: 'countries',
        answers: {
          james: { word: 'germany', time: 3400 },
          sofia: { word: 'australia', time: 2800 },
          lucas: { word: 'mexico', time: 4200 }
        }
      },
      {
        category: 'periodic elements',
        answers: {
          james: { word: 'oxygen', time: 3000 },
          sofia: { word: 'calcium', time: 3600 },
          lucas: { word: 'nitrogen', time: 2700 }
        }
      },
      {
        category: 'best picture winning movies',
        answers: {
          james: { word: 'spotlight', time: 3800 },
          sofia: { word: 'chicago', time: 3200 },
          lucas: { word: 'moonlight', time: 4300 }
        }
      },
      {
        category: 'animals',
        answers: {
          james: { word: 'dolphin', time: 2600 },
          sofia: { word: 'leopard', time: 3500 },
          lucas: { word: 'gorilla', time: 4000 }
        }
      },
      {
        category: 'countries',
        answers: {
          james: { word: 'sweden', time: 3200 },
          sofia: { word: 'portugal', time: 3800 },
          lucas: { word: 'thailand', time: 2900 }
        }
      }
    ]
  };
  
  //  helper function to get answers for a specific round
  function getRoundData(roundNumber) {
    return testData.rounds[roundNumber - 1];
  }
  
  //  helper function to get  response time for a specific player and round
  function getAIResponseTime(playerName, roundNumber) {
    const round = getRoundData(roundNumber);
    return round?.answers[playerName.toLowerCase()]?.time || null;
  }
  
  window.gameTestData = testData;
  window.getRoundData = getRoundData;
  window.getAIResponseTime = getAIResponseTime;