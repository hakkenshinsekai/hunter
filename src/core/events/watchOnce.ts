import { watch, WatchSource, WatchCallback } from 'vue';

export function watchOnce<T>(
  source: WatchSource<T> | WatchSource<T>[],
  callback: WatchCallback<T>,
  timeoutMs?: number
) {
  const stop = watch(source, callback, { once: true });

  if (timeoutMs) {
    setTimeout(() => stop(), timeoutMs);
  }

  return stop;
}