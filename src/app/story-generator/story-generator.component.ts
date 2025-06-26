import { ChangeDetectionStrategy, Component, inject, input, linkedSignal, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';
import { StoryService } from '../ai/services/story.service';

@Component({
  selector: 'app-story-generator',
  templateUrl: './story-generator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryGeneratorComponent {
  topic = input.required<string>();

  private storyService = inject(StoryService);

  isGenerating = signal(false);

  content = toSignal(toObservable(this.topic)
    .pipe(
      filter((topic) => !!topic),
      switchMap((topic) => { 
        this.isGenerating.set(true);
        return this.storyService.makeStory(topic)
          .finally(() => this.isGenerating.set(false));
      }),
    )
  , {
    initialValue: '',
  })

  error = this.storyService.error;
}
