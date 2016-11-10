/**
 * Takes a string and inserts new string before or after the given string to find in the original.
 * @param {string} ogString - the original string
 * @param {string} addString - the string to be added to the original
 * @param {string} findString - the string preceding or following the string to add, this should be a unique string in the original (not repeated)
 * @param {boolean} addAfter - determine whether to add new string before or after found string - defaults to After (true) 
 */
export function StringSplicer(ogString: string, addString: string, findString: string, addAfter: boolean = true) {
  let ogSplitArray = ogString.split(findString);
  let newString = addAfter ? `${ogSplitArray[0]} ${findString} ${addString} ${ogSplitArray[1]}` : `${ogSplitArray[0]} ${addString} ${findString} ${ogSplitArray[1]}`;
  return newString;
}
