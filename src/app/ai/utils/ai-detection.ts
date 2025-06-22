import { catchError, from, Observable, of, switchMap } from 'rxjs';
import { ERROR_CODES } from '../enums/error-codes.enum';

export async function getPromptAPIAvailability(): Promise<Omit<Availability, 'unavailable'>> {
   const availability = await LanguageModel.availability({
      expectedInputs: [
          { type: "text", languages: ['en'] },
          { type: "audio" },
      ],
      expectedOutputs: [
          { type: 'text', languages: ['en'] }
      ]
  })

   if (availability === 'unavailable') {
      throw new Error(ERROR_CODES.LANGUAGE_MODEL_UNAVAILABLE);
   }

   return availability;
}

export async function validateLanguageModel(): Promise<boolean> {
   if (!('LanguageModel' in self)) {
      throw new Error(ERROR_CODES.NO_PROMPT_API);
   }

   return true;
}

export function isPromptAPISupported(): Observable<string> {
   return from(validateLanguageModel())
      .pipe(
      switchMap(() => getPromptAPIAvailability()
               .then(() => ''
               ).catch((e) => {
                  console.error(e);
                  return e instanceof Error ? e.message : 'unknown';
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
