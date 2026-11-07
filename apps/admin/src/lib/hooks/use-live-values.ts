"use client";

import { useEffect, useRef } from "react";
import { useWatch, type Control, type FieldValues } from "react-hook-form";

/**
 * Canlı önizleme için: form değerleri değiştikçe callback'i çağırır.
 *
 * Callback bir ref'te tutulur; böylece çağıran taraf her render'da yeni
 * bir fonksiyon verse bile (ör. inline arrow) efekt yeniden tetiklenmez
 * ve "Maximum update depth exceeded" döngüsü oluşmaz.
 */
export function useLiveValues<T extends FieldValues>(
  control: Control<T>,
  onValuesChange: ((values: T) => void) | undefined,
) {
  const callbackRef = useRef(onValuesChange);

  useEffect(() => {
    callbackRef.current = onValuesChange;
  }, [onValuesChange]);

  const values = useWatch({ control });

  useEffect(() => {
    callbackRef.current?.(values as T);
  }, [values]);
}
