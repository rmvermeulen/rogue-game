import chalk from 'chalk';
import { random } from './random';

const colors = [
  chalk.red,
  chalk.green,
  chalk.blue,
  chalk.yellow,
  chalk.magenta,
  chalk.cyan,
  chalk.bgRed,
  chalk.bgGreen,
  chalk.bgBlue,
  chalk.bgYellow,
  chalk.bgMagenta,
  chalk.bgCyan,
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
  chalk.bgRedBright,
  chalk.bgGreenBright,
  chalk.bgBlueBright,
  chalk.bgYellowBright,
  chalk.bgMagentaBright,
  chalk.bgCyanBright,
];

export const manyColorsLength = colors.length + brights.length;

export const manyColors = () => random.shuffle(colors.concat(brights));
