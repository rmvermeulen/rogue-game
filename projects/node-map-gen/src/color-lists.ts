import chalk from 'chalk';
import { random } from './random';

const colors = [
  chalk.red,
  chalk.green,
  chalk.blue,
  chalk.yellow,
  chalk.magenta,
  chalk.cyan,
  chalk.bgRed.black,
  chalk.bgGreen.black,
  chalk.bgBlue.black,
  chalk.bgYellow.black,
  chalk.bgMagenta.black,
  chalk.bgCyan.black,
];

export const someColorsLength = colors.length;

export const someColors = () => random.shuffle(colors);

const brights = [
  chalk.redBright,
  chalk.greenBright,
  chalk.blueBright,
  chalk.yellowBright,
  chalk.magentaBright,
  chalk.cyanBright,
  chalk.bgRedBright.black,
  chalk.bgGreenBright.black,
  chalk.bgBlueBright.black,
  chalk.bgYellowBright.black,
  chalk.bgMagentaBright.black,
  chalk.bgCyanBright.black,
];

export const manyColorsLength = colors.length + brights.length;

export const manyColors = () => random.shuffle(colors.concat(brights));
