export type DefaultTask = () => void;
export type PassTask = (promoCode: string) => void;
export type FailTask = (error: string) => void;
export type FinallyTask = () => void;

export interface IPassFailController {
    default: (task: DefaultTask) => IPassFailController;
    pass: (task: PassTask) => IPassFailController;
    fail: (task: FailTask) => IPassFailController;
    finally: (task: FinallyTask) => IPassFailController;
}

export interface IPassFailRouter {
    default: DefaultTask;
    pass: PassTask;
    fail: FailTask;
    finally: FinallyTask;
}
