import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription, fromEvent, map, merge, tap } from 'rxjs';
import { SpeechService } from '../services/speech.service';

@Component({
  selector: 'app-speech-voice',
  template: `
    <ng-container>
      <select name="voice" id="voices" #voices>
        <option *ngFor="let voice of voices$ | async" [value]="voice.name">{{voice.name}} ({{voice.lang}})</option>
      </select>
      <label for="rate">Rate:</label>
      <input name="rate" type="range" min="0" max="3" value="1" step="0.1" #rate>
      <label for="pitch">Pitch:</label>
      <input name="pitch" type="range" min="0" max="2" step="0.1" #pitch value="1">
    </ng-container>
  `,
  styles: [`
    :host {
      display: block;
    }

    input, select {
      width: 100%;
      display: block;
      margin: 10px 0;
      padding: 10px;
      border: 0;
      font-size: 2rem;
      background: #F7F7F7;
      outline: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeechVoiceComponent implements OnInit, OnDestroy {
  @ViewChild('rate', { static: true, read: ElementRef })
  rate!: ElementRef<HTMLInputElement>;

  @ViewChild('pitch', { static: true, read: ElementRef })
  pitch!: ElementRef<HTMLInputElement>;

  @ViewChild('voices', { static: true, read: ElementRef })
  voices!: ElementRef<HTMLSelectElement>;
  
  voices$!: Observable<SpeechSynthesisVoice[]>;
  subscription = new Subscription();

  constructor(private speechService: SpeechService) { }

  ngOnInit(): void {
    this.voices$ = fromEvent(speechSynthesis, 'voiceschanged')
      .pipe(
        map(() => speechSynthesis.getVoices()),
        map((voices) => voices.filter(voice => voice.lang.includes('en'))),
      );

    const rateChange$ = fromEvent(this.rate.nativeElement, 'change')
      .pipe(map(() => ({ property: 'rate', value: +this.rate.nativeElement.value })));

    const pitchChange$ = fromEvent(this.pitch.nativeElement, 'change')
      .pipe(map(() => ({ property: 'pitch', value: +this.pitch.nativeElement.value })));

    fromEvent(this.voices.nativeElement, 'change')
      .pipe(
        tap((value) => console.log(value.target))
      ).subscribe();

    this.subscription.add(
      merge(rateChange$, pitchChange$).pipe(
        tap(({ property, value }) => this.speechService.updateSpeech(property as 'rate' | 'pitch', value))
      ).subscribe(() => this.speechService.toggle())
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
