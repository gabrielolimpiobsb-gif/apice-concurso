import { Question } from "../../types";
import { portuguesePart1 } from "./portuguese_part1";
import { portuguesePart2 } from "./portuguese_part2";
import { portuguesePart3 } from "./portuguese_part3";
import { portuguesePart4 } from "./portuguese_part4";
import { portuguesePart5 } from "./portuguese_part5";

export const portugueseQuestions: Question[] = [
  ...portuguesePart1,
  ...portuguesePart2,
  ...portuguesePart3,
  ...portuguesePart4,
  ...portuguesePart5,
];
