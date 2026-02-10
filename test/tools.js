function printHexString(dyn) {
  let result = '';

  for (let i = 0; i < dyn.length; i++) {
    result += dyn.stream[i].toString(16).padStart(2, '0');

    if (i < dyn.length - 1) {
      result += ' ';
    }
  }

  return result;
}