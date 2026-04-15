
import { Injectable, inject, effect } from '@angular/core';
import { DbService } from './db.service';
import { DOCUMENT } from '@angular/common';
import { CustomScript } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class ScriptLoaderService {
  private db = inject(DbService);
  private document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const settings = this.db.settings();
      // Simple re-run check (naively injects if not present, no complex cleanup of active states)
      settings.scripts.forEach(script => {
          this.injectScript(script);
      });
    });
  }

  private injectScript(script: CustomScript) {
    const id = `integration-${script.id}`;
    if (this.document.getElementById(id)) return; // Already exists

    // Create wrapper
    const wrapper = this.document.createElement('div');
    wrapper.id = id;
    wrapper.style.display = 'none';

    // Safe fragment parsing
    const range = this.document.createRange();
    range.selectNode(this.document.body);
    const fragment = range.createContextualFragment(script.code);

    // Re-create scripts to ensure execution
    const scripts = fragment.querySelectorAll('script');
    scripts.forEach((oldScript) => {
        const newScript = this.document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr: Attr) => {
            newScript.setAttribute(attr.name, attr.value);
        });
        if (oldScript.innerHTML) {
            newScript.innerHTML = oldScript.innerHTML;
        }
        oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    wrapper.appendChild(fragment);

    if (script.location === 'head') {
      this.document.head.appendChild(wrapper);
    } else if (script.location === 'body-top') {
      this.document.body.prepend(wrapper);
    } else {
      this.document.body.appendChild(wrapper);
    }
  }
}
