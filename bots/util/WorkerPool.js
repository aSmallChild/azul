import { Worker } from 'worker_threads';

export class WorkerPool {
    constructor(workerFile, size) {
        this.size = size;
        this.workers = [];
        this.taskQueue = [];
        this.idleWorkers = [];

        for (let i = 0; i < size; i++) {
            const worker = new Worker(workerFile);
            worker.on('message', (result) => this.handleWorkerMessage(worker, result));
            worker.on('error', (err) => console.error(`Worker error: ${err.message}`));
            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`Worker stopped with exit code ${code}`);
                }
            });
            this.workers.push(worker);
            this.idleWorkers.push(worker);
        }
    }

    handleWorkerMessage(worker, result) {
        const { resolve } = worker.currentTask;
        worker.currentTask = null;
        this.idleWorkers.push(worker);
        resolve(result);
        this.processQueue();
    }

    runTask(taskData) {
        return new Promise((resolve, reject) => {
            const task = { data: taskData, resolve, reject };
            this.taskQueue.push(task);
            this.processQueue();
        });
    }

    processQueue() {
        if (this.taskQueue.length > 0 && this.idleWorkers.length > 0) {
            const worker = this.idleWorkers.pop();
            const task = this.taskQueue.shift();
            worker.currentTask = task;
            worker.postMessage(task.data);
        }
    }

    async terminate() {
        await Promise.all(this.workers.map(worker => new Promise((resolve) => worker.terminate(resolve))));
    }
}
