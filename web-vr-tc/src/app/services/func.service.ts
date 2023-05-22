import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FuncService {
  constructor() {}

  enableAllButtons() {
    document.querySelectorAll('button').forEach((elem) => {
      elem.classList.remove('disable-btn');
    });
    document.querySelectorAll('a').forEach((elem) => {
      elem.classList.remove('disable-btn');
    });
  }

  disableAllButtons() {
    document.querySelectorAll('button').forEach((elem) => {
      elem.classList.add('disable-btn');
    });
    document.querySelectorAll('a').forEach((elem) => {
      elem.classList.add('disable-btn');
    });
  }
}
