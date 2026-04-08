import { readFileSync } from "node:fs";
import path from "path";

export type GuessResult = {letter: string, result: "correct" | "present" | "wrong" | "empty"}[]

export const evaluateGuess = (guess: string, targetWord: string): GuessResult => {
  const splitGuess = guess.split("")
  const splitTargetWord = targetWord.split("")
  const result: GuessResult = []

  const frequencies: Record<string, number> = {}
  const greenLettersIndexes: number[] = []

  splitTargetWord.forEach((letter) => {
    frequencies[letter] = (frequencies[letter] || 0) + 1
  })

  splitGuess.forEach((letter, i) => {
    if (letter === splitTargetWord[i]) {
      result[i] = {letter, result: "correct"}
      frequencies[letter]! -= 1
      greenLettersIndexes.push(i)
      return
    }
  })

  splitGuess.forEach((letter, i) => {
    if (greenLettersIndexes.includes(i)) return

    if (frequencies[letter]! > 0 && splitTargetWord.includes(letter)) {
      result[i] = {letter, result: "present"}
      frequencies[letter]! -= 1
      return
    }

    result[i] = {letter, result: "wrong"}
  })

  return result
}

const wordList = readFileSync(path.resolve("src/resources/wordlist.txt"), "utf-8")
  .split("\n").map(word => {
    return word.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
  })

const guessList = readFileSync(path.resolve("src/resources/guesslist.txt"), "utf-8")
  .split("\n").map(word => {
    return word.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
  })

export function generateRandomWord() {
  const randomIndex = Math.floor(Math.random() * wordList.length)
  return wordList[randomIndex] ?? "";
}

export function guessExists(guess: string): boolean {
  return guessList.includes(guess)
}
