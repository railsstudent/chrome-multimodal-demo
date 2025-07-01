import { Injectable, OnDestroy, signal } from '@angular/core';
import { WRITER_MODEL_OPTIONS } from '../constants/writer-model-options.constant';

@Injectable({
  providedIn: 'root'
})
export class StoryService implements OnDestroy  {
    #controller = new AbortController();
    #strError = signal('');
    error = this.#strError.asReadonly();
    #writer = signal<Writer | undefined>(undefined);
    writer = this.#writer.asReadonly();

    #chunk = signal<string>('');
    chunk = this.#chunk.asReadonly();

    private readonly errors: Record<string, string> = {
        'InvalidStateError': 'The document is not active. Please try again later.',
        'NetworkError': 'The network is not available to download the AI model.',
        'NotAllowedError': 'The writer is not allowed to create.',
        'OperationError': 'Operation error occurred when creating the writer for the options',
        'QuotaExceededError': 'The Writer API Quota exceeded. Please try again later.',
        'UnknownError': 'Unknown error occurred while using the writer.',
    }

    async init() {        
        try {
            const writer = await Writer.create({
                ...WRITER_MODEL_OPTIONS,
                signal: this.#controller.signal,
                monitor: (monitor: CreateMonitor) => 
                    monitor.addEventListener("downloadprogress", (e) => {
                        const percentage = Math.floor(e.loaded * 100);
                        console.log(`Writer Model: Downloaded ${percentage}%`);
                    }),
                sharedContext: 'A storywriter who can write an interesting story about a given topic.',
            });

            this.#writer.set(writer);
        } catch (error) {
            this.handleErrors(error);
        }
    }

    private handleErrors(promptError: unknown) {
        if (promptError instanceof DOMException) {
            const error = this.errors[promptError.name];
            if (error) {
                console.error(error);
                this.#strError.set(error);
            }
        } else if (promptError instanceof Error && promptError.message) {
            console.error(promptError.message);
            this.#strError.set(promptError.message);
        } else {
            console.error(promptError);
            this.#strError.set(this.errors['UnknownError']);
        }
    }

    async makeStoryStream(topic: string): Promise<void> {
        this.#strError.set(''); // Clear previous error
        this.#chunk.set(''); // Clear previous chunk

        if (!this.#writer()) {
            await this.init();
        }

        try {            
            if (!topic || topic.trim() === '') {
                return;
            }

            const writer = this.#writer();
            if (writer) {
                const stream =  writer.writeStreaming(`A story about ${topic}`)
                for await (const chunk of stream) {
                    this.#chunk.update((prevChunk) => prevChunk + chunk);
                }
            } else {
                const errorText = 'The writer is not initialized.';
                console.error(errorText);
                this.#strError.set(errorText);
            }
        } catch (error) {
            this.handleErrors(error);
        }
    }

    ngOnDestroy(): void {
        this.#controller.abort();
        this.#writer.set(undefined);
    }
}
