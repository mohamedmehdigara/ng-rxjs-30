import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription, fromEvent, map, startWith } from 'rxjs';
import { WINDOW } from '../../core';
import { StickyNavService } from '../services/sticky-nav.service';

@Component({
  selector: 'app-stick-nav-header',
  template: `
    <header>
      <h1>A story about getting lost.</h1>
    </header>
    <nav id="main" #menu [ngClass]="{ 'fixed-nav': stickyNavStyle.shouldAddFixedNav }">
      <ul>
        <li class="logo"><a href="#">LOST.</a></li>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Images</a></li>
        <li><a href="#">Locations</a></li>
        <li><a href="#">Maps</a></li>
      </ul>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }

    header {
      text-align: center;
      height: 50vh;
      background: url(https://source.unsplash.com/GKN6rpDr0EI/960x640) bottom center no-repeat;
      background-size: cover;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    h1 {
      color: white;
      font-size: 7vw;
      text-shadow: 3px 4px 0 rgba(0,0,0,0.2);
    }

    nav {
      background: black;
      top: 0;
      width: 100%;
      transition:all 0.5s;
      position: relative;
      z-index: 1;
    }

    nav.fixed-nav {
      position: fixed;
      box-shadow: 0 5px 0 rgba(0,0,0,0.1);
    }

    nav ul {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
    }
      
    nav li {
      flex: 1;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    li.logo {
      max-width: 0;
      overflow: hidden;
      background: white;
      transition: all 0.5s;
      font-weight: 600;
      font-size: 30px;
    }
      
    li.logo a {
      color: black;
    }
      
    .fixed-nav li.logo {
      max-width: 500px;
    }

    nav a {
      text-decoration: none;
      padding: 20px;
      display: inline-block;
      color: white;
      transition: all 0.2s;
      text-transform: uppercase;
    }  
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StickNavHeaderComponent implements OnInit, OnDestroy {
  @ViewChild('menu', { static: true, read: ElementRef })
  nav!: ElementRef<HTMLElement>;

  subscription!: Subscription;
  stickyNavStyle = this.service.nonStickyNavStyle;

  constructor(@Inject(WINDOW) private window: Window, private cdr: ChangeDetectorRef, private service: StickyNavService) { }

  ngOnInit(): void {
    const navNative = this.nav.nativeElement;
    const body = navNative.closest('body');

    this.subscription = fromEvent(this.window, 'scroll')
      .pipe(
        map(() => { 
          if(this.window.scrollY > navNative.offsetTop) {
            return {
              shouldAddFixedNav: true,
              paddingTop: navNative.offsetHeight
            }
          }
          
          return this.service.nonStickyNavStyle;
        }),
        startWith(this.service.nonStickyNavStyle)
      ).subscribe((result) => {
        this.stickyNavStyle = result;
        this.service.updateStyle(result);
        if (body) {
          body.style.paddingTop = `${result.paddingTop}px`;
        }
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
