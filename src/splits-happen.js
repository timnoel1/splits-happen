'use strict';

const SYMBOL_MAP = { 
  STRIKE: 'X',
  SPARE: '/',
  MISS: '-'
};

const SCORE_MAP = {
  'X': 10,
  '/': 10,
  '-': 0
};

var isStrikeFrame
  , isSpareFrame
  , getValue
  , strikeAdder
  , spareAdder
  , frameParser
  , lastFrameCalculator
  , gameCalculator
  , readGame
  , game
  , frames
  , score;

/**
 * Helper function to identify strike frames
 *
 * @params array frame - current frame
 * @returns bool
 */
isStrikeFrame = (frame) => frame[0] == SYMBOL_MAP.STRIKE && frame.length == 1; 

/**
 * Helper function to identify spare frames
 *
 * @params array frame - current frame
 * @returns bool
 */
isSpareFrame = (frame) => frame[1] == SYMBOL_MAP.SPARE;

/**
 * Helper function used to evaluate the value a roll
 *
 * @params string roll - a single roll of a frame
 * @returns int - numerical value of that roll  
 */
getValue = (roll) => {
  // Check for symbols first
  if( SCORE_MAP[roll] !== undefined ) {
    return SCORE_MAP[roll];
  }

  // Otherwise parse the number
  return parseInt(roll);
};

/**
 * Used to determine the score in a strike frame
 *
 * @params array followingFrames - the following two (or one) frames
 * @returns int - this frame's score
 */
strikeAdder = (followingFrames) => {
  var sum = SCORE_MAP[SYMBOL_MAP.STRIKE];

  // Logic for consecutive strikes
  if( isStrikeFrame( followingFrames[0] ) ){
    sum += SCORE_MAP[SYMBOL_MAP.STRIKE];

    if ( followingFrames[1] !== undefined ) {
      sum += getValue(followingFrames[1][0]);
    }

  // Case where a spare follows a strike
  } else if( isSpareFrame( followingFrames[0] ) ){
    sum += SCORE_MAP[SYMBOL_MAP.SPARE];
 
  // Otherwise just add the following two rolls   
  } else {
    sum += getValue(followingFrames[0][0]) + getValue(followingFrames[0][1]);
  }

  return sum;
};

/**
 * Used to determine the score in a spare frame
 *
 * @params array followingFrame - the single frame following a spare
 * @returns int - this frame's score
 */
spareAdder = (followingFrame) => {
  var sum = SCORE_MAP[SYMBOL_MAP.SPARE] + getValue(followingFrame[0]);
  return sum;
}; 

/**
 * Parses the string of rolls into 10 frames (arrays) of 1-3 rolls
 * 
 * @params string game - string of all rolls
 * @returns array - array of frame arrays
 */
frameParser = function(game){
  var roll
    , currentFrame = []
    , parsedGame = [];

  // Iterate over each roll and add it to our frame
  for (var i = 0; i < game.length; i++) {
    roll = game.charAt(i);
    currentFrame.push(roll);

    /** 
     * If a strike or full frame has been rolled, push that frame into
     * the game array. This doesn't include the last frame since it 
     * can hold up to 3 rolls. Then clear the current frame.
     */
    if ( (roll == SYMBOL_MAP.STRIKE || currentFrame.length > 1) 
         && parsedGame.length < 9 ) {
      parsedGame.push(currentFrame);
      currentFrame = [];
    }
  }

  // Push the final frame into our game array
  parsedGame.push(currentFrame);
  return parsedGame;
};

/**
 * Calculates the final frame using modified logic
 * 
 * @params array lastFrame - final frame containing 2 or 3 rolls
 * @returns int - score of final frame
 */
lastFrameCalculator = (lastFrame) => {
  // Ususal caculation logic, but an extra frame is created from extra roll(s)
  if ( isStrikeFrame( [ lastFrame[0] ] ) ){
    return strikeAdder( [ [ lastFrame[1], lastFrame[2] ] ] );

  } else if ( isSpareFrame( [ lastFrame[0], lastFrame[1] ] ) ){
    return spareAdder( [ lastFrame[2] ] );

  } else {
    return getValue(lastFrame[0]) + getValue(lastFrame[1]);
  }
};

/**
 * Calculates score for the entire game given an array of frames
 * 
 * @params string game - final frame containing 2 or 3 rolls
 * @returns int - score of final frame
 */
gameCalculator = (frames) => {
  var score = 0
    , lastFrame = frames[ frames.length - 1 ];

  for (var i = 0; i < frames.length - 1; i++) {
    var currentFrameScore;

    if ( isStrikeFrame( frames[i] ) ) {
      currentFrameScore = strikeAdder( [ frames[i+1], frames[i+2] ] );

    } else if ( isSpareFrame ( frames[i] ) ) {
      currentFrameScore = spareAdder( frames[i+1] );

    } else {
      currentFrameScore = getValue(frames[i][0]) + getValue(frames[i][1]);
    }

    score += currentFrameScore;
  }

  score += lastFrameCalculator(lastFrame);
  return score;
};

/**
 * Read in game string as a command line argument
 *
 * @returns string - string representing current game
 */
readGame = () => {
  if (process.argv[2]) {
    return process.argv[2];
  } 

  console.log('Please supply a game string as your command line argument');
  process.exit(1);
};

// Read in input
game = readGame();

// Parse input
frames = frameParser(game);

// Calculate score
score = gameCalculator(frames);

// Output score
console.log('Final Score: ' + score);
