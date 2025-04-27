import { getHunterLogger } from "../database/singleton/singletons";

export default class GenericQueue {
  queue = [];
  running = false;
  logger: any;

  constructor() {
    this.logger = getHunterLogger();
  }

  public async add(queueData: any) {
    this.queue.push(queueData);
  }

  public async take(qtd: number) {
    return this.queue.splice(0, qtd);
  }

  public async takeToCallback(qtd: number, fn: any) {
    if (this.running) return;

    this.running = true;

    const processNext = async () => {
      if (this.queue.length === 0) {
        this.running = false;
        return;
      }

      const queueSizeBefore = this.queue.length;
      const toProcess = this.queue.splice(0, qtd);

      if (this.logger) {
        try {
          await this.logger.createLog(
            `[Queue] processing ${toProcess.length} of ${queueSizeBefore}`
          );
        } catch (e) {
        }
      }

      try {
        await fn(toProcess);
      } catch (e) {
      }

      setTimeout(processNext, 4000);
    };

    processNext();
  }
}
