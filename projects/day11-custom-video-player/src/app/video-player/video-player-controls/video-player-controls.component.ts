import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, OnDestroy, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { fromEvent, map, merge, Observable, startWith, Subscription, tap } from 'rxjs';
import { VideoPlayerService } from '../services';
import { VideoPlayerControlInput } from '../types';

@Component({
  selector: 'app-video-player-controls',
  template: `
    <div class="player__controls">
      <div class="progress" #progress>
        <div class="progress__filled" [style.flexBasis]="videoProgressBar$ | async"></div>
      </div>
      <button class="player__button toggle" title="Toggle Play" [textContent]="videoButtonIcon$ | async" #toggle>►</button>
      <input type="range" name="volume" class="player__slider" min="0" max="1" step="0.05" value="1" #range>
      <input type="range" name="playbackRate" class="player__slider" min="0.5" max="2" step="0.1" value="1" #range>
      <button data-skip="-10" class="player__button" #skip>« 10s</button>
      <button data-skip="25" class="player__button" #skip>25s »</button>
    </div>
  `,
  styleUrls: ['./video-player-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoPlayerControlsComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('toggle', { static: true })
  toggleButton!: ElementRef<HTMLButtonElement>;

  @ViewChildren('skip', { read: ElementRef })
  skipButtons!: QueryList<ElementRef<HTMLButtonElement>>;

  @ViewChildren('range', { read: ElementRef })
  rangeInputs!: QueryList<ElementRef<HTMLInputElement>>;

  @ViewChild('progress', { static: true })
  progress!: ElementRef<HTMLDivElement>;

  videoButtonIcon$ = this.videoPlayerService.videoButtonIcon$.pipe(startWith('►'));

  videoProgressBar$ = this.videoPlayerService.videoProgressBar$;

  subscription = new Subscription();

  constructor(private videoPlayerService: VideoPlayerService) { }

  ngOnInit(): void {
    this.subscription.add(
      fromEvent(this.toggleButton.nativeElement, 'click')
        .pipe(tap(() => this.videoPlayerService.clickToggleButton()))
        .subscribe()
    );
  }

  ngAfterViewInit(): void {
    const skipButtonEvents$ = this.skipButtons.reduce((acc, skipButton) => {
      const clickEvent$ = fromEvent(skipButton.nativeElement, 'click').pipe(
        map(({ target }) => {
          const strSeconds = (target as HTMLButtonElement).dataset['skip'];
          return strSeconds ? +strSeconds : 0;
        }),
        tap(addedSeconds => this.videoPlayerService.skipVideo(addedSeconds))
      )

      return acc.concat(clickEvent$);
    }, [] as Observable<number>[])

    this.subscription.add(merge(...skipButtonEvents$).subscribe());

    const rangeInputEvents$ = this.rangeInputs.reduce((acc, rangeInput) => 
      acc.concat(this.addRangeUpdateEvent(rangeInput, 'change'), this.addRangeUpdateEvent(rangeInput, 'mousemove'))
    , [] as Observable<VideoPlayerControlInput>[]);

    this.subscription.add(merge(...rangeInputEvents$)
      .pipe(tap(result => this.videoPlayerService.updateRange(result)))
      .subscribe()
    );
  }

  private addRangeUpdateEvent(rangeInput: ElementRef<HTMLInputElement>, eventName: string): Observable<VideoPlayerControlInput> {
    return fromEvent(rangeInput.nativeElement, eventName).pipe(
      map(({ target }) => {
        const { name, value } = target as HTMLInputElement;
        return {
          name: name as "volume" | "playbackRate",
          value: +value
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
