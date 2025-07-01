import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-story-generator',
  templateUrl: './story-generator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryGeneratorComponent {
  topic = input.required<string>();
  content = input.required<string>();
  isGenerating = input(false);
  error = input('');
}
