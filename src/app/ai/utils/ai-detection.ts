import { catchError, from, Observable, of, switchMap } from 'rxjs';
import { LANGUAGE_MODEL_OPTIONS } from '../constants/language-model-options.constant';
import { ERROR_CODES } from '../enums/error-codes.enum';
import { WRITER_MODEL_OPTIONS } from '../constants/writer-model-options.constant';

async function getPromptAPIAvailability(options: LanguageModelCreateCoreOptions): Promise<Omit<Availability, 'unavailable'>> {
   const availability = await LanguageModel.availability(options)

   if (availability === 'unavailable') {
      throw new Error(ERROR_CODES.LANGUAGE_MODEL_UNAVAILABLE);
   }

   return availability;
}

async function getWriterAPIAvailability(options: WriterCreateCoreOptions): Promise<Omit<Availability, 'unavailable'>> {
   const availability = await Writer.availability(options)

   if (availability === 'unavailable') {
      throw new Error(ERROR_CODES.WRITER_MODEL_UNAVAILABLE);
   }

   return availability;
}

async function validateAPIs(): Promise<boolean> {
   if (!('LanguageModel' in self)) {
      throw new Error(ERROR_CODES.NO_PROMPT_API);
   }

   if (!('Writer' in self)) {
      throw new Error(ERROR_CODES.NO_WRITER_API);
   }

   return true;
}

export function areBuiltInAPIsSupported(): Observable<string> {
   return from(validateAPIs())
      .pipe(
      switchMap(() => getPromptAPIAvailability(LANGUAGE_MODEL_OPTIONS)
               .then(() => getWriterAPIAvailability(WRITER_MODEL_OPTIONS))
               .then(() => '')
               .catch((e) => {
                  console.error(e);
                  return e instanceof Error ? e.message : 'Unknown error occurs when checking the availability of built-in APIs.';
               })
      ),
      catchError(
         (e) => {
            console.error(e);
            return of(e instanceof Error ? e.message : 'unknown');
         }
      )
   );
}
