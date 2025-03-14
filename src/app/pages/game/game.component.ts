import { Component } from '@angular/core';
import { UserAsidebarComponent } from "../../components/user-asidebar/user-asidebar.component";
import { CommonModule, NgFor,NgIf } from '@angular/common';
import { LetterStatus } from '../../types/letter-status.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GameService } from '../../services/game.service';
import { GameResultDTO } from '../../types/game-resultDTO.type';

@Component({
  selector: 'app-game',
  imports: [
    UserAsidebarComponent, 
    ReactiveFormsModule,
    CommonModule,
    NgFor, 
    NgIf
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent{
  word: string = '';
  length: number = 0;
  maxGuesses: number = 0;
  guesses: string[] = [];
  gameOver: boolean = false;
  playedIn!: Date;
  gameForm!: FormGroup;
  grid: LetterStatus[][] = [];
  gameStarted: boolean = false;

  constructor(private gameService: GameService, private formBuilder: FormBuilder) {
    this.gameForm = this.formBuilder.group({
      guess: ["", [Validators.required, Validators.minLength(1)]]
    });
  }


  startGame(): void {
    this.gameService.startGame().subscribe(response => {
      if (!response || !response.word) {
        console.error("Error.");
        return;
      }
      
      this.word = response.word.toLowerCase();
      this.length = this.word.length;
      this.maxGuesses = this.length;

      this.playedIn = new Date();

      for (let i = 0; i < this.maxGuesses; i++) {
        this.grid.push(Array(this.length).fill({letter: "", status: "default"}));
      }

      this.gameStarted = true;
    })
  }


  submitGuess(): void {
    if (this.gameOver) {return; }

    const guess = this.gameForm.value.guess.toLowerCase();

    if (guess.length !== this.length) {
      alert(`The guess must contain ${this.length} letters.`);
      return;
    }

    this.guesses.push(guess);
    const indexRow = this.guesses.length -1;
    this.grid[indexRow] = this.validateGuess(guess);

    if (guess === this.word || this.guesses.length === this.maxGuesses) {
      this.gameOver = true;
      this.postResult();
    }

    this.gameForm.reset();
  }


  validateGuess(guess: string): LetterStatus[] {
    const result: LetterStatus[] = [];
    const wordArray = this.word.split('');
    const marca: boolean[] = Array(this.length).fill(false);

    for (let i = 0; i< this.length; i++) {
      if (guess[i] === wordArray[i]) {
        result.push({letter: guess[i], status: "correct"});
        marca[i] = true;
      } else {
        result.push({letter: guess[i], status: "default"});
      }
    }

    for (let i = 0; i < this.length; i++) {
      if (result[i].status === "correct") {continue;}

      const index = wordArray.findIndex((l, j) => l === guess[i] && !marca[j]);

      if (index !== -1) {
        result[i].status = "present";
        marca[index] = true;
      }
    }

    return result;
  }

  postResult(): void {
    const dto: GameResultDTO = {
      word: this.word,
      guesses: this.guesses,
      playedIn: this.playedIn.toISOString()
    };

    this.gameService.postResult(dto).subscribe(response => {
      console.log("Result post successfully", response);
    }, error => {
      console.log("Error", error);
    });
  }
}
